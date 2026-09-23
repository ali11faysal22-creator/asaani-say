'use client'

import { useEffect, useState } from 'react'
import { Calendar, Clock, Loader2 } from 'lucide-react'
import {
  fetchAvailableDates,
  fetchAvailableSlots,
  formatSlotLabel,
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
  const [loadingDates, setLoadingDates] = useState(true)
  const [datesError, setDatesError] = useState('')
  const [datesReloadKey, setDatesReloadKey] = useState(0)
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<SlotRow[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<SlotRow | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    fetchAvailableDates(booking.address.id, { serviceId: booking.service_id || undefined, service: booking.service_name })
      .then((rows) => {
        if (!active) return
        const available = rows.filter((row) => row.available)
        setDates(available)
        if (available.length === 0) setDatesError('No open dates found for this service near you right now.')
      })
      .catch((requestError) => {
        if (!active) return
        setDates([])
        setDatesError(requestError instanceof Error ? requestError.message : 'Could not load available dates.')
      })
      .finally(() => { if (active) setLoadingDates(false) })
    return () => { active = false }
  }, [booking.address.id, booking.service_id, booking.service_name, datesReloadKey])

  useEffect(() => {
    if (!selectedDate) return
    let active = true
    fetchAvailableSlots(booking.address.id, selectedDate, { serviceId: booking.service_id || undefined, service: booking.service_name })
      .then((rows) => { if (active) setSlots(rows.filter((row) => row.available)) })
      .catch(() => { if (active) setSlots([]) })
      .finally(() => { if (active) setLoadingSlots(false) })
    return () => { active = false }
  }, [selectedDate, booking.address.id, booking.service_id, booking.service_name])

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedSlot(null)
    setLoadingSlots(true)
  }

  const runReschedule = async () => {
    if (!selectedDate || !selectedSlot) return
    setBusy(true)
    setError('')
    try {
      onRescheduled(await rescheduleCustomerBooking(booking.id, selectedDate, selectedSlot.start, selectedSlot.end))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not reschedule this order.')
    } finally {
      setBusy(false)
    }
  }

  const now = new Date()
  const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
          <Calendar className="h-4 w-4 text-orange-500" /> Available Dates
        </label>
        {loadingDates ? (
          <div className="flex items-center gap-2 py-3 text-xs font-semibold text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> Checking availability...
          </div>
        ) : dates.length === 0 ? (
          <p className="flex items-center justify-between gap-2 text-xs font-semibold text-red-600">
            <span>{datesError}</span>
            <button
              type="button"
              onClick={() => { setLoadingDates(true); setDatesError(''); setDatesReloadKey((key) => key + 1) }}
              className="shrink-0 font-bold text-orange-600 hover:underline"
            >
              Retry
            </button>
          </p>
        ) : (
          <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-3 pt-1">
            {dates.map((item) => {
              const d = new Date(item.date)
              const isSelected = selectedDate === item.date
              return (
                <button
                  key={item.date}
                  type="button"
                  onClick={() => handleDateSelect(item.date)}
                  className={`relative flex h-17 min-w-17 shrink-0 cursor-pointer flex-col items-center justify-center rounded-2xl border text-xs transition ${
                    isSelected
                      ? 'scale-105 border-[#3A3E59] bg-[#3A3E59] text-white shadow-md'
                      : 'border-slate-200 bg-slate-50 text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-[10px] font-medium">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                  <span className="text-base font-extrabold">{d.getDate()}</span>
                  <span className="text-[9px] font-semibold text-emerald-500">{item.vendor_count} free</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedDate && (
        <div className="space-y-2 pt-1">
          <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <Clock className="h-4 w-4 text-orange-500" /> Time Slots
          </label>
          {loadingSlots ? (
            <div className="flex items-center gap-2 py-3 text-xs font-semibold text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin text-orange-500" /> Loading one-hour slots...
            </div>
          ) : slots.length === 0 ? (
            <p className="text-xs text-slate-400">No open slots on this day — try another date.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.start === slot.start
                const [slotHour, slotMinute] = slot.start.split(':').map(Number)
                const isPastToday = selectedDate === localDate && slotHour * 60 + slotMinute <= now.getHours() * 60 + now.getMinutes()
                return (
                  <button
                    key={slot.start}
                    type="button"
                    disabled={isPastToday}
                    onClick={() => setSelectedSlot(slot)}
                    className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border px-2 py-2.5 text-[11px] font-bold transition ${
                      isSelected
                        ? 'border-[#EE6C52] bg-[#EE6C52] text-white shadow-sm'
                        : !isPastToday
                          ? 'border-slate-200 bg-white text-slate-700 hover:border-orange-500 hover:bg-orange-50/20'
                          : 'cursor-not-allowed border-slate-100 bg-slate-100 text-slate-300 opacity-50'
                    }`}
                  >
                    <span>{formatSlotLabel(slot.start)} - {formatSlotLabel(slot.end)}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

      <button
        type="button"
        disabled={!selectedDate || !selectedSlot || busy}
        onClick={() => void runReschedule()}
        className="mt-1 w-full cursor-pointer rounded-xl bg-[#EE6C52] py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-orange-600 disabled:bg-slate-300"
      >
        {busy ? 'Saving…' : 'Confirm new time'}
      </button>
    </div>
  )
}
