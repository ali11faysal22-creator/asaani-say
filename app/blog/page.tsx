'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  
  Globe, 
  Hand, 
  Sparkles,
} from 'lucide-react';

export default function BlogPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const featuredPost = {
    category: "HOME SHIFTING",
    readTime: "10 min read",
    title: "The Complete Relocation Checklist: How to Move Homes Without the Stress",
    excerpt: "Relocating to a new house is notoriously overwhelming. Asaani Say's ultimate shifting framework breaks the massive shifting task into daily effortless steps, guaranteeing a seamless handoff of your belongings.",
    author: "Theresa Schroeder",
    date: "March 18, 2026",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
    image: "Featured Image.png"
  };

  const latestArticles = [
    {
      id: 1,
      category: "PLUMBING TIPS",
      readTime: "5 min read",
      title: "5 Signs Your Home's Plumbing System Needs Urgent Repair",
      excerpt: "Hidden water leaks and low pressure can cost you thousands. Learn how to spot plumbing failures early and order repair quickly.",
      author: "Theresa Schroeder",
      date: "March 15, 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      image: "Thumbnail.png"
    },
    {
      id: 2,
      category: "AC SERVICES",
      readTime: "7 min read",
      title: "The Ultimate AC Maintenance Guide for Pakistan's Hot Summers",
      excerpt: "Ensure your cooling system runs at peak efficiency. Simple DIY filter cleaning tricks and when to call a professional technician.",
      author: "Timothy Banks",
      date: "March 11, 2026",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      image: "Thumbnail (1).png"
    },
    {
      id: 3,
      category: "ELECTRICAL",
      readTime: "6 min read",
      title: "Electrical Safety Hacks Every Homeowner Must Know",
      excerpt: "Flickering lights? Overheated power outlets? Here is how to keep your family safe from common electrical hazards at home.",
      author: "Timothy Banks",
      date: "March 08, 2026",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
      image: "Thumbnail (2).png"
    },
    {
      id: 4,
      category: "SOLAR ENERGY",
      readTime: "8 min read",
      title: "How to Transition Your Home to Clean Solar Energy Efficiently",
      excerpt: "Solar panels are changing energy in Pakistan. Discover the setup costs, net metering benefits, and peak efficiency seasons.",
      author: "Charles Brouwer",
      date: "March 04, 2026",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop",
      image: "Thumbnail (3).png"
    },
    {
      id: 5,
      category: "HOUSE CLEANING",
      readTime: "4 min read",
      title: "Deep Cleaning Hacks to Keep Kitchens Grease-Free",
      excerpt: "Grease and grime gather fast in active kitchens. Use these eco-friendly remedies and expert professional routines to sparkle.",
      author: "Mirraj Al-Hasan",
      date: "March 01, 2026",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
      image: "Thumbnail (4).png"
    },
    {
      id: 6,
      category: "PEST CONTROL",
      readTime: "9 min read",
      title: "Pest Control: Safe and Natural Safeguards for Your Garden",
      excerpt: "Keep beneficial insects, and insects away from your precious living space using secure, eco-safe professional treatments.",
      author: "Theresa Schroeder",
      date: "Feb 25, 2026",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
      image: "Thumbnail (5).png"
    }
  ];

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-800">
      
      {/* 1. TOP BAR */}
      <div className="bg-[#EEF2FB] text-xs text-slate-600 py-2.5 px-4 md:px-12 flex justify-between items-center border-b border-slate-100">
        <div className="flex items-center gap-6">
          <span>AsaaniSay@gmail.com</span>
          <span className="border-l border-slate-300 pl-6">+1 (303) 000-9080</span>
        </div>
        <div className="flex items-center gap-3 text-slate-700">

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
          <Link href="/contact" className="hover:text-orange-500 transition">Contact Us</Link>
          <Link href="/blog" className="text-slate-900 font-bold hover:text-orange-500">Blog</Link>
        </nav>

        <Link href="/login">
          <button className="hidden md:inline-flex items-center gap-2 bg-[#3A3E59] hover:bg-[#2C2F45] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition shadow-sm cursor-pointer">
            <span>Get Started</span>
          </button>
        </Link>
      </header>

      {/* 3. HERO SECTION */}
      <section className="bg-[#3B3E5B] text-white pt-16 pb-20 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-3">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight">
            Our Blog
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-2xl mx-auto font-light">
            Tips, Guides & Expert Advice for Your Home Shifting, Repairs and Maintenance in Pakistan.
          </p>
        </div>
      </section>

      {/* 4. MAIN CONTENT CONTAINER */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        
        {/* FEATURED STORY SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-1 bg-[#EF6A42] rounded-full"></span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              FEATURED STORY
            </h2>
          </div>

          <div className="bg-[#EFF2F9] rounded-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200/60 shadow-sm">
            <div className="lg:col-span-6 relative h-64 sm:h-80 lg:h-auto min-h-75">
              <img 
                src={featuredPost.image} 
                alt={featuredPost.title}
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="bg-[#EF6A42] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                    {featuredPost.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">{featuredPost.readTime}</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                  {featuredPost.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                  {featuredPost.excerpt}
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
                    <p className="text-xs font-bold text-slate-900">{featuredPost.author}</p>
                    <p className="text-[11px] text-slate-400">{featuredPost.date}</p>
                  </div>
                </div>

                <button className="bg-[#EF6A42] hover:bg-orange-600 text-white text-xs font-bold px-5 py-2.5 rounded-lg transition shadow-sm cursor-pointer">
                  Read Article
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* LATEST ARTICLES SECTION */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="w-8 h-1 bg-[#EF6A42] rounded-full"></span>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              LATEST ARTICLES
            </h2>
          </div>

          {/* ARTICLES GRID */}
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
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#EF6A42] tracking-wider uppercase">
                        {article.category}
                      </span>
                      <span className="text-slate-400 font-medium">{article.readTime}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-[#EF6A42] transition">
                      {article.title}
                    </h3>

                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {article.excerpt}
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
                    <p className="text-[11px] font-bold text-slate-800">{article.author}</p>
                    <p className="text-[10px] text-slate-400">{article.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

       
        </section>

      </main>

      {/* 5. NEWSLETTER SECTION */}
      <section className="bg-[#616683] text-white py-14 px-6 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Subscribe to Our Newsletter
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 font-light">
              Get the latest home care hacks, solar incentives, and shifting tips directly in your inbox.
            </p>
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
              Subscribe Now
            </button>
          </form>
        </div>
      </section>

      {/* 6. FOOTER */}
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
                {/* navigation links */}
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
                  <a href="contact us" className="hover:text-orange-500 tansition">Contact Us</a>
                </li>

                  </ul>
                </div>
         {/* quicklinks        */}
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
  );
}