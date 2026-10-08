'use client'

import { ApiError } from '@/app/lib/booking-api'
import { useLanguage } from '@/app/lib/i18n'

/** Field-level messages from a failed API call (empty when the error is not a validation error). */
export function fieldErrorsOf(error: unknown): Record<string, string> {
  return error instanceof ApiError ? error.fieldErrors : {}
}

/** User-facing summary for a failed call: the API message, or a fallback for unknown errors. */
export function messageOf(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback
}

/** Extra input classes that turn the border red while the field has an error. */
export function errorBorder(message?: string): string {
  return message ? '!border-red-400 focus:!border-red-500' : ''
}

/** Small red message shown directly under the input it belongs to. */
export function FieldError({ message, id, dark = false }: { message?: string; id?: string; dark?: boolean }) {
  const { t } = useLanguage()
  if (!message) return null
  return (
    <p id={id} role="alert" className={`mt-1.5 ps-1 text-[11px] font-medium leading-snug ${dark ? 'text-red-400' : 'text-red-600'}`}>
      {t(message)}
    </p>
  )
}

/** Same idea as errorBorder, for inputs that use a focus ring instead of a border. */
export function errorRing(message?: string): string {
  return message ? 'ring-2 ring-red-400' : ''
}
