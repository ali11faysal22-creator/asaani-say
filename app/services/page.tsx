'use client'
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {Award,FileText,MapPin,Clock,CalendarDays,MessageSquare,Wrench,Zap,Home,Wind,Bug,Flame,Paintbrush,Hammer,Camera,LayoutGrid, Hand,Sparkles,Star,Quote,ArrowUpRight,AlertCircle} from 'lucide-react'
const servicesList = [
          {
            title:'Home Inspection',
            icon:<Home className="w-8 h-8 text-[#23263B]"/>,
             href:'/services/home-inspection',
        },
        {
          title:'Plumber',
           icon:<Wrench className="w-8 h-8 text-orange-500"/>,
            href:'/services/plumbing',
        },
     {
      title:'Electrician',
       icon:<Zap className="w-8 h-8 text-amber-500"/>,
       href:'/services/electrician',
  },
  {
    title:'AC Services',
    icon:<Wind className="w-8 h-8 text-orange-500"/>,
    href:'/services/ac-services',
  },
  {
    title:'Handyman',
    icon:<Hammer className="w-8 h-8 text-slate-700"/>,
    href:'/services/handyman',
  },
  {
    title:'Carpenter',
    icon:<Hammer className="w-8 h-8 text-amber-700"/>,
    href: '/services/carpenter',
  },
  {
    title:'Pest Control',
    icon:<Bug className="w-8 h-8 text-rose-500"/>,
    href:'/services/pest-control',
  },
  {
    title:'Geyser',
    icon:<Flame className="w-8 h-8 text-orange-500"/>,
    href:'/services/geyser',
  },
  {
    title:'Painter',
    icon:<Paintbrush className="w-8 h-8 text-blue-600"/>,
    href:'/services/painter',
  },
]

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

