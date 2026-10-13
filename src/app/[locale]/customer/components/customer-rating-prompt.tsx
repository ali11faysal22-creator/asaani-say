'use client'

import { useEffect, useState } from 'react'
import { usePathname } from '@/i18n/navigation'
import { X } from 'lucide-react'
import { bookingServiceLabel, fetchCustomerBookings, getStoredAuth, type BookingResult } from '@/app/lib/booking-api'
import { startPolling } from '@/app/lib/polling'
import { VendorRatingForm } from './vendor-rating-form'
import Modal from '@/components/Modal'
import { useLanguage } from '@/app/lib/i18n'

const DISMISSED_KEY = 'asaani_dismissed_rating_prompts'

function getDismissed(): string[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]') as string[]
  } catch {
    return []
  }
}

function dismiss(bookingId: string) {
  try {
    const dismissed = getDismissed()
    localStorage.setItem(DISMISSED_KEY, JSON.stringify([...dismissed, bookingId].slice(-200)))
  } catch {
  }
}

export default function CustomerRatingPrompt() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [booking, setBooking] = useState<BookingResult | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (pathname.startsWith('/customer/tracking/')) return
      const auth = getStoredAuth('customer')
      if (!auth?.profile_id) return
      try {
        const bookings = await fetchCustomerBookings(auth.profile_id)
        const dismissed = getDismissed()
        const next = bookings.find((item) => item.status === 'completed' && !item.rating && !dismissed.includes(item.id))
        if (active) setBooking(next || null)
      } catch {
      }
    }
    const stop = startPolling(load, 10000)
    return () => {
      active = false
      stop()
    }
  }, [pathname])

  if (!booking) return null

  const later = () => { dismiss(booking.id); setBooking(null) }

  return (
    <Modal
      onClose={later}
      labelledBy="rating-prompt-title"
      overlayClassName="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      panelClassName="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
    >
        <button
          type="button"
          onClick={later}
          className="absolute end-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={t("Maybe later")}
        >
          <X className="h-5 w-5" />
        </button>
        <p id="rating-prompt-title" className="text-[11px] font-bold uppercase tracking-wide text-orange-500">{t("Order completed")}</p>
        <p className="mt-1 text-xs text-slate-500">{bookingServiceLabel(booking, t)}</p>
        <div className="mt-4">
          <VendorRatingForm
            bookingId={booking.id}
            vendorName={booking.vendor?.business_name}
            onRated={() => setBooking(null)}
          />
        </div>
        <button
          type="button"
          onClick={later}
          className="mt-2 w-full rounded-xl py-2 text-xs font-bold text-slate-400 transition hover:text-slate-600"
        >
          {t("Maybe later")}</button>
    </Modal>
  )
}
