'use client'

import { usePathname, useRouter } from '@/i18n/navigation'
import { LogOut, Menu } from 'lucide-react'
import { clearStoredAuth, logoutUser } from '@/app/lib/booking-api'
import CustomerNotificationPopover from './customer-notification-popover'
import { resolveCustomerPageMeta } from './customer-page-meta'
import LanguageSwitcher from '@/app/components/language-switcher'
import { useLanguage } from '@/app/lib/i18n'

export default function CustomerTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const { t } = useLanguage()
  const { title, subtitle } = resolveCustomerPageMeta(pathname)

  const handleSignOut = () => {
    clearStoredAuth('customer')
    window.dispatchEvent(new Event('asaani-auth-changed'))
    router.push('/customer/login')
    logoutUser().catch(() => {})
  }

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80">
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-[#1E2337] leading-tight truncate">{t(title)}</h1>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5 truncate">{t(subtitle)}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <LanguageSwitcher compact />
          <CustomerNotificationPopover />
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-[#EE6C52] hover:text-[#EE6C52] px-3.5 py-2 rounded-lg transition shadow-2xs cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('Sign Out')}</span>
          </button>
        </div>
      </div>
    </header>
  )
}
