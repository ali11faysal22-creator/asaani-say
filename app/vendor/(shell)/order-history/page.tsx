'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Eye, MapPin, Phone, ShoppingCart, X } from 'lucide-react'
import { fetchVendorBookings, getStoredAuth, type BookingResult } from '@/app/lib/booking-api'
import { ResponseCountdown } from '@/app/components/response-countdown'
import { BookingTimeline } from '@/app/components/booking-timeline'
import { DateFilter } from '@/app/components/date-filter'
import { VendorBookingActionPanel } from '../../components/booking-action-panel'

const STATUS_TABS = ['All', 'Needs action', 'Active', 'Completed'] as const
type StatusTab = (typeof STATUS_TABS)[number]

const ACTIVE_STATUSES = ['accepted', 'on_the_way', 'reached', 'in_progress', 'paused', 'work_completed', 'payment_requested']

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ')
}

function statusBadgeClass(status: string): string {
  if (status === 'completed') return 'bg-emerald-100 text-emerald-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'cancelled') return 'bg-red-100 text-red-600'
  return 'bg-sky-100 text-sky-700'
}

function formatDateTime(value: string): string {
  return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
}

function paymentInfo(order: BookingResult): { label: string; className: string; detail?: string } {
  if (order.payment_received_at) {
    return { label: 'Paid', className: 'bg-emerald-100 text-emerald-700', detail: formatDateTime(order.payment_received_at) }
  }
  if (order.payment_requested_at) {
    return { label: 'Requested', className: 'bg-amber-100 text-amber-700', detail: formatDateTime(order.payment_requested_at) }
  }
  if (order.status === 'cancelled') {
    return { label: 'N/A', className: 'bg-slate-100 text-slate-400' }
  }
  return { label: 'Not yet', className: 'bg-slate-100 text-slate-500' }
}

