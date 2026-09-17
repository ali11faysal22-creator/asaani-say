'use client'

import { useState } from 'react'
import { setAdminBookingStatus, type AdminBooking } from '@/app/lib/booking-api'
import { DetailModal } from './detail-modal'

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'on_the_way', label: 'On the way' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function BookingStatusModal({
  booking,
  onClose,
  onUpdated,
}: {
  booking: AdminBooking
  onClose: () => void
  onUpdated: (updated: AdminBooking) => void
}) {
  const [statusValue, setStatusValue] = useState(booking.status)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    setSaving(true)
    setError('')
    try {
      onUpdated(await setAdminBookingStatus(booking.id, statusValue))
      onClose()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update status.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DetailModal
      title="Change booking status"
      subtitle={`${booking.service_name} · ${booking.customer_name}`}
      onClose={onClose}
      fields={[]}
      footer={
        <div className="space-y-3">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
          <select
            value={statusValue}
            onChange={(e) => setStatusValue(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={confirm}
            disabled={saving || statusValue === booking.status}
            className="w-full rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving…' : 'Update status'}
          </button>
        </div>
      }
    />
  )
}
