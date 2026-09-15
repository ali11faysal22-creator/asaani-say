'use client'

import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Wrench,
  ShieldCheck,
  Plus,
  X,
  CheckCircle2,
  Loader2,
  Camera,
  Check,
  Calendar,
  Clock,
  ArrowLeft
} from 'lucide-react'
import { API_BASE, fetchVendorProfile, formatSlotLabel, getStoredAuth, updateVendorProfile, uploadVendorProfileImage, type VendorProfileResponse } from '@/app/lib/booking-api'
import UnsavedChangesGuard from '../components/unsaved-changes-guard'

interface DaySchedule {
  day: string
  slots: string[]
}

interface VendorProfileData {
  vendorId: string
  firstName: string
  lastName: string
  totalCompletedJobs: number
  memberSince: string
  businessName: string
  email: string
  phone: string
  postalCode: string
  cnic: string
  experienceYears: string
  mainCategory: string
  selectedSubServices: string[]
  serviceAreas: string[]
  selectedDays: string[]
  selectedTimeSlots: string[]
  dayWiseSchedule: DaySchedule[]
  bio: string
  contactPreferences: string[]
}

export default function VendorProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getInitialAvatar = (): string => {
    if (typeof window === 'undefined') {
      return '/Worker.png'
    }

    return '/Worker.png'
  }

  const getInitialProfile = (): VendorProfileData => ({
      vendorId: '#AS-PENDING',
      firstName: '',
      lastName: '',
      totalCompletedJobs: 0,
      memberSince: 'New Vendor',
      businessName: '',
      email: '',
      phone: '',
      postalCode: '',
      cnic: '',
      experienceYears: '',
      mainCategory: 'Electrician & Plumbing Services',
      selectedSubServices: [],
      serviceAreas: [],
      selectedDays: [],
      selectedTimeSlots: [],
      dayWiseSchedule: [],
      bio: '',
      contactPreferences: []
  })

  const [avatar, setAvatar] = useState<string>(getInitialAvatar)
  const [profile, setProfile] = useState<VendorProfileData>(getInitialProfile)
  const [savedProfile, setSavedProfile] = useState('')
  const [profileReady, setProfileReady] = useState(false)

  useEffect(() => {
    const hydrateProfileFromBackend = async () => {
      try {
        if (typeof window === 'undefined') return
        const auth = getStoredAuth('vendor')
        if (!auth || auth.role !== 'vendor') {
          router.push('/vendor/login')
          return
        }

        const vendorId = auth.profile_id || auth.user_id
        const vendorDetail = await fetchVendorProfile(vendorId)
        if (vendorDetail) {
          const availability = vendorDetail.availability || []
          const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
          setProfile((prev) => {
            const next = {
            ...prev,
            vendorId: vendorDetail.id,
            firstName: vendorDetail.first_name,
            lastName: vendorDetail.last_name,
            businessName: vendorDetail.business_name || prev.businessName,
            email: vendorDetail.email || prev.email,
            phone: vendorDetail.contact_number || prev.phone,
            postalCode: vendorDetail.postal_code || prev.postalCode,
            cnic: vendorDetail.cnic || prev.cnic,
            experienceYears: vendorDetail.experience_years || prev.experienceYears,
            serviceAreas: vendorDetail.service_areas || [],
            contactPreferences: vendorDetail.contact_preferences || [],
            bio: vendorDetail.bio || '',
            totalCompletedJobs: vendorDetail.completed_jobs,
            memberSince: new Date(vendorDetail.member_since).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
            mainCategory: (vendorDetail.categories || []).join(', '),
            selectedSubServices: vendorDetail.services || [],
            selectedDays: availability
              .map((row: VendorProfileResponse['availability'][number]) => Number(row.day_of_week))
              .filter((day) => Number.isInteger(day) && day >= 0 && day < dayNames.length)
              .map((day) => dayNames[day]),
            dayWiseSchedule: availability.map((row: VendorProfileResponse['availability'][number]) => ({
              day: dayNames[Number(row.day_of_week)] || String(row.day_of_week),
              slots: row.is_full_day ? ['Full Day'] : [`${formatSlotLabel(row.start_time || '09:00')} - ${formatSlotLabel(row.end_time || '17:00')}`]
            })),
            }
            setSavedProfile(JSON.stringify(next))
            return next
          })
          setProfileReady(true)
          if (vendorDetail.profile_image_url) {
            setAvatar(vendorDetail.profile_image_url.startsWith('/') ? `${API_BASE}${vendorDetail.profile_image_url}` : vendorDetail.profile_image_url)
          }
        }
      } catch (error) {
        console.warn('Backend vendor profile could not be hydrated; falling back to stored profile object.', error)
      }
    }

    hydrateProfileFromBackend()
  }, [router])

  const [newAreaInput, setNewAreaInput] = useState('')
  const [showAddAreaInput, setShowAddAreaInput] = useState(false)

  const [toast, setToast] = useState<{
    show: boolean
    message: string
    type: 'saving' | 'success'
  }>({ show: false, message: '', type: 'success' })
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const auth = getStoredAuth('vendor')
    if (!file || !auth?.profile_id) return
    try {
      setToast({ show: true, message: 'Uploading profile picture...', type: 'saving' })
      const updatedVendor = await uploadVendorProfileImage(auth.profile_id, file)
      const imageUrl = updatedVendor.profile_image_url
        ? updatedVendor.profile_image_url.startsWith('/') ? `${API_BASE}${updatedVendor.profile_image_url}` : updatedVendor.profile_image_url
        : '/Worker.png'
      setAvatar(imageUrl)
      setToast({ show: true, message: 'Profile picture saved successfully!', type: 'success' })
    } catch (error) {
      setToast({ show: true, message: error instanceof Error ? error.message : 'Unable to upload profile picture', type: 'success' })
    }
  }
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('asaani_vendor_auth')
    }
    router.push('/vendor/login')
  }
  const handleSaveChanges = async () => {
    setToast({ show: true, message: 'Saving profile details...', type: 'saving' })
    try {
      const auth = getStoredAuth('vendor')
      if (!auth?.profile_id) throw new Error('Vendor session expired')
      if (!profile.email || !profile.cnic || !profile.experienceYears || !profile.postalCode || profile.serviceAreas.length === 0) {
        throw new Error('Contact email, CNIC, experience, postal code, and at least one service area are required')
      }
      const updated = await updateVendorProfile(auth.profile_id, {
        first_name: profile.firstName,
        last_name: profile.lastName,
        business_name: profile.businessName,
        contact_number: profile.phone,
        postal_code: profile.postalCode,
        email: profile.email,
        cnic: profile.cnic,
        experience_years: profile.experienceYears,
        service_areas: profile.serviceAreas,
        contact_preferences: profile.contactPreferences,
        bio: profile.bio,
      })
      const updatedMemberSince = new Date(updated.member_since).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
      setProfile((prev) => ({ ...prev, totalCompletedJobs: updated.completed_jobs, memberSince: updatedMemberSince }))
      setSavedProfile(JSON.stringify({ ...profile, totalCompletedJobs: updated.completed_jobs, memberSince: updatedMemberSince }))
      setToast({ show: true, message: 'Profile saved successfully!', type: 'success' })
      setTimeout(() => setToast((prev) => ({ ...prev, show: false })), 3000)
    } catch (error) {
      setToast({ show: true, message: error instanceof Error ? error.message : 'Unable to save profile', type: 'success' })
    }
  }
  const handleAddServiceArea = () => {
    if (!newAreaInput.trim()) return
    if (profile.serviceAreas.includes(newAreaInput.trim())) {
      alert('This area is already added!')
      return
    }
    setProfile((prev) => ({ ...prev, serviceAreas: [...prev.serviceAreas, newAreaInput.trim()] }))
    setNewAreaInput('')
    setShowAddAreaInput(false)
  }

  const handleRemoveServiceArea = (areaToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      serviceAreas: prev.serviceAreas.filter((a) => a !== areaToRemove)
    }))
  }

  const toggleContactPref = (option: string) => {
    setProfile((prev) => {
      const exists = prev.contactPreferences.includes(option)
      return {
        ...prev,
        contactPreferences: exists
          ? prev.contactPreferences.filter((item) => item !== option)
          : [...prev.contactPreferences, option]
      }
    })
  }

  const profileIsDirty = profileReady && JSON.stringify(profile) !== savedProfile

  return (
    <div className="min-h-screen w-full bg-white grid grid-cols-1 md:grid-cols-12 font-sans relative overflow-x-hidden">
      <UnsavedChangesGuard isDirty={profileIsDirty} onSave={handleSaveChanges} />
      
      
      {toast.show && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-[#2C2F45] text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3">
            {toast.type === 'saving' ? (
              <Loader2 className="w-4 h-4 text-[#EE6C52] animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <span>{toast.message}</span>
            <button
              onClick={() => setToast((prev) => ({ ...prev, show: false }))}
              className="ml-2 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      
      <div className="md:col-span-4 lg:col-span-3 bg-[#3B3E56] text-white p-6 md:p-8 flex flex-col justify-between min-h-screen">
        <div>
          
          
          <Link
            href="/vendor/dashboard"
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 border border-white/10 px-3.5 py-2 rounded-xl transition-all duration-200 mb-8 cursor-pointer backdrop-blur-sm shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-300 group-hover:text-white transition-transform duration-200 group-hover:-translate-x-1" />
            <span>Back </span>
          </Link>

          
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl bg-[#EE6C52] flex items-center justify-center shadow-xs">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">
              Asaani Say
            </span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl lg:text-4xl font-extrabold leading-tight text-white">
              Manage Your <br />
              <span className="text-[#EE6C52]">Vendor Profile</span>
            </h1>
            <p className="text-xs lg:text-sm text-slate-300 leading-relaxed font-normal">
              Enter your official business details below.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-600/50 flex items-center gap-2.5 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-[#EE6C52] shrink-0" />
          <span>Your business dashboard is private and secure.</span>
        </div>
      </div>

      
      <div className="md:col-span-8 lg:col-span-9 bg-[#F8FAFC] p-6 md:p-10 lg:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-8">

          
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60">
            <div>
              <span className="text-xs font-bold text-slate-500 tracking-wide">
                English
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/vendor/dashboard"
                className="text-xs font-bold text-slate-700 hover:text-[#EE6C52] bg-white border border-slate-200 px-3.5 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:border-[#EE6C52] hover:text-[#EE6C52] px-4 py-1.5 rounded-lg transition shadow-2xs cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>

          
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center gap-6 justify-between">
            <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
              <div className="relative">
                <img
                  src={avatar}
                  alt="Profile Avatar"
                  className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md ring-2 ring-slate-100"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-7 h-7 bg-[#EE6C52] text-white rounded-full flex items-center justify-center shadow-xs hover:bg-orange-600 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleAvatarChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              <div>
                <div className="flex items-center gap-2.5 justify-center sm:justify-start flex-wrap">
                  <h2 className="text-xl font-extrabold text-[#2C2F45]">
                    {profile.businessName || 'Business Name'}
                  </h2>
                  <span className="text-[10px] font-bold text-[#EE6C52] bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    VERIFIED VENDOR
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  Vendor ID: <span className="font-extrabold text-slate-700">{profile.vendorId}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-[#F8FAFC] p-3 rounded-xl border border-slate-200/60 shrink-0">
              <div className="text-center px-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Completed Jobs
                </span>
                <span className="text-base font-extrabold text-[#2C2F45]">
                  {profile.totalCompletedJobs}
                </span>
              </div>
              <div className="w-px h-8 bg-slate-200" />
              <div className="text-center px-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                  Member Since
                </span>
                <span className="text-xs font-extrabold text-slate-700">
                  {profile.memberSince}
                </span>
              </div>
            </div>
          </div>

          
          <div className="space-y-6">
            
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2C2F45] block">
                  Business Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your business name..."
                  value={profile.businessName}
                  onChange={(e) => setProfile({ ...profile, businessName: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-[#EE6C52] text-slate-900 rounded-xl px-4 py-2.5 text-xs font-semibold transition shadow-2xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2C2F45] block">
                  Contact Email
                </label>
                <input
                  type="email"
                  required
                  placeholder="Enter your email address..."
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-[#EE6C52] text-slate-900 rounded-xl px-4 py-2.5 text-xs font-semibold transition shadow-2xs focus:outline-none"
                />
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2C2F45] block">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +92 300 1234567"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-[#EE6C52] text-slate-900 rounded-xl px-4 py-2.5 text-xs font-semibold transition shadow-2xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2C2F45] block">
                  CNIC Registration Number
                </label>
                <input
                  type="text"
                  required
                  placeholder="35201-XXXXXXX-X"
                  value={profile.cnic}
                  onChange={(e) => setProfile({ ...profile, cnic: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-[#EE6C52] text-slate-900 rounded-xl px-4 py-2.5 text-xs font-semibold transition shadow-2xs focus:outline-none"
                />
              </div>
            </div>

            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2C2F45] block">
                  Main Service Category
                </label>
                <div className="w-full bg-slate-100/90 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-700 select-none">
                  {profile.mainCategory || 'Services Category'}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-[#2C2F45] block">
                  Years of Experience
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5+ Years"
                  value={profile.experienceYears}
                  onChange={(e) => setProfile({ ...profile, experienceYears: e.target.value })}
                  className="w-full bg-white border border-slate-200 focus:border-[#EE6C52] text-slate-900 rounded-xl px-4 py-2.5 text-xs font-semibold transition shadow-2xs focus:outline-none"
                />
              </div>
            </div>

            
            <div className="space-y-2 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <label className="text-xs font-extrabold text-[#2C2F45] block">
                Selected Sub-Services
              </label>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {profile.selectedSubServices.length > 0 ? (
                  profile.selectedSubServices.map((sub) => (
                    <span
                      key={sub}
                      className="inline-flex items-center gap-1.5 bg-white text-[#EE6C52] text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-200 shadow-2xs select-none"
                    >
                      <Check className="w-3.5 h-3.5 text-[#EE6C52] stroke-3" />
                      <span>{sub}</span>
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-slate-400 italic">No sub-services selected</span>
                )}
              </div>
            </div>

            
            <div className="space-y-4 bg-slate-50/80 p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#2C2F45] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#EE6C52]" />
                  <span>Availability & Timing Schedule</span>
                </label>
              </div>

              {profile.dayWiseSchedule.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {profile.dayWiseSchedule.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-[#EE6C52] stroke-3" />
                        <span className="text-xs font-extrabold text-[#2C2F45]">
                          {item.day}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {item.slots.length > 0 ? (
                          item.slots.map((slot, sIdx) => (
                            <span
                              key={sIdx}
                              className="inline-flex items-center gap-1 bg-orange-50 text-[#EE6C52] text-[11px] font-bold px-2.5 py-1 rounded-md border border-orange-200"
                            >
                              <Clock className="w-3 h-3 text-[#EE6C52]" />
                              <span>{slot}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400 italic">
                            Full Day Available
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Selected Days
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.selectedDays.length > 0 ? (
                        profile.selectedDays.map((day) => (
                          <span
                            key={day}
                            className="bg-white text-slate-800 text-[11px] font-extrabold px-3 py-1 rounded-lg border border-slate-200"
                          >
                            {day}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No days selected in signup
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Selected Time Slots
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {profile.selectedTimeSlots.length > 0 ? (
                        profile.selectedTimeSlots.map((slot) => (
                          <span
                            key={slot}
                            className="bg-white text-[#EE6C52] text-[11px] font-extrabold px-3 py-1 rounded-lg border border-orange-200 flex items-center gap-1"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{slot}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">
                          No slots selected in signup
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            
            <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <label className="text-xs font-extrabold text-[#2C2F45] block">
                Service Areas
              </label>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-bold text-slate-600">Postal Code: {profile.postalCode || 'Not set'}</span>
                {profile.serviceAreas.map((area) => (
                  <span
                    key={area}
                    className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-200"
                  >
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-3" />
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveServiceArea(area)}
                      className="ml-1 text-slate-400 hover:text-red-500 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {showAddAreaInput ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      autoFocus
                      placeholder="e.g. DHA Phase 5..."
                      value={newAreaInput}
                      onChange={(e) => setNewAreaInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddServiceArea()}
                      className="bg-white border border-[#EE6C52] text-xs font-semibold px-3 py-1.5 rounded-lg focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleAddServiceArea}
                      className="bg-[#EE6C52] text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-orange-600 transition cursor-pointer"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddAreaInput(false)}
                      className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowAddAreaInput(true)}
                    className="text-xs font-bold text-[#EE6C52] hover:text-orange-600 bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Service Area</span>
                  </button>
                )}
              </div>
            </div>

            
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-extrabold text-[#2C2F45] block">
                  Service Description / Vendor Bio
                </label>
                <span className="text-[10px] font-bold text-slate-400">
                  {profile.bio.length} / 250 Characters
                </span>
              </div>
              <textarea
                rows={4}
                maxLength={250}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Write a short description about your services..."
                className="w-full bg-white border border-slate-200 focus:border-[#EE6C52] text-slate-900 rounded-xl p-4 text-xs leading-relaxed transition shadow-2xs resize-none focus:outline-none"
              />
            </div>

            
            <div className="space-y-2 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
              <label className="text-xs font-extrabold text-[#2C2F45] block">
                Contact Preferences
              </label>

              <div className="flex items-center gap-6 pt-2 flex-wrap">
                {['Phone Call', 'Text (SMS)', 'WhatsApp'].map((option) => {
                  const isChecked = profile.contactPreferences.includes(option)
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleContactPref(option)}
                        className="w-4 h-4 accent-[#EE6C52] rounded cursor-pointer"
                      />
                      <span>{option}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            
            <div className="pt-4 flex items-center gap-4">
              <button
                type="button"
                  onClick={handleSaveChanges}
                className="bg-[#EE6C52] hover:bg-orange-600 text-white text-xs font-extrabold px-8 py-3 rounded-xl transition shadow-sm cursor-pointer"
              >
                Save Changes
              </button>

              <Link
                href="/vendor/dashboard"
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold px-6 py-3 rounded-xl transition shadow-2xs cursor-pointer inline-block"
              >
                Cancel
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}