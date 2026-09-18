'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser, registerVendor, setStoredAuth } from '@/app/lib/booking-api'
import { PhoneInput, combinePhoneNumber } from '@/app/components/phone-input'
import { DEFAULT_COUNTRY_ISO, COUNTRY_CODES } from '@/app/lib/country-codes'
import {
  Eye,
  EyeOff,
  Wrench,
  ShieldCheck,
  ArrowLeft,
  ChevronDown,
  Check,
  CalendarDays
} from 'lucide-react'

const DEFAULT_DIAL_CODE = COUNTRY_CODES.find((c) => c.iso === DEFAULT_COUNTRY_ISO)?.dial || '+92'

const SERVICES_DATA: Record<string, string[]> = {
  'Home Inspection': [
    'Pre-Purchase Inspection',
    'Pre-Sale Inspection',
    'Property Condition Inspection',
    'Structural Inspection',
    'Electrical Inspection',
    'Plumbing Inspection'
  ],
  Plumber: [
    'Pipe Repair',
    'Water Leakage Repair',
    'Drain Cleaning',
    'Tap/Faucet Repair',
    'Sink Repair',
    'Toilet Repair',
    'Shower Repair',
    'Water Tank Repair',
    'Sewer Line Repair',
    'Bathroom Plumbing',
    'Kitchen Plumbing',
    'Pipe Installation'
  ],
  Electrician: [
    'Wiring & Rewiring',
    'Switch & Socket Repair',
    'Light Installation',
    'Fan Installation',
    'Circuit Breaker Repair',
    'DB Panel Work',
    'Short-Circuit Repair',
    'Power Outlet Installation',
    'Electrical Fault Detection',
    'Generator Wiring',
    'Inverter Installation',
    'Electrical Inspection'
  ],
  'AC Services': [
    'AC Repair',
    'AC Installation',
    'AC Cleaning',
    'AC Maintenance',
    'AC Gas Refilling',
    'AC Troubleshooting',
    'Split AC Service',
    'Window AC Service',
    'Central AC Service',
    'AC Duct Cleaning',
    'AC Replacement'
  ],
  Handyman: [
    'Furniture Assembly',
    'TV Mounting',
    'Curtain/Rod Installation',
    'Shelf Installation',
    'Picture Hanging',
    'Door Repair',
    'Lock Repair',
    'Minor Plumbing',
    'Minor Electrical Work',
    'General Repairs',
    'Drilling & Mounting'
  ],
  Carpenter: [
    'Furniture Repair',
    'Custom Furniture',
    'Door Repair',
    'Door Installation',
    'Cabinet Repair',
    'Cabinet Installation',
    'Wardrobe Work',
    'Kitchen Cabinets',
    'Shelving',
    'Wooden Flooring',
    'Wood Polishing',
    'Bed Repair',
    'Table/Chair Repair'
  ],
  'Pest Control': [
    'Cockroach Control',
    'Termite Control',
    'Bed Bug Treatment',
    'Mosquito Control',
    'Ant Control',
    'Fly Control',
    'Rodent Control',
    'Spider Control',
    'Lizard Control',
    'Bird Control',
    'General Pest Control',
    'Preventive Pest Treatment'
  ],
  'Geyser Services': [
    'Geyser Repair',
    'Geyser Installation',
    'Geyser Maintenance',
    'Geyser Cleaning',
    'Geyser Replacement',
    'Gas Geyser Repair',
    'Electric Geyser Repair',
    'Geyser Leakage Repair',
    'Thermostat Repair',
    'Heating Element Replacement',
    'Gas Line Inspection'
  ],
  Painter: [
    'Interior Painting',
    'Exterior Painting',
    'Room Painting',
    'Wall Painting',
    'Ceiling Painting',
    'Door & Window Painting',
    'Texture Painting',
    'Decorative Painting',
    'Waterproof Painting',
    'Repainting',
    'Spray Painting',
    'Wall Preparation',
    'Wall Crack Repair'
  ]
}
const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
]

const FULL_DAY_SLOT = '9:00 AM – 5:00 PM — Full Day'
const TIME_SLOTS = [
  FULL_DAY_SLOT,
  '9:00 AM – 11:00 AM',
  '11:30 AM – 1:30 PM',
  '2:00 PM – 4:00 PM',
  '4:30 PM – 6:00 PM'
]

type DayAvailability = {
  isSelected: boolean
  slots: string[]
}

