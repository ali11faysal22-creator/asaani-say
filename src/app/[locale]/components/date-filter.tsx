'use client'

import { X } from 'lucide-react'
import { useLanguage } from '@/app/lib/i18n'

export function DateFilter({ value, onChange, label = 'Date' }: { value: string; onChange: (value: string) => void; label?: string }) {
  const { t } = useLanguage()
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 ps-3 pe-8 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52] transition shadow-2xs sm:w-auto"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          title={t('Clear date filter')}
          aria-label={t('Clear date filter')}
          className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
