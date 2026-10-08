import createMiddleware from 'next-intl/middleware'
import { NextRequest } from 'next/server'
import { routing } from './i18n/routing'

const handleI18nRouting = createMiddleware(routing)

const URDU_ADMIN_PATH = /^\/ur(\/admin(?:\/.*)?)$/

export default function proxy(request: NextRequest) {
  const url = new URL(request.url)
  const urduAdmin = url.pathname.match(URDU_ADMIN_PATH)
  if (urduAdmin) return Response.redirect(new URL(urduAdmin[1], url), 307)
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('accept-language', 'en')
  if (/^(\/en)?\/admin(\/|$)/.test(url.pathname)) {
    // A saved Urdu preference must not bounce admin pages back to /ur/admin.
    const cookies = (request.headers.get('cookie') ?? '')
      .split(';')
      .map((part) => part.trim())
      .filter((part) => part && !part.startsWith('NEXT_LOCALE='))
    cookies.push('NEXT_LOCALE=en')
    requestHeaders.set('cookie', cookies.join('; '))
  }

  return handleI18nRouting(new NextRequest(request, { headers: requestHeaders }))
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
