'use client'

import { RefreshCw, Search } from 'lucide-react'

export function TableToolbar({
  search,
  onSearchChange,
  placeholder = 'Search…',
  resultCount,
  totalCount,
  onRefresh,
  refreshing,
}: {
  search: string
  onSearchChange: (value: string) => void
  placeholder?: string
  resultCount: number
  totalCount: number
  onRefresh?: () => void
  refreshing?: boolean
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="relative w-full sm:w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-[#EE6C52] transition shadow-2xs"
        />
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <p className="text-[11px] font-semibold text-slate-400">
          {resultCount === totalCount ? <>{totalCount} total</> : <>{resultCount} of {totalCount}</>}
        </p>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh"
            aria-label="Refresh"
            className="w-8 h-8 inline-flex items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>
    </div>
  )
}
