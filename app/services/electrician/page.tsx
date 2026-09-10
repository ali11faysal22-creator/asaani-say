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
//   X,
//   Zap
// } from 'lucide-react'

// const electricalSubServices = [
//   {
//     id: 'Wiring & Rewiring',
//     title: 'Wiring & Rewiring',
//     subtitle: 'Per Room / Full House',
//     rating: '4.9',
//     price: 'Rs: 15000',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Switch & Socket Repair',
//     title: 'Switch & Socket Repair',
//     subtitle: 'Per Switch Board',
//     rating: '4.8',
//     price: 'Rs: 800',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Light Installation',
//     title: 'Light Installation',
//     subtitle: 'Per Fixture / Spot Light',
//     rating: '4.9',
//     price: 'Rs: 1000',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Fan Installation',
//     title: 'Fan Installation',
//     subtitle: 'Ceiling & Exhaust Fan',
//     rating: '4.8',
//     price: 'Rs: 1000',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Circuit Breaker Repair',
//     title: 'Circuit Breaker Repair',
//     subtitle: 'Breaker Replacement & Fix',
//     rating: '4.7',
//     price: 'Rs: 2500',
//     image: '', // Add image path here
//   },
//   {
//     id: 'DB Panel Work',
//     title: 'DB Panel Work',
//     subtitle: 'Distribution Box Setup',
//     rating: '4.9',
//     price: 'Rs: 5000',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Short-Circuit Repair',
//     title: 'Short-Circuit Repair',
//     subtitle: 'Emergency Fault Fix',
//     rating: '4.8',
//     price: 'Rs: 3000',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Power Outlet Installation',
//     title: 'Power Outlet Installation',
//     subtitle: 'Heavy Power Plug Setup',
//     rating: '4.7',
//     price: 'Rs: 1200',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Electrical Fault Detection',
//     title: 'Electrical Fault Detection',
//     subtitle: 'Diagnostic & Line Check',
//     rating: '4.8',
//     price: 'Rs: 2000',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Generator Wiring',
//     title: 'Generator Wiring',
//     subtitle: 'Changeover Switch & Line',
//     rating: '4.9',
//     price: 'Rs: 4500',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Inverter Installation',
//     title: 'Inverter Installation',
//     subtitle: 'UPS & Solar Inverter Fitting',
//     rating: '4.9',
//     price: 'Rs: 4000',
//     image: '', // Add image path here
//   },
//   {
//     id: 'Electrical Inspection',
//     title: 'Electrical Inspection',
//     subtitle: 'Safety & Load Audit',
//     rating: '4.8',
//     price: 'Rs: 5000',
//     image: '', // Add image path here
//   },
// ]

// export default function ElectricalServicesPage() {
//   const [isModalOpen, setIsModalOpen] = useState(false)
//   const [selectedService, setSelectedService] = useState<typeof electricalSubServices[0] | null>(null)
//   const [quantity, setQuantity] = useState(1)

//   // UPDATED: Syncs item with localStorage and calculates correct item quantities
//   const handleAddToCart = (service: typeof electricalSubServices[0]) => {
//     const savedCart = typeof window !== 'undefined' ? localStorage.getItem('asaani_cart') : null
//     const cart = savedCart ? JSON.parse(savedCart) : []

//     const numericPrice = parseInt(service.price.replace(/[^0-9]/g, ''), 10) || 0

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

//     localStorage.setItem('asaani_cart', JSON.stringify(cart))

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
//         <Image
//           src="/pexels-mart-production-7641361.jpg"
//           alt="Electrical Services Banner"
//           fill
//           className="object-cover object-center z-0"
//           priority
//         />
//         <div className="absolute inset-0 bg-linear-to-r from-slate-950/85 via-slate-900/60 to-slate-950/85 z-10" />

//         <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 w-full text-white space-y-2">
//           <h1 className="text-4xl sm:text-5xl font-black tracking-tight">Electrical Services</h1>
//           <p className="text-sm sm:text-base text-slate-100 font-medium">
//             Safe, Certified & Professional Electrical Solutions For Your Home & Office!
//           </p>
//         </div>
//       </section>

