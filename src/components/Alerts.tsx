'use client'

import { useId, useSyncExternalStore } from 'react'
import { CheckCircle2, CircleAlert, Info, TriangleAlert, X } from 'lucide-react'
import { useLanguage } from '@/app/lib/i18n'
import Modal from './Modal'

/**
 * App-wide "sweet alerts": a centred popup for results that matter (booking placed, password reset),
 * a small toast for routine feedback (saved, marked as read) and a promise-based confirm for risky
 * actions. Call `notify.*` from anywhere (event handlers, async code); <AlertHost /> in the root
 * layout renders them. Callers pass already-translated text (`t('...')`).
 */

export type AlertTone = 'success' | 'error' | 'info' | 'warning'

type ToastItem = { id: number; tone: AlertTone; message: string }
type PopupItem = { tone: AlertTone; title: string; text?: string; buttonLabel?: string; resolve: () => void }
type ConfirmItem = {
  title: string
  text?: string
  confirmLabel?: string
  cancelLabel?: string
  tone: 'danger' | 'primary'
  resolve: (confirmed: boolean) => void
}

type State = { toasts: ToastItem[]; popup: PopupItem | null; confirm: ConfirmItem | null }

let state: State = { toasts: [], popup: null, confirm: null }
let nextId = 1
const listeners = new Set<() => void>()
const toastTimers = new Map<number, number>()

function setState(patch: Partial<State>) {
  state = { ...state, ...patch }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

const getSnapshot = () => state
const getServerSnapshot = () => state

function dismissToast(id: number) {
  const timer = toastTimers.get(id)
  if (timer !== undefined) window.clearTimeout(timer)
  toastTimers.delete(id)
  setState({ toasts: state.toasts.filter((toast) => toast.id !== id) })
}

function showToast(tone: AlertTone, message: string, durationMs = tone === 'error' ? 6000 : 4000) {
  if (typeof window === 'undefined' || !message) return
  // Same message already on screen (e.g. a double click): keep one.
  if (state.toasts.some((toast) => toast.tone === tone && toast.message === message)) return
  const id = nextId++
  setState({ toasts: [...state.toasts.slice(-3), { id, tone, message }] })
  toastTimers.set(id, window.setTimeout(() => dismissToast(id), durationMs))
}

function showPopup(tone: AlertTone, title: string, text?: string, buttonLabel?: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  return new Promise((resolve) => {
    state.popup?.resolve()
    setState({ popup: { tone, title, text, buttonLabel, resolve } })
  })
}

function askConfirm(options: { title: string; text?: string; confirmLabel?: string; cancelLabel?: string; tone?: 'danger' | 'primary' }): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false)
  return new Promise((resolve) => {
    state.confirm?.resolve(false)
    setState({ confirm: { tone: 'primary', ...options, resolve } })
  })
}

/** The message to show for a failed request: the API's own wording, or `fallback`. */
export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

export const notify = {
  success: (message: string) => showToast('success', message),
  error: (message: string) => showToast('error', message),
  info: (message: string) => showToast('info', message),
  warning: (message: string) => showToast('warning', message),
  /** Big centred result popup; resolves when the user closes it. */
  popup: (tone: AlertTone, title: string, text?: string, buttonLabel?: string) => showPopup(tone, title, text, buttonLabel),
  /** Resolves true when the user confirms. */
  confirm: askConfirm,
}

