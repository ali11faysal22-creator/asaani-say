// 'use client'

// import React, { useState } from 'react'
// import Image from 'next/image'
// import Link from 'next/link'
// import { 
//   Camera, 
//   LayoutGrid, 
//   Hand, 
//   Sparkles, 
//   Star, 
//   Plus, 
//   CheckCircle2, 
//   X 
// } from 'lucide-react'

// const acSubServices = [
//   {
//     id: 'ac-general-service',
//     title: 'AC General Service',
//     subtitle: '-Per AC (1 to 2.5 tons)',
//     rating: '4.5',
//     price: 'Rs: 3000',
//     image: '/team-replacing-old-air-conditioner.jpg',
//   },
//   {
//     id: 'ac-installation',
//     title: 'AC Installation',
//     subtitle: '-Per AC (1 to 2.5 tons)',
//     rating: '4.5',
//     price: 'Rs: 3000',
//     image: '/AC installation.jpg',
//   },
//   {
//     id: 'ac-repairing',
//     title: 'AC Repairing',
//     subtitle: '-Per AC (1 to 2.5 tons)',
//     rating: '4.5',
//     price: 'Rs: 3000',
//     image: '/AC-repairing.jpg',
//   },
//   {
//     id: 'ac-mounting',
//     title: 'AC Mounting',
//     subtitle: '-Per AC (1 to 2.5 tons)',
//     rating: '4.5',
//     price: 'Rs: 3000',
//     image: '/AC-mounting.jpg',
//   },
//   {
//     id: 'ac-demounting',
//     title: 'AC Demounting',
//     subtitle: '-Per AC (1 to 2.5 tons)',
//     rating: '4.5',
//     price: 'Rs: 3000',
//     image: '/sAC-demounting.jpg',
//   },
//   {
//     id: 'overall-ac-service',
//     title: 'Overall AC Service',
//     subtitle: '-Per AC (1 to 2.5 tons)',
//     rating: '4.5',
//     price: 'Rs: 3000',
//     image: '/AC all service.jpg',
//   },
// ]

// export default function ACServicesPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [selectedService, setSelectedService] = useState<typeof acSubServices[0] | null>(null)
//   const [quantity, setQuantity] = useState(1)

//   // FIX: Updated handleAddToCart to persist data in LocalStorage
//   const handleAddToCart = (service: typeof acSubServices[0]) => {
//     // 1. Get existing cart from LocalStorage
//     const savedCart = typeof window !== 'undefined' ? localStorage.getItem('asaani_cart') : null
//     const cart = savedCart ? JSON.parse(savedCart) : []

//     // 2. Extract numeric value from price (e.g. "Rs: 3000" -> 3000)
//     const numericPrice = parseInt(service.price.replace(/[^0-9]/g, ''), 10) || 0

//     // 3. Check if service is already in cart
//     const existingIndex = cart.findIndex((item: unknown) => (item as Record<string, unknown>).id === service.id)

//     if (existingIndex > -1) {
//       cart[existingIndex].quantity += 1
//       setQuantity(cart[existingIndex].quantity)
//     } else {
//       cart.push({
//         id: service.id,
//         title: service.title,
//         subtitle: service.subtitle || '',
//         price: service.price,
//         numericPrice: numericPrice,
//         quantity: 1,
//         image: service.image || '',
//       })
//       setQuantity(1)
//     }

//     // 4. Save updated cart back to LocalStorage
//     localStorage.setItem('asaani_cart', JSON.stringify(cart))

//     // 5. Show modal
//     setSelectedService(service)
//     setIsModalOpen(true)
//   }

//   const closeModal = () => {
//     setIsModalOpen(false)
//   }

//   return (
//     <div className="w-full bg-white font-sans text-slate-800 relative">
      
//       {/* Top Bar */}
//       <div className="bg-[#EEF2FB] text-xs text-slate-600 py-2.5 px-4 md:px-12 flex justify-between items-center border-b border-slate-100">
//         <div className="flex items-center gap-6">
//           <span>Asaani Say@gmail.com</span>
//           <span className="border-l border-slate-300 pl-6">+1 (333) 000-0000</span>
//         </div>
//         <div className="flex items-center gap-4 text-slate-700">
//           <a href="#" className="hover:text-orange-500 transition">
//             <Camera className="w-4 h-4"/>
//           </a>
//           <a href="#" className="hover:text-orange-500 transition">
//             <LayoutGrid className="w-4 h-4"/>
//           </a>
//         </div>
//       </div>

