'use client'
import React,{useState} from 'react'
import {Eye,EyeOff,} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { loginUser, registerCustomer } from '../../lib/booking-api'

export default function CustomerAuthPage(){
  const router = useRouter()
  const[isRegister, setIsRegister]=useState(false)
  const[showPassword, setShowPassword]=useState(false)
  const[emailOrPhone, setEmailOrPhone]=useState('')
  const[name,setName]=useState('')
  const[email,setEmail]=useState('')
  const[password,setPassword]=useState('')
  const[confirmPassword,setConfirmPassword]=useState('')
  const[isProcessing,setIsProcessing]=useState(false)
  const[error,setError]=useState('')

const handleAuthSubmit: React.SubmitEventHandler<HTMLFormElement>=async (e)=>{
  e.preventDefault()
  setError('')
  if (isRegister && password !== confirmPassword) {
    setError('Passwords do not match.')
    return
  }
  setIsProcessing(true)
  try {
    const authResult = await (isRegister
      ? await registerCustomer({ full_name: name, email, password })
      : await loginUser({ identifier: emailOrPhone, password, role: 'customer' }))
    localStorage.setItem('asaani_customer_auth', JSON.stringify(authResult))
    localStorage.removeItem('asaani_auth')
    window.dispatchEvent(new Event('asaani-auth-changed'))
    router.push('/')
  } catch (requestError) {
    setError(requestError instanceof Error ? requestError.message : 'Authentication failed.')
  } finally {
    setIsProcessing(false)
  }
}
  return (
    <div className="min-h-screen w-full bg-white flex items-center justify-center p-4 sm:p-8 font-sans">
      <div className="bg-white   w-full   grid grid-cols-1 md:grid-cols-2 p-8 md:p-14 gap-10 items-center">
        
        <div className="space-y-6 max-w-md">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#2C2F45]">
            {isRegister ? 'Sign up' : 'Login'}
          </h1>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2C2F45]">
              Welcome to <br />
              <span className="text-orange-500">Asaani Say</span>
            </h2>

            <p className="text-xs sm:text-sm text-black leading-relaxed font-medium">
              Here, we believe that building a strong professional network begins with your participation. We are delighted to offer a modern and user-friendly service to ensure you have the best experience.
            </p>
          </div>

          <div className="pt-2">
            {isRegister ? (
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className="text-xs sm:text-sm font-bold text-orange-500 hover:underline">
                Login
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className="text-xs sm:text-sm font-bold text-orange-500 hover:underline">
                Join Now!
              </button>
            )}
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto space-y-6">
        
          <div className="flex items-center justify-between">
           

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsRegister(false)}
                className={`text-xs font-bold px-4 py-2 rounded-xl transition ${
                  !isRegister
                    ? 'text-[#2C2F45]'
                    : 'text-slate-400 hover:text-orange-500'
                }`}>
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setIsRegister(true)}
                className={`text-xs font-bold px-4 py-2 rounded-xl border border-orange-500 shadow-sm transition ${
                  isRegister
                    ? 'bg-[#F8FAFC] text-[#2C2F45] border-orange-300'
                    : 'bg-white text-slate-500 hover:bg-slate-100'
        }`}
              >
                Register
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#2C2F45]">
              {isRegister ? 'Create your account' : 'Sign in'}
            </h3>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}
            {isRegister ? (
         
              <>
                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-slate-500">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ex: ABC"
                    className="w-full bg-[#F8FAFC] border border-slate-400/80 rounded-lg px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-slate-500">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ex: ABC@email.com"
                    className="w-full bg-[#F8FAFC] border border-slate-400/80 rounded-lg px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-orange-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-slate-500">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full bg-[#F8FAFC] border border-slate-400/80 rounded-lg px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-orange-400"/>
                </div>

                <div className="space-y-1">
                  <label className="text-[12px] font-medium text-slate-500">Confirm password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••"
                    className="w-full bg-[#F8FAFC] border border-slate-400/80 rounded-lg px-3 py-2.5 text-xs text-slate-700 placeholder:text-slate-300 focus:outline-none focus:border-orange-400"
                  />
                </div>

                <p className="text-[10px] text-slate-800 text-center pt-1">
                  Or Sign up with
                </p>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition shadow-md">
                  {isProcessing ? 'SAVING...' : 'SIGN UP'}
                </button>

                <p className="text-[10px] text-slate-400 text-center">
                  I understood the{' '}
                  <span className="text-orange-500 cursor-pointer hover:underline">
                    terms & policy
                  </span>
                  .
                </p>
              </>
            ) : (
              <>
                <div className="space-y-1">
                  <input
                    type="text"
                    required
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="Enter Email or Phone"
                    className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-lg px-3.5 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-400"/>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-[#F8FAFC] border border-slate-200/80 rounded-lg px-3.5 py-3 pr-10 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-400"/>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-right">
                  <a href="#" className="text-[11px] text-slate-400 hover:text-slate-600 font-medium">
                    Recover Password ?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-lg text-xs transition shadow-md">
                  {isProcessing ? 'Signing in...' : 'Sign in'}
                </button>

                <div className="text-center pt-2">
                  <span className="text-[10px] text-slate-800">Or Continue with</span>
                </div>
              </>
            )}
          </form>

      
          <div className="flex items-center justify-center gap-3 pt-1">
            <button className="w-10 h-10 rounded-full border border-slate-200/80 flex items-center justify-center shadow-sm hover:bg-slate-50 transition">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
            </button>

            <button className="w-10 h-10 rounded-full border border-slate-200/80 flex items-center justify-center shadow-sm hover:bg-slate-50 transition">
              <svg className="w-4 h-4 fill-[#1DA1F2]" viewBox="0 0 24 24">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
              </svg>
            </button>

    
            <button className="w-10 h-10 rounded-full border border-slate-200/80 flex items-center justify-center shadow-sm hover:bg-slate-50 transition">
              <svg className="w-4 h-4 fill-[#1877F2]" viewBox="0 0 24 24">
                <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.592 0 9 1.592 9 4.893V8z" />
              </svg>
            </button>


        <button className="w-10 h-10 rounded-full border border-slate-200/80 flex items-center justify-center shadow-sm hover:bg-slate-50 transition text-black">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">           
               <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.87c.68-.82 1.14-1.97.99-3.12-1 .04-2.21.67-2.9 1.48-.62.72-1.16 1.89-.99 3.01 1.12.09 2.26-.55 2.9-1.37z" />
          </svg>
          </button>
        </div>
        </div>

        </div>
    </div>
  )
}