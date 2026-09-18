'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye } from 'lucide-react'
import { fetchAdminCustomers, getCurrentUser, type AdminCustomer } from '@/app/lib/booking-api'
import { InitialsAvatar } from '../../components/initials-avatar'
import { TableToolbar } from '../../components/table-toolbar'
import { IconActionButton } from '../../components/icon-action-button'
import { DetailModal } from '../../components/detail-modal'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'

export default function AdminCustomersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [customers, setCustomers] = useState<AdminCustomer[]>([])
  const [search, setSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null)

  const loadData = async () => {
    try {
      setCustomers(await fetchAdminCustomers())
    } catch (loadError) {
      console.error('Unable to load customers', loadError)
    }
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const user = await getCurrentUser('admin')
        if (user.role !== 'admin') {
          router.push('/admin/login')
          return
        }
      } catch {
        router.push('/admin/login')
        return
      }
      await loadData()
      if (active) setLoading(false)
    }
    init()
    return () => {
      active = false
    }
  }, [router])

  useAutoRefreshOnFocus(() => {
    if (!loading) loadData()
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData()
    setRefreshing(false)
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return customers
    return customers.filter(
      (c) => c.full_name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.phone.toLowerCase().includes(q)
    )
  }, [customers, search])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <TableToolbar
        search={search}
        onSearchChange={setSearch}
        placeholder="Search customers…"
        resultCount={filtered.length}
        totalCount={customers.length}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-bold">Customer</th>
              <th className="px-4 py-3 font-bold">Contact</th>
              <th className="px-4 py-3 font-bold">Address</th>
              <th className="px-4 py-3 font-bold">Joined</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((customer) => (
              <tr key={customer.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={customer.full_name} />
                    <p className="font-bold text-slate-800 truncate">{customer.full_name}</p>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700 truncate">{customer.email}</p>
                  <p className="text-slate-400 text-[11px]">{customer.phone}</p>
                </td>
                <td className="px-4 py-3 text-slate-500 max-w-56 truncate">{customer.default_address || '—'}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(customer.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end">
                    <IconActionButton icon={Eye} label="View details" onClick={() => setSelectedCustomer(customer)} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  {customers.length === 0 ? 'No customers yet.' : 'No customers match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedCustomer && (
        <DetailModal
          title={selectedCustomer.full_name}
          subtitle="Customer"
          onClose={() => setSelectedCustomer(null)}
          fields={[
            { label: 'Email', value: selectedCustomer.email },
            { label: 'Phone', value: selectedCustomer.phone },
            { label: 'Default address', value: selectedCustomer.default_address || '—' },
            { label: 'Joined', value: new Date(selectedCustomer.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) },
          ]}
        />
      )}
    </div>
  )
}
