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
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
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
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
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
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
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
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
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
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
      image: "/assets/blog/clean-solar-energy-transition.png"
    },
    {
      id: 5,
      category: "HOUSE CLEANING",
      readTime: "4 min read",
      title: "Deep Cleaning Hacks to Keep Kitchens Grease-Free",
      excerpt: "Grease and grime gather fast in active kitchens. Use these eco-friendly remedies and expert professional routines to sparkle.",
      author: "Nimra Raheel",
      date: "Feb 28, 2026",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
      image: "/assets/blog/kitchen-deep-cleaning-tips.png"
    },
    {
      id: 6,
      category: "PEST CONTROL",
      readTime: "9 min read",
      title: "Pest Control: Safe and Natural Safeguards for Your Garden",
      excerpt: "Keep termites, pests, and insects far away from your precious living space using secure, child-safe professional treatments.",
      author: "Thomas Schroeder",
      date: "Feb 22, 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      image: "/assets/blog/pest-control-garden-safeguards.png"
    }
  ];

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-800">
      
      
      <PublicContactBar />

      
      <CustomerNavbar active="blog" showLanguageSwitcher={false} />

      
      <section className="bg-[#3B3E5B] text-white pt-16 pb-20 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <h1 className="font-extrabold tracking-tight fs-h2">
            {t("Our Blog")}</h1>
          <p className="text-slate-200 leading-relaxed max-w-2xl mx-auto font-light fs-p">
            {t("Tips, Guides & Expert Advice for Your Home Shifting, Repairs and Maintenance in Pakistan.")}</p>
        </div>
      </section>

      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        
        
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-1 bg-[#EF6A42] rounded-full"></span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t("FEATURED STORY")}</h2>
          </div>

          <div className="bg-[#EFF2F9] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/60 shadow-sm">
            <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-auto min-h-75">
              <img 
                src={featuredPost.image} 
                alt={t(featuredPost.title)}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-[#EF6A42] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {t(featuredPost.category)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{t(featuredPost.readTime)}</span>
                </div>

                <h3 className="font-bold text-slate-900 leading-snug fs-h3">
                  {t(featuredPost.title)}
                </h3>

                <p className="text-slate-600 leading-relaxed font-normal fs-p">
                  {t(featuredPost.excerpt)}
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <img 
                    src={featuredPost.avatar} 
                    alt={featuredPost.author} 
                    className="w-9 h-9 rounded-full object-cover border border-slate-200"
                  />
                  <div>
                    <p className="font-bold text-slate-900 fs-p">{featuredPost.author}</p>
                    <p className="text-slate-400 fs-p" dir="ltr">{formatBlogDate(featuredPost.date)}</p>
                  </div>
                </div>

                <button className="bg-[#EF6A42] hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-sm cursor-pointer">
                  {t("Read Article")}</button>
              </div>
            </div>
          </div>
        </section>

        
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-1 bg-[#EF6A42] rounded-full"></span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {t("LATEST ARTICLES")}</h2>
          </div>

          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestArticles.map((article) => (
              <div 
                key={article.id} 
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/70 shadow-sm flex flex-col justify-between hover:shadow-md transition group"
              >
                <div>
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={article.image} 
                      alt={t(article.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#EF6A42] tracking-wider uppercase">
                        {t(article.category)}
                      </span>
                      <span className="text-slate-400 font-medium">{t(article.readTime)}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#EF6A42] transition">
                      {t(article.title)}
                    </h3>

                    <p className="text-slate-500 leading-relaxed line-clamp-3 fs-p">
                      {t(article.excerpt)}
                    </p>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center gap-3 border-t border-slate-100 mt-2">
                  <img 
                    src={article.avatar} 
                    alt={article.author} 
                    className="w-7 h-7 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-slate-800 fs-p">{article.author}</p>
                    <p className="text-slate-400 fs-p" dir="ltr">{formatBlogDate(article.date)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

       
        </section>

      </main>

      
      <section className="bg-[#616683] text-white py-14 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="font-extrabold tracking-tight fs-h2">
              {t("Subscribe to Our Newsletter")}</h2>
            <p className="text-slate-200 font-light fs-p">
              {t("Get the latest home care hacks, solar incentives, and shifting tips directly in your inbox.")}</p>
          </div>

          <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Address@gmail.com" 
              className="flex-1 px-4 py-3 rounded-lg bg-[#3A3E56] text-white placeholder-slate-400 text-xs border border-slate-500/30 focus:outline-none focus:border-orange-500"
            />
            <button 
              type="submit" 
              className="bg-[#EF6A42] hover:bg-orange-600 text-white font-bold text-xs px-6 py-3 rounded-lg transition shadow-md cursor-pointer whitespace-nowrap"
            >
              {t("Subscribe Now")}</button>
          </form>
        </div>
      </section>

      
    <PublicFooter />

    </div>
  );
}