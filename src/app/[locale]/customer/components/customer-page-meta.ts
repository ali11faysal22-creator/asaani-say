export const CUSTOMER_PAGE_META: Record<string, { title: string; subtitle: string; contentClassName?: string }> = {
  '/customer/dashboard': {
    title: 'Dashboard',
    subtitle: 'An overview of your bookings and order history.',
  },
  '/customer/orders': {
    title: 'My Orders',
    subtitle: 'Every service you have requested, past and present.',
  },
  '/customer/notifications': {
    title: 'Notifications',
    subtitle: 'Updates from Asaani Say, vendors and support.',
  },
}

export const DEFAULT_CUSTOMER_PAGE_META = { title: 'Dashboard', subtitle: undefined as string | undefined, contentClassName: 'w-full' }

export function resolveCustomerPageMeta(pathname: string | null) {
  if (!pathname) return DEFAULT_CUSTOMER_PAGE_META
  if (CUSTOMER_PAGE_META[pathname]) return CUSTOMER_PAGE_META[pathname]
  if (pathname.startsWith('/customer/tracking/')) {
    return { title: 'Order Tracking', subtitle: 'Live status for this booking.', contentClassName: 'max-w-3xl' }
  }
  return DEFAULT_CUSTOMER_PAGE_META
}
