'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UnsavedChangesGuard({
  isDirty,
  onSave,
}: {
  isDirty: boolean
  onSave: () => Promise<void> | void
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    if (!isDirty) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setPendingHref(null)
      setOpen(true)
    }
    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target as HTMLElement | null
      const link = target?.closest('a[href]') as HTMLAnchorElement | null
      if (!link || link.target === '_blank' || link.origin !== window.location.origin) return
      const href = `${link.pathname}${link.search}${link.hash}`
      if (!href || href === window.location.pathname + window.location.search + window.location.hash) return
      event.preventDefault()
      setPendingHref(href)
      setOpen(true)
    }

    window.history.pushState(null, '', window.location.href)
    window.addEventListener('beforeunload', handleBeforeUnload)
    window.addEventListener('popstate', handlePopState)
    document.addEventListener('click', handleDocumentClick, true)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      window.removeEventListener('popstate', handlePopState)
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [isDirty])

  const discard = () => {
    setOpen(false)
    if (pendingHref) {
      router.push(pendingHref)
    } else {
      window.history.back()
    }
  }

  const save = async () => {
    setSaving(true)
    try {
      await onSave()
      setOpen(false)
      if (pendingHref) router.push(pendingHref)
      else window.history.back()
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/30 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl">
        <h2 className="text-sm font-extrabold text-slate-900">Unsaved changes</h2>
        <p className="mt-2 text-xs leading-relaxed text-slate-500">You have changes that have not been saved yet.</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={discard} disabled={saving} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">Discard changes</button>
          <button type="button" onClick={() => void save()} disabled={saving} className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-bold text-white hover:bg-orange-600 disabled:opacity-50">{saving ? 'Saving...' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  )
}
