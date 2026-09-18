'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchCustomerBookings, getCurrentUser } from '../lib/booking-api'
import { 
  Camera, 
  LayoutGrid, 
  Hand, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck,
  Timer,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const CUSTOMER_REQUEST_TIMEOUT_SECONDS = 180

interface CartItem {
  id: string
  title: string
  subtitle?: string
  numericPrice: number
  quantity: number
}

interface OrderData {
  orderId: string
  items: CartItem[]
  bookingDetails: {
    fullName: string
    phone: string
    email: string
    address: string
  }
  selectedDate: string
  selectedTimeSlot: string
  assignedVendor?: {
    id: string
    name: string
    rating: number
  }
  subtotal: number
  visitingCharges: number
  totalAmount: number
  status: string
  createdAt: string
}

function getInitialOrder(): OrderData | null {
  if (typeof window === 'undefined') return null
  try {
    const savedOrder = localStorage.getItem('asaani_latest_order')
    return savedOrder ? JSON.parse(savedOrder) : null
  } catch {
    return null
  }
}

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<OrderData | null>(null)
  const [bookingStatus, setBookingStatus] = useState('pending')
  const [orderLoaded, setOrderLoaded] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(CUSTOMER_REQUEST_TIMEOUT_SECONDS)
  const [isRequestToastMinimized, setIsRequestToastMinimized] = useState(false)
  const [requestToastPosition, setRequestToastPosition] = useState<{ x: number; y: number } | null>(null)
  const [isDraggingRequestToast, setIsDraggingRequestToast] = useState(false)
  const [requestToastDragOffset, setRequestToastDragOffset] = useState({ x: 0, y: 0 })
  const [showVendorRequestToast, setShowVendorRequestToast] = useState(true)
  const [showAcceptedToast, setShowAcceptedToast] = useState(false)
  const [showReassignmentToast, setShowReassignmentToast] = useState(false)
  const [lastReassignmentAt, setLastReassignmentAt] = useState('')

  useEffect(() => {
    queueMicrotask(() => {
      setOrder(getInitialOrder())
      const initialOrder = getInitialOrder()
      if (initialOrder?.status) setBookingStatus(initialOrder.status.toLowerCase())
      setOrderLoaded(true)
    })
  }, [])

  const handleRequestToastPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.setPointerCapture(event.pointerId)
    setIsDraggingRequestToast(true)
    setRequestToastDragOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    setRequestToastPosition({ x: rect.left, y: rect.top })
  }

  const handleRequestToastPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRequestToast) return
    const rect = event.currentTarget.getBoundingClientRect()
    const offsetX = requestToastDragOffset.x
    const offsetY = requestToastDragOffset.y
    const x = Math.min(Math.max(8, event.clientX - offsetX), window.innerWidth - rect.width - 8)
    const y = Math.min(Math.max(8, event.clientY - offsetY), window.innerHeight - rect.height - 8)
    setRequestToastPosition({ x, y })
  }

  const handleRequestToastPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    setIsDraggingRequestToast(false)
  }

  useEffect(() => {
    if (!order) return
    const updateCountdown = () => {
      const elapsed = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 1000)
      const remaining = Math.max(0, CUSTOMER_REQUEST_TIMEOUT_SECONDS - elapsed)
      setSecondsRemaining(remaining)
      if (remaining === 0) setShowVendorRequestToast(false)
    }
    updateCountdown()
    const timer = window.setInterval(updateCountdown, 1000)
    return () => window.clearInterval(timer)
  }, [order])

  useEffect(() => {
    if (!order) return
    let active = true
    const checkBookingStatus = async () => {
      try {
        const auth = await getCurrentUser('customer')
        if (auth.role !== 'customer' || !auth.profile_id) return
        const bookings = await fetchCustomerBookings(auth.profile_id)
        const current = bookings.find((booking) => booking.id === order.orderId)
        if (active && current) {
          const nextStatus = current.status.toLowerCase()
          const wasReassigned = nextStatus === 'pending' && current.created_at !== order.createdAt
          if (wasReassigned && current.created_at !== lastReassignmentAt) {
            setLastReassignmentAt(current.created_at)
            setShowVendorRequestToast(true)
            setShowReassignmentToast(true)
            window.setTimeout(() => setShowReassignmentToast(false), 10000)
          }
          if (nextStatus === bookingStatus && !wasReassigned) return
          setBookingStatus(nextStatus)
          setOrder((previous) => previous ? { ...previous, status: current.status } : previous)
          localStorage.setItem('asaani_latest_order', JSON.stringify({
            ...order,
            status: current.status,
          }))
          if (current.status === 'accepted') {
            setShowVendorRequestToast(false)
            setShowAcceptedToast(true)
            window.setTimeout(() => setShowAcceptedToast(false), 15000)
          } else if (current.status === 'rejected') {
            setShowVendorRequestToast(false)
          }
        }
      } catch {  }
    }
    checkBookingStatus()
    const statusTimer = window.setInterval(checkBookingStatus, 10000)
    return () => { active = false; window.clearInterval(statusTimer) }
  }, [order, bookingStatus, lastReassignmentAt])

  const minutes = Math.floor(secondsRemaining / 60).toString().padStart(2, '0')
  const seconds = (secondsRemaining % 60).toString().padStart(2, '0')
  const isSearchingForVendor = bookingStatus !== 'accepted' && secondsRemaining === 0

  if (!orderLoaded) {
    return <div className="min-h-screen bg-[#F8FAFC]" />
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center font-sans space-y-4">
        <h2 className="text-xl font-bold text-slate-800">No recent order found!</h2>
        <Link href="/services">
          <button className="bg-[#EE6C52] text-white font-bold text-xs px-5 py-2.5 rounded-xl">
            Browse Services
          </button>
        </Link>
      </div>
    )
  }

  return (
    <div className="w-full bg-[#F8FAFC] font-sans text-slate-800 min-h-screen">
      {showVendorRequestToast && <div
        onPointerDown={handleRequestToastPointerDown}
        onPointerMove={handleRequestToastPointerMove}
        onPointerUp={handleRequestToastPointerUp}
        style={requestToastPosition ? { left: requestToastPosition.x, top: requestToastPosition.y } : undefined}
        className={`fixed z-50 touch-none overflow-hidden rounded-2xl border border-white/70 bg-white/75 shadow-xl shadow-slate-900/10 backdrop-blur-xl ${requestToastPosition ? '' : 'right-4 top-4'} ${isDraggingRequestToast ? 'cursor-grabbing' : 'cursor-grab'} ${isRequestToastMinimized ? 'w-auto' : 'w-[min(360px,calc(100vw-2rem))]'}`}>
        <div className="flex items-center gap-2.5 px-3.5 py-3">
          <div className="rounded-xl bg-orange-500/10 p-2 text-orange-600">
            <Timer className="h-4 w-4" />
          </div>
          {!isRequestToastMinimized && <div className="min-w-0 flex-1">
            <p className="text-xs font-extrabold text-slate-900">Order received</p>
            <p className="mt-1 text-[10px] leading-relaxed text-slate-500">We received your order. We are assigning the best vendor for you.</p>
          </div>}
          <span className="rounded-lg bg-orange-500/10 px-2 py-1 text-sm font-black tabular-nums text-orange-600">{minutes}:{seconds}</span>
          <button type="button" onPointerDown={(event) => event.stopPropagation()} onClick={() => setIsRequestToastMinimized((value) => !value)} aria-label={isRequestToastMinimized ? 'Expand vendor request' : 'Minimize vendor request'} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white hover:text-slate-700">
            {isRequestToastMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>}
      {showAcceptedToast && <div className="fixed right-4 top-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-emerald-100 bg-white p-4 shadow-xl">
        <p className="text-xs font-extrabold text-emerald-700">Order confirmed</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">Your vendor confirmed this order and is ready to provide the selected service.</p>
      </div>}
      {showReassignmentToast && <div className="fixed right-4 top-4 z-50 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-orange-100 bg-white p-4 shadow-xl">
        <p className="text-xs font-extrabold text-orange-700">Finding another vendor</p>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">We&apos;re searching for the best vendor. Thanks for waiting.</p>
      </div>}
      
      
      <div className="bg-[#EEF2FB] text-xs text-slate-600 py-2.5 px-4 md:px-12 flex justify-between items-center border-b border-slate-200/60">
        <div className="flex items-center gap-6">
          <span>AsaaniSay@gmail.com</span>
          <span className="border-l border-slate-300 pl-6">+1 (333) 000-0000</span>
        </div>
        <div className="flex items-center gap-4 text-slate-700">
          <a href="#" className="hover:text-orange-500 transition"><Camera className="w-4 h-4"/></a>
          <a href="#" className="hover:text-orange-500 transition"><LayoutGrid className="w-4 h-4"/></a>
        </div>
      </div>

      
      <header className="bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <Hand size={28} strokeWidth={2} className="text-black"/>
            <Sparkles size={14} strokeWidth={2} className="text-orange-500 absolute -top-1 -right-1"/>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-xl tracking-tight text-orange-500">Asaani</span>
            <span className="font-bold text-lg tracking-tight -mt-1.5 text-orange-500">Say</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-orange-500 transition">Home</Link>
          <Link href="/about-us" className="hover:text-orange-500 transition">About Us</Link>
          <Link href="/services" className="hover:text-orange-500 transition">Services</Link>
          <Link href="/blog" className="hover:text-orange-500 transition">Blog</Link>
          <Link href="/contact-us" className="hover:text-orange-500 transition">Contact Us</Link>
        </nav>

        <Link href="/login">
          <button className="hidden md:inline-flex items-center gap-2 bg-[#3A3E59] hover:bg-[#2C2F45] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-xs">
            <span>Get Started</span>
          </button>
        </Link>
      </header>

      
      <section className="relative w-full bg-[#393E58] py-14 px-6 text-center text-white overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-2 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            {bookingStatus === 'accepted'
              ? 'Your vendor has accepted the service request.'
              : bookingStatus === 'rejected'
                ? (isSearchingForVendor ? 'We are finding another vendor for your service request.' : 'Your vendor declined the request. Please choose another slot or vendor.')
                : isSearchingForVendor
                  ? 'We are finding the best available vendor. Thank you for waiting.'
                : 'Your service request has been registered. We are waiting for vendor acceptance.'}
          </p>
        </div>
      </section>

      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        
        <div className="bg-white rounded-2xl p-8 shadow-xs border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Order Placed Successfully!</h2>
          <p className="text-xs text-slate-500 font-medium">
            Thank you for choosing Asaani Say. Your service request has been confirmed and sent to a related vendor.
          </p>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          
          <div className="lg:col-span-6 space-y-6">
            
            
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Information
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span>Order ID</span>
                  <span className="font-bold text-slate-900">#{order.orderId}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Service Date</span>
                  <span className="font-bold text-slate-900">{order.selectedDate}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Time Slot</span>
                  <span className="font-bold text-slate-900">{order.selectedTimeSlot}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Assigned Vendor</span>
                  <span className={`font-bold ${bookingStatus === 'accepted' ? 'text-emerald-600' : bookingStatus === 'rejected' ? 'text-red-600' : 'text-orange-600'}`}>
                    {bookingStatus === 'accepted' ? 'Vendor accepted' : isSearchingForVendor ? 'Finding a vendor' : bookingStatus === 'rejected' ? 'Vendor declined' : 'Pending acceptance'}
                  </span>
                </div>

                <div className="border-t border-slate-100 pt-3 space-y-2">
                  <span className="font-bold text-slate-700 block mb-1">Services Booked</span>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-slate-600">
                      <span>• {item.title} {item.quantity > 1 ? `(x${item.quantity})` : ''}</span>
                      <span className="font-semibold text-slate-800">
                        Rs: {(item.numericPrice * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                  <span className="font-black text-slate-900 text-sm">Total Paid</span>
                  <span className="font-black text-[#EE6C52] text-lg">
                    Rs: {order.totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Customer Information
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Name</span>
                  <span className="font-bold text-slate-900">{order.bookingDetails.fullName || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Phone</span>
                  <span className="font-bold text-slate-900">{order.bookingDetails.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Email</span>
                  <span className="font-bold text-slate-900">{order.bookingDetails.email || 'N/A'}</span>
                </div>
                <div className="flex justify-between text-slate-600 gap-4">
                  <span className="shrink-0">Address</span>
                  <span className="font-bold text-slate-900 text-right">{order.bookingDetails.address || 'N/A'}</span>
                </div>
              </div>
            </div>

          </div>

          
          <div className="lg:col-span-6 space-y-6">
            
            
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <h3 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                What&apos;s Next?
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Technician Assignment</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      We are assigning a certified specialist to your booking. You&apos;ll receive their details shortly via SMS.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Confirmation Call</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Our representative will give you a quick phone call to re-verify details and dynamic service requirements.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 font-extrabold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">Service Day</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      The assigned technician arrives at your doorstep during the selected {order.selectedTimeSlot} slot.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center justify-center gap-2 border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Satisfaction Guarantee Protected Booking</span>
            </div>

            
            <div className="space-y-3">
              <Link href="/customer/orders" className="block w-full">
                <button className="w-full bg-[#EE6C52] hover:bg-orange-600 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-xs cursor-pointer">
                  View My Bookings
                </button>
              </Link>

              <Link href="/" className="block w-full">
                <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3.5 rounded-xl border border-slate-300 transition cursor-pointer">
                  Back to Home
                </button>
              </Link>
            </div>

          </div>

        </div>

      </main>

      
      <footer className="w-full bg-[#393E58] text-slate-200 pt-16 pb-8 font-sans mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
            <div className="md:col-span-5 space-y-3">
              <p className="text-xs text-slate-300 tracking-wide font-normal">All You Need</p>
              <h2 className="text-3xl font-black text-orange-500 tracking-tight">Asaani Say</h2>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 text-xs gap-8">
              <div className="space-y-3">
                <h3 className="font-semibold text-white text-sm">Navigation</h3>
                <ul className="space-y-2 text-slate-300">
                  <li><Link href="/" className="hover:text-orange-500 transition">Home</Link></li>
                  <li><Link href="/about-us" className="hover:text-orange-500 transition">About Us</Link></li>
                  <li><Link href="/services" className="hover:text-orange-500 transition">Services</Link></li>
                  <li><Link href="/contact-us" className="hover:text-orange-500 transition">Contact Us</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-white">Quick Links</h3>
                <ul className="space-y-2 text-slate-300">
                  <li><Link href="#" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-orange-500 transition">Terms Of Service</Link></li>
                  <li><Link href="#" className="hover:text-orange-500 transition">Disclaimer</Link></li>
                  <li><Link href="#" className="hover:text-orange-500 transition">FAQ</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-white">Contact Us</h3>
                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p>Our support & sales team is available 24/7 to answer your queries.</p>
                  <p className="pt-1 font-medium">+1 (333) 000-0000</p>
                  <p className="font-medium">Asaanisay@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/40 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-300 gap-2">
            <p>Copyright © 2026 AsaaniSay. All Rights Reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  )
}