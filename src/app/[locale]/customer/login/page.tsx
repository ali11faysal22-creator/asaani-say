'use client'

import React, { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { Eye, EyeOff, Hand, ShieldCheck, Sparkles } from 'lucide-react'
import { createCustomerAddress, fetchAddresses, loginUser, registerCustomer, setStoredAuth } from '../../lib/booking-api'
import { PhoneInput, combinePhoneNumber } from '../../components/phone-input'
import { LocationPicker } from '../../components/location-picker'
import { DEFAULT_COUNTRY_ISO, COUNTRY_CODES } from '../../lib/country-codes'
import { readPendingServiceBooking } from '../../lib/service-booking-resume'
import { useLanguage } from '../../lib/i18n'
import { FieldError, errorBorder, fieldErrorsOf, messageOf } from '@/components/FieldError'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const DEFAULT_DIAL_CODE = COUNTRY_CODES.find((c) => c.iso === DEFAULT_COUNTRY_ISO)?.dial || '+92'

export default function CustomerAuthPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_DIAL_CODE)
  const [address, setAddress] = useState('')
  const [homeLatitude, setHomeLatitude] = useState(31.5204)
  const [homeLongitude, setHomeLongitude] = useState(74.3587)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleAuthSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    if (isRegister) {
      const problems: Record<string, string> = {}
      if (password.length < 8) problems.password = 'Password must be at least 8 characters.'
      if (password !== confirmPassword) problems.confirm_password = 'Passwords do not match.'
      if (Object.keys(problems).length) {
        setFieldErrors(problems)
        return
      }
    }
    setIsProcessing(true)
    let accountCreated = false
    try {
      const authResult = isRegister
        ? await registerCustomer({
            full_name: name,
            email,
            password,
            phone: phone ? combinePhoneNumber(phoneCountryCode, phone) : undefined,
            address: address || undefined,
            latitude: homeLatitude,
            longitude: homeLongitude,
          })
        : await loginUser({ identifier: emailOrPhone, password, role: 'customer' })
      accountCreated = isRegister
      setStoredAuth('customer', authResult)
      if (isRegister && address.trim() && authResult.profile_id) {
        const savedAddresses = await fetchAddresses(authResult.profile_id)
        const normalizedAddress = address.trim().replace(/\s+/g, ' ').toLowerCase()
        const addressAlreadySaved = savedAddresses.some((savedAddress) => (
          savedAddress.line.trim().replace(/\s+/g, ' ').toLowerCase() === normalizedAddress
          || Math.abs(savedAddress.latitude - homeLatitude) < 0.0001
            && Math.abs(savedAddress.longitude - homeLongitude) < 0.0001
        ))

        if (!addressAlreadySaved) {
          await createCustomerAddress({
            customer_id: authResult.profile_id,
            label: 'Home',
            line: address.trim(),
            latitude: homeLatitude,
            longitude: homeLongitude,
            is_default: savedAddresses.length === 0,
          })
        }
      }
      window.dispatchEvent(new Event('asaani-auth-changed'))
      const pendingBooking = readPendingServiceBooking()
      if (pendingBooking) {
        router.push(`/services/${pendingBooking.slug}`)
      } else {
        router.push('/customer/dashboard')
      }
    } catch (requestError) {
      if (accountCreated) {
        setIsRegister(false)
        setEmailOrPhone(email)
        setError(t('Your account was created, but your Home address could not be saved. Please sign in and try again.'))
      } else {
        const apiFieldErrors = fieldErrorsOf(requestError)
        if (Object.keys(apiFieldErrors).length) {
          setFieldErrors(apiFieldErrors)
          setError('Please correct the highlighted fields.')
        } else {
          setError(messageOf(requestError, 'Authentication failed.'))
        }
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTabSwitch = (registerMode: boolean) => {
    setIsRegister(registerMode)
    setError('')
    setFieldErrors({})
  }

  return (
    <div className="min-h-screen w-full bg-[#C7CBD1] font-sans overflow-hidden">
      <div className="min-h-[calc(100vh-40px)] w-full bg-white grid grid-cols-1 lg:grid-cols-12 overflow-hidden">

        <div
          className="hidden lg:flex lg:col-span-4 bg-[#3B3E56] text-white p-10 flex-col justify-between relative"
          style={{ minHeight: '35rem' }}
        >
          <Link href="/" aria-label={t('Go to home page')} className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center relative">
              <Hand className="w-4 h-4 text-white" />
              <Sparkles className="w-2.5 h-2.5 text-white absolute -top-0.5 -end-0.5" />
            </div>
            <span className="font-bold text-base text-white">{t('Asaani Say')}</span>
          </Link>

          <div className="my-auto -translate-y-24 space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight">
              {t('Welcome to')} <span className="text-orange-500">{t('Asaani Say')}</span>
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed font-normal max-w-md">
              {t('Book trusted home service professionals in minutes and track every job from your own dashboard.')}
            </p>

            <p className="text-[11px] text-slate-300 leading-relaxed font-normal max-w-md">
              {t('Create an account to save your addresses, follow your bookings in real time, and keep a complete history of every service completed at your home.')}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-600/50 flex items-center gap-2 text-[10px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
            <span>{t('Secure, encrypted connections for all transactions.')}</span>
          </div>
        </div>

        <div className="lg:col-span-8 bg-white p-6 md:p-12 flex flex-col justify-between min-h-screen overflow-y-auto">
          <div className="flex items-center justify-between lg:justify-end">
            <Link href="/" aria-label={t('Go to home page')} className="flex items-center gap-2 lg:hidden">
              <div className="relative"><Hand size={28} strokeWidth={2} className="text-black" /><Sparkles size={14} strokeWidth={2} className="text-orange-500 absolute -top-1 -end-1" /></div>
              <div className="flex flex-col leading-tight"><span className="font-extrabold text-xl tracking-tight text-orange-500">{t('Asaani')}</span><span className="font-bold text-lg tracking-tight -mt-1.5 text-orange-500">{t('Say')}</span></div>
            </Link>
            <LanguageSwitcher compact />
          </div>
          <div className="w-full max-w-sm mx-auto my-auto py-4">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTabSwitch(false)}
                  className={`text-base font-medium px-6 py-3 rounded-xl transition cursor-pointer ${
                    !isRegister
                      ? 'bg-[#FF6A00] text-white'
                      : 'text-slate-400 hover:text-[#FF6A00]'
                  }`}
                >
                  {t('Sign in')}
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSwitch(true)}
                  className={`text-base font-medium px-6 py-3 rounded-xl transition cursor-pointer ${
                    isRegister
                      ? 'bg-[#FF6A00] text-white'
                      : 'text-slate-400 hover:text-[#FF6A00]'
                  }`}
                >
                  {t('Register')}
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#2C2F45]">
                {isRegister ? t('Customer Sign Up') : t('Customer Sign In')}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isRegister
                  ? t('Create your account to start booking trusted home services.')
                  : t('Please enter your credentials to access your dashboard.')}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{t(error)}</p>}

              {isRegister ? (
                <>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t('Full name')}
                    className={`w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition ${errorBorder(fieldErrors.full_name)}`}
                  />
                  <FieldError message={fieldErrors.full_name} />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('Email address')}
                    className={`w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition ${errorBorder(fieldErrors.email)}`}
                  />
                  <FieldError message={fieldErrors.email} />

                  <PhoneInput
                    countryCode={phoneCountryCode}
                    onCountryCodeChange={setPhoneCountryCode}
                    localNumber={phone}
                    onLocalNumberChange={setPhone}
                    placeholder={t('Phone number')}
                    required
                    fieldId="customer-phone"
                  />
                  <FieldError message={fieldErrors.phone} />

                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder={t('Home address')}
                    className="min-h-20 w-full resize-none bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />
                  <FieldError message={fieldErrors.address} />

                  <LocationPicker
                    label={t('Confirm your location on the map')}
                    hint={t('Drag the pin, or tap anywhere on the map, to pin your address exactly — this helps us match you with nearby vendors.')}
                    latitude={homeLatitude}
                    longitude={homeLongitude}
                    onAddressResolved={({ address }) => setAddress(address)}
                    onLocationChange={(lat, lng) => { setHomeLatitude(lat); setHomeLongitude(lng) }}
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('Password')}
                      className={`w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 pe-10 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition ${errorBorder(fieldErrors.password)}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <FieldError message={fieldErrors.password} />

                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('Confirm password')}
                    className={`w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition ${errorBorder(fieldErrors.confirm_password)}`}
                  />
                  <FieldError message={fieldErrors.confirm_password} />

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? t('Creating account…') : t('Create account')}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder={t('Enter Email or Phone')}
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('Password')}
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 pe-10 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-end">
                    <Link href="/forgot-password?role=customer" className="text-xs text-[#FF6A00] hover:underline font-medium">
                      {t('Recover Password ?')}
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? t('Signing in…') : t('Sign in')}
                  </button>
                </>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
