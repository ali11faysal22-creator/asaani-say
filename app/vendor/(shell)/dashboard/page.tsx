'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, Clock, ListChecks, Star, Wallet } from 'lucide-react'
import { fetchVendorBookings, fetchVendorProfile, getStoredAuth, type BookingResult, type VendorProfileResponse } from '@/app/lib/booking-api'
import { CHART_BLUE, STATUS_CRITICAL, STATUS_GOOD, STATUS_WARNING } from '@/app/components/charts/palette'
import { StatTile } from '@/app/components/charts/stat-tile'
import { TrendLineChart, type TrendPoint } from '@/app/components/charts/trend-line-chart'
import { StatusStackedBar } from '@/app/components/charts/status-stacked-bar'
import { RankedBarList } from '@/app/components/charts/ranked-bar-list'

type BookingBucket = 'completed' | 'active' | 'pending' | 'cancelled'

function bucketForStatus(status: string): BookingBucket {
  if (status === 'completed') return 'completed'
  if (status === 'pending') return 'pending'
  if (status === 'rejected' || status === 'cancelled') return 'cancelled'
  return 'active' // accepted, on_the_way, in_progress
}

export default function VendorDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<VendorProfileResponse | null>(null)
  const [bookings, setBookings] = useState<BookingResult[]>([])

  useEffect(() => {
    let active = true
    const load = async () => {
      const auth = getStoredAuth('vendor')
      if (!auth || auth.role !== 'vendor') {
        router.push('/vendor/login')
        return
      }
      const vendorId = auth.profile_id || auth.user_id
      const [profileResult, bookingsResult] = await Promise.allSettled([
        fetchVendorProfile(vendorId),
        fetchVendorBookings(vendorId),
      ])
      if (!active) return
      if (profileResult.status === 'fulfilled') {
        setProfile(profileResult.value)
      } else {
        console.error('Unable to load vendor profile', profileResult.reason)
      }
      if (bookingsResult.status === 'fulfilled') {
        setBookings(bookingsResult.value)
      } else {
        console.error('Unable to load vendor bookings', bookingsResult.reason)
      }
      setLoading(false)
    }
    load()
    return () => {
      active = false
    }
  }, [router])

  const stats = useMemo(() => {
    const total = bookings.length
    const pending = bookings.filter((b) => bucketForStatus(b.status) === 'pending').length
    const active = bookings.filter((b) => bucketForStatus(b.status) === 'active').length
    const completed = bookings.filter((b) => bucketForStatus(b.status) === 'completed').length
    const cancelled = bookings.filter((b) => bucketForStatus(b.status) === 'cancelled').length
    const earnings = bookings
      .filter((b) => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)
    return { total, pending, active, completed, cancelled, earnings }
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

  const topServices = useMemo<[string, number][]>(() => {
    const counts = new Map<string, number>()
    bookings.forEach((b) => {
      counts.set(b.service_name, (counts.get(b.service_name) || 0) + 1)
    })
    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
  }, [bookings])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatTile label="Total Bookings" value={stats.total} icon={ListChecks} />
        <StatTile label="Pending Requests" value={stats.pending} icon={Clock} />
        <StatTile label="Active Jobs" value={stats.active} icon={CalendarClock} />
        <StatTile label="Total Earnings" value={`Rs. ${stats.earnings.toLocaleString()}`} icon={Wallet} />
        <StatTile
          label="Average Rating"
          value={profile?.average_rating ? profile.average_rating.toFixed(1) : '—'}
          sublabel={profile?.review_count ? `${profile.review_count} reviews` : 'No reviews yet'}
          icon={Star}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 items-stretch">
        <div className="lg:col-span-3">
          <TrendLineChart data={trend} title="Bookings — last 14 days" subtitle="New requests received per day" unitLabel="booking" />
        </div>
        <div className="lg:col-span-2">
          <StatusStackedBar
            title="Booking Status"
            subtitle={`Share of all ${stats.total} bookings`}
            total={stats.total}
            emptyText="No bookings yet."
            segments={[
              { key: 'completed', label: 'Completed', value: stats.completed, color: STATUS_GOOD },
              { key: 'active', label: 'In Progress', value: stats.active, color: CHART_BLUE },
              { key: 'pending', label: 'Pending', value: stats.pending, color: STATUS_WARNING },
              { key: 'cancelled', label: 'Cancelled', value: stats.cancelled, color: STATUS_CRITICAL },
            ]}
          />
        </div>
      </div>

      <RankedBarList title="Top Services" subtitle="Your most-booked services" data={topServices} emptyText="No bookings yet." />
    </div>
  )
}