//       {/* Services Section */}
//       <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
//         <div className="text-center mb-10">
//           <h2 className="text-xl sm:text-2xl font-semibold text-[#1E2342] tracking-tight">
//             Choose From Our Wide Range Of Electrical Services
//           </h2>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {electricalSubServices.map((item) => (
//             <div
//               key={item.id}
//               className="bg-[#EEF2FB] rounded-xl p-3 flex items-center gap-3.5 shadow-sm hover:shadow-md transition border border-slate-300/60"
//             >
//               <div className="relative w-20 h-20 bg-slate-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
//                 {item.image ? (
//                   <Image
//                     src={item.image}
//                     alt={item.title}
//                     fill
//                     className="object-cover"
//                   />
//                 ) : (
//                   <Zap className="w-8 h-8 text-slate-400" />
//                 )}
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
//             Best Electrical Services In Pakistan – Asaani Say
//           </h2>
//           <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
//             Whether You Need Complete House Rewiring, Switchboard Repair, Short-Circuit Fixes, Or Inverter & Generator Installations, Asaani Say Provides Certified Electricians To Handle All Repairs Safely And Efficiently.
//           </p>
//         </div>

//         <div className="space-y-2 pt-2">
//           <h3 className="text-xl sm:text-2xl font-extrabold text-[#1E2342]">
//             Why Professional Electrical Services Matter
//           </h3>
//           <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
//             Faulty Wiring, Overloaded Circuits, And Loose Switches Can Be Major Fire Hazards. Professional Electrical Service Ensures Proper Insulation, Voltage Balance, And Safe Installation Of All Home Fixtures.
//           </p>
//         </div>

//         <div className="space-y-3">
//           <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E2342]">
//             What Sets Us Apart
//           </h2>
//           <div className="space-y-2 text-xs sm:text-sm font-semibold text-slate-700">
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>24/7 Emergency Electrical Repairs</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>Trained, Verified & Certified Electricians</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>Fast Fault Tracing & Diagnostics</span>
//             </div>
//             <div className="flex items-center gap-2">
//               <span className="text-emerald-600 text-base">✅</span>
//               <span>Transparent Pricing – No Hidden Costs</span>
//             </div>
//           </div>
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

//             <div className="flex items-center gap-4 pt-1">
//               <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 shrink-0 bg-slate-100 flex items-center justify-center">
//                 {selectedService.image ? (
//                   <Image 
//                     src={selectedService.image} 
//                     alt={selectedService.title} 
//                     fill
//                     className="object-cover"
//                   />
//                 ) : (
//                   <Zap className="w-6 h-6 text-slate-400" />
//                 )}
//               </div>
//               <div className="space-y-1">
//                 <h4 className="text-xs sm:text-sm font-bold text-slate-900">{selectedService.title}</h4>
//                 <p className="text-xs font-bold text-[#EE6C52]">
//                   {selectedService.price}
//                 </p>
//               </div>
//             </div>

//             <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-between border border-slate-100 text-xs">
//               <div>
//                 <p className="font-bold text-slate-800">Quantity Selected</p>
//               </div>
//               <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-md px-2.5 py-1">
//                 <span className="text-slate-600 text-[11px]">Qty:</span>
//                 <span className="font-bold text-slate-900">{quantity}</span>
//               </div>
//             </div>

//             {/* Dynamic Total Price Calculation */}
//             <div className="flex items-center justify-between text-xs pt-1">
//               <span className="text-slate-500 font-medium">Cart Subtotal ({quantity} {quantity > 1 ? 'Items' : 'Item'})</span>
//               <span className="text-sm font-extrabold text-slate-900">
//                 Rs: {(parseInt(selectedService.price.replace(/[^0-9]/g, ''), 10) * quantity).toLocaleString()}
//               </span>
//             </div>

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
  return <ServiceCategoryView slug="electrician" />
}
