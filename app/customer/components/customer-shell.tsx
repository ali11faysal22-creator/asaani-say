'use client'

import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import CustomerSidebar from './customer-sidebar'
import CustomerTopbar from './customer-topbar'
import { resolveCustomerPageMeta } from './customer-page-meta'

export default function CustomerShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()
  const { contentClassName } = resolveCustomerPageMeta(pathname)

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex font-sans">
      <CustomerSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <CustomerTopbar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className={`${contentClassName || 'w-full'} space-y-6`}>{children}</div>
        </main>
      </div>
    </div>
  )
}
