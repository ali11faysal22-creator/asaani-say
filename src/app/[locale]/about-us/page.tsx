'use client';

import React from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/navigation'
import Counter from '../components/counter'; 
import CustomerNavbar from '../components/customer-navbar'
import { BreadcrumbBar } from '@/components/Breadcrumbs';
import PublicContactBar from '../components/public-contact-bar'
import { useLanguage } from '../lib/i18n'
import PublicFooter from '../components/public-footer'

export default function AboutUsPage() {
  const { t } = useLanguage()
  return (
    <div className="w-full bg-white font-sans text-slate-800">
      
      
      <PublicContactBar />

      
      <CustomerNavbar active="about" showLanguageSwitcher={false} />
      <BreadcrumbBar />

      
      <main>
        
        
        <section className="site-container mx-auto px-6 py-12 md:py-[100px]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            
            <div className="md:col-span-6 space-y-4">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-orange-500"></span>
                <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  {t('WHO WE ARE')}
                </span>
              </div>
              <h1 className="font-semibold text-[#2D334A] leading-tight text-[clamp(2rem,1.2rem+2.2vw,3.625rem)]">
                {t('Making Home Services')} <br />
                <span className="text-slate-900">{t('Simple & Stress-Free')}</span>
              </h1>
              <p className="text-slate-600 leading-relaxed fs-p">
                {t('At Asaani Say, we believe that maintaining a clean, functional, and comfortable home should never be a burden. We bridge the gap between skilled, trusted professionals and homeowners in Pakistan, delivering premier plumbing, electrical, AC repair, cleaning, and solar services straight to your doorstep.')}
              </p>
              <p className="text-slate-600 leading-relaxed fs-p">
                {t('Our technology-driven platform allows instant booking with fully vetted technicians. We are committed to transparency, punctuality, and uncompromising quality in every job completion.')}
              </p>
            </div>

            <div className="md:col-span-6">
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src="/assets/about-us/about-us-hero.png"
                  alt={t("Technician helping customer")}
                  className="w-full h-64 sm:h-80 lg:h-[500px] object-cover"
                />
              </div>
            </div>

          </div>
        </section>

        
        <section className="bg-[#EDF1FC] py-12 md:py-[100px]">
        <div className="site-container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-10 md:mb-[60px]">
            <div className="md:col-span-7 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-orange-500"></span>
                <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  {t('OUR JOURNEY & CORE VALUES')}
                </span>
              </div>
              <h2 className="font-semibold text-slate-900 fs-h2">
                {t('The Values That Drive Us')}
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-slate-600 leading-relaxed fs-p">
                {t('From a simple idea to Pakistan’s most trusted household platform, Asaani Say has always stood for safety, trust, and absolute customer convenience.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(4,minmax(0,322px))] gap-4 lg:gap-6 justify-start">
            {[
              {
                title: 'Reliability & Vetting',
                desc: 'Every technician undergoes rigorous background checks and capability testing, ensuring you only receive expert help.'
              },
              {
                title: 'Transparent Fair Pricing',
                desc: 'No hidden charges or stressful bargaining. We offer standardized, competitive rates up front.'
              },
              {
                title: 'Punctuality & Speed',
                desc: 'We value your schedule. Our service providers show up precisely on time and complete the work swiftly.'
              },
              {
                title: 'Customer Dedication',
                desc: 'A completely responsive support team working 24/7 to solve your queries and guarantee satisfaction.'
              }
            ].map((value, idx) => {
              return (
                <div key={idx} className="bg-white rounded-xl p-6 shadow-[0_2px_12px_rgba(45,51,74,0.06)] space-y-3 hover:shadow-md transition">
                  <img src="/assets/about-us/icons/value-checkmark-icon.png" alt="" aria-hidden="true" className="w-12 h-12" />
                  <h3 className="text-lg md:text-xl font-bold text-[#2D334A] leading-snug">{t(value.title)}</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">{t(value.desc)}</p>
                </div>
              );
            })}
          </div>
        </div>
        </section>

        
        <section className="bg-[#3D4059] text-white py-12 md:py-20">
          <div className="site-container mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-white/15">
            <div className="pt-4 md:pt-0 md:ps-8 first:md:ps-0">
              <p className="font-semibold text-[#EE6C52] text-[clamp(2rem,1.4rem+1.6vw,3.5rem)] leading-tight">
                <Counter value={32} />
              </p>
              <p className="text-white/90 font-normal mt-2 text-sm md:text-base">{t('Years Combined Experience')}</p>
            </div>
            <div className="pt-4 md:pt-0 md:ps-8 first:md:ps-0">
              <p className="font-semibold text-[#EE6C52] text-[clamp(2rem,1.4rem+1.6vw,3.5rem)] leading-tight">
                <Counter value={249} />
              </p>
              <p className="text-white/90 font-normal mt-2 text-sm md:text-base">{t('Professional Vetted Technicians')}</p>
            </div>
            <div className="pt-4 md:pt-0 md:ps-8 first:md:ps-0">
              <p className="font-semibold text-[#EE6C52] text-[clamp(2rem,1.4rem+1.6vw,3.5rem)] leading-tight">
                <Counter value={2649} />
              </p>
              <p className="text-white/90 font-normal mt-2 text-sm md:text-base">{t('Happy Customers Served')}</p>
            </div>
            <div className="pt-4 md:pt-0 md:ps-8 first:md:ps-0">
              <p className="font-semibold text-[#EE6C52] text-[clamp(2rem,1.4rem+1.6vw,3.5rem)] leading-tight">
                <Counter value={18} />
              </p>
              <p className="text-white/90 font-normal mt-2 text-sm md:text-base">{t('Cities covered in Pakistan')}</p>
            </div>
          </div>
        </section>

        
        <section className="bg-[#EDF1FC] py-12 md:py-[100px]">
        <div className="site-container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-10 md:mb-[60px]">
            <div className="md:col-span-7 space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-0.5 bg-orange-500"></span>
                <span className="text-sm font-bold text-orange-500 uppercase tracking-wider">
                  {t('OUR SPECIALIZED EXPERTS')}
                </span>
              </div>
              <h2 className="font-semibold text-slate-900 fs-h2">
                {t('Meet Some of Our Best Technicians')}
              </h2>
            </div>
            <div className="md:col-span-5">
              <p className="text-slate-600 leading-relaxed fs-p">
                {t('Experienced, reliable, and equipped with state-of-the-art tools to serve any residential project flawlessly.')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: '01',
                name: 'Thomas Schroeder',
                role: 'Plumbing Service Lead',
                projects: '199 Completed Projects',
                desc: 'Expert in home diagnostics, master-level pipes installations, and leakage resolutions.',
                img: '/assets/about-us/technician-thomas-schroeder-numbered.png'
              },
              {
                id: '02',
                name: 'Timothy Brake',
                role: 'Electrical & AC Master',
                projects: '184 Completed Projects',
                desc: 'Specialist in residential solar setup, complex split AC installation, and circuit designs.',
                img: '/assets/about-us/technician-timothy-brake-numbered.png'
              },
              {
                id: '03',
                name: 'Charlie Sinclair',
                role: 'Solar Panel Chief Specialist',
                projects: '210 Completed Projects',
                desc: 'Committed to clean energy efficiency installation and solar grid safety optimizations.',
                img: '/assets/about-us/technician-charlie-sinclair-numbered.png'
              }
            ].map((tech) => (
              <div key={tech.id} className="bg-white rounded-xl shadow-sm space-y-4 p-3 pb-6">
                <div className="relative aspect-399/420 w-full bg-white rounded-lg overflow-hidden">
                  <img
                    src={tech.img}
                    alt={t(tech.name)}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="px-5 space-y-1.5">
                  <h3 className="fs-h4 font-bold text-slate-900">{t(tech.name)}</h3>
                  <p className="font-semibold text-orange-500 fs-p">{t(tech.role)}</p>
                  <p className="text-slate-400 font-medium fs-p">{t(tech.projects)}</p>
                  <p className="text-slate-500 leading-relaxed pt-1 fs-p">
                    {t(tech.desc)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        </section>

        
        <section className="site-container mx-auto px-6 py-12 md:py-[100px]">
          <div className="bg-[#0B132B] text-white rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div className="space-y-2 max-w-xl">
              <h2 className="font-semibold fs-h3">
                {t('Need Premium Help at Your Home?')}
              </h2>
              <p className="text-slate-300 leading-relaxed fs-p">
                {t('Book professional, certified, and fully vetted technicians with just a single tap. High satisfaction, punctual arrival, and fair pricing.')}
              </p>
            </div>
            <Link
              href="/login"
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-base px-6 py-3.5 rounded-xl shadow-lg transition md:whitespace-nowrap"
            >
              {t('Get Started Now')}
            </Link>
          </div>
        </section>

      </main>

      
      <PublicFooter />
    </div>
  );
}