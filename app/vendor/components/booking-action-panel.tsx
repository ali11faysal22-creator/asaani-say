'use client'

import { useState } from 'react'
import {
  API_BASE,
  completeVendorBookingWithPhotos,
  decideVendorBooking,
  getStoredAuth,
  updateVendorBookingStatus,
  type BookingResult,
  type VendorBookingAction,
} from '@/app/lib/booking-api'

const TRACKED_STATUSES = ['accepted', 'on_the_way', 'reached', 'in_progress', 'paused', 'work_completed', 'payment_requested']
const CANNOT_START_STATUSES = ['accepted', 'on_the_way', 'reached']

function isBookingUnavailableError(message: string): boolean {
  return (
    message.includes('assigned to another vendor') ||
    message.includes('already been decided') ||
    message.includes('Booking not found')
  )
}

export function VendorBookingActionPanel({
  booking,
  onUpdated,
  onUnavailable,
}: {
  booking: BookingResult
  onUpdated: (updated: BookingResult) => void
  onUnavailable?: () => void
}) {
  const [actionInProgress, setActionInProgress] = useState(false)
  const [error, setError] = useState('')
  const [showCompletionUpload, setShowCompletionUpload] = useState(false)
  const [completionPhotos, setCompletionPhotos] = useState<File[]>([])
  const [showCannotStartForm, setShowCannotStartForm] = useState(false)
  const [cannotStartReason, setCannotStartReason] = useState('')

  const vendorId = () => {
    const auth = getStoredAuth('vendor')
    return auth?.profile_id || auth?.user_id || ''
  }

  const handleFailure = (requestError: unknown, fallback: string) => {
    const message = requestError instanceof Error ? requestError.message : fallback
    if (requestError instanceof Error && isBookingUnavailableError(message) && onUnavailable) {
      onUnavailable()
      return
    }
    setError(message)
  }

  const handleDecision = async (action: 'accept' | 'reject') => {
    if (actionInProgress) return
    setActionInProgress(true)
    setError('')
    try {
      const updated = await decideVendorBooking(vendorId(), booking.id, action)
      onUpdated(updated)
    } catch (requestError) {
      handleFailure(requestError, 'Unable to update this booking')
    } finally {
      setActionInProgress(false)
    }
  }

  const handleTrackingStatus = async (action: Exclude<VendorBookingAction, 'accept' | 'reject'>, reason?: string) => {
    if (actionInProgress) return
    setActionInProgress(true)
    setError('')
    try {
      const updated = await updateVendorBookingStatus(vendorId(), booking.id, action, reason)
      onUpdated(updated)
      setShowCannotStartForm(false)
      setCannotStartReason('')
    } catch (requestError) {
      handleFailure(requestError, 'Unable to update tracking status')
    } finally {
      setActionInProgress(false)
    }
  }

  const handleCompleteBooking = async () => {
    if (actionInProgress) return
    setActionInProgress(true)
    setError('')
    try {
      const updated = await completeVendorBookingWithPhotos(booking.id, completionPhotos)
      onUpdated(updated)
      setShowCompletionUpload(false)
      setCompletionPhotos([])
    } catch (requestError) {
      handleFailure(requestError, 'Unable to complete order')
    } finally {
      setActionInProgress(false)
    }
  }

  return (
    <div className="space-y-3">
      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-600">{error}</p>}

      {booking.status === 'pending' && (
        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={actionInProgress}
            onClick={() => void handleDecision('accept')}
            className="flex-1 rounded-xl bg-[#EE6C52] py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
          >
            Accept Booking
          </button>
          <button
            type="button"
            disabled={actionInProgress}
            onClick={() => void handleDecision('reject')}
            className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Decline
          </button>
        </div>
      )}

      {TRACKED_STATUSES.includes(booking.status) && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Job tracking</p>
          <div className="flex flex-wrap gap-2">
            {booking.status === 'accepted' && (
              <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('on_the_way')} className="rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Mark on the way</button>
            )}
            {booking.status === 'on_the_way' && (
              <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('reached')} className="rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Mark reached</button>
            )}
            {booking.status === 'reached' && (
              <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('work_started')} className="rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Start work</button>
            )}
            {booking.status === 'in_progress' && (
              <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('pause')} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-700 disabled:opacity-50">Pause work</button>
            )}
            {booking.status === 'paused' && (
              <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('resume')} className="rounded-lg bg-orange-500 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Resume work</button>
            )}
            {(booking.status === 'in_progress' || booking.status === 'paused') && !showCompletionUpload && (
              <button type="button" disabled={actionInProgress} onClick={() => setShowCompletionUpload(true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Mark work complete</button>
            )}
            {booking.status === 'work_completed' && (
              <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('request_payment')} className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Request payment</button>
            )}
            {booking.status === 'payment_requested' && (
              <button type="button" disabled={actionInProgress} onClick={() => void handleTrackingStatus('payment_received')} className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">Payment received</button>
            )}
            {CANNOT_START_STATUSES.includes(booking.status) && !showCannotStartForm && (
              <button type="button" disabled={actionInProgress} onClick={() => setShowCannotStartForm(true)} className="rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px] font-bold text-rose-600 disabled:opacity-50">Cannot start job</button>
            )}
          </div>

          {showCannotStartForm && (
            <div className="mt-3 space-y-2 rounded-xl border border-rose-200 bg-rose-50/50 p-3">
              <p className="text-[11px] font-bold text-rose-700">Why can&apos;t you start this job?</p>
              <textarea
                value={cannotStartReason}
                onChange={(event) => setCannotStartReason(event.target.value)}
                placeholder="e.g. Customer not reachable, wrong address, out of scope…"
                rows={2}
                maxLength={500}
                className="w-full rounded-lg border border-rose-200 bg-white px-3 py-2 text-[11px] text-slate-700 focus:outline-none focus:border-rose-400"
              />
              <div className="flex gap-2">
                <button type="button" disabled={actionInProgress || !cannotStartReason.trim()} onClick={() => void handleTrackingStatus('cannot_start', cannotStartReason.trim())} className="rounded-lg bg-rose-600 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">
                  {actionInProgress ? 'Submitting…' : 'Confirm — find another vendor'}
                </button>
                <button type="button" disabled={actionInProgress} onClick={() => { setShowCannotStartForm(false); setCannotStartReason('') }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {(booking.status === 'in_progress' || booking.status === 'paused') && showCompletionUpload && (
            <div className="mt-3 space-y-2 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
              <p className="text-[11px] font-bold text-emerald-700">Add photos of the completed job (optional)</p>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => setCompletionPhotos(Array.from(event.target.files || []))}
                className="block w-full text-[11px] text-slate-600 file:mr-2 file:rounded-lg file:border-0 file:bg-emerald-600 file:px-3 file:py-1.5 file:text-[11px] file:font-bold file:text-white"
              />
              {completionPhotos.length > 0 && (
                <p className="text-[10px] text-slate-500">{completionPhotos.length} photo{completionPhotos.length === 1 ? '' : 's'} selected</p>
              )}
              <div className="flex gap-2">
                <button type="button" disabled={actionInProgress} onClick={() => void handleCompleteBooking()} className="rounded-lg bg-emerald-600 px-3 py-2 text-[11px] font-bold text-white disabled:opacity-50">
                  {actionInProgress ? 'Completing…' : 'Confirm completion'}
                </button>
                <button type="button" disabled={actionInProgress} onClick={() => { setShowCompletionUpload(false); setCompletionPhotos([]) }} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-bold text-slate-600">
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {booking.status === 'completed' && booking.photos.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Completion photos</p>
          <div className="flex flex-wrap gap-2">
            {booking.photos.map((url) => (
              <a key={url} href={`${API_BASE}${url}`} target="_blank" rel="noreferrer">
                <img src={`${API_BASE}${url}`} alt="Completion" className="h-16 w-16 rounded-lg object-cover border border-slate-200" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
