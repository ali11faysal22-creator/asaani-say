'use client'

import { useCallback } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/navigation'

export type Language = 'en' | 'ur'

function phraseKey(text: string): string {
  let hash = 2166136261
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return `p_${(hash >>> 0).toString(36)}`
}

function formatNotificationDate(value: string): string {
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('ur-PK', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

function formatNotificationTime(value: string): string {
  const time = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i)
  if (!time) return value
  const [, hourText, minute = '00', period] = time
  if (!period) return `${hourText}:${minute}`
  return `${period.toUpperCase() === 'AM' ? 'صبح' : 'شام'} ${hourText}:${minute}`
}

function formatNotificationSlot(value: string): string {
  const dateAndTime = value.match(/^(\d{4}-\d{2}-\d{2})\s+(.+)$/)
  if (dateAndTime) {
    return `${formatNotificationDate(dateAndTime[1])}، وقت: ${formatNotificationSlot(dateAndTime[2])}`
  }
  const slot = value.match(/^(.+?)\s*(?:-|–|to)\s*(.+)$/i)
  return slot
    ? `${formatNotificationTime(slot[1])} سے ${formatNotificationTime(slot[2])} تک`
    : formatNotificationTime(value)
}

function translateNotificationText(text: string, translate: (text: string) => string): string {
  const tooShort = text.match(/^(.+?) must be at least (\d+) characters\.$/)
  if (tooShort) return `${translate(tooShort[1])} کم از کم ${tooShort[2]} حروف پر مشتمل ہونا چاہیے۔`
  const tooLong = text.match(/^(.+?) must be at most (\d+) characters\.$/)
  if (tooLong) return `${translate(tooLong[1])} زیادہ سے زیادہ ${tooLong[2]} حروف کا ہو سکتا ہے۔`
  const required = text.match(/^(.+?) is required\.$/)
  if (required) return `${translate(required[1])} ضروری ہے۔`
  const badFormat = text.match(/^(.+?) format is not valid\.$/)
  if (badFormat) return `${translate(badFormat[1])} کا فارمیٹ درست نہیں ہے۔`
  const notNumber = text.match(/^(.+?) must be a number\.$/)
  if (notNumber) return `${translate(notNumber[1])} نمبر ہونا چاہیے۔`
  const atLeast = text.match(/^(.+?) must be at least (\d+(?:\.\d+)?)\.$/)
  if (atLeast) return `${translate(atLeast[1])} کم از کم ${atLeast[2]} ہونا چاہیے۔`
  const atMost = text.match(/^(.+?) must be at most (\d+(?:\.\d+)?)\.$/)
  if (atMost) return `${translate(atMost[1])} زیادہ سے زیادہ ${atMost[2]} ہو سکتا ہے۔`

  const vendorRequest = text.match(/^You have a new (.+?) request for (.+?)\. Booking ID: ([\w-]+)\. Please accept or reject within (\d+) (minutes|seconds)\.$/)
  if (vendorRequest) {
    const [, service, slot, bookingId, amount, unit] = vendorRequest
    return `${translate(service)} کے لیے نئی درخواست موصول ہوئی ہے۔ وقت: ${formatNotificationSlot(slot)}۔ بکنگ نمبر: ${bookingId}۔ براہِ کرم ${amount} ${unit === 'seconds' ? 'سیکنڈ' : 'منٹ'} کے اندر اسے قبول یا مسترد کریں۔`
  }

  const cancelledByCustomer = text.match(/^(.+?) cancelled the (.+?) booking for (.+?) \(Booking ID: ([\w-]+)\)\.(?: No action is needed\.)?$/)
  if (cancelledByCustomer) {
    const [, customer, service, slot, bookingId] = cancelledByCustomer
    return `${customer} نے ${translate(service)} کی بکنگ منسوخ کر دی ہے۔ وقت: ${formatNotificationSlot(slot)}۔ بکنگ نمبر: ${bookingId}۔`
  }

  const customerRequest = text.match(/^(.+?) requested (.+?) on (\d{4}-\d{2}-\d{2}) (\d{2}:\d{2})-(\d{2}:\d{2})\.$/)
  if (customerRequest) {
    const [, customer, service, date, start, end] = customerRequest
    return `${customer} نے ${translate(service)} کی درخواست ${formatNotificationDate(date)} کو ${formatNotificationTime(start)} سے ${formatNotificationTime(end)} تک کے لیے بھیجی ہے۔`
  }

  const serviceRequest = text.match(/^(.+?) request for (\d{4}-\d{2}-\d{2})(?:\s+(.+?))?\.?$/i)
  if (serviceRequest) {
    const [, service, date, time = ''] = serviceRequest
    return `${translate(service)} کی درخواست۔ تاریخ: ${formatNotificationDate(date)}${time ? `، وقت: ${formatNotificationSlot(time)}` : ''}۔`
  }

  const customerServiceRequest = text.match(/^New request for (.+?) on (\d{4}-\d{2}-\d{2})(?:\s+(.+?))?\.?$/i)
  if (customerServiceRequest) {
    const [, service, date, time = ''] = customerServiceRequest
    return `${translate(service)} کے لیے نئی درخواست۔ تاریخ: ${formatNotificationDate(date)}${time ? `، وقت: ${formatNotificationSlot(time)}` : ''}۔`
  }

  if (/^Your service request has been submitted\./i.test(text)) {
    return 'آپ کی سروس کی درخواست جمع ہو گئی ہے۔ ہم فراہم کنندہ کی منظوری کا انتظار کر رہے ہیں اور جلد آپ کو اطلاع دیں گے۔'
  }

  const requestStatus = text.match(/^(?:Your )?(?:booking|service) request for (.+?) (?:has been|was) (accepted|confirmed|declined|rejected|cancelled|canceled|completed)\.?$/i)
  if (requestStatus) {
    const [, service, status] = requestStatus
    const translatedStatus: Record<string, string> = {
      accepted: 'قبول',
      confirmed: 'تصدیق',
      declined: 'مسترد',
      rejected: 'مسترد',
      cancelled: 'منسوخ',
      canceled: 'منسوخ',
      completed: 'مکمل',
    }
    return `${translate(service)} کی درخواست ${translatedStatus[status.toLowerCase()]} ہو گئی ہے۔`
  }

  const completedJob = text.match(/^(.+?) — (.+?) on (\d{4}-\d{2}-\d{2})\.$/)
  if (completedJob) return `${completedJob[1]} — ${translate(completedJob[2])}، تاریخ ${formatNotificationDate(completedJob[3])}۔`

  const receivedRating = text.match(/^You received a (\d+)-star rating for booking ([\w-]+)\.$/)
  if (receivedRating) return `آپ کو بکنگ نمبر ${receivedRating[2]} کے لیے ${receivedRating[1]} ستاروں کی ریٹنگ ملی ہے۔`

  const pausedVendors = text.match(/^Paused — (\d+) vendors in a row didn't respond, waiting on the customer\.$/)
  if (pausedVendors) return `${pausedVendors[1]} فراہم کنندگان کے جواب نہ دینے پر آرڈر روک دیا گیا ہے، صارف کے جواب کا انتظار ہے۔`

  const autoMatched = text.match(/^Auto-matched by rating \+ distance \(([\d.]+) km, ([\d.]+)★\)\.$/)
  if (autoMatched) return `درجہ بندی اور فاصلے کی بنیاد پر خودکار طور پر منتخب کیا گیا (${autoMatched[1]} کلومیٹر، ${autoMatched[2]}★)۔`

  const rescheduled = text.match(/^Rescheduled from (.+?) to (.+?)\.$/)
  if (rescheduled) return `وقت تبدیل کر کے ${rescheduled[1]} کے بجائے ${rescheduled[2]} کر دیا گیا۔`

  const completionPhotos = text.match(/^(\d+) completion photo\(s\) uploaded\.$/)
  if (completionPhotos) return `${completionPhotos[1]} کام مکمل ہونے کی تصاویر اپ لوڈ کی گئیں۔`

  const acceptedBooking = text.match(/^Your booking request for (.+?) has been accepted\.?$/i)
  if (acceptedBooking) return `آپ کی ${translate(acceptedBooking[1])} کی بکنگ درخواست قبول کر لی گئی ہے۔`

  const completedBooking = text.match(/^Your booking for (.+?) has been completed\.?$/i)
  if (completedBooking) return `آپ کی ${translate(completedBooking[1])} کی بکنگ مکمل ہو گئی ہے۔`

  const cancelledBooking = text.match(/^Your booking request for (.+?) (?:was|has been) (?:cancelled|canceled|rejected)\.?$/i)
  if (cancelledBooking) return `آپ کی ${translate(cancelledBooking[1])} کی بکنگ درخواست منسوخ کر دی گئی ہے۔`

  return text
}

export function useLanguage() {
  const locale = useLocale() as Language
  const messages = useTranslations('Common')
  const pathname = usePathname()
  const router = useRouter()

  const t = useCallback((text: string) => {
    if (locale === 'en') return text
    const key = phraseKey(text)
    if (messages.has(key)) return messages(key)
    return translateNotificationText(text, (value) => {
      const translatedKey = phraseKey(value)
      return messages.has(translatedKey) ? messages(translatedKey) : value
    })
  }, [locale, messages])

  const setLanguage = useCallback((language: Language) => {
    router.replace(pathname, { locale: language })
  }, [pathname, router])

  return { language: locale, setLanguage, t }
}
