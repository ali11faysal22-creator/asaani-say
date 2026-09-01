'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Camera, 
  LayoutGrid, 
  Hand, 
  Sparkles, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  ShoppingCart,
  Wrench,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  Clock,
  X
} from 'lucide-react'

interface CartItem {
  id: string
  title: string
  subtitle?: string
  price: string
  numericPrice: number
  quantity: number
  image?: string
}

interface VendorProfile {
  id: string
  name: string
  rating: number
  specialty: string[]
  addresses: string[]
  queue: string[]
}

interface BookingNotification {
  id: string
  message: string
  type: 'user' | 'vendor'
  createdAt: string
  isRead: boolean
}

// ---------------------------------------------------------------------------
// TIME SLOT CONFIG — 8:00 AM to 5:00 PM, 30 min gap (last slot starts 4:30 PM
// so the visit finishes by 5:00 PM)
// ---------------------------------------------------------------------------
const SLOT_START_HOUR = 8   // 8 AM
const SLOT_END_HOUR = 17    // 5 PM (exclusive as a start time)
const SLOT_STEP_MIN = 30

function generateTimeSlots(): string[] {
  const slots: string[] = []
  for (let h = SLOT_START_HOUR; h < SLOT_END_HOUR; h++) {
    for (let m = 0; m < 60; m += SLOT_STEP_MIN) {
      const period = h >= 12 ? 'PM' : 'AM'
      const displayHour = h > 12 ? h - 12 : h
      const displayMin = m === 0 ? '00' : m
      slots.push(`${displayHour}:${displayMin} ${period}`)
    }
  }
  return slots
}

const TIME_SLOTS = generateTimeSlots()

const DEFAULT_VENDOR_PROFILES: VendorProfile[] = [
  {
    id: 'vendor-ali',
    name: 'Ali Khan',
    rating: 4.9,
    specialty: ['Plumbing', 'Handyman'],
    addresses: ['House 12, Gulberg III, Lahore', 'Office 8, DHA Phase 3, Lahore'],
    queue: ['8:00 AM', '9:00 AM', '10:30 AM', '1:00 PM', '3:30 PM']
  },
  {
    id: 'vendor-sana',
    name: 'Sana Raza',
    rating: 4.7,
    specialty: ['Electrician', 'AC Services'],
    addresses: ['Flat 4B, DHA Phase 3, Lahore', 'Block C, Johar Town, Lahore'],
    queue: ['8:30 AM', '11:00 AM', '2:00 PM', '4:00 PM']
  },
  {
    id: 'vendor-farhan',
    name: 'Farhan Malik',
    rating: 4.8,
    specialty: ['Painter', 'Home Inspection'],
    addresses: ['Commercial Market, Gulberg, Lahore', 'Lake View Road, Lahore'],
    queue: ['9:30 AM', '1:30 PM', '3:00 PM', '4:30 PM']
  },
  {
    id: 'vendor-ubaid',
    name: 'Ubaid Ahmed',
    rating: 4.6,
    specialty: ['Carpenter', 'Pest Control'],
    addresses: ['Model Town, Lahore', 'Allama Iqbal Town, Lahore'],
    queue: ['8:00 AM', '10:00 AM', '12:30 PM', '2:30 PM']
  }
]

const DEFAULT_USER_ADDRESSES = [
  'Flat 4B, Sector Y Block, DHA Phase 3, Lahore, Pakistan',
  'Suite 220, Gulberg Business Center, Lahore, Pakistan'
]

function getStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

function setStoredJson<T>(key: string, value: T) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(value))
  }
}

function getInitialCartItems(): CartItem[] {
  if (typeof window === 'undefined') return []
  return getStoredJson<CartItem[]>('asaani_cart', [])
}

function getInitialSavedAddresses(): string[] {
  if (typeof window === 'undefined') return DEFAULT_USER_ADDRESSES
  const saved = getStoredJson<string[]>('asaani_user_addresses', DEFAULT_USER_ADDRESSES)
  return saved.length > 0 ? saved : DEFAULT_USER_ADDRESSES
}

function getInitialBillingDetails() {
  if (typeof window === 'undefined') {
    return { fullName: '', phone: '', email: '', address: '' }
  }
  const saved = localStorage.getItem('asaani_booking_details')
  if (!saved) {
    return { fullName: '', phone: '', email: '', address: '' }
  }
  try {
    const parsed = JSON.parse(saved)
    return {
      fullName: parsed.fullName || '',
      phone: parsed.phone || '',
      email: parsed.email || '',
      address: parsed.address || ''
    }
  } catch {
    return { fullName: '', phone: '', email: '', address: '' }
  }
}

