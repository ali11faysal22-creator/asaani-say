'use client'

import { useEffect, useRef, type ReactNode } from 'react'

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])'

// Open dialogs, topmost last: only the topmost one reacts to Escape / Tab.
const openModals: symbol[] = []
let savedBodyOverflow = ''

type ModalProps = {
  onClose: () => void
  children: ReactNode
  /** id of the element that titles the dialog (preferred), or ariaLabel as a fallback. */
  labelledBy?: string
  ariaLabel?: string
  describedBy?: string
  /** Set false for dialogs that must be answered explicitly (the backdrop and Escape then do nothing). */
  dismissible?: boolean
  overlayClassName?: string
  panelClassName?: string
}

/**
 * Accessible modal shell: role="dialog", Escape to close, focus moves in and is trapped,
 * focus returns to the trigger on close, and the page behind does not scroll.
 */
export default function Modal({
  onClose,
  children,
  labelledBy,
  ariaLabel,
  describedBy,
  dismissible = true,
  overlayClassName = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4',
  panelClassName = 'relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl',
}: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  const dismissibleRef = useRef(dismissible)

  useEffect(() => {
    closeRef.current = onClose
    dismissibleRef.current = dismissible
  })

  useEffect(() => {
    const id = Symbol('modal')
    const previouslyFocused = document.activeElement as HTMLElement | null
    if (openModals.length === 0) {
      savedBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openModals.push(id)

    const panel = panelRef.current
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? panel)?.focus({ preventScroll: true })

    const onKeyDown = (event: KeyboardEvent) => {
      if (openModals[openModals.length - 1] !== id) return
      if (event.key === 'Escape' && dismissibleRef.current) {
        event.stopPropagation()
        closeRef.current()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null)
      if (items.length === 0) {
        event.preventDefault()
        panel.focus()
        return
      }
      const firstItem = items[0]
      const lastItem = items[items.length - 1]
      if (event.shiftKey && (document.activeElement === firstItem || document.activeElement === panel)) {
        event.preventDefault()
        lastItem.focus()
      } else if (!event.shiftKey && document.activeElement === lastItem) {
        event.preventDefault()
        firstItem.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      const index = openModals.indexOf(id)
      if (index >= 0) openModals.splice(index, 1)
      if (openModals.length === 0) document.body.style.overflow = savedBodyOverflow
      if (previouslyFocused && document.contains(previouslyFocused)) previouslyFocused.focus({ preventScroll: true })
    }
  }, [])

  return (
    <div
      className={overlayClassName}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && dismissible) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : ariaLabel}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={`${panelClassName} outline-none`}
      >
        {children}
      </div>
    </div>
  )
}
