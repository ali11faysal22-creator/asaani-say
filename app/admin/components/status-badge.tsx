export type StatusTone = 'good' | 'warning' | 'critical' | 'neutral'

const TONE_CLASSES: Record<StatusTone, string> = {
  good: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warning: 'bg-amber-50 text-amber-600 border-amber-200',
  critical: 'bg-red-50 text-red-600 border-red-200',
  neutral: 'bg-slate-100 text-slate-500 border-slate-200',
}

export function StatusBadge({ label, tone }: { label: string; tone: StatusTone }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${TONE_CLASSES[tone]}`}>
      {label}
    </span>
  )
}

export function bookingStatusTone(status: string): StatusTone {
  if (status === 'completed') return 'good'
  if (status === 'unassigned') return 'critical'
  if (status === 'pending') return 'warning'
  if (status === 'rejected' || status === 'cancelled') return 'critical'
  return 'neutral' // accepted, on_the_way, in_progress
}

export function vendorStatusTone(status: string): StatusTone {
  if (status === 'approved') return 'good'
  if (status === 'pending') return 'warning'
  if (status === 'rejected' || status === 'suspended') return 'critical'
  return 'neutral'
}
