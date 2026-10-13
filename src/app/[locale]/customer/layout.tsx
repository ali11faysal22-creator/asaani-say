import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Customer Portal',
  description: 'Manage your bookings, addresses and notifications.',
  path: '/customer',
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
