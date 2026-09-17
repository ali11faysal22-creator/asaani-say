'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Bell, Check, Clock } from 'lucide-react'
import { fetchVendorNotifications, getStoredAuth, markVendorNotificationRead } from '@/app/lib/booking-api'

type NotificationCategory = 'USER REQUESTS' | 'ORDER COMPLETED' | 'ORDER PENDING'
type NotificationVisual =
  | { kind: 'avatar'; src: string }
  | { kind: 'check' }
  | { kind: 'clock' }

interface NotificationItem {
  id: string
  category: NotificationCategory
  title: string
  time: string
  unread: boolean
  visual: NotificationVisual
}

const CATEGORY_ORDER: NotificationCategory[] = [
  'USER REQUESTS',
  'ORDER COMPLETED',
  'ORDER PENDING',
]

export default function NotificationPopover() {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    let active = true
    const loadNotifications = async () => {
      try {
        const auth = getStoredAuth('vendor')
        if (!auth || auth.role !== 'vendor') return
        const rows = await fetchVendorNotifications(auth.profile_id || auth.user_id)
        if (!active) return
        const uniqueRows = rows.filter((row, index, items) => index === items.findIndex((candidate) => candidate.title === row.title && candidate.body === row.body && candidate.type === row.type))
        setNotifications(uniqueRows.map((row) => ({
          id: row.id,
          category: row.type === 'booking' ? 'USER REQUESTS' : 'ORDER PENDING',
          title: row.type === 'booking' ? row.body : row.title,
          time: row.created_at ? new Date(row.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : 'Just now',
          unread: !row.is_read,
          visual: { kind: 'clock' },
        })))
      } catch (error) {
        console.warn('Unable to load dashboard notifications', error)
      }
    }
    loadNotifications()
    const refreshTimer = window.setInterval(loadNotifications, 5000)
    return () => {
      active = false
      window.clearInterval(refreshTimer)
    }
  }, [])

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkAllAsRead = async () => {
    const auth = getStoredAuth('vendor')
    if (auth?.profile_id) {
      await Promise.all(notifications.filter((item) => item.unread).map((item) => markVendorNotificationRead(auth.profile_id, item.id).catch(() => undefined)))
    }
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
  }

  const handleMarkSingleAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, unread: false } : item))
    const auth = getStoredAuth('vendor')
    if (auth?.profile_id) await markVendorNotificationRead(auth.profile_id, id).catch(() => undefined)
  }

  const groupedNotifications = CATEGORY_ORDER.map((category) => ({
    category,
    items: notifications.filter((n) => n.category === category),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="relative inline-block text-left font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EE6C52] rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-3 w-85 sm:w-95 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
            <div className="absolute -top-2 right-3.5 w-4 h-4 bg-white rotate-45 border-l border-t border-slate-100" />

            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 relative bg-white">
              <h3 className="text-sm font-extrabold text-[#1E2337]">Notifications</h3>
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-[#EE6C52] hover:underline cursor-pointer disabled:opacity-40"
                disabled={notifications.length === 0}
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-105 overflow-y-auto">
              {groupedNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">No new notifications</div>
              ) : (
                groupedNotifications.map((group) => (
                  <div key={group.category}>
                    <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase whitespace-nowrap">
                        {group.category}
                      </span>
                      <span className="h-px bg-slate-100 flex-1" />
                    </div>

                    <div className="divide-y divide-slate-50">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => void handleMarkSingleAsRead(item.id)}
                          className="px-5 py-3.5 flex items-start gap-3.5 transition hover:bg-slate-50 cursor-pointer group"
                          title="Click to mark as read"
                        >
                          {item.visual.kind === 'avatar' ? (
                            <img src={item.visual.src} alt="" className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 bg-slate-100" />
                          ) : item.visual.kind === 'check' ? (
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-4 h-4" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-orange-100 text-[#EE6C52] flex items-center justify-center shrink-0 mt-0.5">
                              <Clock className="w-4 h-4" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4 className={`text-xs leading-snug ${item.unread ? 'font-extrabold text-[#1E2337]' : 'font-semibold text-slate-600'}`}>
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-medium text-slate-400 mt-1 block">{item.time}</span>
                          </div>

                          {item.unread && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 group-hover:bg-slate-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center">
              <Link
                href="/vendor/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-slate-600 hover:text-[#1E2337] transition cursor-pointer block"
              >
                See all notifications
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
