import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Cart',
  description: 'Review the services in your cart and choose a time.',
  path: '/cart',
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
