'use client'

import { useState } from 'react'
import { CHART_ACCENT } from './palette'

export type TrendPoint = { key: string; date: Date; count: number }

export function TrendLineChart({
  data,
  title,
  subtitle,
  unitLabel = 'booking',
  ariaLabel,
}: {
  data: TrendPoint[]
  title: string
  subtitle?: string
  /** Singular noun for one item — pluralized with a trailing "s" in the tooltip. */
  unitLabel?: string
  ariaLabel?: string
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const width = 640
  const height = 220
  const padding = { top: 16, right: 16, bottom: 8, left: 30 }
  const innerW = width - padding.left - padding.right
  const innerH = height - padding.top - padding.bottom
  const maxCount = Math.max(4, ...data.map((d) => d.count))
  const niceMax = Math.ceil(maxCount / 4) * 4 || 4

  const points = data.map((d, i) => {
    const x = padding.left + (innerW * i) / Math.max(1, data.length - 1)
    const y = padding.top + innerH - (innerH * d.count) / niceMax
    return { x, y, ...d }
  })

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  const areaPath = points.length
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + innerH} L ${points[0].x} ${padding.top + innerH} Z`
    : ''

  const handleMove = (e: React.MouseEvent<SVGRectElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    const idx = Math.min(data.length - 1, Math.max(0, Math.round(ratio * (data.length - 1))))
    setHoverIndex(idx)
  }

  const hovered = hoverIndex !== null ? points[hoverIndex] : null
  const yTicks = [0, niceMax / 2, niceMax]

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs h-full">
      <div className="mb-4">
        <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label={ariaLabel || title}>
          {yTicks.map((t) => {
            const y = padding.top + innerH - (innerH * t) / niceMax
            return (
              <g key={t}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#e1e0d9" strokeWidth={1} />
                <text x={padding.left - 8} y={y + 3} textAnchor="end" fontSize="10" fill="#898781">
                  {t}
                </text>
              </g>
            )
          })}

          <path d={areaPath} fill={CHART_ACCENT} fillOpacity={0.1} />
          <path d={linePath} fill="none" stroke={CHART_ACCENT} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />

          {hovered && (
            <line x1={hovered.x} x2={hovered.x} y1={padding.top} y2={padding.top + innerH} stroke="#c3c2b7" strokeWidth={1} />
          )}

          {points.map(
            (p, i) =>
              (i === points.length - 1 || hoverIndex === i) && (
                <circle key={p.key} cx={p.x} cy={p.y} r={4} fill={CHART_ACCENT} stroke="#ffffff" strokeWidth={2} />
              )
          )}

          <rect
            x={padding.left}
            y={padding.top}
            width={innerW}
            height={innerH}
            fill="transparent"
            onMouseMove={handleMove}
            onMouseLeave={() => setHoverIndex(null)}
          />
        </svg>

        {hovered && (
          <div
            className="absolute top-0 -translate-x-1/2 bg-[#2C2F45] text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg pointer-events-none whitespace-nowrap"
            style={{ left: `${(hovered.x / width) * 100}%` }}
          >
            <div className="font-extrabold">
              {hovered.count} {unitLabel}
              {hovered.count === 1 ? '' : 's'}
            </div>
            <div className="text-slate-300 text-[10px]">
              {hovered.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
          </div>
        )}
      </div>

      {data.length > 0 && (
        <div className="flex justify-between mt-1 text-[10px] text-slate-400">
          <span>{data[0].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
          <span>{data[data.length - 1].date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
        </div>
      )}
    </div>
  )
}
