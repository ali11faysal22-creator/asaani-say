'use client'

import { Link } from '@/i18n/navigation'
import { useLanguage } from './lib/i18n'

export default function NotFound() {
  const { t } = useLanguage()
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-6xl font-black text-[#EE6C52]">404</p>
      <h1 className="text-xl font-extrabold text-slate-900">{t("We couldn't find that page")}</h1>
      <p className="max-w-md text-sm text-slate-500">{t('The link may be old or the address may have a typo. Let’s get you back on track.')}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/" className="rounded-xl bg-[#EE6C52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600">{t('Back to Home')}</Link>
        <Link href="/services" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">{t('Browse Services')}</Link>
      </div>
    </div>
  )
}
