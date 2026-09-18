'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { fetchCustomerBookings, getStoredAuth, type BookingResult } from '@/app/lib/booking-api'
import { VendorRatingForm } from './vendor-rating-form'

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
  const [booking, setBooking] = useState<BookingResult | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (window.location.pathname.startsWith('/customer/tracking/')) return
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
    void load()
    const timer = window.setInterval(() => void load(), 10000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  if (!booking) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={() => { dismiss(booking.id); setBooking(null) }}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Maybe later"
        >
          <X className="h-5 w-5" />
        </button>
        <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">Order completed</p>
        <p className="mt-1 text-xs text-slate-500">{booking.service_name}</p>
        <div className="mt-4">
          <VendorRatingForm
            bookingId={booking.id}
            vendorName={booking.vendor?.business_name}
            onRated={() => setBooking(null)}
          />
        </div>
        <button
          type="button"
          onClick={() => { dismiss(booking.id); setBooking(null) }}
          className="mt-2 w-full rounded-xl py-2 text-xs font-bold text-slate-400 transition hover:text-slate-600"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
