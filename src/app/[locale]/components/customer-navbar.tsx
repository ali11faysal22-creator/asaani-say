'use client'

import { useEffect, useRef, useState } from 'react'
import { Link, usePathname } from '@/i18n/navigation'
import { Bell, ChevronDown, ClipboardList, Hand, LayoutDashboard, Menu, Sparkles, User, X } from 'lucide-react'
import { clearStoredAuth, fetchCustomerNotifications, getCurrentUser, getStoredAuth, logoutUser, markCustomerNotificationRead, type CustomerNotification } from '../lib/booking-api'
import LanguageSwitcher from './language-switcher'
import { useLanguage } from '../lib/i18n'

export default function CustomerNavbar({ active = '', showLanguageSwitcher = true }: { active?: string; showLanguageSwitcher?: boolean }) {
  const { t } = useLanguage()
  const pathname = usePathname()
  const [auth, setAuth] = useState<{ role?: string; email?: string; full_name?: string | null } | null | undefined>(undefined)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [alertNotification, setAlertNotification] = useState<CustomerNotification | null>(null)
  const notificationLoadInFlight = useRef(false)
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const profileButtonRef = useRef<HTMLButtonElement>(null)
  const isActivePath = (path: string, section: string) =>
    active === section || pathname === path || pathname.startsWith(`${path}/`)
  const customerName = auth?.full_name?.trim()
    || auth?.email?.split('@')[0]?.replace(/[._-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase())
    || 'Customer'

  useEffect(() => {
    const load = () => {
      if (notificationLoadInFlight.current) return
      const storedAuth = getStoredAuth('customer')
      if (!storedAuth) {
        setAuth(null)
        setUnreadCount(0)
        return
      }

      setAuth(storedAuth)
      notificationLoadInFlight.current = true
      getCurrentUser('customer')
        .then((user) => {
          if (user.role === 'customer') {
            setAuth(user)
            if (user.profile_id) {
              fetchCustomerNotifications(user.profile_id).then((items) => {
                const sortedItems = [...items].sort((a, b) => {
                  const first = new Date(a.created_at || a.createdAt || 0).getTime()
                  const second = new Date(b.created_at || b.createdAt || 0).getTime()
                  return second - first
                })
                const unread = sortedItems.filter((item) => !item.is_read)
                setUnreadCount(unread.length)
                const seen = JSON.parse(localStorage.getItem('asaani_seen_notification_ids') || '[]') as string[]
                const nextAlert = unread.find((item) => item.title === 'Welcome to Asaani Say' && !seen.includes(item.id))
                if (nextAlert) {
                  localStorage.setItem('asaani_seen_notification_ids', JSON.stringify([...seen, nextAlert.id].slice(-100)))
                  setAlertNotification(nextAlert)
                  window.setTimeout(() => setAlertNotification(null), 6000)
                }
              }).catch(() => setUnreadCount(0))
            }
          } else setAuth(null)
        })
        .catch(() => {
          try {
            setAuth(getStoredAuth('customer'))
          } catch { setAuth(null) }
        })
        .finally(() => {
          notificationLoadInFlight.current = false
        })
    }
    load()
    window.addEventListener('asaani-auth-changed', load)
    return () => {
      window.removeEventListener('asaani-auth-changed', load)
    }
  }, [])

  useEffect(() => {
    if (!profileOpen) return

    const closeOnOutsideClick = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) setProfileOpen(false)
    }
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileOpen(false)
        profileButtonRef.current?.focus()
      }
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [profileOpen])

  const markNotificationRead = async (notification: CustomerNotification) => {
    const customer = getStoredAuth('customer')
    if (customer?.profile_id) {
      await markCustomerNotificationRead(customer.profile_id, notification.id).catch(() => undefined)
    }
    setUnreadCount((count) => Math.max(0, count - (notification.is_read ? 0 : 1)))
    setAlertNotification(null)
  }

  const signOut = () => {
    clearStoredAuth('customer')
    setAuth(null)
    setProfileOpen(false)
    window.dispatchEvent(new Event('asaani-auth-changed'))
    logoutUser().catch(() => {
    }).finally(() => {
      setAuth(null)
      setProfileOpen(false)
      window.dispatchEvent(new Event('asaani-auth-changed'))
    })
  }

  return (
    <header className="relative site-container mx-auto flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative"><Hand size={28} strokeWidth={2} className="text-black" /><Sparkles size={14} strokeWidth={2} className="text-orange-500 absolute -top-1 -end-1" /></div>
        <div className="flex flex-col leading-tight"><span className="font-extrabold text-xl tracking-tight text-orange-500">{t("Asaani")}</span><span className="font-bold text-lg tracking-tight -mt-1.5 text-orange-500">{t("Say")}</span></div>
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
        <Link href="/" className={isActivePath('/', 'home') ? 'font-semibold text-orange-600' : 'transition hover:text-orange-500'}>{t('Home')}</Link>
        <Link href="/about-us" className={isActivePath('/about-us', 'about') ? 'font-semibold text-orange-600' : 'transition hover:text-orange-500'}>{t('About Us')}</Link>
        <Link href="/services" className={isActivePath('/services', 'services') ? 'font-semibold text-orange-600' : 'transition hover:text-orange-500'}>{t('Services')}</Link>
        <Link href="/contact-us" className={isActivePath('/contact-us', 'contact') ? 'font-semibold text-orange-600' : 'transition hover:text-orange-500'}>{t('Contact Us')}</Link>
        <Link href="/blog" className={isActivePath('/blog', 'blog') ? 'font-semibold text-orange-600' : 'transition hover:text-orange-500'}>{t('Blog')}</Link>
      </nav>
      <div className="flex items-center gap-2">
        {showLanguageSwitcher && <LanguageSwitcher compact />}
        {auth === undefined ? (
          <Link href="/login" className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-[#3A3E59] px-2.5 py-2 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#2C2F45] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">
            {t('Get Started')}
          </Link>
        ) : auth ? (
          <div className="relative" ref={profileMenuRef}>
            <button
              ref={profileButtonRef}
              type="button"
              aria-label={t('Open customer account menu')}
              aria-expanded={profileOpen}
              aria-controls="customer-account-menu"
              onClick={() => setProfileOpen((open) => !open)}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-orange-100 bg-orange-50/70 px-3 text-orange-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50 sm:px-3.5"
            >
              <User className="h-4 w-4 shrink-0" />
              <span className="hidden max-w-36 truncate text-xs font-semibold tracking-wide sm:inline">{customerName}</span>
              <ChevronDown className={`hidden h-3.5 w-3.5 transition-transform sm:inline ${profileOpen ? 'rotate-180' : ''}`} />
            </button>
            {profileOpen && (
              <div id="customer-account-menu" aria-label={t('Customer account options')} className="fixed left-1/2 top-28 z-50 w-56 max-w-[calc(100vw-1.5rem)] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-2 shadow-xl md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:translate-x-0">
                  <Link
                    href="/customer/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActivePath('/customer/dashboard', 'dashboard') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}
                  >
                    <LayoutDashboard className="h-4 w-4" /> {t('Dashboard')}
                  </Link>
                  <Link
                    href="/customer/orders"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActivePath('/customer/orders', 'orders') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}
                  >
                    <ClipboardList className="h-4 w-4" /> {t('My Orders')}
                  </Link>
                  <Link
                    href="/customer/notifications"
                    onClick={() => setProfileOpen(false)}
                    className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActivePath('/customer/notifications', 'notifications') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}
                  >
                    <span className="flex items-center gap-3"><Bell className="h-4 w-4" /> {t('Notifications')}</span>
                    {unreadCount > 0 && <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-semibold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
                  </Link>
                  <div className="my-1 border-t border-slate-100" />
                  <button
                    type="button"
                    onClick={signOut}
                    className="w-full rounded-lg px-3 py-2.5 text-start text-sm font-semibold text-red-500 transition-colors hover:bg-red-50"
                  >
                    {t('Sign out')}
                  </button>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login" className="inline-flex cursor-pointer items-center justify-center whitespace-nowrap rounded-lg bg-[#3A3E59] px-2.5 py-2 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#2C2F45] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-sm">
            {t('Get Started')}
          </Link>
        )}
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden" aria-label={t('Open navigation menu')}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {alertNotification && <div className="fixed end-4 top-4 z-60 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-orange-100 bg-white p-4 shadow-xl"><button type="button" title={t('Close notification')} aria-label={t('Close notification')} onClick={() => void markNotificationRead(alertNotification)} className="absolute end-2 top-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button><div className="flex items-start gap-3 pe-5"><Bell className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" /><div className="min-w-0"><p className="text-xs font-extrabold text-slate-900">{t(alertNotification.title)}</p><p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600">{t(alertNotification.body)}</p><button type="button" onClick={() => void markNotificationRead(alertNotification)} className="mt-2 text-[10px] font-bold text-orange-600">{t("Mark as read")}</button><Link href="/customer/notifications" onClick={() => void markNotificationRead(alertNotification)} className="ms-3 inline-block text-[10px] font-bold text-orange-600">{t("View notification")}</Link></div></div></div>}
      {mobileOpen && (
        <div className="absolute start-0 end-0 top-full z-40 max-h-[calc(100dvh-5rem)] overflow-y-auto border-b border-slate-200 bg-white p-4 shadow-lg md:hidden">
          <div className="flex flex-col gap-1 text-sm font-semibold">
            <Link href="/" onClick={() => setMobileOpen(false)} className={`rounded-lg px-3 py-3 transition-colors ${isActivePath('/', 'home') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}>{t('Home')}</Link>
            <Link href="/services" onClick={() => setMobileOpen(false)} className={`rounded-lg px-3 py-3 transition-colors ${isActivePath('/services', 'services') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}>{t('Services')}</Link>
            <Link href="/about-us" onClick={() => setMobileOpen(false)} className={`rounded-lg px-3 py-3 transition-colors ${isActivePath('/about-us', 'about') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}>{t('About Us')}</Link>
            <Link href="/contact-us" onClick={() => setMobileOpen(false)} className={`rounded-lg px-3 py-3 transition-colors ${isActivePath('/contact-us', 'contact') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}>{t('Contact Us')}</Link>
            <Link href="/blog" onClick={() => setMobileOpen(false)} className={`rounded-lg px-3 py-3 transition-colors ${isActivePath('/blog', 'blog') ? 'bg-orange-50 text-orange-600' : 'text-slate-700 hover:bg-orange-50 hover:text-orange-600'}`}>{t('Blog')}</Link>
          </div>
        </div>
      )}
    </header>
  )
}
