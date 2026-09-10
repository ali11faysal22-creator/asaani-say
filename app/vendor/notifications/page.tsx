'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Wrench,
  ShieldCheck,
  User,
  Settings,
  Bell,
  Trash2,
  Calendar,
  MapPin,
  Phone,
  CheckCircle2,
  XCircle,
  CreditCard,
  CheckCheck,
  ChevronRight,
  Clock,
  RotateCcw,
  ArrowLeft,
  Info
} from 'lucide-react'
import { decideVendorBooking, fetchVendorNotifications } from '@/app/lib/booking-api'

export interface NotificationItem {
  id: string
  type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'payment'
  title: string
  message: string
  timestamp: string
  createdAt: string
  isRead: boolean
  customerName?: string
  customerPhone?: string
  location?: string
  service?: string
  subService?: string
  date?: string
  time?: string
  amount?: string
  bookingStatus?: 'pending' | 'accepted' | 'declined'
  bookingId?: string
}

const getInitialNotifications = (): NotificationItem[] => [
  {
    id: 'notif-101',
    type: 'booking_request',
    title: 'New Service Booking Request',
    message: 'A customer requested urgent service for Electrician - DB Panel Repairing.',
    timestamp: '2 mins ago',
    createdAt: '2026-08-20T00:02:00.000Z',
    isRead: false,
    customerName: 'Muhammad Ahmed',
    customerPhone: '+92 300 1234567',
    location: 'Gulberg III, Lahore',
    service: 'Electrician',
    subService: 'DB Panel Repair',
    date: '2026-08-20',
    time: '02:30 PM',
    amount: 'Rs. 2,500',
    bookingStatus: 'pending'
  },
  {
    id: 'notif-102',
    type: 'booking_request',
    title: 'New Service Booking Request',
    message: 'New request for AC Gas Refilling & Servicing.',
    timestamp: '8 mins ago',
    createdAt: '2026-08-20T00:08:00.000Z',
    isRead: false,
    customerName: 'Hamza Malik',
    customerPhone: '+92 312 4455667',
    location: 'Johar Town, Lahore',
    service: 'AC Repairing',
    subService: 'Gas Refilling',
    date: '2026-08-20',
    time: '04:00 PM',
    amount: 'Rs. 3,500',
    bookingStatus: 'pending'
  },
  {
    id: 'notif-103',
    type: 'booking_confirmed',
    title: 'Booking Confirmed',
    message: 'Fatima Sheikh confirmed your quote for AC Service.',
    timestamp: '25 mins ago',
    createdAt: '2026-08-20T00:25:00.000Z',
    isRead: false,
    customerName: 'Fatima Sheikh',
    customerPhone: '+92 321 9876543',
    location: 'DHA Phase 5, Lahore',
    service: 'AC Services',
    date: '2026-08-21',
    time: '11:00 AM',
    amount: 'Rs. 3,500'
  },
  {
    id: 'notif-104',
    type: 'payment',
    title: 'Payment Credited',
    message: 'Payment for Plumbing Pipe Leakage transferred to your wallet.',
    timestamp: '1 hour ago',
    createdAt: '2026-08-20T01:00:00.000Z',
    isRead: true,
    customerName: 'Usman Ali',
    service: 'Plumbing',
    amount: 'Rs. 2,800'
  },
  {
    id: 'notif-105',
    type: 'booking_cancelled',
    title: 'Booking Cancelled',
    message: 'Customer cancelled the Water Heater Repair service.',
    timestamp: '2 hours ago',
    createdAt: '2026-08-20T02:00:00.000Z',
    isRead: true,
    customerName: 'Zainab Bibi',
    service: 'Plumbing'
  }
]

