import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Sign in',
  description: 'Sign in to your Asaani Say account.',
  path: '/login',
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
