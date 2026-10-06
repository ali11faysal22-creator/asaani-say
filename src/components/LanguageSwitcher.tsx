'use client'

import { useTransition } from 'react'
import { Globe2 } from 'lucide-react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

type LocaleOption = 'en' | 'ur'

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function changeLocale(nextLocale: LocaleOption) {
    if (nextLocale === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <label className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-slate-700 ${compact ? 'text-[11px]' : 'text-xs'}`}>
      <Globe2 className="h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
      <span className="sr-only">Language</span>
      <select
        aria-label="Language"
        value={locale}
        disabled={isPending}
        onChange={(event) => {
          const nextLocale = event.target.value
          if (nextLocale === 'en' || nextLocale === 'ur') changeLocale(nextLocale)
        }}
        className="max-w-24 cursor-pointer bg-transparent font-semibold outline-none"
      >
        <option value="en">English</option>
        <option value="ur">اردو</option>
      </select>
    </label>
  )
}
