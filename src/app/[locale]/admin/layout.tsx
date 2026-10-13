import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Admin Console',
  description: 'Asaani Say administration.',
  path: '/admin',
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
