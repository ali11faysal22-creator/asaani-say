'use client'

import React, { useState, useEffect } from 'react'
import {
  Wrench,
  User,
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
  X
} from 'lucide-react'
import { decideVendorBooking, deleteVendorNotification, fetchVendorBookings, fetchVendorNotifications, getStoredAuth, markVendorNotificationRead, updateVendorBookingStatus, type BookingResult } from '@/app/lib/booking-api'

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
  bookingStatus?: 'pending' | 'accepted' | 'declined' | 'on_the_way' | 'in_progress' | 'completed'
  bookingId?: string
  booking?: BookingResult
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [selectedNotif, setSelectedNotif] = useState<NotificationItem | null>(null)
  const [filterTab, setFilterTab] = useState<'All' | 'Unread'>('All')
  const [actionInProgress, setActionInProgress] = useState(false)
  const [assignmentConflict, setAssignmentConflict] = useState<NotificationItem | null>(null)

  useEffect(() => {
    let active = true
    const loadVendorNotifications = async () => {
      try {
        if (typeof window === 'undefined') return
        const auth = getStoredAuth('vendor')
        if (!auth || auth.role !== 'vendor') {
          setNotifications([])
          setSelectedNotif(null)
          return
        }

        const vendorId = auth.profile_id || auth.user_id
        const [rows, bookings] = await Promise.all([
          fetchVendorNotifications(vendorId),
          fetchVendorBookings(vendorId),
        ])
        const bookingsById = new Map(bookings.map((booking) => [booking.id, booking]))
        const uniqueRows = rows.filter((row, index, items) => index === items.findIndex((candidate) => candidate.title === row.title && candidate.body === row.body && candidate.type === row.type))
        const mapped = uniqueRows.map((row) => {
          const bookingMatch = (row.body || '').match(/Booking ID:\s*([a-zA-Z0-9-]+)/i)
          const bookingId = bookingMatch?.[1]
          const requestMatch = (row.body || '').match(
            /^(.+?) requested (.+?) on (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})-(\d{2}:\d{2})\./i
          )
          const service = requestMatch?.[2] || undefined
          const booking = bookingId ? bookingsById.get(bookingId) : undefined
          const isDeclinedNotice = row.title.toLowerCase().includes('declined')
          const bookingStatus = isDeclinedNotice || booking?.status === 'rejected'
            ? 'declined'
            : booking?.status === 'accepted' || booking?.status === 'on_the_way' || booking?.status === 'in_progress' || booking?.status === 'completed'
              ? booking.status
              : 'pending'
          return {
            id: row.id,
            type: isDeclinedNotice ? 'booking_cancelled' : row.type === 'booking' ? 'booking_request' : 'booking_confirmed',
            title: row.title,
            message: row.body,
            timestamp: row.created_at ? new Date(row.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : 'Just now',
            createdAt: row.created_at || new Date().toISOString(),
            isRead: row.is_read,
            customerName: requestMatch?.[1]?.trim(),
            service,
            date: requestMatch?.[3],
            time: requestMatch ? `${requestMatch[4]} - ${requestMatch[5]}` : undefined,
            bookingStatus,
            bookingId,
            booking,
            customerPhone: booking?.customer_phone || undefined,
            location: booking?.address?.line,
            amount: booking?.total_amount != null ? `Rs. ${booking.total_amount.toLocaleString()}` : undefined,
          } as NotificationItem
        })

        if (!active) return
        setNotifications(mapped)
        setSelectedNotif((previous) => {
          if (previous && mapped.some((item) => item.id === previous.id)) return previous
          return mapped[0] || null
        })
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
  }, [])

  const updateStorage = (updated: NotificationItem[]) => {
    setNotifications(updated)
  }

  const handleSelectNotif = async (item: NotificationItem) => {
    setSelectedNotif(item)
    if (!item.isRead) {
      const updated = notifications.map(n => (n.id === item.id ? { ...n, isRead: true } : n))
      updateStorage(updated)
      const auth = getStoredAuth('vendor')
      if (auth?.profile_id) {
        await markVendorNotificationRead(auth.profile_id, item.id).catch(() => undefined)
      }
    }
  }

  const handleMarkAllAsRead = async () => {
    const updated = notifications.map(n => ({ ...n, isRead: true }))
    updateStorage(updated)
    const auth = getStoredAuth('vendor')
    if (auth?.profile_id) {
      await Promise.all(notifications.filter((item) => !item.isRead).map((item) => markVendorNotificationRead(auth.profile_id, item.id).catch(() => undefined)))
    }
  }

  const handleDelete = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    const updated = notifications.filter(n => n.id !== id)
    if (selectedNotif?.id === id) setSelectedNotif(null)
    updateStorage(updated)
    const auth = getStoredAuth('vendor')
    if (auth?.profile_id) {
      await deleteVendorNotification(auth.profile_id, id).catch(() => undefined)
    }
  }

  const handleBookingAction = async (id: string, status: 'accepted' | 'declined') => {
    if (actionInProgress) return
    setActionInProgress(true)
    try {
      const auth = getStoredAuth('vendor')
      if (!auth) {
        alert('Vendor session expired. Please sign in again.')
        return
      }
      const action = status === 'accepted' ? 'accept' : 'reject'
      const bookingId = selectedNotif?.bookingId || id
      if (!bookingId) {
        alert('This notification does not include a booking reference.')
        return
      }
      const updatedBooking = await decideVendorBooking(auth.profile_id || auth.user_id, bookingId, action)
      const updated = notifications.map(n => {
        if (n.id === id) {
          return {
            ...n,
            isRead: true,
            booking: updatedBooking,
            customerPhone: updatedBooking.customer_phone || undefined,
            location: updatedBooking.address.line,
            amount: updatedBooking.total_amount != null ? `Rs. ${updatedBooking.total_amount.toLocaleString()}` : n.amount,
            bookingStatus: updatedBooking.status as NotificationItem['bookingStatus']
          }
        }
        return n
      })
      if (selectedNotif && selectedNotif.id === id) {
        setSelectedNotif({ ...selectedNotif, isRead: true, booking: updatedBooking, bookingId: updatedBooking.id, bookingStatus: updatedBooking.status as NotificationItem['bookingStatus'] })
      }
      updateStorage(updated)
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('assigned to another vendor') ||
        error.message.includes('already been decided')
      )) {
        const staleNotification = notifications.find((item) => item.id === id) || selectedNotif
        setAssignmentConflict(staleNotification || null)
        setNotifications((items) => items.filter((item) => item.id !== id))
        setSelectedNotif((item) => item?.id === id ? null : item)
      } else {
        console.error('Vendor booking decision failed', error)
        alert(error instanceof Error ? error.message : 'Unable to decide booking request')
      }
    } finally {
      setActionInProgress(false)
    }
  }

  const handleTrackingStatus = async (action: 'on_the_way' | 'in_progress' | 'completed') => {
    const auth = getStoredAuth('vendor')
    const bookingId = selectedNotif?.bookingId
    if (!auth?.profile_id || !bookingId || !selectedNotif?.booking) return
    setActionInProgress(true)
    try {
      const updatedBooking = await updateVendorBookingStatus(auth.profile_id, bookingId, action)
      setSelectedNotif((item) => item ? { ...item, booking: updatedBooking } : item)
      setNotifications((items) => items.map((item) => item.bookingId === bookingId ? { ...item, booking: updatedBooking } : item))
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Unable to update tracking status')
    } finally {
      setActionInProgress(false)
    }
  }

  const filteredNotifications = notifications.filter(n => {
    if (filterTab === 'Unread') return !n.isRead
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <>
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

          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
              {filteredNotifications.length === 0 ? (
                <div className="py-16 text-center space-y-2">
                  <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">No notifications found</p>
                </div>
              ) : (
                filteredNotifications.map(item => {
                  const isSelected = selectedNotif?.id === item.id
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
                        </div>
                      </div>

                      <ChevronRight className="w-4 h-4 text-slate-300 self-center" />
                    </div>
                  )
                })
              )}
            </div>

            
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

                  
                  {selectedNotif.type === 'booking_request' && (
                    <div className="pt-2">
                      {selectedNotif.bookingStatus === 'pending' ? (
                        <div className="flex items-center gap-3">
                          <button
                            disabled={actionInProgress}
                            onClick={() => handleBookingAction(selectedNotif.id, 'accepted')}
                            className="flex-1 py-2.5 bg-[#EE6C52] hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer text-center"
                          >
                            Accept Booking
                          </button>
                          <button
                            disabled={actionInProgress}
                            onClick={() => handleBookingAction(selectedNotif.id, 'declined')}
                            className="flex-1 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 disabled:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer text-center"
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
                  {selectedNotif.booking && ['accepted', 'on_the_way', 'in_progress'].includes(selectedNotif.booking.status) && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Customer tracking</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedNotif.booking.status === 'accepted' && <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('on_the_way')} className="rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Mark on the way</button>}
                        {selectedNotif.booking.status === 'on_the_way' && <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('in_progress')} className="rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Mark arrived</button>}
                        {selectedNotif.booking.status === 'in_progress' && <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('completed')} className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Complete order</button>}
                      </div>
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

      {assignmentConflict && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true" aria-labelledby="assignment-conflict-title">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setAssignmentConflict(null)}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close notification"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="pr-8">
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <XCircle className="h-6 w-6" />
              </div>
              <h2 id="assignment-conflict-title" className="text-lg font-extrabold text-slate-900">
                This booking is assigned to another vendor
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                This request was reassigned because it was declined or timed out. It is no longer available for your account.
              </p>
            </div>

            <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Order</span>
                <span className="text-right font-bold text-slate-800">{assignmentConflict.service || 'Service booking'}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-500">Booking ID</span>
                <span className="text-right font-semibold text-slate-800">{assignmentConflict.bookingId || 'Unavailable'}</span>
              </div>
              {assignmentConflict.customerName && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Customer</span>
                  <span className="text-right font-semibold text-slate-800">{assignmentConflict.customerName}</span>
                </div>
              )}
              {assignmentConflict.date && (
                <div className="flex items-center justify-between gap-4">
                  <span className="text-slate-500">Date & time</span>
                  <span className="text-right font-semibold text-slate-800">{assignmentConflict.date} @ {assignmentConflict.time}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setAssignmentConflict(null)}
              className="mt-5 w-full rounded-xl bg-[#EE6C52] py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}