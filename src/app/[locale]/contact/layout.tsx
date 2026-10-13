import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Contact Us',
  description: 'Questions about a booking or our coverage? Send us a message and our team will get back to you.',
  path: '/contact',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
