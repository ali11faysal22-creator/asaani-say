import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'About Us',
  description: 'Learn who we are, how Asaani Say works and why households trust our verified home-service professionals.',
  path: '/about-us',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
