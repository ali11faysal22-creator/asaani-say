export const VENDOR_PAGE_META: Record<string, { title: string; subtitle: string; contentClassName?: string }> = {
  '/vendor/dashboard': {
    title: 'My Selected Services',
    subtitle: 'Your signup choices are active below. Update pricing or add more sub-services.',
  },
  '/vendor/profile': {
    title: 'Vendor Profile',
    subtitle: 'Manage your official business details and public listing.',
    contentClassName: 'max-w-4xl',
  },
  '/vendor/settings': {
    title: 'Settings',
    subtitle: 'Manage your services, account, payout and security preferences.',
    contentClassName: 'max-w-3xl',
  },
  '/vendor/notifications': {
    title: 'Notifications',
    subtitle: 'View real-time customer booking alerts, schedule updates, and payment details.',
  },
  '/vendor/order-history': {
    title: 'My Orders',
    subtitle: 'Review and manage your service request history and active transactions.',
  },
}

export const DEFAULT_VENDOR_PAGE_META = { title: 'Dashboard', subtitle: undefined as string | undefined, contentClassName: 'max-w-6xl' }
