'use client'

import React, { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
import { ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import { requestPasswordReset, resetPassword, type AuthRole } from '@/app/lib/booking-api'
import { FieldError, errorBorder, fieldErrorsOf } from '@/components/FieldError'
import { useLanguage } from '@/app/lib/i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher'

const RESEND_COOLDOWN_SECONDS = 60
const ROLES: AuthRole[] = ['customer', 'vendor', 'admin']

const inputClass =
  'w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition'
const primaryButtonClass =
  'w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-sm transition shadow-md cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'

function ForgotPasswordFlow() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role')

  const [step, setStep] = useState<'request' | 'reset' | 'done'>('request')
  // The account type comes from the login page the user clicked "Recover Password" on.
  const role: AuthRole = ROLES.includes(roleParam as AuthRole) ? (roleParam as AuthRole) : 'customer'
  const [identifier, setIdentifier] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [notice, setNotice] = useState('')
  const [devOtp, setDevOtp] = useState<string | null>(null)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((value) => value - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  useEffect(() => {
    if (step !== 'done') return
    const timer = window.setTimeout(() => router.push(`/${role}/login`), 2500)
    return () => window.clearTimeout(timer)
  }, [step, role, router])

  const requestErrorMessage = (err: unknown) => {
    const status = (err as { status?: number })?.status
    if (status === 429) return t('Please wait a minute before requesting another code')
    if (status === 422) return t('Please check the details you entered.')
    return t('Something went wrong. Please try again.')
  }

  const sendCode = async () => {
    setError('')
    setFieldErrors({})
    if (identifier.trim().length < 3) {
      setFieldErrors({ identifier: 'Enter your email or phone number.' })
      return
    }
    setIsProcessing(true)
    try {
      const response = await requestPasswordReset({ identifier: identifier.trim(), role })
      setNotice(t(response.message))
      setDevOtp(process.env.NODE_ENV !== 'production' ? response.dev_otp : null)
      setCooldown(RESEND_COOLDOWN_SECONDS)
      setStep('reset')
    } catch (err) {
      if ((err as { status?: number })?.status === 429) setCooldown(RESEND_COOLDOWN_SECONDS)
      const apiFieldErrors = fieldErrorsOf(err)
      if (Object.keys(apiFieldErrors).length) setFieldErrors(apiFieldErrors)
      else setError(requestErrorMessage(err))
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRequest = (event: React.FormEvent) => {
    event.preventDefault()
    void sendCode()
  }

  const handleResend = async () => {
    if (cooldown > 0 || isProcessing) return
    setOtp('')
    await sendCode()
  }

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    const problems: Record<string, string> = {}
    if (!/^\d{6}$/.test(otp)) problems.otp = 'Enter the 6-digit code.'
    if (newPassword.length < 8) problems.new_password = 'New password must be at least 8 characters.'
    else if (newPassword.length > 128) problems.new_password = 'New password must be at most 128 characters.'
    if (newPassword !== confirmPassword) problems.confirm_password = 'Passwords do not match.'
    setFieldErrors(problems)
    if (Object.keys(problems).length) return

    setIsProcessing(true)
    try {
      await resetPassword({ identifier: identifier.trim(), role, otp, new_password: newPassword })
      setStep('done')
    } catch (err) {
      const status = (err as { status?: number })?.status
      const apiFieldErrors = fieldErrorsOf(err)
      if (status === 400) setFieldErrors({ otp: 'Invalid or expired code. Please check the code or request a new one.' })
      else if (Object.keys(apiFieldErrors).length) setFieldErrors(apiFieldErrors)
      else setError(requestErrorMessage(err))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F7FD] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <Link href={`/${role}/login`} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-orange-500 transition">
            <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" /> {t('Back to sign in')}
          </Link>
          <LanguageSwitcher compact />
        </div>

        {step === 'done' ? (
          <div className="text-center space-y-3 py-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h1 className="text-xl font-extrabold text-[#2C2F45]">{t('Password updated. You can now log in with your new password.')}</h1>
            <p className="text-xs text-slate-500">{t('Redirecting to sign in…')}</p>
          </div>
        ) : (
          <>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-extrabold text-[#2C2F45]">
                {step === 'request' ? t('Forgot Password') : t('Reset Password')}
              </h1>
              <p className="text-xs text-slate-500">
                {step === 'request'
                  ? t('Enter your email or phone number and we will send you a verification code.')
                  : t('Enter the code we sent you and choose a new password.')}
              </p>
            </div>

            {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-600">{error}</p>}

            {step === 'request' ? (
              <form onSubmit={handleRequest} noValidate className="space-y-4">
                <input
                  type="text"
                  minLength={3}
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={t('Enter Email or Phone')}
                  className={`${inputClass} ${errorBorder(fieldErrors.identifier)}`}
                />
                <FieldError message={fieldErrors.identifier} />
                <button type="submit" disabled={isProcessing} className={primaryButtonClass}>
                  {isProcessing ? t('Sending…') : t('Send code')}
                </button>
              </form>
            ) : (
              <form onSubmit={handleReset} noValidate className="space-y-4">
                {notice && <p className="rounded-xl bg-emerald-50 px-3 py-2.5 text-xs font-semibold text-emerald-700">{notice}</p>}
                {devOtp && (
                  <p className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                    <span className="font-bold">{t('DEV ONLY')}</span> — {t('Verification code')}: <span className="font-mono font-bold" dir="ltr">{devOtp}</span>
                  </p>
                )}
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder={t('6-digit code')}
                  dir="ltr"
                  className={`${inputClass} ${errorBorder(fieldErrors.otp)} text-center tracking-[0.4em] font-bold`}
                />
                <FieldError message={fieldErrors.otp} />
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    minLength={8}
                    maxLength={128}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={t('New password')}
                    className={`${inputClass} ${errorBorder(fieldErrors.new_password)} pe-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute end-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    aria-label={showPassword ? t('Hide password') : t('Show password')}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <FieldError message={fieldErrors.new_password} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  minLength={8}
                  maxLength={128}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('Confirm password')}
                  className={`${inputClass} ${errorBorder(fieldErrors.confirm_password)}`}
                />
                <FieldError message={fieldErrors.confirm_password} />
                <button type="submit" disabled={isProcessing} className={primaryButtonClass}>
                  {isProcessing ? t('Updating…') : t('Update password')}
                </button>
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => { setStep('request'); setError(''); setOtp('') }}
                    className="font-semibold text-slate-500 hover:text-orange-500 transition cursor-pointer"
                  >
                    {t('Change email or phone')}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleResend()}
                    disabled={cooldown > 0 || isProcessing}
                    className="font-semibold text-orange-500 hover:underline disabled:text-slate-400 disabled:no-underline disabled:cursor-not-allowed cursor-pointer"
                  >
                    {cooldown > 0 ? `${t('Resend code in')} ${cooldown}s` : t('Resend code')}
                  </button>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ForgotPasswordFlow />
    </Suspense>
  )
}
