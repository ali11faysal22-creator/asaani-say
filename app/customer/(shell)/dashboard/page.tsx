'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Bell, CalendarClock, Check, CheckCircle2, ClipboardList, Clock3, Navigation, XCircle } from 'lucide-react'
import { fetchCustomerBookings, fetchCustomerNotifications, formatSlotLabel, getCurrentUser, markCustomerNotificationRead, type BookingResult, type CustomerNotification } from '@/app/lib/booking-api'
import { CHART_BLUE, STATUS_CRITICAL, STATUS_GOOD, STATUS_WARNING } from '@/app/components/charts/palette'
import { StatTile } from '@/app/components/charts/stat-tile'
import { StatusStackedBar } from '@/app/components/charts/status-stacked-bar'
import { RankedBarList } from '@/app/components/charts/ranked-bar-list'

function bucketForStatus(status: string): 'pending' | 'active' | 'completed' | 'cancelled' {
  if (status === 'completed') return 'completed'
  if (status === 'pending') return 'pending'
  if (status === 'rejected' || status === 'cancelled') return 'cancelled'
  return 'active'
}

const statusLabel = (status: string) =>
  status === 'accepted' ? 'Confirmed' : status === 'on_the_way' ? 'Vendor on the way' : status === 'in_progress' ? 'Vendor arrived' : status === 'completed' ? 'Completed' : status === 'rejected' ? 'Vendor declined' : 'Waiting for vendor'

export default function CustomerDashboardPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<BookingResult[]>([])
  const [notifications, setNotifications] = useState<CustomerNotification[]>([])
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(true)
  const [customerName, setCustomerName] = useState('')

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const auth = await getCurrentUser('customer')
        if (auth.role !== 'customer') {
          router.push('/customer/login')
          return
        }
        if (active) setCustomerName(auth.email?.split('@')[0] || 'there')
        if (auth.profile_id) {
          setCustomerId(auth.profile_id)
          const [bookingData, notificationData] = await Promise.all([
            fetchCustomerBookings(auth.profile_id),
            fetchCustomerNotifications(auth.profile_id).catch(() => []),
          ])
          if (active) {
            setOrders(bookingData)
            const uniqueNotifications = notificationData.filter((item, index, items) => index === items.findIndex((candidate) => candidate.title === item.title && candidate.body === item.body && candidate.type === item.type))
            setNotifications(uniqueNotifications.sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime()))
          }
        }
      } catch {
        router.push('/customer/login')
        return
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [router])

  const markNotificationRead = async (id: string) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, is_read: true } : item))
    if (customerId) await markCustomerNotificationRead(customerId, id).catch(() => undefined)
  }

  const stats = useMemo(() => {
    const total = orders.length
    const pending = orders.filter((o) => bucketForStatus(o.status) === 'pending').length
    const active = orders.filter((o) => bucketForStatus(o.status) === 'active').length
    const completed = orders.filter((o) => bucketForStatus(o.status) === 'completed').length
    const cancelled = orders.filter((o) => bucketForStatus(o.status) === 'cancelled').length
    return { total, pending, active, completed, cancelled }
  }, [orders])

  const topServices = useMemo<[string, number][]>(() => {
    const counts = new Map<string, number>()
    orders.forEach((o) => counts.set(o.service_name, (counts.get(o.service_name) || 0) + 1))
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5)
  }, [orders])

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 5),
    [orders]
  )

  const canTrack = (order: BookingResult) => ['accepted', 'on_the_way', 'in_progress', 'completed'].includes(order.status)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <p className="text-sm font-bold text-slate-700">Welcome back, {customerName}</p>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatTile label="Total Orders" value={stats.total} icon={ClipboardList} />
        <StatTile label="In Progress" value={stats.pending + stats.active} icon={CalendarClock} />
        <StatTile label="Completed" value={stats.completed} icon={CheckCircle2} />
        <StatTile label="Cancelled" value={stats.cancelled} icon={XCircle} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
        <div className="lg:col-span-3">
          <RankedBarList title="Most Booked Services" subtitle="Your top requested services" data={topServices} emptyText="No bookings yet." />
        </div>
        <div className="lg:col-span-2">
          <StatusStackedBar
            title="Order Status"
            subtitle={`Share of all ${stats.total} orders`}
            total={stats.total}
            emptyText="No orders yet."
            segments={[
              { key: 'completed', label: 'Completed', value: stats.completed, color: STATUS_GOOD },
              { key: 'active', label: 'In Progress', value: stats.active, color: CHART_BLUE },
              { key: 'pending', label: 'Pending', value: stats.pending, color: STATUS_WARNING },
              { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, color: STATUS_CRITICAL },
            ]}
          />
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">Notifications</h2>
          <Link href="/customer/notifications" className="text-xs font-bold text-orange-600 hover:text-orange-700">
            View all notifications
          </Link>
        </div>

        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <Bell className="mx-auto h-6 w-6 text-slate-300" />
            <p className="mt-2 text-xs font-bold text-slate-500">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.slice(0, 5).map((item) => (
              <div
                key={item.id}
                onClick={() => !item.is_read && void markNotificationRead(item.id)}
                className={`flex items-start gap-3 rounded-2xl border bg-white p-4 shadow-sm transition ${
                  item.is_read ? 'border-slate-200' : 'border-orange-200 bg-orange-50/30 cursor-pointer hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                <div className="rounded-xl bg-orange-100 p-2 text-orange-600 shrink-0">
                  {item.is_read ? <Check className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs leading-snug ${item.is_read ? 'font-semibold text-slate-600' : 'font-extrabold text-slate-900'}`}>{item.body}</p>
                  <p className="mt-1 text-[10px] text-slate-400">
                    {(item.created_at || item.createdAt) ? new Date(item.created_at || item.createdAt || '').toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : 'Just now'}
                  </p>
                </div>
                {!item.is_read && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-extrabold text-slate-900">Recent orders</h2>
          <Link href="/customer/orders" className="text-xs font-bold text-orange-600 hover:text-orange-700">
            View all orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Clock3 className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-700">No orders yet</p>
            <Link href="/services" className="mt-4 inline-block text-xs font-bold text-orange-500">
              Browse services
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-slate-400">Order #{order.id}</p>
                    <p className="mt-0.5 font-extrabold text-slate-900">{order.service_name}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {order.date} · {formatSlotLabel(order.slot_start)} - {formatSlotLabel(order.slot_end)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${
                        order.status === 'accepted' || order.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : order.status === 'rejected' || order.status === 'cancelled'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-orange-50 text-orange-600'
                      }`}
                    >
                      {statusLabel(order.status)}
                    </span>
                    {canTrack(order) && (
                      <Link
                        href={`/customer/tracking/${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-[10px] font-bold text-white hover:bg-orange-600"
                      >
                        <Navigation className="h-3.5 w-3.5" /> Track
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
