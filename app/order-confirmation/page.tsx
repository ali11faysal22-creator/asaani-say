'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Camera, 
  LayoutGrid, 
  Hand, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react'

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
  const router = useRouter()
  const [order] = useState<OrderData | null>(getInitialOrder)

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
      
      {/* Top Bar */}
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

      {/* Header */}
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

      {/* Hero Banner Section */}
      <section className="relative w-full bg-[#393E58] py-14 px-6 text-center text-white overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-2 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
            Booking Confirmed!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            Your home service request has been processed successfully. Our certified professional is on the way to restore your comfort.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Top Confirmation Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xs border border-slate-200/80 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Order Placed Successfully!</h2>
          <p className="text-xs text-slate-500 font-medium">
            Thank you for choosing Asaani Say. Your service booking has been confirmed and registered.
          </p>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Order & Customer Information */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Order Information */}
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
                  <span className="font-bold text-slate-900">{order.assignedVendor ? `${order.assignedVendor.name} (${order.assignedVendor.rating.toFixed(1)}★)` : 'Pending assignment'}</span>
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

            {/* Customer Information */}
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

          {/* Right Column: What's Next & Actions */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* What's Next Box */}
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

            {/* Satisfaction Guarantee Banner */}
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold p-3.5 rounded-xl flex items-center justify-center gap-2 border border-emerald-200/60">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>100% Satisfaction Guarantee Protected Booking</span>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/services" className="block w-full">
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

      {/* Footer */}
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