export default function VendorLoginPage() {
  const router = useRouter()

  const [isRegister, setIsRegister] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [regStep, setRegStep] = useState(1)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')

  const [vendorDetails, setVendorDetails] = useState({
    firstName: '',
    lastName: '',
    contactNumber: '',
    houseAddress: '',
    businessName: '',
    businessEmail: '',
    businessPhone: '',
    customService: '',
    cnic: '',
    experienceYears: '',
    serviceAreas: '',
    postalCode: ''
  })
  const [availability, setAvailability] = useState<Record<string, DayAvailability>>({
    Monday: { isSelected: false, slots: [] },
    Tuesday: { isSelected: false, slots: [] },
    Wednesday: { isSelected: false, slots: [] },
    Thursday: { isSelected: false, slots: [] },
    Friday: { isSelected: false, slots: [] },
    Saturday: { isSelected: false, slots: [] },
    Sunday: { isSelected: false, slots: [] }
  })

  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedSubServices, setSelectedSubServices] = useState<string[]>([])
  const [showOtherInput] = useState(false)
  const [sameWhatsappNumber, setSameWhatsappNumber] = useState(false)
  const [formError, setFormError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [contactCountryCode, setContactCountryCode] = useState(DEFAULT_DIAL_CODE)
  const [whatsappCountryCode, setWhatsappCountryCode] = useState(DEFAULT_DIAL_CODE)
  const saveVendorSelections = (
    categories: string[],
    subServices: string[],
    weeklyAvailability: Record<string, DayAvailability>
  ) => {
    void categories
    void subServices
    void weeklyAvailability
    return
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setVendorDetails((prev) => ({
      ...prev,
      [name]: value,
    }))
  }
  const handleCnicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^0-9-]/g, '').slice(0, 15)
    setVendorDetails((prev) => ({ ...prev, cnic: cleaned }))
  }
  const toggleDay = (day: string) => {
    setAvailability((prev) => {
      const updatedAvailability = {
        ...prev,
        [day]: {
          isSelected: !prev[day].isSelected,
          slots: !prev[day].isSelected ? prev[day].slots : []
        }
      }
      saveVendorSelections(
        selectedCategories,
        selectedSubServices,
        updatedAvailability
      )

      return updatedAvailability
    })
  }
  const toggleSlot = (day: string, slot: string) => {
    setAvailability((prev) => {
      const dayData = prev[day]
      let newSlots = [...dayData.slots]

      if (slot === FULL_DAY_SLOT) {
        newSlots = newSlots.includes(FULL_DAY_SLOT) ? [] : [FULL_DAY_SLOT]
      } else {
        newSlots = newSlots.filter((s) => s !== FULL_DAY_SLOT)
        newSlots = newSlots.includes(slot)
          ? newSlots.filter((s) => s !== slot)
          : [...newSlots, slot]
      }

      const updatedAvailability = {
        ...prev,
        [day]: { ...dayData, slots: newSlots }
      }
      saveVendorSelections(
        selectedCategories,
        selectedSubServices,
        updatedAvailability
      )

      return updatedAvailability
    })
  }

  const handleCategoryClick = (categoryName: string) => {
    const isAlreadySelected = selectedCategories.includes(categoryName)

    if (isAlreadySelected) {
      if (activeCategory === categoryName) {
        setActiveCategory(null)
      } else {
        setActiveCategory(categoryName)
      }
      return
    }

    if (selectedCategories.length >= 2) {
      setFormError('You can only select 2 main categories.')
      return
    }

    setFormError('')
    const updatedCategories = [...selectedCategories, categoryName]
    setSelectedCategories(updatedCategories)
    setActiveCategory(categoryName)
    saveVendorSelections(
      updatedCategories,
      selectedSubServices,
      availability
    )
  }

  const handleRemoveCategory = (categoryName: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedCategories = selectedCategories.filter(
      (cat) => cat !== categoryName
    )
    const catSubServices = SERVICES_DATA[categoryName] || []
    const updatedSubServices = selectedSubServices.filter(
      (sub) => !catSubServices.includes(sub)
    )

    setSelectedCategories(updatedCategories)
    setSelectedSubServices(updatedSubServices)
    saveVendorSelections(
      updatedCategories,
      updatedSubServices,
      availability
    )

    if (activeCategory === categoryName) {
      setActiveCategory(null)
    }
  }

  const handleSubServiceToggle = (subService: string) => {
    if (selectedSubServices.includes(subService)) {
      const updatedSubServices = selectedSubServices.filter(
        (item) => item !== subService
      )

      setSelectedSubServices(updatedSubServices)
      saveVendorSelections(
        selectedCategories,
        updatedSubServices,
        availability
      )
    } else {
        const updatedSubServices = [...selectedSubServices, subService]
      setSelectedSubServices(updatedSubServices)
      saveVendorSelections(
        selectedCategories,
        updatedSubServices,
        availability
      )
    }
  }

  const handleSelectAllSubServices = (categoryName: string) => {
    const subServices = SERVICES_DATA[categoryName] || []
    const allSelected = subServices.every((item) =>
      selectedSubServices.includes(item)
    )

    if (allSelected) {
      const updatedSubServices = selectedSubServices.filter(
        (item) => !subServices.includes(item)
      )

      setSelectedSubServices(updatedSubServices)
      saveVendorSelections(
        selectedCategories,
        updatedSubServices,
        availability
      )
    } else {
      const combined = new Set([...selectedSubServices, ...subServices])
      const updatedSubServices = Array.from(combined)

      setSelectedSubServices(updatedSubServices)
      saveVendorSelections(
        selectedCategories,
        updatedSubServices,
        availability
      )
    }
  }

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError('')
    if (password.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }
    const nameParts = name.trim().split(/\s+/).filter(Boolean)
    const identifier = email.trim()
    const identifierIsEmail = identifier.includes('@')
    if (identifier && !identifierIsEmail) {
      setEmail('')
    }
    setVendorDetails((prev) => ({
      ...prev,
      firstName: nameParts[0] || prev.firstName,
      lastName: nameParts.slice(1).join(' ') || nameParts[0] || prev.lastName,
      contactNumber: identifier && !identifierIsEmail ? identifier : prev.contactNumber,
    }))
    setRegStep(2)
  }

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFormError('')

    if (selectedCategories.length === 0 && !showOtherInput) {
      setFormError('Please select at least 1 main category or specify a custom service.')
      return
    }
    if (selectedSubServices.length === 0 && !showOtherInput) {
      setFormError('Please select sub-services for your selected categories.')
      return
    }

    const hasAvailability = DAYS_OF_WEEK.some(
      (day) => availability[day].isSelected && availability[day].slots.length > 0
    )
    if (!hasAvailability) {
      setFormError('Please select at least one working day and time slot.')
      return
    }

    setIsProcessing(true)
    try {
      const servicesByCategory = selectedCategories.reduce<Record<string, string[]>>(
        (groupedServices, category) => {
          const categoryServices = SERVICES_DATA[category] || []
          groupedServices[category] = selectedSubServices.filter((service) =>
            categoryServices.includes(service)
          )
          return groupedServices
        },
        {}
      )

      const payload = {
        email: email.trim() || undefined,
        password,
        first_name: vendorDetails.firstName,
        last_name: vendorDetails.lastName,
        contact_number: combinePhoneNumber(contactCountryCode, vendorDetails.contactNumber),
        business_name: vendorDetails.businessName,
        business_email: vendorDetails.businessEmail.trim() || undefined,
        business_phone: vendorDetails.businessPhone.trim()
          ? combinePhoneNumber(whatsappCountryCode, vendorDetails.businessPhone)
          : undefined,
        cnic: vendorDetails.cnic,
        experience_years: vendorDetails.experienceYears,
        postal_code: vendorDetails.postalCode.trim() || undefined,
        service_areas: vendorDetails.serviceAreas.split(',').map((area) => area.trim()).filter(Boolean),
        contact_preferences: [],
        house_address: vendorDetails.houseAddress.trim() || undefined,
        categories: selectedCategories,
        services: selectedSubServices,
        services_by_category: servicesByCategory,
        custom_service: showOtherInput && vendorDetails.customService.trim()
          ? vendorDetails.customService.trim()
          : '',
        availability,
      }

      const auth = await registerVendor(payload)
      if (auth?.role === 'vendor') {
        setStoredAuth('vendor', auth)
        router.push('/vendor/dashboard')
      } else {
        setFormError('Vendor registration did not return a valid vendor session.')
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Vendor registration failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setFormError('')

    if (!emailOrPhone || !password) {
      setFormError('Please enter your email/phone and password.')
      return
    }

    setIsProcessing(true)
    try {
      const auth = await loginUser({ identifier: emailOrPhone, password, role: 'vendor' })
      if (auth?.role === 'vendor') {
        setStoredAuth('vendor', auth)
        router.push('/vendor/dashboard')
      } else {
        setFormError('This account is not registered as a vendor.')
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Vendor login failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleTabSwitch = (registerMode: boolean) => {
    setIsRegister(registerMode)
    setRegStep(1)
    setFormError('')
  }

  return (
    <div className="min-h-screen w-full bg-[#C7CBD1] font-sans overflow-hidden">
      <div className="min-h-[calc(100vh-40px)] w-full bg-white grid grid-cols-1 md:grid-cols-12 overflow-hidden">
        
        <div
          className="md:col-span-4 bg-[#3B3E56] text-white p-6 md:p-10 flex flex-col justify-between relative"
          style={{ minHeight: '35rem' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base text-white">Asaani Say</span>
          </div>

          <div className="my-auto -translate-y-24 space-y-4">
            <h1 className="text-3xl font-extrabold leading-tight">
              Welcome to <span className="text-orange-500">Asaani Say</span>
            </h1>

            <p className="text-xs text-slate-300 leading-relaxed font-normal max-w-md">
              Partner with us to grow your business and reach thousands of local
              clients.
            </p>

            <p className="text-[11px] text-slate-300 leading-relaxed font-normal max-w-md">
              Here, we believe that building a strong professional network begins
              with your participation. Join the Asaani platform and start
              managing your vendor services with confidence.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-600/50 flex items-center gap-2 text-[10px] text-slate-300">
            <ShieldCheck className="w-4 h-4 text-orange-500 shrink-0" />
            <span>Secure, encrypted connections for all transactions.</span>
          </div>
        </div>

        
        <div className="md:col-span-8 bg-white p-6 md:p-12 flex flex-col justify-between min-h-screen overflow-y-auto">
          <div className="w-full max-w-xl mx-auto my-auto py-4">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3">
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

            
            {!isRegister && (
              <div className="max-w-md mx-auto space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#2C2F45]">
                    Vendor Sign In
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Please enter your credentials to access your store dashboard.
                  </p>
                </div>

                <form onSubmit={handleSignInSubmit} className="space-y-4">
                  {formError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{formError}</p>
                  )}
                  <div>
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="Enter Email or Phone"
                      maxLength={100}
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

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
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div className="text-right">
                    <a
                      href="#"
                      className="text-[11px] text-orange-500 hover:underline font-medium"
                    >
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
                </form>
              </div>
            )}

            
            {isRegister && regStep === 1 && (
              <div className="max-w-md mx-auto space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-[#2C2F45]">
                    Vendor Sign Up
                  </h2>
                  <p className="text-xs text-slate-600 mt-1">
                    Create your vendor account to start offering services.
                  </p>
                </div>

                <form onSubmit={handleNextStep} className="space-y-4">
                  {formError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{formError}</p>
                  )}
                  <div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Name"
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <div>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Email or Phone Number"
                      maxLength={100}
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

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
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="block ml-auto px-10 bg-slate-400 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-md uppercase tracking-wider cursor-pointer"
                  >
                    NEXT
                  </button>
                </form>
              </div>
            )}

            
            {isRegister && regStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => { setRegStep(1); setFormError('') }}
                    className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-600"
                    title="Go Back"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold text-[#2C2F45]">
                      Vendor Details & Services
                    </h2>
                    <p className="text-xs text-slate-600">
                      Please complete the required information to get onboarded.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleFinalSubmit} className="flex flex-col space-y-5">
                  {formError && (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{formError}</p>
                  )}
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Personal Details
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="firstName"
                        required
                        placeholder="FIRST NAME"
                        value={vendorDetails.firstName}
                        onChange={handleInputChange}
                        className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition"
                      />

                      <input
                        type="text"
                        name="lastName"
                        required
                        placeholder="LAST NAME"
                        value={vendorDetails.lastName}
                        onChange={handleInputChange}
                        className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <PhoneInput
                        countryCode={contactCountryCode}
                        onCountryCodeChange={(dial) => {
                          setContactCountryCode(dial)
                          if (sameWhatsappNumber) setWhatsappCountryCode(dial)
                        }}
                        localNumber={vendorDetails.contactNumber}
                        onLocalNumberChange={(value) => {
                          setVendorDetails((prev) => ({
                            ...prev,
                            contactNumber: value,
                            ...(sameWhatsappNumber ? { businessPhone: value } : {}),
                          }))
                        }}
                        placeholder="CONTACT NUMBER"
                        required
                      />

                      <div className="space-y-2">
                        <PhoneInput
                          countryCode={whatsappCountryCode}
                          onCountryCodeChange={setWhatsappCountryCode}
                          localNumber={vendorDetails.businessPhone}
                          onLocalNumberChange={(value) => setVendorDetails((prev) => ({ ...prev, businessPhone: value }))}
                          placeholder="WHATSAPP NUMBER (optional)"
                        />
                        <label className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                          <input
                            type="checkbox"
                            checked={sameWhatsappNumber}
                            onChange={(event) => {
                              const checked = event.target.checked
                              setSameWhatsappNumber(checked)
                              if (checked) {
                                setWhatsappCountryCode(contactCountryCode)
                                setVendorDetails((prev) => ({ ...prev, businessPhone: prev.contactNumber }))
                              }
                            }}
                            className="h-3.5 w-3.5 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                          />
                          WhatsApp number is the same as contact number
                        </label>
                      </div>
                    </div>

                    <input
                      type="text"
                      name="houseAddress"
                      placeholder="HOUSE ADDRESS (optional)"
                      value={vendorDetails.houseAddress}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input type="text" inputMode="numeric" name="cnic" required maxLength={15} placeholder="CNIC (e.g. 12345-1234567-1)" value={vendorDetails.cnic} onChange={handleCnicChange} className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition" />
                      <input type="text" name="experienceYears" required placeholder="YEARS OF EXPERIENCE" value={vendorDetails.experienceYears} onChange={handleInputChange} className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition" />
                    </div>

                  </div>

                  <hr className="border-slate-200/80 my-4" />

                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Business Details
                    </h3>

                    <input
                      type="text"
                      name="businessName"
                      required
                      placeholder="BUSINESS NAME"
                      value={vendorDetails.businessName}
                      onChange={handleInputChange}
                      className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="email"
                        name="businessEmail"
                        placeholder="BUSINESS EMAIL ADDRESS (optional)"
                        value={vendorDetails.businessEmail}
                        onChange={handleInputChange}
                        className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition"
                      />

                    </div>
                  </div>

                  
                  
                  

                  <hr className="border-slate-200/80 my-4" />

                  <div className="order-2 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-5 h-5 text-orange-500" />
                      <div>
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Weekly Availability
                        </h3>
                        <p className="text-[10px] text-slate-500">
                          Select your working days and available time slots.
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {DAYS_OF_WEEK.map((day) => {
                        const isDaySelected = availability[day].isSelected
                        return (
                          <div
                            key={day}
                            className={`border rounded-xl p-3 transition-colors duration-200 ${
                              isDaySelected
                                ? 'border-orange-300 bg-orange-50/20'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <label className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={isDaySelected}
                                onChange={() => toggleDay(day)}
                                className="w-4 h-4 text-orange-500 border-slate-300 rounded focus:ring-orange-500 cursor-pointer"
                              />
                              <span className="text-sm font-bold text-[#2C2F45]">
                                {day}
                              </span>
                            </label>

                            {isDaySelected && (
                              <div className="flex flex-wrap gap-2 mt-3 pl-7">
                                {TIME_SLOTS.map((slot) => {
                                  const isSlotSelected =
                                    availability[day].slots.includes(slot)
                                  return (
                                    <button
                                      key={slot}
                                      type="button"
                                      onClick={() => toggleSlot(day, slot)}
                                      className={`px-3 py-1.5 text-[10px] font-semibold rounded-lg border transition-all duration-200 ${
                                        isSlotSelected
                                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                          : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:text-orange-600'
                                      }`}
                                    >
                                      {slot}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mt-2 shadow-inner">
                      <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-green-500" />
                        Your Availability Summary
                      </h4>
                      <div className="space-y-2 text-xs text-slate-600">
                        {DAYS_OF_WEEK.filter(
                          (day) =>
                            availability[day].isSelected &&
                            availability[day].slots.length > 0
                        ).length > 0 ? (
                          DAYS_OF_WEEK.map((day) => {
                            if (
                              availability[day].isSelected &&
                              availability[day].slots.length > 0
                            ) {
                              return (
                                <div
                                  key={day}
                                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-slate-200/60 pb-1 last:border-0"
                                >
                                  <span className="font-bold text-slate-700 min-w-20">
                                    {day}
                                  </span>
                                  <span className="text-orange-600 font-medium text-[11px] text-left sm:text-right">
                                    {availability[day].slots.join(', ')}
                                  </span>
                                </div>
                              )
                            }
                            return null
                          })
                        ) : (
                          <span className="text-slate-400 italic block text-center">
                            No availability selected yet. Select a day and time slots above.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <input type="text" name="postalCode" placeholder="POSTAL CODE (optional)" value={vendorDetails.postalCode} onChange={handleInputChange} className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition" />
                      <input type="text" name="serviceAreas" required placeholder="SERVICE AREAS (COMMA SEPARATED)" value={vendorDetails.serviceAreas} onChange={handleInputChange} className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 text-xs text-slate-700 placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition" />
                    </div>
                  </div>

                  <hr className="border-slate-200/80 my-4" />

                  

                  <div className="order-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                          Services Offered
                        </h3>
                        <p className="text-[10px] text-orange-500">
                          Select up to 2 main service categories.
                        </p>
                      </div>

                      <span
                        className={`text-[11px] font-bold px-2 py-1 rounded-md ${
                          selectedCategories.length === 2
                            ? 'bg-orange-100 text-orange-500'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {selectedCategories.length}/2 Categories Selected
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.keys(SERVICES_DATA).map((category) => {
                        const isCategorySelected =
                          selectedCategories.includes(category)
                        const isViewActive = activeCategory === category
                        const categorySubServices = SERVICES_DATA[category]
                        const subSelectedCount = categorySubServices.filter(
                          (sub) => selectedSubServices.includes(sub)
                        ).length

                        return (
                          <div
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`p-2 rounded-md border text-[11px] font-bold cursor-pointer flex items-center justify-between transition-all duration-200 relative ${
                              isCategorySelected
                                ? 'bg-white text-[#AE5B10] border-[#F3B079] shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-orange-300 hover:bg-[#FFFDFB]'
                            } ${
                              isViewActive ? 'ring-1 ring-[#F0A15C]' : ''
                            } ${isCategorySelected ? 'border-orange-500' : ''}`}
                          >
                            <div className="text-left pr-2">
                              <span className="text-[11px] block font-bold leading-tight">
                                {category}
                              </span>
                              {isCategorySelected && subSelectedCount > 0 && (
                                <span className="text-[9px] text-slate-500 font-medium block mt-0.5">
                                  {subSelectedCount} services
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1">
                              {isCategorySelected && (
                                <button
                                  type="button"
                                  onClick={(e) =>
                                    handleRemoveCategory(category, e)
                                  }
                                  title="Deselect Category"
                                  className="w-3 h-3 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center text-[8px] transition"
                                >
                                  ✕
                                </button>
                              )}
                              <ChevronDown
                                className={`w-3 h-3 shrink-0 transition-transform ${
                                  isViewActive
                                    ? 'rotate-180 text-[#B85B00]'
                                    : 'text-slate-400'
                                }`}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {selectedCategories.length > 0 && activeCategory && (
                      <div className="mt-4 p-3 rounded-xl bg-[#FFFDFB] border border-slate-200 shadow-sm space-y-3 transition-all duration-300">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-600">
                            Service Sub-categories
                          </span>
                          <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                            {selectedSubServices.length} selected
                          </span>
                        </div>

                        <div className="space-y-2.5">
                          <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-[0_1px_4px_rgba(30,41,59,0.05)]">
                            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50/60">
                              <div className="flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                                <span className="text-[11px] font-bold text-slate-700">
                                  {activeCategory}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  handleSelectAllSubServices(activeCategory)
                                }
                                className="text-[10px] text-orange-500 hover:text-orange-600 font-bold px-2 py-1 bg-orange-50 hover:bg-orange-100 rounded-md transition"
                              >
                                Select All
                              </button>
                            </div>

                            <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                              {SERVICES_DATA[activeCategory].map((sub) => (
                                <label
                                  key={sub}
                                  className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer transition"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedSubServices.includes(sub)}
                                    onChange={() => handleSubServiceToggle(sub)}
                                    className="w-3 h-3 text-orange-500 rounded border-slate-300 focus:ring-orange-500"
                                  />
                                  <span className="text-[11px] text-slate-600 font-medium">
                                    {sub}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="order-3 pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="px-10 bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-md uppercase tracking-wider cursor-pointer disabled:opacity-60"
                    >
                      {isProcessing ? 'Submitting…' : 'Submit Registration'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}