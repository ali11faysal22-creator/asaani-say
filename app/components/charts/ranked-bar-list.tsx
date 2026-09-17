import { CHART_ACCENT } from './palette'

export function RankedBarList({
  title,
  subtitle,
  data,
  emptyText = 'No data yet.',
  color = CHART_ACCENT,
}: {
  title: string
  subtitle?: string
  data: [string, number][]
  emptyText?: string
  color?: string
}) {
  const max = Math.max(1, ...data.map(([, count]) => count))

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
      <div className="mb-4">
        <h2 className="text-sm font-extrabold text-slate-900">{title}</h2>
        {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {data.length === 0 ? (
        <div className="py-10 text-center text-xs text-slate-400">{emptyText}</div>
      ) : (
        <div className="space-y-3">
          {data.map(([name, count]) => (
            <div key={name} className="flex items-center gap-3">
              <span className="w-28 sm:w-44 shrink-0 text-xs font-semibold text-slate-600 truncate" title={name}>
                {name}
              </span>
              <div className="flex-1 h-5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(6, (count / max) * 100)}%`, backgroundColor: color }}
                />
              </div>
              <span className="w-6 shrink-0 text-xs font-extrabold text-slate-900 text-right">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
