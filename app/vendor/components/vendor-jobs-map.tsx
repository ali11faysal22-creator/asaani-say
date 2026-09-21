'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const vendorIcon = L.divIcon({
  className: '',
  html: `
    <svg width="30" height="38" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="#393E58"/>
      <circle cx="16" cy="16" r="6.5" fill="white"/>
    </svg>
  `,
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [0, -38],
})

const customerIcon = L.divIcon({
  className: '',
  html: `
    <svg width="30" height="38" viewBox="0 0 32 40" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 11 16 24 16 24s16-13 16-24C32 7.163 24.837 0 16 0z" fill="#EE6C52"/>
      <circle cx="16" cy="16" r="6.5" fill="white"/>
    </svg>
  `,
  iconSize: [30, 38],
  iconAnchor: [15, 38],
  popupAnchor: [0, -38],
})

function FitAll({ points }: { points: [number, number][] }) {
  const map = useMap()
  const first = useRef(true)
  useEffect(() => {
    if (points.length === 0) return
    const bounds = points.length === 1 ? L.latLng(points[0]).toBounds(800) : L.latLngBounds(points)
    map.fitBounds(bounds, { padding: [32, 32], animate: !first.current })
    first.current = false
  }, [points, map])
  return null
}

export type VendorJobPin = {
  id: string
  lat: number
  lng: number
  customerName: string
  customerPhone: string | null
  serviceName: string
  status: string
  addressLine: string
}

export function VendorJobsMap({
  vendorLocation,
  jobs,
}: {
  vendorLocation: [number, number] | null
  jobs: VendorJobPin[]
}) {
  const points: [number, number][] = [
    ...(vendorLocation ? [vendorLocation] : []),
    ...jobs.map((job) => [job.lat, job.lng] as [number, number]),
  ]
  const fallbackCenter: [number, number] = [31.5204, 74.3587]

  return (
    <MapContainer
      center={points[0] || fallbackCenter}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: '320px', width: '100%', borderRadius: '12px', zIndex: 0 }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitAll points={points} />
      {vendorLocation && (
        <Marker position={vendorLocation} icon={vendorIcon}>
          <Popup>
            <p className="text-xs font-bold text-slate-800">Your location</p>
          </Popup>
        </Marker>
      )}
      {jobs.map((job) => (
        <Marker key={job.id} position={[job.lat, job.lng]} icon={customerIcon}>
          <Popup>
            <div className="min-w-[160px] text-xs">
              <p className="font-bold text-slate-900">{job.customerName}</p>
              <p className="text-slate-600">{job.serviceName}</p>
              <p className="mt-1 text-slate-500">{job.addressLine}</p>
              <p className="mt-1 font-bold capitalize text-[#EE6C52]">{job.status.replace(/_/g, ' ')}</p>
              {job.customerPhone && (
                <a href={`tel:${job.customerPhone}`} className="mt-2 inline-block font-bold text-emerald-600">
                  Call {job.customerPhone}
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
