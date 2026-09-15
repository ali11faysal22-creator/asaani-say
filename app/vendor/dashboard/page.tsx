'use client'
import Link from 'next/link'
import React, { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { fetchServices, fetchVendorNotifications, fetchVendorProfile, formatSlotLabel, getStoredAuth, markVendorNotificationRead } from '@/app/lib/booking-api'
import {
  Wrench,
  ShieldCheck,
  ChevronDown,
  User,
  Settings,
  Bell,
  History,
  Plus,
  Trash2,
  Check,
  X,
  Save,
  CheckCircle2,
  CheckSquare,
  Loader2,
  Clock,
  Sparkles,
  ClipboardCheck
} from 'lucide-react'
import UnsavedChangesGuard from '../components/unsaved-changes-guard'

const GLOBAL_SERVICES_CATALOG: Record<string, string[]> = {
  'Home Inspection': [
    'Pre-Purchase Inspection',
    'Pre-Sale Inspection',
    'Property Condition Inspection',
    'Structural Inspection',
    'Electrical Inspection',
    'Plumbing Inspection'
  ],
  Plumber: [
    'Pipe Repair',
    'Water Leakage Repair',
    'Drain Cleaning',
    'Tap/Faucet Repair',
    'Sink Repair',
    'Toilet Repair',
    'Shower Repair',
    'Water Tank Repair'
  ],
  Electrician: [
    'Wiring & Rewiring',
    'Switch & Socket Repair',
    'Light Installation',
    'Fan Installation',
    'Circuit Breaker Repair',
    'DB Panel Work',
    'Short-Circuit Repair',
    'Power Outlet Installation',
    'Electrical Fault Detection',
    'Generator Wiring',
    'Inverter Installation',
    'Electrical Inspection'
  ],
  'AC Services': [
    'AC Repair',
    'AC Installation',
    'AC Cleaning',
    'AC Maintenance',
    'AC Gas Refilling',
    'AC Troubleshooting',
    'Split AC Service',
    'Window AC Service',
    'Central AC Service',
    'AC Duct Cleaning',
    'AC Replacement'
  ],
  Handyman: [
    'Furniture Assembly',
    'TV Mounting',
    'Curtain/Rod Installation',
    'Shelf Installation',
    'Picture Hanging',
    'Door Repair'
  ],
  Carpenter: [
    'Furniture Repair',
    'Custom Furniture',
    'Door Repair',
    'Door Installation',
    'Cabinet Repair',
    'Cabinet Installation'
  ],
  'Pest Control': [
    'Cockroach Control',
    'Termite Control',
    'Bed Bug Treatment',
    'Mosquito Control',
    'Ant Control',
    'Fly Control'
  ],
  'Geyser Services': [
    'Geyser Repair',
    'Geyser Installation',
    'Geyser Maintenance',
    'Geyser Cleaning',
    'Geyser Replacement'
  ],
  Painter: [
    'Interior Painting',
    'Exterior Painting',
    'Room Painting',
    'Wall Painting',
    'Ceiling Painting'
  ]
}

interface SubServiceItem {
  id: string
  title: string
  description: string
  price: string
  status: 'ACTIVE' | 'INACTIVE'
}

interface MainServiceGroup {
  mainCategory: string
  subServices: SubServiceItem[]
}

interface AvailabilityRow {
  day: string
  isSelected: boolean
  slots: string[]
}

function parseVendorAvailability(raw: unknown): AvailabilityRow[] {
  if (!raw) return []
  const value = typeof raw === 'string' ? (() => {
    try { return JSON.parse(raw) } catch { return null }
  })() : raw

  if (!value || typeof value !== 'object') return []
  if (Array.isArray(value)) {
    return value.map((item) => {
      const record = item && typeof item === 'object' ? item as Record<string, unknown> : {}
      const dayValue = record.day ?? record.day_of_week ?? record.dayName ?? ''
      const day = typeof dayValue === 'number'
        ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][dayValue] || String(dayValue)
        : String(dayValue)
      const fullDay = Boolean(record.is_full_day)
      const start = record.start_time ? String(record.start_time) : ''
      const end = record.end_time ? String(record.end_time) : ''
      return { day, isSelected: Boolean(record.is_enabled ?? true), slots: fullDay ? ['Full day'] : start && end ? [`${formatSlotLabel(start)} - ${formatSlotLabel(end)}`] : [] }
    }).filter((row) => row.day && (row.isSelected || row.slots.length > 0))
  }
  return Object.entries(value as Record<string, unknown>).map(([day, details]) => {
    if (Array.isArray(details)) {
      return { day, isSelected: details.length > 0, slots: details.map(String) }
    }
    const record = details && typeof details === 'object' ? details as Record<string, unknown> : {}
    const slots = record.slots ?? record.times ?? record.timeSlots ?? []
    return {
      day,
      isSelected: Boolean(record.isSelected ?? record.active ?? true),
      slots: Array.isArray(slots) ? slots.map(String) : slots ? [String(slots)] : []
    }
  }).filter((row) => row.isSelected || row.slots.length > 0)
}
type NotificationCategory = 'USER REQUESTS' | 'ORDER COMPLETED' | 'ORDER PENDING'
type NotificationVisual =
  | { kind: 'avatar'; src: string }
  | { kind: 'check' }
  | { kind: 'clock' }