//       {/* Header / Navbar */}
//       <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-100">
//         <Link href="/" className="flex items-center gap-2">
//           <div className="relative">
//             <Hand size={28} strokeWidth={2} className="text-black"/>
//             <Sparkles size={14} strokeWidth={2} className="text-orange-500 absolute -top-1 -right-1"/>
//           </div>
//           <div className="flex flex-col leading-tight">
//             <span className="font-extrabold text-xl tracking-tight text-orange-500">Asaani</span>
//             <span className="font-bold text-lg tracking-tight -mt-1.5 text-orange-500">Say</span>
//           </div>
//         </Link>

//         <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
//           <Link href="/" className="hover:text-orange-500 transition">Home</Link>
//           <Link href="/about-us" className="hover:text-orange-500 transition">About Us</Link>
//           <Link href="/services" className="text-slate-900 font-semibold hover:text-orange-500">Services</Link>
//           <Link href="/contact-us" className="hover:text-orange-500 transition">Contact Us</Link>
//           <Link href="/blog" className="hover:text-orange-500 transition">Blog</Link>
//         </nav>

//         <Link href="/login">
//           <button className="hidden md:inline-flex items-center gap-2 bg-[#3A3E59] hover:bg-[#2C2F45] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer">
//             <span>Get Started</span>
//           </button>
//         </Link>
//       </header>

//       {/* Hero Banner */}
//       <section className="relative w-full h-80 sm:h-96 bg-slate-900 flex items-center overflow-hidden">
//         <div className="absolute inset-0 bg-black/40 z-10"/>
//         <Image
//           src="/worker-works-air-conditioner.jpg"
//           alt="AC Services Banner"
//           fill
//           className="object-cover object-center"
//           priority
//         />
//         <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 w-full text-white space-y-2">
//           <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Ac Services</h1>
//           <p className="text-sm sm:text-base text-slate-100 font-medium">
//             We Handle All AC Brands – From Installation To Repair!
//           </p>
//         </div>
//       </section>

