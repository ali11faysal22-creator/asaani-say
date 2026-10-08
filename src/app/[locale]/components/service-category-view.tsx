'use client'

import { FieldError, errorBorder, fieldErrorsOf, messageOf } from '@/components/FieldError'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useRouter } from '@/i18n/navigation'
import {
  CheckCircle2,
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
  Navigation,
  Loader2
} from 'lucide-react'
import { API_BASE, createCustomerAddress, fetchAddresses, fetchCategory, fetchDemoCustomer, formatSlotLabel, getAccessToken, getCurrentUser, getStoredAuth, readError, updateCustomerAddress, type ApiAddress, type CatalogCategory, type CatalogService, type DateRow } from '../lib/booking-api'
import { categoryIcon } from '../lib/category-icons'
import { LocationPicker } from './location-picker'
import CustomerNavbar from './customer-navbar'

import { BreadcrumbBar } from '@/components/Breadcrumbs'
import PublicContactBar from './public-contact-bar'
import PublicFooter from './public-footer'
import { useLanguage } from '../lib/i18n'
import { PENDING_SERVICE_BOOKING_KEY, readPendingServiceBooking } from '../lib/service-booking-resume'

const PENDING_SERVICE_ADDRESS_KEY = 'asaani_pending_service_address'

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
  created_at: string
  service_name: string
  date: string
  slot_start: string
  slot_end: string
  customer_name: string
  customer_phone?: string | null
  address: AddressItem
  vendor: AssignedVendor | null
}

