'use client'

import { X } from 'lucide-react'
import { useId, type ReactNode } from 'react'
import Modal from '@/components/Modal'
import { useLanguage } from '../../lib/i18n'

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
  const { t } = useLanguage()
  const titleId = useId()
  return (
    <Modal
      onClose={onClose}
      labelledBy={titleId}
      overlayClassName="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4"
      panelClassName="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl max-h-[85vh] overflow-y-auto"
    >
        <button
          type="button"
          onClick={onClose}
          className="absolute end-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
          aria-label={t('Close')}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pe-8">
          <h2 id={titleId} className="text-base font-extrabold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
        </div>

        {fields.length > 0 && (
          <dl className="mt-5 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs">
            {fields.map((field) => (
              <div key={field.label} className="flex items-start justify-between gap-4">
                <dt className="text-slate-500 shrink-0">{t(field.label)}</dt>
                <dd className="text-end font-semibold text-slate-800">{field.value}</dd>
              </div>
            ))}
          </dl>
        )}

        {footer && <div className="mt-5">{footer}</div>}
    </Modal>
  )
}
