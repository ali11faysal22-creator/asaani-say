'use client'

import LanguageSwitcher from './language-switcher'
import SocialLinks from './social-links'

export default function PublicContactBar() {
  return (
    <div className="bg-[#EEF2FB] px-4 py-2.5 text-xs text-slate-600 sm:px-6 md:px-12">
      <div className="flex flex-wrap items-center justify-between gap-y-2">
        <div className="flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start sm:gap-6">
          <span className="whitespace-nowrap">Asaani Say@gmail.com</span>
          <span className="whitespace-nowrap border-s border-slate-300 ps-2 sm:ps-6">+1 (333) 000-0000</span>
        </div>
        <div className="flex w-full items-center justify-between text-slate-700 sm:w-auto sm:justify-start sm:gap-4">
          <SocialLinks />
          <LanguageSwitcher compact />
        </div>
      </div>
    </div>
  )
}
