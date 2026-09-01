'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  ChevronDown, 
  Globe, 
  Hand, 
  Sparkles 
} from 'lucide-react';

export default function ContactPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      question: "How do I book a service provider through Asaani Say?",
      answer: "Simply click 'Get Started' to enter your location, select the home service required (plumbing, electrical, AC, etc.), select a convenient date/time, and confirm your booking. A verified specialist will be allocated swiftly."
    },
    {
      question: "Are all technicians background-checked and vetted?",
      answer: "Yes, absolute trust and security is our priority. Every technician undergoes strict background verification, professional screening, and capability testing before serving customers."
    },
    {
      question: "Is there standard pricing or do I need to bargain?",
      answer: "No bargaining is required. Asaani Say offers standard, highly transparent, and competitive pricing upfront. You will see exact costs before confirming your booking."
    },
    {
      question: "Can I cancel or reschedule my booking?",
      answer: "Yes. You can cancel or reschedule your booking free of charge up to 2 hours before the scheduled appointment through our portal or support team."
    }
  ];

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-800">
      
      {/* 1. TOP BAR */}
      <div className="bg-[#EEF2FB] text-xs text-slate-600 py-2.5 px-4 md:px-12 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-6">
          <span>AsaaniSay@gmail.com</span>
          <span className="border-l border-slate-300 pl-6">+1 (333) 000-00000</span>
        </div>
        <div className="flex items-center gap-3 text-slate-700">
          {/* <a href="#" className="hover:text-orange-500 transition">
            <Instagram className="w-4 h-4"/>
          </a> */}
          <a href="#" className="hover:text-orange-500 transition">
            <Globe className="w-4 h-4"/>
          </a>
        </div>
      </div>

      {/* 2. NAVBAR */}
      <header className="bg-white max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative">
            <Hand size={28} strokeWidth={2} className="text-black"/>
            <Sparkles size={14} strokeWidth={2} className="text-[#EF6A42] absolute -top-1 -right-1"/>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-extrabold text-xl tracking-tight text-orange-500">Asaani</span>
            <span className="font-bold text-lg tracking-tight -mt-1.5 text-orange-500">Say</span>
          </div>
        </Link>

        {/* NAV LINKS */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-orange-500 transition">Home</Link>
          <Link href="/about-us" className="hover:text-orange-500 transition">About Us</Link>
          <Link href="/services" className="hover:text-orange-500 transition">Services</Link>
          <Link href="/contact" className="text-slate-900 font-bold hover:text-orange-500">Contact Us</Link>
          <Link href="/blog" className="hover:text-orange-500 transition">Blog</Link>
        </nav>

        <Link href="/login">
          <button className="hidden md:inline-flex items-center gap-2 bg-[#3A3E59] hover:bg-[#2C2F45] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer">
            <span>Get Started</span>
          </button>
        </Link>
      </header>

      {/* 3. HERO SECTION */}
      <section className="bg-[#3B3E5B] text-white pt-16 pb-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Contact Our Team
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl mx-auto font-light">
            Have questions about bookings, service coverage, or custom requirements? Reach out to Asaani Say. We are ready to help you maintain your home swiftly and stress-free.
          </p>
        </div>
      </section>

      {/* 4. CONTACT CARDS (CLEAN OVERLAP FIX) */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 -mt-12 sm:-mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">CALL US</p>
              <p className="text-sm font-bold text-slate-900 mt-1">+1 (333) 000-00000</p>
              <p className="text-[11px] text-slate-600 leading-snug mt-2">Available Mon–Sat 9AM–6PM for quick assistance.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">EMAIL US</p>
              <p className="text-sm font-bold text-slate-900 mt-1 break-all">AsaaniSay@gmail.com</p>
              <p className="text-[11px] text-slate-600 leading-snug mt-2">Drop us an email anytime and we will respond within 24 hours.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">OFFICE ADDRESS</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Lahore, Pakistan</p>
              <p className="text-[11px] text-slate-600 leading-snug mt-2">Centrally located head office serving all major cities.</p>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">WORKING HOURS</p>
              <p className="text-sm font-bold text-slate-900 mt-1">Mon – Sat: 9AM – 6PM</p>
              <p className="text-[11px] text-slate-600 leading-snug mt-2">Sundays closed for routine maintenance upgrades.</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FORM & GOOGLE MAP SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* LEFT: FORM */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Send a Message</h2>
              <p className="text-xs text-slate-500 mt-1">Fill out the form below, and our team will get in touch with you shortly.</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="ENTER YOUR FULL NAME" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="YOUR EMAIL@GMAIL.COM" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Phone Number</label>
                  <input 
                    type="text" 
                    placeholder="ENTER YOUR PHONE NUMBER" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">Subject</label>
                  <input 
                    type="text" 
                    placeholder="HOW CAN WE HELP?" 
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">Your Message</label>
                <textarea 
                  rows={4} 
                  placeholder="DESCRIBE YOUR REQUEST OR HOME SERVICE NEEDS, TIME..." 
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50 resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                className="w-full bg-[#EF6A42] hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
              >
                Submit Message
              </button>
            </form>
          </div>

          {/* RIGHT: GOOGLE MAP */}
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Our Location</h2>
              <p className="text-xs text-slate-500 mt-1">Drop by our office in Lahore or find certified neighborhood professionals near you.</p>
            </div>

            <div className="w-full h-95 rounded-3xl overflow-hidden shadow-sm border border-slate-200 relative bg-slate-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d435514.4789596489!2d74.05419826315576!3d31.48310366057805!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39190483e58107d9%3A0xc23afd6dbb024165!2sLahore%2C%20Punjab%2C%20Pakistan!5e0!3m2!1sen!2s!4v1710000000000!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full"
              ></iframe>
            </div>
          </div>

        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="w-6 h-0.5 bg-orange-500"></span>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                COMMON QUESTIONS
              </span>
              <span className="w-6 h-0.5 bg-orange-500"></span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div 
                  key={index}
                  className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left px-6 py-4 flex justify-between items-center gap-4 text-xs sm:text-sm font-bold text-slate-800 hover:text-orange-500 transition cursor-pointer"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown 
                      className={`w-4 h-4 text-slate-500 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180 text-orange-500' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-200/40 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 7. FOOTER */}
      <footer className="w-full bg-[#393E58] text-slate-200 pt-16 pb-8 font-sans">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12">
            <div className="md:col-span-5 space-y-3">
              <p className="text-xs text-slate-300 tracking-wide font-normal">
                All your home maintenance and repair needs solved with trust, speed, and affordability.
              </p>
              <h2 className="text-3xl font-black text-orange-500 tracking-tight">
                Asaani Say
              </h2>
            </div>

            <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-3 text-xs gap-8">
              <div className="space-y-3">
                <h3 className="font-semibold text-white text-sm">Navigation</h3>
                <ul className="space-y-2 text-slate-300">
                  <li><Link href="/" className="hover:text-orange-500 transition">Home</Link></li>
                  <li><Link href="/about-us" className="hover:text-orange-500 transition">About Us</Link></li>
                  <li><Link href="/services" className="hover:text-orange-500 transition">Services</Link></li>
                  <li><Link href="/contact" className="hover:text-orange-500 transition">Contact Us</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-white">Quick Links</h3>
                <ul className="space-y-2 text-slate-300">
                  <li><Link href="#" className="hover:text-orange-500 transition">Privacy Policy</Link></li>
                  <li><Link href="#" className="hover:text-orange-500 transition">Terms Of Service</Link></li>
                  <li><Link href="#" className="hover:text-orange-500 transition">Disclaimer</Link></li>
                  <li><Link href="#" className="hover:text-orange-500 transition">FAQ</Link></li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-white">Contact Us</h3>
                <div className="space-y-2 text-slate-300 leading-relaxed">
                  <p>Our Support and Sales team is available 24/7 to answer your queries.</p>
                  <p className="pt-1 font-medium">+1 (333) 000-00000</p>
                 
                  <p className="font-medium">AsaaniSay@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200/40 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-300 gap-2">
            <p>Copyright © 2026 AsaaniSay. All rights reserved.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}