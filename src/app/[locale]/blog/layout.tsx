import { routeMetadata } from '../lib/seo'

export const generateMetadata = routeMetadata({
  title: 'Blog',
  description: 'Home maintenance tips, checklists and guides from the Asaani Say team.',
  path: '/blog',
})

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