interface NotificationItem {
  id: string
  category: NotificationCategory
  title: string
  time: string
  unread: boolean
  visual: NotificationVisual
}

const CATEGORY_ORDER: NotificationCategory[] = [
  'USER REQUESTS',
  'ORDER COMPLETED',
  'ORDER PENDING'
]

const CATEGORY_ALIAS_LOOKUP: Record<string, string> = {
  'plumber': 'Plumber',
  'plumbing': 'Plumber',
  'plumbing services': 'Plumber',
  'electrician': 'Electrician',
  'electrical services': 'Electrician',
  'painter': 'Painter',
  'painting services': 'Painter',
  'carpenter': 'Carpenter',
  'carpenter services': 'Carpenter',
  'handyman': 'Handyman',
  'handyman services': 'Handyman',
  'pest control': 'Pest Control',
  'pest control services': 'Pest Control',
  'geyser': 'Geyser Services',
  'ac service': 'AC Services',
  'ac services': 'AC Services',
  'geyser service': 'Geyser Services',
  'geyser services': 'Geyser Services',
  'home inspection': 'Home Inspection',
  'home inspections': 'Home Inspection',
  'service house inspection': 'Home Inspection',
}

function normalizeComparableName(value: string): string {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeCategoryName(rawCategory: string): string {
  const lookupKey = normalizeComparableName(rawCategory)
  if (CATEGORY_ALIAS_LOOKUP[lookupKey]) {
    return CATEGORY_ALIAS_LOOKUP[lookupKey]
  }

  const canonicalCategory = Object.keys(GLOBAL_SERVICES_CATALOG).find((cat) =>
    normalizeComparableName(cat) === lookupKey
  )

  return canonicalCategory || rawCategory
}

function normalizeServiceNameForCategory(category: string, rawService: string): string | null {
  const serviceName = String(rawService || '').trim()
  if (!serviceName) return null

  const catalogServices = GLOBAL_SERVICES_CATALOG[category] || []
  const canonicalMatch = catalogServices.find((serviceName) =>
    normalizeComparableName(serviceName) === normalizeComparableName(rawService)
  )

  if (canonicalMatch) {
    return canonicalMatch
  }

  const looseFind = catalogServices.find((serviceName) =>
    normalizeComparableName(serviceName).includes(normalizeComparableName(rawService)) ||
    normalizeComparableName(rawService).includes(normalizeComparableName(serviceName))
  )

  return looseFind || serviceName
}
function NotificationPopover() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  useEffect(() => {
    let active = true
    const loadNotifications = async () => {
      try {
        const auth = getStoredAuth('vendor')
        if (!auth || auth.role !== 'vendor') return
        const rows = await fetchVendorNotifications(auth.profile_id || auth.user_id)
        if (!active) return
        const uniqueRows = rows.filter((row, index, items) => index === items.findIndex((candidate) => candidate.title === row.title && candidate.body === row.body && candidate.type === row.type))
        setNotifications(uniqueRows.map((row) => ({
          id: row.id,
          category: row.type === 'booking' ? 'USER REQUESTS' : 'ORDER PENDING',
          title: row.type === 'booking' ? row.body : row.title,
          time: row.created_at ? new Date(row.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short', hour12: true }) : 'Just now',
          unread: !row.is_read,
          visual: { kind: 'clock' }
        })))
      } catch (error) {
        console.error('Unable to load dashboard notifications', error)
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
    const auth = getStoredAuth('vendor')
    if (auth?.profile_id) {
      await Promise.all(notifications.filter((item) => item.unread).map((item) => markVendorNotificationRead(auth.profile_id, item.id).catch(() => undefined)))
    }
    setNotifications((items) => items.map((item) => ({ ...item, unread: false })))
  }

  const handleMarkSingleAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((item) => item.id === id ? { ...item, unread: false } : item))
    const auth = getStoredAuth('vendor')
    if (auth?.profile_id) await markVendorNotificationRead(auth.profile_id, id).catch(() => undefined)
  }

  const groupedNotifications = CATEGORY_ORDER.map((category) => ({
    category,
    items: notifications.filter((n) => n.category === category)
  })).filter((group) => group.items.length > 0)

  return (
    <div className="relative inline-block text-left font-sans">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer"
      >
        <Bell className="w-3.5 h-3.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#EE6C52] rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 mt-3 w-85 sm:w-95 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden">
            <div className="absolute -top-2 right-3.5 w-4 h-4 bg-white rotate-45 border-l border-t border-slate-100" />

            <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 relative bg-white">
              <h3 className="text-sm font-extrabold text-[#1E2337]">
                Notifications
              </h3>

              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-[#EE6C52] hover:underline cursor-pointer disabled:opacity-40"
                disabled={notifications.length === 0}
              >
                Mark all as read
              </button>
            </div>

            <div className="max-h-105 overflow-y-auto">
              {groupedNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No new notifications
                </div>
              ) : (
                groupedNotifications.map((group) => (
                  <div key={group.category}>
                    <div className="px-5 pt-4 pb-2 flex items-center gap-2">
                      <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase whitespace-nowrap">
                        {group.category}
                      </span>
                      <span className="h-px bg-slate-100 flex-1" />
                    </div>

                    <div className="divide-y divide-slate-50">
                      {group.items.map((item) => (
                        <div
                          key={item.id}
                          onClick={() => void handleMarkSingleAsRead(item.id)}
                          className="px-5 py-3.5 flex items-start gap-3.5 transition hover:bg-slate-50 cursor-pointer group"
                          title="Click to mark as read"
                        >
                          {item.visual.kind === 'avatar' ? (
                            <img
                              src={item.visual.src}
                              alt=""
                              className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5 bg-slate-100"
                            />
                          ) : item.visual.kind === 'check' ? (
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-4 h-4" strokeWidth={3} />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-orange-100 text-[#EE6C52] flex items-center justify-center shrink-0 mt-0.5">
                              <Clock className="w-4 h-4" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h4
                              className={`text-xs leading-snug ${
                                item.unread
                                  ? 'font-extrabold text-[#1E2337]'
                                  : 'font-semibold text-slate-600'
                              }`}
                            >
                              {item.title}
                            </h4>
                            <span className="text-[10px] font-medium text-slate-400 mt-1 block">
                              {item.time}
                            </span>
                          </div>

                          {item.unread && (
                            <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5 group-hover:bg-slate-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

            
            <div className="p-3 bg-slate-50/80 border-t border-slate-100 text-center">
             <Link
  href="/vendor/notifications"
  onClick={() => setIsOpen(false)}
  className="text-xs font-bold text-slate-600 hover:text-[#1E2337] transition cursor-pointer block"
>
  See all notifications
</Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
function SelectionSummaryCard({ group }: { group: MainServiceGroup }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-md relative overflow-hidden">
  
      <div className="absolute -right-6 -top-6 w-24 h-24 bg-[#EE6C52]/10 rounded-full" />

      <div className="flex items-center gap-2.5 mb-4 relative">
        <div className="w-8 h-8 rounded-lg bg-[#EE6C52]/15 flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-4 h-4 text-[#EE6C52]" />
        </div>
        <div className="min-w-0">
          <span className="text-[9px] font-bold text-black uppercase tracking-wider block">
            Your Selected Main Service
          </span>
          <h3 className="text-sm font-extrabold text-black truncate">
            {group.mainCategory}
          </h3>
        </div>
      </div>

      <div className="space-y-2 relative">
        {group.subServices.map((sub) => (
          <div
            key={sub.id}
            className="flex items-center gap-2.5 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#EE6C52] shrink-0" strokeWidth={2.5} />
            <span className="text-[11px] font-semibold text-black truncate">
              {sub.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
export default function VendorDashboardPage() {
  const router = useRouter()
  const searchInputRef = useRef<HTMLSelectElement>(null)

  const [activeTab, setActiveTab] = useState('Profile')
  const [selectedMainCategorySearch, setSelectedMainCategorySearch] = useState('')
  const [selectedSubCategoryFilter, setSelectedSubCategoryFilter] = useState('All Sub-Services')
  
  const [servicesData, setServicesData] = useState<MainServiceGroup[]>([])
  const [savedServicesData, setSavedServicesData] = useState('')
  const [availabilityData, setAvailabilityData] = useState<AvailabilityRow[]>([])
  const [marketPrices, setMarketPrices] = useState<Record<string, string>>({})

  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'saving' | 'success'
  }>({ show: false, message: '', type: 'success' })

  useEffect(() => {
    const hydrateDashboardFromBackend = async () => {
      try {
        if (typeof window === 'undefined') return

        const auth = getStoredAuth('vendor')
        if (!auth || auth.role !== 'vendor') {
          router.push('/vendor/login')
          return
        }

        const vendorId = auth.profile_id || auth.user_id
        const [vendor, catalogServices] = await Promise.all([
          fetchVendorProfile(vendorId),
          fetchServices(),
        ])
        const marketPrices = new Map(
          catalogServices
            .filter((service) => service.price != null)
            .map((service) => [normalizeComparableName(service.name), `Rs. ${service.price!.toLocaleString()}`])
        )
          setMarketPrices(Object.fromEntries(marketPrices))
        const categories = Array.isArray(vendor?.categories) ? vendor.categories : []
        const services = Array.isArray(vendor?.services) ? vendor.services : []
        const servicesByCategory = vendor?.services_by_category || {}
        const rawAvailability = vendor?.availability ?? vendor?.weekly_availability ?? vendor?.weeklyAvailability ?? vendor?.schedule
        setAvailabilityData(parseVendorAvailability(rawAvailability))

        if (categories.length > 0 && (services.length > 0 || Object.keys(servicesByCategory).length > 0)) {
          const parsedGroups: MainServiceGroup[] = categories
            .map((mainCat: string): MainServiceGroup => {
              const canonicalCategory = normalizeCategoryName(mainCat)
              const categoryCatalog = GLOBAL_SERVICES_CATALOG[canonicalCategory] || []
              const categoryServicesFromBackend = Object.entries(servicesByCategory).find(
                ([categoryName]) => normalizeCategoryName(categoryName) === canonicalCategory
              )?.[1]
              const servicesForCategory = categoryServicesFromBackend ?? services.filter((serviceTitle) =>
                categoryCatalog.length === 0 || categoryCatalog.some((catalogTitle) => {
                  const catalogName = normalizeComparableName(catalogTitle)
                  const serviceName = normalizeComparableName(serviceTitle)
                  return catalogName === serviceName || catalogName.includes(serviceName) || serviceName.includes(catalogName)
                })
              )
              const categoryServices = servicesForCategory
                .map((serviceTitle: string) => normalizeServiceNameForCategory(canonicalCategory, serviceTitle))
                .filter((title: string | null): title is string => Boolean(title))

              const unmatchedServices = categoryCatalog.length === 0 ? services.map(String) : []

              const uniqueCategoryServices = Array.from(new Set([...categoryServices, ...unmatchedServices])) as string[]

              return {
                mainCategory: canonicalCategory,
                subServices: uniqueCategoryServices.map((subTitle: string, idx: number) => ({
                  id: `${canonicalCategory.toLowerCase().replace(/\s+/g, '-')}-${idx}-${Date.now()}`,
                  title: subTitle,
                  description: `Professional ${subTitle} service provided with complete quality guarantee.`,
                  price: marketPrices.get(normalizeComparableName(subTitle)) || 'Price unavailable',
                  status: 'ACTIVE' as const
                }))
              }
            })
            .filter((group: MainServiceGroup) => group.subServices.length > 0)

          setServicesData(parsedGroups)
          setSavedServicesData(JSON.stringify(parsedGroups))
        } else {
          const savedCategoriesStr = localStorage.getItem('vendor_selected_categories')
          const savedSubServicesStr = localStorage.getItem('vendor_selected_sub_services')
          const savedCategories: string[] = savedCategoriesStr ? JSON.parse(savedCategoriesStr) : []
          const savedSubServices: string[] = savedSubServicesStr ? JSON.parse(savedSubServicesStr) : []

          if (savedCategories.length > 0) {
            const parsedGroups: MainServiceGroup[] = savedCategories.map((mainCat) => {
              const catalogSubs = GLOBAL_SERVICES_CATALOG[mainCat] || []
              const vendorSubsForCat = savedSubServices.filter((sub) => catalogSubs.includes(sub))

              return {
                mainCategory: mainCat,
                subServices: vendorSubsForCat.map((subTitle, idx) => ({
                  id: `${mainCat.toLowerCase().replace(/\s+/g, '-')}-${idx}-${Date.now()}`,
                  title: subTitle,
                  description: `Professional ${subTitle} service provided with complete quality guarantee.`,
                  price: marketPrices.get(normalizeComparableName(subTitle)) || 'Price unavailable',
                  status: 'ACTIVE' as const
                }))
              }
            })

            setServicesData(parsedGroups)
            setSavedServicesData(JSON.stringify(parsedGroups))
          }
        }
      } catch (error) {
        console.error('Unable to hydrate vendor dashboard from backend route.', error)
      }
    }

    hydrateDashboardFromBackend()
  }, [router])

  const updateServicesDataAndStorage = (newData: MainServiceGroup[]) => {
    setServicesData(newData)
    if (typeof window !== 'undefined') {
      const activeCategories = newData.map((g) => g.mainCategory)
      const activeSubServices = newData.flatMap((g) => g.subServices.map((s) => s.title))

      localStorage.setItem('vendor_selected_categories', JSON.stringify(activeCategories))
      localStorage.setItem('vendor_selected_sub_services', JSON.stringify(activeSubServices))
    }
  }

  const handleSaveChanges = () => {
    setToast({
      show: true,
      message: 'Updating your dashboard services catalog...',
      type: 'saving'
    })

    updateServicesDataAndStorage(servicesData)
    setSavedServicesData(JSON.stringify(servicesData))

    setTimeout(() => {
      setToast({
        show: true,
        message: 'Changes saved successfully to your dashboard!',
        type: 'success'
      })

      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }))
      }, 3000)
    }, 1000)
  }

  const handleSignOut = () => {
    router.push('/vendor/login')
  }

  const servicesAreDirty = Boolean(savedServicesData) && JSON.stringify(servicesData) !== savedServicesData

  const handleAddNewServiceClick = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus()
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleDeleteSubService = (mainCatIndex: number, subId: string) => {
    const updated = [...servicesData]
    updated[mainCatIndex].subServices = updated[mainCatIndex].subServices.filter(
      (item) => item.id !== subId
    )

    if (updated[mainCatIndex].subServices.length === 0) {
      updated.splice(mainCatIndex, 1)
    }

    setServicesData(updated)
  }

  const handleDeleteMainCategory = (mainCatIndex: number) => {
    const updated = [...servicesData]
    updated.splice(mainCatIndex, 1)
    setServicesData(updated)
  }

  const handleAddServiceToCatalog = (category: string, subServiceTitle: string) => {
    const existingCatIndex = servicesData.findIndex(
      (item) => item.mainCategory === category
    )

    if (existingCatIndex === -1 && servicesData.length >= 2) {
      alert('A single vendor can only select up to 2 Main Service categories!')
      return
    }

    const newSubItem: SubServiceItem = {
      id: Date.now().toString(),
      title: subServiceTitle,
      description: `Professional ${subServiceTitle} service provided with complete quality guarantee.`,
      price: marketPrices[normalizeComparableName(subServiceTitle)] || 'Price unavailable',
      status: 'ACTIVE'
    }

    const updated = [...servicesData]
    if (existingCatIndex !== -1) {
      const isAlreadyAdded = updated[existingCatIndex].subServices.some(
        (s) => s.title === subServiceTitle
      )
      if (isAlreadyAdded) {
        alert('This sub-service is already added to your dashboard!')
        return
      }
      updated[existingCatIndex].subServices.push(newSubItem)
    } else {
      updated.push({
        mainCategory: category,
        subServices: [newSubItem]
      })
    }

    setServicesData(updated)
  }

  return (
    <>
      <UnsavedChangesGuard isDirty={servicesAreDirty} onSave={handleSaveChanges} />
      <div className="min-h-screen w-full bg-white grid grid-cols-1 md:grid-cols-12 font-sans overflow-hidden relative">
      
      
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-in-out">
          <div className="bg-[#2C2F45] text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
            {toast.type === 'saving' ? (
              <Loader2 className="w-4 h-4 text-[#EE6C52] animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-2 text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      
      <div className="md:col-span-3 lg:col-span-2.5 bg-[#3B3E56] text-white p-6 flex flex-col justify-between relative min-h-screen">
        <div>
          <div className="flex items-center gap-3 mb-10 pt-2">
            <div className="w-8 h-8 rounded-lg bg-[#EE6C52] flex items-center justify-center shadow-xs">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">Asaani Say</span>
          </div>

          <nav className="space-y-1">
        <Link
  href="/vendor/profile"
  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition cursor-pointer text-slate-300 hover:bg-white/5 hover:text-white"
>
  <User className="w-4 h-4 text-slate-300" />
  <span>Profile</span>
</Link>
<Link
  href="/vendor/settings"
  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
    activeTab === 'Settings'
      ? 'bg-white/10 text-white'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`}
>
  <Settings className="w-4 h-4 text-slate-300" />
  <span>Settings</span>
</Link>

          <Link
  href="/vendor/notifications"
  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
    activeTab === 'Notifications'
      ? 'bg-white/10 text-white'
      : 'text-slate-300 hover:bg-white/5 hover:text-white'
  }`}
>
  <Bell className="w-4 h-4 text-slate-300" />
  <span>Notifications</span>
</Link>
            <button
              onClick={() => {
                setActiveTab('My Orders')
                router.push('/vendor/order-history')
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold transition cursor-pointer ${
                activeTab === 'My Orders'
                  ? 'bg-white/10 text-white'
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <History className="w-4 h-4 text-slate-300" />
              <span>My Orders</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-600/50 flex items-center gap-2 text-[10px] text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#EE6C52] shrink-0" />
          <span>Your service catalog settings are public and secured.</span>
        </div>
      </div>

      
      <div className="md:col-span-9 lg:col-span-9.5 bg-[#F8FAFC] p-6 md:p-10 flex flex-col justify-between min-h-screen overflow-y-auto">
        <div className="w-full max-w-6xl mx-auto space-y-6">
          
          
          <div className="flex items-center justify-between pb-2">
            <div className="relative inline-block text-left">
              <span className="text-xs font-semibold text-slate-700">
                English
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-800 mr-2">
                Dashboard
              </span>

              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:border-[#EE6C52] hover:text-[#EE6C52] px-4 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
              >
                Sign Out
              </button>

              
              <NotificationPopover />

              <button className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 transition shadow-2xs cursor-pointer">
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          
          <div className="flex items-center justify-between flex-wrap gap-4 pt-2">
            <div>
              <h1 className="text-2xl font-extrabold text-[#2C2F45]">
                My Selected Services
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Your signup choices are active below. Update pricing or add more sub-services.
              </p>
            </div>

            <button
              onClick={handleAddNewServiceClick}
              className="flex items-center gap-2 bg-[#EE6C52] hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Service</span>
            </button>
          </div>

          {availabilityData.length > 0 && (
            <section className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-[#EE6C52]" />
                <h2 className="text-sm font-extrabold text-slate-900">Availability & Time Slots</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availabilityData.map((row, index) => (
                  <div key={`${row.day}-${row.slots.join('-')}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                    <p className="text-xs font-extrabold text-slate-800">{row.day}</p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      {row.slots.length > 0 ? row.slots.join(', ') : 'Available'}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div className="md:col-span-6 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                1. Select Main Category
              </label>
              <div className="relative">
                <select
                  ref={searchInputRef}
                  value={selectedMainCategorySearch}
                  onChange={(e) => {
                    setSelectedMainCategorySearch(e.target.value)
                    setSelectedSubCategoryFilter('All Sub-Services')
                  }}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52] transition appearance-none cursor-pointer"
                >
                  <option value="">-- Choose Main Service --</option>
                  {Object.keys(GLOBAL_SERVICES_CATALOG).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="md:col-span-6 relative">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                2. Select Sub-Services
              </label>
              <div className="relative">
                <select
                  value={selectedSubCategoryFilter}
                  onChange={(e) => {
                    const subVal = e.target.value
                    setSelectedSubCategoryFilter(subVal)
                    if (
                      selectedMainCategorySearch &&
                      subVal !== 'All Sub-Services'
                    ) {
                      handleAddServiceToCatalog(
                        selectedMainCategorySearch,
                        subVal
                      )
                    }
                  }}
                  disabled={!selectedMainCategorySearch}
                  className="w-full bg-[#F8FAFC] border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52] transition appearance-none cursor-pointer disabled:opacity-50"
                >
                  <option value="All Sub-Services">
                    {selectedMainCategorySearch
                      ? `-- Add Sub-service under ${selectedMainCategorySearch} --`
                      : 'Select Main Service First'}
                  </option>
                  {selectedMainCategorySearch &&
                    GLOBAL_SERVICES_CATALOG[selectedMainCategorySearch]?.map(
                      (sub) => (
                        <option key={sub} value={sub}>
                          + Add {sub}
                        </option>
                      )
                    )}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
              </div>
            </div>
          </div>

          
          {servicesData.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#EE6C52]" />
                <h2 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">
                  Your Selection Summary
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicesData.map((group) => (
                  <SelectionSummaryCard key={group.mainCategory} group={group} />
                ))}
              </div>
            </div>
          )}

          
          <div className="space-y-6 pt-2">
            {servicesData.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                No active services found. Select your main category from the dropdown above.
              </div>
            ) : (
              servicesData.map((mainGroup, mainIndex) => (
                <div
                  key={mainGroup.mainCategory}
                  className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5 relative"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="w-3 h-3 rounded-full bg-[#EE6C52]"></span>
                      <h2 className="text-lg font-extrabold text-[#2C2F45]">
                        {mainGroup.mainCategory}
                      </h2>
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-white bg-[#EE6C52] px-3 py-1 rounded-full shadow-sm">
                        <ShieldCheck className="w-3 h-3" strokeWidth={2.5} />
                        MAIN SERVICE CATEGORY
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                        <CheckSquare className="w-3.5 h-3.5" strokeWidth={2.5} />
                        {mainGroup.subServices.length} Sub-service{mainGroup.subServices.length !== 1 ? 's' : ''} Selected by You
                      </span>
                      <button
                        onClick={() => handleDeleteMainCategory(mainIndex)}
                        className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg transition cursor-pointer"
                        title="Delete Entire Category Box"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mainGroup.subServices.map((subService) => (
                      <div
                        key={subService.id}
                        className="bg-[#FAFAFA] border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-orange-300 transition"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200 px-2 py-0.5 rounded-md">
                              {mainGroup.mainCategory}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                                subService.status === 'ACTIVE'
                                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  : 'bg-red-50 text-red-500 border-red-200'
                              }`}
                            >
                              {subService.status}
                            </span>
                          </div>

                          <h3 className="text-sm font-extrabold text-[#2C2F45]">
                            {subService.title}
                          </h3>
                          <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-2">
                            {subService.description}
                          </p>
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 block tracking-wider uppercase">
                              FIXED MARKET PRICE
                            </span>
                            <span className="text-xs font-extrabold text-[#EE6C52]">
                              {subService.price}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteSubService(mainIndex, subService.id)
                              }
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg transition cursor-pointer"
                              title="Delete Sub-service"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>

          
          {servicesData.length > 0 && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSaveChanges}
                className="flex items-center gap-2 bg-[#2C2F45] hover:bg-[#3B3E56] text-white text-xs font-bold px-8 py-3.5 rounded-xl transition shadow-md cursor-pointer uppercase tracking-wider"
              >
                <Save className="w-4 h-4 text-[#EE6C52]" />
                <span>Save Changes</span>
              </button>
            </div>
          )}
        </div>
      </div>

      </div>
    </>
  )
}