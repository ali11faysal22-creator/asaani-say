'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { rateBooking, type BookingResult } from '@/app/lib/booking-api'

export function VendorRatingForm({
  bookingId,
  vendorName,
  onRated,
}: {
  bookingId: string
  vendorName?: string
  onRated: (updated: BookingResult) => void
}) {
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const submit = async () => {
    if (rating < 1) {
      setError('Please select a star rating.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const updated = await rateBooking(bookingId, rating, comment.trim() || undefined)
      onRated(updated)
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Unable to submit rating.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <p className="text-sm font-extrabold text-slate-900">Rate your vendor</p>
      <p className="mt-1 text-xs text-slate-500">
        {vendorName ? `How was your experience with ${vendorName}?` : 'Let us know how the service went.'}
      </p>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            onMouseEnter={() => setHovered(value)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => setRating(value)}
            className="p-0.5"
            aria-label={`Rate ${value} star${value === 1 ? '' : 's'}`}
          >
            <Star
              className={`h-7 w-7 ${(hovered || rating) >= value ? 'fill-orange-400 text-orange-400' : 'text-slate-300'}`}
            />
          </button>
        ))}
      </div>
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Add a comment (optional)"
        rows={2}
        maxLength={500}
        className="mt-3 w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-orange-400"
      />
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
      <button
        type="button"
        disabled={submitting}
        onClick={() => void submit()}
        className="mt-3 w-full rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
      >
        {submitting ? 'Submitting…' : 'Submit rating'}
      </button>
    </div>
  )
}
