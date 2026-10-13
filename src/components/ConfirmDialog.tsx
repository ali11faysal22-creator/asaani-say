'use client'

import { useId, type ReactNode } from 'react'
import { useLanguage } from '@/app/lib/i18n'
import Modal from './Modal'

type ConfirmDialogProps = {
  title: string
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  /** "danger" paints the confirm button red (cancel / delete); "primary" uses the brand colour. */
  tone?: 'danger' | 'primary'
  busy?: boolean
  busyLabel?: string
  error?: string
  onConfirm: () => void
  onCancel: () => void
}

/** Replacement for window.confirm: translated, accessible, and shows API errors in place. */
export default function ConfirmDialog({
  title,
  message,
  confirmLabel,
  cancelLabel,
  tone = 'primary',
  busy = false,
  busyLabel,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const { t } = useLanguage()
  const titleId = useId()
  const messageId = useId()
  const confirmClass = tone === 'danger' ? 'bg-red-600 hover:bg-red-700' : 'bg-[#EE6C52] hover:bg-orange-600'

  return (
    <Modal
      onClose={() => { if (!busy) onCancel() }}
      labelledBy={titleId}
      describedBy={messageId}
      overlayClassName="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4"
      panelClassName="w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-2xl"
    >
      <h2 id={titleId} className="text-base font-extrabold text-slate-900">{title}</h2>
      <p id={messageId} className="mt-2 text-xs leading-relaxed text-slate-500">{message}</p>
      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          {cancelLabel ?? t('Cancel')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className={`cursor-pointer rounded-xl py-3 text-xs font-bold text-white transition disabled:opacity-60 ${confirmClass}`}
        >
          {busy ? (busyLabel ?? t('Please wait…')) : (confirmLabel ?? t('Confirm'))}
        </button>
      </div>
    </Modal>
  )
}
