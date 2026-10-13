import type { Metadata } from 'next'
import ServiceCategoryPage, { categoryMetadata } from '../../components/service-category-page'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  return categoryMetadata(locale, slug)
}

export default async function ServiceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ServiceCategoryPage slug={slug} />
}
