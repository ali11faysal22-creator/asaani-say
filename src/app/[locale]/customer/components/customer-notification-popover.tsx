'use client'

import { Link } from '@/i18n/navigation'
import { useEffect, useRef, useState } from 'react'
import { Bell, Check, CheckCheck, Clock } from 'lucide-react'
import { fetchCustomerNotifications, getStoredAuth, markAllCustomerNotificationsRead, markCustomerNotificationRead } from '@/app/lib/booking-api'
import { playNotificationSound } from '@/app/lib/notification-sound'
import { useLanguage } from '@/app/lib/i18n'

interface NotificationItem {
  id: string
  title: string
  time: string
  unread: boolean
}

export default function CustomerNotificationPopover() {
  const { language, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)
  const [markAllError, setMarkAllError] = useState('')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const previousUnreadIds = useRef<Set<string> | null>(null)

  useEffect(() => {
    let active = true
    const loadNotifications = async () => {
      try {
        const auth = getStoredAuth('customer')
        if (!auth || auth.role !== 'customer' || !auth.profile_id) return
        const rows = await fetchCustomerNotifications(auth.profile_id)
        if (!active) return
        const uniqueRows = rows.filter((row, index, items) => index === items.findIndex((candidate) => candidate.title === row.title && candidate.body === row.body && candidate.type === row.type))
        const sorted = [...uniqueRows].sort((a, b) => new Date(b.created_at || b.createdAt || 0).getTime() - new Date(a.created_at || a.createdAt || 0).getTime())

        const unreadIds = sorted.filter((row) => !row.is_read).map((row) => row.id)
        if (previousUnreadIds.current !== null && unreadIds.some((id) => !previousUnreadIds.current!.has(id))) {
          playNotificationSound()
        }
        previousUnreadIds.current = new Set(unreadIds)

        setNotifications(sorted.slice(0, 8).map((row) => ({
          id: row.id,
          title: row.body,
          time: (row.created_at || row.createdAt) ? new Date(row.created_at || row.createdAt || '').toLocaleString(language === 'ur' ? 'ur-PK' : undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : t('Just now'),
          unread: !row.is_read,
        })))
      } catch (error) {
        console.warn('Unable to load customer notifications', error)
      }
    }
    loadNotifications()
    const refreshTimer = window.setInterval(loadNotifications, 5000)
    return () => {
      active = false
      window.clearInterval(refreshTimer)
    }
  }, [language, t])

  const unreadCount = notifications.filter((n) => n.unread).length

  const handleMarkAllAsRead = async () => {
    const auth = getStoredAuth('customer')
    if (!auth?.profile_id || isMarkingAll || unreadCount === 0) return

    setIsMarkingAll(true)
    setMarkAllError('')
    try {
      await markAllCustomerNotificationsRead(auth.profile_id)
      setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
    } catch (error) {
      console.warn('Unable to mark all customer notifications as read', error)
      setMarkAllError(t('Unable to mark all notifications as read. Please try again.'))
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleMarkSingleAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, unread: false } : item))
    const auth = getStoredAuth('customer')
    if (auth?.profile_id) await markCustomerNotificationRead(auth.profile_id, id).catch(() => undefined)
  }

  return (
    <div dir={language === 'ur' ? 'rtl' : 'ltr'} className="relative inline-block font-sans">
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

          <div className={`fixed start-1/2 top-20 z-50 w-[calc(100vw-1.5rem)] max-w-95 -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl md:absolute md:end-0 md:start-auto md:top-full md:mt-3 md:w-85 md:max-w-[calc(100vw-1.5rem)] md:translate-x-0 ${language === 'ur' ? 'text-end' : 'text-start'}`}>
            <div className="absolute -top-2 end-3.5 hidden h-4 w-4 rotate-45 border-s border-t border-slate-100 bg-white md:block" />

            <div className="relative flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-3 sm:px-5 sm:py-4">
              <h3 className="shrink-0 text-sm font-extrabold leading-tight text-[#1E2337]">{t('Notifications')}</h3>
              <button
                type="button"
                onClick={() => void handleMarkAllAsRead()}
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-2.5 py-1.5 text-[9px] font-bold text-slate-800 shadow-sm transition-colors hover:border-orange-200 hover:bg-orange-50 hover:text-slate-900 sm:px-3 sm:text-[10px] disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:border-slate-200 disabled:hover:bg-white disabled:hover:text-slate-800"
                disabled={isMarkingAll || unreadCount === 0}
              >
                <CheckCheck className="h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden="true" />
                {isMarkingAll ? t('Marking...') : t('Mark all as read')}
              </button>
            </div>
            {markAllError && <p role="alert" className="border-b border-red-100 bg-red-50 px-4 py-2 text-[11px] font-medium text-red-700">{markAllError}</p>}

            <div className="max-h-105 overflow-y-auto divide-y divide-slate-50">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">{t('No new notifications')}</div>
              ) : (
                notifications.map((item) => (
                  <Link
                    key={item.id}
                    href="/customer/notifications"
                    onClick={() => {
                      setIsOpen(false)
                      if (item.unread) void handleMarkSingleAsRead(item.id)
                    }}
                    className="group flex items-start gap-3.5 px-5 py-3.5 transition hover:bg-slate-50"
                  >
                    <div className="w-9 h-9 rounded-full bg-orange-100 text-[#EE6C52] flex items-center justify-center shrink-0 mt-0.5">
                      {item.unread ? <Clock className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs leading-snug ${item.unread ? 'font-extrabold text-[#1E2337]' : 'font-semibold text-slate-600'}`}>
                        {t(item.title)}
                      </h4>
                      <span className="text-[10px] font-medium text-slate-400 mt-1 block">{item.time}</span>
                    </div>
                    {item.unread && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 group-hover:bg-slate-400" />}
                  </Link>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center">
              <Link
                href="/customer/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-bold text-slate-600 hover:text-[#1E2337] transition cursor-pointer block"
              >
                {t('See all notifications')}
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
