'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, ChevronDown, ClipboardList, Hand, Menu, Sparkles, User, X } from 'lucide-react'
import { getCurrentUser, getStoredAuth, logoutUser } from '../lib/booking-api'

export default function CustomerNavbar({ active = '' }: { active?: string }) {
  const [auth, setAuth] = useState<{ role?: string; email?: string } | null | undefined>(undefined)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const load = () => {
      getCurrentUser()
        .then((user) => {
          if (user.role === 'customer') {
            localStorage.setItem('asaani_auth', JSON.stringify(user))
            setAuth(user)
          } else setAuth(null)
        })
        .catch(() => {
          try {
            setAuth(getStoredAuth('customer'))
          } catch { setAuth(null) }
        })
    }
    load()
    window.addEventListener('asaani-auth-changed', load)
    return () => window.removeEventListener('asaani-auth-changed', load)
  }, [])

  const signOut = () => {
    logoutUser().finally(() => {
      localStorage.removeItem('asaani_customer_auth')
      const vendorAuth = getStoredAuth('vendor')
      if (!vendorAuth) localStorage.removeItem('asaani_auth')
      setAuth(null)
      setProfileOpen(false)
      window.dispatchEvent(new Event('asaani-auth-changed'))
    })
  }

  return (
    <header className="relative max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-6 lg:px-8">
      <Link href="/" className="flex items-center gap-2">
        <div className="relative"><Hand size={28} strokeWidth={2} className="text-black" /><Sparkles size={14} strokeWidth={2} className="text-orange-500 absolute -top-1 -right-1" /></div>
        <div className="flex flex-col leading-tight"><span className="font-extrabold text-xl tracking-tight text-orange-500">Asaani</span><span className="font-bold text-lg tracking-tight -mt-1.5 text-orange-500">Say</span></div>
      </Link>
      <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
        <Link href="/" className={active === 'home' ? 'text-slate-900 font-semibold' : 'hover:text-orange-500 transition'}>Home</Link>
        <Link href="/about-us" className="hover:text-orange-500 transition">About Us</Link>
        <Link href="/services" className={active === 'services' ? 'text-slate-900 font-semibold' : 'hover:text-orange-500 transition'}>Services</Link>
        <Link href="/contact-us" className="hover:text-orange-500 transition">Contact Us</Link>
        <Link href="/blog" className="hover:text-orange-500 transition">Blog</Link>
      </nav>
      <div className="flex items-center gap-2">
        {auth === undefined ? (
          <Link href="/login" className="hidden sm:block">
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#3A3E59] px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#2C2F45] sm:px-5 sm:py-2.5 sm:text-sm">
              Get Started
            </button>
          </Link>
        ) : auth ? (
          <div className="hidden items-center gap-2 sm:flex sm:gap-3">
            <Link href="/customer/orders" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-orange-500 sm:text-xs"><ClipboardList className="h-4 w-4" /> My Orders</Link>
            <Link href="/customer/notifications" className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-orange-500 sm:text-xs"><Bell className="h-4 w-4" /> Notifications</Link>
            <div className="relative">
              <button onClick={() => setProfileOpen((open) => !open)} className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-2 text-[11px] font-bold text-orange-600 sm:gap-2 sm:px-3 sm:text-xs"><User className="h-4 w-4" /><span>{auth.email?.split('@')[0] || 'Customer'}</span><ChevronDown className="h-3.5 w-3.5" /></button>
              {profileOpen && <div className="absolute right-0 top-12 z-30 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"><p className="px-3 py-2 text-[11px] text-slate-400">Signed in as customer</p><button onClick={signOut} className="w-full rounded-lg px-3 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50">Sign out</button></div>}
            </div>
          </div>
        ) : (
          <Link href="/login" className="hidden sm:block">
            <button className="inline-flex items-center gap-2 rounded-lg bg-[#3A3E59] px-3 py-2 text-xs font-medium text-white shadow-sm transition hover:bg-[#2C2F45] sm:px-5 sm:py-2.5 sm:text-sm">
              Get Started
            </button>
          </Link>
        )}
        <button type="button" onClick={() => setMobileOpen((open) => !open)} className="rounded-lg border border-slate-200 p-2 text-slate-700 md:hidden" aria-label="Open navigation menu">
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {mobileOpen && <div className="absolute left-0 right-0 top-full z-40 border-b border-slate-200 bg-white p-4 shadow-lg md:hidden"><div className="flex flex-col gap-1 text-sm font-semibold text-slate-700"><Link href="/" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 hover:bg-orange-50">Home</Link><Link href="/services" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 hover:bg-orange-50">Services</Link><Link href="/about-us" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 hover:bg-orange-50">About Us</Link>{auth ? <><Link href="/customer/orders" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-orange-600 hover:bg-orange-50">My Orders</Link><Link href="/customer/notifications" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-orange-600 hover:bg-orange-50">Notifications</Link><button onClick={() => { signOut(); setMobileOpen(false) }} className="rounded-lg px-3 py-3 text-left text-red-500 hover:bg-red-50">Sign out</button></> : <Link href="/login" onClick={() => setMobileOpen(false)} className="rounded-lg px-3 py-3 text-orange-600 hover:bg-orange-50">Login / Signup</Link>}</div></div>}
    </header>
  )
}
