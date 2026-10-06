'use client'

export function IconActionButton({
  icon: Icon,
  label,
  onClick,
  tone = 'default',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  tone?: 'default' | 'danger'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`w-8 h-8 inline-flex items-center justify-center rounded-lg border transition cursor-pointer ${
        tone === 'danger'
          ? 'border-red-200 text-red-500 hover:bg-red-50'
          : 'border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  )
}
