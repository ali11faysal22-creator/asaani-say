'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { ChevronRight, Home, MoreHorizontal } from 'lucide-react'
import { Link, usePathname } from '@/i18n/navigation'
import { useLanguage } from '@/app/lib/i18n'

export type BreadcrumbItem = {
  label: string
  /** Omit for the current page or for a non-navigable level. */
  href?: string
  /** Skip translation, e.g. for user data or ids. */
  raw?: boolean
}

type SegmentConfig = { label: string; href?: string | null }

/**
 * Known route segments. `href: null` marks a level with no page of its own (rendered as plain text),
 * an explicit `href` redirects the crumb to a better landing page, and no `href` means "the path so far".
 */
const SEGMENTS: Record<string, SegmentConfig> = {
  'about-us': { label: 'About Us' },
  'contact-us': { label: 'Contact Us' },
  contact: { label: 'Contact Us' },
  services: { label: 'Services' },
  blog: { label: 'Blog' },
  cart: { label: 'Cart' },
  'order-confirmation': { label: 'Order Confirmation' },
  'forgot-password': { label: 'Forgot Password' },
  login: { label: 'Sign in' },

  customer: { label: 'Customer Portal', href: '/customer/dashboard' },
  vendor: { label: 'Vendor Portal', href: '/vendor/dashboard' },
  admin: { label: 'Admin Console', href: '/admin/dashboard' },

  dashboard: { label: 'Dashboard' },
  orders: { label: 'My Orders' },
  tracking: { label: 'Order Tracking', href: '/customer/orders' },
  notifications: { label: 'Notifications' },
  'order-history': { label: 'Order History' },
  profile: { label: 'Profile' },
  settings: { label: 'Settings' },
  bookings: { label: 'Bookings' },
  calendar: { label: 'Jobs Calendar' },
  'contact-messages': { label: 'Contact Messages' },
  customers: { label: 'Customers' },
  vendors: { label: 'Vendors' },
  'service-requests': { label: 'Service Requests' },
}

const ACRONYMS = new Set(['ac', 'id', 'faq', 'hvac', 'uv'])
const ID_LIKE = /^(?:[0-9a-f]{8}-[0-9a-f-]{27}|[0-9a-f]{16,}|\d+)$/i

function prettify(segment: string): string {
  return decodeURIComponent(segment)
    .split('-')
    .filter(Boolean)
    .map((word) => (ACRONYMS.has(word.toLowerCase()) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(' ')
}

/** Builds crumbs from a locale-less pathname such as "/customer/tracking/3f2a…". */
export function buildBreadcrumbs(pathname: string, labels: Record<string, string> = {}): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const items: BreadcrumbItem[] = []
  let path = ''
  segments.forEach((segment, index) => {
    path += `/${segment}`
    const isLast = index === segments.length - 1
    const config = SEGMENTS[segment]
    const override = labels[path]
    let item: BreadcrumbItem
    if (override) item = { label: override, raw: true }
    else if (config) item = { label: config.label }
    else if (ID_LIKE.test(segment)) item = { label: `#${segment.slice(0, 8)}`, raw: true }
    else item = { label: prettify(segment) }

    if (!isLast && config?.href !== null) item.href = config?.href ?? path
    if (config?.href === null && !isLast) item.href = undefined
    items.push(item)
  })
  return items
}

type BreadcrumbsProps = {
  /** Explicit crumbs (Home is added automatically). Omit to derive them from the URL. */
  items?: BreadcrumbItem[]
  /** Label overrides for URL-derived crumbs, keyed by locale-less path, e.g. { '/services/plumbing': 'Plumbing' }. */
  labels?: Record<string, string>
  /** Show the Home crumb (default true). */
  showHome?: boolean
  /** Levels beyond this collapse into an expandable "…" on small screens. */
  collapseAfter?: number
  className?: string
}

export default function Breadcrumbs({ items, labels, showHome = true, collapseAfter = 4, className = '' }: BreadcrumbsProps) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(false)
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const trail = useMemo<BreadcrumbItem[]>(() => {
    const derived = items ?? buildBreadcrumbs(pathname, labels)
    return showHome ? [{ label: 'Home', href: '/' }, ...derived] : derived
  }, [items, labels, pathname, showHome])

  // A lone "Home" crumb (the home page itself) is not worth showing.
  if (trail.length < 2) return null

  const collapsible = trail.length > collapseAfter
  const textOf = (item: BreadcrumbItem) => (item.raw ? item.label : t(item.label))

  const jsonLd = origin
    ? {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: trail.map((item, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: textOf(item),
          ...(item.href ? { item: `${origin}${item.href === '/' ? '' : item.href}` } : {}),
        })),
      }
    : null

  return (
    <nav aria-label={t('Breadcrumb')} className={className}>
      <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-[13px] text-slate-500">
        {trail.map((item, index) => {
          const isLast = index === trail.length - 1
          const isFirst = index === 0
          // On small screens keep first + last two levels; the middle ones fold behind "…".
          const foldable = collapsible && !expanded && index > 0 && index < trail.length - 2
          const text = textOf(item)
          const showEllipsis = collapsible && !expanded && index === 1

          return (
            <Fragment key={`${item.href ?? item.label}-${index}`}>
              {showEllipsis && (
                <li className="inline-flex items-center gap-1.5 sm:hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(true)}
                    aria-label={t('Show full path')}
                    className="inline-flex h-5 w-6 items-center justify-center rounded bg-slate-100 text-slate-500 hover:bg-slate-200 cursor-pointer"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 rtl:rotate-180" aria-hidden="true" />
                </li>
              )}
              <li className={`${foldable ? 'hidden sm:inline-flex' : 'inline-flex'} items-center gap-1.5 min-w-0`}>
                {item.href && !isLast ? (
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-1 rounded font-medium text-slate-500 transition hover:text-[#EE6C52] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EE6C52]"
                  >
                    {isFirst && <Home className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />}
                    <span className="truncate max-w-[10rem] sm:max-w-[14rem]">{text}</span>
                  </Link>
                ) : (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    title={text}
                    className={`truncate max-w-[12rem] sm:max-w-[20rem] ${isLast ? 'font-semibold text-[#1B2A59]' : 'text-slate-500'}`}
                  >
                    {text}
                  </span>
                )}
                {!isLast && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300 rtl:rotate-180" aria-hidden="true" />}
              </li>
            </Fragment>
          )
        })}
      </ol>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </nav>
  )
}

/** Slim full-width strip for public pages, placed right under the navbar. */
export function BreadcrumbBar(props: BreadcrumbsProps) {
  return (
    <div className="w-full border-b border-slate-100 bg-white">
      <div className="site-container mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <Breadcrumbs {...props} />
      </div>
    </div>
  )
}
