'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchVendorProfile, getStoredAuth, updateVendorProfile } from '@/app/lib/booking-api';
import UnsavedChangesGuard from '@/app/vendor/components/unsaved-changes-guard';
import {
  Wrench,
  User,
  ShieldCheck,
  CreditCard,
  Check,
  X,
  Clock,
  Save,
  Lock,
  Calendar
} from 'lucide-react';

const ALL_MAIN_SERVICES = [
  "Home Inspection", "Plumber", "Electrician",
  "AC Services", "Handyman", "Carpenter",
  "Pest Control", "Geyser Services", "Painter"
];

const SERVICE_ALIAS_MAP: Record<string, string> = {
  "carpentry": "Carpenter",
  "carpenter": "Carpenter",
  "electrician services": "Electrician",
  "electrician": "Electrician",
  "plumbing services": "Plumber",
  "plumbing": "Plumber",
  "plumber": "Plumber",
  "ac services": "AC Services",
  "ac service": "AC Services",
  "home inspection": "Home Inspection",
  "handyman": "Handyman",
  "pest control": "Pest Control",
  "geyser services": "Geyser Services",
  "painter": "Painter",
  "painting": "Painter"
};

const MASTER_SUB_SERVICES: Record<string, string[]> = {
  "Home Inspection": [
    "Full Structure Inspection", "Electrical System Inspection",
    "Pre-Purchase Inspection", "Pre-Sale Inspection",
    "Property Condition Inspection", "Plumbing Inspection"
  ],
  "AC Services": [
    "AC Repair", "AC Installation", "AC Cleaning",
    "AC Maintenance", "AC Gas Refilling", "AC Troubleshooting",
    "Split AC Service", "Window AC Service", "Central AC Service", "AC Duct Cleaning"
  ],
  "Carpenter": [
    "Furniture Repair", "Custom Furniture", "Door Repair & Lock Fitting",
    "Door Installation", "Cabinet Repair", "Cabinet Installation",
    "Furniture Polish & Repair", "Kitchen Cabinets", "Wooden Flooring"
  ],
  "Plumber": [
    "Pipe Leakage Repair", "Tap & Sink Repair", "Toilet Installation",
    "Drainage Cleaning", "Water Tank Cleaning", "Geyser Connection"
  ],
  "Electrician": [
    "Wiring & Repair", "Short Circuit Repair", "UPS & Inverter Service",
    "Fan Installation", "Switchboard Fitting", "Light Fitting"
  ],
  "Handyman": ["Drilling & Hanging", "Lock Repair", "General Maintenance"],
  "Pest Control": ["Termite Control", "Bed Bug Treatment", "Cockroach Control"],
  "Geyser Services": ["Geyser Repair", "Geyser Installation", "Geyser Cleaning"],
  "Painter": ["Full House Paint", "Wall Waterproofing", "Texture Painting"]
};

const normalizeServiceName = (name: string): string => {
  if (!name || typeof name !== 'string') return name;
  const cleaned = name.trim().toLowerCase();
  return SERVICE_ALIAS_MAP[cleaned] || name;
};

const getAvailableSubServices = (mainCat: string): string[] => {
  const normalized = normalizeServiceName(mainCat);
  return MASTER_SUB_SERVICES[normalized] || MASTER_SUB_SERVICES[mainCat] || [];
};

type DaySetting = { day: string; active: boolean; slots: string };

const DEFAULT_DAYS: DaySetting[] = [
  { day: "Monday", active: true, slots: "09:00 AM - 06:00 PM" },
  { day: "Tuesday", active: true, slots: "09:00 AM - 06:00 PM" },
  { day: "Wednesday", active: true, slots: "09:00 AM - 06:00 PM" },
  { day: "Thursday", active: true, slots: "09:00 AM - 06:00 PM" },
  { day: "Friday", active: true, slots: "09:00 AM - 06:00 PM" },
  { day: "Saturday", active: false, slots: "10:00 AM - 04:00 PM" },
  { day: "Sunday", active: false, slots: "Closed" },
];

const NAV_ITEMS = [
  { key: 'services', label: 'Services & Schedule', icon: Wrench },
  { key: 'account', label: 'Account Details', icon: User },
  { key: 'payout', label: 'Payout & Banking', icon: CreditCard },
  { key: 'privacy', label: 'Security', icon: ShieldCheck },
] as const;

const getStoredStringArray = (keys: string[]): string[] => {
  if (typeof window === 'undefined') return [];

  for (const key of keys) {
    const rawValue = localStorage.getItem(key);
    if (!rawValue) continue;

    try {
      const parsed = JSON.parse(rawValue);
      if (Array.isArray(parsed)) return parsed.map((item) => String(item));
    } catch {
    }
  }

  return [];
};

