'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, UserCheck } from 'lucide-react'
import {
  assignServiceRequestVendor,
  fetchAdminServiceRequests,
  fetchAdminVendors,
  getCurrentUser,
  type AdminVendor,
  type ServiceRequest,
} from '@/app/lib/booking-api'
import { StatusBadge, type StatusTone } from '../../components/status-badge'
import { TableToolbar } from '../../components/table-toolbar'
import { IconActionButton } from '../../components/icon-action-button'
import { DetailModal } from '../../components/detail-modal'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'

function statusTone(status: ServiceRequest['status']): StatusTone {
  if (status === 'assigned') return 'good'
  if (status === 'closed') return 'neutral'
  return 'warning'
}

export default function AdminServiceRequestsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [vendors, setVendors] = useState<AdminVendor[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null)
  const [assigningRequest, setAssigningRequest] = useState<ServiceRequest | null>(null)
  const [assignVendorId, setAssignVendorId] = useState('')
  const [assigning, setAssigning] = useState(false)

  const loadData = async () => {
    const [requestsResult, vendorsResult] = await Promise.allSettled([fetchAdminServiceRequests(), fetchAdminVendors()])
    if (requestsResult.status === 'fulfilled') setRequests(requestsResult.value)
    else console.error('Unable to load service requests', requestsResult.reason)
    if (vendorsResult.status === 'fulfilled') setVendors(vendorsResult.value)
    else console.error('Unable to load vendors', vendorsResult.reason)
  }

  useEffect(() => {
    let active = true
    const init = async () => {
      try {
        const user = await getCurrentUser()
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
    if (!q) return requests
    return requests.filter(
      (r) =>
        r.service_name.toLowerCase().includes(q) ||
        r.city.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q) ||
        r.phone.toLowerCase().includes(q)
    )
  }, [requests, search])

  const openAssign = (request: ServiceRequest) => {
    setError('')
    setAssignVendorId(request.assigned_vendor_id || '')
    setAssigningRequest(request)
  }

  const confirmAssign = async () => {
    if (!assigningRequest || !assignVendorId) return
    setAssigning(true)
    setError('')
    try {
      const updated = await assignServiceRequestVendor(assigningRequest.id, assignVendorId)
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
      setSelectedRequest((prev) => (prev && prev.id === updated.id ? updated : prev))
      setAssigningRequest(null)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not assign vendor.')
    } finally {
      setAssigning(false)
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
        placeholder="Search requests…"
        resultCount={filtered.length}
        totalCount={requests.length}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 font-bold">Service</th>
              <th className="px-4 py-3 font-bold">Contact</th>
              <th className="px-4 py-3 font-bold">Location</th>
              <th className="px-4 py-3 font-bold">Preferred</th>
              <th className="px-4 py-3 font-bold">Status</th>
              <th className="px-4 py-3 font-bold">Assigned Vendor</th>
              <th className="px-4 py-3 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((request) => (
              <tr key={request.id} className="hover:bg-slate-50/80 transition">
                <td className="px-4 py-3 font-semibold text-slate-800">{request.service_name}</td>
                <td className="px-4 py-3">
                  <p className="text-slate-700 truncate">{request.email}</p>
                  <p className="text-slate-400 text-[11px]">{request.phone}</p>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {request.city} <span className="text-slate-400">({request.zip_code})</span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {request.preferred_date} · {request.preferred_time}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge label={request.status} tone={statusTone(request.status)} />
                </td>
                <td className="px-4 py-3 text-slate-500">{request.assigned_vendor_name || '—'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconActionButton icon={Eye} label="View details" onClick={() => setSelectedRequest(request)} />
                    <IconActionButton icon={UserCheck} label="Assign vendor" onClick={() => openAssign(request)} />
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                  {requests.length === 0 ? 'No service requests yet.' : 'No requests match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedRequest && (
        <DetailModal
          title={selectedRequest.service_name}
          subtitle={`${selectedRequest.city} · ${selectedRequest.zip_code}`}
          onClose={() => setSelectedRequest(null)}
          fields={[
            { label: 'Email', value: selectedRequest.email },
            { label: 'Phone', value: selectedRequest.phone },
            { label: 'Preferred date', value: selectedRequest.preferred_date },
            { label: 'Preferred time', value: selectedRequest.preferred_time },
            { label: 'Status', value: <StatusBadge label={selectedRequest.status} tone={statusTone(selectedRequest.status)} /> },
            { label: 'Assigned vendor', value: selectedRequest.assigned_vendor_name || 'Not assigned yet' },
            { label: 'Submitted', value: new Date(selectedRequest.created_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) },
          ]}
          footer={
            <button
              onClick={() => {
                setSelectedRequest(null)
                openAssign(selectedRequest)
              }}
              className="w-full rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 cursor-pointer"
            >
              {selectedRequest.assigned_vendor_id ? 'Reassign vendor' : 'Assign vendor'}
            </button>
          }
        />
      )}

      {assigningRequest && (
        <DetailModal
          title="Assign a vendor"
          subtitle={`${assigningRequest.service_name} · ${assigningRequest.city}`}
          onClose={() => setAssigningRequest(null)}
          fields={[]}
          footer={
            <div className="space-y-3">
              <select
                value={assignVendorId}
                onChange={(e) => setAssignVendorId(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-[#EE6C52]"
              >
                <option value="">Select a vendor…</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.business_name} {vendor.city ? `(${vendor.city})` : ''}
                  </option>
                ))}
              </select>
              <button
                onClick={confirmAssign}
                disabled={!assignVendorId || assigning}
                className="w-full rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50 cursor-pointer"
              >
                {assigning ? 'Assigning…' : 'Confirm assignment'}
              </button>
            </div>
          }
        />
      )}
    </div>
  )
}
