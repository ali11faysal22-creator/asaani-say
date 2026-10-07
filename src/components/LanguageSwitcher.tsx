'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { ChevronDown, Globe2 } from 'lucide-react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

type LocaleOption = 'en' | 'ur'

export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const locale = useLocale()
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const switcherRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    switcherRef.current?.querySelector<HTMLButtonElement>('[role="menuitemradio"]')?.focus()

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!switcherRef.current?.contains(event.target as Node)) setIsOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [isOpen])

  function changeLocale(nextLocale: LocaleOption) {
    setIsOpen(false)
    triggerRef.current?.focus()
    if (nextLocale === locale) return
    startTransition(() => {
      router.replace(pathname, { locale: nextLocale })
    })
  }

  return (
    <div ref={switcherRef} className="relative inline-flex">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Language"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls="language-switcher-options"
        disabled={isPending}
        onClick={() => setIsOpen((open) => !open)}
        className={`inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-1.5 font-semibold text-slate-700 disabled:cursor-wait ${compact ? 'text-[11px]' : 'text-xs'}`}
      >
        <Globe2 className="h-4 w-4 shrink-0 text-slate-600" aria-hidden="true" />
        <span>{locale === 'ur' ? 'اردو' : 'English'}</span>
        <ChevronDown className="h-3 w-3 shrink-0 text-slate-500" aria-hidden="true" />
      </button>
      {isOpen && (
        <div
          id="language-switcher-options"
          role="menu"
          aria-label="Choose language"
          onKeyDown={(event) => {
            const options = [...event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]')]
            const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement)
            let nextIndex: number | undefined

            if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % options.length
            if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + options.length) % options.length
            if (event.key === 'Home') nextIndex = 0
            if (event.key === 'End') nextIndex = options.length - 1
            if (nextIndex !== undefined) {
              event.preventDefault()
              options[nextIndex]?.focus()
            }
          }}
          className="absolute start-0 top-full z-50 mt-1 h-fit min-w-full w-max rounded-lg border border-slate-200 bg-white p-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={locale === 'en'}
            disabled={isPending}
            onClick={() => changeLocale('en')}
            className="block w-full whitespace-nowrap rounded-md px-2 py-1.5 text-start text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-wait"
          >
            English
          </button>
          <button
            type="button"
            role="menuitemradio"
            aria-checked={locale === 'ur'}
            disabled={isPending}
            onClick={() => changeLocale('ur')}
            className="block w-full whitespace-nowrap rounded-md px-2 py-1.5 text-start text-xs text-slate-700 hover:bg-slate-100 disabled:cursor-wait"
          >
            اردو
          </button>
        </div>
      )}
    </div>
  )
}
