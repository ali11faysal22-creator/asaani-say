'use client';
import React, { useState } from 'react';
import { Link } from '@/i18n/navigation'
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  ChevronDown,
} from 'lucide-react';
import CustomerNavbar from '../components/customer-navbar';
import PublicContactBar from '../components/public-contact-bar';
import { useLanguage } from '../lib/i18n';
import { submitContactMessage } from '../lib/booking-api';
import PublicFooter from '../components/public-footer'

export default function ContactPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
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
      setContactMessage('Please fill in your name, email, subject, and message.');
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
      setContactMessage("Message sent! Our team will get back to you shortly.");
      setContactForm({ fullName: '', email: '', phone: '', subject: '', message: '' });
    } catch (error) {
      setContactStatus('error');
      setContactMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
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
    <div className="w-full bg-slate-50 font-sans text-slate-800">
      
      
      <PublicContactBar />

      
      <CustomerNavbar active="contact" showLanguageSwitcher={false} />

      
      <section className="bg-[#3B3E5B] text-white pt-16 pb-24 px-6 text-center">
        <div className="max-w-3xl mx-auto space-y-4">
          <h1 className="font-extrabold tracking-tight fs-h2">
            {t("Contact Our Team")}</h1>
          <p className="text-slate-200 leading-relaxed max-w-2xl mx-auto font-light fs-p">
            {t("Have questions about bookings, service coverage, or custom requirements? Reach out to Asaani Say. We are ready to help you maintain your home swiftly and stress-free.")}</p>
        </div>
      </section>

      
      <section className="relative z-10 max-w-6xl mx-auto px-6 -mt-12 sm:-mt-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("CALL US")}</p>
              <p className="font-bold text-slate-900 mt-1 fs-p">+1 (333) 000-00000</p>
              <p className="text-slate-600 leading-snug mt-2 fs-p">{t("Available Mon–Sat 9AM–6PM for quick assistance.")}</p>
            </div>
          </div>

          
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("EMAIL US")}</p>
              <p className="font-bold text-slate-900 mt-1 break-all fs-p">{t("AsaaniSay@gmail.com")}</p>
              <p className="text-slate-600 leading-snug mt-2 fs-p">{t("Drop us an email anytime and we will respond within 24 hours.")}</p>
            </div>
          </div>

          
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("OFFICE ADDRESS")}</p>
              <p className="font-bold text-slate-900 mt-1 fs-p">{t("Lahore, Pakistan")}</p>
              <p className="text-slate-600 leading-snug mt-2 fs-p">{t("Centrally located head office serving all major cities.")}</p>
            </div>
          </div>

          
          <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-100 space-y-3">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("WORKING HOURS")}</p>
              <p className="font-bold text-slate-900 mt-1 fs-p">{t("Mon – Sat: 9AM – 6PM")}</p>
              <p className="text-slate-600 leading-snug mt-2 fs-p">{t("Sundays closed for routine maintenance upgrades.")}</p>
            </div>
          </div>

        </div>
      </section>

      
      <section className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="font-bold text-slate-900 fs-h4">{t("Send a Message")}</h2>
              <p className="text-slate-500 mt-1 fs-p">{t("Fill out the form below, and our team will get in touch with you shortly.")}</p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
              {contactMessage && (
                <p
                  className={`text-xs font-semibold px-3 py-2 rounded-lg ${
                    contactStatus === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                  }`}
                >
                  {contactMessage}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t("Full Name")}</label>
                  <input
                    type="text"
                    required
                    value={contactForm.fullName}
                    onChange={updateContactField('fullName')}
                    placeholder="ENTER YOUR FULL NAME"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t("Email Address")}</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={updateContactField('email')}
                    placeholder="YOUR EMAIL@GMAIL.COM"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t("Phone Number")}</label>
                  <input
                    type="text"
                    value={contactForm.phone}
                    onChange={updateContactField('phone')}
                    placeholder="ENTER YOUR PHONE NUMBER"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700">{t("Subject")}</label>
                  <input
                    type="text"
                    required
                    value={contactForm.subject}
                    onChange={updateContactField('subject')}
                    placeholder="HOW CAN WE HELP?"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700">{t("Your Message")}</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={updateContactField('message')}
                  placeholder="DESCRIBE YOUR REQUEST OR HOME SERVICE NEEDS, TIME..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-orange-500 transition bg-slate-50/50 resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={contactStatus === 'submitting'}
                className="w-full bg-[#EF6A42] hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-md cursor-pointer"
              >
                {contactStatus === 'submitting' ? 'Sending…' : 'Submit Message'}
              </button>
            </form>
          </div>

          
          <div className="lg:col-span-6 space-y-4">
            <div>
              <h2 className="font-bold text-slate-900 fs-h4">{t("Our Location")}</h2>
              <p className="text-slate-500 mt-1 fs-p">{t("Drop by our office in Lahore or find certified neighborhood professionals near you.")}</p>
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

      
      <section className="bg-white py-16 border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center gap-2">
              <span className="w-6 h-0.5 bg-orange-500"></span>
              <span className="text-xs font-bold text-orange-500 uppercase tracking-wider">
                {t("COMMON QUESTIONS")}</span>
              <span className="w-6 h-0.5 bg-orange-500"></span>
            </div>
            <h2 className="font-black text-slate-900 fs-h2">
              {t("Frequently Asked Questions")}</h2>
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
                    className="w-full text-start px-6 py-4 flex justify-between items-center gap-4 text-xs sm:text-sm font-bold text-slate-800 hover:text-orange-500 transition cursor-pointer"
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

      
      <PublicFooter />

    </div>
  );
}