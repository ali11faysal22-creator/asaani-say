
'use client'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import {Award,FileText,MapPin,Clock,CalendarDays,MessageSquare,Star,Quote,ArrowUpRight,AlertCircle} from 'lucide-react'
import { fetchCategories, type CatalogCategory } from '../lib/booking-api'
import CustomerNavbar from '../components/customer-navbar'
import { categoryIcon } from '../lib/category-icons'
import { useLanguage } from '../lib/i18n'
import PublicContactBar from '../components/public-contact-bar'
import PublicFooter from '../components/public-footer'

const featuresList = [
  {
    icon:<Award className="w-8 h-8 text-white"/>,
    title:'Satisfaction Guarantee',
    desc:"You don't need to worry about scams or our performance results; our company has been verified and strives for optimal results.",
  },
  {
    icon:<FileText className="w-8 h-8 text-white"/>,
    title:'Free Quotes',
    desc:'Get personalized cost estimates without any obligation. Experience transparency and peace of mind as you explore our service.',
  },
  {
    icon:<MapPin className="w-8 h-8 text-white"/>,
    title:'Local Professionals',
    desc:'Our services cover nationwide urban, suburban, and rural locations for both long and short term maintenance.',
  },

   {
    icon: <Clock className="w-8 h-8 text-white"/>,
    title: 'Fast 24-Hour Service',
    desc:'Need fast handling for repairs to drains, leaks or something else? Our experts are available anytime to help you solve the problem.',
   },

  {
    icon:<CalendarDays className="w-8 h-8 text-white"/>,
    title:'Flexible Appointments',
    desc:'We offer convenient appointment times that can accommodate your busy schedule, day or night, 7 days a week.',
  },
  {
    icon: <MessageSquare className="w-8 h-8 text-white"/>,
    title: '100% Commitment-Free',
    desc: 'You are free to ask us about the problems you are facing. We offer a no-commitment approach to put your mind at ease.',
  },
]
const trendingServices = [
  {
    id:1,
    title:'AC Services',
     rating:'4.5',
     originalPrice:'Rs: 4500',
    discountPrice:'Rs: 3000',
     image:'/checking-conditioner.jpg',
     href:'/services/ac-services',
  },

   {
     id: 2,
     title:'Plumbing',
     rating:'4.5',
    originalPrice:'Rs:2000',
    discountPrice:'Rs:1500',
    image:'/young-engineer-adjusting-autonomous-heating.jpg',
    href:'/services/plumbing',
  },
]
const expertsList = [
   {
      id: '01',
     name:'Thomas Schroeder',
    rating:'4.5',
    jobsCompleted:'199 Job Completed',
     bio:'Hello there, I am one of Asaani say plumbing service expert. I am ready to help you solve whatever plumbing problem in your house.',
     image:'/high-angle-man-working-as-plumber.jpg',
  },

  {
    id: '02',
     name:'Timothy Brake',
    rating:'4.5',
    jobsCompleted:'199 Job Completed',
     bio:'Hello there, I am one of Asaani say plumbing service expert. I am ready to help you solve whatever plumbing problem in your house.',
    image:'/man-servant-cleaning-kitchen.jpg',
  },
  {
    id: '03',
    name: 'Charlie Sinclair',
    rating: '4.5',
    jobsCompleted: '199 Job Completed',
    bio: 'Hello there, I am one of Asaani say plumbing service expert. I am ready to help you solve whatever plumbing problem in your house.',
    image: '/plumbing-professional-doing-his-job.jpg',
  },
]

const subTestimonials = [
  {
    id: 1,
    name: 'Jerry T. Johnson',
    problem: 'Running Toilets',
    rating: 4.5,
    review:
      'Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.',
    image: '/side-view-man-working-as-plumber.jpg',
  },

  {
    id: 2,
    name: 'Lisa C. Packer',
    problem: 'Water Heater Problems',
    rating: 4.5,
    review:
      'Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.',
    image: '/need-help-unhappy-woman-crouching-near-leaking-water-tap-home.jpg',
  },
]

