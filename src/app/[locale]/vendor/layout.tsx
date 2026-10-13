import type { Metadata } from 'next'
import VendorNotificationMonitor from './components/vendor-notification-monitor'

// The vendor portal is private: keep it out of search results.
export const metadata: Metadata = { title: 'Vendor Portal', robots: { index: false, follow: false } }

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VendorNotificationMonitor />
      {children}
    </>
  )
}
