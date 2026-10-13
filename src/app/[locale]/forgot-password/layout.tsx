import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Forgot Password',
  description: 'Reset your Asaani Say password with a verification code.',
  path: '/forgot-password',
  noindex: true,
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
