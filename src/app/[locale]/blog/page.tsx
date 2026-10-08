'use client';

import React, { useState } from 'react';
import { Link } from '@/i18n/navigation'
import Image from 'next/image';
import CustomerNavbar from '../components/customer-navbar';
import PublicContactBar from '../components/public-contact-bar';
import { useLanguage } from '../lib/i18n';
import PublicFooter from '../components/public-footer'

export default function BlogPage() {
  const { language, t } = useLanguage();
  const formatBlogDate = (value: string) => new Date(value).toLocaleDateString(language === 'ur' ? 'ur-PK' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const [currentPage, setCurrentPage] = useState(1);

  const featuredPost = {
    category: "HOME SHIFTING",
    readTime: "10 min read",
    title: "The Complete Relocation Checklist: How to Move Homes Without the Stress",
    excerpt: "Relocating to a new house is historically overwhelming. Asaani Say's ultimate shifting framework breaks the massive shifting task into daily effortless steps, guaranteeing a seamless handoff of your belongings.",
    author: "Thomas Schroeder",
    date: "March 18, 2026",
    avatar: "/assets/blog/author-home-shifting-truck-icon.png",
    image: "/assets/blog/home-shifting-relocation-checklist.png"
  };

  const latestArticles = [
    {
      id: 1,
      category: "PLUMBING TIPS",
      readTime: "5 min read",
      title: "5 Signs Your Home's Plumbing System Needs Urgent Repair",
      excerpt: "Hidden water leaks and low pressure can cost you thousands. Learn how to spot plumbing failures early and solve them quickly.",
      author: "Thomas Schroeder",
      date: "March 15, 2026",
      avatar: "/assets/blog/author-thomas-schroeder-avatar.png",
      image: "/assets/blog/plumbing-system-urgent-repair-signs.png"
    },
    {
      id: 2,
      category: "AC SERVICES",
      readTime: "7 min read",
      title: "The Ultimate AC Maintenance Guide for Pakistan's Hot Summers",
      excerpt: "Ensure your cooling system runs at peak efficiency. Simple DIY filter cleaning tricks and when to call a professional technician.",
      author: "Timothy Brake",
      date: "March 12, 2026",
      avatar: "/assets/blog/author-timothy-brake-avatar.png",
      image: "/assets/blog/ac-maintenance-guide-summer.png"
    },
    {
      id: 3,
      category: "ELECTRICAL",
      readTime: "6 min read",
      title: "Electrical Safety Hacks Every Homeowner Must Know",
      excerpt: "Flickering lights? Overloaded power outlets? Here is how to keep your family safe from common electrical hazards at home.",
      author: "Timothy Brake",
      date: "March 08, 2026",
      avatar: "/assets/blog/author-timothy-brake-avatar.png",
      image: "/assets/blog/electrical-safety-tips-homeowners.png"
    },
    {
      id: 4,
      category: "SOLAR ENERGY",
      readTime: "8 min read",
      title: "How to Transition Your Home to Clean Solar Energy Efficiently",
      excerpt: "Solar panels are changing energy in Pakistan. Discover the setup costs, net metering benefits, and peak efficiency seasons.",
      author: "Charlie Sinclair",
      date: "March 04, 2026",
      avatar: "/assets/blog/author-charlie-sinclair-avatar.png",
      image: "/assets/blog/clean-solar-energy-transition.png"
    },
    {
      id: 5,
      category: "CLEANING HACKS",
      readTime: "4 min read",
      title: "Deep Cleaning Hacks to Keep Kitchens Grease-Free",
      excerpt: "Grease and grime gather fast in active kitchens. Use these eco-friendly remedies and expert professional routines to sparkle.",
      author: "Nimra Raheel",
      date: "Feb 28, 2026",
      avatar: "/assets/blog/author-nimra-raheel-google-avatar.png",
      image: "/assets/blog/kitchen-deep-cleaning-tips.png"
    },
    {
      id: 6,
      category: "PEST CONTROL",
      readTime: "5 min read",
      title: "Pest Control: Safe and Natural Safeguards for Your Garden",
      excerpt: "Keep termites, pests, and insects far away from your precious living space using secure, child-safe professional treatments.",
      author: "Thomas Schroeder",
      date: "Feb 22, 2026",
      avatar: "/assets/blog/author-thomas-schroeder-avatar.png",
      image: "/assets/blog/pest-control-garden-safeguards.png"
    }
  ];

  return (
    <div className="w-full bg-white font-sans text-slate-800">
      
      
      <PublicContactBar />

      
      <CustomerNavbar active="blog" showLanguageSwitcher={false} />

      
      <section className="bg-[#3D4059] text-white py-14 md:py-[84px] px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <h1 className="font-bold tracking-tight text-[clamp(2.25rem,1.4rem+2vw,3.625rem)] leading-tight">
            {t("Our Blog")}</h1>
          <p className="text-white/90 leading-relaxed max-w-3xl mx-auto font-normal fs-p">
            {t("Tips, Guides & Expert Advice for Your Home Shifting, Repairs and Maintenance in Pakistan.")}</p>
        </div>
      </section>

      
      <main className="site-container mx-auto px-4 sm:px-6 py-12 md:py-[70px] space-y-16 md:space-y-[72px]">
        
        
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-0.5 bg-[#EE6C52]"></span>
            <h2 className="text-sm md:text-base font-bold text-[#1B2A59] uppercase tracking-wide">
              {t("FEATURED STORY")}</h2>
          </div>

          <div className="bg-[#EDF1FC] rounded-2xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-auto min-h-75 rounded-xl overflow-hidden">
              <img 
                src={featuredPost.image} 
                alt={t(featuredPost.title)}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="lg:col-span-5 py-2 lg:pe-2 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-[#EE6C52] text-white text-[11px] font-bold px-2.5 py-1.5 rounded-sm uppercase tracking-wider">
                    {t(featuredPost.category)}
                  </span>
                  <span className="text-sm text-slate-500 font-medium ms-auto">{t(featuredPost.readTime)}</span>
                </div>

                <h3 className="font-bold text-[#1B2A59] leading-snug text-[clamp(1.5rem,1.1rem+1.1vw,2.125rem)]">
                  {t(featuredPost.title)}
                </h3>

                <p className="text-slate-600 leading-relaxed font-normal text-base">
                  {t(featuredPost.excerpt)}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={featuredPost.avatar} 
                    alt={t(featuredPost.author)} 
                    className="w-12 h-12 object-contain"
                  />
                  <div>
                    <p className="font-bold text-slate-900 fs-p">{t(featuredPost.author)}</p>
                    <p className="text-slate-400 fs-p" dir="ltr">{formatBlogDate(featuredPost.date)}</p>
                  </div>
                </div>

                <button className="bg-[#FF7A1A] hover:bg-[#f06a0a] text-white text-base font-medium px-5 py-2.5 rounded-lg transition cursor-pointer">
                  {t("Read Article")}</button>
              </div>
            </div>
          </div>
        </section>

        
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-10 h-0.5 bg-[#EE6C52]"></span>
            <h2 className="text-sm md:text-base font-bold text-[#1B2A59] uppercase tracking-wide">
              {t("LATEST ARTICLES")}</h2>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <div 
                key={article.id} 
                className="bg-white rounded-xl p-3 border border-slate-200/70 flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  <div className="relative h-48 lg:h-[220px] overflow-hidden rounded-lg">
                    <img 
                      src={article.image} 
                      alt={t(article.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="pt-4 px-1 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#EE6C52] bg-[#FDECE8] px-2 py-1 rounded-sm tracking-wider uppercase text-[10px]">
                        {t(article.category)}
                      </span>
                      <span className="text-slate-400 font-medium">{t(article.readTime)}</span>
                    </div>

                    <h3 className="text-lg font-bold text-[#1B2A59] leading-snug group-hover:text-[#EE6C52] transition">
                      {t(article.title)}
                    </h3>

                    <p className="text-slate-500 leading-relaxed line-clamp-3 text-sm">
                      {t(article.excerpt)}
                    </p>
                  </div>
                </div>

                <div className="px-1 pb-2 pt-3 flex items-center gap-3 border-t border-slate-100 mt-3">
                  <img 
                    src={article.avatar} 
                    alt={t(article.author)} 
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">{t(article.author)}</p>
                    <p className="text-slate-400 text-xs" dir="ltr">{formatBlogDate(article.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <nav className="flex items-center justify-center gap-2 pt-6" aria-label={t('Pagination')}>
            {[
              { label: t('Prev'), page: Math.max(1, currentPage - 1) },
              { label: '1', page: 1 },
              { label: '2', page: 2 },
              { label: '3', page: 3 },
              { label: t('Next'), page: Math.min(3, currentPage + 1) },
            ].map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                type="button"
                onClick={() => setCurrentPage(item.page)}
                className={`min-w-10 h-10 px-3 rounded-md border text-sm font-semibold transition cursor-pointer ${
                  String(currentPage) === item.label
                    ? 'bg-slate-50 border-slate-200 text-[#1B2A59] text-base'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </section>

      </main>

      
      <section className="bg-[#7E839B] text-white py-14 md:py-[80px] px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="font-bold tracking-tight fs-h2">
              {t("Subscribe to Our Newsletter")}</h2>
            <p className="text-white/90 font-normal fs-p md:whitespace-nowrap">
              {t("Get the latest home care hacks, solar incentives, and shifting tips directly in your inbox.")}</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 max-w-[640px] mx-auto">
            <input 
              type="email" 
              placeholder={t("Address@gmail.com")} 
              className="w-full sm:flex-1 sm:min-w-0 px-4 py-3 rounded-lg bg-[#2B2D3B] text-white placeholder-slate-300 text-sm border border-[#EE6C52]/70 focus:outline-none focus:border-[#EE6C52]"
            />
            <button 
              type="submit" 
              className="bg-[#EF6A42] hover:bg-orange-600 text-white font-bold text-sm px-8 py-3 rounded-lg transition shadow-md cursor-pointer whitespace-nowrap"
            >
              {t("Subscribe Now")}</button>
          </form>
        </div>
      </section>

      
    <PublicFooter />

    </div>
  );
}