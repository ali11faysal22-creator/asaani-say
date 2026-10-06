export const ADMIN_PAGE_META: Record<string, { title: string; subtitle: string }> = {
  '/admin/dashboard': {
    title: 'Overview',
    subtitle: 'Platform-wide activity across vendors, customers, and bookings.',
  },
  '/admin/service-requests': {
    title: 'Service Requests',
    subtitle: 'Leads from the homepage order form — assign each to a vendor.',
  },
  '/admin/contact-messages': {
    title: 'Contact Messages',
    subtitle: 'Messages submitted through the Contact Us page.',
  },
  '/admin/vendors': {
    title: 'Vendors',
    subtitle: 'Review vendor accounts and manage verification.',
  },
  '/admin/customers': {
    title: 'Customers',
    subtitle: 'Everyone registered as a customer on the platform.',
  },
  '/admin/bookings': {
    title: 'Bookings',
    subtitle: 'Every booking placed across all vendors.',
  },
  '/admin/services': {
    title: 'Services',
    subtitle: 'Manage service categories and the sub-services within them.',
  },
  '/admin/calendar': {
    title: 'Job Calendar',
    subtitle: 'Ongoing and upcoming jobs by date — filter by city.',
  },
}

export const DEFAULT_ADMIN_PAGE_META = { title: 'Admin Console', subtitle: undefined as string | undefined }
