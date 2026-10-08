'use client'

import React, { useState } from 'react'
import { Link, useRouter } from '@/i18n/navigation'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { loginUser, setStoredAuth } from '@/app/lib/booking-api'
import { useLanguage } from '../../lib/i18n'
import { FieldError, errorBorder, fieldErrorsOf, messageOf } from '@/components/FieldError'

export default function AdminLoginPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const problems: Record<string, string> = {}
    if (!email.trim()) problems.identifier = 'Email is required.'
    if (!password) problems.password = 'Password is required.'
    setFieldErrors(problems)
    if (Object.keys(problems).length) return
    setIsProcessing(true)
    try {
      const auth = await loginUser({ identifier: email, password, role: 'admin' })
      if (auth.role !== 'admin') throw new Error('This account does not have admin access.')
      setStoredAuth('admin', auth)
      router.push('/admin/dashboard')
    } catch (requestError) {
      const apiFieldErrors = fieldErrorsOf(requestError)
      setFieldErrors(Object.keys(apiFieldErrors).length ? apiFieldErrors : { password: messageOf(requestError, 'Sign in failed.') })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#171923] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-sm bg-[#1F2233] border border-white/10 rounded-2xl shadow-2xl p-8 space-y-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/15 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-orange-500" />
          </div>
          <h1 className="text-xl font-extrabold text-white">{t('Admin Sign In')}</h1>
          <p className="text-xs text-slate-400">{t('Asaani Say platform administration')}</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">{t('Email')}</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@asaanisay.local"
              className={`w-full bg-[#171923] border border-white/10 rounded-lg px-3.5 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-400 ${errorBorder(fieldErrors.identifier)}`}
            />
            <FieldError dark message={fieldErrors.identifier} />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">{t('Password')}</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className={`w-full bg-[#171923] border border-white/10 rounded-lg px-3.5 py-3 pe-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-400 ${errorBorder(fieldErrors.password)}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute end-3 top-3 text-slate-500 hover:text-slate-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <FieldError dark message={fieldErrors.password} />
          </div>

          <div className="text-end">
            <Link href="/forgot-password?role=admin" className="text-xs text-orange-400 hover:underline font-medium">
              {t('Recover Password ?')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition shadow-md">
            {isProcessing ? t('Signing in...') : t('Sign in')}
          </button>
        </form>
      </div>
    </div>
  )
}
