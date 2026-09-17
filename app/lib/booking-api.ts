export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export type ApiAddress = {
  id: string
  label: string
  line: string
  city: string | null
  area: string | null
  latitude: number
  longitude: number
  is_default: boolean
}

export type DemoCustomer = {
  id: string
  full_name: string
  email: string | null
  phone?: string | null
  addresses: ApiAddress[]
}

export type CatalogService = {
  id: string
  category_id: string
  name: string
  slug: string
  subtitle: string | null
  rating: string | null
  price: number | null
  price_label: string | null
  image_url: string | null
  sort_order: number
}

export type CatalogCategory = {
  id: string
  name: string
  slug: string
  display_name: string
  icon: string | null
  icon_class: string | null
  hero_image: string | null
  tagline: string | null
  seo_title: string | null
  seo_intro: string | null
  seo_why: string | null
  highlights: string[]
  href: string
  services: CatalogService[]
}

export type DateRow = {
  date: string
  available: boolean
  vendor_count: number
}

export type SlotRow = {
  start: string
  end: string
  available: boolean
  vendor_count: number
}

export type AssignedVendor = {
  id: string
  business_name: string
  first_name: string
  last_name: string
  contact_number: string
  business_phone?: string | null
  addresses: ApiAddress[]
  city?: string | null
  area?: string | null
  average_rating: number
  review_count: number
  distance_km: number
}

export type BookingResult = {
  id: string
  status: string
  service_id?: string | null
  customer_id: string
  customer_name: string
  customer_phone?: string | null
  total_amount?: number | null
  created_at: string
  accepted_at?: string | null
  started_at?: string | null
  completed_at?: string | null
  service_name: string
  date: string
  slot_start: string
  slot_end: string
  address: ApiAddress
  vendor: AssignedVendor
  notifications: { title: string; body: string }[]
}

export type AuthRole = 'customer' | 'vendor' | 'admin'

export type AuthResponse = {
  user_id: string
  profile_id: string
  role: AuthRole
  email: string
  message: string
  access_token?: string | null
  token_type?: string
}

export type CustomerNotification = {
  id: string
  user_id: string
  title: string
  body: string
  type: string
  is_read: boolean
  created_at?: string
  createdAt?: string
}

export type VendorProfileResponse = {
  id: string
  business_name: string
  first_name: string
  last_name: string
  contact_number: string
  postal_code: string
  email?: string | null
  cnic: string
  experience_years: string
  service_areas: string[]
  contact_preferences: string[]
  bio?: string | null
  member_since: string
  completed_jobs: number
  average_rating?: number
  review_count?: number
  is_online?: boolean
  is_verified?: boolean
  profile_image_url?: string | null
  addresses?: ApiAddress[]
  city?: string | null
  area?: string | null
  categories: string[]
  services: string[]
  services_by_category?: Record<string, string[]>
  availability: Array<{
    day_of_week: number | string
    is_enabled: boolean
    is_full_day: boolean
    start_time: string | null
    end_time: string | null
  }>
  weekly_availability?: unknown
  weeklyAvailability?: unknown
  schedule?: unknown
}

export type VendorBookingAction = 'accept' | 'reject'

const AUTH_STORAGE_KEYS: Record<AuthRole, string> = {
  customer: 'asaani_customer_auth',
  vendor: 'asaani_vendor_auth',
  admin: 'asaani_admin_auth',
}

// The JWT is the one credential actually sent with requests (Authorization: Bearer).
// It lives in a single shared slot — whichever role logged in most recently — mirroring
// the single-cookie-session behavior this replaced (only one active login per browser).
const ACCESS_TOKEN_KEY = 'asaani_access_token'

function authStorage(role: AuthRole): Storage {
  return role === 'vendor' ? window.sessionStorage : window.localStorage
}

export function getStoredAuth(role: AuthRole): AuthResponse | null {
  if (typeof window === 'undefined') return null
  try {
    const parsed = JSON.parse(authStorage(role).getItem(AUTH_STORAGE_KEYS[role]) || 'null') as AuthResponse | null
    if (parsed?.role === role && parsed.profile_id && parsed.user_id) return parsed
  } catch {
  }
  return null
}

export function setStoredAuth(role: AuthRole, auth: AuthResponse): void {
  if (typeof window === 'undefined') return
  authStorage(role).setItem(AUTH_STORAGE_KEYS[role], JSON.stringify(auth))
  if (auth.access_token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, auth.access_token)
  }
}

