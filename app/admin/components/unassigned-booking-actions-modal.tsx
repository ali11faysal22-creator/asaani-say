'use client'

import { useState } from 'react'
import { assignAdminBookingVendor, cancelAdminBooking, holdAdminBooking, type AdminBooking, type AdminVendor } from '@/app/lib/booking-api'
import { DetailModal } from './detail-modal'

export function UnassignedBookingActionsModal({
  booking,
  vendors,
  onClose,
  onUpdated,
}: {
  booking: AdminBooking
  vendors: AdminVendor[]
  onClose: () => void
  onUpdated: (updated: AdminBooking) => void
}) {
  const [vendorId, setVendorId] = useState('')
  const [busy, setBusy] = useState<'assign' | 'cancel' | 'hold' | null>(null)
  const [error, setError] = useState('')

  const runAssign = async () => {
    if (!vendorId) return
    setBusy('assign')
    setError('')
    try {
      onUpdated(await assignAdminBookingVendor(booking.id, vendorId))
      onClose()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not assign vendor.')
    } finally {
      setBusy(null)
    }
  }

  const runCancel = async () => {
    if (!window.confirm('Cancel this booking? The customer will be notified.')) return
    setBusy('cancel')
    setError('')
    try {
      onUpdated(await cancelAdminBooking(booking.id))
      onClose()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not cancel booking.')
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
      setError(requestError instanceof Error ? requestError.message : 'Could not update hold status.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <DetailModal
      title="No vendor accepted this booking"
      subtitle={`${booking.service_name} · ${booking.customer_name}`}
      onClose={onClose}
      fields={[
        { label: 'Status', value: booking.admin_hold ? 'Unassigned — on hold' : 'Unassigned — auto-retrying' },
        { label: 'City', value: [booking.city, booking.area].filter(Boolean).join(', ') || '—' },
      ]}
      footer={
        <div className="space-y-3">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

          <div>
            <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Manually assign a vendor</p>
            <div className="flex gap-2">
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
              >
                <option value="">Select a vendor…</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.first_name} {vendor.last_name} — {vendor.business_name} {vendor.city ? `(${vendor.city})` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={() => void runAssign()}
                disabled={!vendorId || busy !== null}
                className="rounded-xl bg-[#EE6C52] px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
              >
                {busy === 'assign' ? 'Assigning…' : 'Assign'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 border-t border-slate-100 pt-3">
            <button
              onClick={() => void runToggleHold()}
              disabled={busy !== null}
              className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              {busy === 'hold' ? 'Updating…' : booking.admin_hold ? 'Resume auto-retry' : 'Hold (pause auto-retry)'}
            </button>
            <button
              onClick={() => void runCancel()}
              disabled={busy !== null}
              className="flex-1 rounded-xl border border-red-200 bg-white py-2.5 text-xs font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-50 cursor-pointer"
            >
              {busy === 'cancel' ? 'Cancelling…' : 'Cancel order'}
            </button>
          </div>
        </div>
      }
    />
  )
}
