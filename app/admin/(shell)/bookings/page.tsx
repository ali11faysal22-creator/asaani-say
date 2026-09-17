'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import { fetchAdminBookings, getCurrentUser, type AdminBooking } from '@/app/lib/booking-api'
import { StatusBadge, bookingStatusTone } from '../../components/status-badge'
import { TableToolbar } from '../../components/table-toolbar'
import { IconActionButton } from '../../components/icon-action-button'
import { DetailModal } from '../../components/detail-modal'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'active', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']

function bucketForStatus(status: string): FilterKey {
  if (status === 'completed') return 'completed'
  if (status === 'pending') return 'pending'
  if (status === 'rejected' || status === 'cancelled') return 'cancelled'
  return 'active'
}

export default function AdminBookingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [selectedBooking, setSelectedBooking] = useState<AdminBooking | null>(null)

  const loadData = async () => {
    try {
      setBookings(await fetchAdminBookings())
    } catch (loadError) {
      console.error('Unable to load bookings', loadError)
    }
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const user = await getCurrentUser()
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
        b.vendor_name.toLowerCase().includes(q) ||
        b.service_name.toLowerCase().includes(q)
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
              <th className="px-4 py-3 font-bold">Date</th>
              <th className="px-4 py-3 font-bold">Amount</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((booking) => (
              <tr key={booking.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3 font-semibold text-slate-800">{booking.customer_name}</td>
                <td className="px-4 py-3 text-slate-500">{booking.vendor_name}</td>
                <td className="px-4 py-3 text-slate-500">{booking.service_name}</td>
                <td className="px-4 py-3 text-slate-500">
                  {booking.scheduled_date}
                  <span className="text-slate-400"> · {booking.slot_start}–{booking.slot_end}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">{booking.total_amount != null ? `Rs. ${booking.total_amount.toLocaleString()}` : '—'}</td>
                <td className="px-4 py-3">
                  <StatusBadge label={booking.status.replace('_', ' ')} tone={bookingStatusTone(booking.status)} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <IconActionButton icon={Eye} label="View details" onClick={() => setSelectedBooking(booking)} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
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
          subtitle={`${selectedBooking.customer_name} → ${selectedBooking.vendor_name}`}
          onClose={() => setSelectedBooking(null)}
          fields={[
            { label: 'Customer', value: selectedBooking.customer_name },
            { label: 'Vendor', value: selectedBooking.vendor_name },
            { label: 'Service', value: selectedBooking.service_name },
            { label: 'Scheduled', value: `${selectedBooking.scheduled_date} · ${selectedBooking.slot_start}–${selectedBooking.slot_end}` },
            { label: 'Amount', value: selectedBooking.total_amount != null ? `Rs. ${selectedBooking.total_amount.toLocaleString()}` : '—' },
            { label: 'Status', value: <StatusBadge label={selectedBooking.status.replace('_', ' ')} tone={bookingStatusTone(selectedBooking.status)} /> },
            { label: 'Created', value: new Date(selectedBooking.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) },
          ]}
        />
      )}
    </div>
  )
}
