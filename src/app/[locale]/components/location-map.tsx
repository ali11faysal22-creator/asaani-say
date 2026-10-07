'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Circle, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const pinIcon = L.divIcon({
  className: '',
  html: `
    <svg width="32" height="40" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="#EE6C52"/>
      <circle cx="16" cy="16" r="6.5" fill="white"/>
    </svg>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -40],
})

// Used when no explicit radius applies (e.g. a customer address pin) so the map still
// frames a sensible area around the point instead of zooming in arbitrarily close.
const DEFAULT_VIEW_RADIUS_KM = 0.4

function ClickToMove({ onMove }: { onMove: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onMove(event.latlng.lat, event.latlng.lng)
    },
  })
  return null
}

function FitToArea({ position, radiusKm }: { position: [number, number]; radiusKm: number }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    // Keep the relevant area in view whenever the pin moves or the radius changes. Only
    // actually re-fit when it would fall outside what's currently visible — otherwise
    // every intermediate tick while dragging the pin would re-zoom/re-pan the map and
    // fight the user's own drag gesture.
    // L.circle(...).getBounds() needs the circle to already be attached to a map to
    // compute its projection, which a standalone instance never is — LatLng.toBounds()
    // computes an equivalent bounding box from pure math instead, with no map needed.
    const bounds = L.latLng(position).toBounds(radiusKm * 2000)
    if (first.current || !map.getBounds().contains(bounds)) {
      map.fitBounds(bounds, { padding: [24, 24], animate: !first.current })
    }
    first.current = false
  }, [position, radiusKm, map])
  return null
}

// The map usually mounts inside a modal/animated container whose size changes after the
// first paint; without this Leaflet keeps a stale size and renders grey, partial tiles.
function KeepSized() {
  const map = useMap()
  useEffect(() => {
    const container = map.getContainer()
    const refresh = () => map.invalidateSize()
    const timer = window.setTimeout(refresh, 250)
    const observer = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(refresh) : null
    observer?.observe(container)
    window.addEventListener('resize', refresh)
    return () => {
      window.clearTimeout(timer)
      observer?.disconnect()
      window.removeEventListener('resize', refresh)
    }
  }, [map])
  return null
}

function Recenter({ position, trigger }: { position: [number, number]; trigger: number }) {
  const map = useMap()
  useEffect(() => {
    if (trigger > 0) map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 0.8 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, map])
  return null
}

export function LocationMap({
  latitude,
  longitude,
  radiusKm,
  recenterKey = 0,
  onLocationChange,
}: {
  latitude: number
  longitude: number
  /** Omit to just show a pin with no coverage circle (e.g. a customer's home address). */
  radiusKm?: number
  /** Bump to fly the map to the current position (e.g. after "Use my current location"). */
  recenterKey?: number
  onLocationChange: (lat: number, lng: number) => void
}) {
  const position: [number, number] = [latitude, longitude]

  return (
    <MapContainer
      center={position}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: 'clamp(240px, 45vw, 320px)', width: '100%', borderRadius: '12px', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <KeepSized />
      <Recenter position={position} trigger={recenterKey} />
      <ClickToMove onMove={onLocationChange} />
      <FitToArea position={position} radiusKm={radiusKm ?? DEFAULT_VIEW_RADIUS_KM} />
      <Marker
        position={position}
        icon={pinIcon}
        draggable
        eventHandlers={{
          dragend: (event) => {
            const marker = event.target as L.Marker
            const { lat, lng } = marker.getLatLng()
            onLocationChange(lat, lng)
          },
        }}
      />
      {radiusKm != null && (
        <Circle
          center={position}
          radius={radiusKm * 1000}
          pathOptions={{ color: '#EE6C52', weight: 2, fillColor: '#EE6C52', fillOpacity: 0.12 }}
        />
      )}
    </MapContainer>
  )
}
