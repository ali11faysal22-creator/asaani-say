'use client'

import React, { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import {
  Camera,
  CheckCircle2,
  LayoutGrid,
  Plus,
  Star,
  X,
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Check,
  UserCheck,
  Phone,
  Navigation
} from 'lucide-react'
import { API_BASE, createCustomerAddress, fetchAddresses, fetchCategory, fetchDemoCustomer, getCurrentUser, getStoredAuth, type CatalogCategory, type CatalogService, type DateRow } from '../lib/booking-api'
import { categoryIcon } from '../lib/category-icons'
import CustomerNavbar from './customer-navbar'

interface AddressItem {
  id: string
  label: string
  line: string
  city?: string | null
  area?: string | null
  latitude: number
  longitude: number
  is_default: boolean
}

interface AssignedVendor {
  id: string
  business_name: string
  first_name: string
  last_name: string
  contact_number: string
  average_rating: number
  review_count: number
  distance_km: number
}

interface BookingResponse {
  id: string
  status: string
  service_name: string
  date: string
  slot_start: string
  slot_end: string
  vendor: AssignedVendor
}

export default function ServiceCategoryView({ slug }: { slug: string }) {
  const router = useRouter()
  const [category, setCategory] = useState<CatalogCategory | null>(null)
  const [selectedServices, setSelectedServices] = useState<CatalogService[]>([])
  
  // Modal & Flow States
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [addresses, setAddresses] = useState<AddressItem[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [customerId, setCustomerId] = useState<string>('')
  
  // Booking API States
  const [availableDates, setAvailableDates] = useState<{ date: string; available: boolean; vendor_count: number }[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots] = useState<{ start: string; end: string; available: boolean; vendor_count: number }[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null)
  
  const [loadingDates, setLoadingDates] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [findingVendors, setFindingVendors] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [vendors, setVendors] = useState<AssignedVendor[]>([])
  const [bookingData, setBookingData] = useState<BookingResponse | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [bookingError, setBookingError] = useState('')

  const Icon = categoryIcon(category?.icon)

  const handleDateSelect = useCallback((dateStr: string) => {
    setSelectedDate(dateStr)
    setSelectedSlot(null)
    setLoadingSlots(true)

    const serviceId = selectedServices[0]?.id || ''
    const serviceName = selectedServices[0]?.name || ''

    fetch(`${API_BASE}/api/availability/slots?address_id=${selectedAddress}&date=${dateStr}&service_id=${serviceId}&service=${encodeURIComponent(serviceName)}`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setSlots(data.slots || [])
        setLoadingSlots(false)
      })
      .catch(() => {
        setLoadingSlots(false)
      })
  }, [selectedAddress, selectedServices])

  // 1. Fetch Category Data
  useEffect(() => {
    fetchCategory(slug).then(setCategory).catch(() => {})
  }, [slug])

  // 2. Fetch the demo customer's real ID and addresses from the backend.
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const auth = getStoredAuth('customer') || await getCurrentUser().catch(() => null)
        const customer = auth?.role === 'customer' && auth.profile_id
          ? { id: auth.profile_id, addresses: await fetchAddresses(auth.profile_id) }
          : await fetchDemoCustomer()
        let customerAddresses = customer.addresses
        if (customerAddresses.length === 0 && auth?.role === 'customer') {
          const defaultAddress = await createCustomerAddress({
            customer_id: customer.id,
            label: 'Home',
            line: 'Lahore service area',
            city: 'Lahore',
            area: 'Lahore',
            latitude: 31.5204,
            longitude: 74.3587,
            is_default: true,
          })
          customerAddresses = [defaultAddress]
        }
        setCustomerId(customer.id)
        setAddresses(customerAddresses)
        const def = customerAddresses.find((a) => a.is_default) || customerAddresses[0]
        if (def) setSelectedAddress(def.id)
      } catch {
        setAddresses([])
      }
    }
    loadCustomer()
  }, [])

  // 3. Fetch Available Dates when Modal opens or Address changes
  useEffect(() => {
    if (isSlotModalOpen && selectedAddress) {
      const serviceId = selectedServices[0]?.id || ''
      const serviceName = selectedServices[0]?.name || ''

      fetch(`${API_BASE}/api/availability/dates?address_id=${selectedAddress}&service_id=${serviceId}&service=${encodeURIComponent(serviceName)}&days=30`, { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          const fetchedDates = data.dates || []
          setAvailableDates(fetchedDates)
          setLoadingDates(false)

          // Auto select first available date
          const validDate = fetchedDates.find((d: DateRow) => d.available) || fetchedDates[0]
          if (validDate) {
            handleDateSelect(validDate.date)
          }
        })
        .catch(() => {
          setLoadingDates(false)
        })
    }
  }, [isSlotModalOpen, selectedAddress, selectedServices, handleDateSelect])

  // Toggle Selected Services
  const toggleSelectService = (service: CatalogService) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  // 5. Find vendors first so the customer can review the available queue.
  const handleFindVendors = async () => {
    if (!selectedDate || !selectedSlot || !selectedAddress || selectedServices.length === 0) return
    setFindingVendors(true)
    setVendors([])

    const params = new URLSearchParams({
      address_id: selectedAddress,
      date: selectedDate,
      service_id: selectedServices[0].id,
      service: selectedServices[0].name,
      slot_start: selectedSlot.start,
      slot_end: selectedSlot.end,
    })

    try {
      const res = await fetch(`${API_BASE}/api/v1/vendors/search?${params}`, { credentials: 'include' })
      if (!res.ok) throw new Error('Unable to find vendors')
      setVendors(await res.json())
    } catch (error) {
      console.error(error)
    } finally {
      setFindingVendors(false)
    }
  }

  // 6. Place the booking after the customer reviews available vendors.
  const handleConfirmBooking = async () => {
    if (!customerId || !selectedDate || !selectedSlot || selectedServices.length === 0 || vendors.length === 0) return
    try {
      const auth = getStoredAuth('customer') || await getCurrentUser().catch(() => null)
      if (auth?.role !== 'customer') {
        setShowAuthPrompt(true)
        return
      }
    } catch {
      setShowAuthPrompt(true)
      return
    }
    setIsSubmitting(true)
    setBookingError('')

    const payload = {
      customer_id: customerId,
      service_id: selectedServices[0].id,
      vendor_id: vendors[0].id,
      service: selectedServices[0].name,
      address_id: selectedAddress,
      date: selectedDate,
      slot_start: selectedSlot.start,
      slot_end: selectedSlot.end,
      notes: 'Please assign highest rated vendor',
    }

    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        const result: BookingResponse = await res.json()
        setBookingData(result)
        const address = addresses.find((item) => item.id === selectedAddress)
        localStorage.setItem('asaani_latest_order', JSON.stringify({
          orderId: result.id,
          items: selectedServices.map((service) => ({
            id: service.id,
            title: service.name,
            numericPrice: service.price || 0,
            quantity: 1,
          })),
          bookingDetails: {
            fullName: 'Demo Customer',
            phone: '',
            email: '',
            address: address?.line || '',
          },
          selectedDate,
          selectedTimeSlot: `${selectedSlot.start} - ${selectedSlot.end}`,
          subtotal: totalPrice,
          visitingCharges: 0,
          totalAmount: totalPrice,
          status: 'Pending vendor acceptance',
          createdAt: new Date().toISOString(),
        }))
        const notification = {
          id: `booking-${result.id}`,
          message: 'Your service request has been submitted. We are waiting for vendor acceptance and will update you shortly.',
          type: 'app',
          createdAt: new Date().toISOString(),
          isRead: false,
        }
        const existingNotifications = JSON.parse(localStorage.getItem('asaani_user_notifications') || '[]')
        localStorage.setItem('asaani_user_notifications', JSON.stringify([notification, ...existingNotifications]))
        router.push('/order-confirmation')
      } else {
        const error = await res.json().catch(() => null)
        setBookingError(error?.detail || 'Booking could not be completed. Please try again.')
      }
    } catch (error) {
      console.error(error)
      setBookingError('Unable to connect to the booking service. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = selectedServices.reduce((acc, curr) => acc + (curr.price || 0), 0)

  return (
    <div className="w-full bg-white font-sans text-slate-800 relative min-h-screen pb-24">
      {/* Top Header */}
      <div className="bg-[#EEF2FB] text-xs text-slate-600 py-2.5 px-4 md:px-12 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-6">
          <span>Asaani Say@gmail.com</span>
          <span className="border-l border-slate-300 pl-6">+1 (333) 000-0000</span>
        </div>
        <div className="flex items-center gap-4 text-slate-700">
          <Camera className="w-4 h-4" />
          <LayoutGrid className="w-4 h-4" />
        </div>
      </div>

      <CustomerNavbar active="services" />

      {/* Catalog Services */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1E2342]">
            Select Services from {category?.name || 'Catalog'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">Select one or more services to proceed</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(category?.services || []).map((item) => {
            const isSelected = selectedServices.some((s) => s.id === item.id)
            return (
              <div
                key={item.id}
                onClick={() => toggleSelectService(item)}
                className={`bg-[#EEF2FB] rounded-xl p-3 flex items-center gap-3.5 shadow-sm transition cursor-pointer border ${
                  isSelected ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/30' : 'border-slate-300/60'
                }`}
              >
                <div className="relative w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={item.name} fill className="object-cover" />
                  ) : (
                    <Icon className={`w-8 h-8 ${category?.icon_class || 'text-slate-400'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-sm font-extrabold text-[#1E2342] truncate">{item.name}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{item.subtitle}</p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{item.rating || '4.9'}</span>
                    </div>
                    <button
                      className={`text-[11px] font-bold px-3 py-1 rounded flex items-center gap-1 transition ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-[#EE6C52] text-white hover:bg-orange-600'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 stroke-3" /> : <Plus className="w-3 h-3 stroke-3" />}
                      {isSelected ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Floating Continue Bar */}
      {selectedServices.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="bg-[#EE6C52] hover:bg-orange-600 text-white font-extrabold text-sm px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 border-2 border-white cursor-pointer"
          >
            <span>Continue ({selectedServices.length} Selected) • Rs: {totalPrice}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* SLOT & VENDOR ASSIGNMENT MODAL */}
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setIsSlotModalOpen(false)
                setBookingData(null)
                setVendors([])
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingData ? (
              <>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900">Select Date & Time Slot</h3>
                  <p className="text-xs text-slate-500">Auto-assigning top rated vendor within 10 km radius</p>
                </div>

                {/* 1. ADDRESS SELECTION */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500" /> Delivery Address
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr.id)}
                        className={`p-3 rounded-xl border cursor-pointer text-xs space-y-1 transition ${
                          selectedAddress === addr.id
                            ? 'border-orange-500 bg-orange-50/40 ring-1 ring-orange-500'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        <p className="font-bold text-slate-900">{addr.label}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{addr.line}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. REAL BACKEND DATES */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-500" /> Available Dates
                  </label>
                  {loadingDates ? (
                    <p className="text-xs text-slate-400 py-2">Checking vendors in range...</p>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                      {availableDates.map((item) => {
                        const d = new Date(item.date)
                        const isSelected = selectedDate === item.date
                        return (
                          <button
                            key={item.date}
                            disabled={!item.available}
                            onClick={() => handleDateSelect(item.date)}
                            className={`min-w-[68px] h-[68px] shrink-0 rounded-2xl flex flex-col items-center justify-center border text-xs transition cursor-pointer relative ${
                              isSelected
                                ? 'bg-[#3A3E59] text-white border-[#3A3E59] shadow-md scale-105'
                                : item.available
                                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                                : 'bg-slate-100 border-slate-100 text-slate-300 opacity-50 cursor-not-allowed'
                            }`}
                          >
                            <span className="text-[10px] font-medium">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                            <span className="text-base font-extrabold">{d.getDate()}</span>
                            {item.available && (
                              <span className="text-[9px] text-emerald-500 font-semibold">{item.vendor_count} free</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* 3. REAL BACKEND SLOTS */}
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500" /> Time Slots
                  </label>
                  {loadingSlots ? (
                    <p className="text-xs text-slate-400 py-2">Fetching slots for date...</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot, idx) => {
                        const isSelected = selectedSlot?.start === slot.start
                        return (
                          <button
                            key={idx}
                            disabled={!slot.available}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#EE6C52] text-white border-[#EE6C52] shadow-sm'
                                : slot.available
                                ? 'bg-white border-slate-200 text-slate-700 hover:border-orange-500 hover:bg-orange-50/20'
                                : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>{slot.start.slice(0, 5)} - {slot.end.slice(0, 5)}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                <button
                  disabled={!selectedDate || !selectedSlot || findingVendors || vendors.length > 0}
                  onClick={handleFindVendors}
                  className="w-full bg-[#EE6C52] hover:bg-orange-600 disabled:bg-slate-300 text-white font-extrabold text-sm py-3.5 rounded-xl transition shadow-md mt-4 cursor-pointer"
                >
                  {findingVendors ? 'Checking Availability...' : 'Continue'}
                </button>

                {vendors.length > 0 && (
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    {bookingError && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{bookingError}</p>}
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Service Request Sent</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">We have requested a vendor for this service and related services. If the vendor does not accept your request within 3 minutes, another vendor will be assigned automatically.</p>
                    </div>
                    <button
                      disabled={isSubmitting}
                      onClick={handleConfirmBooking}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold text-sm py-3.5 rounded-xl transition shadow-md cursor-pointer"
                    >
                      {isSubmitting ? 'Submitting Request...' : 'Confirm Request & Done'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              /* TOP VENDOR CONFIRMATION CARD */
              <div className="py-4 space-y-5">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">Booking Confirmed!</h3>
                  <p className="text-xs text-slate-500">Highest rated vendor automatically assigned within 10 km</p>
                </div>

                {/* VENDOR DETAILS CARD */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold text-lg shrink-0">
                      <UserCheck className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-extrabold text-slate-900 truncate">
                        {bookingData.vendor.business_name}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {bookingData.vendor.first_name} {bookingData.vendor.last_name}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/80 text-center">
                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-amber-500 font-extrabold text-xs">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {bookingData.vendor.average_rating}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Rating</p>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-slate-700 font-extrabold text-xs">
                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                        {bookingData.vendor.distance_km} km
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">Distance</p>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-slate-700 font-extrabold text-xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        Call
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{bookingData.vendor.contact_number}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBookingData(null)
                    setIsSlotModalOpen(false)
                    setSelectedServices([])
                    setVendors([])
                  }}
                  className="w-full bg-[#3A3E59] text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                >
                  Close & Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600"><UserCheck className="h-6 w-6" /></div>
            <h3 className="text-lg font-extrabold text-slate-900">Login or create an account</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">Please login or sign up before confirming your service request. Your account will be saved securely in our database.</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={() => router.push('/customer/login')} className="rounded-xl bg-orange-500 px-3 py-3 text-xs font-extrabold text-white hover:bg-orange-600">Login / Signup</button>
              <button onClick={() => setShowAuthPrompt(false)} className="rounded-xl border border-slate-200 px-3 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50">Go back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}