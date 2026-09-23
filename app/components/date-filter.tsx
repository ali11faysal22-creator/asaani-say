'use client'

import { X } from 'lucide-react'

export function DateFilter({ value, onChange, label = 'Date' }: { value: string; onChange: (value: string) => void; label?: string }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-3 pr-8 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52] transition shadow-2xs sm:w-auto"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          title="Clear date filter"
          aria-label="Clear date filter"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
