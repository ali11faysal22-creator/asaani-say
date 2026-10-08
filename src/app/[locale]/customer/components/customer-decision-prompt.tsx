'use client'

import { useEffect, useState } from 'react'
import { usePathname } from '@/i18n/navigation'
import { X } from 'lucide-react'
import { cancelCustomerBooking, fetchCustomerBookings, getStoredAuth, resumeCustomerBookingSearch, type BookingResult } from '@/app/lib/booking-api'
import { BookingRescheduleForm } from './booking-reschedule-form'
import { useLanguage } from '@/app/lib/i18n'

const DISMISSED_KEY = 'asaani_dismissed_decision_prompts'

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

export default function CustomerDecisionPrompt() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const [booking, setBooking] = useState<BookingResult | null>(null)
  const [mode, setMode] = useState<'prompt' | 'reschedule' | 'confirm-cancel'>('prompt')
  const [cancelling, setCancelling] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      if (pathname.startsWith('/customer/tracking/')) return
      const auth = getStoredAuth('customer')
      if (!auth?.profile_id) return
      try {
        const bookings = await fetchCustomerBookings(auth.profile_id)
        const dismissed = getDismissed()
        const next = bookings.find((item) => item.paused_for_customer_decision && !dismissed.includes(item.id))
        if (active) setBooking((current) => (current?.id === next?.id ? current : next || null))
      } catch {
      }
    }
    void load()
    const timer = window.setInterval(() => void load(), 10000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [pathname])

  if (!booking) return null

  const close = () => {
    dismiss(booking.id)
    setBooking(null)
    setMode('prompt')
    setError('')
  }

  const runResume = async () => {
    setResuming(true)
    setError('')
    try {
      await resumeCustomerBookingSearch(booking.id)
      setBooking(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('Could not resume the search.'))
    } finally {
      setResuming(false)
    }
  }

  const runCancel = async () => {
    setCancelling(true)
    setError('')
    try {
      await cancelCustomerBooking(booking.id)
      setBooking(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('Could not cancel this order.'))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={close}
          className="absolute end-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={t('Close')}
        >
          <X className="h-5 w-5" />
        </button>

        {mode === 'prompt' ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">{t("Need your input")}</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">{t(booking.service_name)}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {booking.vendor_miss_count} {t("nearby vendors haven't responded, so we've paused the search. You can resume searching, pick a different date/time, or cancel the order.")}</p>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{t(error)}</p>}

            <div className="mt-4 space-y-2">
              <button
                type="button"
                onClick={() => setMode('reschedule')}
                className="w-full rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600"
              >
                {t("Pick a different time")}</button>
              <button
                type="button"
                disabled={resuming}
                onClick={() => void runResume()}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {resuming ? t('Resuming…') : t('Keep searching')}
              </button>
              <button
                type="button"
                onClick={() => setMode('confirm-cancel')}
                className="w-full rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50"
              >
                {t("Cancel order")}</button>
            </div>
          </>
        ) : mode === 'reschedule' ? (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">{t("Pick a different time")}</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">{t(booking.service_name)}</p>

            <div className="mt-4">
              <BookingRescheduleForm booking={booking} onRescheduled={() => { setBooking(null); setMode('prompt') }} />
            </div>

            <button
              type="button"
              onClick={() => setMode('prompt')}
              className="mt-3 w-full rounded-xl py-2 text-xs font-bold text-slate-400 transition hover:text-slate-600"
            >
              {t("Back")}</button>
          </>
        ) : (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wide text-red-500">{t("Cancel this order?")}</p>
            <p className="mt-1 text-sm font-extrabold text-slate-900">{t(booking.service_name)}</p>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{t("This cannot be undone — you'll need to place a new order if you change your mind.")}</p>

            {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{t(error)}</p>}

            <div className="mt-4 space-y-2">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => void runCancel()}
                className="w-full rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
              >
                {cancelling ? t('Cancelling…') : t('Yes, cancel this order')}
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setMode('prompt')}
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
              >
                {t("No, go back")}</button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
