'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ClipboardList, Inbox, LayoutDashboard, Mail, ShieldCheck, Store, Users, X } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/service-requests', label: 'Service Requests', icon: Inbox },
  { href: '/admin/contact-messages', label: 'Contact Messages', icon: Mail },
  { href: '/admin/vendors', label: 'Vendors', icon: Store },
  { href: '/admin/customers', label: 'Customers', icon: Users },
  { href: '/admin/bookings', label: 'Bookings', icon: ClipboardList },
] as const

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#EE6C52] flex items-center justify-center shadow-xs shrink-0">
        <ShieldCheck className="w-4.5 h-4.5 text-white" />
      </div>
      <div className="leading-tight min-w-0">
        <span className="font-extrabold text-base tracking-tight text-white block truncate">Asaani Say</span>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admin Console</span>
      </div>
    </div>
  )
}

function NavList({ pathname, onNavigate }: { pathname: string | null; onNavigate?: () => void }) {
  return (
    <nav className="space-y-1">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
              active ? 'bg-[#EE6C52] text-white shadow-sm' : 'text-slate-300 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Icon className="w-4.5 h-4.5 shrink-0" />
            <span>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

function TrustNote() {
  return (
    <div className="pt-6 mt-6 border-t border-white/10 flex items-start gap-2.5 text-[11px] text-slate-400 leading-relaxed">
      <ShieldCheck className="w-4 h-4 text-[#EE6C52] shrink-0 mt-0.5" />
      <span>Admin actions here affect every vendor and customer on the platform.</span>
    </div>
  )
}

export default function AdminSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname()

  return (
    <>
      <aside className="hidden md:flex md:flex-col md:w-64 lg:w-72 shrink-0 bg-[#2C2F45] text-white p-6 min-h-screen sticky top-0">
        <Brand />
        <div className="flex-1 mt-10">
          <NavList pathname={pathname} />
        </div>
        <TrustNote />
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <aside className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[#2C2F45] text-white p-6 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-10">
              <Brand />
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 hover:text-white transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <NavList pathname={pathname} onNavigate={onClose} />
            </div>
            <TrustNote />
          </aside>
        </div>
      )}
    </>
  )
}
