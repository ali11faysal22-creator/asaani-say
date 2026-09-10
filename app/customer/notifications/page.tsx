'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Check, Trash2 } from 'lucide-react'
import { deleteCustomerNotification, fetchCustomerNotifications, getCurrentUser, markCustomerNotificationRead, type CustomerNotification } from '../../lib/booking-api'

export default function CustomerNotificationsPage() {
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadNotifications = async () => {
      try {
        const auth = await getCurrentUser()
        if (auth.role === 'customer' && auth.profile_id) {
          setCustomerId(auth.profile_id)
          const data = await fetchCustomerNotifications(auth.profile_id)
          if (active) setNotifications(data)
        }
      } catch {
        if (active) setNotifications([])
      } finally {
        if (active) setLoading(false)
      }
    }
    loadNotifications()
    const refreshTimer = window.setInterval(loadNotifications, 3000)
    return () => { active = false; window.clearInterval(refreshTimer) }
  }, [])

  const markRead = async (id: string) => {
    if (!customerId) return
    await markCustomerNotificationRead(customerId, id)
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item))
  }
  const remove = async (id: string) => {
    if (!customerId) return
    await deleteCustomerNotification(customerId, id)
    setNotifications((items) => items.filter((item) => item.id !== id))
  }

  return <main className="min-h-screen bg-[#F8FAFC] px-4 py-8 text-slate-800"><div className="mx-auto max-w-3xl"><Link href="/" className="mb-8 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-orange-500"><ArrowLeft className="h-4 w-4" /> Back to home</Link><div className="mb-8 flex items-center gap-3"><Bell className="h-7 w-7 text-orange-500" /><div><h1 className="text-2xl font-black text-slate-900">Notifications</h1><p className="text-xs text-slate-500">Updates from Asaani Say, vendors and support</p></div></div>{loading ? <p className="text-center text-xs text-slate-400">Loading notifications...</p> : notifications.length ? <div className="space-y-3">{notifications.map((item) => <article key={item.id} className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm ${item.is_read ? 'border-slate-200' : 'border-orange-200 bg-orange-50/30'}`}><div className="rounded-xl bg-orange-100 p-2 text-orange-600"><Bell className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{item.body}</p><p className="mt-1 text-[11px] capitalize text-slate-400">{item.type} · {item.title}</p></div><div className="flex gap-1"><button title="Mark as read" onClick={() => markRead(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Check className="h-4 w-4" /></button><button title="Delete" onClick={() => remove(item.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></article>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Bell className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-bold text-slate-700">No notifications yet</p></div>}</div></main>
}