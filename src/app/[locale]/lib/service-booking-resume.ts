export const PENDING_SERVICE_BOOKING_KEY = 'asaani_pending_service_booking'

export interface PendingServiceBooking {
  slug: string
  serviceIds: string[]
  date?: string
  slot?: { start: string; end: string }
}

function isPendingServiceBooking(value: unknown): value is PendingServiceBooking {
  if (typeof value !== 'object' || value === null) return false
  const payload = value as Record<string, unknown>
  const slot = payload.slot

  return typeof payload.slug === 'string'
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(payload.slug)
    && Array.isArray(payload.serviceIds)
    && payload.serviceIds.length > 0
    && payload.serviceIds.every((id) => typeof id === 'string')
    && (payload.date === undefined
      || typeof payload.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(payload.date))
    && (slot === undefined || typeof slot === 'object'
      && slot !== null
      && 'start' in slot && typeof slot.start === 'string'
      && 'end' in slot && typeof slot.end === 'string')
}

export function readPendingServiceBooking(): PendingServiceBooking | null {
  const stored = sessionStorage.getItem(PENDING_SERVICE_BOOKING_KEY)
  if (!stored) return null

  try {
    const value: unknown = JSON.parse(stored)
    if (isPendingServiceBooking(value)) return value
  } catch (error) {
    console.warn('Unable to read pending service booking', error)
  }

  sessionStorage.removeItem(PENDING_SERVICE_BOOKING_KEY)
  return null
}