//       {/* Services Section */}
//       <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
//         <div className="text-center mb-10">
//           <h2 className="text-xl sm:text-2xl font-semibold text-[#1E2342] tracking-tight">
//             Choose From Our Wide Range Of Services
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {acSubServices.map((item) => (
//             <div
//               key={item.id}
//               className="bg-[#EEF2FB] rounded-xl p-3 flex items-center gap-3.5 shadow-sm hover:shadow-md transition border border-slate-300/60"
//             >
//               <div className="relative w-20 h-20 bg-slate-300 rounded-lg overflow-hidden shrink-0">
//                 <Image
//                   src={item.image}
//                   alt={item.title}
//                   fill
//                   className="object-cover"
//                 />
//               </div>

//               <div className="flex-1 min-w-0 space-y-1">
//                 <h3 className="text-sm font-extrabold text-[#1E2342] truncate">
//                   {item.title}
//                 </h3>
//                 <p className="text-[11px] text-slate-500 font-medium">
//                   {item.subtitle}
//                 </p>

//                 <div className="flex items-center justify-between pt-1">
//                   <div className="flex items-center gap-1">
//                     <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400"/>
//                     <span className="text-xs font-bold text-slate-700">{item.rating}</span>
//                   </div>

//                   <div className="flex items-center gap-1.5">
//                     <span className="bg-[#3A3E59] text-white text-[10px] font-bold px-2 py-1 rounded">
//                       {item.price}
//                     </span>
//                     <button 
//                       onClick={() => handleAddToCart(item)}
//                       className="bg-[#EE6C52] hover:bg-orange-600 text-white text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-0.5 transition cursor-pointer"
//                     >
//                       <Plus className="w-3 h-4 stroke-3"/> Add
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* SEO Content Section */}
//       <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-6 text-slate-700">
//         <div className="space-y-2">
//           <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2342]">
//             Best Air Conditioner Services In Pakistan – Asaani Say
//           </h2>
//           <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
//             Whether At Home Or The Office, Air Conditioners Have Become An Essential Part Of Our Daily Lives. However, To Keep Your AC Running Efficiently And Extend Its Lifespan, Regular Maintenance Is Crucial.
//           </p>
//         </div>

//         <div className="space-y-2 pt-2">
//           <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E2342]">
//             Why AC Maintenance Matters
//           </h3>
//           <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
//             Before The Summer Heat Sets In, Servicing Your AC Ensures It Operates At Peak Performance. Neglecting Routine Maintenance Can Reduce Cooling Efficiency, Increase Electricity Bills, And Lead To System Failure.
//           </p>
//           <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
//             While Basic UpKeep Like Cleaning Filters Can be Done At Home, More Technical Issues Require Professional Care. DIY Repairs Often Leads To More Damage If Not Handled Correctly.
//           </p>
//         </div>

//         <div className="space-y-2">
//           <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E2342]">
//             Trusted AC Services By Asaani Say
//           </h3>
//           <div className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium space-y-2">
//             <p>
//               Finding Reliable AC Technicians Can Be A Challenge-But That&apos;s Where Asaani Say Comes In. We Provide Top Rated AC Services In Lahore And Karachi, Connecting You With Expert Professionals For:
//             </p>
//             <ul className="list-disc list-inside text-xs sm:text-sm text-slate-600 font-medium space-y-1 pl-2">
//               <li>AC Installation & Dismounting</li>
//               <li>AC Repair & General Maintenance</li>
//               <li>AC Gas Refilling</li>
//               <li>Advanced AC Piping Services</li>
//               <li>Split AC Repair</li>
//               <li>Technician On-Demand Services</li>
//             </ul>
//             <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium pt-1">
//               With Years Of Experience, Our Technicians Are Skilled In Handling All AC Brands And Models.
//             </p>
//           </div>
//         </div>

//         <div className="space-y-3">
//           <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2342]">
//             What Sets Us Apart
//           </h2>
//           <div className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>24/7 AC Repair Services – No Extra Charges</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>Trained & Verified AC Technicians</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>Fast, Reliable, And Transparent Service</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>Affordable Pricing – No Hidden Costs</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>Full Range Of Leading AC Brands</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>100% Satisfaction Guarantee</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>Financing Options Available</span>
//             </div>
//           </div>
//         </div>

//         <div>
//           <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2342] mb-3">
//             Our Core Services
//           </h2>
//           <div className="space-y-3 text-xs sm:text-sm">
//             <div className="space-y-1">
//               <h3 className="font-bold text-[#1E2342] flex items-center gap-1.5">
//                 <span>🔧</span> AC Technician Services
//               </h3>
//               <p className="text-slate-500 font-medium leading-relaxed">
//                 Need The Best AC Technician In Lahore Or Karachi? We’ve Got You Covered For Split AC Repair, Installation, And Troubleshooting.
//               </p>
//             </div>

//             <div className="space-y-1">
//               <h3 className="font-bold text-[#1E2342] flex items-center gap-1.5">
//                 <span>🔧</span> AC Repair Services
//               </h3>
//               <p className="text-slate-500 font-medium leading-relaxed">
//                 From Minor Issues To Major Breakdowns, We Handle All Types Of General AC Repair And Service.
//               </p>
//             </div>

//             <div className="space-y-1">
//               <h3 className="font-bold text-[#1E2342] flex items-center gap-1.5">
//                 <span>🛠️</span> AC Installation Services
//               </h3>
//               <p className="text-slate-500 font-medium leading-relaxed">
//                 Whether It’s A New Installation Or A Relocation, Our Experts Are Equipped To Handle All Brands And Models Seamlessly.
//               </p>
//             </div>

//             <div className="space-y-1">
//               <h3 className="font-bold text-[#1E2342] flex items-center gap-1.5">
//                 <span>🔄</span> AC Maintenance Services
//               </h3>
//               <p className="text-slate-500 font-medium leading-relaxed">
//                 Keep Your AC Running Smoothly With Routine Check-Ups And Tune-Ups By Experienced Professionals.
//               </p>
//             </div>

//             <div className="space-y-1">
//               <h3 className="font-bold text-[#1E2342] flex items-center gap-1.5">
//                 <span>💨</span> AC Gas Refilling Services
//               </h3>
//               <p className="text-slate-500 font-medium leading-relaxed">
//                 We Offer Safe And Efficient Gas Refilling Services To Restore Your AC’s Cooling Capacity.
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="pt-8 space-y-2 border-t border-slate-100">
//           <h2 className="text-2xl sm:text-3xl font-black text-[#1E2342] tracking-tight">
//             Book Now With Asaani Say
//           </h2>
//           <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
//             From <span className="font-extrabold text-[#1E2342]">Installation To Repair</span>, Servicing To Expert Advice, We Do It All With Care, Professionalism, And Efficiency.
//           </p>
//         </div>
//       </section>

//       {/* Footer */}
//       <footer className="w-full bg-[#393E58] text-slate-200 pt-16 pb-8 font-sans">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
//             <div className="md:col-span-5 space-y-3">
//               <p className="text-xs text-slate-300 tracking-wide font-normal">All You Need</p>
//               <h2 className="text-3xl font-black text-orange-500 tracking-tight">Asaani Say</h2>
//             </div>

//             <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 text-xs gap-8">
//               <div className="space-y-3">
//                 <h3 className="font-semibold text-white text-sm">Navigation</h3>
//                 <ul className="space-y-2 text-slate-300">
//                   <li><Link href="/" className="hover:text-orange-500 transition">Home</Link></li>
//                   <li><Link href="/about-us" className="hover:text-orange-500 transition">About Us</Link></li>
//                   <li><Link href="/services" className="hover:text-orange-500 transition">Services</Link></li>
//                   <li><Link href="/contact-us" className="hover:text-orange-500 transition">Contact Us</Link></li>
//                 </ul>
//               </div>

//               <div className="space-y-3">
//                 <h3 className="font-semibold text-sm text-white">Quick Links</h3>
//                 <ul className="space-y-2 text-slate-300">
//                   <li><Link href="#" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
//                   <li><Link href="#" className="hover:text-orange-500 transition">Terms Of Services</Link></li>
//                   <li><Link href="#" className="hover:text-orange-500 transition">Disclaimer</Link></li>
//                   <li><Link href="#" className="hover:text-orange-500 transition">FAQ</Link></li>
//                 </ul>
//               </div>

//               <div className="space-y-3">
//                 <h3 className="font-semibold text-sm text-white">Contact Us</h3>
//                 <div className="space-y-2 text-slate-300 leading-relaxed">
//                   <p>Our Support and Sales team is available 24/7 to answer your queries</p>
//                   <p className="pt-1 font-medium">+1 (333) 000-0000</p>
//                   <p className="font-medium">Asaanisay@gmail.com</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="border-t border-slate-200/40 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-300 gap-2">
//             <p>Copyright © 2026 AsaaniSay </p>
//           </div>
//         </div>
//       </footer>

//       {/* Added To Cart Popup Modal */}
//       {isModalOpen && selectedService && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs transition-opacity">
//           <div className="bg-white rounded-3xl max-w-sm sm:max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            
//             {/* Header */}
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
//                   <CheckCircle2 className="w-4 h-4" />
//                 </div>
//                 <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
//                   Added to Cart Successfully!
//                 </h3>
//               </div>
//               <button 
//                 onClick={closeModal}
//                 className="text-slate-400 hover:text-slate-600 p-1 rounded-full transition cursor-pointer"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>

//             {/* Selected Product Card */}
//             <div className="flex items-center gap-4 pt-1">
//               <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 shrink-0">
//                 <Image 
//                   src={selectedService.image} 
//                   alt={selectedService.title} 
//                   fill
//                   className="object-cover"
//                 />
//               </div>
//               <div className="space-y-1">
//                 <h4 className="text-xs sm:text-sm font-bold text-slate-900">{selectedService.title}</h4>
            
//                 <p className="text-xs font-bold text-[#EE6C52]">
//                   {selectedService.price}
//                 </p>
//               </div>
//             </div>

//             {/* Quantity Box */}
//             <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100 text-xs">
//               <div>
//                 <p className="font-bold text-slate-800">Quantity Selected</p>
//               </div>
//               <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2.5 py-1">
//                 <span className="text-slate-600 text-[11px]">Qty:</span>
//                 <span className="font-bold text-slate-900">{quantity}</span>
//               </div>
//             </div>

//             {/* Subtotal */}
//             <div className="flex items-center justify-between text-xs pt-1">
//               <span className="text-slate-500 font-medium">Cart Subtotal</span>
//               <span className="text-sm font-extrabold text-slate-900">
//                 Rs: {(parseInt(selectedService.price.replace(/[^0-9]/g, ''), 10) * quantity).toLocaleString()}
//               </span>
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-2 pt-1">
//               <Link href="/cart" className="block w-full">
//                 <button className="w-full bg-[#EE6C52] hover:bg-orange-600 text-white font-bold text-xs py-3 rounded-xl transition shadow-sm cursor-pointer">
//                   Continue to Order
//                 </button>
//               </Link>
//               <button 
//                 onClick={closeModal}
//                 className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs py-3 rounded-xl border border-slate-200 transition cursor-pointer"
//               >
//                 Continue Shopping
//               </button>
//             </div>

//           </div>
//         </div>
//       )}

//     </div>
//   )
// }


'use client'
import ServiceCategoryView from '../../components/service-category-view'
export default function Page() {
  return <ServiceCategoryView slug="ac-services" />
}
