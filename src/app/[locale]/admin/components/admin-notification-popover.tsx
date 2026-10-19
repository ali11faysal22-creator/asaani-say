'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Bell, Check, Clock } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'
import { fetchAdminNotifications, getStoredAuth, markAdminNotificationRead } from '@/app/lib/booking-api'
import { playNotificationSound } from '@/app/lib/notification-sound'
import { useLanguage } from '../../lib/i18n'

interface NotificationItem {
  id: string
  title: string
  detail?: string
  time: string
  unread: boolean
  highPriority: boolean
  bookingId?: string
}

export default function AdminNotificationPopover() {
  const { t } = useLanguage()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const previousUnreadIds = useRef<Set<string> | null>(null)

  useEffect(() => {
    let active = true
    const loadNotifications = async () => {
      try {
        const auth = getStoredAuth('admin')
        if (!auth || auth.role !== 'admin') return
        const rows = await fetchAdminNotifications()
        if (!active) return
        const uniqueRows = rows.filter((row, index, items) => index === items.findIndex((candidate) => candidate.title === row.title && candidate.body === row.body && candidate.type === row.type))
        const sorted = [...uniqueRows].sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())

        const unreadIds = sorted.filter((row) => !row.is_read).map((row) => row.id)
        if (previousUnreadIds.current !== null && unreadIds.some((id) => !previousUnreadIds.current!.has(id))) {
          playNotificationSound()
        }
        previousUnreadIds.current = new Set(unreadIds)

        setNotifications(sorted.slice(0, 8).map((row) => {
          const highPriority = row.title.startsWith('HIGH PRIORITY:')
          const bookingId = highPriority ? row.body.match(/Booking ID:\s*([a-zA-Z0-9-]+)/)?.[1] : undefined
          const detail = highPriority ? row.body.match(/Message:\s*([^\r\n]+)/)?.[1] : undefined
          return {
            id: row.id,
            title: highPriority ? 'Service problem reported' : row.body,
            detail,
            time: row.created_at ? new Date(row.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : 'Just now',
            unread: !row.is_read,
            highPriority,
            bookingId,
          }
        }))
      } catch (error) {
        console.warn('Unable to load admin notifications', error)
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
    await Promise.all(notifications.filter((item) => item.unread).map((item) => markAdminNotificationRead(item.id).catch(() => undefined)))
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
  }

  const handleMarkSingleAsRead = async (id: string) => {
    const notification = notifications.find((item) => item.id === id)
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, unread: false } : item))
    await markAdminNotificationRead(id).catch(() => undefined)
    if (notification?.bookingId) {
      setIsOpen(false)
      router.push(`/admin/bookings?booking=${encodeURIComponent(notification.bookingId)}`)
    }
  }

  return (
    <div className="relative inline-block text-start font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -end-1 w-2.5 h-2.5 bg-[#EE6C52] rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute end-0 mt-3 w-85 sm:w-95 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
            <div className="absolute -top-2 end-3.5 w-4 h-4 bg-white rotate-45 border-s border-t border-slate-100" />

            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 relative bg-white">
              <h3 className="text-sm font-extrabold text-[#1E2337]">{t('Notifications')}</h3>
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-[#EE6C52] hover:underline cursor-pointer disabled:opacity-40"
                disabled={notifications.length === 0}
              >
                {t('Mark all as read')}
              </button>
            </div>

            <div className="max-h-105 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">{t('No new notifications')}</div>
              ) : (
                notifications.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => void handleMarkSingleAsRead(item.id)}
                    className={`w-full px-5 py-3.5 flex items-start gap-3.5 text-start transition hover:bg-slate-50 cursor-pointer group ${item.highPriority ? 'bg-rose-50/60' : ''}`}
                    title={t(item.bookingId ? 'Open booking details' : 'Click to mark as read')}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${item.highPriority ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-[#EE6C52]'}`}>
                      {item.highPriority ? <AlertTriangle className="w-4 h-4" /> : item.unread ? <Clock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs leading-snug ${item.highPriority ? 'font-extrabold text-rose-700' : item.unread ? 'font-extrabold text-[#1E2337]' : 'font-semibold text-slate-600'}`}>
                        {t(item.title)}
                      </h4>
                      {item.detail && <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">{item.detail}</p>}
                      <span className="text-[10px] font-medium text-slate-400 mt-1 block">{item.time === 'Just now' ? t('Just now') : item.time}</span>
                    </div>
                    {item.highPriority && <div className="w-2 h-2 rounded-full bg-rose-600 shrink-0 mt-1.5" />}
                    {!item.highPriority && item.unread && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 group-hover:bg-slate-400" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
