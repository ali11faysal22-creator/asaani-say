'use client'

import { useState } from 'react'
import { reassignAdminBookingVendor, type AdminBooking, type AdminVendor } from '@/app/lib/booking-api'
import { DetailModal } from './detail-modal'

export function VendorReassignModal({
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
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const confirm = async () => {
    if (!vendorId) return
    setSaving(true)
    setError('')
    try {
      onUpdated(await reassignAdminBookingVendor(booking.id, vendorId))
      onClose()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reassign vendor.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DetailModal
      title={booking.vendor_id ? 'Reassign vendor' : 'Assign vendor'}
      subtitle={booking.vendor_id ? `${booking.service_name} · currently ${booking.vendor_contact_name || booking.vendor_name}` : `${booking.service_name} · no vendor assigned yet`}
      onClose={onClose}
      fields={[]}
      footer={
        <div className="space-y-3">
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
          <select
            value={vendorId}
            onChange={(e) => setVendorId(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
          >
            <option value="">Select a vendor…</option>
            {vendors
              .filter((v) => v.id !== booking.vendor_id)
              .map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.first_name} {vendor.last_name} — {vendor.business_name} {vendor.city ? `(${vendor.city})` : ''}
                </option>
              ))}
          </select>
          <button
            onClick={confirm}
            disabled={!vendorId || saving}
            className="w-full rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
          >
            {saving ? 'Saving…' : booking.vendor_id ? 'Confirm reassignment' : 'Assign vendor'}
          </button>
        </div>
      }
    />
  )
}
