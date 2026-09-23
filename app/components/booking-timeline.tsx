'use client'

import { useEffect, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { fetchAdminBookingHistory, fetchCustomerBookingHistory, fetchVendorBookingHistory, type BookingEvent } from '@/app/lib/booking-api'
import { DateFilter } from '@/app/components/date-filter'

const STATUS_LABELS: Record<string, string> = {
  UNASSIGNED: 'Needs vendor',
  PENDING: 'Awaiting vendor response',
  ACCEPTED: 'Accepted',
  REJECTED: 'Rejected',
  ON_THE_WAY: 'On the way',
  REACHED: 'Arrived',
  IN_PROGRESS: 'Work in progress',
  PAUSED: 'Work paused',
  CANNOT_START: "Vendor couldn't start",
  WORK_COMPLETED: 'Work finished',
  PAYMENT_REQUESTED: 'Payment requested',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const ACTOR_LABELS: Record<BookingEvent['actor'], string> = {
  customer: 'Customer',
  vendor: 'Vendor',
  admin: 'Admin',
  system: 'Auto-dispatch',
}

const ACTOR_FILTERS: Array<{ key: 'all' | BookingEvent['actor']; label: string }> = [
  { key: 'all', label: 'All' },
  { key: 'customer', label: 'Customer' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'admin', label: 'Admin' },
  { key: 'system', label: 'Auto-dispatch' },
]

function statusLabel(status: string | null): string {
  if (!status) return '—'
  return STATUS_LABELS[status] || status
}

// Local calendar date (not UTC) so "2026-09-23" matches an event that happened at
// 11pm local time, consistent with how the <input type="date"> filter reads back.
function localDateKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const FETCHERS = {
  admin: fetchAdminBookingHistory,
  vendor: fetchVendorBookingHistory,
  customer: fetchCustomerBookingHistory,
} as const

export function BookingTimeline({ bookingId, role }: { bookingId: string; role: 'admin' | 'vendor' | 'customer' }) {
  const [events, setEvents] = useState<BookingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actorFilter, setActorFilter] = useState<'all' | BookingEvent['actor']>('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    let active = true
    FETCHERS[role](bookingId)
      .then((rows) => { if (active) setEvents(rows) })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : 'Could not load status history.')
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [bookingId, role])

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (actorFilter !== 'all' && event.actor !== actorFilter) return false
      if (dateFilter && localDateKey(event.created_at) !== dateFilter) return false
      return true
    })
  }, [events, actorFilter, dateFilter])

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3 text-xs font-semibold text-slate-400">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading status history…
      </div>
    )
  }
  if (error) {
    return <p className="text-xs font-semibold text-red-600">{error}</p>
  }
  if (events.length === 0) {
    return <p className="text-xs text-slate-400">No history yet.</p>
  }

  const hasActiveFilters = actorFilter !== 'all' || dateFilter !== ''

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 text-[11px] font-bold">
          {ACTOR_FILTERS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setActorFilter(option.key)}
              className={`rounded-md px-2 py-1 transition cursor-pointer whitespace-nowrap ${
                actorFilter === option.key ? 'bg-[#EE6C52] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
        <DateFilter value={dateFilter} onChange={setDateFilter} label="Filter history by date" />
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => { setActorFilter('all'); setDateFilter('') }}
            className="text-[11px] font-bold text-slate-400 hover:text-slate-600"
          >
            Clear filters
          </button>
        )}
      </div>

      {filteredEvents.length === 0 ? (
        <p className="text-xs text-slate-400">No history entries match these filters.</p>
      ) : (
        <ol className="space-y-0">
          {filteredEvents.map((event, index) => (
            <li key={event.id} className="relative pb-4 pl-5 last:pb-0">
              {index !== filteredEvents.length - 1 && (
                <span className="absolute left-[5px] top-3 h-full w-px bg-slate-200" aria-hidden="true" />
              )}
              <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-orange-500 shadow" />
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <p className="text-xs font-bold text-slate-800">
                  {event.from_status && event.from_status !== event.to_status
                    ? `${statusLabel(event.from_status)} → ${statusLabel(event.to_status)}`
                    : statusLabel(event.to_status)}
                </p>
                <span className="text-[10px] font-medium text-slate-400">
                  {new Date(event.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {ACTOR_LABELS[event.actor]}
                {event.actor_name ? ` · ${event.actor_name}` : ''}
              </p>
              {event.note && <p className="mt-0.5 text-[11px] text-slate-600">{event.note}</p>}
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}
