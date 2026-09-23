'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  MapPin,
  Navigation,
  Pause,
  PhoneCall,
  Sparkles,
  Star,
  Truck,
  Wrench,
} from 'lucide-react'
import { API_BASE, fetchCustomerBookings, formatSlotLabel, getCurrentUser, type BookingResult } from '@/app/lib/booking-api'
import { InitialsAvatar } from '@/app/components/initials-avatar'
import { ResponseCountdown } from '@/app/components/response-countdown'
import { VendorRatingForm } from '@/app/customer/components/vendor-rating-form'

const statusSteps = [
  { key: 'accepted', label: 'Confirmed', shortLabel: 'Confirmed', detail: 'Vendor confirmed your service request.', icon: CheckCircle2 },
  { key: 'on_the_way', label: 'On the way', shortLabel: 'On the way', detail: 'Your vendor has started travelling to you.', icon: Truck },
  { key: 'reached', label: 'Arrived', shortLabel: 'Arrived', detail: 'Your vendor has reached your address.', icon: MapPin },
  { key: 'in_progress', label: 'Work in progress', shortLabel: 'Working', detail: 'The service is being carried out at your address.', icon: Wrench },
  { key: 'work_completed', label: 'Work finished', shortLabel: 'Finished', detail: 'The job is done — payment will be requested shortly.', icon: Sparkles },
  { key: 'payment_requested', label: 'Payment requested', shortLabel: 'Payment', detail: 'Please settle payment with your vendor.', icon: CreditCard },
  { key: 'completed', label: 'Completed', shortLabel: 'Completed', detail: 'Your home service is complete.', icon: Check },
]
const statusRank: Record<string, number> = {
  accepted: 0,
  on_the_way: 1,
  reached: 2,
  in_progress: 3,
  paused: 3,
  work_completed: 4,
  payment_requested: 5,
  completed: 6,
}
const formatTrackingTime = (value: string | Date) => new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true })

