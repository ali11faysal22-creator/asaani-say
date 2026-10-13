import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

// Baseline browser protections for every page. No CSP yet: the inline JSON-LD and
// Leaflet/OpenStreetMap tiles need a tailored policy, which is a separate task.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(self)' },
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    cpus: 2,
    webpackMemoryOptimizations: true,
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

export default withNextIntl(nextConfig)
