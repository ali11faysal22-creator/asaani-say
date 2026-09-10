'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ClipboardList, Clock3 } from 'lucide-react'
import { fetchCustomerBookings, getCurrentUser, type BookingResult } from '../../lib/booking-api'

export default function CustomerOrdersPage() {
  const [orders, setOrders] = useState<BookingResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadOrders = async () => {
      try {
        const auth = await getCurrentUser().catch(() => {
          try {
            const saved = JSON.parse(localStorage.getItem('asaani_auth') || 'null')
            return saved?.role === 'customer' ? saved : null
          } catch {
            return null
          }
        })
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
    loadOrders()
    const refreshTimer = window.setInterval(loadOrders, 10000)
    return () => { active = false; window.clearInterval(refreshTimer) }
  }, [])

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-4xl">
        <Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-500"><ArrowLeft className="h-4 w-4" /> Back to home</Link>
        <div className="mb-8 flex items-center gap-3"><ClipboardList className="h-7 w-7 text-orange-500" /><div><h1 className="text-2xl font-black text-slate-900">My Orders</h1><p className="text-xs text-slate-500">Your requested home services</p></div></div>
        {loading ? <p className="text-center text-xs text-slate-400">Loading orders...</p> : orders.length ? <div className="space-y-4">{orders.map((order) => <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4"><div><p className="text-xs text-slate-400">Order #{order.id}</p><h2 className="mt-1 text-lg font-extrabold text-slate-900">{order.service_name}</h2></div><span className={`rounded-full px-3 py-1.5 text-xs font-bold ${order.status === 'accepted' ? 'bg-emerald-50 text-emerald-600' : order.status === 'rejected' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{order.status === 'accepted' ? 'Confirmed' : order.status === 'rejected' ? 'Vendor declined' : 'Waiting for vendor'}</span></div><div className="grid gap-4 py-5 text-xs text-slate-600 sm:grid-cols-3"><div><p className="text-slate-400">Date</p><p className="mt-1 font-bold text-slate-900">{order.date}</p></div><div><p className="text-slate-400">Time</p><p className="mt-1 font-bold text-slate-900">{order.slot_start} - {order.slot_end}</p></div><div><p className="text-slate-400">Vendor</p><p className="mt-1 font-bold text-slate-900">{order.status === 'accepted' ? order.vendor.business_name : 'Pending acceptance'}</p></div></div><p className="border-t border-slate-100 pt-4 text-xs text-slate-500">{order.address.line}</p></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Clock3 className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">No orders yet</p><Link href="/services" className="mt-4 inline-block text-xs font-bold text-orange-500">Browse services</Link></div>}
      </div>
    </main>
  )
}