export default function NotificationsPage() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null)
  const [filterTab, setFilterTab] = useState<'All' | 'Unread'>('All')

  useEffect(() => {
    let active = true
    const loadVendorNotifications = async () => {
      try {
        if (typeof window === 'undefined') return
        const auth = JSON.parse(localStorage.getItem('asaani_auth') || 'null')
        if (!auth || auth.role !== 'vendor') {
          setNotifications([])
          setSelectedNotif(null)
          return
        }

        const vendorId = auth.profile_id || auth.user_id
        const rows = await fetchVendorNotifications(vendorId)
        const mapped = rows.map((row) => {
          const bookingMatch = (row.body || '').match(/Booking ID:\s*([a-zA-Z0-9-]+)/i)
          const bookingId = bookingMatch?.[1]
          const requestMatch = (row.body || '').match(
            /^(.+?) requested (.+?) on (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})-(\d{2}:\d{2})\./i
          )
          const service = requestMatch?.[2] || undefined
          return {
            id: row.id,
            type: row.type === 'booking' ? 'booking_request' : 'booking_confirmed',
            title: row.title,
            message: row.body,
            timestamp: 'Just now',
            createdAt: new Date().toISOString(),
            isRead: row.is_read,
            customerName: requestMatch?.[1]?.trim(),
            service,
            date: requestMatch?.[3],
            time: requestMatch ? `${requestMatch[4]} - ${requestMatch[5]}` : undefined,
            bookingStatus: 'pending',
            bookingId,
          } as NotificationItem
        })

        if (!active) return
        setNotifications(mapped)
        if (mapped.length > 0 && !selectedNotif) {
          setSelectedNotif(mapped[0])
        }
      } catch (error) {
        console.error('Failed to load vendor notifications', error)
        setNotifications([])
        setSelectedNotif(null)
      }
    }

    loadVendorNotifications()
    const refreshTimer = window.setInterval(loadVendorNotifications, 5000)
    return () => {
      active = false
      window.clearInterval(refreshTimer)
    }
  }, [router, selectedNotif])

  const updateStorage = (updated: NotificationItem[]) => {
    setNotifications(updated)
  }

  const isRequestTimedOut = (item: NotificationItem): boolean => {
    if (item.type !== 'booking_request' || item.bookingStatus !== 'pending') return false
    const createdTime = new Date(item.createdAt).getTime()
    const currentTime = new Date().getTime()
    const diffInMinutes = (currentTime - createdTime) / (1000 * 60)
    return diffInMinutes >= 5
  }

  const handleSelectNotif = (item: NotificationItem) => {
    setSelectedNotif(item)
    if (!item.isRead) {
      const updated = notifications.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
      updateStorage(updated)
    }
  }

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }))
    updateStorage(updated)
  }

  const handleResetNotifications = () => {
    const init = getInitialNotifications()
    updateStorage(init)
    setSelectedNotif(null)
  }

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = notifications.filter(n => n.id !== id)
    if (selectedNotif?.id === id) setSelectedNotif(null)
    updateStorage(updated)
  }

  const handleBookingAction = async (id: string, status: 'accepted' | 'declined') => {
    try {
      const auth = JSON.parse(localStorage.getItem('asaani_auth') || 'null')
      const action = status === 'accepted' ? 'accept' : 'reject'
      const bookingId = selectedNotif?.bookingId || id
      if (!bookingId) {
        alert('This notification does not include a booking reference.')
        return
      }
      await decideVendorBooking(auth.profile_id || auth.user_id, bookingId, action)
      const updated = notifications.map(n => {
        if (n.id === id) {
          return { ...n, isRead: true, bookingStatus: status === 'accepted' ? 'accepted' : 'declined' as 'accepted' | 'declined' }
        }
        return n
      })
      if (selectedNotif && selectedNotif.id === id) {
        setSelectedNotif({ ...selectedNotif, isRead: true, bookingStatus: status === 'accepted' ? 'accepted' : 'declined' as 'accepted' | 'declined' })
      }
      updateStorage(updated)
    } catch (error) {
      console.error('Vendor booking decision failed', error)
      alert(error instanceof Error ? error.message : 'Unable to decide booking request')
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'Unread') return !n.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen w-full bg-white grid grid-cols-1 md:grid-cols-12 font-sans relative overflow-x-hidden">

      {/* LEFT SIDEBAR PANEL — same elegant dark panel as the Vendor Profile page */}
      <div className="md:col-span-4 lg:col-span-3 bg-[#3B3E56] text-white p-6 md:p-8 flex flex-col justify-between min-h-screen">
        <div>

          {/* ELEGANT BACK BUTTON */}
          <Link
            href="/vendor/dashboard"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-2 rounded-xl transition-all duration-200 mb-8 cursor-pointer backdrop-blur-sm shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-white transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Back </span>
          </Link>

          {/* LOGO */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-[#EE6C52] flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Asaani Say
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl lg:text-3xl font-extrabold leading-tight text-white">
              Manage Your <br />
              <span className="text-orange-500">Vendor Notifications</span>
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed font-normal">
              View and respond to real-time customer booking requests, payment updates, and service schedules,all in one place.
            </p>
          </div>

          {/* Instructions Box */}
          <div className="mt-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
            <div className="flex items-center gap-2 text-[#EE6C52] font-bold text-xs">
              <Info className="w-4 h-4" />
              How It Works
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              * <b>5-Minute Timeout:</b> Accept or Decline new booking requests within 5 minutes <b>Once the time runs out</b> the request will auto-expire. 
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-600/50 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#EE6C52] shrink-0" />
          <span>Your business dashboard is private and secure.</span>
        </div>
      </div>

      {/* RIGHT MAIN CONTENT AREA */}
      <div className="md:col-span-8 lg:col-span-9 bg-[#F8FAFC] min-h-screen overflow-y-auto">

        {/* Header Bar */}
        <header className="h-16 px-8 flex items-center justify-between border-b border-slate-200/80 bg-white/50 backdrop-blur-sm">
          <div className="text-xs font-medium text-slate-600">English</div>

          <div className="flex items-center gap-4">
            <Link href="/vendor/dashboard" className="text-xs font-bold text-slate-800 hover:text-[#EE6C52] transition">
              Dashboard
            </Link>
            <Link href="/vendor/settings" className="p-1.5 rounded-full hover:bg-slate-100 transition cursor-pointer">
              <Settings className="w-4 h-4 text-slate-600" />
            </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 space-y-6">
          {/* Section Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-2xl font-extrabold text-[#EE6C52] tracking-tight">
                Alerts & Activity
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                View real-time customer booking alerts, schedule updates, and payment details.
              </p>
            </div>

            <button
              onClick={handleResetNotifications}
              title="Reset List Data"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset List
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200/80 shadow-xs flex-wrap gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {(['All', 'Unread'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    filterTab === tab
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {tab} {tab === 'Unread' && unreadCount > 0 && `(${unreadCount})`}
                </button>
              ))}
            </div>

            <button
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 border rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer ${
                unreadCount > 0
                  ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
                  : 'bg-slate-50 border-slate-200/60 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCheck className={`w-4 h-4 ${unreadCount > 0 ? 'text-[#EE6C52]' : 'text-slate-300'}`} />
              Mark all as read
            </button>
          </div>

          {/* Notifications Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* List */}
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {filteredNotifications.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map(item => {
                  const isSelected = selectedNotif?.id === item.id
                  const timedOut = isRequestTimedOut(item)

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleSelectNotif(item)}
                      className={`p-4 md:p-5 transition cursor-pointer flex items-start gap-4 ${
                        isSelected
                          ? 'bg-[#fff0eb]/40 border-l-4 border-l-[#EE6C52]'
                          : !item.isRead
                          ? 'bg-slate-50/80'
                          : 'hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/60 flex items-center justify-center shrink-0 mt-0.5">
                        {item.type === 'booking_request' && <Wrench className="w-4 h-4 text-[#EE6C52]" />}
                        {item.type === 'booking_confirmed' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {item.type === 'booking_cancelled' && <XCircle className="w-4 h-4 text-rose-600" />}
                        {item.type === 'payment' && <CreditCard className="w-4 h-4 text-emerald-600" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className={`text-xs ${!item.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                              {item.title}
                            </h3>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-[#EE6C52] shrink-0" />
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                            {item.timestamp}
                          </span>
                        </div>

                        <p className="text-xs text-slate-500 line-clamp-1">{item.message}</p>

                        <div className="flex items-center gap-2 pt-1">
                          {item.service && (
                            <span className="text-[10px] font-semibold bg-[#fff0eb] text-[#EE6C52] px-2 py-0.5 rounded-md">
                              {item.service}
                            </span>
                          )}
                          {timedOut && (
                            <span className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                              <Clock className="w-3 h-3" /> Timed Out
                            </span>
                          )}
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 self-center" />
                    </div>
                  )
                })
              )}
            </div>

            {/* Details View Side-Panel */}
            <div className="lg:col-span-5">
              {selectedNotif ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-5 shadow-xs sticky top-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <span className="text-xs font-bold text-[#EE6C52] bg-[#fff0eb] px-2.5 py-1 rounded-lg">
                      {selectedNotif.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{selectedNotif.timestamp}</span>
                      <button
                        onClick={e => handleDelete(selectedNotif.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">{selectedNotif.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed bg-[#f8f9fc] p-3 rounded-xl border border-slate-100">
                      {selectedNotif.message}
                    </p>
                  </div>

                  {selectedNotif.customerName && (
                    <div className="bg-white border border-slate-200/80 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900">{selectedNotif.service}</span>
                        <span className="text-xs font-bold bg-[#e6f7ef] text-[#10b981] px-2.5 py-0.5 rounded-full">
                          ACTIVE
                        </span>
                      </div>

                      <div className="space-y-2 text-xs pt-1">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-slate-400" /> Customer</span>
                          <span className="font-semibold text-slate-800">{selectedNotif.customerName}</span>
                        </div>
                        {selectedNotif.customerPhone && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> Contact</span>
                            <span className="font-medium text-[#EE6C52]">{selectedNotif.customerPhone}</span>
                          </div>
                        )}
                        {selectedNotif.location && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> Location</span>
                            <span className="font-medium text-slate-700">{selectedNotif.location}</span>
                          </div>
                        )}
                        {selectedNotif.date && (
                          <div className="flex items-center justify-between text-slate-600">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Date & Time</span>
                            <span className="font-medium text-slate-800">{selectedNotif.date} @ {selectedNotif.time}</span>
                          </div>
                        )}
                        {selectedNotif.amount && (
                          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-slate-800">
                            <span className="font-semibold">Estimated Price</span>
                            <span className="font-bold text-[#EE6C52]">{selectedNotif.amount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions & Timeout Logic */}
                  {selectedNotif.type === 'booking_request' && (
                    <div className="pt-2">
                      {isRequestTimedOut(selectedNotif) ? (
                        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-center space-y-1">
                          <p className="text-xs font-bold text-rose-600 flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4" /> TIME OUT (Request Expired)
                          </p>
                          <p className="text-[11px] text-rose-500">
                            Yeh booking request 5 minute mein accept na hone par expire ho chuki hai.
                          </p>
                        </div>
                      ) : selectedNotif.bookingStatus === 'pending' ? (
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleBookingAction(selectedNotif.id, 'accepted')}
                            className="flex-1 py-2.5 bg-[#EE6C52] hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer text-center"
                          >
                            Accept Booking
                          </button>
                          <button
                            onClick={() => handleBookingAction(selectedNotif.id, 'declined')}
                            className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer text-center"
                          >
                            Decline
                          </button>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-100 rounded-xl text-center text-xs font-bold text-slate-700">
                          STATUS: {selectedNotif.bookingStatus?.toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-2 shadow-xs">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">Select a Notification</p>
                  <p className="text-[11px] text-slate-400">Click any item on the left panel to inspect details.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}