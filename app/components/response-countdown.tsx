'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

/** Ticking "time left to respond" readout for a booking sitting PENDING with a vendor.
 * `deadline` is the ISO timestamp the backend computed (vendor_assigned_at + the accept
 * window) — once it passes, the booking is about to rotate to the next vendor. */
export function ResponseCountdown({ deadline, className = '' }: { deadline: string; className?: string }) {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remainingMs = new Date(deadline).getTime() - now

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Clock className="h-3 w-3" />
      {remainingMs > 0 ? `${formatRemaining(remainingMs)} left to respond` : 'Rotating to next vendor…'}
    </span>
  )
}
