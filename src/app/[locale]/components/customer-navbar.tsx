'use client'

import { useEffect, useRef, useState } from 'react'
import { Link } from '@/i18n/navigation'
import { Bell, ChevronDown, ClipboardList, Hand, LayoutDashboard, Menu, Sparkles, User, X } from 'lucide-react'
import { clearStoredAuth, fetchCustomerNotifications, getCurrentUser, getStoredAuth, logoutUser, markCustomerNotificationRead, type CustomerNotification } from '../lib/booking-api'
import LanguageSwitcher from './language-switcher'
import { useLanguage } from '../lib/i18n'

export default function CustomerNavbar({ active = '', showLanguageSwitcher = true }: { active?: string; showLanguageSwitcher?: boolean }) {
  const { t } = useLanguage()
  const [auth, setAuth] = useState<{ role?: string; email?: string } | null | undefined>(undefined)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [alertNotification, setAlertNotification] = useState<CustomerNotification | null>(null)
  const notificationLoadInFlight = useRef(false)

  useEffect(() => {
    const load = () => {
      if (notificationLoadInFlight.current) return
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
    <header className="relative max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative"><Hand size={28} strokeWidth={2} className="text-black" /><Sparkles size={14} strokeWidth={2} className="text-orange-500 absolute -top-1 -end-1" /></div>
        <div className="flex flex-col leading-tight"><span className="font-extrabold text-xl tracking-tight text-orange-500">{t("Asaani")}</span><span className="font-bold text-lg tracking-tight -mt-1.5 text-orange-500">{t("Say")}</span></div>
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
        <Link href="/" className={active === 'home' ? 'text-slate-900 font-semibold' : 'hover:text-orange-500 transition'}>{t('Home')}</Link>
        <Link href="/about-us" className="hover:text-orange-500 transition">{t('About Us')}</Link>
        <Link href="/services" className={active === 'services' ? 'text-slate-900 font-semibold' : 'hover:text-orange-500 transition'}>{t('Services')}</Link>
        <Link href="/contact-us" className="hover:text-orange-500 transition">{t('Contact Us')}</Link>
        <Link href="/blog" className="hover:text-orange-500 transition">{t('Blog')}</Link>
      </nav>
      <div className="flex items-center gap-2">
        {auth === undefined ? (
          <Link href="/login" className="hidden sm:block">
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#3A3E59] px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#2C2F45] sm:px-5 sm:py-2.5 sm:text-sm">
              {t('Get Started')}
            </button>
          </Link>
        ) : auth ? (
          <div className="hidden items-center gap-2 sm:flex sm:gap-3">
            <Link href="/customer/dashboard" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-orange-500 sm:text-xs"><LayoutDashboard className="h-4 w-4" /> {t('Dashboard')}</Link>
            <Link href="/customer/orders" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-orange-500 sm:text-xs"><ClipboardList className="h-4 w-4" /> {t('My Orders')}</Link>
            <Link href="/customer/notifications" className="relative inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-orange-500 sm:text-xs"><Bell className="h-4 w-4" /> {t('Notifications')}{unreadCount > 0 && <span className="absolute -end-3 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-black text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}</Link>
            <div className="relative">
              <button onClick={() => setProfileOpen((open) => !open)} className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-2 text-[11px] font-bold text-orange-600 sm:gap-2 sm:px-3 sm:text-xs"><User className="h-4 w-4" /><span>{auth.email?.split('@')[0] || 'Customer'}</span><ChevronDown className="h-3.5 w-3.5" /></button>
              {profileOpen && <div className="absolute end-0 top-12 z-30 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><button onClick={signOut} className="w-full rounded-lg px-3 py-2 text-start text-xs font-bold text-red-500 hover:bg-red-50">{t("Sign out")}</button></div>}
            </div>
          </div>
        ) : (
          <Link href="/login" className="hidden sm:block">
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#3A3E59] px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#2C2F45] sm:px-5 sm:py-2.5 sm:text-sm">
              {t('Get Started')}
            </button>
          </Link>
        )}
        {showLanguageSwitcher && <LanguageSwitcher compact />}
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden" aria-label="Open navigation menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {alertNotification && <div className="fixed end-4 top-4 z-60 w-[min(360px,calc(100vw-2rem))] rounded-2xl border border-orange-100 bg-white p-4 shadow-xl"><button type="button" title="Close notification" aria-label="Close notification" onClick={() => void markNotificationRead(alertNotification)} className="absolute end-2 top-2 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><X className="h-4 w-4" /></button><div className="flex items-start gap-3 pe-5"><Bell className="mt-0.5 h-4 w-4 shrink-0 text-orange-500" /><div className="min-w-0"><p className="text-xs font-extrabold text-slate-900">{alertNotification.title}</p><p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-slate-600">{alertNotification.body}</p><button type="button" onClick={() => void markNotificationRead(alertNotification)} className="mt-2 text-[10px] font-bold text-orange-600">{t("Mark as read")}</button><Link href="/customer/notifications" onClick={() => void markNotificationRead(alertNotification)} className="ms-3 inline-block text-[10px] font-bold text-orange-600">{t("View notification")}</Link></div></div></div>}
      {mobileOpen && <div className="absolute start-0 end-0 top-full z-40 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden"><div className="flex flex-col gap-1 text-sm font-semibold text-slate-700"><Link href="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 hover:bg-orange-50">{t('Home')}</Link><Link href="/services" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 hover:bg-orange-50">{t('Services')}</Link><Link href="/about-us" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 hover:bg-orange-50">{t('About Us')}</Link>{auth ? <><Link href="/customer/dashboard" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-orange-600 hover:bg-orange-50">{t('Dashboard')}</Link><Link href="/customer/orders" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-orange-600 hover:bg-orange-50">{t('My Orders')}</Link><Link href="/customer/notifications" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-orange-600 hover:bg-orange-50">{t('Notifications')}</Link><button onClick={() => { signOut(); setMobileOpen(false) }} className="rounded-lg px-3 py-3 text-start text-red-500 hover:bg-red-50">{t('Sign out')}</button></> : <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-orange-600 hover:bg-orange-50">{t('Login / Signup')}</Link>}</div></div>}
    </header>
  )
}
