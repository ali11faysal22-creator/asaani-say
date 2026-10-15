'use client'

import Breadcrumbs from '@/components/Breadcrumbs'
import { useState, type ReactNode } from 'react'
import AdminSidebar from './admin-sidebar'
import AdminTopbar from './admin-topbar'
import { useRequireAuth } from '@/app/lib/use-require-auth'

export default function AdminShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const authed = useRequireAuth('admin', '/admin/login')

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex font-sans">
      <AdminSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar onMenuClick={() => setMobileNavOpen(true)} />

        <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="w-full space-y-6"><Breadcrumbs />{authed ? children : null}</div>
        </div>
      </div>
    </div>
  )
}
