'use client'

import { useState, type ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import VendorSidebar from './vendor-sidebar'
import VendorTopbar from './vendor-topbar'
import { DEFAULT_VENDOR_PAGE_META, VENDOR_PAGE_META } from './vendor-page-meta'

export default function VendorShell({ children }: { children: ReactNode }) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const pathname = usePathname()
  const { contentClassName } = (pathname && VENDOR_PAGE_META[pathname]) || DEFAULT_VENDOR_PAGE_META

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] flex font-sans">
      <VendorSidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col">
        <VendorTopbar onMenuClick={() => setMobileNavOpen(true)} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className={`${contentClassName || 'max-w-6xl'} mx-auto space-y-6`}>{children}</div>
        </main>
      </div>
    </div>
  )
}
