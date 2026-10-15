import type { VendorBookingAction } from './booking-api'

/** Friendly confirmation shown after a vendor moves a booking forward. `t` is the translator. */
export function vendorActionSuccessMessage(action: VendorBookingAction, t: (text: string) => string): string {
  switch (action) {
    case 'accept': return t('Request accepted. The customer has been notified.')
    case 'reject': return t('Request declined.')
    case 'on_the_way': return t('Marked as on the way. The customer can now track you.')
    case 'reached': return t('Marked as reached.')
    case 'work_started': return t('Work started.')
    case 'cannot_start': return t('Reported that you cannot start. The customer has been notified.')
    case 'pause': return t('Work paused.')
    case 'resume': return t('Work resumed.')
    case 'work_complete': return t('Work marked as complete.')
    case 'request_payment': return t('Payment requested from the customer.')
    case 'payment_received': return t('Payment recorded. Thank you!')
  }
}
