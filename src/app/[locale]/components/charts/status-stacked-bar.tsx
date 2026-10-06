'use client'

import { useState } from 'react'

export type StatusSegment = { key: string; label: string; value: number; color: string }

export function StatusStackedBar({
  title,
  subtitle,
  segments,
  total,
  emptyText = 'No data yet.',
}: {
  title: string
  subtitle?: string
  segments: StatusSegment[]
  total: number
  emptyText?: string
}) {
  const [hoverKey, setHoverKey] = useState<string | null>(null)
  const visibleSegments = segments.filter((s) => s.value > 0)
  const safeTotal = total || 1

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {total === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-slate-400">{emptyText}</div>
      ) : (
        <>
          <div className="flex w-full h-8 rounded-lg overflow-hidden gap-0.5">
            {visibleSegments.map((seg) => (
              <div
                key={seg.key}
                tabIndex={0}
                title={`${seg.label}: ${seg.value}`}
                onMouseEnter={() => setHoverKey(seg.key)}
                onMouseLeave={() => setHoverKey(null)}
                onFocus={() => setHoverKey(seg.key)}
                onBlur={() => setHoverKey(null)}
                className="h-full transition-opacity outline-none"
                style={{
                  width: `${(seg.value / safeTotal) * 100}%`,
                  backgroundColor: seg.color,
                  opacity: hoverKey && hoverKey !== seg.key ? 0.5 : 1,
                }}
              />
            ))}
          </div>

          <div className="mt-4 space-y-2.5">
            {visibleSegments.map((seg) => (
              <div key={seg.key} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: seg.color }} />
                  <span className="font-semibold text-slate-600">{seg.label}</span>
                </div>
                <span className="font-extrabold text-slate-900">{seg.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
