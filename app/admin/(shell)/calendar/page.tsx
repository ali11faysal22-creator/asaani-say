'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight, Eye, MapPin, Search, Wrench } from 'lucide-react'
import { API_BASE, fetchAdminBookings, getCurrentUser, type AdminBooking } from '@/app/lib/booking-api'
import { CHART_BLUE, STATUS_CRITICAL, STATUS_GOOD, STATUS_WARNING } from '@/app/components/charts/palette'
import { StatusBadge, bookingStatusTone } from '../../components/status-badge'
import { IconActionButton } from '../../components/icon-action-button'
import { DetailModal } from '../../components/detail-modal'
import { UnassignedBookingActionsModal } from '../../components/unassigned-booking-actions-modal'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'
import { ResponseCountdown } from '@/app/components/response-countdown'
import { BookingTimeline } from '@/app/components/booking-timeline'

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function dateKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function statusDotColor(status: string): string {
  const tone = bookingStatusTone(status)
  if (tone === 'good') return STATUS_GOOD
  if (tone === 'warning') return STATUS_WARNING
  if (tone === 'critical') return STATUS_CRITICAL
  return CHART_BLUE
}

export default function AdminCalendarPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [cityFilter, setCityFilter] = useState('all')
  const [orderIdQuery, setOrderIdQuery] = useState('')
  const [monthCursor, setMonthCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
  const [resolveBooking, setResolveBooking] = useState<AdminBooking | null>(null)

  const loadData = async () => {
    try {
      setBookings(await fetchAdminBookings())
    } catch (error) {
      console.error('Unable to load bookings', error)
    }
  }

  const applyUpdate = (updated: AdminBooking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)))
    setSelectedBooking((prev) => (prev && prev.id === updated.id ? updated : prev))
    setResolveBooking((prev) => (prev && prev.id === updated.id ? updated : prev))
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const user = await getCurrentUser('admin')
        if (user.role !== 'admin') {
          router.push('/admin/login')
          return
        }
      } catch {
        router.push('/admin/login')
        return
      }
      await loadData()
      if (active) setLoading(false)
    }
    init()
    return () => {
      active = false
    }
  }, [router])

  useAutoRefreshOnFocus(() => {
    if (!loading) loadData()
  })

  const cities = useMemo(() => {
    const set = new Set<string>()
    bookings.forEach((b) => {
      if (b.city) set.add(b.city)
    })
    return Array.from(set).sort()
  }, [bookings])

  const cityFiltered = useMemo(() => {
    if (cityFilter === 'all') return bookings
    return bookings.filter((b) => b.city === cityFilter)
  }, [bookings, cityFilter])

  // Jump straight to whichever month/day contains the matching order, instead of making
  // the admin hunt through the calendar by hand.
  const handleOrderIdQueryChange = (value: string) => {
    setOrderIdQuery(value)
    const q = value.trim().toLowerCase()
    if (!q) return
    const match = bookings.find((b) => b.id.toLowerCase().includes(q))
    if (!match) return
    const [year, month] = match.scheduled_date.split('-').map(Number)
    setMonthCursor(new Date(year, month - 1, 1))
    setSelectedDate(match.scheduled_date)
  }

  const bookingsByDate = useMemo(() => {
    const map = new Map<string, AdminBooking[]>()
    cityFiltered.forEach((b) => {
      const list = map.get(b.scheduled_date) || []
      list.push(b)
      map.set(b.scheduled_date, list)
    })
    return map
  }, [cityFiltered])

  const cells = useMemo(() => {
    const year = monthCursor.getFullYear()
    const month = monthCursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const startWeekday = firstDay.getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const daysInPrevMonth = new Date(year, month, 0).getDate()

    const result: { date: Date; inMonth: boolean }[] = []
    for (let i = startWeekday - 1; i >= 0; i--) {
      result.push({ date: new Date(year, month - 1, daysInPrevMonth - i), inMonth: false })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ date: new Date(year, month, d), inMonth: true })
    }
    while (result.length % 7 !== 0) {
      const last = result[result.length - 1].date
      result.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false })
    }
    return result
  }, [monthCursor])

  const todayKey = dateKey(new Date())
  const selectedDayBookings = selectedDate ? bookingsByDate.get(selectedDate) || [] : []

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-extrabold text-slate-900 w-40 text-center">
            {monthCursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </h2>
          <button
            onClick={() => setMonthCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={orderIdQuery}
              onChange={(e) => handleOrderIdQueryChange(e.target.value)}
              placeholder="Jump to order ID…"
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#EE6C52]"
            />
          </div>
          <div className="relative w-full sm:w-56">
            <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52] appearance-none"
            >
              <option value="all">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
          {WEEKDAY_LABELS.map((label) => (
            <div key={label} className="px-2 py-2.5 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              {label}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map(({ date, inMonth }) => {
            const key = dateKey(date)
            const dayBookings = bookingsByDate.get(key) || []
            const isToday = key === todayKey
            const isSelected = key === selectedDate
            const statusCounts = new Map<string, number>()
            dayBookings.forEach((b) => statusCounts.set(b.status, (statusCounts.get(b.status) || 0) + 1))

            return (
              <button
                key={key}
                onClick={() => setSelectedDate(dayBookings.length > 0 ? key : null)}
                className={`min-h-20 sm:min-h-24 border-b border-r border-slate-100 p-1.5 sm:p-2 text-left transition ${
                  inMonth ? 'bg-white' : 'bg-slate-50/60'
                } ${isSelected ? 'ring-2 ring-inset ring-[#EE6C52]' : ''} ${dayBookings.length > 0 ? 'cursor-pointer hover:bg-orange-50/40' : 'cursor-default'}`}
              >
                <span
                  className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-bold ${
                    isToday ? 'bg-[#EE6C52] text-white' : inMonth ? 'text-slate-700' : 'text-slate-300'
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayBookings.length > 0 && (
                  <div className="mt-1.5 space-y-1">
                    <div className="flex flex-wrap gap-1">
                      {Array.from(statusCounts.entries()).map(([status, count]) => (
                        <span key={status} className="inline-flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusDotColor(status) }} />
                          <span className="text-[9px] font-bold text-slate-500">{count}</span>
                        </span>
                      ))}
                    </div>
                    <p className="text-[9px] font-semibold text-slate-400">{dayBookings.length} job{dayBookings.length === 1 ? '' : 's'}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              {new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <button onClick={() => setSelectedDate(null)} className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 cursor-pointer">
              Close
            </button>
          </div>
          <div className="space-y-2">
            {selectedDayBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">{booking.service_name}</p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {booking.customer_name} → {booking.vendor_contact_name || booking.vendor_name || 'Unassigned'} · {booking.city || 'Unknown city'} · {booking.slot_start}–{booking.slot_end}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {booking.status === 'pending' && booking.vendor_response_deadline && (
                    <span className="text-[10px] font-bold text-orange-600">
                      <ResponseCountdown deadline={booking.vendor_response_deadline} />
                    </span>
                  )}
                  {booking.paused_for_customer_decision && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                      Paused
                    </span>
                  )}
                  <StatusBadge label={booking.status.replace('_', ' ')} tone={bookingStatusTone(booking.status)} />
                  <IconActionButton icon={Eye} label="View details" onClick={() => setSelectedBooking(booking)} />
                  {booking.status === 'unassigned' && (
                    <IconActionButton icon={Wrench} label="Resolve — no vendor accepted" tone="danger" onClick={() => setResolveBooking(booking)} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedBooking && (
        <DetailModal
          title={selectedBooking.service_name}
          subtitle={`${selectedBooking.customer_name} → ${selectedBooking.vendor_contact_name || selectedBooking.vendor_name || 'Unassigned'}`}
          onClose={() => setSelectedBooking(null)}
          fields={[
            { label: 'Customer', value: selectedBooking.customer_name },
            {
              label: 'Vendor',
              value: selectedBooking.vendor_name
                ? `${selectedBooking.vendor_contact_name || selectedBooking.vendor_name}${selectedBooking.vendor_contact_name ? ` (${selectedBooking.vendor_name})` : ''}`
                : 'Needs vendor',
            },
            { label: 'City', value: [selectedBooking.city, selectedBooking.area].filter(Boolean).join(', ') || '—' },
            { label: 'Scheduled', value: `${selectedBooking.scheduled_date} · ${selectedBooking.slot_start}–${selectedBooking.slot_end}` },
            { label: 'Amount', value: selectedBooking.total_amount != null ? `Rs. ${selectedBooking.total_amount.toLocaleString()}` : '—' },
            { label: 'Status', value: <StatusBadge label={selectedBooking.status.replace('_', ' ')} tone={bookingStatusTone(selectedBooking.status)} /> },
            ...(selectedBooking.status === 'pending' && selectedBooking.vendor_response_deadline
              ? [{ label: 'Vendor response', value: <ResponseCountdown deadline={selectedBooking.vendor_response_deadline} className="text-orange-600" /> }]
              : []),
            ...(selectedBooking.photos.length > 0
              ? [{
                  label: 'Photos',
                  value: (
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {selectedBooking.photos.map((url) => (
                        <a key={url} href={`${API_BASE}${url}`} target="_blank" rel="noreferrer">
                          <img src={`${API_BASE}${url}`} alt="Completion" className="h-12 w-12 rounded-lg border border-slate-200 object-cover" />
                        </a>
                      ))}
                    </div>
                  ),
                }]
              : []),
          ]}
          footer={
            <div className="space-y-4">
              {selectedBooking.status === 'unassigned' && (
                <button
                  onClick={() => {
                    const booking = selectedBooking
                    setSelectedBooking(null)
                    setResolveBooking(booking)
                  }}
                  className="w-full rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 cursor-pointer"
                >
                  No vendor accepted — resolve
                </button>
              )}
              <div>
                <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Status history</p>
                <BookingTimeline bookingId={selectedBooking.id} role="admin" />
              </div>
            </div>
          }
        />
      )}

      {resolveBooking && (
        <UnassignedBookingActionsModal
          booking={resolveBooking}
          onClose={() => setResolveBooking(null)}
          onUpdated={applyUpdate}
        />
      )}
    </div>
  )
}
