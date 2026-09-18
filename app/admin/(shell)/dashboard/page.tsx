'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, ClipboardList, ShieldCheck, Store, UserPlus, Users, Wallet } from 'lucide-react'
import {
  fetchAdminBookings,
  fetchAdminOverview,
  fetchAdminVendors,
  getCurrentUser,
  type AdminBooking,
  type AdminOverview,
  type AdminVendor,
} from '@/app/lib/booking-api'
import { CHART_ACCENT, CHART_BLUE, STATUS_CRITICAL, STATUS_GOOD, STATUS_WARNING } from '@/app/components/charts/palette'
import { StatTile } from '@/app/components/charts/stat-tile'
import { TrendLineChart, type TrendPoint } from '@/app/components/charts/trend-line-chart'
import { StatusStackedBar } from '@/app/components/charts/status-stacked-bar'
import { RankedBarList } from '@/app/components/charts/ranked-bar-list'
import { useAutoRefreshOnFocus } from '../../components/use-auto-refresh'

type BookingBucket = 'completed' | 'active' | 'pending' | 'unassigned' | 'cancelled'

function bucketForStatus(status: string): BookingBucket {
  if (status === 'completed') return 'completed'
  if (status === 'unassigned') return 'unassigned'
  if (status === 'pending') return 'pending'
  if (status === 'rejected' || status === 'cancelled') return 'cancelled'
  return 'active'
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [vendors, setVendors] = useState<AdminVendor[]>([])

  const loadData = async () => {
    const [overviewResult, bookingsResult, vendorsResult] = await Promise.allSettled([
      fetchAdminOverview(),
      fetchAdminBookings(),
      fetchAdminVendors(),
    ])
    if (overviewResult.status === 'fulfilled') setOverview(overviewResult.value)
    else console.error('Unable to load admin overview', overviewResult.reason)
    if (bookingsResult.status === 'fulfilled') setBookings(bookingsResult.value)
    else console.error('Unable to load admin bookings', bookingsResult.reason)
    if (vendorsResult.status === 'fulfilled') setVendors(vendorsResult.value)
    else console.error('Unable to load admin vendors', vendorsResult.reason)
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

  const statusStats = useMemo(() => {
    const completed = bookings.filter((b) => bucketForStatus(b.status) === 'completed').length
    const active = bookings.filter((b) => bucketForStatus(b.status) === 'active').length
    const pending = bookings.filter((b) => bucketForStatus(b.status) === 'pending').length
    const unassigned = bookings.filter((b) => bucketForStatus(b.status) === 'unassigned').length
    const cancelled = bookings.filter((b) => bucketForStatus(b.status) === 'cancelled').length
    return { completed, active, pending, unassigned, cancelled, total: bookings.length }
  }, [bookings])

  const trend = useMemo<TrendPoint[]>(() => {
    const days = 14
    const buckets: TrendPoint[] = Array.from({ length: days }, (_, i) => {
      const d = new Date()
      d.setHours(0, 0, 0, 0)
      d.setDate(d.getDate() - (days - 1 - i))
      return { key: d.toISOString().slice(0, 10), date: d, count: 0 }
    })
    const byKey = new Map(buckets.map((b) => [b.key, b]))
    bookings.forEach((b) => {
      if (!b.created_at) return
      const key = new Date(b.created_at).toISOString().slice(0, 10)
      const bucket = byKey.get(key)
      if (bucket) bucket.count += 1
    })
    return buckets
  }, [bookings])

  const topVendors = useMemo<[string, number][]>(() => {
    const counts = new Map<string, number>()
    bookings.forEach((b) => {
      if (!b.vendor_name) return
      const label = b.vendor_contact_name ? `${b.vendor_contact_name} (${b.vendor_name})` : b.vendor_name
      counts.set(label, (counts.get(label) || 0) + 1)
    })
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [bookings])

  const verifiedVendors = overview?.verified_vendors ?? vendors.filter((v) => v.is_verified).length
  const totalVendors = overview?.total_vendors ?? vendors.length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <StatTile
          label="Needs Vendor"
          value={statusStats.unassigned}
          sublabel={statusStats.unassigned > 0 ? 'Awaiting assignment' : undefined}
          icon={UserPlus}
        />
        <StatTile
          label="Vendors"
          value={totalVendors}
          sublabel={`${verifiedVendors} verified`}
          icon={Store}
        />
        <StatTile label="Customers" value={overview?.total_customers ?? 0} icon={Users} />
        <StatTile label="Total Bookings" value={overview?.total_bookings ?? bookings.length} icon={ClipboardList} />
        <StatTile label="Completed" value={overview?.completed_bookings ?? statusStats.completed} icon={CheckCircle2} />
        <StatTile label="Total Revenue" value={`Rs. ${(overview?.total_revenue ?? 0).toLocaleString()}`} icon={Wallet} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
        <div className="lg:col-span-3">
          <TrendLineChart data={trend} title="Bookings — last 14 days" subtitle="New bookings placed per day, platform-wide" unitLabel="booking" />
        </div>
        <div className="lg:col-span-2">
          <StatusStackedBar
            title="Booking Status"
            subtitle={`Share of all ${statusStats.total} bookings`}
            total={statusStats.total}
            emptyText="No bookings yet."
            segments={[
              { key: 'completed', label: 'Completed', value: statusStats.completed, color: STATUS_GOOD },
              { key: 'active', label: 'In Progress', value: statusStats.active, color: CHART_BLUE },
              { key: 'pending', label: 'Pending', value: statusStats.pending, color: STATUS_WARNING },
              { key: 'unassigned', label: 'Needs Vendor', value: statusStats.unassigned, color: CHART_ACCENT },
              { key: 'cancelled', label: 'Cancelled', value: statusStats.cancelled, color: STATUS_CRITICAL },
            ]}
          />
        </div>
      </div>

      <RankedBarList title="Top Vendors" subtitle="Ranked by number of bookings received" data={topVendors} emptyText="No bookings yet." />

      {totalVendors > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs flex items-center gap-3">
          <ShieldCheck className="w-4 h-4 text-[#EE6C52] shrink-0" />
          <p className="text-xs text-slate-500">
            {totalVendors - verifiedVendors} vendor{totalVendors - verifiedVendors === 1 ? '' : 's'} still awaiting verification.{' '}
            <Link href="/admin/vendors" className="font-bold text-[#EE6C52] hover:underline">
              Review vendors
            </Link>
          </p>
        </div>
      )}
    </div>
  )
}
