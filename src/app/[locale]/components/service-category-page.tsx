import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { fetchCategoryOnServer, pageMetadata } from '../lib/seo'
import ServiceCategoryView from './service-category-view'

const loadCategory = cache(fetchCategoryOnServer)

/** Title/description for a category page, from the catalog's own SEO fields when present. */
export async function categoryMetadata(locale: string, slug: string): Promise<Metadata> {
  const category = await loadCategory(slug)
  const name = category?.display_name || category?.name || 'Home Services'
  return pageMetadata(locale, {
    title: category?.seo_title || name,
    description:
      category?.seo_intro
      || category?.tagline
      || 'Book a trusted, verified professional for this home service at a clear price.',
    path: `/services/${slug}`,
  })
}

/** Server component shared by /services/[slug] and the fixed category routes. */
export default async function ServiceCategoryPage({ slug }: { slug: string }) {
  const category = await loadCategory(slug)
  if (category === null) notFound()
  return <ServiceCategoryView slug={slug} initialCategory={category ?? null} />
}