const HERO_COPY: Record<string, { title: string; icon: typeof Truck }> = {
  pending: { title: 'Waiting for vendor to accept', icon: Clock3 },
  accepted: { title: 'Vendor confirmed your order', icon: CheckCircle2 },
  on_the_way: { title: 'Vendor is on the way', icon: Truck },
  reached: { title: 'Vendor has arrived', icon: MapPin },
  in_progress: { title: 'Work is in progress', icon: Wrench },
  paused: { title: 'Work is paused', icon: Pause },
  work_completed: { title: 'Work finished', icon: Sparkles },
  payment_requested: { title: 'Payment requested', icon: CreditCard },
  completed: { title: 'Order completed', icon: Check },
}

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
  const progressPercent = Math.min(100, Math.round((currentRank / (statusSteps.length - 1)) * 100))
  const eta = useMemo(() => {
    if (!booking) return ''
    if (booking.status === 'completed' || booking.status === 'in_progress' || booking.status === 'paused') return 'At your address'
    if (booking.status === 'on_the_way') return 'Arriving in approximately 20 minutes'
    return `Scheduled for ${formatSlotLabel(booking.slot_start)} - ${formatSlotLabel(booking.slot_end)}`
  }, [booking])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }
  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-slate-700">
        <p className="text-sm font-bold">Order tracking is unavailable.</p>
        <Link href="/customer/orders" className="text-xs font-bold text-orange-600">Back to orders</Link>
      </div>
    )
  }
  if (!booking.vendor) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center text-slate-700">
        <Truck className="h-8 w-8 text-orange-300" />
        <p className="text-sm font-bold">We&apos;re assigning a vendor for this order.</p>
        <p className="text-xs text-slate-400">Tracking will be available once a vendor accepts your request.</p>
        <Link href="/customer/orders" className="text-xs font-bold text-orange-600">Back to orders</Link>
      </div>
    )
  }

  const hero = HERO_COPY[booking.status] || HERO_COPY.accepted
  const HeroIcon = hero.icon
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${booking.address.latitude},${booking.address.longitude}`

  return (
    <>
      <Link href="/customer/orders" className="mb-2 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-500">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="space-y-4">
        {/* Hero status card */}
        <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#EE6C52] to-[#e2532f] p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-orange-100">Live order tracking</p>
              <h1 className="mt-2 text-xl font-black sm:text-2xl">{booking.service_name}</h1>
              <p className="mt-1 text-xs text-orange-100">Order #{booking.id.slice(0, 8)}</p>
            </div>
            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-sm">
              <HeroIcon className="h-7 w-7" />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-lg font-black sm:text-xl">{hero.title}</p>
              <p className="mt-1 text-xs text-orange-50">{eta}</p>
            </div>
          </div>

          <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-white/25">
            <div
              className="h-full rounded-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {booking.status === 'pending' && (
          <div className="flex items-center gap-3 rounded-2xl border border-orange-200 bg-orange-50 p-4">
            <Clock3 className="h-5 w-5 shrink-0 text-orange-500" />
            <div className="text-xs text-orange-800">
              <p className="font-semibold">{booking.vendor.business_name} has been offered this job and hasn&apos;t responded yet.</p>
              {booking.vendor_response_deadline && (
                <p className="mt-0.5 font-bold">
                  <ResponseCountdown deadline={booking.vendor_response_deadline} /> — if they don&apos;t respond in time, we&apos;ll automatically offer it to the next best vendor.
                </p>
              )}
            </div>
          </div>
        )}
        {booking.status === 'paused' && (
          <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <Pause className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-xs font-semibold text-amber-800">Your vendor has paused work temporarily. It will resume shortly.</p>
          </div>
        )}
        {booking.cannot_start_reason && !['completed', 'cancelled'].includes(booking.status) && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-slate-400" />
            <p className="text-xs text-slate-600">A previous vendor couldn&apos;t start this job ({booking.cannot_start_reason}) — you&apos;ve been matched with a new one.</p>
          </div>
        )}

        {/* Vendor card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <InitialsAvatar name={booking.vendor.business_name} size={11} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-extrabold text-slate-900">{booking.vendor.first_name} {booking.vendor.last_name}</p>
              <p className="truncate text-xs text-slate-400">{booking.vendor.business_name}</p>
            </div>
            {booking.vendor.average_rating > 0 && (
              <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {booking.vendor.average_rating.toFixed(1)}
              </div>
            )}
          </div>
          <a
            href={`tel:${booking.vendor.contact_number}`}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-emerald-50 py-2.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
          >
            <PhoneCall className="h-4 w-4" /> Call {booking.vendor.contact_number}
          </a>
        </div>

        {/* Timeline */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="mb-4 text-[11px] font-bold uppercase tracking-wide text-slate-400">Order timeline</p>
          <div className="space-y-0">
            {statusSteps.map((step, index) => {
              const done = currentRank >= index
              const isCurrent = currentRank === index && booking.status !== 'completed'
              const StepIcon = step.icon
              return (
                <div key={step.key} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors ${
                        done ? 'bg-[#EE6C52] text-white' : 'bg-slate-100 text-slate-300'
                      } ${isCurrent ? 'ring-4 ring-orange-100' : ''}`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div className={`w-0.5 flex-1 ${currentRank > index ? 'bg-[#EE6C52]' : 'bg-slate-100'}`} style={{ minHeight: '2.25rem' }} />
                    )}
                  </div>
                  <div className={`min-w-0 flex-1 ${index < statusSteps.length - 1 ? 'pb-6' : ''}`}>
                    <p className={`text-sm font-extrabold ${done ? 'text-slate-900' : 'text-slate-400'}`}>{step.label}</p>
                    <p className={`mt-0.5 text-xs ${done ? 'text-slate-500' : 'text-slate-300'}`}>{step.detail}</p>
                    {step.key === 'accepted' && booking.accepted_at && (
                      <p className="mt-1.5 text-[11px] text-slate-400">{formatTrackingTime(booking.accepted_at)}</p>
                    )}
                    {step.key === 'reached' && booking.reached_at && (
                      <p className="mt-1.5 text-[11px] text-slate-400">{formatTrackingTime(booking.reached_at)}</p>
                    )}
                    {step.key === 'in_progress' && booking.started_at && (
                      <p className="mt-1.5 text-[11px] text-slate-400">{formatTrackingTime(booking.started_at)}</p>
                    )}
                    {step.key === 'payment_requested' && booking.payment_requested_at && (
                      <p className="mt-1.5 text-[11px] text-slate-400">{formatTrackingTime(booking.payment_requested_at)}</p>
                    )}
                    {step.key === 'completed' && booking.completed_at && (
                      <p className="mt-1.5 text-[11px] text-slate-400">{formatTrackingTime(booking.completed_at)}</p>
                    )}
                    {step.key === 'completed' && done && booking.photos.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {booking.photos.map((url) => (
                          <a key={url} href={`${API_BASE}${url}`} target="_blank" rel="noreferrer">
                            <img src={`${API_BASE}${url}`} alt="Completed job" className="h-16 w-16 rounded-lg border border-slate-200 object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {(booking.status === 'work_completed' || booking.status === 'payment_requested') && (
          <div className="rounded-3xl border border-orange-200 bg-orange-50/60 p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2.5 text-orange-600 shadow-xs"><CreditCard className="h-5 w-5" /></div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900">
                  {booking.status === 'payment_requested' ? 'Payment requested' : 'Job finished'}
                </p>
                <p className="text-xs text-slate-500">
                  {booking.status === 'payment_requested'
                    ? `Please pay your vendor directly to complete the order.`
                    : `Your vendor will request payment shortly.`}
                </p>
              </div>
              {booking.total_amount != null && (
                <p className="shrink-0 text-lg font-black text-orange-600">Rs. {booking.total_amount.toLocaleString()}</p>
              )}
            </div>
          </div>
        )}

        {booking.status === 'completed' && (
          booking.rating ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5">
              <p className="text-sm font-extrabold text-slate-900">Thanks for your rating!</p>
              <div className="mt-2 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <Star key={value} className={`h-5 w-5 ${booking.rating! >= value ? 'fill-orange-400 text-orange-400' : 'text-slate-300'}`} />
                ))}
              </div>
              {booking.rating_comment && <p className="mt-2 text-xs text-slate-600">&ldquo;{booking.rating_comment}&rdquo;</p>}
            </div>
          ) : (
            <div className="rounded-3xl border border-orange-200 bg-orange-50/60 p-5">
              <VendorRatingForm bookingId={booking.id} vendorName={booking.vendor?.business_name} onRated={setBooking} />
            </div>
          )
        )}

        {/* Address + meta */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" />
              <div>
                <p className="text-xs text-slate-400">Service address</p>
                <p className="mt-0.5 text-sm font-bold text-slate-900">{booking.address.line}</p>
              </div>
            </div>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
            >
              <Navigation className="h-3.5 w-3.5" /> Directions
            </a>
          </div>
        </div>

        <p className="flex items-center gap-2 text-[11px] text-slate-400">
          <Clock3 className="h-3.5 w-3.5" /> Last updated {formatTrackingTime(lastUpdated)}
        </p>
      </div>
    </>
  )
}
