'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Crosshair, MapPin } from 'lucide-react'

const LocationMap = dynamic(
  () => import('./location-map').then((mod) => mod.LocationMap),
  { ssr: false, loading: () => <div className="h-[280px] w-full animate-pulse rounded-xl bg-slate-100" /> }
)

export function LocationPicker({
  label = 'Your location',
  hint = "Drag the pin, or tap anywhere on the map, to set exactly where you're based.",
  latitude,
  longitude,
  radiusKm,
  onLocationChange,
  onRadiusChange,
}: {
  label?: string
  hint?: string
  latitude: number
  longitude: number
  /** Omit (together with onRadiusChange) to show just a location pin, with no radius slider. */
  radiusKm?: number
  onLocationChange: (lat: number, lng: number) => void
  onRadiusChange?: (km: number) => void
}) {
  const [locating, setLocating] = useState(false)
  const [locateError, setLocateError] = useState('')

  const useCurrentLocation = () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLocateError('Location is not supported on this device/browser.')
      return
    }
    setLocating(true)
    setLocateError('')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onLocationChange(position.coords.latitude, position.coords.longitude)
        setLocating(false)
      },
      () => {
        setLocateError('Could not get your location — you can drag the pin instead.')
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
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

      <div className="overflow-hidden rounded-xl border border-slate-200">
        <LocationMap latitude={latitude} longitude={longitude} radiusKm={radiusKm} onLocationChange={onLocationChange} />
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
