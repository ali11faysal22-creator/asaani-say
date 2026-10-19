'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { AlertTriangle, LoaderCircle, X } from 'lucide-react'
import { FieldError, errorBorder } from '@/components/FieldError'
import { submitBookingProblemReport, type BookingReporterRole, type BookingResult } from '../lib/booking-api'
import { useLanguage } from '../lib/i18n'

const REPORTABLE_STATUSES = new Set(['accepted', 'on_the_way', 'reached', 'in_progress', 'paused'])
const MAX_MESSAGE_LENGTH = 500

export function ReportProblemButton({
  booking,
  role,
  onReported,
}: {
  booking: BookingResult
  role: BookingReporterRole
  onReported: (updated: BookingResult) => void
}) {
  const { t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messageError, setMessageError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reportSubmitted = hasSubmitted || Boolean(booking.problem_report) || booking.status === 'interrupted'
  const canReport = REPORTABLE_STATUSES.has(booking.status)
  const characterCount = Array.from(message).length

  useEffect(() => {
    if (!isOpen) return
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null
    textareaRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        if (!submitting) setIsOpen(false)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), textarea:not([disabled])',
        ),
      )
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previouslyFocused?.focus()
    }
  }, [isOpen, submitting])

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
  }, [])

  const showToast = (type: 'success' | 'error', text: string) => {
    setToast({ type, message: text })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 4500)
  }

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (submitting) return
    const trimmedMessage = message.trim()
    const trimmedCharacterCount = Array.from(trimmedMessage).length
    if (trimmedCharacterCount < 10) {
      setMessageError(t('Please enter at least 10 characters.'))
      return
    }
    if (trimmedCharacterCount > MAX_MESSAGE_LENGTH) {
      setMessageError(t('The report cannot exceed 500 characters.'))
      return
    }

    setSubmitting(true)
    setMessageError('')
    try {
      const updated = await submitBookingProblemReport(booking.id, role, trimmedMessage)
      setHasSubmitted(true)
      setMessage('')
      setIsOpen(false)
      onReported(updated)
      showToast('success', t('Report submitted. The service has been stopped.'))
    } catch (error) {
      showToast(
        'error',
        error instanceof Error ? t(error.message) : t('Unable to submit the report. Please try again.'),
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (reportSubmitted) {
    return (
      <>
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold text-rose-700">
          <AlertTriangle className="h-3.5 w-3.5" />
          {t('Report submitted')}
        </span>
        <Toast toast={toast} />
      </>
    )
  }
  if (!canReport) return <Toast toast={toast} />

  return (
    <>
      <button
        type="button"
        onClick={() => { setMessageError(''); setIsOpen(true) }}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px] font-bold text-rose-700 transition hover:bg-rose-50"
      >
        <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
        <span className="max-w-full whitespace-normal text-start">{t('Report a problem / Stop service')}</span>
      </button>
      <Toast toast={toast} />

      {isOpen && createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-stretch justify-center bg-slate-950/55 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (!submitting && event.target === event.currentTarget) setIsOpen(false)
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-problem-title"
            className="flex h-full w-full flex-col overflow-y-auto bg-white p-5 shadow-2xl sm:h-auto sm:max-h-[85dvh] sm:max-w-lg sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="report-problem-title" className="text-base font-extrabold text-slate-900">
                  {t('Report a problem / Stop service')}
                </h2>
                <p className="mt-2 break-all text-xs text-slate-500">
                  {t(booking.service_name)} · {t('Order #')}{booking.id}
                </p>
              </div>
              <button
                type="button"
                aria-label={t('Close')}
                disabled={submitting}
                onClick={() => setIsOpen(false)}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={(event) => void submit(event)} className="mt-5 flex flex-1 flex-col">
              <label htmlFor="problem-report-message" className="mb-2 text-xs font-bold text-slate-700">
                {t('Describe the problem')}
              </label>
              <textarea
                ref={textareaRef}
                id="problem-report-message"
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value)
                  if (messageError) setMessageError('')
                }}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={5}
                required
                aria-invalid={Boolean(messageError)}
                aria-describedby="problem-report-counter problem-report-error"
                className={`w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-orange-400 ${errorBorder(messageError)}`}
              />
              <div className="mt-1 flex items-start justify-between gap-3">
                <FieldError id="problem-report-error" message={messageError} />
                <span id="problem-report-counter" className="shrink-0 text-[11px] text-slate-400">
                  {characterCount} / {MAX_MESSAGE_LENGTH}
                </span>
              </div>
              <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs font-semibold text-amber-800">
                {t('This will stop the service and notify the admin.')}
              </p>
              <div className="mt-auto flex flex-col-reverse gap-2 pt-6 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {t('Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting && <LoaderCircle className="h-4 w-4 animate-spin" />}
                  {submitting ? t('Submitting…') : t('Submit report')}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body,
      )}
    </>
  )
}

function Toast({ toast }: { toast: { type: 'success' | 'error'; message: string } | null }) {
  if (!toast) return null
  return createPortal(
    <div
      role={toast.type === 'error' ? 'alert' : 'status'}
      className={`fixed inset-x-4 top-4 z-[70] mx-auto max-w-md rounded-xl border px-4 py-3 text-xs font-bold shadow-lg sm:inset-x-auto sm:end-6 ${
        toast.type === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {toast.message}
    </div>,
    document.body,
  )
}
