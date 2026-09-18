'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Clock3, Eye, MapPin, Navigation, Phone, X } from 'lucide-react'
import { API_BASE, fetchCustomerBookings, formatSlotLabel, getCurrentUser, type BookingResult } from '@/app/lib/booking-api'

export default function CustomerOrdersPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<BookingResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<BookingResult | null>(null)

  useEffect(() => {
    let active = true
    const loadOrders = async () => {
      try {
        const auth = await getCurrentUser('customer')
        if (auth.role !== 'customer') {
          router.push('/customer/login')
          return
        }
        if (auth.profile_id) {
          const data = await fetchCustomerBookings(auth.profile_id)
          if (active) setOrders(data)
        }
      } catch {
        router.push('/customer/login')
        return
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadOrders()
    const refreshTimer = window.setInterval(() => void loadOrders(), 10000)
    return () => { active = false; window.clearInterval(refreshTimer) }
  }, [router])

  const TRACKABLE_STATUSES = ['accepted', 'on_the_way', 'reached', 'in_progress', 'paused', 'work_completed', 'payment_requested', 'completed']
  const canTrack = (order: BookingResult) => TRACKABLE_STATUSES.includes(order.status)
  const statusLabel = (status: string) =>
    status === 'accepted' ? 'Confirmed'
      : status === 'on_the_way' ? 'Vendor on the way'
      : status === 'reached' ? 'Vendor arrived'
      : status === 'in_progress' ? 'Work in progress'
      : status === 'paused' ? 'Work paused'
      : status === 'work_completed' ? 'Work finished'
      : status === 'payment_requested' ? 'Payment requested'
      : status === 'completed' ? 'Completed'
      : status === 'rejected' ? 'Vendor declined'
      : status === 'cancelled' ? 'Cancelled'
      : 'Waiting for vendor'
  const statusTone = (status: string) =>
    status === 'accepted' || status === 'completed' ? 'bg-emerald-50 text-emerald-600'
      : status === 'rejected' || status === 'cancelled' ? 'bg-red-50 text-red-600'
      : 'bg-orange-50 text-orange-600'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <>
      {orders.length ? (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-bold">Service</th>
                <th className="px-4 py-3 font-bold">Date</th>
                <th className="px-4 py-3 font-bold">Time</th>
                <th className="px-4 py-3 font-bold">Vendor</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">{order.service_name}</p>
                    <p className="text-[10px] text-slate-400">Order #{order.id}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{order.date}</td>
                  <td className="px-4 py-3 text-slate-600">{formatSlotLabel(order.slot_start)} - {formatSlotLabel(order.slot_end)}</td>
                  <td className="px-4 py-3 text-slate-600">{canTrack(order) && order.vendor ? order.vendor.business_name : 'Pending acceptance'}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1.5 text-[11px] font-bold ${statusTone(order.status)}`}>{statusLabel(order.status)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        title="View details"
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition cursor-pointer"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                      {canTrack(order) && (
                        <Link
                          href={`/customer/tracking/${order.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-[10px] font-bold text-white hover:bg-orange-600"
                        >
                          <Navigation className="h-3.5 w-3.5" /> Track
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <Clock3 className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-bold text-slate-700">No orders yet</p>
          <Link href="/services" className="mt-4 inline-block text-xs font-bold text-orange-500">Browse services</Link>
        </div>
      )}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">Order details</p>
                <h2 className="mt-1 text-xl font-black text-slate-900">{selectedOrder.service_name}</h2>
              </div>
              <button type="button" title="Close" onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-4 border-y border-slate-100 py-5 text-xs sm:grid-cols-2">
              <div><p className="text-slate-400">Customer name</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.customer_name}</p></div>
              <div><p className="text-slate-400">Order ID</p><p className="mt-1 break-all font-bold text-slate-900">{selectedOrder.id}</p></div>
              <div><p className="text-slate-400">Status</p><p className="mt-1 font-bold capitalize text-orange-600">{selectedOrder.status.replace(/_/g, ' ')}</p></div>
              <div><p className="text-slate-400">Payment</p><p className="mt-1 font-bold text-emerald-600">{selectedOrder.total_amount == null ? 'Not available' : `Rs. ${selectedOrder.total_amount.toLocaleString()}`}</p></div>
              <div><p className="text-slate-400">Vendor name</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.vendor?.business_name || 'Not assigned yet'}</p></div>
              <div><p className="text-slate-400">Customer phone</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.customer_phone || 'Not available'}</p></div>
            </div>
            {selectedOrder.vendor && (
              <div className="border-b border-slate-100 py-4">
                <p className="text-xs text-slate-400">Vendor contact</p>
                <p className="mt-1 font-bold text-slate-900">{selectedOrder.vendor.contact_number}</p>
                <a
                  href={`tel:${selectedOrder.vendor.contact_number}`}
                  onClick={(event) => event.stopPropagation()}
                  className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                >
                  <Phone className="h-4 w-4" /> Call vendor
                </a>
              </div>
            )}
            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><MapPin className="h-4 w-4 text-orange-500" /> {selectedOrder.address.line}</p>
            {selectedOrder.photos.length > 0 && (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <p className="mb-2 text-xs text-slate-400">Completion photos</p>
                <div className="flex flex-wrap gap-2">
                  {selectedOrder.photos.map((url) => (
                    <a key={url} href={`${API_BASE}${url}`} target="_blank" rel="noreferrer">
                      <img src={`${API_BASE}${url}`} alt="Completed job" className="h-16 w-16 rounded-lg border border-slate-200 object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            {canTrack(selectedOrder) && (
              <Link
                href={`/customer/tracking/${selectedOrder.id}`}
                className="mt-4 flex items-center justify-center gap-1.5 rounded-xl bg-orange-500 py-2.5 text-xs font-bold text-white hover:bg-orange-600"
              >
                <Navigation className="h-3.5 w-3.5" /> Track my order
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}
