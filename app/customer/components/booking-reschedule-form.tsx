'use client'

import { useEffect, useState } from 'react'
import {
  fetchAvailableDates,
  fetchAvailableSlots,
  rescheduleCustomerBooking,
  type BookingResult,
  type DateRow,
  type SlotRow,
} from '@/app/lib/booking-api'

export function BookingRescheduleForm({
  booking,
  onRescheduled,
}: {
  booking: BookingResult
  onRescheduled: (updated: BookingResult) => void
}) {
  const [dates, setDates] = useState<DateRow[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<SlotRow[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchAvailableDates(booking.address.id, { serviceId: booking.service_id || undefined, service: booking.service_name })
      .then((rows) => { if (active) setDates(rows.filter((row) => row.available)) })
      .catch(() => { if (active) setDates([]) })
    return () => { active = false }
  }, [booking.address.id, booking.service_id, booking.service_name])

  useEffect(() => {
    if (!selectedDate) return
    let active = true
    fetchAvailableSlots(booking.address.id, selectedDate, { serviceId: booking.service_id || undefined, service: booking.service_name })
      .then((rows) => { if (active) setSlots(rows.filter((row) => row.available)) })
      .catch(() => { if (active) setSlots([]) })
    return () => { active = false }
  }, [selectedDate, booking.address.id, booking.service_id, booking.service_name])

  const runReschedule = async (slot: SlotRow) => {
    setBusy(true)
    setError('')
    try {
      onRescheduled(await rescheduleCustomerBooking(booking.id, selectedDate, slot.start, slot.end))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reschedule this order.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

      <div>
        <p className="mb-1.5 text-[11px] font-bold text-slate-500">Date</p>
        <select
          value={selectedDate}
          onChange={(event) => setSelectedDate(event.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-orange-400"
        >
          <option value="">Select a date…</option>
          {dates.map((row) => (
            <option key={row.date} value={row.date}>
              {new Date(row.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
            </option>
          ))}
        </select>
      </div>

      {selectedDate && (
        <div>
          <p className="mb-1.5 text-[11px] font-bold text-slate-500">Time slot</p>
          {slots.length === 0 ? (
            <p className="text-xs text-slate-400">No open slots on this day — try another date.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {slots.map((slot) => (
                <button
                  key={slot.start}
                  type="button"
                  disabled={busy}
                  onClick={() => void runReschedule(slot)}
                  className="rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-400 hover:text-orange-600 disabled:opacity-50"
                >
                  {busy ? 'Saving…' : `${slot.start}–${slot.end}`}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
