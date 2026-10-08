'use client'

import { useLanguage } from '../lib/i18n'

const INSTAGRAM_URL = 'https://www.instagram.com/'
const FACEBOOK_URL = 'https://www.facebook.com/'

export default function SocialLinks() {
  const { t } = useLanguage()
  return (
    <div className="flex items-center gap-2 text-slate-700">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={t('Instagram')}
        className="transition hover:text-orange-500"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </a>
      <a
        href={FACEBOOK_URL}
        target="_blank"
        rel="noreferrer"
        aria-label={t('Facebook')}
        className="transition hover:text-orange-500"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
          <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.5 1.6-1.5h1.7V3.1c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.3v3.2h2.8V21h3.4Z" />
        </svg>
      </a>
    </div>
  )
}
