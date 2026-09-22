'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Counter from '../components/counter'; 
import CustomerNavbar from '../components/customer-navbar';
import { 
  CheckCircle2, 
  ShieldCheck,
  Zap,
  Clock,
  HeartHandshake,
  Camera,
  LayoutGrid
} from 'lucide-react';

export default function AboutUsPage() {
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

      
      <CustomerNavbar active="about" />

      
      <main className="space-y-20 py-12">
        
        
        <section className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-orange-500"></span>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                  WHO WE ARE
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
                Making Home Services <br />
                <span className="text-slate-900">Simple & Stress-Free</span>
              </h1>
              <p className="text-xs text-slate-600 leading-relaxed">
                At Asaani Say, we believe that maintaining a clean, functional, and comfortable home should never be a burden. We bridge the gap between skilled professionals and homeowners in Pakistan, delivering premium plumbing, electrical, AC work, cleaning, and solar services straight to your doorstep.
              </p>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our technology-driven platform pairs customers with fully vetted technicians. We are committed to transparency, punctuality, and uncompromising quality in every job completed.
              </p>
            </div>

            <div className="md:col-span-6">
              <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white">
                <img
                  src="Hero Image.png"
                  alt="Technician helping customer"
                  className="w-full h-85 object-cover"
                />
              </div>
            </div>

          </div>
        </section>

        
        <section className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-10">
            <div className="md:col-span-7 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-orange-500"></span>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                  OUR JOURNEY & CORE VALUES
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                The Values That Drive Us
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-xs text-slate-600 leading-relaxed">
                From simple repairs to Pakistan’s most trusted household platform, Asaani Say has always stood for safety, trust, and absolute customer convenience.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: 'Reliability & Vetting',
                desc: 'Every technician undergoes rigorous background checks and supervisor testing, ensuring you only receive trusted help.',
                icon: ShieldCheck
              },
              {
                title: 'Transparent Fair Pricing',
                desc: 'No hidden charges or stressful bargaining. Flat-rate standard pricing, competitive rates upfront.',
                icon: HeartHandshake
              },
              {
                title: 'Punctuality & Speed',
                desc: 'We value your time! Our service technicians show up promptly on time and complete the work swiftly.',
                icon: Clock
              },
              {
                title: 'Customer Dedication',
                desc: 'A dedicated support team working 24/7 to solve your queries and guarantee satisfaction.',
                icon: Zap
              }
            ].map((value, idx) => {
              const IconComp = value.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs space-y-3 hover:shadow-md transition">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{value.title}</h3>
                  <p className="text-[11px] text-slate-600 leading-relaxed">{value.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        
        <section className="bg-[#2D334A] text-white py-12">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-700/60">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-orange-400">
                <Counter value={32} />
              </p>
              <p className="text-[11px] text-slate-300 font-medium mt-1">Years Combined Experience</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-orange-400">
                <Counter value={249} />
              </p>
              <p className="text-[11px] text-slate-300 font-medium mt-1">Professional Verified Technicians</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-orange-400">
                <Counter value={2649} />
              </p>
              <p className="text-[11px] text-slate-300 font-medium mt-1">Happy Customers Served</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-orange-400">
                <Counter value={18} />
              </p>
              <p className="text-[11px] text-slate-300 font-medium mt-1">Cities Covered in Pakistan</p>
            </div>
          </div>
        </section>

        
        <section className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-10">
            <div className="md:col-span-7 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-orange-500"></span>
                <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                  OUR SPECIALIZED EXPERTS
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
                Meet Some of Our Best Technicians
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-xs text-slate-600 leading-relaxed">
                Experienced, reliable, and equipped with state-of-the-art tools to serve any residential project flawless.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: '01',
                name: 'Thomas Schroeder',
                role: 'Plumbing Service Lead',
                projects: '185 Completed Projects',
                desc: 'Expert in home diagnostics, master-level pipe installations and leakage repairs.',
                img: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=600&auto=format&fit=crop'
              },
              {
                id: '02',
                name: 'Timothy Drake',
                role: 'Electrical Systems Specialist',
                projects: '214 Completed Projects',
                desc: 'Specialist in residential wiring setup, complex split AC installation, and circuit repairs.',
                img: 'https://images.unsplash.com/photo-1611845103756-e06286422869?q=80&w=1228&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
              },
              {
                id: '03',
                name: 'Charlie Sinclair',
                role: 'Solar Panel Chief Specialist',
                projects: '310 Completed Projects',
                desc: 'Committed to clean energy efficiency installation and solar grid safety optimizations.',
                img: 'Rectangle.png'
              }
            ].map((tech) => (
              <div key={tech.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-xs space-y-4 pb-6">
                <div className="relative h-64 w-full bg-slate-100">
                  <span className="absolute top-3 left-3 bg-[#2D334A] text-white text-xs font-extrabold px-3 py-1 rounded-lg z-10">
                    {tech.id}
                  </span>
                  <img
                    src={tech.img}
                    alt={tech.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-5 space-y-1.5">
                  <h3 className="text-base font-bold text-slate-900">{tech.name}</h3>
                  <p className="text-xs font-semibold text-orange-500">{tech.role}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{tech.projects}</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    {tech.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        
        <section className="max-w-6xl mx-auto px-6">
          <div className="bg-[#0B132B] text-white rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-xl sm:text-2xl font-black">
                Need Premium Help at Your Home?
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Book a professional, certified, and fully vetted technician with just a single tap. High standards, punctual service, and fair pricing.
              </p>
            </div>
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs px-6 py-3.5 rounded-xl shadow-lg transition whitespace-nowrap"
            >
              Get Started Now
            </Link>
          </div>
        </section>

      </main>

      
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
  );
}