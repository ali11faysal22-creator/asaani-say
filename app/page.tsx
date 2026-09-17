'use client'
import React, {useEffect,useRef,useState } from 'react'
import {Camera,LayoutGrid,Sparkles,ChevronDown,User,Star,Quote,Wrench,Drill,Sun,Truck,Bug,Clock,MousePointerClick,Users,Award,RefreshCw,ArrowRight,ArrowUpRight,AlertCircle,ExternalLink as ExternalLinkIcon} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import CustomerNavbar from './components/customer-navbar'
import { submitServiceRequest } from './lib/booking-api'
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
    image: '/plumber-repair-experienced-attentive-middleaged-man-examining-bottom-kitchen-sink.jpg',
  },
  {
    number: '02',
    name: 'Timothy Brake',
    jobsCompleted: '199 Job Completed',
    bio: 'Hello there, i am one of Asaani say plumbing service expert. I am ready to help you solve whatever plumbing problem in your house.',
    image: '/plumber-with-his-arms-crossed.jpg',
  },
  {
    number: '03',
    name: 'Charlie Sinclair',
    jobsCompleted: '199 Job Completed',
    bio: 'Hello there, i am one of Asaani say plumbing service expert. I am ready to help you solve whatever plumbing problem in your house.',
    image: '/plumbing-professional-doing-his-job.jpg',
  },
]
function renderStars(rating: number): React.ReactNode {
  return (
    <div className="flex items-center gap-1 text-[#FFAE00]">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < rating ? 'fill-current' : 'text-slate-300'
          }`}
        />
      ))}
    </div>
  )
}
 const subFeatures=[
  {
    title:'We Bring Only The Right Equipment',
    description:'THe Right Tools,Every TIme,For Perfect Results',
    linktext:'Learn More...',
    linkMref:'#',

  },
  {
    title:'The Important Of Home Expertise',
    description:'Your Home Deserves Expert Hands,Not Guess Work',
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
    image: '/image.png',
  },
  small: [
    {
      name: 'Jerry T. Johnson',
      problem: 'Problem : Running Toilets',
      rating: 4.5,
      text: 'Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.',
      image: '/handsome-bearded-businessman-rubbing-hands-having-deal.jpg',
    },
    {
      name: 'Lisa C. Packer',
      problem: 'Problem : Water Heater Problems',
      rating: 4.5,
      text: 'Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.',
      image: '/happy-authentic-girl-smiling-pointing-fingers-sideways-showing-left-right-banner-demonstrating-p.jpg',
    },
  ],
}
export default function HeroSection() {
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
        'Enter Your Zip Code,Select Your City And Service,Choose a Date & Time,Then Submit Your Contact Details To Get An Instant Price And Confirm Your Booking.',
    },
    {
      question: 'So What Types Of Services Does Asaani Say Offers?',
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
      <div className="bg-[#EEF2FB] text-xs text-slate-600 py-2.5 px-4 md:px-12 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-6">
          <span>Asaani Say@gmail.com</span>
          <span className="border-l border-slate-300 pl-6">+1 (333) 000-0000</span>
        </div>
        <div className="flex items-center gap-4 text-slate-700">
          <a href="#" className="hover:text-orange-500 transition">
            <Camera className="w-4 h-4"/>
          </a>
          <a href="#" className="hover:text-orange-500 transition">
            <LayoutGrid className="w-4 h-4"/>
          </a>
        </div>
      </div>
      <CustomerNavbar active="home" />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

          <div className="lg:col-span-7 pt-2 space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#23263B] leading-tight tracking-tight">
                Welcome To
              </h1>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-[#EF6A42] tracking-tight leading-none mt-1 mb-8">
                Asaani Say
              </h1>
              <p className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">
                BEST SERVICES
              </p>
              <p className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#23263B] leading-snug max-w-2xl">
                Some Jobs Should Only Ever Be Tackled By A Professional, And Home Services is one of them.
              </p>
            </div>
            <div className="relative pt-6">
              <div className="relative inline-block w-full max-w-lg">
                <div className="absolute -top-5 right-6 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-md z-10">
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
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                      Great Service From Dedicated Team. They Are Very Experienced In Fixing All The Plumbing Problems That Plague Homes.
                    </p>
                    <p className="text-xs font-bold text-[#23263B] pt-1">
                      Jhon Smith, Idaho
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.06)] border border-slate-100">
              <h3 className="text-lg font-bold text-[#23263B] mb-6">
                Order Service
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
                    placeholder="Zip Code*"
                    className="w-full bg-white text-slate-700 text-xs px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#EF6A42]/50 placeholder-slate-400"/>
                  <div className="relative">
                    <select
                      required
                      value={orderForm.city}
                      onChange={updateOrderField('city')}
                      className="w-full bg-white text-slate-600 text-xs px-4 py-3 rounded-lg appearance-none border-none focus:outline-none focus:ring-2 focus:ring-[#EF6A42]/50 pr-8">
                      <option value="">Select City</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Gujranwala">Gujranwala</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>


                <div>
                  <label className="block text-xs font-bold text-[#23263B] mb-1.5">
                    Select Job
                  </label>
                  <div className="relative">
                    <select
                      required
                      value={orderForm.service}
                      onChange={updateOrderField('service')}
                      className="w-full bg-white text-slate-600 text-xs px-4 py-3 rounded-lg appearance-none border-none focus:outline-none focus:ring-2 focus:ring-[#EF6A42]/50 pr-8">
                      <option value="">Select Service</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="Electrician">Electrician</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="House Inspection">House Inspection</option>
                      <option value="Home Shifting Service">Home Shifting Service</option>
                      <option value="Pest Control Services">Pest Control Services</option>
                      <option value="Painter">Painter</option>
                      <option value="Solar Panel Installation">Solar Panel Installation</option>
                      <option value="Geyser">Geyser</option>
                      <option value="Carpenter">Carpenter</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3 top-3.5 pointer-events-none" />
                  </div>
                </div>
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-bold text-[#23263B]">
                    When Would You Like Us to Come?
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
                    placeholder="Your Email"
                     className="w-full bg-white text-slate-700 text-xs px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"/>

                  <input
                    type="tel"
                    required
                    value={orderForm.phone}
                    onChange={updateOrderField('phone')}
                    placeholder="Phone Number"
                    className="w-full bg-white text-slate-700 text-xs px-4 py-3 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-orange-500 placeholder-slate-400"/>
                </div>


                <button
                  type="submit"
                  disabled={orderStatus === 'submitting'}
                  className="w-full bg-[#3A3E59] hover:bg-[#2C2F45] disabled:opacity-60 text-white font-semibold text-xs py-3.5 rounded-lg mt-3 transition shadow-md">
                  {orderStatus === 'submitting' ? 'Sending…' : 'Get A Price'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans">
        <div className="flex justify-between items-start mb-8">
          <div>
            <p className="text-sm font-semibold text-[#3A3E59] mb-0.5">
              Select Our
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-orange-500 tracking-tight">
              Best Services
            </h2>
            <p className="text-[#3A3E59] text-sm sm:text-base mt-3 max-w-xl leading-relaxed">
              Connecting Customers And Technicians For Quick, Safe, And Affordable Bookings.
            </p>
          </div>
          <Link
            href="/services"
            className="text-sm font-bold text-[#3A3E59] hover:text-orange-500 transition pt-1">
            See All
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
              <h3 className="text-xl font-bold text-[#23263B] mb-3">
                {item.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
                {item.desc}
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
                <span className="text-xs font-bold text-[#EF6A42] uppercase tracking-wider">
                  Get Our Service
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#23263B]">
                How To Get Our Service
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
                      <h3 className="text-lg font-bold text-[#23263B] mb-1">
                        {step.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                        {step.desc}
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
            src="/carpenter-talking-mobile-phone.jpg"
             alt="How To Get Our Service"
              fill
                className="object-cover"/>
      </div>
            <div className="flex items-center gap-4 pt-2">
              <div className="w-16 h-16 bg-[#3A3E59] rounded-lg shrink-0"></div>
              <p className="text-xs text-slate-600 leading-relaxed">
                <strong className="text-[#23263B]">Fringilla Scelerisque</strong> In Imperdiet Nisi Erat In Id. Vel Fermentum Aenean Aenean Id Ornare Vitae Sapien Nulla Auctor. At Nisl Sem Eget Orci Pretium Sed.
              </p>
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

                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                  Why Us
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#23263B] leading-tight">
                Trusted Service With <br/>
                Affordable Price
              </h2>
            </div>
            <div className="relative w-full h-95 rounded-2xl overflow-hidden shadow-sm border border-slate-100">
              <Image
                src="/close-up-carpenter-working-with-drill.jpg" 
                alt="Trusted Service With Affordable Price"
                fill
                className="object-cover"/>
            </div>
          </div>
          <div className="lg:col-span-6 space-y-10 pt-2">

          <div
              ref={statsRef}
              className="grid grid-cols-3 gap-4 border-b border-slate-100 pb-8 text-center sm:text-left">
              {stats.map((stat, idx) => (
                <div
                  key={idx}
                  className={idx !== 0 ? 'border-l border-slate-200 pl-4 sm:pl-6':''}>
                  <h3
                    className="counter-value text-2xl sm:text-3xl font-black text-[#23263B]"
                    data-target={stat.target}>
                    0 +

                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>

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

                  <h4 className="text-lg font-bold text-[#23263B] mb-2">{item.title}      
                  </h4>

         <p className="text-xs text-slate-500 leading-relaxed">{item.desc}

         </p>
                </div>

     ))}
       </div>
               </div>
     </div>

           <div className="bg-[#050B30] rounded-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between shadow-lg">

          <div className="bg-[#2C3352] px-8 py-6 w-full md:w-auto flex flex-col justify-center shrink-0 min-w-50">
            
            <span className="text-2xl font-black text-orange-500 leading-none">Asaani</span>
            <span className="text-2xl font-black text-orange-500 leading-tight">Say</span>
       </div>

          <div className="p-6 md:p-8 text-center md:text-left text-white flex-1">
            <h3 className="text-lg font-bold mb-1">Need Help At Home?            
            </h3>

            <p className="text-xs text-slate-300">
              Book Expert Services Anytime, Anywhere With Just One Tap.
            </p>

    </div>

          <div className="p-6 md:pr-8 md:p-0 shrink-0gap-12 items-center">

          <Link href="/login">
  <button className="hidden md:inline-flex items-center gap-2 bg-[#3A3E59] hover:bg-[#2C2F45] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer">
    <span>Get Started</span>
  </button>
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
             <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                  FAQ
                </span>
       </div>
             <h2 className="text-3xl sm:text-4xl font-extrabold text-[#23263B] tracking-tight">
              Frequently Asked <br />
              Questions              

             </h2>

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
                                    className="w-full flex items-center justify-between text-left group focus:outline-none">
                                    <span
                                        className={`text-base sm:text-lg font-bold transition-colors ${
                                            isOpen
                                                ? 'text-orange-500'
                                                : 'text-[#23263B] group-hover:text-orange-500'
                                        }`}>
                                        {item.question}
                                    </span>
                                    <span className="ml-4 shrink-0">
                                        {isOpen ? (
                                            <ArrowRight className="w-5 h-5 text-orange-500"/>
                                        ) : (
                                            <ArrowUpRight className="w-5 h-5 text-[#23263B] group-hover:text-orange-500 transition-colors" />
                                        )}
                                    </span>
                                </button>
                                {isOpen && (
                                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-3 pr-6">
                                        {item.answer}
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
                        src="/group 90.png"
                        alt="Handyman talking on mobile phone"
                        fill
                        className="object-cover object-center"/>
                </div>

                   <Link
                    href="/contact-us"
                    className="bg-[#3D425A] hover:bg-[#2C2F45] text-white text-xs sm:text-sm font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 shadow-md">
                    Contact-Us
                </Link>
            </div>
        </div>
    </section>
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-8 h-0.5 bg-[#EF6A42]"></span>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                Plumber Expert
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#23263B] tracking-tight leading-tight">
              Meet Some Of Our <br />
              Plumbing Expert
            </h2>
          </div>

          <div className="border-l-4 border-orange-500 pl-4 py-1 max-w-md">
            <h3 className="text-sm font-bold text-[#23263B] mb-1">
              Meet Some Of Our Expert Plumbers.
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Skilled, Reliable, And Ready To Handle Any Job With Precision.
            </p>
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
                  className="object-cover object-center group-hover:scale-105 transition-transform duration-300"/>
                <div className="absolute top-0 left-0 bg-[#3D425A]/90 text-white font-bold text-xl px-5 py-3 rounded-br-2xl shadow-sm z-10">
                  {expert.number}
                </div>
              </div>

              <div className="space-y-1.5 px-1">
                <h3 className="text-xl font-bold text-[#23263B] group-hover:text-orange-500 transition-colors">
                  {expert.name}
                </h3>
                <p className="text-xs font-bold text-[#23263B] pb-1">
                  {expert.jobsCompleted}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
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
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">hire best home services</span>
        </div>
                 
                 <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#23263B] leading-tight tracking-tight">
                  Hire The Best Home <br />
                  Services In Town

                 </h2>

            </div>
          
          <ul className="space-y-3 text-sm text-slate-600 leading-relaxed pt-2">
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">• </span>
               <span>Hire The Best Home Services In Town — Fast,Reliable,And Trusted.</span>

            </li>
            <li className="flex items-start gap-2">
              <span className="text-slate-400 font-bold">• </span>
              <span>
                From Cleaning To Repairs, We&apos;ve Got Your Home Covered.
              </span>

            </li>

          </ul>

       </div>

       
       <div className="lg:col-span-5 flex justify-center lg:justify-end">
        <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square">
         <Image
                src="/worker.png"
                alt="Hire The Best Home Services In Town"
                fill
                className="object-cover object-center"/>

        </div>

       </div>

        </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
                {subFeatures.map((item, index) => (
            <div key={index} className="space-y-3">
              <h3 className="text-xl sm:text-2xl font-bold text-[#23263B] leading-snug">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                {item.description}
              </p>
              <div className="pt-2">
                <a
                  href={item.linkMref}
                  className="text-xs font-bold text-[#23263B] hover:text-orange-500 transition-colors">
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
            <div className="flex items-center gap-2">
              <span className="w-8 h-0.5 bg-orange-500"></span>
              <span className="text-xs font-bold text-orange-500 tracking-wider uppercase">testimonial</span>


            </div>
                     <h2 className="text-3xl sm:text-4xl font-extrabold text-[#23263B] tracking-tight leading-tight">
              What They Say About Our <br />
              Service
            </h2>
  </div>
          </div>
          

             <div className="bg-white rounded-xl p-4 flex items-center gap-4 border border-slate-100 shrink-0">
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
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
             <div>
              <p className="text-xs text-slate-500 font-medium leading-snug">
                Based On 236,488 Review <br />
                In Google Business
              </p>
              <a
                href="#"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#23263B] hover:text-orange-500 transition-colors mt-1">
                <span>More Testimonial</span>
                <ExternalLinkIcon className="w-3.5 h-3.5"/>
              </a>
            </div>
        </div>
    
        <div className="bg-[#EEF2FB] rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 mb-10 shadow-sm border border-slate-100">
          <div className="lg:col-span-5 relative min-h-300px lg:min-h-380px">
            <Image
              src={testimonialsData.featured.image}
              alt={testimonialsData.featured.name}
              fill
              className="object-cover object-center"/>
                <div className="absolute top-0 left-0 bg-orange-500 text-white p-5 rounded-br-2xl shadow-md">
              <Quote className="w-7 h-7 fill-current rotate-180"/>
            </div>
          </div>

          <div className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center space-y-4">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#23263B]">
              {testimonialsData.featured.name}
            </h3>

            <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-white/60 w-fit px-3 py-1.5 rounded-md">
              <AlertCircle className="w-4 h-4 text-orange-500"/>
              <span>{testimonialsData.featured.problem}</span>
            </div>

            <div className="py-1">
              {renderStars(testimonialsData.featured.rating)}
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              {testimonialsData.featured.text}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonialsData.small.map((item, index)=>(
            <div key={index} className="flex gap-5 items-start">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-200 shrink-0 shadow-sm">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"/>
              </div>

              <div className="space-y-2 flex-1">
                <h4 className="text-lg font-bold text-[#23263B]">{item.name}</h4>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <AlertCircle className="w-3.5 h-3.5 text-[#EF6A42] shrink-0" />
                  <span className="font-medium">{item.problem}</span>
                </div>

                <div>{renderStars(item.rating)}</div>

                <p className="text-xs text-slate-500 leading-relaxed pt-1">
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer className="w-full bg-[#393E58] text-slate-200 pt-16 pb-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
            <div className="md:col-span-5 space-y-3">
              <p className=" text-xs text-slate-300 tracking-wide font-normal"> All You Need

              </p>
              <h2 className=" text-3xl font-black text-orange-500 tracking-tight">Asaani Say

              </h2>


            </div>

              <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 text-xs gap-8">
                
                <div className="space-y-3">
                  <h3 className="font-semibold text-white text-sm">Navigation

                  </h3>
                  <ul className="space-y-2 text-slate-300">
                     <li>
                    <a href="home" className="hover:text-orange-500 transition">Home</a>
                  </li>
                          
                        <li>
                  <a href="about-us" className="hover:text-orange-500 transition">About Us

                  </a>

                </li>

                   <li>
                  <a href="services" className="hover:text-orange-500 transition">Services</a>
                </li>
                        
                     <li>
                  <a href="contact-us" className="hover:text-orange-500 tansition">Contact Us</a>
                </li>

                  </ul>
                </div>
         
         <div className="space-y-3">
          <h3 className="font-semibold text-sm text-white">Quick Links

          </h3>
          <ul className="space-y-2 text-slate-300 ">
            <li>
              <a href="#" className="hover:text-orange-500 transition">Privacy Policy</a>

            </li>
            <li>
              <a href="#" className="hover:text-orange-500 transition">Terms Of Services</a>
            </li>
                <li>
                  <a href="#" className=" hover:text-orange-500 transition">Disclaimer</a>
                </li>
                <li>
                  <a href="#" className="hover:text-orange-500 transition">FAQ</a>
                </li>
          </ul>

         </div>
                  
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-white">Contact Us

                    </h3>
                     <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p>
                    Our Support and Sales team is available 24 /7 to answer your queries
                  </p>
                  <p className="pt-1 font-medium">+1 (333) 000-0000</p>
                  <p className="font-medium">Asaanisay@gmail.com</p>
                </div>

                  </div>
                
              </div>

          </div>
           <div className="border-t border-slate-200/40 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-300 gap-2">
            <p>Copyright © 2026AsaaniSay</p>
          </div>
        </div>

      </footer>
</div>
  
  )
}
