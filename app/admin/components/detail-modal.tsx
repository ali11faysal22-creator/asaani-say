'use client'

import { X } from 'lucide-react'
import type { ReactNode } from 'react'

export type DetailField = { label: string; value: ReactNode }

export function DetailModal({
  title,
  subtitle,
  fields,
  onClose,
  footer,
}: {
  title: string
  subtitle?: string
  fields: DetailField[]
  onClose: () => void
  footer?: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-8">
          <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>

        {fields.length > 0 && (
          <div className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            {fields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4">
                <span className="text-slate-500 shrink-0">{field.label}</span>
                <span className="text-right font-semibold text-slate-800">{field.value}</span>
              </div>
            ))}
          </div>
        )}

        {footer && <div className="mt-5">{footer}</div>}
      </div>
    </div>
  )
}
