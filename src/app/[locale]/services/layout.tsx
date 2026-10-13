import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Home Services',
  description: 'Browse plumbing, electrical, AC, painting, carpentry, pest control and more. Book a trusted professional at a clear price.',
  path: '/services',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
