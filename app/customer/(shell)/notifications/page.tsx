'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Bell, CalendarDays, Check, Clock3, Trash2, X } from 'lucide-react'
import { deleteCustomerNotification, fetchCustomerBookings, fetchCustomerNotifications, formatSlotLabel, getCurrentUser, markAllCustomerNotificationsRead, markCustomerNotificationRead, type BookingResult, type CustomerNotification } from '@/app/lib/booking-api'

export default function CustomerNotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<BookingResult | null>(null)
  const [orders, setOrders] = useState<BookingResult[]>([])
  const [markingAll, setMarkingAll] = useState(false)

  useEffect(() => {
    let active = true
    const loadNotifications = async () => {
      try {
        const auth = await getCurrentUser('customer')
        if (auth.role !== 'customer') {
          router.push('/customer/login')
          return
        }
        if (auth.profile_id) {
          setCustomerId(auth.profile_id)
          const [notificationData, orderData] = await Promise.all([
            fetchCustomerNotifications(auth.profile_id),
            fetchCustomerBookings(auth.profile_id),
          ])
          if (active) {
            const uniqueNotifications = notificationData.filter((item, index, items) => index === items.findIndex((candidate) => candidate.title === item.title && candidate.body === item.body && candidate.type === item.type))
            setNotifications([...uniqueNotifications].sort((a, b) => {
              const first = new Date(a.created_at || a.createdAt || 0).getTime()
              const second = new Date(b.created_at || b.createdAt || 0).getTime()
              return second - first
            }))
            setOrders(orderData)
          }
        }
      } catch {
        router.push('/customer/login')
        return
      } finally {
        if (active) setLoading(false)
      }
    }
    loadNotifications()
    const refreshTimer = window.setInterval(loadNotifications, 5000)
    return () => { active = false; window.clearInterval(refreshTimer) }
  }, [router])

  const markRead = async (id: string) => {
    if (!customerId) return
    await markCustomerNotificationRead(customerId, id)
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item))
  }
  const markAllRead = async () => {
    const unread = notifications.filter((item) => !item.is_read)
    if (!customerId || unread.length === 0) return
    setMarkingAll(true)
    try {
      await markAllCustomerNotificationsRead(customerId)
      setNotifications((items) => items.map((item) => ({ ...item, is_read: true })))
    } finally {
      setMarkingAll(false)
    }
  }
  const openNotification = async (item: CustomerNotification) => {
    if (!item.is_read) await markRead(item.id)
    const orderId = item.body.match(/Booking ID:\s*([\w-]+)/i)?.[1]
    const relatedOrder = orderId ? orders.find((order) => order.id === orderId) : undefined
    if (relatedOrder) setSelectedOrder(relatedOrder)
    else {
      const latestOrder = orders.find((order) => item.body.toLowerCase().includes(order.service_name.toLowerCase()))
      if (latestOrder) setSelectedOrder(latestOrder)
    }
  }
  const remove = async (id: string) => {
    if (!customerId) return
    await deleteCustomerNotification(customerId, id)
    setNotifications((items) => items.filter((item) => item.id !== id))
  }

  const filteredNotifications = useMemo(() => {
    if (!selectedDate) return notifications
    return notifications.filter((item) => {
      const createdAt = item.created_at || item.createdAt
      return createdAt ? new Date(createdAt).toISOString().slice(0, 10) === selectedDate : false
    })
  }, [notifications, selectedDate])

  const formatNotificationDate = (item: CustomerNotification) => {
    const createdAt = item.created_at || item.createdAt
    return createdAt ? new Date(createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : 'Date unavailable'
  }

  const findRelatedOrder = (item: CustomerNotification) => {
    const orderId = item.body.match(/Booking ID:\s*([\w-]+)/i)?.[1]
    return (orderId ? orders.find((order) => order.id === orderId) : undefined)
      || orders.find((order) => item.body.toLowerCase().includes(order.service_name.toLowerCase()))
  }

  const getOrderTimeLabel = (item: CustomerNotification, order: BookingResult) => {
    if (order.status === 'accepted') return 'Order placed'
    if (order.status === 'pending') return 'Request submitted'
    return item.title.toLowerCase().includes('no vendor') || order.status === 'rejected' ? '' : 'Request submitted'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return <><div className="flex flex-wrap items-center justify-end gap-4"><button type="button" onClick={markAllRead} disabled={markingAll || !notifications.some((item) => !item.is_read)} className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"><Check className="h-4 w-4" /> {markingAll ? 'Marking...' : 'Mark all as read'}</button></div><div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4"><CalendarDays className="h-4 w-4 text-orange-500" /><label htmlFor="notification-date" className="text-xs font-bold text-slate-600">Filter by date</label><input id="notification-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-700" />{selectedDate && <button type="button" onClick={() => setSelectedDate('')} className="text-xs font-bold text-orange-600">Clear</button>}</div>{filteredNotifications.length ? <div className="space-y-3">{filteredNotifications.map((item) => { const relatedOrder = findRelatedOrder(item); const orderTimeLabel = relatedOrder ? getOrderTimeLabel(item, relatedOrder) : ''; return <article key={item.id} onClick={() => void openNotification(item)} className={`flex cursor-pointer items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${item.is_read ? 'border-slate-200' : 'border-orange-200 bg-orange-50/30'}`}><div className="rounded-xl bg-orange-100 p-2 text-orange-600"><Bell className="h-4 w-4" /></div><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-slate-800">{item.body}</p><p className="mt-1 text-[11px] capitalize text-slate-400">{item.type} · {item.title}</p><p className="mt-1 text-[10px] text-slate-400">Notification received: {formatNotificationDate(item)}</p>{relatedOrder && orderTimeLabel && <p className="text-[10px] text-slate-400">{orderTimeLabel}: {new Date(relatedOrder.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true })}</p>}<Link href="/customer/orders" onClick={(event) => { event.stopPropagation(); if (!item.is_read) void markRead(item.id) }} className="mt-2 inline-block text-[10px] font-bold text-orange-600 hover:text-orange-700">Open order history</Link></div><div className="flex gap-1"><button title="Mark as read" onClick={(event) => { event.stopPropagation(); void markRead(item.id) }} className="rounded-lg p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"><Check className="h-4 w-4" /></button><button title="Delete" onClick={(event) => { event.stopPropagation(); void remove(item.id) }} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button></div></article> })}</div> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><Bell className="mx-auto h-8 w-8 text-orange-500" /><p className="mt-3 text-sm font-bold text-slate-700">{selectedDate ? 'No notifications for this date' : 'No notifications yet'}</p></div>}{selectedOrder && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-start justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-wide text-orange-500">Order history</p><h2 className="mt-1 text-xl font-black text-slate-900">{selectedOrder.service_name}</h2></div><button type="button" title="Close" onClick={() => setSelectedOrder(null)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X className="h-5 w-5" /></button></div><div className="mt-5 grid gap-4 border-y border-slate-100 py-5 text-xs sm:grid-cols-2"><div><p className="text-slate-400">Order ID</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.id}</p></div><div><p className="text-slate-400">Status</p><p className="mt-1 font-bold capitalize text-orange-600">{selectedOrder.status}</p></div><div><p className="text-slate-400">Date & time</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.date} · {formatSlotLabel(selectedOrder.slot_start)} - {formatSlotLabel(selectedOrder.slot_end)}</p></div><div><p className="text-slate-400">Vendor</p><p className="mt-1 font-bold text-slate-900">{selectedOrder.vendor?.business_name || 'Not assigned yet'}</p></div></div><p className="text-xs text-slate-500">{selectedOrder.address.line}</p><div className="mt-5 flex items-center gap-2 text-xs font-bold text-slate-500"><Clock3 className="h-4 w-4" /> Order history loaded from backend</div></div></div>}</>
}
