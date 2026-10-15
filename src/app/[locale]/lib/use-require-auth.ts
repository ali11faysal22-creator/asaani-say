'use client'

import { useEffect, useState } from 'react'
import { useRouter } from '@/i18n/navigation'
import { AUTH_CHANGED_EVENT, getStoredAuth, type AuthRole } from './booking-api'

/**
 * Keeps a portal shell in step with the browser profile's single active account: if that role is
 * not signed in (never was, signed out, expired, or another account/role signed in from another
 * tab), send the visitor to the role's login page.
 *
 * Returns true once the role's login is confirmed. Shells render their pages only then, because a
 * child's effects run before this one and would otherwise call the API without a token.
 */
export function useRequireAuth(role: AuthRole, loginPath: string): boolean {
  const router = useRouter()
  const [authed, setAuthed] = useState(false)

  useEffect(() => {
    const check = () => {
      const signedIn = Boolean(getStoredAuth(role))
      setAuthed(signedIn)
      if (!signedIn) router.replace(loginPath)
    }
    check()
    window.addEventListener(AUTH_CHANGED_EVENT, check)
    window.addEventListener('storage', check)
    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, check)
      window.removeEventListener('storage', check)
    }
  }, [role, loginPath, router])

  return authed
}
