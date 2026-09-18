'use client'

import { COUNTRY_CODES } from '../lib/country-codes'

export function combinePhoneNumber(dial: string, localNumber: string): string {
  const cleaned = localNumber.trim().replace(/[\s-]/g, '').replace(/^0+/, '')
  return cleaned ? `${dial}${cleaned}` : ''
}

const DEFAULT_MAX_LOCAL_DIGITS = 10

export function PhoneInput({
  countryCode,
  onCountryCodeChange,
  localNumber,
  onLocalNumberChange,
  placeholder = 'Phone number',
  required = false,
  maxDigits = DEFAULT_MAX_LOCAL_DIGITS,
}: {
  countryCode: string
  onCountryCodeChange: (dial: string) => void
  localNumber: string
  onLocalNumberChange: (value: string) => void
  placeholder?: string
  required?: boolean
  maxDigits?: number
}) {
  return (
    <div className="flex w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white focus-within:border-orange-500 transition">
      <select
        value={countryCode}
        onChange={(e) => onCountryCodeChange(e.target.value)}
        aria-label="Country code"
        className="shrink-0 border-r border-slate-200/90 bg-slate-50 px-2 py-3 text-xs text-slate-700 focus:outline-none cursor-pointer"
      >
        {COUNTRY_CODES.map((country) => (
          <option key={country.iso} value={country.dial}>
            {country.iso} {country.dial}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="numeric"
        required={required}
        value={localNumber}
        onChange={(e) => onLocalNumberChange(e.target.value.replace(/\D/g, '').slice(0, maxDigits))}
        placeholder={placeholder}
        className="w-full min-w-0 px-3 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none"
      />
    </div>
  )
}
