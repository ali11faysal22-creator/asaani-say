'use client'

import dynamic from 'next/dynamic'
import { useRef, useState } from 'react'
import { Crosshair, MapPin } from 'lucide-react'

const LocationMap = dynamic(
  () => import('./location-map').then((mod) => mod.LocationMap),
  { ssr: false, loading: () => <div className="h-60 sm:h-72 w-full animate-pulse rounded-xl bg-slate-100" /> }
)

export function LocationPicker({
  label = 'Your location',
  hint = "Drag the pin, or tap anywhere on the map, to set exactly where you're based.",
  latitude,
  longitude,
  radiusKm,
  onLocationChange,
  onAddressResolved,
  onRadiusChange,
}: {
  label?: string
  hint?: string
  latitude: number
  longitude: number
  /** Omit (together with onRadiusChange) to show just a location pin, with no radius slider. */
  radiusKm?: number
  onLocationChange: (lat: number, lng: number) => void
  onAddressResolved?: (location: { address: string; area: string }) => void
  onRadiusChange?: (km: number) => void
}) {
  const [locating, setLocating] = useState(false)
  const [recenterKey, setRecenterKey] = useState(0)
  const [locateError, setLocateError] = useState('')
  const [addressError, setAddressError] = useState('')
  const geocodeRequest = useRef<AbortController | null>(null)

  const updateLocation = (lat: number, lng: number) => {
    onLocationChange(lat, lng)
    if (!onAddressResolved) return

    geocodeRequest.current?.abort()
    const controller = new AbortController()
    geocodeRequest.current = controller
    setAddressError('')
    fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&addressdetails=1&zoom=18&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`,
      { signal: controller.signal }
    )
      .then(async (response) => {
        if (!response.ok) throw new Error('Address lookup failed')
        return response.json() as Promise<{
          display_name?: string
          address?: {
            house_number?: string
            road?: string
            pedestrian?: string
            neighbourhood?: string
            suburb?: string
            city_district?: string
            city?: string
            town?: string
            village?: string
            state?: string
            postcode?: string
            country?: string
          }
        }>
      })
      .then((result) => {
        const address = result.address
        const street = [address?.house_number, address?.road || address?.pedestrian]
          .filter(Boolean)
          .join(' ')
        const area = address?.suburb || address?.neighbourhood || address?.city_district
          || address?.city || address?.town || address?.village || ''
        const fullAddress = [
          street,
          area,
          address?.city || address?.town || address?.village,
          address?.state,
          address?.postcode,
          address?.country,
        ].filter((part, index, parts) => Boolean(part) && parts.indexOf(part) === index).join(', ')
        const resolvedAddress = fullAddress || result.display_name || ''

        if (!resolvedAddress) throw new Error('No address found for this location')
        onAddressResolved({ address: resolvedAddress, area })
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setAddressError('Could not find an address for this location. Please enter it manually.')
      })
  }

  const useCurrentLocation = () => {
    if (typeof window !== 'undefined' && !window.isSecureContext) {
      setLocateError('Location needs a secure (HTTPS) connection. Please open the site over HTTPS.')
      return
    }
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocateError('Location is not supported on this device/browser.')
      return
    }
    setLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        updateLocation(position.coords.latitude, position.coords.longitude)
        setRecenterKey((key) => key + 1)
        setLocating(false)
      },
      (error) => {
        const messages: Record<number, string> = {
          1: 'Location permission was denied. Allow location access in your browser or app settings.',
          2: 'Your current location is unavailable. Please try again or drag the pin.',
          3: 'Finding your location took too long. Please try again.',
        }
        setLocateError(messages[error.code] || 'Could not get your location. Please drag the pin instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <MapPin className="h-3.5 w-3.5 text-orange-500" /> {label}
        </p>
        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 transition hover:text-orange-700 disabled:opacity-50"
        >
          <Crosshair className="h-3.5 w-3.5" /> {locating ? 'Locating…' : 'Use my current location'}
        </button>
      </div>
      <p className="text-[11px] text-slate-400">{hint}</p>
      {locateError && <p className="text-[11px] font-semibold text-red-600">{locateError}</p>}
      {addressError && <p className="text-[11px] font-semibold text-red-600">{addressError}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <LocationMap latitude={latitude} longitude={longitude} radiusKm={radiusKm} recenterKey={recenterKey} onLocationChange={updateLocation} />
      </div>

      {radiusKm != null && onRadiusChange && (
        <div>
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">Service radius</span>
            <span className="font-bold text-orange-600">{radiusKm} km</span>
          </div>
          <input
            type="range"
            min={2}
            max={30}
            step={1}
            value={radiusKm}
            onChange={(event) => onRadiusChange(Number(event.target.value))}
            className="mt-1.5 w-full accent-orange-500"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>2 km</span>
            <span>30 km</span>
          </div>
        </div>
      )}
    </div>
  )
}
