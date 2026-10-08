import type { Metadata } from "next";
import { Poppins, Noto_Nastaliq_Urdu } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import "./globals.css";
import CustomerRequestMonitor from './components/customer-request-monitor';
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

// Same hashing as phraseKey() in ./lib/i18n (which is a client module).
function phraseKey(text: string): string {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `p_${(hash >>> 0).toString(36)}`
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const title = 'Asaani Say - Home Services'
  const description = 'Book home services quickly and easily.'
  if (!hasLocale(routing.locales, locale) || locale === 'en') return { title, description }
  const messages = (await getMessages({ locale })) as { Common?: Record<string, string> }
  const common = messages.Common ?? {}
  return {
    title: common[phraseKey(title)] ?? title,
    description: common[phraseKey(description)] ?? description,
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

  return (
    <html
      lang={locale}
      dir={locale === 'ur' ? 'rtl' : 'ltr'}
      className={`${poppins.variable} ${notoNastaliqUrdu.variable} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${locale === 'ur' ? notoNastaliqUrdu.className : poppins.className}`}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CustomerRequestMonitor />
          <main className="flex-1">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}