const getStoredAvailability = (): DaySetting[] => {
  if (typeof window === 'undefined') return DEFAULT_DAYS;

  const rawAvail = localStorage.getItem('vendor_availability');
  if (!rawAvail) return DEFAULT_DAYS;

  try {
    const parsedAvail = JSON.parse(rawAvail);

    if (typeof parsedAvail === 'object' && !Array.isArray(parsedAvail) && parsedAvail !== null) {
      return Object.entries(parsedAvail).map(([day, details]) => {
        const detailRecord = details as Record<string, unknown> | undefined;
        const activeValue = detailRecord?.isSelected ?? detailRecord?.active ?? true;

        return {
          day,
          active: typeof activeValue === 'boolean' ? activeValue : Boolean(activeValue),
          slots: String(detailRecord?.slots ?? detailRecord?.time ?? detailRecord?.workingHours ?? '09:00 AM - 06:00 PM')
        };
      });
    }

    if (Array.isArray(parsedAvail)) {
      return parsedAvail.map((item) => {
        const record = item as Record<string, unknown> | undefined;
        const activeValue = record?.active ?? true;

        return {
          day: String(record?.day ?? 'Day'),
          active: typeof activeValue === 'boolean' ? activeValue : Boolean(activeValue),
          slots: String(record?.slots ?? '09:00 AM - 06:00 PM')
        };
      });
    }
  } catch (error) {
    console.error('LocalStorage parsing error:', error);
  }

  return DEFAULT_DAYS;
};

