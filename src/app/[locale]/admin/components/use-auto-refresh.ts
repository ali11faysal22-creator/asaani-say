'use client'

import { useEffect, useRef } from 'react'

/** Re-invokes `callback` whenever the tab regains focus or becomes visible again. */
export function useAutoRefreshOnFocus(callback: () => void) {
  const callbackRef = useRef(callback)

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  useEffect(() => {
    const handle = () => {
      if (document.visibilityState === 'visible') callbackRef.current()
    }
    window.addEventListener('focus', handle)
    document.addEventListener('visibilitychange', handle)
    return () => {
      window.removeEventListener('focus', handle)
      document.removeEventListener('visibilitychange', handle)
    }
  }, [])
}
