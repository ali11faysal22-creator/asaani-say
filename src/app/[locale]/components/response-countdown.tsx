'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import { useLanguage } from '@/app/lib/i18n'

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
  const { language, t } = useLanguage()
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const remainingMs = new Date(deadline).getTime() - now

  const remainingLabel = language === 'ur'
    ? `${new Intl.NumberFormat('ur-PK').format(Math.max(0, Math.floor(remainingMs / 1000 / 60)))}:${new Intl.NumberFormat('ur-PK', { minimumIntegerDigits: 2, useGrouping: false }).format(Math.max(0, Math.floor(remainingMs / 1000) % 60))}`
    : formatRemaining(remainingMs)

  return (
    <span className={`inline-flex items-center gap-1 ${className}`}>
      <Clock className="h-3 w-3" />
      {remainingMs > 0 ? <><span dir="ltr">{remainingLabel}</span> {t('left to respond')}</> : t('Rotating to next vendor…')}
    </span>
  )
}