export function clearStoredAuth(role: AuthRole): void {
  if (typeof window === 'undefined') return
  authStorage(role).removeItem(AUTH_STORAGE_KEYS[role])
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return window.localStorage.getItem(ACCESS_TOKEN_KEY)
}

async function readError(res: Response): Promise<string> {
  try {
    const data = await res.json()
    if (typeof data.detail === 'string') return data.detail
    return JSON.stringify(data.detail || data)
  } catch {
    return res.statusText
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken()
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    cache: 'no-store',
  })
  if (!res.ok) {
    const error = new Error(await readError(res)) as Error & { status?: number }
    error.status = res.status
    throw error
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export async function fetchCategories(): Promise<CatalogCategory[]> {
  return api('/api/v1/categories')
}

export async function fetchCategory(slug: string): Promise<CatalogCategory> {
  return api(`/api/v1/categories/${encodeURIComponent(slug)}`)
}

export async function fetchServices(categorySlug?: string): Promise<CatalogService[]> {
  const params = new URLSearchParams()
  if (categorySlug) params.set('category_slug', categorySlug)
  const query = params.toString()
  return api(`/api/v1/services${query ? `?${query}` : ''}`)
}

export async function fetchService(id: string): Promise<CatalogService> {
  return api(`/api/v1/services/${id}`)
}

export async function fetchDemoCustomer(): Promise<DemoCustomer> {
  return api('/api/demo/customer')
}

export async function registerCustomer(payload: {
  full_name: string
  email: string
  password: string
  phone?: string
  address?: string
  city?: string
  area?: string
}): Promise<AuthResponse> {
  return api('/api/auth/register/customer', { method: 'POST', body: JSON.stringify(payload) })
}

export async function registerVendor(payload: {
  email: string
  password: string
  first_name: string
  last_name: string
  contact_number: string
  business_name: string
  business_email?: string
  business_phone?: string
  house_address?: string
  categories?: string[]
  services?: string[]
  services_by_category?: Record<string, string[]>
  custom_service?: string
  availability?: Record<string, { isSelected: boolean; slots: string[] }>
}): Promise<AuthResponse> {
  return api('/api/auth/register/vendor', { method: 'POST', body: JSON.stringify(payload) })
}

export async function loginUser(payload: {
  identifier: string
  password: string
  role: AuthRole
}): Promise<AuthResponse> {
  return api('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })
}

export async function getCurrentUser(): Promise<AuthResponse> {
  try {
    const user = await api<AuthResponse>('/api/auth/me')
    setStoredAuth(user.role, user)
    return user
  } catch (error) {
    const status = (error as { status?: number }).status
    if (status === 401) {
      // Access token is missing, invalid, or expired — the cached copy is stale, drop it.
      clearStoredAuth('customer')
      clearStoredAuth('vendor')
      clearStoredAuth('admin')
      throw error
    }
    if (typeof window !== 'undefined') {
      const stored = getStoredAuth('customer') || getStoredAuth('vendor') || getStoredAuth('admin')
      if (stored) return stored
    }
    throw error
  }
}

export async function logoutUser(): Promise<void> {
  return api('/api/auth/logout', { method: 'POST' })
}

export async function fetchVendorProfile(vendorId: string): Promise<VendorProfileResponse> {
  return api(`/api/v1/vendors/${encodeURIComponent(vendorId)}`)
}

export async function updateVendorProfile(vendorId: string, payload: {
  first_name: string
  last_name: string
  business_name: string
  contact_number: string
  postal_code: string
  email: string
  cnic: string
  experience_years: string
  service_areas: string[]
  contact_preferences: string[]
  bio?: string | null
}): Promise<VendorProfileResponse> {
  return api(`/api/v1/vendors/${encodeURIComponent(vendorId)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function uploadVendorProfileImage(vendorId: string, file: File): Promise<VendorProfileResponse> {
  const formData = new FormData()
  formData.append('image', file)
  const token = getAccessToken()
  const res = await fetch(`${API_BASE}/api/v1/vendors/${encodeURIComponent(vendorId)}/profile-image`, {
    method: 'POST',
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    cache: 'no-store',
  })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

export async function fetchVendorNotifications(vendorId: string): Promise<Array<{ id: string; user_id: string; title: string; body: string; type: string; is_read: boolean; created_at?: string }>> {
  return api(`/api/v1/vendor/${encodeURIComponent(vendorId)}/notifications`)
}

export async function markVendorNotificationRead(vendorId: string, notificationId: string): Promise<void> {
  return api(`/api/v1/vendor/${encodeURIComponent(vendorId)}/notifications/${encodeURIComponent(notificationId)}/read`, { method: 'PATCH' })
}

export async function deleteVendorNotification(vendorId: string, notificationId: string): Promise<void> {
  return api(`/api/v1/vendor/${encodeURIComponent(vendorId)}/notifications/${encodeURIComponent(notificationId)}`, { method: 'DELETE' })
}

export async function decideVendorBooking(vendorId: string, bookingId: string, action: 'accept' | 'reject'): Promise<BookingResult> {
  return api(`/api/v1/vendor/bookings/${encodeURIComponent(bookingId)}/decision?vendor_id=${encodeURIComponent(vendorId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  })
}

export async function updateVendorBookingStatus(vendorId: string, bookingId: string, action: 'on_the_way' | 'in_progress' | 'completed'): Promise<BookingResult> {
  return api(`/api/v1/vendor/bookings/${encodeURIComponent(bookingId)}/status?vendor_id=${encodeURIComponent(vendorId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  })
}

export async function fetchCustomerBookings(customerId: string): Promise<BookingResult[]> {
  return api(`/api/v1/customer/bookings?customer_id=${encodeURIComponent(customerId)}`)
}

export async function fetchCustomerNotifications(customerId: string): Promise<CustomerNotification[]> {
  return api(`/api/v1/customer/notifications?customer_id=${encodeURIComponent(customerId)}`)
}

export async function markCustomerNotificationRead(customerId: string, notificationId: string): Promise<CustomerNotification> {
  return api(`/api/v1/customer/notifications/${notificationId}/read?customer_id=${encodeURIComponent(customerId)}`, { method: 'PATCH' })
}

export async function markAllCustomerNotificationsRead(customerId: string): Promise<CustomerNotification[]> {
  return api(`/api/v1/customer/notifications/read-all?customer_id=${encodeURIComponent(customerId)}`, { method: 'PATCH' })
}

export async function deleteCustomerNotification(customerId: string, notificationId: string): Promise<void> {
  return api(`/api/v1/customer/notifications/${notificationId}?customer_id=${encodeURIComponent(customerId)}`, { method: 'DELETE' })
}

export async function fetchAddresses(customerId: string): Promise<ApiAddress[]> {
  return api(`/api/v1/addresses?customer_id=${encodeURIComponent(customerId)}`)
}

export async function createCustomerAddress(payload: {
  customer_id: string
  label: string
  line: string
  city?: string
  area?: string
  latitude: number
  longitude: number
  is_default?: boolean
}): Promise<ApiAddress> {
  return api('/api/v1/addresses', { method: 'POST', body: JSON.stringify(payload) })
}

export async function updateCustomerAddress(
  addressId: string,
  customerId: string,
  payload: {
    label?: string
    line?: string
    city?: string
    area?: string
    latitude?: number
    longitude?: number
    is_default?: boolean
  }
): Promise<ApiAddress> {
  return api(`/api/v1/addresses/${encodeURIComponent(addressId)}?customer_id=${encodeURIComponent(customerId)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function bookingQuery(serviceId?: string, serviceName?: string) {
  const params = new URLSearchParams()
  if (serviceId) params.set('service_id', serviceId)
  if (serviceName) params.set('service', serviceName)
  return params
}

export async function fetchAvailableDates(
  addressId: string,
  options: { serviceId?: string; service?: string; days?: number } = {}
): Promise<DateRow[]> {
  const params = bookingQuery(options.serviceId, options.service)
  params.set('address_id', addressId)
  params.set('days', String(options.days ?? 45))
  const data = await api<{ dates: DateRow[] }>(`/api/bookings/dates?${params}`)
  return data.dates || []
}

export async function fetchAvailableSlots(
  addressId: string,
  date: string,
  options: { serviceId?: string; service?: string } = {}
): Promise<SlotRow[]> {
  const params = bookingQuery(options.serviceId, options.service)
  params.set('address_id', addressId)
  params.set('date', date)
  const data = await api<{ slots: SlotRow[] }>(`/api/bookings/slots?${params}`)
  return data.slots || []
}

export async function placeBooking(payload: {
  customer_id: string
  service_id?: string
  service?: string
  address_id: string
  date: string
  slot_start: string
  slot_end: string
  total_amount?: number
}): Promise<BookingResult> {
  return api('/api/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchVendorBookings(vendorId: string): Promise<BookingResult[]> {
  return api(`/api/v1/vendor/${encodeURIComponent(vendorId)}/bookings`)
}

export function serviceFromCart(items: { id?: string; serviceId?: string; title: string }[]): {
  serviceId?: string
  service?: string
} {
  if (!items.length) return { service: 'Plumbing Services' }
  const first = items[0]
  return {
    serviceId: first.serviceId || (looksLikeUuid(first.id) ? first.id : undefined),
    service: first.title,
  }
}

function looksLikeUuid(value?: string): boolean {
  return Boolean(value && /^[0-9a-f-]{36}$/i.test(value))
}

export function formatSlotLabel(hhmm: string): string {
  const match = hhmm.trim().match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/i)
  if (!match) return hhmm
  let h = Number(match[1])
  const m = match[2]
  const inputPeriod = match[3]?.toUpperCase()
  if (inputPeriod === 'PM' && h < 12) h += 12
  if (inputPeriod === 'AM' && h === 12) h = 0
  const period = h >= 12 ? 'PM' : 'AM'
  if (h === 0) h = 12
  else if (h > 12) h -= 12
  return `${h}:${m} ${period}`
}


export type AdminOverview = {
  total_customers: number
  total_vendors: number
  verified_vendors: number
  total_bookings: number
  completed_bookings: number
  total_revenue: number
}

export type AdminVendor = {
  id: string
  business_name: string
  first_name: string
  last_name: string
  email: string
  phone: string
  city: string | null
  area: string | null
  status: string
  is_verified: boolean
  is_online: boolean
  average_rating: number
  review_count: number
  created_at: string
}

export type AdminCustomer = {
  id: string
  full_name: string
  email: string
  phone: string
  default_address: string | null
  created_at: string
}

export type AdminBooking = {
  id: string
  customer_name: string
  vendor_name: string
  service_name: string
  status: string
  scheduled_date: string
  slot_start: string
  slot_end: string
  total_amount: number | null
  created_at: string
}

export async function fetchAdminOverview(): Promise<AdminOverview> {
  return api('/api/admin/overview')
}

export async function fetchAdminVendors(): Promise<AdminVendor[]> {
  return api('/api/admin/vendors')
}

export async function setAdminVendorVerified(vendorId: string, isVerified: boolean): Promise<AdminVendor> {
  return api(`/api/admin/vendors/${encodeURIComponent(vendorId)}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ is_verified: isVerified }),
  })
}

export async function setAdminVendorStatus(vendorId: string, status: 'approved' | 'suspended'): Promise<AdminVendor> {
  return api(`/api/admin/vendors/${encodeURIComponent(vendorId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function fetchAdminCustomers(): Promise<AdminCustomer[]> {
  return api('/api/admin/customers')
}

export async function fetchAdminBookings(): Promise<AdminBooking[]> {
  return api('/api/admin/bookings')
}

export type ServiceRequest = {
  id: string
  zip_code: string
  city: string
  service_name: string
  preferred_date: string
  preferred_time: string
  email: string
  phone: string
  status: 'new' | 'assigned' | 'closed'
  assigned_vendor_id: string | null
  assigned_vendor_name: string | null
  created_at: string
}

export async function submitServiceRequest(payload: {
  zip_code: string
  city: string
  service_name: string
  preferred_date: string
  preferred_time: string
  email: string
  phone: string
}): Promise<ServiceRequest> {
  return api('/api/service-requests', { method: 'POST', body: JSON.stringify(payload) })
}

export async function fetchAdminServiceRequests(): Promise<ServiceRequest[]> {
  return api('/api/admin/service-requests')
}

export async function assignServiceRequestVendor(requestId: string, vendorId: string): Promise<ServiceRequest> {
  return api(`/api/admin/service-requests/${encodeURIComponent(requestId)}/assign`, {
    method: 'PATCH',
    body: JSON.stringify({ vendor_id: vendorId }),
  })
}

export type ContactMessage = {
  id: string
  full_name: string
  email: string
  phone: string | null
  subject: string
  message: string
  is_read: boolean
  created_at: string
}

export async function submitContactMessage(payload: {
  full_name: string
  email: string
  phone?: string
  subject: string
  message: string
}): Promise<ContactMessage> {
  return api('/api/contact-messages', { method: 'POST', body: JSON.stringify(payload) })
}

export async function fetchAdminContactMessages(): Promise<ContactMessage[]> {
  return api('/api/admin/contact-messages')
}

export async function markContactMessageRead(messageId: string): Promise<ContactMessage> {
  return api(`/api/admin/contact-messages/${encodeURIComponent(messageId)}/read`, { method: 'PATCH' })
}

export function serviceNameFromCart(items: { title: string }[]): string {
  return serviceFromCart(items).service || 'Plumbing Services'
}
