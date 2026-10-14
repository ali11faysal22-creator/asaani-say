'use client'

import { Star } from 'lucide-react'
import { useLanguage } from '../lib/i18n'

/** The customer's star rating and written comment for a finished booking (shared by vendor and admin screens). */
export function BookingReview({ rating, comment, align = 'end' }: { rating: number; comment?: string | null; align?: 'start' | 'end' }) {
  const { t } = useLanguage()
  const text = comment?.trim()
  return (
    <div className={`flex min-w-0 flex-col gap-1 ${align === 'end' ? 'items-end text-end' : 'items-start text-start'}`}>
      <span className="inline-flex items-center gap-1" aria-label={`${rating} / 5`}>
        {[1, 2, 3, 4, 5].map((value) => (
          <Star key={value} aria-hidden="true" className={`h-3.5 w-3.5 ${rating >= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
        ))}
        <span dir="ltr" className="ms-1 font-bold text-slate-800">{rating} / 5</span>
      </span>
      {text ? (
        <p dir="auto" className="max-w-full break-words text-[11px] font-medium leading-relaxed text-slate-600">&ldquo;{text}&rdquo;</p>
      ) : (
        <p className="text-[11px] font-medium text-slate-400">{t('No written comment')}</p>
      )}
    </div>
  )
}
