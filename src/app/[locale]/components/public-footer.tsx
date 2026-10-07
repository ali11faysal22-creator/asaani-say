'use client'

import { Link } from '@/i18n/navigation'
import { useLanguage } from '../lib/i18n'

export default function PublicFooter() {
  const { t } = useLanguage()

  return (
    <footer className="w-full bg-[#393E58] text-slate-200 pt-16 pb-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
          <div className="md:col-span-5 space-y-3">
            <p className="max-w-sm text-slate-300 tracking-wide font-normal fs-p">
              {t('All your home maintenance and repair needs solved with trust, speed, and affordability.')}
            </p>
            <h2 className="fs-h3 font-black text-orange-500 tracking-tight">
              {t('Asaani Say')}
            </h2>
          </div>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 text-sm sm:text-base gap-8">
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-base">{t('Navigation')}</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="/" className="hover:text-orange-500 transition">{t('Home')}</Link></li>
                <li><Link href="/about-us" className="hover:text-orange-500 transition">{t('About Us')}</Link></li>
                <li><Link href="/services" className="hover:text-orange-500 transition">{t('Services')}</Link></li>
                <li><Link href="/contact-us" className="hover:text-orange-500 transition">{t('Contact Us')}</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-base text-white">{t('Quick Links')}</h3>
              <ul className="space-y-2 text-slate-300">
                <li><Link href="#" className="hover:text-orange-500 transition">{t('Privacy Policy')}</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">{t('Terms Of Service')}</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">{t('Disclaimer')}</Link></li>
                <li><Link href="#" className="hover:text-orange-500 transition">{t('FAQ')}</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-base text-white">{t('Contact Us')}</h3>
              <div className="space-y-2 text-slate-300 leading-relaxed">
                <p>{t('Our Support and Sales team is available 24/7 to answer your queries.')}</p>
                <p className="pt-1 font-medium">+1 (333) 000-0000</p>
                <p className="font-medium">{t('AsaaniSay@gmail.com')}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/40 pt-6 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-300 gap-2">
          <p>{t('Copyright © 2026 AsaaniSay. All rights reserved.')}</p>
          <p>{t('Designed by Nimra Raheel')}</p>
        </div>
      </div>
    </footer>
  )
}
