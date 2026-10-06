import ServiceCategoryView from '../../components/service-category-view'

export default async function ServiceSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <ServiceCategoryView slug={slug} />
}
