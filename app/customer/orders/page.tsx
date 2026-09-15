'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, Clock3, MapPin, Navigation, Phone, X } from 'lucide-react'
import { fetchCustomerBookings, formatSlotLabel, getCurrentUser, type BookingResult } from '../../lib/booking-api'

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<BookingResult[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<BookingResult | null>(null)

  useEffect(() => {
    let active = true
    const loadOrders = async () => {
      try {
        const auth = await getCurrentUser().catch(() => null)
        if (auth?.role === 'customer' && auth.profile_id) {
          const data = await fetchCustomerBookings(auth.profile_id)
          if (active) setOrders(data)
        }
      } catch {
        if (active) setOrders([])
      } finally {
        if (active) setLoading(false)
      }
    }
    void loadOrders()
    const refreshTimer = window.setInterval(() => void loadOrders(), 10000)
    return () => { active = false; window.clearInterval(refreshTimer) }
  }, [])

  const canTrack = (order: BookingResult) => ['accepted', 'on_the_way', 'in_progress', 'completed'].includes(order.status)
  const statusLabel = (status: string) => status === 'accepted' ? 'Confirmed' : status === 'on_the_way' ? 'Vendor on the way' : status === 'in_progress' ? 'Vendor arrived' : status === 'completed' ? 'Completed' : status === 'rejected' ? 'Vendor declined' : 'Waiting for vendor'

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-500"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
        <div className="mb-8 flex items-center gap-3"><ClipboardList className="h-7 w-7 text-orange-500" /><div><h1 className="text-2xl font-black text-slate-900">My Orders</h1><p className="text-xs text-slate-500">Your requested home services</p></div></div>
        {loading ? <p className="text-center text-xs text-slate-400">Loading orders...</p> : orders.length ? <div className="space-y-4">{orders.map((order) => <article key={order.id} onClick={() => canTrack(order) && setSelectedOrder(order)} className={`rounded-2xl border border-slate-200 bg-white p-6 shadow-sm ${canTrack(order) ? 'cursor-pointer transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md' : ''}`}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-xs text-slate-400">Order #{order.id}</p><h2 className="mt-1 text-lg font-extrabold text-slate-900">{order.service_name}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${order.status === 'accepted' || order.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : order.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{statusLabel(order.status)}</span></div>
          <div className="grid gap-4 py-5 text-xs text-slate-600 sm:grid-cols-3"><div><p className="text-slate-400">Date</p><p className="mt-1 font-bold text-slate-900">{order.date}</p></div><div><p className="text-slate-400">Time</p><p className="mt-1 font-bold text-slate-900">{formatSlotLabel(order.slot_start)} - {formatSlotLabel(order.slot_end)}</p></div><div><p className="text-slate-400">Vendor</p><p className="mt-1 font-bold text-slate-900">{canTrack(order) ? order.vendor.business_name : 'Pending acceptance'}</p></div></div>
          <p className="border-t border-slate-100 pt-4 text-xs text-slate-500">{order.address.line}</p>
          {canTrack(order) && <div className="mt-3 flex items-center justify-between gap-3"><p className="text-[10px] font-bold text-orange-600">Click to view order details</p><Link href={`/customer/tracking/${order.id}`} onClick={(event) => event.stopPropagation()} className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-[10px] font-bold text-white hover:bg-orange-600"><Navigation className="h-3.5 w-3.5" /> Track my order</Link></div>}
        </article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Clock3 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">No orders yet</p><Link href="/services" className="mt-4 inline-block text-xs font-bold text-orange-500">Browse services</Link></div>}
      </div>
      {selectedOrder && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">Order details</p><h2 className="mt-1 text-xl font-black text-slate-900">{selectedOrder.service_name}</h2></div><button type="button" title="Close" onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 grid gap-4 border-y border-slate-100 py-5 text-xs sm:grid-cols-2"><div><p className="text-slate-400">Customer name</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.customer_name}</p></div><div><p className="text-slate-400">Order ID</p><p className="mt-1 break-all font-bold text-slate-900">{selectedOrder.id}</p></div><div><p className="text-slate-400">Status</p><p className="mt-1 font-bold capitalize text-orange-600">{selectedOrder.status.replace('_', ' ')}</p></div><div><p className="text-slate-400">Payment</p><p className="mt-1 font-bold text-emerald-600">{selectedOrder.total_amount == null ? 'Not available' : `Rs. ${selectedOrder.total_amount.toLocaleString()}`}</p></div><div><p className="text-slate-400">Vendor name</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.vendor.business_name}</p></div><div><p className="text-slate-400">Customer phone</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.customer_phone || 'Not available'}</p></div></div><div className="border-b border-slate-100 py-4"><p className="text-xs text-slate-400">Vendor contact</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.vendor.contact_number}</p><a href={`tel:${selectedOrder.vendor.contact_number}`} onClick={(event) => event.stopPropagation()} className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"><Phone className="h-4 w-4" /> Call vendor</a></div><p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><MapPin className="h-4 w-4 text-orange-500" /> {selectedOrder.address.line}</p></div></div>}
    </main>
  )
}
