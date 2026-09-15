'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchVendorBookings, getStoredAuth, type BookingResult } from '@/app/lib/booking-api'
import { 
  ArrowLeft,
  Search, 
  Calendar, 
  ShoppingCart,
  ChevronLeft, 
  ChevronRight,
  Eye,
  X,
  Wrench
} from 'lucide-react'

interface OrderRecord {
  orderId: string
  purchaseDate: string
  purchaseDateKey: string
  itemTitle: string
  status: 'Delivered' | 'In Transit' | 'Cancelled' | 'Pending'
  totalAmount: number
}

export default function OrderHistoryPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('All')
  const [filterDate, setFilterDate] = useState('')
  const [selectedOrderForModal, setSelectedOrderForModal] = useState<OrderRecord | null>(null)

  useEffect(() => {
    let active = true
    const loadOrders = async () => {
      try {
        const saved = getStoredAuth('vendor')
        if (!saved || saved.role !== 'vendor') {
          router.push('/vendor/login')
          return
        }
        const rows = await fetchVendorBookings(saved.profile_id || saved.user_id)
        if (!active) return
        setOrders(rows.map((booking: BookingResult) => ({
          orderId: `#${booking.id}`,
          purchaseDate: new Date(booking.date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
          itemTitle: booking.service_name,
          purchaseDateKey: booking.date,
          status: booking.status === 'accepted' ? 'Delivered' : booking.status === 'rejected' ? 'Cancelled' : 'Pending',
          totalAmount: 0
        })))
      } catch (error) {
        console.error('Unable to load vendor orders', error)
      }
    }
    loadOrders()
    return () => { active = false }
  }, [router])
  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.itemTitle.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = 
      selectedStatus === 'All' ? true : 
      selectedStatus === 'Completed' ? order.status === 'Delivered' :
      selectedStatus === 'Pending' ? order.status === 'In Transit' || order.status === 'Pending' :
      selectedStatus === 'Cancelled' ? order.status === 'Cancelled' : true
    const matchesDate = !filterDate || order.purchaseDateKey === filterDate

    return matchesSearch && matchesStatus && matchesDate
  })
  const totalSpent = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((acc, curr) => acc + curr.totalAmount, 0)
  return (
    <div className="min-h-screen w-full bg-white grid grid-cols-1 md:grid-cols-12 font-sans text-slate-800">

      
      <div className="md:col-span-4 lg:col-span-3 bg-[#3B3E56] text-white p-6 flex flex-col min-h-screen">
        <div className="flex items-center gap-3 mb-10 pt-2">
          <div className="w-8 h-8 rounded-lg bg-[#EE6C52] flex items-center justify-center shadow-xs">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white">Asaani Say</span>
        </div>

        <button
            type="button"
            onClick={() => router.push('/vendor/dashboard')}
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-2 rounded-xl transition-all duration-200 mb-8 cursor-pointer backdrop-blur-sm shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-white transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Back </span>
          </button>
      </div>

      <div className="md:col-span-8 lg:col-span-9 bg-[#F8FAFC] min-h-screen flex flex-col">
        <div className="flex-1">
        
        <section className="relative w-full bg-[#393E58] py-14 px-6 text-center text-white overflow-hidden">
          <div className="max-w-4xl mx-auto space-y-2 relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              My Orders
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              Your home service request has been processed successfully. Our certified professional is on the way to restore your comfort.
            </p>
          </div>
        </section>

        
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
          
          
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200/80 space-y-6">
            
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">My Orders</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Review and manage your team&apos;s historical purchase records and active transactions.
                </p>
              </div>

              
              <div className="flex items-center gap-6 bg-slate-50 px-5 py-2.5 rounded-xl border border-slate-100 shrink-0">
                <div className="text-right sm:text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Spent</span>
                  <span className="text-base font-extrabold text-slate-900">
                    Rs: {totalSpent.toLocaleString()}
                  </span>
                </div>
                <div className="border-l border-slate-200 h-8"></div>
                <div className="text-right sm:text-left">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Total Orders</span>
                  <span className="text-base font-extrabold text-slate-900">{orders.length} Orders</span>
                </div>
              </div>
            </div>

            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
              
              
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input 
                  type="text"
                  placeholder="Search order ID, product name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3.5 py-2 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-orange-500 transition"
                />
              </div>

              
              <div className="flex flex-wrap items-center gap-3">
                
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg pl-8 pr-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-orange-500 transition cursor-pointer"
                    />
                  </div>
                  <button className="bg-[#EE6C52] hover:bg-orange-600 text-white font-bold text-xs px-3.5 py-2 rounded-lg transition cursor-pointer shadow-xs">
                    Choose Date
                  </button>
                  <button 
                    onClick={() => setFilterDate('')}
                    className="text-xs text-slate-400 hover:text-slate-600 font-medium px-1 cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>

                
                <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs font-bold gap-1">
                  {['All', 'Completed', 'Pending', 'Cancelled'].map((tab) => {
                    const isActive = selectedStatus === tab
                    return (
                      <button
                        key={tab}
                        onClick={() => setSelectedStatus(tab)}
                        className={`px-3 py-1 rounded-md transition cursor-pointer ${
                          isActive 
                            ? 'bg-[#EE6C52] text-white shadow-2xs' 
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  })}
                </div>

              </div>
            </div>

            
            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] uppercase font-extrabold text-slate-400 tracking-wider">
                    <th className="py-3.5 px-4">Order ID</th>
                    <th className="py-3.5 px-4">Purchase Date</th>
                    <th className="py-3.5 px-4">Items / Details</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">Total</th>
                    <th className="py-3.5 px-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-400 font-bold">
                        No orders match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      return (
                        <tr key={order.orderId} className="hover:bg-slate-50/60 transition">
                          <td className="py-4 px-4 font-extrabold text-slate-900">
                            {order.orderId}
                          </td>
                          <td className="py-4 px-4 text-slate-500 font-medium">
                            {order.purchaseDate}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span className="font-bold text-slate-800 line-clamp-1">{order.itemTitle}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            {order.status === 'Delivered' && (
                              <span className="inline-block bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                Delivered
                              </span>
                            )}
                            {order.status === 'In Transit' && (
                              <span className="inline-block bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                In Transit
                              </span>
                            )}
                            {order.status === 'Cancelled' && (
                              <span className="inline-block bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                Cancelled
                              </span>
                            )}
                            {order.status === 'Pending' && (
                              <span className="inline-block bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full text-[10px] font-black">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right font-black text-slate-900">
                            Rs: {order.totalAmount.toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button 
                              onClick={() => setSelectedOrderForModal(order)}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-md text-[11px] font-bold transition cursor-pointer inline-flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3 text-slate-500" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-4 text-xs">
              <span className="text-slate-400 font-medium">
                Showing <strong className="text-slate-800">1-{filteredOrders.length}</strong> of <strong className="text-slate-800">{orders.length}</strong> transactions
              </span>

              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded-md border border-slate-200 text-slate-400 hover:bg-slate-50 transition cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <button className="w-7 h-7 rounded-md bg-[#EE6C52] text-white font-bold text-xs flex items-center justify-center">
                  1
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                  2
                </button>
                <button className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                  3
                </button>
                <span className="px-1 text-slate-400 font-bold">...</span>
                <button className="w-7 h-7 rounded-md hover:bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center">
                  6
                </button>

                <button className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </main>
        </div>

      
      {selectedOrderForModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 relative">
            <button 
              onClick={() => setSelectedOrderForModal(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="text-base font-extrabold text-slate-900">Order Receipt</h3>
              <p className="text-xs text-slate-400 font-medium">{selectedOrderForModal.orderId}</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-500">Service</span>
                <span className="font-bold text-slate-900 text-right">{selectedOrderForModal.itemTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date</span>
                <span className="font-bold text-slate-900">{selectedOrderForModal.purchaseDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status</span>
                <span className="font-extrabold text-orange-500">{selectedOrderForModal.status}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 flex justify-between font-black text-sm">
                <span>Total Amount</span>
                <span className="text-[#EE6C52]">Rs: {selectedOrderForModal.totalAmount.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={() => setSelectedOrderForModal(null)}
              className="w-full bg-[#393E58] text-white font-bold text-xs py-2.5 rounded-xl hover:bg-slate-800 transition cursor-pointer"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      </div>
    </div>
  )
}

