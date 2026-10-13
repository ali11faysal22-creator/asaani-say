import type { MetadataRoute } from 'next'
import { SITE_URL } from './[locale]/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Private or transactional areas: nothing here belongs in a search index.
      disallow: ['/admin', '/vendor', '/customer', '/cart', '/order-confirmation', '/login', '/forgot-password', '/ur/admin', '/ur/vendor', '/ur/customer', '/ur/cart', '/ur/order-confirmation', '/ur/login', '/ur/forgot-password'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
