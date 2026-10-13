import type { Metadata } from 'next'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { phraseKey } from './phrase-key'
import type { CatalogCategory } from './booking-api'

export const SITE_NAME = 'Asaani Say'
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')

type Translator = (text: string) => string

/** Server-side twin of useLanguage().t - looks the English phrase up in messages/<locale>.json. */
export async function getTranslator(locale: string): Promise<Translator> {
  if (locale === routing.defaultLocale) return (text) => text
  const messages = (await getMessages({ locale })) as { Common?: Record<string, string> }
  const common = messages.Common ?? {}
  return (text) => common[phraseKey(text)] ?? text
}

/** Path with the locale prefix the router uses (English is unprefixed). */
export function localizedPath(locale: string, path: string): string {
  const clean = path === '/' ? '' : path
  return locale === routing.defaultLocale ? clean || '/' : `/${locale}${clean}`
}

type PageMetaInput = {
  title: string
  description: string
  /** Locale-less path such as "/about-us". */
  path: string
  /** Keep private / transactional pages out of search results. */
  noindex?: boolean
}

export async function pageMetadata(locale: string, input: PageMetaInput): Promise<Metadata> {
  const t = await getTranslator(locale)
  const title = t(input.title)
  const description = t(input.description)
  const url = localizedPath(locale, input.path)
  return {
    title,
    description,
    ...(input.noindex
      ? { robots: { index: false, follow: false } }
      : {
          alternates: {
            canonical: url,
            languages: Object.fromEntries(routing.locales.map((code) => [code, localizedPath(code, input.path)])),
          },
          openGraph: { title, description, url, siteName: SITE_NAME, type: 'website', locale: locale === 'ur' ? 'ur_PK' : 'en_PK' },
          twitter: { card: 'summary', title, description },
        }),
  }
}

/** generateMetadata for a route whose page is a client component: export it from that route's layout.tsx. */
export function routeMetadata(input: PageMetaInput) {
  return async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
    const { locale } = await params
    return pageMetadata(locale, input)
  }
}

/**
 * Category for a service page, fetched on the server so the catalog is in the HTML.
 * null  -> the API says this category does not exist (render a real 404)
 * undefined -> the API could not be reached (let the page load it in the browser instead)
 */
export async function fetchCategoryOnServer(slug: string): Promise<CatalogCategory | null | undefined> {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories/${encodeURIComponent(slug)}`, { next: { revalidate: 60 } })
    if (response.status === 404) return null
    if (!response.ok) return undefined
    return (await response.json()) as CatalogCategory
  } catch {
    return undefined
  }
}

export async function fetchCategoriesOnServer(): Promise<CatalogCategory[]> {
  try {
    const response = await fetch(`${API_URL}/api/v1/categories`, { next: { revalidate: 300 } })
    if (!response.ok) return []
    return (await response.json()) as CatalogCategory[]
  } catch {
    return []
  }
}
