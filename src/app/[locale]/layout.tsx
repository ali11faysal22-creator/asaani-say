import type { Metadata } from "next";
import { Poppins, Noto_Nastaliq_Urdu } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "./globals.css";
import CustomerRequestMonitor from './components/customer-request-monitor';
import AlertHost from '@/components/Alerts';
import { SITE_NAME, SITE_URL, getTranslator } from './lib/seo';
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
})

const notoNastaliqUrdu = Noto_Nastaliq_Urdu({
  variable: "--font-noto-nastaliq-urdu",
  subsets: ["arabic", "latin"],
  weight: "400",
})

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslator(hasLocale(routing.locales, locale) ? locale : routing.defaultLocale)
  return {
    metadataBase: new URL(SITE_URL),
    applicationName: SITE_NAME,
    // Pages that set their own title get "<title> | Asaani Say"; the rest fall back to the default.
    title: { default: t('Asaani Say - Home Services'), template: `%s | ${SITE_NAME}` },
    description: t('Book home services quickly and easily.'),
    other: { google: 'notranslate' },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)
  const messages = await getMessages()
  const t = await getTranslator(locale)

  return (
    <html
      lang={locale}
      dir={locale === 'ur' ? 'rtl' : 'ltr'}
      translate="no"
      className={`${poppins.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${locale === 'ur' ? notoNastaliqUrdu.className : poppins.className}`}>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[300] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-[#EE6C52] focus:shadow-lg"
        >
          {t('Skip to main content')}
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CustomerRequestMonitor />
          <AlertHost />
          <main id="main-content" className="flex-1">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}