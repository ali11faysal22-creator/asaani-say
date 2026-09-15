import VendorNotificationMonitor from './components/vendor-notification-monitor'

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <VendorNotificationMonitor />
      {children}
    </>
  )
}