function getInitialSelectedDate(): string {
  if (typeof window === 'undefined') return ''
  const saved = localStorage.getItem('asaani_booking_details')
  if (!saved) return ''
  try {
    const parsed = JSON.parse(saved)
    return parsed.selectedDate || ''
  } catch {
    return ''
  }
}

function getInitialSelectedTimeSlot(): string {
  if (typeof window === 'undefined') return ''
  const saved = localStorage.getItem('asaani_booking_details')
  if (!saved) return ''
  try {
    const parsed = JSON.parse(saved)
    return parsed.selectedTimeSlot || ''
  } catch {
    return ''
  }
}

function getInitialSelectedVendor(): VendorProfile | null {
  if (typeof window === 'undefined') return null
  const saved = localStorage.getItem('asaani_booking_details')
  if (!saved) return null
  try {
    const parsed = JSON.parse(saved)
    return parsed.selectedVendor || null
  } catch {
    return null
  }
}

function getInitialSelectedAddressIndex(): number {
  if (typeof window === 'undefined') return 0
  const saved = localStorage.getItem('asaani_booking_details')
  if (!saved) return 0
  try {
    const parsed = JSON.parse(saved)
    if (!parsed.address) return 0
    const savedAddresses = getInitialSavedAddresses()
    const index = savedAddresses.findIndex((item) => item === parsed.address)
    return index >= 0 ? index : 0
  } catch {
    return 0
  }
}

function getInitialViewYear(): number {
  if (typeof window === 'undefined') return new Date().getFullYear()
  const saved = localStorage.getItem('asaani_booking_details')
  if (!saved) return new Date().getFullYear()
  try {
    const parsed = JSON.parse(saved)
    if (!parsed.selectedDate) return new Date().getFullYear()
    const [y] = parsed.selectedDate.split('-').map(Number)
    return y
  } catch {
    return new Date().getFullYear()
  }
}

function getInitialViewMonth(): number {
  if (typeof window === 'undefined') return new Date().getMonth()
  const saved = localStorage.getItem('asaani_booking_details')
  if (!saved) return new Date().getMonth()
  try {
    const parsed = JSON.parse(saved)
    if (!parsed.selectedDate) return new Date().getMonth()
    const [, m] = parsed.selectedDate.split('-').map(Number)
    return m - 1
  } catch {
    return new Date().getMonth()
  }
}

function resolveVendorProfiles(): VendorProfile[] {
  const stored = getStoredJson<VendorProfile[]>('asaani_vendors', DEFAULT_VENDOR_PROFILES)
  return stored.length > 0 ? stored : DEFAULT_VENDOR_PROFILES
}

function getVendorQueueByDate(dateStr: string): Record<string, string[]> {
  const queue = getStoredJson<Record<string, Record<string, string[]>>>('asaani_vendor_queue', {})
  return queue[dateStr] || {}
}

function getVendorIdsForSlot(dateStr: string, slot: string): string[] {
  const vendors = resolveVendorProfiles()
  const queueForDate = getVendorQueueByDate(dateStr)
  const queuedIds = queueForDate[slot] || []

  if (queuedIds.length > 0) {
    return queuedIds.filter(id => vendors.some(v => v.id === id))
  }

  const seed = Array.from(dateStr + slot).reduce((total, char) => total + char.charCodeAt(0), 0)
  const matched = vendors
    .map((vendor, index) => ({ vendor, index }))
    .filter(({ index }) => (seed + index * 17) % 5 === 0)
    .map(({ vendor }) => vendor.id)

  return matched.length > 0 ? matched : [vendors[0].id]
}

function getBestAvailableVendor(dateStr: string, slot: string): VendorProfile | null {
  if (!dateStr || !slot) return null

  const vendors = resolveVendorProfiles()
  const preferredIds = getVendorIdsForSlot(dateStr, slot)
  const candidates = vendors.filter(vendor => preferredIds.includes(vendor.id))

  if (candidates.length === 0) return null

  return [...candidates].sort((a, b) => b.rating - a.rating)[0]
}

function isDateFullyBooked(dateStr: string): boolean {
  if (!dateStr) return false
  const unavailable = getUnavailableSlotsForDate(dateStr)
  return TIME_SLOTS.length > 0 && unavailable.size === TIME_SLOTS.length
}