export default function OrderHistoryPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<BookingResult[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedTab, setSelectedTab] = useState<StatusTab>('All')
  const [selectedOrder, setSelectedOrder] = useState<BookingResult | null>(null)

  useEffect(() => {
    let active = true
    const loadOrders = async () => {
      try {
        const saved = getStoredAuth('vendor')
        if (!saved || saved.role !== 'vendor') {
          router.push('/vendor/login')
          return
        }
        const rows = await fetchVendorBookings(saved.profile_id || saved.user_id)
        if (!active) return
        setOrders(rows)
        setSelectedOrder((prev) => (prev ? rows.find((row) => row.id === prev.id) || null : null))
      } catch (error) {
        console.error('Unable to load vendor orders', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadOrders()
    const refreshTimer = window.setInterval(() => void loadOrders(), 8000)
    return () => { active = false; window.clearInterval(refreshTimer) }
  }, [router])

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesTab =
        selectedTab === 'All' ? true
          : selectedTab === 'Needs action' ? order.status === 'pending'
          : selectedTab === 'Completed' ? order.status === 'completed'
          : ACTIVE_STATUSES.includes(order.status)
      if (!matchesTab) return false
      if (dateFilter && order.date !== dateFilter) return false
      if (!q) return true
      return order.id.toLowerCase().includes(q) || order.service_name.toLowerCase().includes(q) || order.customer_name.toLowerCase().includes(q)
    })
  }, [orders, searchQuery, dateFilter, selectedTab])

  const totalEarned = orders
    .filter((o) => o.status === 'completed')
    .reduce((acc, curr) => acc + (curr.total_amount || 0), 0)

  const needsActionCount = orders.filter((o) => o.status === 'pending').length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">My Orders</span>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Accept or decline new requests and track jobs assigned to you.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100 shrink-0">
            <div className="text-right sm:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Earned</span>
              <span className="text-base font-extrabold text-slate-900">Rs: {totalEarned.toLocaleString()}</span>
            </div>
            <div className="border-l border-slate-200 h-8" />
            <div className="text-right sm:text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Orders</span>
              <span className="text-base font-extrabold text-slate-900">{orders.length}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search order ID, service, customer…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition"
              />
            </div>
            <DateFilter value={dateFilter} onChange={setDateFilter} label="Filter by scheduled date" />
          </div>

          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold gap-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`px-3 py-1 rounded-md transition cursor-pointer whitespace-nowrap ${
                  selectedTab === tab ? 'bg-[#EE6C52] text-white shadow-2xs' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {tab}
                {tab === 'Needs action' && needsActionCount > 0 && ` (${needsActionCount})`}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
                <th className="py-3.5 px-4">Order ID</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Payment</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-bold">
                    {orders.length === 0 ? 'No orders yet.' : 'No orders match your filter criteria.'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-4 font-extrabold text-slate-900">#{order.id.slice(0, 8)}</td>
                    <td className="py-4 px-4 text-slate-500 font-medium">
                      {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 line-clamp-1">{order.service_name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-600">{order.customer_name}</td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black capitalize ${statusBadgeClass(order.status)}`}>
                        {statusLabel(order.status)}
                      </span>
                      {order.status === 'pending' && order.vendor_response_deadline && (
                        <p className="mt-1 text-[10px] font-bold text-orange-600">
                          <ResponseCountdown deadline={order.vendor_response_deadline} />
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right font-black text-slate-900">
                      {order.total_amount != null ? `Rs: ${order.total_amount.toLocaleString()}` : '—'}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {(() => {
                        const payment = paymentInfo(order)
                        return (
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black ${payment.className}`}
                            title={payment.detail}
                          >
                            {payment.label}
                          </span>
                        )
                      })()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3 text-slate-500" />
                        <span>{order.status === 'pending' ? 'Respond' : 'View'}</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-400 font-medium">
          Showing <strong className="text-slate-800">{filteredOrders.length}</strong> of <strong className="text-slate-800">{orders.length}</strong> orders
        </p>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-2xl border border-slate-100 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">{selectedOrder.service_name}</h3>
              <p className="text-xs text-slate-400 font-medium">Order #{selectedOrder.id.slice(0, 8)}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className={`font-black capitalize ${statusBadgeClass(selectedOrder.status)} px-2 py-0.5 rounded-full`}>{statusLabel(selectedOrder.status)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-bold text-slate-900">
                  {new Date(selectedOrder.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })} · {selectedOrder.slot_start}-{selectedOrder.slot_end}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Customer</span>
                <span className="font-bold text-slate-900">{selectedOrder.customer_name}</span>
              </div>
              {selectedOrder.customer_phone && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1"><Phone className="w-3 h-3" /> Contact</span>
                  <a href={`tel:${selectedOrder.customer_phone}`} className="font-bold text-[#EE6C52]">{selectedOrder.customer_phone}</a>
                </div>
              )}
              <div className="flex items-start justify-between gap-2">
                <span className="text-slate-500 flex items-center gap-1 shrink-0"><MapPin className="w-3 h-3" /> Address</span>
                <span className="font-bold text-slate-900 text-right">{selectedOrder.address.line}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm">
                <span>Amount</span>
                <span className="text-[#EE6C52]">{selectedOrder.total_amount != null ? `Rs: ${selectedOrder.total_amount.toLocaleString()}` : 'Not available'}</span>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 text-xs">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Payment log</p>
              {(() => {
                const payment = paymentInfo(selectedOrder)
                return (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Status</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${payment.className}`}>{payment.label}</span>
                    </div>
                    {selectedOrder.payment_requested_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Requested</span>
                        <span className="font-semibold text-slate-800">{formatDateTime(selectedOrder.payment_requested_at)}</span>
                      </div>
                    )}
                    {selectedOrder.payment_received_at && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Received</span>
                        <span className="font-semibold text-slate-800">{formatDateTime(selectedOrder.payment_received_at)}</span>
                      </div>
                    )}
                    {!selectedOrder.payment_requested_at && (
                      <p className="text-[11px] text-slate-400">Payment hasn&apos;t been requested from the customer yet.</p>
                    )}
                  </div>
                )
              })()}
            </div>

            <div className="rounded-xl border border-slate-100 bg-white p-4 text-xs">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Job history</p>
              <BookingTimeline bookingId={selectedOrder.id} role="vendor" />
            </div>

            <VendorBookingActionPanel
              booking={selectedOrder}
              onUpdated={(updated) => {
                setSelectedOrder(updated)
                setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)))
              }}
              onUnavailable={() => {
                setOrders((prev) => prev.filter((order) => order.id !== selectedOrder.id))
                setSelectedOrder(null)
              }}
            />
          </div>
        </div>
      )}
    </>
  )
}
