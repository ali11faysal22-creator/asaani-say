'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { loginUser, setStoredAuth } from '@/app/lib/booking-api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsProcessing(true)
    try {
      const auth = await loginUser({ identifier: email, password, role: 'admin' })
      if (auth.role !== 'admin') throw new Error('This account does not have admin access.')
      setStoredAuth('admin', auth)
      router.push('/admin/dashboard')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Sign in failed.')
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
          <h1 className="text-xl font-extrabold text-white">Admin Sign In</h1>
          <p className="text-xs text-slate-400">Asaani Say platform administration</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-400">{error}</p>}

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@asaanisay.local"
              className="w-full bg-[#171923] border border-white/10 rounded-lg px-3.5 py-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="w-full bg-[#171923] border border-white/10 rounded-lg px-3.5 py-3 pr-10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-orange-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition shadow-md">
            {isProcessing ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
