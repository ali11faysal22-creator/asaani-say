import type { Metadata } from 'next'
import ServiceCategoryPage, { categoryMetadata } from '../../components/service-category-page'

// Same page as /services/[slug]; kept as a fixed route so the URL keeps working.
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  return categoryMetadata(locale, 'electrician')
}

export default function Page() {
  return <ServiceCategoryPage slug="electrician" />
}
