'use client';
import React, { useState } from 'react';
import { Link } from '@/i18n/navigation'
import {
  ChevronDown,
} from 'lucide-react';
import CustomerNavbar from '../components/customer-navbar';
import PublicContactBar from '../components/public-contact-bar';
import { useLanguage } from '../lib/i18n';
import { submitContactMessage } from '../lib/booking-api';
import PublicFooter from '../components/public-footer'

export default function ContactPage() {
  const { t } = useLanguage();
  const [closedFaqs, setClosedFaqs] = useState<number[]>([]);

  const toggleFaq = (index: number) => {
    setClosedFaqs((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [contactStatus, setContactStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [contactMessage, setContactMessage] = useState('');

  const updateContactField = (field: keyof typeof contactForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setContactForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setContactMessage('');
    if (!contactForm.fullName || !contactForm.email || !contactForm.subject || !contactForm.message) {
      setContactStatus('error');
      setContactMessage(t('Please fill in your name, email, subject, and message.'));
      return;
    }
    setContactStatus('submitting');
    try {
      await submitContactMessage({
        full_name: contactForm.fullName,
        email: contactForm.email,
        phone: contactForm.phone || undefined,
        subject: contactForm.subject,
        message: contactForm.message,
      });
      setContactStatus('success');
      setContactMessage(t('Message sent! Our team will get back to you shortly.'));
      setContactForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setContactStatus('error');
      setContactMessage(error instanceof Error ? error.message : t('Something went wrong. Please try again.'));
    }
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
    <div className="w-full bg-white font-sans text-slate-800">
      
      
      <PublicContactBar />

      
      <CustomerNavbar active="contact" showLanguageSwitcher={false} />

      
      <section className="bg-[#3D4059] text-white py-14 md:py-[72px] px-6 text-center">
        <div className="max-w-[820px] mx-auto space-y-4">
          <h1 className="font-bold tracking-tight text-[clamp(2.25rem,1.4rem+2vw,3.625rem)] leading-tight">
            {t("Contact Our Team")}</h1>
          <p className="text-white/90 leading-relaxed mx-auto font-normal fs-p">
            {t("Have questions about bookings, service coverage, or custom requirements? Reach out to Asaani Say. We are ready to help you maintain your home swiftly and stress-free.")}</p>
        </div>
      </section>

      
      <section className="site-container mx-auto px-6 pt-10 md:pt-[42px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          
          
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(45,51,74,0.08)] space-y-4">
            <img src="/assets/contact-us/icons/phone-icon.png" alt="" aria-hidden="true" className="w-14 h-14" />
            <div>
              <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wider">{t("CALL US")}</p>
              <p className="font-bold text-[#1B2A59] mt-2 text-xl md:text-2xl leading-snug">+1 (303) 000-9080</p>
              <p className="text-slate-500 leading-snug mt-2 text-sm">{t("Available Mon–Sat 9AM–6PM for quick assistance.")}</p>
            </div>
          </div>

          
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(45,51,74,0.08)] space-y-4">
            <img src="/assets/contact-us/icons/email-icon.png" alt="" aria-hidden="true" className="w-14 h-14" />
            <div>
              <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wider">{t("EMAIL US")}</p>
              <p className="font-bold text-[#1B2A59] mt-2 text-lg md:text-xl lg:text-[1.35rem] leading-snug break-words">{t("AsaaniSay@gmail.com")}</p>
              <p className="text-slate-500 leading-snug mt-2 text-sm">{t("Drop us an email anytime and we will respond within 24 hours.")}</p>
            </div>
          </div>

          
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(45,51,74,0.08)] space-y-4">
            <img src="/assets/contact-us/icons/location-icon.png" alt="" aria-hidden="true" className="w-14 h-14" />
            <div>
              <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wider">{t("OFFICE ADDRESS")}</p>
              <p className="font-bold text-[#1B2A59] mt-2 text-xl md:text-2xl leading-snug">{t("Lahore, Pakistan")}</p>
              <p className="text-slate-500 leading-snug mt-2 text-sm">{t("Centrally located head office serving all major cities.")}</p>
            </div>
          </div>

          
          <div className="bg-white rounded-xl p-6 shadow-[0_4px_20px_rgba(45,51,74,0.08)] space-y-4">
            <img src="/assets/contact-us/icons/working-hours-icon.png" alt="" aria-hidden="true" className="w-14 h-14" />
            <div>
              <p className="text-xs md:text-sm font-semibold text-slate-600 uppercase tracking-wider">{t("WORKING HOURS")}</p>
              <p className="font-bold text-[#1B2A59] mt-2 text-xl md:text-2xl leading-snug">{t("Mon – Sat: 9AM – 6PM")}</p>
              <p className="text-slate-500 leading-snug mt-2 text-sm">{t("Sundays closed for routine maintenance upgrades.")}</p>
            </div>
          </div>

        </div>
      </section>

      
      <section className="site-container mx-auto px-6 pt-12 md:pt-[64px] pb-16 md:pb-[100px]">
        <div className="grid grid-cols-1 lg:grid-cols-[1.16fr_1fr] gap-10 lg:gap-[60px] items-start">
          
          
          <div className="bg-white rounded-xl p-6 sm:p-10 border border-slate-100 shadow-[0_4px_24px_rgba(45,51,74,0.06)] space-y-6">
            <div>
              <h2 className="font-bold text-[#1B2A59] text-[clamp(1.5rem,1.2rem+0.9vw,2rem)]">{t("Send a Message")}</h2>
              <p className="text-slate-500 mt-2 text-sm">{t("Fill out the form below, and our team will get in touch with you shortly.")}</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-5 text-sm">
              {contactMessage && (
                <p
                  className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                    contactStatus === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {t(contactMessage)}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 text-sm">{t("Full Name")}</label>
                  <input
                    type="text"
                    required
                    value={contactForm.fullName}
                    onChange={updateContactField('fullName')}
                    placeholder={t('John Doe')}
                    className="w-full px-3.5 py-3 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-[#EE6C52] transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 text-sm">{t("Email Address")}</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={updateContactField('email')}
                    placeholder={t('john@example.com')}
                    className="w-full px-3.5 py-3 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-[#EE6C52] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 text-sm">{t("Phone Number")}</label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={updateContactField('phone')}
                    placeholder={t('+92 300 0000000')}
                    className="w-full px-3.5 py-3 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-[#EE6C52] transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-800 text-sm">{t("Subject")}</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={updateContactField('subject')}
                    placeholder={t('How can we help?')}
                    className="w-full px-3.5 py-3 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-[#EE6C52] transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-800 text-sm">{t("Your Message")}</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={updateContactField('message')}
                  placeholder={t('Describe your request or home service needs here…')}
                  className="w-full px-3.5 py-3 rounded-md border border-slate-300 bg-white text-slate-800 placeholder:text-slate-500 focus:outline-none focus:border-[#EE6C52] transition resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={contactStatus === 'submitting'}
                className="w-full bg-[#EE6C52] hover:bg-[#e0583d] disabled:opacity-60 text-white font-bold py-3.5 rounded-md transition cursor-pointer"
              >
                {contactStatus === 'submitting' ? t('Sending…') : t('Submit Message')}
              </button>
            </form>
          </div>

          
          <div className="space-y-4">
            <div>
              <h2 className="font-bold text-[#1B2A59] text-[clamp(1.5rem,1.2rem+0.9vw,2rem)]">{t("Our Location")}</h2>
              <p className="text-slate-500 mt-2 text-sm">{t("Drop by our office in Lahore or find certified neighborhood professionals near you.")}</p>
            </div>

            <div className="w-full h-80 lg:h-[390px] rounded-lg overflow-hidden border border-slate-200 relative bg-slate-100">
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

      
      <section className="bg-[#EDF1FC] py-14 md:py-[80px]">
        <div className="site-container mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="w-10 h-0.5 bg-[#EE6C52]"></span>
              <span className="text-xs font-semibold text-[#EE6C52] uppercase tracking-[0.15em]">
                {t("COMMON QUESTIONS")}</span>
            </div>
            <h2 className="font-bold text-[#1B2A59] fs-h2">
              {t("Frequently Asked Questions")}</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = !closedFaqs.includes(index);
              return (
                <div 
                  key={index}
                  className="bg-white rounded-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className={`w-full text-start px-6 pt-5 flex justify-between items-center gap-4 text-base font-semibold text-[#1B2A59] transition cursor-pointer ${isOpen ? 'pb-2' : 'pb-5'}`}
                  >
                    <span className="font-semibold">{t(faq.question)}</span>
                    <ChevronDown 
                      className={`w-4 h-4 text-[#EE6C52] transition-transform duration-200 shrink-0 ${
                        isOpen ? '' : '-rotate-90'
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">
                      {t(faq.answer)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      
      <PublicFooter />

    </div>
  );
}