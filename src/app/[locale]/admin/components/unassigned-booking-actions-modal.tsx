'use client'

import { useState } from 'react'
import { cancelAdminBooking, holdAdminBooking, type AdminBooking } from '@/app/lib/booking-api'
import { DetailModal } from './detail-modal'
import { useLanguage } from '../../lib/i18n'

export function UnassignedBookingActionsModal({
  booking,
  onClose,
  onUpdated,
}: {
  booking: AdminBooking
  onClose: () => void
  onUpdated: (updated: AdminBooking) => void
}) {
  const { t } = useLanguage()
  const [busy, setBusy] = useState<'cancel' | 'hold' | null>(null)
  const [error, setError] = useState('')

  const runCancel = async () => {
    if (!window.confirm(t('Cancel this booking? The customer will be notified.'))) return
    setBusy('cancel')
    setError('')
    try {
      onUpdated(await cancelAdminBooking(booking.id))
      onClose()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('Could not cancel booking.'))
    } finally {
      setBusy(null)
    }
  }

  const runToggleHold = async () => {
    setBusy('hold')
    setError('')
    try {
      onUpdated(await holdAdminBooking(booking.id, !booking.admin_hold))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t('Could not update hold status.'))
    } finally {
      setBusy(null)
    }
  }

  return (
    <DetailModal
      title={t('No vendor accepted this booking yet')}
      subtitle={`${booking.service_name} · ${booking.customer_name}`}
      onClose={onClose}
      fields={[
        { label: 'Status', value: booking.admin_hold ? t('Unassigned — on hold') : t('Unassigned — auto-retrying') },
        { label: 'City', value: [booking.city, booking.area].filter(Boolean).join(', ') || '—' },
      ]}
      footer={
        <div className="space-y-3">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

          <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs leading-relaxed text-slate-500">
            {t('Auto-dispatch is still offering this job to the best-rated, nearest vendor within range and keeps widening the search radius over time. Vendors are never assigned by hand — you can only cancel this order or pause/resume the automatic retrying below.')}
          </p>

          <div className="flex gap-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => void runToggleHold()}
              disabled={busy !== null}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              {busy === 'hold' ? t('Updating…') : booking.admin_hold ? t('Resume auto-retry') : t('Hold (pause auto-retry)')}
            </button>
            <button
              onClick={() => void runCancel()}
              disabled={busy !== null}
              className="flex-1 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 cursor-pointer"
            >
              {busy === 'cancel' ? t('Cancelling…') : t('Cancel order')}
            </button>
          </div>
        </div>
      }
    />
  )
}
