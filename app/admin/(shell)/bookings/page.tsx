'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Wrench } from 'lucide-react'
import {
  API_BASE,
  fetchAdminBookings,
  fetchAdminVendors,
  getCurrentUser,
  type AdminBooking,
  type AdminVendor,
} from '@/app/lib/booking-api'
import { StatusBadge, bookingStatusTone } from '../../components/status-badge'
import { TableToolbar } from '../../components/table-toolbar'
import { IconActionButton } from '../../components/icon-action-button'
import { DetailModal } from '../../components/detail-modal'
import { UnassignedBookingActionsModal } from '../../components/unassigned-booking-actions-modal'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'unassigned', label: 'Needs Vendor' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

function bucketForStatus(status: string): FilterKey {
  if (status === 'unassigned') return 'unassigned'
  if (status === 'completed') return 'completed'
  if (status === 'pending') return 'pending'
  if (status === 'rejected' || status === 'cancelled') return 'cancelled'
  return 'active'
}

function paymentInfo(booking: AdminBooking): { label: string; className: string } {
  if (booking.payment_received_at) return { label: 'Paid', className: 'bg-emerald-100 text-emerald-700' }
  if (booking.payment_requested_at) return { label: 'Requested', className: 'bg-amber-100 text-amber-700' }
  if (booking.status === 'cancelled' || booking.status === 'rejected') return { label: 'N/A', className: 'bg-slate-100 text-slate-400' }
  return { label: 'Not yet', className: 'bg-slate-100 text-slate-500' }
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)
  const [resolveBooking, setResolveBooking] = useState<AdminBooking | null>(null)

  const loadData = async () => {
    const [bookingsResult, vendorsResult] = await Promise.allSettled([fetchAdminBookings(), fetchAdminVendors()])
    if (bookingsResult.status === 'fulfilled') setBookings(bookingsResult.value)
    else console.error('Unable to load bookings', bookingsResult.reason)
    if (vendorsResult.status === 'fulfilled') setVendors(vendorsResult.value)
    else console.error('Unable to load vendors', vendorsResult.reason)
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

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return bookings.filter((b) => {
      if (filter !== 'all' && bucketForStatus(b.status) !== filter) return false
      if (!q) return true
      return (
        b.customer_name.toLowerCase().includes(q) ||
        (b.vendor_name || '').toLowerCase().includes(q) ||
        b.service_name.toLowerCase().includes(q) ||
        (b.city || '').toLowerCase().includes(q)
      )
    })
  }, [bookings, search, filter])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search bookings…"
        resultCount={filtered.length}
        totalCount={bookings.length}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              filter === f.key ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-bold">Customer</th>
              <th className="px-4 py-3 font-bold">Vendor</th>
              <th className="px-4 py-3 font-bold">Service</th>
              <th className="px-4 py-3 font-bold">City</th>
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Amount</th>
              <th className="px-4 py-3 font-bold">Payment</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3 font-semibold text-slate-800">{booking.customer_name}</td>
                <td className="px-4 py-3 text-slate-500">
                  {booking.vendor_name ? (
                    <>
                      <p className="text-slate-800 font-semibold">{booking.vendor_contact_name || booking.vendor_name}</p>
                      {booking.vendor_contact_name && <p className="text-[11px] text-slate-400">{booking.vendor_name}</p>}
                    </>
                  ) : (
                    <span className="font-semibold text-amber-600">Needs vendor</span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">{booking.service_name}</td>
                <td className="px-4 py-3 text-slate-500">{booking.city || '—'}</td>
                <td className="px-4 py-3 text-slate-500">
                  {booking.scheduled_date}
                  <span className="text-slate-400"> · {booking.slot_start}–{booking.slot_end}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{booking.total_amount != null ? `Rs. ${booking.total_amount.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${paymentInfo(booking).className}`}>
                    {paymentInfo(booking).label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={booking.status.replace('_', ' ')} tone={bookingStatusTone(booking.status)} />
                  {booking.admin_hold && (
                    <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">On hold</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconActionButton icon={Eye} label="View details" onClick={() => setSelectedBooking(booking)} />
                    {booking.status === 'unassigned' && (
                      <IconActionButton icon={Wrench} label="Resolve — no vendor accepted" tone="danger" onClick={() => setResolveBooking(booking)} />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-10 text-center text-slate-400">
                  {bookings.length === 0 ? 'No bookings yet.' : 'No bookings match your filters.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

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
            { label: 'Service', value: selectedBooking.service_name },
            { label: 'City', value: [selectedBooking.city, selectedBooking.area].filter(Boolean).join(', ') || '—' },
            { label: 'Scheduled', value: `${selectedBooking.scheduled_date} · ${selectedBooking.slot_start}–${selectedBooking.slot_end}` },
            { label: 'Amount', value: selectedBooking.total_amount != null ? `Rs. ${selectedBooking.total_amount.toLocaleString()}` : '—' },
            {
              label: 'Payment',
              value: (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${paymentInfo(selectedBooking).className}`}>
                  {paymentInfo(selectedBooking).label}
                </span>
              ),
            },
            { label: 'Status', value: <StatusBadge label={selectedBooking.status.replace('_', ' ')} tone={bookingStatusTone(selectedBooking.status)} /> },
            { label: 'Created', value: new Date(selectedBooking.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) },
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
            selectedBooking.status === 'unassigned' ? (
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
            ) : undefined
          }
        />
      )}

      {resolveBooking && (
        <UnassignedBookingActionsModal
          booking={resolveBooking}
          vendors={vendors}
          onClose={() => setResolveBooking(null)}
          onUpdated={applyUpdate}
        />
      )}
    </div>
  )
}
