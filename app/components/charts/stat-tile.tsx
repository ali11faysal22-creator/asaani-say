export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
}: {
  label: string
  value: string | number
  sublabel?: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className="w-8 h-8 rounded-lg bg-[#EE6C52]/10 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-[#EE6C52]" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-extrabold text-[#2C2F45]">{value}</p>
      {sublabel && <p className="mt-1 text-[11px] text-slate-400">{sublabel}</p>}
    </div>
  )
}
