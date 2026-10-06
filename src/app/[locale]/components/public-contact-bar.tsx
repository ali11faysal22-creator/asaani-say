'use client'

import { Camera, LayoutGrid } from 'lucide-react'
import LanguageSwitcher from './language-switcher'

export default function PublicContactBar() {
  return (
    <div className="bg-[#EEF2FB] px-4 py-2.5 text-xs text-slate-600 sm:px-6 md:px-12">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 sm:gap-6">
          <span>Asaani Say@gmail.com</span>
          <span className="hidden border-s border-slate-300 ps-3 sm:inline sm:ps-6">+1 (333) 000-0000</span>
        </div>
        <div className="flex items-center gap-2 text-slate-700 sm:gap-4">
          <a href="#" aria-label="Instagram" className="hover:text-orange-500 transition">
            <Camera className="h-4 w-4" />
          </a>
          <a href="#" aria-label="Explore services" className="hidden hover:text-orange-500 transition sm:inline-flex">
            <LayoutGrid className="h-4 w-4" />
          </a>
          <LanguageSwitcher compact />
        </div>
      </div>
    </div>
  )
}
