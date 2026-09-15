'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { fetchVendorNotifications, getStoredAuth, markVendorNotificationRead } from '@/app/lib/booking-api'

export default function VendorNotificationMonitor() {
  const [request, setRequest] = useState<{ id: string; body: string } | null>(null)

  useEffect(() => {
    let active = true
    const load = async () => {
      if (window.location.pathname === '/vendor/notifications') return
      const auth = getStoredAuth('vendor')
      if (!auth?.profile_id) return
      try {
        const notifications = await fetchVendorNotifications(auth.profile_id)
        const seen = JSON.parse(sessionStorage.getItem('asaani_seen_vendor_request_ids') || '[]') as string[]
        const next = notifications.find((item) => item.title === 'New service request' && !item.is_read && !seen.includes(item.id))
        if (next && active) {
          sessionStorage.setItem('asaani_seen_vendor_request_ids', JSON.stringify([...seen, next.id].slice(-100)))
          setRequest({ id: next.id, body: next.body })
          window.setTimeout(() => setRequest(null), 8000)
        }
      } catch {
      }
    }

    void load()
    const timer = window.setInterval(() => void load(), 5000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [])

  if (!request) return null

  return (
    <div className="fixed right-4 top-4 z-[100] w-[min(380px,calc(100vw-2rem))] rounded-2xl border border-orange-200 bg-white p-4 shadow-2xl">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-orange-100 p-2 text-orange-600"><Bell className="h-5 w-5" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold text-slate-900">New service request</p>
          <p className="mt-1 text-xs leading-relaxed text-slate-600">{request.body}</p>
          <Link href="/vendor/notifications" onClick={() => { const auth = getStoredAuth('vendor'); if (auth?.profile_id) void markVendorNotificationRead(auth.profile_id, request.id); setRequest(null) }} className="mt-3 inline-block rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white">Review request</Link>
        </div>
        <button type="button" title="Dismiss" onClick={() => { const auth = getStoredAuth('vendor'); if (auth?.profile_id) void markVendorNotificationRead(auth.profile_id, request.id); setRequest(null) }} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
      </div>
    </div>
  )
}
