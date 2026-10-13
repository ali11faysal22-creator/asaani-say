import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Order Confirmation',
  description: 'Track the status of the order you just placed.',
  path: '/order-confirmation',
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