export default function ServicesPage(){
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

      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <Hand size={28} strokeWidth={2} className="text-black"/>
            <Sparkles size={14} strokeWidth={2} className="text-orange-500 absolute -top-1 -right-1"/>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-xl tracking-tight text-orange-500">Asaani</span>
            <span className="font-bold text-lg tracking-tight -mt-1.5 text-orange-500">Say</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-orange-500 transition">
            Home
          </Link>
          <Link href="/about-us" className="hover:text-orange-500 transition">
            About Us
          </Link>
          <Link href="/services" className="text-slate-900 font-semibold hover:text-orange-500">
            Services
          </Link>
          <Link href="/contact-us" className="hover:text-orange-500 transition">
            Contact Us
          </Link>
          <Link href="/blog" className="hover:text-orange-500 transition">
            Blog
          </Link>
        </nav>

       <Link href="/login">
  <button className="hidden md:inline-flex items-center gap-2 bg-[#3A3E59] hover:bg-[#2C2F45] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer">
    <span>Get Started</span>
  </button>
</Link>
      </header>

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
            Easier Home <br />
            <span className="text-orange-500">Maintenance,</span> <br />
            Every Day!!
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto font-medium">
            Bringing Customers And Professionals Together For Quick, Secure, And Affordable Bookings.
          </p>
        </div>
      </section>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12 space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#1E2342] tracking-tight">
            Services
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-500">
            Choose From Our Wide Range Of Services
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {servicesList.map((service, index) => (
            <Link key={index} href={service.href} className="block">
              <div className="bg-white hover:bg-[#e4ebfa] transition-all duration-300 rounded-2xl p-6 flex items-center gap-5 cursor-pointer shadow-sm hover:shadow-md border border-slate-100 h-full">
                <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-slate-50">
                  {service.icon}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1E2342]">
                  {service.title}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section className="w-full bg-[#141F52] text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-snug">
                Fast, Friendly, and Satisfaction <br className="hidden sm:inline" />
                Guarantee
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                No matter how big or small your work is, whether it&apos;s for the interior or exterior of your home, we are ready to serve and help you solve your home problems.
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
                    {feature.title}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                    {feature.desc}
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
              Everyone’s <br />
              <span className="relative inline-block">
                Booking This!

                <span className="absolute bottom-1 left-0 w-full h-1 bg-sky-500 rounded-full"/>
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-md">
              High repeat bookings and excellent reviews show the trust our customers place in Asaani Say services.
            </p>
          </div>
          <div className="lg:col-span-7 space-y-4">
            {trendingServices.map((service) => (
              <Link key={service.id} href={service.href} className="block">
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
                      {service.title}
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
                  Plumber Expert
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2342] tracking-tight">
                Meet Some Of Our <br />
                Plumbing Expert
              </h2>
            </div>

            <div className="border-l-2 border-[#EE6C52] pl-4 py-1 space-y-0.5 max-w-sm">
              <h4 className="text-xs font-bold text-[#1E2342]">
                Meet Some Of Our Expert Plumbers.
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Skilled, Reliable, And Ready To Handle Any Job With Precision.
              </p>
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
                  <div className="absolute top-0 left-0 bg-[#4A506B] text-white text-sm font-bold px-4 py-2 rounded-br-xl">
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
                    <span className="text-xs text-slate-400 font-medium ml-1">
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
                Testimonial
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E2342] tracking-tight">
              What They Say About Our <br />
              Service
            </h2>
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
                Based On 236,488 Review <br />
                <span className="font-semibold text-slate-700">In Google Business</span>
              </p>
              <Link
                href="#"
                className="inline-flex items-center gap-1 text-xs font-bold text-[#1E2342] hover:text-orange-500 transition border-b border-slate-300 pb-0.5">
                More Testimonial <ArrowUpRight className="w-3.5 h-3.5"/>
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
            <div className="absolute top-0 left-0 bg-orange-500 p-3 rounded-br-2xl text-white shadow-md">
              <Quote className="w-6 h-6 fill-current rotate-180" />
            </div>
          </div>

          <div className="md:col-span-7 p-6 sm:p-10 flex flex-col justify-center space-y-3">
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E2342]">
              Andrea D. Elliott
            </h3>

            <div className="inline-flex items-center gap-1.5 bg-red-50 text-red-500 px-2.5 py-1 rounded-full text-xs font-semibold w-fit">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Problem : Dripping Faucets</span>
            </div>

            <div className="flex items-center gap-1 py-1">
              <div className="flex text-amber-400">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current"/>
                ))}
                <Star className="w-4 h-4 text-amber-400"/>
              </div>
              <span className="text-xs text-slate-400 font-bold ml-1">4.5</span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg">
              Super professional service from Ploombr. Everything was on-time and totaly fixed the problem. Realible and affdorable service with friendly support team.
            </p>
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
                  <span>Problem : {item.problem}</span>
                </div>

                <div className="flex items-center gap-1">
                  <div className="flex text-amber-400">
                    {[...Array(4)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current"/>
                    ))}
                    <Star className="w-3 h-3 text-amber-400"/>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold ml-1">
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

      <footer className="w-full bg-[#393E58] text-slate-200 pt-16 pb-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
            <div className="md:col-span-5 space-y-3">
              <p className="text-xs text-slate-300 tracking-wide font-normal">
                All You Need
              </p>
              <h2 className="text-3xl font-black text-orange-500 tracking-tight">
                Asaani Say
              </h2>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 text-xs gap-8">
            
              <div className="space-y-3">
                <h3 className="font-semibold text-white text-sm">Navigation</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>
                    <Link href="/" className="hover:text-orange-500 transition">
                      Home
                    </Link>
                  </li>
                  <li>
                    <Link href="/about-us" className="hover:text-orange-500 transition">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="/services" className="hover:text-orange-500 transition">
                      Services
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact-us" className="hover:text-orange-500 transition">
                      Contact Us
                    </Link>
                  </li>
                </ul>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-white">Quick Links</h3>
                <ul className="space-y-2 text-slate-300">
                  <li>
                    <Link href="#" className="hover:text-orange-500 transition">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-500 transition">
                      Terms Of Services
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-500 transition">
                      Disclaimer
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-orange-500 transition">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-white">Contact Us</h3>
                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p>Our Support and Sales team is available 24/7 to answer your queries</p>
                  <p className="pt-1 font-medium">+1 (333) 000-0000</p>
                  <p className="font-medium">Asaanisay@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/40 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-300 gap-2">
            <p>Copyright © 2026 AsaaniSay </p>
          </div>
        </div>
      </footer>
    </div>
  )
}