'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Hand, ShieldCheck, Sparkles } from 'lucide-react'
import { loginUser, registerCustomer, setStoredAuth } from '../../lib/booking-api'
import { PhoneInput, combinePhoneNumber } from '../../components/phone-input'
import { DEFAULT_COUNTRY_ISO, COUNTRY_CODES } from '../../lib/country-codes'

const DEFAULT_DIAL_CODE = COUNTRY_CODES.find((c) => c.iso === DEFAULT_COUNTRY_ISO)?.dial || '+92'

export default function CustomerAuthPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [phoneCountryCode, setPhoneCountryCode] = useState(DEFAULT_DIAL_CODE)
  const [address, setAddress] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleAuthSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    setError('')
    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setIsProcessing(true)
    try {
      const authResult = await (isRegister
        ? registerCustomer({ full_name: name, email, password, phone: phone ? combinePhoneNumber(phoneCountryCode, phone) : undefined, address: address || undefined })
        : loginUser({ identifier: emailOrPhone, password, role: 'customer' }))
      setStoredAuth('customer', authResult)
      window.dispatchEvent(new Event('asaani-auth-changed'))
      router.push('/customer/dashboard')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Authentication failed.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTabSwitch = (registerMode: boolean) => {
    setIsRegister(registerMode)
    setError('')
  }

  return (
    <div className="min-h-screen w-full bg-[#C7CBD1] font-sans overflow-hidden">
      <div className="min-h-[calc(100vh-40px)] w-full bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden">

        <div
          className="md:col-span-4 bg-[#3B3E56] text-white p-6 md:p-10 flex flex-col justify-between relative"
          style={{ minHeight: '35rem' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center relative">
              <Hand className="w-4 h-4 text-white" />
              <Sparkles className="w-2.5 h-2.5 text-white absolute -top-0.5 -right-0.5" />
            </div>
            <span className="font-bold text-base text-white">Asaani Say</span>
          </div>

          <div className="my-auto -translate-y-24 space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight">
              Welcome to <span className="text-orange-500">Asaani Say</span>
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed font-normal max-w-md">
              Book trusted home service professionals in minutes and track every job from your own dashboard.
            </p>

            <p className="text-[11px] text-slate-300 leading-relaxed font-normal max-w-md">
              Create an account to save your addresses, follow your bookings in real time, and keep a complete
              history of every service completed at your home.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-600/50 flex items-center gap-2 text-[10px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Secure, encrypted connections for all transactions.</span>
          </div>
        </div>

        <div className="md:col-span-8 bg-white p-6 md:p-12 flex flex-col justify-between min-h-screen overflow-y-auto">
          <div className="w-full max-w-sm mx-auto my-auto py-4">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleTabSwitch(false)}
                  className={`text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer ${
                    !isRegister
                      ? 'text-[#2C2F45] bg-orange-50/20'
                      : 'text-slate-400 hover:text-orange-500'
                  }`}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => handleTabSwitch(true)}
                  className={`text-xs font-bold px-5 py-2.5 rounded-xl border border-orange-500 transition cursor-pointer ${
                    isRegister
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-white text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Register
                </button>
              </div>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#2C2F45]">
                {isRegister ? 'Customer Sign Up' : 'Customer Sign In'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {isRegister
                  ? 'Create your account to start booking trusted home services.'
                  : 'Please enter your credentials to access your dashboard.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

              {isRegister ? (
                <>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />

                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />

                  <PhoneInput
                    countryCode={phoneCountryCode}
                    onCountryCodeChange={setPhoneCountryCode}
                    localNumber={phone}
                    onLocalNumberChange={setPhone}
                    placeholder="Phone number"
                    required
                  />

                  <textarea
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Home address"
                    className="min-h-20 w-full resize-none bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 pr-10 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? 'Creating account…' : 'Create account'}
                  </button>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter Email or Phone"
                    className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                  />

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 pr-10 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="text-right">
                    <a href="#" className="text-[11px] text-orange-500 hover:underline font-medium">
                      Recover Password ?
                    </a>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl text-xs transition shadow-md cursor-pointer disabled:opacity-60"
                  >
                    {isProcessing ? 'Signing in…' : 'Sign in'}
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
