'use client'

import { useState, type ReactNode } from 'react'
import AdminSidebar from './admin-sidebar'
import AdminTopbar from './admin-topbar'

export default function AdminShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex font-sans">
      <AdminSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <AdminTopbar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  )
}
