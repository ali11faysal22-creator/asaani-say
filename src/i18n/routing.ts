import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'ur'],
  defaultLocale: 'en',
  localePrefix: 'as-needed',
  // English unless the URL says /ur — a saved preference never redirects.
  localeDetection: false,
  localeCookie: false,
})
