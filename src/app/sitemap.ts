import type { MetadataRoute } from 'next'
import { routing } from '@/i18n/routing'
import { SITE_URL, fetchCategoriesOnServer, localizedPath } from './[locale]/lib/seo'

const STATIC_PATHS = ['/', '/services', '/about-us', '/blog', '/contact-us']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const categories = await fetchCategoriesOnServer()
  const paths = [...STATIC_PATHS, ...categories.filter((category) => category.is_active).map((category) => `/services/${category.slug}`)]

  return paths.map((path) => ({
    url: `${SITE_URL}${localizedPath(routing.defaultLocale, path)}`,
    changeFrequency: path === '/' || path === '/services' ? 'weekly' : 'monthly',
    priority: path === '/' ? 1 : path.startsWith('/services/') ? 0.8 : 0.6,
    alternates: {
      languages: Object.fromEntries(routing.locales.map((code) => [code, `${SITE_URL}${localizedPath(code, path)}`])),
    },
  }))
}