export default function VendorSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'services' | 'account' | 'payout' | 'privacy'>('services');

  const [mainServices, setMainServices] = useState<string[]>(() => getStoredStringArray(['vendor_selected_categories', 'vendor_main_services']))
  const [subServices, setSubServices] = useState<string[]>(() => getStoredStringArray(['vendor_selected_sub_services', 'vendor_sub_services']))
  const [availability, setAvailability] = useState<DaySetting[]>(getStoredAvailability)

  const [accountInfo, setAccountInfo] = useState({
    fullName: '', phone: '', email: '', businessName: '', cnic: '', postalCode: '', address: ''
  })
  const [profileMeta, setProfileMeta] = useState({ firstName: '', lastName: '', experienceYears: '', postalCode: '', serviceAreas: [] as string[], contactPreferences: [] as string[] });
  const [payoutInfo, setPayoutInfo] = useState({
    bankName: '', accountTitle: '', accountNumber: '', paymentMethod: 'bank'
  });
  const [securityInfo, setSecurityInfo] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [savedSettings, setSavedSettings] = useState('');

  const [isMainModalOpen, setIsMainModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  useEffect(() => {
    const loadBackendProfile = async () => {
      const auth = getStoredAuth('vendor')
      if (!auth?.profile_id) {
        router.push('/vendor/login')
        return
      }
      try {
        const profile = await fetchVendorProfile(auth.profile_id)
        setAccountInfo({
          fullName: `${profile.first_name} ${profile.last_name}`.trim(),
          phone: profile.contact_number,
          email: profile.email || '',
          businessName: profile.business_name,
          cnic: profile.cnic,
          postalCode: profile.postal_code,
          address: profile.addresses?.[0]?.line || '',
        })
        setProfileMeta({
          firstName: profile.first_name,
          lastName: profile.last_name,
          experienceYears: profile.experience_years,
          postalCode: profile.postal_code,
          serviceAreas: profile.service_areas || [],
          contactPreferences: profile.contact_preferences || [],
        })
        const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        setAvailability(profile.availability.map((row) => ({
          day: dayNames[Number(row.day_of_week)] || String(row.day_of_week),
          active: row.is_enabled,
          slots: row.is_full_day ? 'Full day' : `${row.start_time || '09:00'} - ${row.end_time || '17:00'}`,
        })))
      } catch (error) {
        console.error('Unable to load vendor settings from backend', error)
      } finally {
        setLoading(false)
      }
    }
    void loadBackendProfile()

    if (typeof window !== 'undefined') {
      const rawAccount = localStorage.getItem('vendor_onboarding_data') || localStorage.getItem('vendor_signup_data');
      if (rawAccount) {
        try {
          const parsedAcc = JSON.parse(rawAccount);
          const accountData = parsedAcc.account || parsedAcc;
          queueMicrotask(() => setAccountInfo(prev => ({
            ...prev,
            fullName: accountData.name || accountData.fullName || prev.fullName,
            email: accountData.email || prev.email,
            phone: accountData.phone || prev.phone,
            businessName: accountData.businessName || prev.businessName
          })));
        } catch (error) {
          console.error('LocalStorage parsing error:', error);
        }
      }
    }

  }, [router]);

  const settingsSnapshot = JSON.stringify({ mainServices, subServices, availability, accountInfo, profileMeta });

  useEffect(() => {
    if (!loading && !savedSettings) queueMicrotask(() => setSavedSettings(settingsSnapshot));
  }, [loading, savedSettings, settingsSnapshot]);

  const syncToLocalStorage = (
    newMain = mainServices,
    newSub = subServices,
    newAvail = availability
  ) => {
    localStorage.setItem('vendor_selected_categories', JSON.stringify(newMain));
    localStorage.setItem('vendor_main_services', JSON.stringify(newMain));
    localStorage.setItem('vendor_selected_sub_services', JSON.stringify(newSub));
    localStorage.setItem('vendor_sub_services', JSON.stringify(newSub));

    const availObject: Record<string, { isSelected: boolean; slots: string }> = {};
    newAvail.forEach(item => {
      availObject[item.day] = {
        isSelected: item.active,
        slots: item.slots
      };
    });
    localStorage.setItem('vendor_availability', JSON.stringify(availObject));

    showToast('Settings updated successfully!');
    setSavedSettings(JSON.stringify({ mainServices: newMain, subServices: newSub, availability: newAvail, accountInfo, profileMeta }));
  };

  const saveAccountDetails = async () => {
    const auth = getStoredAuth('vendor');
    if (!auth?.profile_id) return showToast('Vendor session expired. Please sign in again.');
    const nameParts = accountInfo.fullName.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2 || !accountInfo.email || !accountInfo.phone || !accountInfo.businessName || !accountInfo.cnic || !accountInfo.postalCode) {
      showToast('Full name, email, phone, business name, CNIC, and postal code are required.');
      return;
    }
    try {
      await updateVendorProfile(auth.profile_id, {
        first_name: nameParts[0],
        last_name: nameParts.slice(1).join(' '),
        business_name: accountInfo.businessName,
        contact_number: accountInfo.phone,
        postal_code: accountInfo.postalCode,
        email: accountInfo.email,
        cnic: accountInfo.cnic,
        experience_years: profileMeta.experienceYears || 'Not specified',
        service_areas: profileMeta.serviceAreas.length ? profileMeta.serviceAreas : ['Lahore'],
        contact_preferences: profileMeta.contactPreferences,
      });
      showToast('Profile saved successfully!');
      setSavedSettings(settingsSnapshot);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Unable to save profile');
    }
  };

  const handleSaveMainServices = (updatedMain: string[]) => {
    const normalizedNewMain = updatedMain.map(normalizeServiceName);

    const filteredSubs = subServices.filter(sub =>
      normalizedNewMain.some(main => getAvailableSubServices(main).includes(sub))
    );

    setMainServices(normalizedNewMain);
    setSubServices(filteredSubs);
    setIsMainModalOpen(false);

    syncToLocalStorage(normalizedNewMain, filteredSubs, availability);
  };

  const handleSaveSubServices = (updatedSubs: string[]) => {
    setSubServices(updatedSubs);
    setIsSubModalOpen(false);

    syncToLocalStorage(mainServices, updatedSubs, availability);
  };

  const handleAvailabilityToggle = (index: number) => {
    const updated = [...availability];
    if (typeof updated[index] === 'object') {
      updated[index].active = !updated[index].active;
      setAvailability(updated);
    }
  };

  const handleSlotChange = (index: number, val: string) => {
    const updated = [...availability];
    if (typeof updated[index] === 'object') {
      updated[index].slots = val;
      setAvailability(updated);
    }
  };

  return (
    <>
      <UnsavedChangesGuard isDirty={Boolean(savedSettings) && settingsSnapshot !== savedSettings} onSave={async () => { await saveAccountDetails(); syncToLocalStorage(); }} />
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-full sm:w-fit overflow-x-auto">
          {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTab === key
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
        <>
        {activeTab === 'services' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              <div className="border-b border-gray-100 pb-4">
                <h2 className="text-lg font-bold text-gray-900">Services & Weekly Schedule</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Configure offered services and your active availability slots
                </p>
              </div>

              
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold text-gray-600">
                    Main Services ({mainServices.length})
                  </h3>
                  <button
                    onClick={() => setIsMainModalOpen(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-3.5 py-2 rounded-lg transition"
                  >
                    Change Main Services
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {mainServices.length === 0 ? (
                    <span className="text-xs text-red-500 italic">No main services selected.</span>
                  ) : (
                    mainServices.map((service) => (
                      <span
                        key={service}
                        className="inline-flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-3.5 py-1.5 rounded-full text-xs font-medium"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        {service}
                      </span>
                    ))
                  )}
                </div>
              </div>

              
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-semibold text-gray-600">
                    Sub-Services ({subServices.length})
                  </h3>
                  <button
                    onClick={() => setIsSubModalOpen(true)}
                    className="border border-orange-500 text-orange-600 hover:bg-orange-50 text-xs font-semibold px-3.5 py-2 rounded-lg transition"
                  >
                    Edit Sub-Services
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {subServices.length === 0 ? (
                    <span className="text-xs text-red-500 italic">No sub-services selected.</span>
                  ) : (
                    subServices.map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1.5 rounded-full text-xs font-medium"
                      >
                        <Check className="w-3 h-3" />
                        {sub}
                      </span>
                    ))
                  )}
                </div>
              </div>

              
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-orange-500" />
                  <h3 className="text-xs font-semibold text-gray-600">
                    Weekly Availability & Working Hours
                  </h3>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 text-sm text-gray-700 space-y-3">
                  {availability.map((item, idx) => {
                    const isObj = typeof item === 'object';
                    const dayName = isObj ? (item.day || `Day ${idx + 1}`) : item;
                    const isActive = isObj ? item.active !== false : true;
                    const slotsVal = isObj ? (Array.isArray(item.slots) ? item.slots.join(', ') : (item.slots || '09:00 AM - 06:00 PM')) : '09:00 AM - 06:00 PM';

                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 last:border-b-0 pb-3">
                        <div className="flex items-center gap-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isActive}
                              onChange={() => handleAvailabilityToggle(idx)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500"></div>
                          </label>
                          <span className={`font-medium text-sm ${isActive ? 'text-gray-900' : 'text-gray-400 line-through'}`}>
                            {dayName}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-gray-400' : 'text-gray-300'}`} />
                          <input
                            type="text"
                            disabled={!isActive}
                            value={isActive ? slotsVal : 'Closed'}
                            onChange={(e) => handleSlotChange(idx, e.target.value)}
                            className={`px-3 py-1.5 border rounded-lg text-xs w-full sm:w-56 font-medium ${
                              isActive ? 'bg-white border-gray-300 text-gray-800 focus:border-orange-500 outline-none' : 'bg-gray-100 border-gray-200 text-gray-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => syncToLocalStorage()}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2 transition"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Account Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                  <input type="text" value={accountInfo.fullName} onChange={(e) => setAccountInfo({ ...accountInfo, fullName: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Business Name</label>
                  <input type="text" value={accountInfo.businessName} onChange={(e) => setAccountInfo({ ...accountInfo, businessName: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Phone Number</label>
                  <input type="text" value={accountInfo.phone} onChange={(e) => setAccountInfo({ ...accountInfo, phone: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                  <input type="email" value={accountInfo.email} onChange={(e) => setAccountInfo({ ...accountInfo, email: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Postal Code</label>
                  <input type="text" required value={accountInfo.postalCode} onChange={(e) => setAccountInfo({ ...accountInfo, postalCode: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => void saveAccountDetails()} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Profile
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payout' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Payout Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Account Title</label>
                  <input type="text" value={payoutInfo.accountTitle} onChange={(e) => setPayoutInfo({ ...payoutInfo, accountTitle: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Account Number / IBAN</label>
                  <input type="text" value={payoutInfo.accountNumber} onChange={(e) => setPayoutInfo({ ...payoutInfo, accountNumber: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button onClick={() => syncToLocalStorage()} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2">
                  <Save className="w-4 h-4" /> Save Payout Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Security</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Current Password</label>
                  <input type="password" value={securityInfo.currentPassword} onChange={(e) => setSecurityInfo({ ...securityInfo, currentPassword: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">New Password</label>
                  <input type="password" value={securityInfo.newPassword} onChange={(e) => setSecurityInfo({ ...securityInfo, newPassword: e.target.value })} className="w-full px-3.5 py-2.5 border border-gray-300 rounded-xl text-sm outline-none focus:border-orange-500" />
                </div>
                <button onClick={() => showToast("Password updated!")} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs px-6 py-2.5 rounded-xl flex items-center gap-2">
                  <Lock className="w-4 h-4" /> Update Password
                </button>
              </div>
            </div>
          )}
        </>
        )}

      {isMainModalOpen && (
        <MainServicesPopover
          currentMain={mainServices}
          onClose={() => setIsMainModalOpen(false)}
          onSave={handleSaveMainServices}
        />
      )}

      {isSubModalOpen && (
        <SubServicesPopover
          selectedMainServices={mainServices}
          currentSubServices={subServices}
          onClose={() => setIsSubModalOpen(false)}
          onSave={handleSaveSubServices}
        />
      )}
    </>
  );
}

function MainServicesPopover({ currentMain, onClose, onSave }: { currentMain: string[]; onClose: () => void; onSave: (updated: string[]) => void; }) {
  const [selected, setSelected] = useState<string[]>(currentMain.map(normalizeServiceName));

  const toggleMainCategory = (category: string) => {
    const canonical = normalizeServiceName(category);
    if (selected.includes(canonical)) {
      setSelected(selected.filter((item) => item !== canonical));
    } else {
      setSelected([...selected, canonical]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
          <h3 className="text-base font-bold text-gray-900">Select Main Services</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 my-2">
          {ALL_MAIN_SERVICES.map((cat) => {
            const canonicalCat = normalizeServiceName(cat);
            const isSelected = selected.includes(canonicalCat);
            return (
              <button
                key={cat}
                type="button"
                onClick={() => toggleMainCategory(cat)}
                className={`p-3 text-left rounded-xl border text-xs font-medium flex items-center justify-between transition ${
                  isSelected ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat}</span>
                {isSelected && (
                  <span className="bg-orange-500 text-white rounded-full p-0.5">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(selected)} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold">Save Services</button>
        </div>
      </div>
    </div>
  );
}

function SubServicesPopover({ selectedMainServices, currentSubServices, onClose, onSave }: { selectedMainServices: string[]; currentSubServices: string[]; onClose: () => void; onSave: (updated: string[]) => void; }) {
  const [selectedSubs, setSelectedSubs] = useState<string[]>(currentSubServices);

  const toggleSub = (sub: string) => {
    if (selectedSubs.includes(sub)) {
      setSelectedSubs(selectedSubs.filter((item) => item !== sub));
    } else {
      setSelectedSubs([...selectedSubs, sub]);
    }
  };

  const toggleSelectAll = (mainCat: string) => {
    const availableSubs = getAvailableSubServices(mainCat);
    const isAllSelected = availableSubs.length > 0 && availableSubs.every((sub) => selectedSubs.includes(sub));

    if (isAllSelected) {
      setSelectedSubs(selectedSubs.filter((s) => !availableSubs.includes(s)));
    } else {
      const union = Array.from(new Set([...selectedSubs, ...availableSubs]));
      setSelectedSubs(union);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl p-6 flex flex-col max-h-[85vh]">
        <div className="flex justify-between items-center border-b border-gray-100 pb-3 mb-4">
          <h3 className="text-base font-bold text-gray-900">Edit Sub-Services</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto pr-1 my-2">
          {selectedMainServices.length === 0 ? (
            <div className="text-center py-12 text-xs text-gray-400">Pehle Main Services select karein.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedMainServices.map((rawMainCat) => {
                const subOptions = getAvailableSubServices(rawMainCat);
                const allChecked = subOptions.length > 0 && subOptions.every((s) => selectedSubs.includes(s));

                return (
                  <div key={rawMainCat} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col space-y-3">
                    <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                      <h4 className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                        {rawMainCat}
                      </h4>
                      {subOptions.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleSelectAll(rawMainCat)}
                          className="text-[11px] font-semibold text-orange-600 hover:underline"
                        >
                          {allChecked ? 'Deselect All' : 'Select All'}
                        </button>
                      )}
                    </div>

                    <div className="space-y-1.5 overflow-y-auto max-h-56 pr-1">
                      {subOptions.length === 0 ? (
                        <span className="text-xs text-gray-400 italic">No sub-services found for this category.</span>
                      ) : (
                        subOptions.map((subItem) => {
                          const checked = selectedSubs.includes(subItem);
                          return (
                            <div
                              key={subItem}
                              onClick={() => toggleSub(subItem)}
                              className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                                checked ? 'bg-white border-orange-400 font-semibold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                readOnly
                                className="accent-orange-500 rounded w-3.5 h-3.5 cursor-pointer"
                              />
                              <span>{subItem}</span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-gray-100 pt-4 mt-2">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
          <button onClick={() => onSave(selectedSubs)} className="px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-semibold">Save Sub-Services</button>
        </div>
      </div>
    </div>
  );
}