function getUnavailableSlotsForDate(dateStr: string): Set<string> {
  if (!dateStr) return new Set()

  let seed = 0
  for (let i = 0; i < dateStr.length; i++) {
    seed = (seed * 31 + dateStr.charCodeAt(i)) % 100000
  }

  const unavailable = new Set<string>()
  TIME_SLOTS.forEach((slot, idx) => {
    if ((seed + idx * 13) % 4 === 0) {
      unavailable.add(slot)
    }
  })

  const queue = getVendorQueueByDate(dateStr)
  Object.entries(queue).forEach(([slot, vendorIds]) => {
    if (!vendorIds || vendorIds.length === 0) {
      unavailable.add(slot)
    }
  })

  return unavailable
}

// ---------------------------------------------------------------------------
// CALENDAR HELPERS
// ---------------------------------------------------------------------------
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toDateKey(year: number, month: number, day: number): string {
  const mm = String(month + 1).padStart(2, '0')
  const dd = String(day).padStart(2, '0')
  return `${year}-${mm}-${dd}`
}

// Filter vendors by service type and location
function filterVendorsByServiceAndLocation(
  vendors: VendorProfile[],
  cartItems: CartItem[]
): VendorProfile[] {
  // Map cart items to services
  const requestedServices = cartItems.map(item => {
    const title = item.title.toLowerCase()
    if (title.includes('ac') || title.includes('cooling')) return 'AC Services'
    if (title.includes('plumb')) return 'Plumbing'
    if (title.includes('electric')) return 'Electrician'
    if (title.includes('paint')) return 'Painter'
    if (title.includes('carpenter') || title.includes('wood')) return 'Carpenter'
    if (title.includes('pest') || title.includes('termite')) return 'Pest Control'
    if (title.includes('handyman')) return 'Handyman'
    if (title.includes('inspect') || title.includes('inspection')) return 'Home Inspection'
    if (title.includes('geyser')) return 'Geyser'
    return item.title
  })

  // Filter vendors that have matching specialties
  const filtered = vendors.filter(vendor => {
    const hasMatchingService = vendor.specialty.some(spec => 
      requestedServices.some(service => 
        spec.toLowerCase().includes(service.toLowerCase()) ||
        service.toLowerCase().includes(spec.toLowerCase())
      )
    )
    
    // Simple location filter: for now, include all vendors (in real scenario, use 5km radius)
    // In production, you'd calculate actual distance using lat/lon
    return hasMatchingService
  })

  // Sort by rating (highest first)
  return filtered.sort((a, b) => b.rating - a.rating)
}

function isPastDate(year: number, month: number, day: number): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const candidate = new Date(year, month, day)
  return candidate < today
}

function generateOrderId(): string {
  return 'AS-2026-' + Math.floor(1000 + Math.random() * 9000)
}