const SERVICES_CATEGORY_CACHE_KEY = 'asaani_services_category_cache'
const SERVICES_RETURN_SCROLL_KEY = 'asaani_services_return_scroll'
type ServiceCategoryCard = Pick<CatalogCategory, 'id' | 'display_name' | 'icon' | 'icon_class' | 'href'>

function isServiceCategoryCard(value: unknown): value is ServiceCategoryCard {
  return (
    typeof value === 'object'
    && value !== null
    && 'id' in value
    && typeof value.id === 'string'
    && 'display_name' in value
    && typeof value.display_name === 'string'
    && 'icon' in value
    && (typeof value.icon === 'string' || value.icon === null)
    && 'icon_class' in value
    && (typeof value.icon_class === 'string' || value.icon_class === null)
    && 'href' in value
    && typeof value.href === 'string'
  )
}

export default function ServicesPage(){
  const { t } = useLanguage()
  const [categories, setCategories] = useState<ServiceCategoryCard[]>([])
  const [catalogError, setCatalogError] = useState('')
  const returnScrollPositionRef = useRef<number | null>(null)

  useEffect(() => {
    let active = true
    let hasCachedCategories = false
    try {
      const cachedCategories = window.sessionStorage.getItem(SERVICES_CATEGORY_CACHE_KEY)
      if (cachedCategories !== null) {
        const parsedCategories: unknown = JSON.parse(cachedCategories)
        if (Array.isArray(parsedCategories) && parsedCategories.every(isServiceCategoryCard)) {
          hasCachedCategories = parsedCategories.length > 0
          if (hasCachedCategories) queueMicrotask(() => setCategories(parsedCategories))
        }
      }
    } catch (error) {
      console.warn('Unable to restore services categories', error)
    }

    try {
      const storedPosition = window.sessionStorage.getItem(SERVICES_RETURN_SCROLL_KEY)
      if (storedPosition !== null) {
        const parsedPosition = Number(storedPosition)
        if (Number.isFinite(parsedPosition) && parsedPosition >= 0) {
          returnScrollPositionRef.current = parsedPosition
        }
      }
    } catch (error) {
      console.warn('Unable to restore services page scroll position', error)
    }

    const restoreScrollPosition = () => {
      const positionToRestore = returnScrollPositionRef.current
      if (positionToRestore === null) return
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.setTimeout(() => {
            if (!active) return
            window.scrollTo(0, positionToRestore)
            returnScrollPositionRef.current = null
            try {
              window.sessionStorage.removeItem(SERVICES_RETURN_SCROLL_KEY)
            } catch (error) {
              console.warn('Unable to clear restored services page state', error)
            }
          }, 150)
        })
      })
    }

    const restoreAfterHistoryNavigation = () => {
      try {
        const storedPosition = window.sessionStorage.getItem(SERVICES_RETURN_SCROLL_KEY)
        if (storedPosition !== null) {
          const parsedPosition = Number(storedPosition)
          if (Number.isFinite(parsedPosition) && parsedPosition >= 0) {
            returnScrollPositionRef.current = parsedPosition
          }
        }
      } catch (error) {
        console.warn('Unable to read services page state after history navigation', error)
      }
      restoreScrollPosition()
    }
    window.addEventListener('pageshow', restoreAfterHistoryNavigation)
    window.addEventListener('popstate', restoreAfterHistoryNavigation)

    fetchCategories()
      .then((loadedCategories) => {
        if (!active) return
        setCategories(loadedCategories)
        try {
          window.sessionStorage.setItem(SERVICES_CATEGORY_CACHE_KEY, JSON.stringify(
            loadedCategories.map(({ id, display_name, icon, icon_class, href }) => ({
              id,
              display_name,
              icon,
              icon_class,
              href,
            })),
          ))
        } catch (error) {
          console.warn('Unable to cache services categories', error)
        }
        if (!hasCachedCategories) restoreScrollPosition()
      })
      .catch((err: Error) => {
        if (!active) return
        setCatalogError(err.message || 'Could not load categories from API')
        if (!hasCachedCategories) restoreScrollPosition()
      })

    if (hasCachedCategories) restoreScrollPosition()

    return () => {
      active = false
      window.removeEventListener('pageshow', restoreAfterHistoryNavigation)
      window.removeEventListener('popstate', restoreAfterHistoryNavigation)
    }
  }, [])

  const rememberScrollPosition = () => {
    try {
      returnScrollPositionRef.current = window.scrollY
      window.sessionStorage.setItem(SERVICES_RETURN_SCROLL_KEY, String(window.scrollY))
    } catch (error) {
      console.warn('Unable to save services page scroll position', error)
    }
  }

  return (
    <div className="w-full bg-white font-sans text-slate-800">
      <PublicContactBar />

      <CustomerNavbar active="services" showLanguageSwitcher={false} />

      <section className="relative w-full h-95 sm:h-112.5 bg-slate-100 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-black/60 z-10" />
        <Image
          src="/screws-wooden-wall.jpg"
          alt="Home Maintenance Hero Background"
          fill
          className="object-cover object-center opacity-40"
          priority/>
        <div className="relative z-20 max-w-5xl mx-auto px-4 text-center text-white space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            {t('Easier Home')} <br />
            <span className="text-orange-500">{t('Maintenance,')}</span> <br />
            {t('Every Day!!')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto font-medium">
            {t('Bringing Customers And Professionals Together For Quick, Secure, And Affordable Bookings.')}
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E2342] tracking-tight">
            {t('Services')}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            {t('Choose From Our Wide Range Of Services')}
          </p>
          {catalogError && <p className="text-sm text-red-500">{catalogError}</p>}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((service) => {
            const Icon = categoryIcon(service.icon)
            return (
            <Link key={service.id} href={service.href} onClick={rememberScrollPosition} className="block">
              <div className="bg-white hover:bg-[#e4ebfa] transition-all duration-300 rounded-2xl p-6 flex items-center gap-5 cursor-pointer shadow-sm hover:shadow-md border border-slate-100 h-full">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-50">
                  <Icon className={`w-8 h-8 ${service.icon_class || 'text-[#23263B]'}`}/>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1E2342]">
                  {t(service.display_name)}
                </h3>
              </div>
            </Link>
            )
          })}
        </div>
      </section>
      <section className="w-full bg-[#141F52] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
                {t('Fast, Friendly, and Satisfaction')} <br className="hidden sm:inline" />
                {t('Guarantee')}
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {t('No matter how big or small your work is, whether it’s for the interior or exterior of your home, we are ready to serve and help you solve your home problems.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            {featuresList.map((feature, idx) => (
              <div key={idx} className="flex items-start gap-5">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                  {feature.icon}
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    {t(feature.title)}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                    {t(feature.desc)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#1E2342] leading-tight">
              {t('Everyone’s')} <br />
              <span className="relative inline-block">
                {t('Booking This!')}

                <span className="absolute bottom-1 start-0 w-full h-1 bg-sky-500 rounded-full"/>
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
              {t('High repeat bookings and excellent reviews show the trust our customers place in Asaani Say services.')}
            </p>
          </div>
          <div className="lg:col-span-7 space-y-4">
            {trendingServices.map((service) => (
              <Link key={service.id} href={service.href} onClick={rememberScrollPosition} className="block">
                <div className="bg-orange-500 text-white rounded-xl overflow-hidden flex items-center shadow-md border border-red-300/20 hover:opacity-95 transition">
                  <div className="relative w-36 sm:w-48 h-32 sm:h-36 shrink-0 bg-slate-200">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"/>
                  </div>
                  <div className="p-4 sm:p-6 flex-1 space-y-2">
                    <h3 className="text-lg sm:text-2xl font-bold tracking-tight">
                      {t(service.title)}
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-white text-slate-900 px-2 py-0.5 rounded text-xs font-bold shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{service.rating}</span>
                    </div>
                    <div className="pt-1">
                      <p className="text-xs text-white/80 line-through font-medium">
                        {service.originalPrice}
                      </p>
                      <p className="text-xl sm:text-2xl font-extrabold">
                        {service.discountPrice}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full bg-[#EEF2FB] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-orange-500"/>
                <span className="text-xs font-bold text-[#EE6C52] uppercase tracking-wider">
                  {t('Plumber Expert')}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2342] tracking-tight">
                {t("Meet Some Of Our")}{' '}<br />
                {t("Plumbing Expert")}</h2>
            </div>

            <div className="border-s-2 border-[#EE6C52] ps-4 py-1 space-y-0.5 max-w-sm">
              <h4 className="text-xs font-bold text-[#1E2342]">
                {t("Meet Some Of Our Expert Plumbers.")}</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                {t("Skilled, Reliable, And Ready To Handle Any Job With Precision.")}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {expertsList.map((expert) => (
              <div key={expert.id} className="space-y-4">
                <div className="relative w-full aspect-3/4 bg-[#3B4058] rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src={expert.image}
                    alt={expert.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-0 start-0 bg-[#4A506B] text-white text-sm font-bold px-4 py-2 rounded-br-xl">
                    {expert.id}
                  </div>
                </div>

                <div className="space-y-1.5 px-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#1E2342]">
                    {expert.name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-medium ms-1">
                      {expert.rating}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#1E2342]">
                    {expert.jobsCompleted}
                  </p>
                  <p className="text-xs text-slate-500 leading-relaxed pt-1">
                    {expert.bio}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-0.5 bg-orange-500" />
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                {t("Testimonial")}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2342] tracking-tight">
              {t("What They Say About Our")}{' '}<br />
              {t("Service")}</h2>
          </div>

          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-4 flex items-center gap-4 max-w-xs">
            <div className="w-12 h-12 relative shrink-0 flex items-center justify-center bg-slate-50 rounded-xl">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500 font-medium leading-tight">
                {t("Based On 236,488 Review")}{' '}<br />
                <span className="font-semibold text-slate-700">{t("In Google Business")}</span>
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1E2342] hover:text-orange-500 transition border-b border-slate-300 pb-0.5">
                {t("More Testimonial")}{' '}<ArrowUpRight className="w-3.5 h-3.5"/>
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 relative shadow-sm">
          <div className="md:col-span-5 relative bg-[#3B4058] min-h-65 sm:min-h-80">
            <Image
              src="/handsome-successful-senior-businessman-showing-thumbs-up-approval.jpg"
              alt="Andrea D. Elliott"
              fill
              className="object-cover"/>
            <div className="absolute top-0 start-0 bg-orange-500 p-3 rounded-br-2xl text-white shadow-md">
              <Quote className="w-6 h-6 fill-current rotate-180" />
            </div>
          </div>

          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E2342]">
              {t("Andrea D. Elliott")}</h3>

            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 px-2.5 py-1 rounded-full text-xs font-semibold w-fit">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{t("Problem : Dripping Faucets")}</span>
            </div>

            <div className="flex items-center gap-1 py-1">
              <div className="flex text-amber-400">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current"/>
                ))}
                <Star className="w-4 h-4 text-amber-400"/>
              </div>
              <span className="text-xs text-slate-400 font-bold ms-1">4.5</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
              {t("Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.")}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          {subTestimonials.map((item) => (
            <div key={item.id} className="flex gap-4 items-start">
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-[#3B4058] rounded-2xl overflow-hidden shrink-0 shadow-sm">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"/>
              </div>

              <div className="space-y-1.5 flex-1">
                <h4 className="text-base font-bold text-[#1E2342]">
                  {item.name}
                </h4>

                <div className="inline-flex items-center gap-1 text-red-500 text-[11px] font-medium">
                  <AlertCircle className="w-3 h-3" />
                  <span>{t("Problem :")}{' '}{item.problem}</span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current"/>
                    ))}
                    <Star className="w-3 h-3 text-amber-400"/>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold ms-1">
                    {item.rating}
                  </span>
                </div>

                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  {item.review}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}