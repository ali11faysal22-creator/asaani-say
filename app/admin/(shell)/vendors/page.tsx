'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Ban, CheckCircle2, Eye, ShieldCheck, ShieldOff } from 'lucide-react'
import { fetchAdminVendors, getCurrentUser, setAdminVendorStatus, setAdminVendorVerified, type AdminVendor } from '@/app/lib/booking-api'
import { InitialsAvatar } from '../../components/initials-avatar'
import { StatusBadge, vendorStatusTone } from '../../components/status-badge'
import { TableToolbar } from '../../components/table-toolbar'
import { IconActionButton } from '../../components/icon-action-button'
import { DetailModal } from '../../components/detail-modal'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'

export default function AdminVendorsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [selectedVendor, setSelectedVendor] = useState<AdminVendor | null>(null)

  const loadData = async () => {
    try {
      setVendors(await fetchAdminVendors())
    } catch (loadError) {
      console.error('Unable to load vendors', loadError)
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
    if (!q) return vendors
    return vendors.filter(
      (v) =>
        v.business_name.toLowerCase().includes(q) ||
        `${v.first_name} ${v.last_name}`.toLowerCase().includes(q) ||
        v.email.toLowerCase().includes(q) ||
        (v.city || '').toLowerCase().includes(q)
    )
  }, [vendors, search])

  const applyUpdate = (updated: AdminVendor) => {
    setVendors((prev) => prev.map((v) => (v.id === updated.id ? updated : v)))
    setSelectedVendor((prev) => (prev && prev.id === updated.id ? updated : prev))
  }

  const toggleVerified = async (vendor: AdminVendor) => {
    setError('')
    try {
      applyUpdate(await setAdminVendorVerified(vendor.id, !vendor.is_verified))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update vendor.')
    }
  }

  const toggleSuspended = async (vendor: AdminVendor) => {
    setError('')
    try {
      applyUpdate(await setAdminVendorStatus(vendor.id, vendor.status === 'suspended' ? 'approved' : 'suspended'))
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update vendor.')
    }
  }

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
        placeholder="Search vendors…"
        resultCount={filtered.length}
        totalCount={vendors.length}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-bold">Vendor</th>
              <th className="px-4 py-3 font-bold">Contact</th>
              <th className="px-4 py-3 font-bold">Location</th>
              <th className="px-4 py-3 font-bold">Rating</th>
              <th className="px-4 py-3 font-bold">Missed requests</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Verified</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((vendor) => (
              <tr key={vendor.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <InitialsAvatar name={`${vendor.first_name} ${vendor.last_name}`} />
                    <div className="min-w-0">
                      <p className="font-bold text-slate-800 truncate">
                        {vendor.first_name} {vendor.last_name}
                      </p>
                      <p className="text-slate-400 text-[11px] truncate">{vendor.business_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <p className="text-slate-700 truncate">{vendor.email}</p>
                  <p className="text-slate-400 text-[11px]">{vendor.phone}</p>
                </td>
                <td className="px-4 py-3 text-slate-500">{[vendor.city, vendor.area].filter(Boolean).join(', ') || '—'}</td>
                <td className="px-4 py-3 text-slate-500">
                  {vendor.average_rating.toFixed(1)} <span className="text-slate-400">({vendor.review_count})</span>
                </td>
                <td className="px-4 py-3">
                  {vendor.missed_response_count >= 5 ? (
                    <StatusBadge label={`${vendor.missed_response_count} missed`} tone="critical" />
                  ) : (
                    <span className="text-slate-400">{vendor.missed_response_count}</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={vendor.status} tone={vendorStatusTone(vendor.status)} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={vendor.is_verified ? 'Verified' : 'Unverified'} tone={vendor.is_verified ? 'good' : 'warning'} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconActionButton icon={Eye} label="View details" onClick={() => setSelectedVendor(vendor)} />
                    <IconActionButton
                      icon={vendor.is_verified ? ShieldOff : ShieldCheck}
                      label={vendor.is_verified ? 'Revoke verification' : 'Verify vendor'}
                      onClick={() => toggleVerified(vendor)}
                    />
                    <IconActionButton
                      icon={vendor.status === 'suspended' ? CheckCircle2 : Ban}
                      label={vendor.status === 'suspended' ? 'Reactivate vendor' : 'Suspend vendor'}
                      tone={vendor.status === 'suspended' ? 'default' : 'danger'}
                      onClick={() => toggleSuspended(vendor)}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                  {vendors.length === 0 ? 'No vendors yet.' : 'No vendors match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedVendor && (
        <DetailModal
          title={`${selectedVendor.first_name} ${selectedVendor.last_name}`}
          subtitle={selectedVendor.business_name}
          onClose={() => setSelectedVendor(null)}
          fields={[
            { label: 'Email', value: selectedVendor.email },
            { label: 'Phone', value: selectedVendor.phone },
            { label: 'Location', value: [selectedVendor.city, selectedVendor.area].filter(Boolean).join(', ') || '—' },
            { label: 'Rating', value: `${selectedVendor.average_rating.toFixed(1)} (${selectedVendor.review_count} reviews)` },
            { label: 'Missed requests', value: `${selectedVendor.missed_response_count} times didn't respond in time` },
            { label: 'Status', value: <StatusBadge label={selectedVendor.status} tone={vendorStatusTone(selectedVendor.status)} /> },
            { label: 'Verified', value: <StatusBadge label={selectedVendor.is_verified ? 'Verified' : 'Unverified'} tone={selectedVendor.is_verified ? 'good' : 'warning'} /> },
            { label: 'Online now', value: selectedVendor.is_online ? 'Yes' : 'No' },
            { label: 'Joined', value: new Date(selectedVendor.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' }) },
          ]}
          footer={
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleVerified(selectedVendor)}
                className="flex-1 rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 cursor-pointer"
              >
                {selectedVendor.is_verified ? 'Revoke verification' : 'Verify vendor'}
              </button>
              <button
                onClick={() => toggleSuspended(selectedVendor)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 cursor-pointer"
              >
                {selectedVendor.status === 'suspended' ? 'Reactivate' : 'Suspend'}
              </button>
            </div>
          }
        />
      )}
    </div>
  )
}
