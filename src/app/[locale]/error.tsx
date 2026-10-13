'use client'

import { useEffect } from 'react'
import { Link } from '@/i18n/navigation'
import { useLanguage } from './lib/i18n'

export default function RouteError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  const { t } = useLanguage()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div role="alert" className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-xl font-extrabold text-slate-900">{t('Something went wrong on our side')}</h1>
      <p className="max-w-md text-sm text-slate-500">{t('Please try again. If it keeps happening, contact us and we will sort it out.')}</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={() => unstable_retry()} className="cursor-pointer rounded-xl bg-[#EE6C52] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600">{t('Try again')}</button>
        <Link href="/" className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">{t('Back to Home')}</Link>
      </div>
    </div>
  )
}
