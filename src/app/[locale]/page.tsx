'use client'
import React, {useEffect,useRef,useState } from 'react'
import {Sparkles,ChevronDown,User,Star,Quote,Wrench,Drill,Sun,Truck,Bug,Clock,MousePointerClick,Users,Award,RefreshCw,ArrowRight,ArrowUpRight,AlertCircle,ExternalLink as ExternalLinkIcon} from 'lucide-react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import CustomerNavbar from './components/customer-navbar'
import PublicContactBar from './components/public-contact-bar'
import { useLanguage } from './lib/i18n'
import { submitServiceRequest } from './lib/booking-api'
import PublicFooter from './components/public-footer'
interface ExpertItem {
  number: string
  name: string
  jobsCompleted: string
  bio: string
  image: string
}

const expertsData: ExpertItem[] = [
  {
    number: '01',
    name: 'Thomas Schroeder',
    jobsCompleted: '199 Job Completed',
    bio: 'Hello there, i am one of Asaani say plumbing service expert. I am ready to help you solve whatever plumbing problem in your house.',
    image: '/assets/home/plumber-repairing-kitchen-sink.jpg',
  },
  {
    number: '02',
    name: 'Timothy Brake',
    jobsCompleted: '199 Job Completed',
    bio: 'Hello there, i am one of Asaani say plumbing service expert. I am ready to help you solve whatever plumbing problem in your house.',
    image: '/assets/home/plumber-expert-arms-crossed.jpg',
  },
  {
    number: '03',
    name: 'Charlie Sinclair',
    jobsCompleted: '199 Job Completed',
    bio: 'Hello there, i am one of Asaani say plumbing service expert. I am ready to help you solve whatever plumbing problem in your house.',
    image: '/assets/shared/plumbing-professional-at-work.jpg',
  },
]
function renderStars(rating: number): React.ReactNode {
  const percentage = Math.round((rating / 5) * 100)
  return (
    <div className="flex flex-wrap items-center gap-1 text-[#FFAE00]">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.round(rating) ? 'fill-current' : 'text-slate-300'
          }`}
        />
      ))}
      <span className="ms-2 text-sm font-bold text-slate-600">{rating.toFixed(1)}</span>
      <span className="text-sm font-semibold text-slate-400">({percentage}%)</span>
    </div>
  )
}
 const subFeatures=[
  {
    title:'We Bring Only The Right Equipment',
    description:'The Right Tools, Every Time, For Perfect Results',
    linktext:'Learn More...',
    linkMref:'#',

  },
  {
    title:'The Important Of Home Expertise',
    description:'Your Home Deserves Expert Hands,Not Guesswork',
    linktext:'Learn More...',
    linkMref:'#',
  },

  {title:'Keep Your Home Secure',
    description:'Home Security Starts With Smart Services',
    linktext:'Learn More...',
    linkMref:'#',

  }
 ]
 const testimonialsData={
  featured: {
    name: 'Andrea D. Elliott',
    problem: 'Problem : Dripping Faucets',
    rating: 4.5,
    text: 'Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.',
    image: '/assets/home/customer-testimonial-andrea-elliott.png',
  },
  small: [
    {
      name: 'Jerry T. Johnson',
      problem: 'Problem : Running Toilets',
      rating: 4.5,
      text: 'Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.',
      image: '/assets/home/customer-testimonial-jerry-johnson.jpg',
    },
    {
      name: 'Lisa C. Packer',
      problem: 'Problem : Water Heater Problems',
      rating: 4.5,
      text: 'Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.',
      image: '/assets/home/customer-testimonial-lisa-packer.jpg',
    },
  ],
}
export default function HeroSection() {
  const { t } = useLanguage()
  const statsRef = useRef<HTMLDivElement>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)
  const toggleFAQ = (index: number) => {
    setOpenFaqIndex((current) => (current === index ? null : index))
  }

  const [orderForm, setOrderForm] = useState({
    zipCode: '',
    city: '',
    service: '',
    date: '',
    time: '',
    email: '',
    phone: '',
  })
  const [orderStatus, setOrderStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [orderMessage, setOrderMessage] = useState('')

  const updateOrderField = (field: keyof typeof orderForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setOrderForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleOrderSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setOrderMessage('')
    if (!orderForm.zipCode || !orderForm.city || !orderForm.service || !orderForm.date || !orderForm.time || !orderForm.email || !orderForm.phone) {
      setOrderStatus('error')
      setOrderMessage('Please fill in every field.')
      return
    }
    setOrderStatus('submitting')
    try {
      await submitServiceRequest({
        zip_code: orderForm.zipCode,
        city: orderForm.city,
        service_name: orderForm.service,
        preferred_date: orderForm.date,
        preferred_time: orderForm.time,
        email: orderForm.email,
        phone: orderForm.phone,
      })
      setOrderStatus('success')
      setOrderMessage("Request sent! We'll match you with a professional shortly.")
      setOrderForm({ zipCode: '', city: '', service: '', date: '', time: '', email: '', phone: '' })
    } catch (error) {
      setOrderStatus('error')
      setOrderMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.')
    }
  }

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
      entries.forEach((entry) => {
     if (entry.isIntersecting) {
        const counters = entry.target.querySelectorAll('.counter-value')
          counters.forEach((counter) => {
        const target = parseInt(counter.getAttribute('data-target')||'0', 10)
          let count = 0

       const updateCount=()=>{
            const increment = Math.ceil(target/100) || 1
                if (count < target) {
                    count += increment
                  if (count > target) count = target
                   counter.textContent = count.toLocaleString()+'+'
                  setTimeout(updateCount, 20)
                }  else {
                   counter.textContent = target.toLocaleString() + '+'
             }
        }
            updateCount()
       })
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.3 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [])
  const services = [
               {
               icon: <Wrench className="w-8 h-8 text-[#23263B]"/>,
                title: 'Home Inspection',
                desc: 'Are You Having Issues With Your Faucets And Sinks? Common Problems Can Include Leaky Faucets, Low Water Pressure, Clogged Drains, Hot Water Issues, Loose Faucet Handles, And More.',
                href: '/services/home-inspection',
             },
             {
              icon: <Drill className="w-8 h-8 text-[#23263B]"/>,
              title: 'Home Repair Services',
               desc: 'A Smarter Way To Keep Up With Home Maintenance. We Provide Home Repair And Maintenance Services At Your Doorstep In Pakistan.',
               href: '/services/handyman',
             },
          {
          icon: <Truck className="w-8 h-8 text-[#23263B]"/>,
          title: 'Home Shifting Services',
           desc: 'Asaani Say Helps To Take The Entire Relocation Burden Off From The Customers Shoulders And Helps To Provide The Most Trusted Shifting Service Solution',
           href: '/services',
          },
       {
         icon: <Bug className="w-8 h-8 text-[#23263B]"/>,
        title: 'Pest Control Services',
         desc: 'We Provide Professional Pest Control Services For Your Home And Business. Book Highly Experienced In-House Professionals & Get It Done, Instantly.',
         href: '/services/pest-control',
       },
     {
      icon: <Sparkles className="w-8 h-8 text-[#23263B]"/>,
      title: 'Cleaning Services',
      desc: 'Are You Having Issues With Your Faucets And Sinks? Common Problems Can Include Leaky Faucets, Low Water Pressure, Clogged Drains, Hot Water Issues, Loose Faucet Handles, And More.',
      href: '/services',
     },

     {
      icon: <Sun className="w-8 h-8 text-[#23263B]"/>,
      title: 'Solar Panel Installation',
      desc: 'Servicely Offers Flexible Solutions For Installation, Removal And Repair Of Your AC Units At Competitive Prices In All Pakistani Cities.',
      href: '/services',
     },
  ]

  const steps = [
    {
      icon: <MousePointerClick className="w-8 h-8 text-orange-500"/>,
      title: 'Choose Your Service',
      desc: 'Select the service you need and share the details of your requirements in just a few clicks.',
    },
    {
      icon: <Clock className="w-8 h-8 text-[#23263B]"/>,
      title: 'Pick Your Preferred Time',
      desc: 'Choose a convenient date and time slot that fits your schedule for the service visit.',
    },
    {
      icon: <Truck className="w-8 h-8 text-[#23263B]"/>,
      title: 'Get Our Expert Support',
      desc: 'Our trained professionals will arrive on time to complete the job safely and efficiently.',
    },
  ]
  const stats =  [
    { target: 32, label: 'Years Experience' },
    { target: 249, label: 'Professional Team' },
    { target: 2649, label: 'Client Satisfaction' },
  ]

  const whyUsFeatures = [
    {
    icon: <Users className="w-7 h-7 text-orange-500"/>,
     title: 'Experienced',
        desc: 'Handled By Skilled Professionals With Proven Experience.',
    },
    {
     icon:<Award className="w-7 h-7 text-orange-500"/>,
      title: 'Reliable',
        desc: 'We Show Up, Follow Through, And Get It Done Right.',
    },
    {
    icon:<Wrench className="w-7 h-7 text-orange-500"/>,
       title: 'Capable',
         desc: 'Expertly Handled By A Skilled And Capable Team.',
    },
    {
    icon:<RefreshCw className="w-7 h-7 text-orange-500"/>,
      title: 'Flexible',
       desc: "Your Time, Your Choice We're Flexible.",
    },
  ]

  const faqData = [
    {
      question: 'How Do I Book A Service?',
      answer:
        'Simply Select The Service, Choose Your Preferred Time, And Confirm Your Booking — All Within The App.',
    },
    {
      question: 'So What Types Of Services Does Asaani Say Offer?',
      answer:
        'Asaani Say offers a range of home services including pest control, cleaning, plumbing, and other on-demand household solutions.',
    },
    {
      question: 'How To Change My Plans?',
      answer:
        ' Simply contact us via phone or email with your booking details, and our team will help you reschedule or update your service plan.',
    },
    {
      question: 'Can I Get An Invoice Of My Order?',
      answer:
        ' Yes, an invoice is sent to your registered email automatically once your service is booked and confirmed.',
    },
  ]

 
  return (
    <div className="w-full bg-white font-sans text-slate-800">
      <PublicContactBar />

      <CustomerNavbar active="home" showLanguageSwitcher={false} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div className="lg:col-span-7 pt-2 space-y-8">
            <div>
              <h1 className="font-extrabold text-[#23263B] leading-tight tracking-tight fs-h2">
                {t('Welcome To')}
              </h1>
              <h1 className="font-black text-[#EF6A42] tracking-tight leading-none mt-1 mb-8 fs-h1">
                {t("Asaani Say")}</h1>
              <p className="text-sm font-bold tracking-widest text-slate-400 uppercase mb-3">
                {t('BEST SERVICES')}
              </p>
              <p className="max-w-2xl font-normal leading-snug tracking-normal text-[#3B3E5B] fs-h3">
                {t('Some Jobs Should Only Ever Be Tackled By A Professional, And Home-Services Is One Of Them.')}
              </p>
            </div>
            <div className="relative pt-6">
              <div className="relative inline-block w-full max-w-lg">
                <div className="absolute -top-5 end-6 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md z-10">
                  <Quote className="w-6 h-6 fill-current rotate-180" />
                </div>
    
                <div className="bg-[#EEF2FB] rounded-2xl p-6 sm:p-7 flex items-start gap-4 shadow-sm border border-slate-100">
                  <div className="w-12 h-12 bg-[#3A3E59] rounded-full flex items-center justify-center shrink-0">
                    <User className="w-6 h-6 text-white"/>
                  </div>
                  <div className="space-y-1.5">

                    <div className="flex items-center gap-1 text-[#FFAE00]">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current"/>
                      ))}
                    </div>
                    <p className="text-slate-600 leading-relaxed pt-1 fs-p">
                      {t('Great Service From Dedicated Team. They Are Very Experienced In Fixing All The Plumbing Problems That Plague Homes.')}
                    </p>
                    <p className="font-bold text-[#23263B] pt-1 fs-p">
                      {t("Jhon Smith, Idaho")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100">
              <h3 className="font-bold text-[#23263B] mb-6 fs-h4">
                {t('Order Service')}
              </h3>
              <form className="space-y-4" onSubmit={handleOrderSubmit}>

                {orderMessage && (
                  <p
                    className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                      orderStatus === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}
                  >
                    {orderMessage}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    value={orderForm.zipCode}
                    onChange={updateOrderField('zipCode')}
                    placeholder={t('Zip Code*')}
                    className="w-full bg-white text-slate-700 text-xs px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#EF6A42]/50 placeholder-slate-400"/>
                  <div className="relative">
                    <select
                      required
                      value={orderForm.city}
                      onChange={updateOrderField('city')}
                      className="w-full bg-white text-slate-600 text-xs px-4 py-3 rounded-lg appearance-none border-none focus:outline-none focus:ring-2 focus:ring-[#EF6A42]/50 pe-8">
                      <option value="">{t('Select City')}</option>
                      <option value="Karachi">{t("Karachi")}</option>
                      <option value="Lahore">{t("Lahore")}</option>
                      <option value="Islamabad">{t("Islamabad")}</option>
                      <option value="Multan">{t("Multan")}</option>
                      <option value="Quetta">{t("Quetta")}</option>
                      <option value="Peshawar">{t("Peshawar")}</option>
                      <option value="Faisalabad">{t("Faisalabad")}</option>
                      <option value="Gujranwala">{t("Gujranwala")}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600 absolute end-3 top-3.5 pointer-events-none" />
                  </div>
                </div>


                <div>
                  <label className="block text-xs font-bold text-[#23263B] mb-1.5">
                    {t('Select Job')}
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={orderForm.service}
                      onChange={updateOrderField('service')}
                      className="w-full bg-white text-slate-600 text-xs px-4 py-3 rounded-lg appearance-none border-none focus:outline-none focus:ring-2 focus:ring-[#EF6A42]/50 pe-8">
                      <option value="">{t('Select Service')}</option>
                      <option value="Plumbing">{t('Plumbing')}</option>
                      <option value="Electrician">{t('Electrician')}</option>
                      <option value="Cleaning">{t('Cleaning')}</option>
                      <option value="House Inspection">{t('Home Inspection')}</option>
                      <option value="Home Shifting Service">{t('Home Shifting Services')}</option>
                      <option value="Pest Control Services">{t('Pest Control Services')}</option>
                      <option value="Painter">{t('Painter')}</option>
                      <option value="Solar Panel Installation">{t('Solar Panel Installation')}</option>
                      <option value="Geyser">{t('Geyser')}</option>
                      <option value="Carpenter">{t('Carpenter')}</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600 absolute end-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-bold text-[#23263B]">
                    {t('When Would You Like Us to Come?')}
                  </label>
                  <input
                    type="date"
                    required
                    value={orderForm.date}
                    onChange={updateOrderField('date')}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full bg-white text-slate-700 text-xs px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"/>

                   <input
                    type="time"
                    required
                    value={orderForm.time}
                    onChange={updateOrderField('time')}
                     className="w-full bg-white text-slate-700 text-xs px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"/>

                    <input
                    type="email"
                    required
                    value={orderForm.email}
                    onChange={updateOrderField('email')}
                    placeholder={t('Your Email')}
                     className="w-full bg-white text-slate-700 text-xs px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"/>

                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={updateOrderField('phone')}
                    placeholder={t('Phone Number')}
                    className="w-full bg-white text-slate-700 text-xs px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"/>
                </div>


                <button
                  type="submit"
                  disabled={orderStatus === 'submitting'}
                  className="w-full bg-[#3A3E59] hover:bg-[#2C2F45] disabled:opacity-60 text-white font-semibold text-xs py-3.5 rounded-lg mt-3 transition shadow-md">
                  {orderStatus === 'submitting' ? t('Sending…') : t('Get A Price')}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        <div className="flex items-start justify-between gap-3 mb-8">
          <div>
            <p className="font-semibold text-[#3A3E59] mb-0.5 fs-p">
              {t('Select Our')}
            </p>
            <h2 className="font-extrabold text-orange-500 tracking-tight fs-h2">
              {t('Best Services')}
            </h2>
            <p className="text-[#3A3E59] mt-3 max-w-xl leading-relaxed fs-p">
              {t('Connecting Customers And Technicians For Quick, Safe, And Affordable Bookings.')}
            </p>
          </div>
          <Link
            href="/services"
            className="shrink-0 whitespace-nowrap text-sm font-bold text-[#3A3E59] hover:text-orange-500 transition pt-1">
            {t('See All')}
          </Link>
        </div>

  

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="bg-white rounded-2xl p-8 border border-orange-500 flex flex-col items-center text-center shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer" >
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-6">
                {item.icon}
              </div>
              <h3 className="font-bold text-[#23263B] mb-3 fs-h4">
                {t(item.title)}
              </h3>
              <p className="text-slate-500 leading-relaxed max-w-xs fs-p">
                {t(item.desc)}
              </p>
            </Link>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-[#EF6A42]"></span>
                <span className="text-sm font-bold text-[#EF6A42] uppercase tracking-wider">
                  {t('Get Our Service')}
                </span>
              </div>
              <h2 className="font-extrabold text-[#23263B] fs-h2">
                {t('How To Get Our Service')}
              </h2>
            </div>

            <div className="space-y-6">
              {steps.map((step, index) => (
                <div key={index}>

                  <div className="flex items-start gap-5 py-2">
                    <div className="w-16 h-16 bg-[#EEF2FB] rounded-xl flex items-center justify-center shrink-0">
                    {step.icon}
                    </div>
                    <div>
                      <h3 className="font-bold text-[#23263B] mb-1 fs-h4">
                        {t(step.title)}
                      </h3>
                      <p className="text-slate-500 leading-relaxed max-w-sm fs-p">
                        {t(step.desc)}
                      </p>
                    </div>
                  </div>
                  {index !== steps.length - 1 && (
                    <div className="border-b border-slate-200 mt-6">
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="lg:col-span-6 space-y-6">
           <div className="relative w-full h-95 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          <Image
            src="/assets/home/carpenter-booking-service-by-phone.jpg"
             alt="How To Get Our Service"
              sizes="(min-width: 1024px) 50vw, 100vw"
              fill
                className="object-cover"/>
      </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 bg-[#3A3E59] rounded-lg shrink-0"></div>
              <p className="text-slate-600 leading-relaxed fs-p">
                <strong className="text-[#23263B]">{t("Fringilla Scelerisque")}</strong> {t("In Imperdiet Nisi Erat In Id. Vel Fermentum Aenean Aenean Id Ornare Vitae Sapien Nulla Auctor. At Nisl Sem Eget Orci Pretium Sed.")}</p>
            </div>
          </div>

        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-16">
          <div className="lg:col-span-6 space-y-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-0.5 bg-orange-500">
                 </span>

                <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  {t('Why Us')}
                </span>
              </div>
              <h2 className="font-extrabold text-[#23263B] leading-tight fs-h2">
                {t('Trusted Service With')} <br/>
                {t('Affordable Price')}
              </h2>
            </div>
            <div className="relative w-full h-95 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <Image
                src="/assets/home/carpenter-drilling-wood.jpg" 
                alt="Trusted Service With Affordable Price"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"/>
            </div>
          </div>
          <div className="lg:col-span-6 space-y-10 pt-2">

          <div
              ref={statsRef}
              className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-8 text-center sm:text-start">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={idx !== 0 ? 'border-s border-slate-200 ps-4 sm:ps-6':''}>
                  <h3
                    className="counter-value font-black text-[#23263B] fs-h3"
                    data-target={stat.target}>
                    0 +

                  </h3>
                  <p className="text-slate-500 font-medium mt-1 fs-p">{t(stat.label)}</p>

      </div>
))}
     </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {whyUsFeatures.map((item, idx) => (

                <div
                  key={idx}
                  className="bg-[#EEF2FB] rounded-2xl p-6 flex flex-col items-start transition-all duration-300 hover:shadow-md">
                  <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mb-4 shadow-sm">

                    {item.icon}

            </div>

                  <h4 className="text-lg font-bold text-[#23263B] mb-2">{t(item.title)}
                  </h4>

         <p className="text-slate-500 leading-relaxed fs-p">{t(item.desc)}

         </p>
                </div>

     ))}
       </div>
               </div>
     </div>

           <div className="bg-[#050B30] rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg">

          <div className="bg-[#2C3352] px-5 py-4 w-full md:w-auto flex flex-row items-center justify-center gap-2 shrink-0 md:min-w-50 md:flex-col md:items-start md:gap-0 md:px-8 md:py-6">
            
            <span className="text-xl font-black text-orange-500 leading-none md:text-2xl">{t("Asaani")}</span>
            <span className="text-xl font-black text-orange-500 leading-none md:text-2xl md:leading-tight">{t("Say")}</span>
       </div>

          <div className="px-5 pt-5 pb-2 md:p-8 text-center md:text-start text-white flex-1">
            <h3 className="font-bold mb-1 fs-h4">{t("Need Help At Home?")}</h3>

            <p className="leading-relaxed text-slate-300 fs-p">
              {t("Book Expert Services Anytime, Anywhere With Just One Tap.")}</p>

    </div>

          <div className="flex w-full justify-center px-5 pt-4 pb-5 md:w-auto md:justify-start md:px-0 md:py-0 md:pe-8">
            <Link
              href="/login"
              className="inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-orange-600 md:w-auto"
            >
              {t("Get Started")}
            </Link>
          </div>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans border-t border-slate-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
      <div className="lg:col-span-6 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-0.5 bg-orange-500"></span>
             <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  {t("FAQ")}</span>
       </div>
             <h2 className="font-extrabold text-[#23263B] tracking-tight fs-h2">
              {t("Frequently Asked")}{' '}<br />
              {t("Questions")}</h2>

        </div>
                <div className="space-y-4 pt-2">
                    {faqData.map((item, index) => {
                        const isOpen = openFaqIndex === index

                        return (
                            <div
                                key={index}
                                className="border-b border-dashed border-slate-300 pb-5 pt-2 transition-all duration-200">
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between text-start group focus:outline-none">
                                    <span
                                        className={`text-base sm:text-lg font-bold transition-colors ${
                                            isOpen
                                                ? 'text-orange-500'
                                                : 'text-[#23263B] group-hover:text-orange-500'
                                        }`}>
                                        {t(item.question)}
                                    </span>
                                    <span className="ms-4 shrink-0">
                                        {isOpen ? (
                                            <ArrowRight className="w-5 h-5 text-orange-500"/>
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5 text-[#23263B] group-hover:text-orange-500 transition-colors" />
                                        )}
                                    </span>
                                </button>
                                {isOpen && (
                                    <p className="text-slate-500 leading-relaxed mt-3 pe-6 fs-p">
                                        {t(item.answer)}
                                    </p>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="lg:col-span-6 flex flex-col items-end gap-4">
                <div className="relative w-full max-w-lg aspect-4/3 rounded-tl-140px rounded-tr-2xl rounded-b-2xl overflow-hidden bg-[#3D425A]">
                    <Image
                        src="/assets/home/handyman-talking-on-mobile-phone.png"
                        alt="Handyman talking on mobile phone"
                        fill
                        sizes="(min-width: 1024px) 50vw, 100vw"
                        className="object-cover object-center"/>
                </div>

                   <Link
                    href="/contact-us"
                    className="bg-[#3D425A] hover:bg-[#2C2F45] text-white text-xs sm:text-sm font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 shadow-md">
                    {t("Contact-Us")}</Link>
            </div>
        </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-0.5 bg-[#EF6A42]"></span>
              <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                {t("Plumber Expert")}</span>
            </div>
            <h2 className="font-extrabold text-[#23263B] tracking-tight leading-tight fs-h2">
              {t("Meet Some Of Our")}{' '}<br />
              {t("Plumbing Expert")}</h2>
          </div>

          <div className="border-s-4 border-orange-500 ps-4 py-1 max-w-md">
            <h3 className="text-sm font-bold text-[#23263B] mb-1">
              {t("Meet Some Of Our Expert Plumbers.")}</h3>
            <p className="text-slate-500 leading-relaxed fs-p">
              {t("Skilled, Reliable, And Ready To Handle Any Job With Precision.")}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          {expertsData.map((expert, index) => (
            <div key={index} className="flex flex-col group">
              <div className="relative w-full aspect-4/5 rounded-2xl overflow-hidden bg-slate-100 mb-5">
                <Image
                  src={expert.image}
                  alt={expert.name}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"/>
                <div className="absolute top-0 start-0 bg-[#3D425A]/90 text-white font-bold text-xl px-5 py-3 rounded-br-2xl shadow-sm z-10">
                  {expert.number}
                </div>
              </div>

              <div className="space-y-1.5 px-1">
                <h3 className="font-bold text-[#23263B] group-hover:text-orange-500 transition-colors fs-h4">
                  {expert.name}
                </h3>
                <p className="font-bold text-[#23263B] pb-1 fs-p">
                  {expert.jobsCompleted}
                </p>
                <p className="text-slate-500 leading-relaxed fs-p">
                  {expert.bio}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans border-t border-slate-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mb-16">
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
               <span className="w-8 h-0.5 bg-orange-500"></span>
                <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">{t("hire best home services")}</span>
        </div>
                 
                 <h2 className="font-extrabold text-[#23263B] leading-tight tracking-tight fs-h2">
                  {t("Hire The Best Home")}{' '}<br />
                  {t("Services In Town")}</h2>

            </div>
          
          <ul className="space-y-3 text-sm text-slate-600 leading-relaxed pt-2">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">• </span>
               <span>{t("Hire The Best Home Services In Town — Fast,Reliable,And Trusted.")}</span>

            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">• </span>
              <span>
                {t("From Cleaning To Repairs, We've Got Your Home Covered.")}</span>

            </li>

          </ul>

       </div>

       
       <div className="lg:col-span-5 flex justify-center lg:justify-end">
        <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square">
         <Image
                src="/assets/shared/home-service-worker.png"
                alt="Hire The Best Home Services In Town"
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover object-center"/>

        </div>

       </div>

        </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                {subFeatures.map((item, index) => (
            <div key={index} className="space-y-3">
              <h3 className="font-bold text-[#23263B] leading-snug fs-h3">
                {t(item.title)}
              </h3>
              <p className="text-slate-500 leading-relaxed fs-p">
                {item.description}
              </p>
              <div className="pt-2">
                <a
                  href={item.linkMref}
                  className="text-sm font-bold text-[#23263B] hover:text-orange-500 transition-colors">
                  {item.linktext}
                </a>
              </div>
            </div>
          ))}
        </div>

      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans border-t border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-0.5 bg-orange-500"></span>
              <span className="text-sm font-bold text-orange-500 tracking-wider uppercase">{t("testimonial")}</span>
            </div>
            <h2 className="font-extrabold text-[#23263B] tracking-tight leading-tight fs-h2">
              {t("What They Say About Our")}{' '}<br className="hidden sm:block" />
              {t("Service")}</h2>
          </div>

          <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-slate-100 shrink-0 max-w-full">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
              <svg className="w-7 h-7" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-sm text-slate-500 font-medium leading-snug">
                {t("Based On 236,488 Review")}{' '}<br />
                {t("In Google Business")}</p>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-sm font-bold text-[#23263B] hover:text-orange-500 transition-colors mt-1">
                <span>{t("More Testimonial")}</span>
                <ExternalLinkIcon className="w-3.5 h-3.5"/>
              </a>
            </div>
          </div>
        </div>

        <div className="bg-[#EEF2FB] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 mb-10 shadow-sm border border-slate-100">
          <div className="lg:col-span-5 relative min-h-[240px] lg:min-h-[380px]">
            <Image
              src={testimonialsData.featured.image}
              alt={testimonialsData.featured.name}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover object-center"/>
                <div aria-hidden="true" className="absolute start-0 top-0 z-10 flex h-16 w-16 items-center justify-center rounded-br-2xl bg-orange-500 text-white shadow-md">
              <Quote className="h-7 w-7 fill-current rotate-180"/>
            </div>
          </div>

          <div className="min-w-0 p-6 sm:p-12 flex flex-col justify-center space-y-4 lg:col-span-7">
            <h3 className="break-words font-extrabold text-[#23263B] fs-h3">
              {testimonialsData.featured.name}
            </h3>

            <div className="flex w-fit max-w-full items-start gap-2 rounded-md bg-white/60 px-3 py-1.5 text-xs font-bold text-slate-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-orange-500"/>
              <span className="min-w-0 break-words">{testimonialsData.featured.problem}</span>
            </div>

            <div className="py-1">
              {renderStars(testimonialsData.featured.rating)}
            </div>

            <p className="max-w-xl break-words leading-relaxed text-slate-600 fs-p">
              {testimonialsData.featured.text}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonialsData.small.map((item, index)=>(
            <div key={index} className="flex min-w-0 items-start gap-4 sm:gap-5">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-200 shrink-0 shadow-sm">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="112px"
                  className="object-cover"/>
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <h4 className="break-words text-lg font-bold text-[#23263B]">{item.name}</h4>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <AlertCircle className="w-3.5 h-3.5 text-[#EF6A42] shrink-0" />
                  <span className="min-w-0 break-words font-medium">{item.problem}</span>
                </div>

                <div>{renderStars(item.rating)}</div>

                <p className="break-words pt-1 leading-relaxed text-slate-500 fs-p">
                  {item.text}
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