export default function CartAndCheckoutPage() {
  const router = useRouter()

  // State Management
  const [cartItems, setCartItems] = useState<CartItem[]>(getInitialCartItems)
  const [viewYear, setViewYear] = useState<number>(getInitialViewYear)
  const [viewMonth, setViewMonth] = useState<number>(getInitialViewMonth)
  const [selectedDate, setSelectedDate] = useState<string>(getInitialSelectedDate)
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>(getInitialSelectedTimeSlot)
  const [selectedVendor, setSelectedVendor] = useState<VendorProfile | null>(getInitialSelectedVendor)
  const [savedAddresses, setSavedAddresses] = useState<string[]>(getInitialSavedAddresses)
  const [selectedAddressIndex, setSelectedAddressIndex] = useState<number>(getInitialSelectedAddressIndex)
  const [billingDetails, setBillingDetails] = useState(getInitialBillingDetails)

  // Popup / Modal State
  const [showModal, setShowModal] = useState(false)
  const [confirmedOrderInfo, setConfirmedOrderInfo] = useState<{
    orderId: string
    serviceName: string
  } | null>(null)
  
  // Vendor Selection Modal State
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [filteredVendors, setFilteredVendors] = useState<VendorProfile[]>([])

  const today = useMemo(() => new Date(), [])

  // Initialize localStorage defaults on mount (no setState)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (!localStorage.getItem('asaani_vendors')) {
        setStoredJson('asaani_vendors', DEFAULT_VENDOR_PROFILES)
      }
      if (!localStorage.getItem('asaani_user_addresses')) {
        setStoredJson('asaani_user_addresses', DEFAULT_USER_ADDRESSES)
      }
    }
  }, [])

  // Helper to sync cart with LocalStorage
  const updateLocalStorageCart = (items: CartItem[]) => {
    setCartItems(items)
    localStorage.setItem('asaani_cart', JSON.stringify(items))
  }

  // Quantity Handlers
  const handleIncreaseQty = (id: string) => {
    const updated = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: item.quantity + 1 }
      }
      return item
    })
    updateLocalStorageCart(updated)
  }

  const handleDecreaseQty = (id: string) => {
    const updated = cartItems
      .map(item => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity - 1 }
        }
        return item
      })
      .filter(item => item.quantity > 0)
    updateLocalStorageCart(updated)
  }

  const handleRemoveItem = (id: string) => {
    const updated = cartItems.filter(item => item.id !== id)
    updateLocalStorageCart(updated)
  }

  const handleClearCart = () => {
    updateLocalStorageCart([])
  }

  // Handle Input Changes & save to LocalStorage
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const updatedDetails = { ...billingDetails, [name]: value }
    setBillingDetails(updatedDetails)

    localStorage.setItem('asaani_booking_details', JSON.stringify({
      ...updatedDetails,
      selectedDate,
      selectedTimeSlot,
      selectedVendor
    }))
  }

  const handleAddressSelection = (index: number) => {
    const nextAddress = savedAddresses[index] || ''
    setSelectedAddressIndex(index)
    const updatedDetails = { ...billingDetails, address: nextAddress }
    setBillingDetails(updatedDetails)
    setStoredJson('asaani_user_addresses', savedAddresses)
    localStorage.setItem('asaani_booking_details', JSON.stringify({
      ...updatedDetails,
      selectedDate,
      selectedTimeSlot,
      selectedVendor
    }))
  }

  // Date selection (from calendar grid)
  const handleDateSelect = (dateKey: string) => {
    if (isDateFullyBooked(dateKey)) {
      return
    }

    setSelectedDate(dateKey)

    const unavailable = getUnavailableSlotsForDate(dateKey)
    const nextSlot = unavailable.has(selectedTimeSlot) ? '' : selectedTimeSlot
    setSelectedTimeSlot(nextSlot)

    if (nextSlot) {
      const vendor = getBestAvailableVendor(dateKey, nextSlot)
      setSelectedVendor(vendor)
    } else {
      setSelectedVendor(null)
    }

    localStorage.setItem('asaani_booking_details', JSON.stringify({
      ...billingDetails,
      selectedDate: dateKey,
      selectedTimeSlot: nextSlot,
      selectedVendor: nextSlot ? getBestAvailableVendor(dateKey, nextSlot) : null
    }))
  }

  // Time slot selection handler
  const handleTimeSlotSelect = (slot: string) => {
    const vendor = getBestAvailableVendor(selectedDate, slot)
    setSelectedVendor(vendor)
    setSelectedTimeSlot(slot)
    localStorage.setItem('asaani_booking_details', JSON.stringify({
      ...billingDetails,
      selectedDate,
      selectedTimeSlot: slot,
      selectedVendor: vendor
    }))
  }

  const goToPrevMonth = () => {
    setViewMonth(prev => {
      if (prev === 0) {
        setViewYear(y => y - 1)
        return 11
      }
      return prev - 1
    })
  }

  const goToNextMonth = () => {
    setViewMonth(prev => {
      if (prev === 11) {
        setViewYear(y => y + 1)
        return 0
      }
      return prev + 1
    })
  }

  // Don't let the user navigate to a month entirely in the past
  const isPrevMonthDisabled =
    viewYear === today.getFullYear() && viewMonth === today.getMonth()

  // Build the calendar grid for the currently viewed month
  const calendarCells = useMemo(() => {
    const firstWeekday = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()

    const cells: { day: number | null; dateKey: string | null }[] = []
    for (let i = 0; i < firstWeekday; i++) {
      cells.push({ day: null, dateKey: null })
    }
    for (let d = 1; d <= daysInMonth; d++) {
      cells.push({ day: d, dateKey: toDateKey(viewYear, viewMonth, d) })
    }
    return cells
  }, [viewYear, viewMonth])

  const isDateSelectable = (dateKey: string) => {
    if (!dateKey) return false
    return !isPastDate(new Date(dateKey).getFullYear(), new Date(dateKey).getMonth(), new Date(dateKey).getDate()) && !isDateFullyBooked(dateKey)
  }

  // Unavailable slots for whichever date is currently selected
  const unavailableSlots = useMemo(
    () => getUnavailableSlotsForDate(selectedDate),
    [selectedDate]
  )

  // Calculations
  const visitingCharges = 500
  const subtotal = cartItems.reduce((acc, item) => {
    return acc + (item.numericPrice * item.quantity)
  }, 0)
  const totalAmount = subtotal > 0 ? subtotal + visitingCharges : 0

  // Handle vendor request from modal
  const handleVendorRequest = (requestedVendor: VendorProfile) => {
    const generatedOrderId = generateOrderId()
    const serviceNameText = cartItems.length === 1 
      ? cartItems[0].title 
      : `${cartItems[0].title} (+${cartItems.length - 1} more)`

    const finalOrder = {
      orderId: generatedOrderId,
      items: cartItems,
      bookingDetails: billingDetails,
      selectedDate,
      selectedTimeSlot,
      assignedVendor: requestedVendor,
      subtotal,
      visitingCharges,
      totalAmount,
      status: 'Confirmed',
      createdAt: new Date().toISOString()
    }

    localStorage.setItem('asaani_latest_order', JSON.stringify(finalOrder))

    const userNotification: BookingNotification = {
      id: `user-${generatedOrderId}`,
      message: `Your service for ${serviceNameText} has been confirmed with ${requestedVendor.name} on ${selectedDate} at ${selectedTimeSlot}.`,
      type: 'user',
      createdAt: new Date().toISOString(),
      isRead: false
    }

    const vendorNotification: BookingNotification = {
      id: `vendor-${generatedOrderId}`,
      message: `${billingDetails.fullName} requested ${serviceNameText} at ${selectedDate} ${selectedTimeSlot}. Please review the booking and prepare for the visit.`,
      type: 'vendor',
      createdAt: new Date().toISOString(),
      isRead: false
    }

    const existingUserNotifications = getStoredJson<BookingNotification[]>('asaani_user_notifications', [])
    const existingVendorNotifications = getStoredJson<BookingNotification[]>('asaani_vendor_notifications', [])
    const existingVendorportalNotifications = getStoredJson<BookingNotification[]>('vendor_notifications_v3', [])
    setStoredJson('asaani_user_notifications', [userNotification, ...existingUserNotifications])
    setStoredJson('asaani_vendor_notifications', [vendorNotification, ...existingVendorNotifications])
    setStoredJson('vendor_notifications_v3', [
      {
        id: `vendor-${generatedOrderId}`,
        type: 'booking_request',
        title: 'New Booking Assigned',
        message: `${billingDetails.fullName} booked ${serviceNameText} for ${selectedDate} at ${selectedTimeSlot}. Assigned vendor: ${requestedVendor.name}.`,
        timestamp: 'Just now',
        createdAt: new Date().toISOString(),
        isRead: false,
        customerName: billingDetails.fullName,
        customerPhone: billingDetails.phone,
        location: billingDetails.address,
        service: serviceNameText,
        date: selectedDate,
        time: selectedTimeSlot,
        amount: `Rs. ${totalAmount.toLocaleString()}`,
        bookingStatus: 'accepted'
      },
      ...existingVendorportalNotifications
    ])

    setSelectedVendor(requestedVendor)
    setConfirmedOrderInfo({
      orderId: generatedOrderId,
      serviceName: serviceNameText
    })

    localStorage.removeItem('asaani_cart')
    setCartItems([])

    setShowVendorModal(false)
    setShowModal(true)

    setTimeout(() => {
      router.push('/order-confirmation')
    }, 5000)
  }

  // Place Order Handler - Show Vendor Selection Modal
  const handlePlaceOrder = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Please add some services to your cart first..')
      return
    }

    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select a service date and an available time slot before proceeding..')
      return
    }

    if (!billingDetails.fullName || !billingDetails.phone || !billingDetails.address) {
      alert('Please complete your billing and booking details (Name, Phone Number, and Address) before proceeding..')
      return
    }

    // Filter and show available vendors
    const availableVendors = filterVendorsByServiceAndLocation(
      resolveVendorProfiles(),
      cartItems
    )

    if (availableVendors.length === 0) {
      alert('No vendors available for your selected services in your area. Please try another date or time.')
      return
    }

    setFilteredVendors(availableVendors)
    setShowVendorModal(true)
    return
  }

  // Legacy: Place Order with auto-assigned vendor (kept for compatibility)
  const handlePlaceOrderLegacy = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Please add some services to your cart first..')
      return
    }

    if (!selectedDate || !selectedTimeSlot) {
      alert('Please select a service date and an available time slot before proceeding..')
      return
    }

    if (!billingDetails.fullName || !billingDetails.phone || !billingDetails.address) {
      alert('Please complete your billing and booking details (Name, Phone Number, and Address) before proceeding..')
      return
    }

    const assignedVendor = getBestAvailableVendor(selectedDate, selectedTimeSlot)
    if (!assignedVendor) {
      alert('No vendor is available for this slot. Please choose another time slot or date.')
      return
    }

    // This is handled by handleVendorRequest now
  }

  return (
    <div className="w-full bg-[#F8FAFC] font-sans text-slate-800 relative min-h-screen">
      
      {/* VENDOR SELECTION MODAL */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border border-slate-100 relative">
            
            {/* Close Button */}
            <button
              onClick={() => setShowVendorModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>

            {/* Header */}
            <div className="space-y-2 mb-6 pr-8">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-orange-500" />
                <h2 className="text-xl font-extrabold text-slate-900">Top Rated Vendors</h2>
              </div>
              <p className="text-xs text-slate-600 font-medium">Choose from our verified, highly recommended specialists nearby</p>
            </div>

            {/* Vendors List */}
            <div className="space-y-3">
              {filteredVendors.map((vendor) => {
                // availableSlot for future use: vendor.queue.length > 0 ? vendor.queue[0] : '09:00 AM'
                const responseTime = vendor.rating >= 4.8 ? '10 mins' : vendor.rating >= 4.5 ? '20 mins' : '30 mins'
                const workingHours = '9 AM - 7 PM'
                
                return (
                  <div
                    key={vendor.id}
                    className="p-4 border border-slate-200 rounded-2xl hover:border-orange-300 hover:bg-orange-50/30 transition space-y-3"
                  >
                    {/* Vendor Info Row */}
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <div className="w-14 h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-slate-700">{vendor.name.charAt(0)}</span>
                      </div>

                      {/* Vendor Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-sm font-extrabold text-slate-900">{vendor.name}</h3>
                          <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">VERIFIED</span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium mb-2">
                          {vendor.specialty.join(' & ')}
                        </p>

                        {/* Availability Info */}
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-orange-500" />
                            <span className="font-semibold">{workingHours}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-600">
                            <span className="text-green-600 font-bold">● {responseTime}</span>
                          </div>
                        </div>
                      </div>

                      {/* Rating & Request Button */}
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-bold text-slate-900">{vendor.rating}</span>
                          <span className="text-[10px] text-slate-500">({Math.floor(vendor.rating * 50)} reviews)</span>
                        </div>
                        <button
                          onClick={() => handleVendorRequest(vendor)}
                          className="bg-[#EE6C52] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition shadow-xs cursor-pointer whitespace-nowrap"
                        >
                          Request →
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer Info */}
            <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-medium">
              <div className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>If the Vendor is available he can accept requests within <span className="font-bold">5 minutes</span></span>
              </div>
              <button
                onClick={() => setShowVendorModal(false)}
                className="text-orange-500 hover:text-orange-600 font-semibold cursor-pointer"
              >
                Need urgent help?
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* ANIMATED 5-SECOND SUCCESS POPUP */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-5 shadow-2xl border border-slate-100 relative overflow-hidden transition-all transform scale-100 animate-in fade-in zoom-in duration-300">
            
            {/* 5-second Progress Bar Animation */}
            <div className="absolute top-0 left-0 h-1.5 bg-[#EE6C52] w-full animate-[pulse_1s_infinite]" />

            {/* Success Icon */}
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50/80 animate-bounce">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            {/* Popup Text Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-extrabold text-slate-900">
                Order Confirmed!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Thanks for choosing <span className="font-extrabold text-[#EE6C52]">Asaani Say</span>! Your order <span className="font-extrabold text-slate-900">#{confirmedOrderInfo?.orderId}</span> for <span className="font-extrabold text-slate-900">{confirmedOrderInfo?.serviceName}</span> is confirmed.
              </p>
            </div>

            {/* Redirecting Loader */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <Loader2 className="w-4 h-4 text-[#EE6C52] animate-spin" />
              <span>Redirecting to receipt in 5 seconds...</span>
            </div>

          </div>
        </div>
      )}

      {/* Top Bar */}
      <div className="bg-[#EEF2FB] text-xs text-slate-600 py-2.5 px-4 md:px-12 flex justify-between items-center border-b border-slate-200/60">
        <div className="flex items-center gap-6">
          <span>AsaaniSay@gmail.com</span>
          <span className="border-l border-slate-300 pl-6">+1 (333) 000-0000</span>
        </div>
        <div className="flex items-center gap-4 text-slate-700">
          <a href="#" className="hover:text-orange-500 transition">
            <Camera className="w-4 h-4"/>
          </a>
          <a href="#" className="hover:text-orange-500 transition">
            <LayoutGrid className="w-4 h-4"/>
          </a>
        </div>
      </div>

      {/* Header / Navbar */}
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
          <button className="hidden md:inline-flex items-center gap-2 bg-[#3A3E59] hover:bg-[#2C2F45] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-xs cursor-pointer">
            <span>Get Started</span>
          </button>
        </Link>
      </header>

      {/* Hero Banner Section */}
      <section className="relative w-full bg-[#393E58] py-12 px-6 text-center text-white overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-2 relative z-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Your Service Cart & Checkout
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Confirm your service slots and provide your details. Asaani Say&apos;s certified experts are standing by.
          </p>
        </div>
      </section>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Selected Services & Billing Form */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Selected Services Box */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-slate-700" />
                  <h2 className="text-base font-extrabold text-slate-900">
                    Selected Services ({cartItems.reduce((a, b) => a + b.quantity, 0)})
                  </h2>
                </div>
                {cartItems.length > 0 && (
                  <button 
                    onClick={handleClearCart}
                    className="text-xs text-slate-400 hover:text-red-500 transition font-medium cursor-pointer"
                  >
                    Clear Cart
                  </button>
                )}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
                    <Wrench className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">
                    Aapka Cart filhal khali hai. Sub-services add karne ke liye Services page par jayein.
                  </p>
                  <Link href="/services">
                    <button className="mt-2 bg-[#EE6C52] hover:bg-orange-600 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition cursor-pointer">
                      Browse Services
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div 
                      key={item.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 bg-slate-50/70 rounded-xl border border-slate-100 gap-4"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-14 h-14 bg-slate-200 rounded-lg shrink-0 flex items-center justify-center text-slate-400 font-bold text-xs overflow-hidden relative">
                          {item.image ? (
                            <Image src={item.image} alt={item.title} fill className="object-cover" />
                          ) : (
                            <Wrench className="w-6 h-6 text-slate-400"/>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">{item.title}</h3>
                          <p className="text-[11px] text-slate-500 font-medium">{item.subtitle || 'Standard Service'}</p>
                          <p className="text-xs font-bold text-[#EE6C52] mt-0.5">Rs: {item.numericPrice}</p>
                        </div>
                      </div>

                      {/* Quantity Controls & Remove */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                        <div className="flex items-center border border-slate-200 rounded-md bg-white">
                          <button 
                            onClick={() => handleDecreaseQty(item.id)}
                            className="p-1 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800">{item.quantity}</span>
                          <button 
                            onClick={() => handleIncreaseQty(item.id)}
                            className="p-1 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-20">
                          <p className="text-xs font-black text-slate-900">
                            Rs: {item.numericPrice * item.quantity}
                          </p>
                        </div>

                        <button 
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-400 hover:text-red-500 transition p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Billing & Booking Details Form */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Billing & Booking Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    name="fullName"
                    placeholder="e.g. Muhammad Ali"
                    value={billingDetails.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Phone Number</label>
                  <input 
                    type="text" 
                    name="phone"
                    placeholder="+92 333 4567890"
                    value={billingDetails.phone}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    name="email"
                    placeholder="ali.service@gmail.com"
                    value={billingDetails.email}
                    onChange={handleInputChange}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-bold text-slate-700">Service Address</label>
                  <div className="space-y-2">
                    {savedAddresses.length > 0 && (
                      <select
                        value={selectedAddressIndex}
                        onChange={(e) => handleAddressSelection(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition font-medium text-slate-700"
                      >
                        {savedAddresses.map((address, idx) => (
                          <option key={`${address}-${idx}`} value={idx}>
                            Saved Address {idx + 1}
                          </option>
                        ))}
                      </select>
                    )}
                    <input 
                      type="text" 
                      name="address"
                      placeholder="Flat 4B, Sector Y Block, DHA Phase 3, Lahore, Pakistan"
                      value={billingDetails.address}
                      onChange={handleInputChange}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-orange-500 transition font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Preferred Service Date</label>
                  <input 
                    type="text" 
                    readOnly
                    value={selectedDate || 'Not selected yet'}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-3.5 py-2.5 font-semibold cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Preferred Time Slot</label>
                  <input 
                    type="text" 
                    readOnly
                    value={selectedTimeSlot || 'Not selected yet'}
                    className="w-full bg-slate-100 border border-slate-200 text-slate-600 rounded-xl px-3.5 py-2.5 font-semibold cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Date/Time Picker & Order Summary */}
          <div className="lg:col-span-5 space-y-8">
            
            {/* Date & Time Selection Widget */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Select Service Date & Time
              </h2>

              {/* Month Header with Prev/Next */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={goToPrevMonth}
                  disabled={isPrevMonthDisabled}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition ${
                    isPrevMonthDisabled
                      ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                      : 'border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500 cursor-pointer'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm font-extrabold text-slate-900">
                  {MONTH_NAMES[viewMonth]} {viewYear}
                </span>

                <button
                  type="button"
                  onClick={goToNextMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:border-orange-300 hover:text-orange-500 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Weekday labels */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {WEEKDAY_LABELS.map((wd) => (
                  <span key={wd} className="text-[10px] font-bold text-slate-400">
                    {wd}
                  </span>
                ))}
              </div>

              {/* Calendar grid — full month */}
              <div className="grid grid-cols-7 gap-1">
                {calendarCells.map((cell, idx) => {
                  if (cell.day === null) {
                    return <div key={`empty-${idx}`} />
                  }

                  const past = isPastDate(viewYear, viewMonth, cell.day)
                  const isSelected = selectedDate === cell.dateKey
                  const fullyBooked = cell.dateKey ? isDateFullyBooked(cell.dateKey) : false
                  const isDisabled = past || fullyBooked

                  return (
                    <button
                      key={cell.dateKey}
                      type="button"
                      disabled={isDisabled}
                      onClick={() => cell.dateKey && handleDateSelect(cell.dateKey)}
                      title={fullyBooked ? 'This date is fully booked' : undefined}
                      className={`aspect-square rounded-lg text-[11px] font-bold transition flex items-center justify-center border ${
                        isDisabled
                          ? 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed line-through decoration-slate-300'
                          : isSelected
                            ? 'bg-[#EE6C52] text-white border-[#EE6C52] shadow-xs cursor-pointer'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300 cursor-pointer'
                      }`}
                    >
                      {cell.day}
                    </button>
                  )
                })}
              </div>

              {/* Time slots — only meaningful once a date is picked */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">
                  {selectedDate ? 'Select Time Slot' : 'Select a date first to see time slots'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedTimeSlot === slot
                    const isDisabled = !selectedDate || unavailableSlots.has(slot)

                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={isDisabled}
                        onClick={() => handleTimeSlotSelect(slot)}
                        className={`py-2 px-2 rounded-xl text-[11px] font-extrabold transition border relative ${
                          isDisabled
                            ? 'bg-slate-100 text-slate-350 border-slate-100 cursor-not-allowed line-through decoration-slate-300'
                            : isSelected
                              ? 'bg-[#EE6C52] text-white border-[#EE6C52] shadow-xs cursor-pointer'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-orange-300 cursor-pointer'
                        }`}
                        title={selectedDate && unavailableSlots.has(slot) ? 'No vendor available at this time' : undefined}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
                {selectedDate && unavailableSlots.size > 0 && (
                  <p className="text-[10px] text-slate-400 font-medium pt-1">
                    Grey / crossed-out slots are already booked with our vendors on this date.
                  </p>
                )}
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-500 font-medium flex items-center gap-2">
                <span className="text-orange-500 text-sm">💡</span>
                <span>Our technician will arrive at your selected time slot.</span>
              </div>
            </div>

            {/* Order Summary Box */}
            <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200/80 space-y-5">
              <h2 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Subtotal ({cartItems.reduce((a, b) => a + b.quantity, 0)} Items)</span>
                  <span className="font-bold text-slate-900">Rs: {subtotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-slate-600 font-medium">
                  <span>Service & Visiting Charges</span>
                  <span className="font-bold text-slate-900">Rs: {visitingCharges}</span>
                </div>

                <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-900">Total Amount</span>
                  <span className="text-lg font-black text-[#EE6C52]">Rs: {totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-emerald-50 text-emerald-700 text-xs font-semibold p-3 rounded-xl flex items-center gap-2 border border-emerald-200/60">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>100% Satisfaction Guarantee Included</span>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <button 
                  onClick={handlePlaceOrder}
                  className="w-full bg-[#EE6C52] hover:bg-orange-600 text-white font-extrabold text-xs py-3.5 rounded-xl transition shadow-xs cursor-pointer"
                >
                  Continue
                </button>

                <Link href="/services" className="block w-full">
                  <button className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3.5 rounded-xl border border-slate-300 transition cursor-pointer">
                    Add More Services
                  </button>
                </Link>
              </div>

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
                  <li><Link href="#" className="hover:text-orange-500 transition">Terms Of Services</Link></li>
                  <li><Link href="#" className="hover:text-orange-500 transition">Disclaimer</Link></li>
                  <li><Link href="#" className="hover:text-orange-500 transition">FAQ</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-white">Contact Us</h3>
                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p>Our Support and Sales team is available 24/7 to answer your queries</p>
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