export default function ServiceCategoryView({ slug }: { slug: string }) {
  const { language, t } = useLanguage()
  const router = useRouter()
  const [category, setCategory] = useState<CatalogCategory | null>(null)
  const [selectedServices, setSelectedServices] = useState<CatalogService[]>([])
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [addresses, setAddresses] = useState<AddressItem[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>('')
  const [customerId, setCustomerId] = useState<string>('')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [newAddressLine, setNewAddressLine] = useState('')
  const [newAddressArea, setNewAddressArea] = useState('')
  const [newAddressLat, setNewAddressLat] = useState(31.5204)
  const [newAddressLng, setNewAddressLng] = useState(74.3587)
  const [savingAddress, setSavingAddress] = useState(false)
  const [availableDates, setAvailableDates] = useState<{ date: string; available: boolean; vendor_count: number }[]>([])
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [slots, setSlots] = useState<{ start: string; end: string; available: boolean; vendor_count: number }[]>([])
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null)
  
  const [loadingDates, setLoadingDates] = useState(false)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingData, setBookingData] = useState<BookingResponse | null>(null)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [addressErrors, setAddressErrors] = useState<Record<string, string>>({})
  const resumedBookingRef = useRef<{ date?: string; slot?: { start: string; end: string } } | null>(null)

  const Icon = categoryIcon(category?.icon)

  const handleDateSelect = useCallback((dateStr: string, preferredSlot?: { start: string; end: string }) => {
    setSelectedDate(dateStr)
    setSelectedSlot(null)
    setLoadingSlots(true)

    const serviceId = selectedServices[0]?.id || ''
    const serviceName = selectedServices[0]?.name || ''

    fetch(`${API_BASE}/api/availability/slots?address_id=${selectedAddress}&date=${dateStr}&service_id=${serviceId}&service=${encodeURIComponent(serviceName)}`)
      .then((res) => res.json())
      .then((data) => {
        const availableSlots = data.slots || []
        setSlots(availableSlots)
        const restoredSlot = preferredSlot
          ? availableSlots.find((slot: { start: string; end: string; available: boolean }) =>
              slot.start === preferredSlot.start && slot.end === preferredSlot.end && slot.available)
          : undefined
        if (restoredSlot) setSelectedSlot({ start: restoredSlot.start, end: restoredSlot.end })
        setLoadingSlots(false)
      })
      .catch(() => {
        setLoadingSlots(false)
      })
  }, [selectedAddress, selectedServices])
  useEffect(() => {
    fetchCategory(slug).then(setCategory).catch(() => {})
  }, [slug])
  useEffect(() => {
    if (!category || getStoredAuth('customer')?.role !== 'customer') return

    const pendingBooking = readPendingServiceBooking()
    if (!pendingBooking) return
    if (pendingBooking.slug !== slug) return

    const restoredServices = (category.services || []).filter((service) => pendingBooking.serviceIds.includes(service.id))
    if (restoredServices.length === 0) {
      console.warn('Pending service booking no longer matches this service category')
      sessionStorage.removeItem(PENDING_SERVICE_BOOKING_KEY)
      return
    }

    resumedBookingRef.current = { date: pendingBooking.date, slot: pendingBooking.slot }
    queueMicrotask(() => {
      setSelectedServices(restoredServices)
      setIsSlotModalOpen(true)
    })
    sessionStorage.removeItem(PENDING_SERVICE_BOOKING_KEY)
  }, [category, slug])
  useEffect(() => {
    const loadCustomer = async () => {
      try {
        const auth = getStoredAuth('customer') || await getCurrentUser('customer').catch(() => null)
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
        let restoredAddress: ApiAddress | null = null
        if (auth?.role === 'customer' && getAccessToken('customer')) {
          const pendingAddress = sessionStorage.getItem(PENDING_SERVICE_ADDRESS_KEY)
          if (pendingAddress) {
            try {
              const draft: unknown = JSON.parse(pendingAddress)
              if (
                typeof draft === 'object' && draft !== null
                && 'line' in draft && typeof draft.line === 'string'
                && 'area' in draft && typeof draft.area === 'string'
                && 'latitude' in draft && typeof draft.latitude === 'number'
                && 'longitude' in draft && typeof draft.longitude === 'number'
              ) {
                try {
                  const homeAddress = customerAddresses.find((item) => item.label.trim().toLowerCase() === 'home')
                    || (customerAddresses.length >= 2
                      ? customerAddresses.find((item) => item.is_default) || customerAddresses[0]
                      : undefined)
                  const addressPayload = {
                    label: homeAddress?.label || 'Home',
                    line: draft.line.trim(),
                    city: 'Lahore',
                    area: draft.area.trim() || 'Lahore',
                    latitude: draft.latitude,
                    longitude: draft.longitude,
                    is_default: true,
                  }
                  restoredAddress = homeAddress
                    ? await updateCustomerAddress(homeAddress.id, customer.id, addressPayload)
                    : await createCustomerAddress({ customer_id: customer.id, ...addressPayload })
                  customerAddresses = await fetchAddresses(customer.id)
                  sessionStorage.removeItem(PENDING_SERVICE_ADDRESS_KEY)
                } catch (error) {
                  setNewAddressLine(draft.line)
                  setNewAddressArea(draft.area)
                  setNewAddressLat(draft.latitude)
                  setNewAddressLng(draft.longitude)
                  setShowNewAddressForm(true)
                  setBookingError(error instanceof Error ? error.message : 'Unable to save address')
                }
              }
            } catch {
              sessionStorage.removeItem(PENDING_SERVICE_ADDRESS_KEY)
            }
          }
        }
        setAddresses(customerAddresses)
        const def = restoredAddress || customerAddresses.find((a) => a.is_default) || customerAddresses[0]
        if (def) setSelectedAddress(def.id)
      } catch {
        setAddresses([])
      }
    }
    loadCustomer()
  }, [])
  useEffect(() => {
    if (isSlotModalOpen && selectedAddress) {
      queueMicrotask(() => setLoadingDates(true))
      const serviceId = selectedServices[0]?.id || ''
      const serviceName = selectedServices[0]?.name || ''

      fetch(`${API_BASE}/api/availability/dates?address_id=${selectedAddress}&service_id=${serviceId}&service=${encodeURIComponent(serviceName)}&days=30`)
        .then((res) => res.json())
        .then((data) => {
          const fetchedDates = data.dates || []
          setAvailableDates(fetchedDates)
          setLoadingDates(false)
          const resumedBooking = resumedBookingRef.current
          const resumedDate = resumedBooking?.date
          const resumedSlot = resumedBooking?.slot
          resumedBookingRef.current = null
          const validDate = (resumedDate && fetchedDates.find((date: DateRow) =>
            date.date === resumedDate && date.available))
            || fetchedDates.find((date: DateRow) => date.available)
            || fetchedDates[0]
          if (validDate) {
            handleDateSelect(
              validDate.date,
              resumedDate === validDate.date ? resumedSlot : undefined,
            )
          }
        })
        .catch(() => {
          setLoadingDates(false)
        })
    }
  }, [isSlotModalOpen, selectedAddress, selectedServices, handleDateSelect])
  const toggleSelectService = (service: CatalogService) => {
    if (selectedServices.some((s) => s.id === service.id)) {
      setSelectedServices(selectedServices.filter((s) => s.id !== service.id))
    } else {
      setSelectedServices([...selectedServices, service])
    }
  }

  const saveBookingDraftForLogin = () => {
    sessionStorage.setItem(PENDING_SERVICE_BOOKING_KEY, JSON.stringify({
      slug,
      serviceIds: selectedServices.map((service) => service.id),
      ...(selectedDate ? { date: selectedDate } : {}),
      ...(selectedSlot ? { slot: selectedSlot } : {}),
    }))
  }

  const saveAddressDraftForLogin = () => {
    sessionStorage.setItem(PENDING_SERVICE_ADDRESS_KEY, JSON.stringify({
      line: newAddressLine,
      area: newAddressArea,
      latitude: newAddressLat,
      longitude: newAddressLng,
    }))
    saveBookingDraftForLogin()
  }

  const handleAddAddress = async () => {
    if (!newAddressLine.trim()) {
      setAddressErrors({ line: 'Address is required.' })
      return
    }
    setSavingAddress(true)
    setBookingError('')
    setAddressErrors({})

    try {
      const auth = await getCurrentUser('customer')
      const accessToken = getAccessToken('customer')
      if (auth.role !== 'customer' || !auth.profile_id || !accessToken) {
        saveAddressDraftForLogin()
        setShowAuthPrompt(true)
        return
      }

      setCustomerId(auth.profile_id)
      const currentAddresses = await fetchAddresses(auth.profile_id)
      const homeAddress = currentAddresses.find((item) => item.label.trim().toLowerCase() === 'home')
        || (currentAddresses.length >= 2
          ? currentAddresses.find((item) => item.is_default) || currentAddresses[0]
          : undefined)
      const addressPayload = {
        label: homeAddress?.label || 'Home',
        line: newAddressLine.trim(),
        city: 'Lahore',
        area: newAddressArea.trim() || 'Lahore',
        latitude: newAddressLat,
        longitude: newAddressLng,
        is_default: true,
      }
      const address = homeAddress
        ? await updateCustomerAddress(homeAddress.id, auth.profile_id, addressPayload)
        : await createCustomerAddress({ customer_id: auth.profile_id, ...addressPayload })

      setAddresses(await fetchAddresses(auth.profile_id))
      setSelectedAddress(address.id)
      setNewAddressLine('')
      setNewAddressArea('')
      setShowNewAddressForm(false)
      sessionStorage.removeItem(PENDING_SERVICE_ADDRESS_KEY)
    } catch (error) {
      if ((error as { status?: number }).status === 401) {
        saveAddressDraftForLogin()
        setShowAuthPrompt(true)
        return
      }
      const apiFieldErrors = fieldErrorsOf(error)
      if (Object.keys(apiFieldErrors).length) setAddressErrors(apiFieldErrors)
      else setBookingError(messageOf(error, 'Unable to save address'))
    } finally {
      setSavingAddress(false)
    }
  }
  const handleConfirmBooking = async () => {
    if (!customerId || !selectedDate || !selectedSlot || selectedServices.length === 0) return
    try {
      const auth = getStoredAuth('customer') || await getCurrentUser('customer').catch(() => null)
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

    try {
      const payload = {
        customer_id: customerId,
        service_id: selectedServices[0].id,
        service: selectedServices[0].name,
        address_id: selectedAddress,
        date: selectedDate,
        slot_start: selectedSlot.start,
        slot_end: selectedSlot.end,
        notes: 'Please assign a vendor',
        total_amount: totalPrice || undefined,
      }
      const token = getAccessToken('customer')
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
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
            fullName: result.customer_name,
            phone: result.customer_phone || '',
            email: getStoredAuth('customer')?.email || '',
            address: result.address?.line || address?.line || '',
          },
          selectedDate,
          selectedTimeSlot: `${selectedSlot.start} - ${selectedSlot.end}`,
          subtotal: totalPrice,
          visitingCharges: 0,
          totalAmount: totalPrice,
          status: 'Pending vendor acceptance',
          createdAt: result.created_at,
        }))
        window.dispatchEvent(new Event('asaani-order-changed'))
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
        const { message } = await readError(res)
        setBookingError(message)
      }
    } catch (error) {
      console.error(error)
      setBookingError('Unable to reach the server. Please check your internet connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalPrice = selectedServices.reduce((acc, curr) => acc + (curr.price || 0), 0)

  return (
    <div className="w-full bg-white font-sans text-slate-800 relative min-h-screen">
      
      <PublicContactBar />

      <CustomerNavbar active="services" showLanguageSwitcher={false} />
      <BreadcrumbBar labels={category ? { [`/services/${slug}`]: t(category.name) } : undefined} />

      
      <section className="site-container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1E2342]">
            {t('Select Services from')} {t(category?.name || 'Catalog')}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{t('Select one or more services to proceed')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(category?.services || []).map((item) => {
            const isSelected = selectedServices.some((s) => s.id === item.id)
            return (
              <div
                key={item.id}
                className={`bg-[#EEF2FB] rounded-xl p-3 flex items-center gap-3.5 shadow-sm transition border ${
                  isSelected ? 'border-orange-500 ring-2 ring-orange-500/20 bg-orange-50/30' : 'border-slate-300/60'
                }`}
              >
                <div className="relative w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                  {item.image_url ? (
                    <Image src={item.image_url} alt={t(item.name)} fill className="object-cover" />
                  ) : (
                    <Icon className={`w-8 h-8 ${category?.icon_class || 'text-slate-400'}`} />
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <h3 className="text-sm font-extrabold text-[#1E2342] truncate">{t(item.name)}</h3>
                  <p className="text-[11px] text-slate-500 truncate">{item.subtitle ? t(item.subtitle) : ''}</p>
                  <p className="text-sm font-semibold text-orange-600">
                    {item.price != null ? `${t('Rs.')} ${item.price.toLocaleString()}` : t(item.price_label || 'Price unavailable')}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-700">{item.rating || '4.9'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSelectService(item)}
                      className={`shrink-0 whitespace-nowrap text-[10px] sm:text-[11px] font-bold px-2 sm:px-3 py-1 rounded flex items-center gap-1 transition cursor-pointer ${
                        isSelected ? 'bg-emerald-600 text-white' : 'bg-[#EE6C52] text-white hover:bg-orange-600'
                      }`}
                    >
                      {isSelected ? <Check className="w-3 h-3 stroke-3" /> : <Plus className="w-3 h-3 stroke-3" />}
                      {isSelected ? t('Selected') : t('Select')}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      
      {selectedServices.length > 0 && (
        <div className="fixed bottom-6 end-6 z-40">
          <button
            onClick={() => setIsSlotModalOpen(true)}
            className="bg-[#EE6C52] hover:bg-orange-600 text-white font-extrabold text-sm px-6 py-3.5 rounded-full shadow-2xl flex items-center gap-3 transition-all transform hover:scale-105 border-2 border-white cursor-pointer"
          >
            <span>{t('Continue')} ({selectedServices.length} {t('Selected')}{t(") • Rs:")}{' '}{totalPrice}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      
      {isSlotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto relative">
            <button
              onClick={() => {
                setIsSlotModalOpen(false)
                setBookingData(null)
              }}
              className="absolute top-5 end-5 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {!bookingData ? (
              <>
                <div className="space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-900">{t('Select Date & Time Slot')}</h3>
                  <p className="text-xs text-slate-500">{t('Auto-assigning top rated vendor within 10 km radius')}</p>
                </div>

                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-orange-500" /> {t('Delivery Address')}
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
                        <p className="font-bold text-slate-900">{t(addr.label)}</p>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{addr.line}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm((value) => !value)}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700"
                  >
                    {showNewAddressForm ? t('Cancel new address') : t('+ Add a new address')}
                  </button>
                  {showNewAddressForm && (
                    <div className="space-y-2 rounded-xl border border-orange-100 bg-orange-50/40 p-3">
                      <input
                        value={newAddressLine}
                        onChange={(event) => { setNewAddressLine(event.target.value); setAddressErrors((prev) => ({ ...prev, line: '' })) }}
                        placeholder={t('House 22, Street 5, Gulberg, Lahore')}
                        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-500 ${errorBorder(addressErrors.line)}`}
                      />
                      <FieldError message={addressErrors.line} />
                      <input
                        value={newAddressArea}
                        onChange={(event) => setNewAddressArea(event.target.value)}
                        placeholder={t('Area name, e.g. Gulberg')}
                        className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-orange-500 ${errorBorder(addressErrors.area)}`}
                      />
                      <FieldError message={addressErrors.area} />
                      <LocationPicker
                        label={t('Confirm this address on the map')}
                        hint={t('This pin is what we match you to the nearest, best-rated vendor with — drag it onto your exact spot.')}
                        latitude={newAddressLat}
                        longitude={newAddressLng}
                        onAddressResolved={({ address, area }) => {
                          setNewAddressLine(address)
                          if (area) setNewAddressArea(area)
                        }}
                        onLocationChange={(lat, lng) => {
                          setNewAddressLat(lat)
                          setNewAddressLng(lng)
                        }}
                      />
                      <button
                        type="button"
                        disabled={!newAddressLine.trim() || savingAddress}
                        onClick={() => void handleAddAddress()}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-xs font-bold text-white disabled:bg-slate-300"
                      >
                        {savingAddress ? t('Saving address...') : t('Save & use this address')}
                      </button>
                    </div>
                  )}
                </div>

                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-500" /> {t('Available Dates')}
                  </label>
                  {loadingDates ? (
                    <div className="flex items-center gap-2 py-3 text-xs font-semibold text-slate-400"><Loader2 className="h-4 w-4 animate-spin text-orange-500" /> {t("Checking availability...")}</div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                      {availableDates.map((item) => {
                        const d = new Date(item.date)
                        const isSelected = selectedDate === item.date
                        return (
                          <button
                            key={item.date}
                            disabled={false}
                            onClick={() => handleDateSelect(item.date)}
                            className={`min-w-17 h-17 shrink-0 rounded-2xl flex flex-col items-center justify-center border text-xs transition cursor-pointer relative ${
                              isSelected
                                ? 'bg-[#3A3E59] text-white border-[#3A3E59] shadow-md scale-105'
                                : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800'
                            }`}
                          >
                            <span className="text-[10px] font-medium">{d.toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'short' })}</span>
                            <span className="text-base font-extrabold">{d.getDate()}</span>
                            {item.available && (
                              <span className="text-[9px] text-emerald-500 font-semibold">{item.vendor_count} {t("free")}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                
                <div className="space-y-2 pt-1">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-orange-500" /> {t('Time Slots')}
                  </label>
                  {loadingSlots ? (
                    <div className="flex items-center gap-2 py-3 text-xs font-semibold text-slate-400"><Loader2 className="h-4 w-4 animate-spin text-orange-500" /> {t("Loading one-hour slots...")}</div>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {slots.map((slot, idx) => {
                        const isSelected = selectedSlot?.start === slot.start
                        const now = new Date()
                        const localDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                        const [slotHour, slotMinute] = slot.start.split(':').map(Number)
                        const isPastToday = selectedDate === localDate
                          && slotHour * 60 + slotMinute <= now.getHours() * 60 + now.getMinutes()
                        return (
                          <button
                            key={idx}
                            disabled={isPastToday}
                            onClick={() => setSelectedSlot(slot)}
                            className={`py-2.5 px-2 rounded-xl border text-[11px] font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                              isSelected
                                ? 'bg-[#EE6C52] text-white border-[#EE6C52] shadow-sm'
                                : !isPastToday
                                ? 'bg-white border-slate-200 text-slate-700 hover:border-orange-500 hover:bg-orange-50/20'
                                : 'bg-slate-100 border-slate-100 text-slate-300 cursor-not-allowed opacity-50'
                            }`}
                          >
                            <span>{formatSlotLabel(slot.start)} - {formatSlotLabel(slot.end)}</span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>

                {bookingError && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{t(bookingError)}</p>}

                <button
                  disabled={!selectedDate || !selectedSlot || isSubmitting}
                  onClick={() => void handleConfirmBooking()}
                  className="w-full bg-[#EE6C52] hover:bg-orange-600 disabled:bg-slate-300 text-white font-extrabold text-sm py-3.5 rounded-xl transition shadow-md mt-4 cursor-pointer"
                >
                  <span className="inline-flex items-center justify-center gap-2">{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}{isSubmitting ? t('Confirming booking...') : t('Confirm booking')}</span>
                </button>
              </>
            ) : (
              
              <div className="py-4 space-y-5">
                <div className="text-center space-y-1">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{t('Booking Confirmed!')}</h3>
                  <p className="text-xs text-slate-500">{t('Our team is reviewing your request and will assign a vendor shortly')}</p>
                </div>

                {bookingData.vendor ? (
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
                      <p className="text-[10px] text-slate-400 mt-0.5">{t("Rating")}</p>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-slate-700 font-extrabold text-xs">
                        <Navigation className="w-3.5 h-3.5 text-blue-500" />
                        {bookingData.vendor.distance_km} {t("km")}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t("Distance")}</p>
                    </div>

                    <div className="bg-white p-2 rounded-xl border border-slate-100">
                      <div className="flex items-center justify-center gap-1 text-slate-700 font-extrabold text-xs">
                        <Phone className="w-3.5 h-3.5 text-emerald-500" />
                        {t("Call")}</div>
                      <p className="text-[10px] text-slate-400 mt-0.5">{bookingData.vendor.contact_number}</p>
                    </div>
                  </div>
                </div>
                ) : (
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center shrink-0">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-slate-500">{t("We'll notify you as soon as a vendor is assigned to your request.")}</p>
                </div>
                )}

                <button
                  onClick={() => {
                    setBookingData(null)
                    setIsSlotModalOpen(false)
                    setSelectedServices([])
                  }}
                  className="w-full bg-[#3A3E59] text-white font-bold text-xs py-3 rounded-xl cursor-pointer"
                >
                  {t("Close & Done")}</button>
              </div>
            )}
          </div>
        </div>
      )}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 text-orange-600"><UserCheck className="h-6 w-6" /></div>
            <h3 className="text-lg font-extrabold text-slate-900">{t("Login or create an account")}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">{t("Please login or sign up before confirming your service request. Your account will be saved securely in our database.")}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  saveBookingDraftForLogin()
                  setShowAuthPrompt(false)
                  router.push('/customer/login')
                }}
                className="rounded-xl bg-orange-500 px-3 py-3 text-xs font-extrabold text-white hover:bg-orange-600"
              >
                {t('Login / Signup')}
              </button>
              <button onClick={() => setShowAuthPrompt(false)} className="rounded-xl border border-slate-200 px-3 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50">{t('Go back')}</button>
            </div>
          </div>
        </div>
      )}
      <PublicFooter />
    </div>
  )
}