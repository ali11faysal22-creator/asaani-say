'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Timer, X } from 'lucide-react'
import { fetchCustomerBookings, getStoredAuth, type BookingResult } from '../lib/booking-api'

const REQUEST_TIMEOUT_SECONDS = 180

type StoredOrder = {
  orderId?: string
  createdAt?: string
}

function readStoredOrder(): StoredOrder | null {
  try {
    const raw = window.localStorage.getItem('asaani_latest_order')
    return raw ? JSON.parse(raw) as StoredOrder : null
  } catch {
    return null
  }
}

export default function CustomerRequestMonitor() {
  const pathname = usePathname()
  const [order, setOrder] = useState<StoredOrder | null>(null)
  const [booking, setBooking] = useState<BookingResult | null>(null)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    let active = true

    const load = async () => {
      if (window.location.pathname.startsWith('/vendor')) return

      const storedOrder = readStoredOrder()
      const auth = getStoredAuth('customer')
      if (!storedOrder?.orderId || !storedOrder.createdAt || !auth?.profile_id) {
        if (active) {
          setOrder(null)
          setBooking(null)
        }
        return
      }

      const orderAge = (Date.now() - new Date(storedOrder.createdAt).getTime()) / 1000
      if (!Number.isFinite(orderAge) || orderAge > REQUEST_TIMEOUT_SECONDS) {
        if (active) {
          setOrder(null)
          setBooking(null)
        }
        return
      }

      try {
        const bookings = await fetchCustomerBookings(auth.profile_id)
        const current = bookings.find((item) => item.id === storedOrder.orderId) || null
        if (!active) return
        setOrder(storedOrder)
        setBooking(current)
        if (current?.status === 'accepted' || current?.status === 'rejected') {
          setDismissed(true)
        }
      } catch {
        if (active) setOrder(storedOrder)
      }
    }

    void load()
    const refreshTimer = window.setInterval(() => void load(), 5000)
    const storageListener = () => {
      setDismissed(false)
      void load()
    }
    window.addEventListener('storage', storageListener)
    window.addEventListener('asaani-order-changed', storageListener)
    window.addEventListener('asaani-auth-changed', storageListener)
    return () => {
      active = false
      window.clearInterval(refreshTimer)
      window.removeEventListener('storage', storageListener)
      window.removeEventListener('asaani-order-changed', storageListener)
      window.removeEventListener('asaani-auth-changed', storageListener)
    }
  }, [])

  useEffect(() => {
    if (!order?.createdAt || booking?.status !== 'pending') return

    const update = () => {
      const elapsed = Math.floor((Date.now() - new Date(order.createdAt as string).getTime()) / 1000)
      setSecondsRemaining(Math.max(0, REQUEST_TIMEOUT_SECONDS - elapsed))
    }
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [order, booking])

  if (pathname.startsWith('/vendor') || pathname === '/order-confirmation' || !order || !booking || booking.status !== 'pending' || secondsRemaining <= 0 || dismissed) return null

  const minutes = Math.floor(secondsRemaining / 60).toString().padStart(2, '0')
  const seconds = (secondsRemaining % 60).toString().padStart(2, '0')

  return (
    <div className="fixed right-4 top-4 z-[100] w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-orange-100 bg-white/95 p-4 shadow-xl backdrop-blur-xl">
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-2 top-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        aria-label="Close order timer"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="flex items-start gap-3 pr-5">
        <div className="rounded-xl bg-orange-100 p-2 text-orange-600"><Timer className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-slate-900">Order received</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">We are assigning the best available vendor.</p>
          <p className="mt-2 text-[11px] font-bold text-orange-600">Vendor response time: {minutes}:{seconds}</p>
          <p className="mt-1 truncate text-[10px] text-slate-400">Order ID: {order.orderId}</p>
        </div>
      </div>
    </div>
  )
}
