'use client'

import { notify } from '@/components/Alerts'
import { useEffect, useState } from 'react'
import { usePathname } from '@/i18n/navigation'
import { X } from 'lucide-react'
import { bookingServiceLabel, cancelCustomerBooking, fetchCustomerBookings, getStoredAuth, resumeCustomerBookingSearch, type BookingResult } from '@/app/lib/booking-api'
import { startPolling } from '@/app/lib/polling'
import { BookingRescheduleForm } from './booking-reschedule-form'
import Modal from '@/components/Modal'
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
        // Only the newest stalled order is ever offered - older ones the customer already moved
        // past (or abandoned) shouldn't chain one popup after another once this one is handled.
        const stalled = bookings
          .filter((item) => item.paused_for_customer_decision && item.status === 'unassigned')
          .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
        const newest = stalled[0]
        const next = newest && !dismissed.includes(newest.id) ? newest : undefined
        if (active) setBooking((current) => (current?.id === next?.id ? current : next || null))
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
      notify.success(t('We are looking for another vendor for you.'))
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
      dismiss(booking.id)
      setBooking(null)
      notify.success(t('Your order has been cancelled.'))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('Could not cancel this order.'))
    } finally {
      setCancelling(false)
    }
  }

  return (
    <Modal
      onClose={close}
      labelledBy="decision-prompt-title"
      overlayClassName="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4"
      panelClassName="relative w-full max-w-sm max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
    >
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
            <h2 id="decision-prompt-title" className="mt-1 text-sm font-extrabold text-slate-900">{bookingServiceLabel(booking, t)}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              {t("No vendor has accepted this order yet, so we paused the search.")} {t("You can resume searching, pick a different date/time, or cancel.")}</p>

            {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{t(error)}</p>}

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
            <h2 id="decision-prompt-title" className="mt-1 text-sm font-extrabold text-slate-900">{bookingServiceLabel(booking, t)}</h2>

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
            <h2 id="decision-prompt-title" className="mt-1 text-sm font-extrabold text-slate-900">{bookingServiceLabel(booking, t)}</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{t("This cannot be undone — you'll need to place a new order if you change your mind.")}</p>

            {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{t(error)}</p>}

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
    </Modal>
  )
}
