'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Clock3, MapPin, Phone, Truck } from 'lucide-react'
import { API_BASE, fetchCustomerBookings, formatSlotLabel, getCurrentUser, type BookingResult } from '@/app/lib/booking-api'

const statusSteps = [
  { key: 'accepted', label: 'Order confirmed', detail: 'Vendor confirmed your service request.' },
  { key: 'on_the_way', label: 'Vendor is on the way', detail: 'Your vendor has started travelling to you.' },
  { key: 'in_progress', label: 'Vendor has arrived', detail: 'The service is being carried out at your address.' },
  { key: 'completed', label: 'Order completed', detail: 'Your home service is complete.' },
]
const statusRank: Record<string, number> = { accepted: 0, on_the_way: 1, in_progress: 2, completed: 3 }
const formatTrackingTime = (value: string | Date) => new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true })

export default function CustomerTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const [bookingId, setBookingId] = useState('')
  const [booking, setBooking] = useState<BookingResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  useEffect(() => { void params.then(({ id }) => setBookingId(id)) }, [params])
  useEffect(() => {
    document.body.classList.add('tracking-page')
    return () => document.body.classList.remove('tracking-page')
  }, [])
  useEffect(() => {
    if (!bookingId) return
    let active = true
    const load = async () => {
      const auth = await getCurrentUser('customer').catch(() => null)
      if (!auth || auth.role !== 'customer') {
        router.push('/customer/login')
        return
      }
      if (!auth.profile_id) return
      const rows = await fetchCustomerBookings(auth.profile_id).catch(() => [])
      const current = rows.find((item) => item.id === bookingId) || null
      if (active) { setBooking(current); setLoading(false); setLastUpdated(new Date()) }
    }
    void load()
    const timer = window.setInterval(() => void load(), 5000)
    return () => { active = false; window.clearInterval(timer) }
  }, [bookingId, router])

  const currentRank = statusRank[booking?.status || 'accepted'] ?? 0
  const eta = useMemo(() => {
    if (!booking || booking.status === 'completed' || booking.status === 'in_progress') return 'At your address'
    if (booking.status === 'on_the_way') return 'Arriving in approximately 20 minutes'
    return `Scheduled for ${formatSlotLabel(booking.slot_start)} - ${formatSlotLabel(booking.slot_end)}`
  }, [booking])

  if (loading) return <div className="flex items-center justify-center py-24"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" /></div>
  if (!booking) return <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-700"><p className="text-sm font-bold">Order tracking is unavailable.</p><Link href="/customer/orders" className="text-xs font-bold text-orange-600">Back to orders</Link></div>
  if (!booking.vendor) return <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-slate-700"><Truck className="h-8 w-8 text-orange-300" /><p className="text-sm font-bold">We&apos;re assigning a vendor for this order.</p><p className="text-xs text-slate-400">Tracking will be available once a vendor accepts your request.</p><Link href="/customer/orders" className="text-xs font-bold text-orange-600">Back to orders</Link></div>

  return <><Link href="/customer/orders" className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-500"><ArrowLeft className="h-4 w-4" /> Back to orders</Link><div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6"><div><p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-500">Live order tracking</p><h1 className="mt-2 text-2xl font-black text-slate-900">{booking.service_name}</h1><p className="mt-1 text-xs text-slate-400">Order #{booking.id}</p></div><div className="rounded-2xl bg-orange-50 p-3 text-orange-600"><Truck className="h-6 w-6" /></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Current status</p><p className="mt-1 text-sm font-black capitalize text-slate-900">{booking.status.replace('_', ' ')}</p></div><div className="rounded-2xl bg-orange-50 p-4"><p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">Live ETA</p><p className="mt-1 text-sm font-black text-orange-700">{eta}</p></div></div><div className="mt-8 space-y-5">{statusSteps.map((step, index) => { const done = currentRank >= index; return <div key={step.key} className="flex gap-4"><div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${done ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-300'}`}>{done ? <Check className="h-4 w-4" /> : <span className="text-xs font-bold">{index + 1}</span>}</div><div className="border-b border-slate-100 pb-5 flex-1"><p className={`text-sm font-extrabold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p><p className="mt-1 text-xs text-slate-500">{step.detail}</p>{step.key === 'accepted' && booking.accepted_at && <p className="mt-2 text-[11px] text-slate-400">Confirmed at {formatTrackingTime(booking.accepted_at)}</p>}{step.key === 'on_the_way' && booking.started_at && <p className="mt-2 text-[11px] text-slate-400">Started at {formatTrackingTime(booking.started_at)}</p>}{step.key === 'completed' && booking.completed_at && <p className="mt-2 text-[11px] text-slate-400">Completed at {formatTrackingTime(booking.completed_at)}</p>}{step.key === 'completed' && done && booking.photos.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{booking.photos.map((url) => <a key={url} href={`${API_BASE}${url}`} target="_blank" rel="noreferrer"><img src={`${API_BASE}${url}`} alt="Completed job" className="h-16 w-16 rounded-lg border border-slate-200 object-cover" /></a>)}</div>}</div></div>})}</div><div className="mt-7 grid gap-3 border-t border-slate-100 pt-6 text-xs sm:grid-cols-2"><div className="flex gap-3"><MapPin className="h-4 w-4 text-orange-500" /><div><p className="text-slate-400">Service address</p><p className="mt-1 font-bold text-slate-900">{booking.address.line}</p></div></div><div className="flex gap-3"><Phone className="h-4 w-4 text-orange-500" /><div><p className="text-slate-400">Vendor</p><p className="mt-1 font-bold text-slate-900">{booking.vendor.business_name} · {booking.vendor.contact_number}</p></div></div></div><p className="mt-6 flex items-center gap-2 text-[11px] text-slate-400"><Clock3 className="h-3.5 w-3.5" /> Last updated {formatTrackingTime(lastUpdated)}</p></div></>
}