const TONE_STYLES: Record<AlertTone, { icon: typeof Info; ring: string; text: string; bar: string }> = {
  success: { icon: CheckCircle2, ring: 'bg-emerald-50 text-emerald-500', text: 'text-emerald-600', bar: 'border-emerald-200' },
  error: { icon: CircleAlert, ring: 'bg-red-50 text-red-500', text: 'text-red-600', bar: 'border-red-200' },
  info: { icon: Info, ring: 'bg-sky-50 text-sky-500', text: 'text-sky-600', bar: 'border-sky-200' },
  warning: { icon: TriangleAlert, ring: 'bg-amber-50 text-amber-500', text: 'text-amber-600', bar: 'border-amber-200' },
}

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  const { t } = useLanguage()
  if (toasts.length === 0) return null
  return (
    <div className="pointer-events-none fixed end-4 top-4 z-[400] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => {
        const style = TONE_STYLES[toast.tone]
        const Icon = style.icon
        return (
          <div
            key={toast.id}
            role={toast.tone === 'error' ? 'alert' : 'status'}
            className={`pointer-events-auto flex items-start gap-3 rounded-2xl border bg-white p-3.5 shadow-xl ${style.bar}`}
          >
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${style.ring}`}><Icon className="h-4 w-4" /></span>
            <p className="min-w-0 flex-1 text-xs font-semibold leading-relaxed text-slate-700">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              aria-label={t('Close')}
              className="cursor-pointer rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

function PopupDialog({ popup }: { popup: PopupItem }) {
  const { t } = useLanguage()
  const titleId = useId()
  const textId = useId()
  const style = TONE_STYLES[popup.tone]
  const Icon = style.icon
  const close = () => {
    setState({ popup: null })
    popup.resolve()
  }
  return (
    <Modal
      onClose={close}
      labelledBy={titleId}
      describedBy={popup.text ? textId : undefined}
      overlayClassName="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 p-4"
      panelClassName="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"
    >
      <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${style.ring}`}><Icon className="h-9 w-9" /></span>
      <h2 id={titleId} className="mt-4 text-lg font-extrabold text-slate-900">{popup.title}</h2>
      {popup.text && <p id={textId} className="mt-2 text-xs leading-relaxed text-slate-500">{popup.text}</p>}
      <button
        type="button"
        onClick={close}
        className="mt-6 w-full cursor-pointer rounded-xl bg-[#EE6C52] py-3 text-xs font-bold text-white transition hover:bg-orange-600"
      >
        {popup.buttonLabel ?? t('OK')}
      </button>
    </Modal>
  )
}

function ConfirmPopup({ confirm }: { confirm: ConfirmItem }) {
  const { t } = useLanguage()
  const titleId = useId()
  const textId = useId()
  const answer = (confirmed: boolean) => {
    setState({ confirm: null })
    confirm.resolve(confirmed)
  }
  const danger = confirm.tone === 'danger'
  return (
    <Modal
      onClose={() => answer(false)}
      labelledBy={titleId}
      describedBy={confirm.text ? textId : undefined}
      overlayClassName="fixed inset-0 z-[300] flex items-center justify-center bg-slate-900/50 p-4"
      panelClassName="w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"
    >
      <span className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${danger ? TONE_STYLES.warning.ring : TONE_STYLES.info.ring}`}>
        <TriangleAlert className="h-9 w-9" />
      </span>
      <h2 id={titleId} className="mt-4 text-lg font-extrabold text-slate-900">{confirm.title}</h2>
      {confirm.text && <p id={textId} className="mt-2 text-xs leading-relaxed text-slate-500">{confirm.text}</p>}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => answer(false)}
          className="cursor-pointer rounded-xl border border-slate-200 bg-white py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
        >
          {confirm.cancelLabel ?? t('Cancel')}
        </button>
        <button
          type="button"
          onClick={() => answer(true)}
          className={`cursor-pointer rounded-xl py-3 text-xs font-bold text-white transition ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-[#EE6C52] hover:bg-orange-600'}`}
        >
          {confirm.confirmLabel ?? t('Confirm')}
        </button>
      </div>
    </Modal>
  )
}

export default function AlertHost() {
  const current = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  return (
    <>
      <ToastStack toasts={current.toasts} />
      {current.popup && <PopupDialog popup={current.popup} />}
      {current.confirm && <ConfirmPopup confirm={current.confirm} />}
    </>
  )
}
