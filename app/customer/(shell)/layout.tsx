import CustomerShell from '../components/customer-shell'

export default function CustomerShellLayout({ children }: { children: React.ReactNode }) {
  return <CustomerShell>{children}</CustomerShell>
}
