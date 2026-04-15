import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import type { Booking } from '../../types'
import styles from './Bookings.module.css'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-NZ', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':')
  const d = new Date()
  d.setHours(parseInt(h), parseInt(m))
  return d.toLocaleTimeString('en-NZ', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const STATUS_LABEL: Record<Booking['status'], string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function Bookings() {
  const { session } = useAuthStore()
  const { showToast } = useUIStore()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null)
  const [stars, setStars] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState(false)

  useEffect(() => {
    if (!session?.user) return
    supabase
      .from('bookings')
      .select('*')
      .eq('client_id', session.user.id)
      .order('booking_date', { ascending: false })
      .then(({ data }) => {
        setBookings((data as Booking[]) ?? [])
        setLoading(false)
      })
  }, [session])

  async function cancelRequest() {
    if (!cancelBookingId) return
    setCancelling(true)
    const { error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled', cancelled_by: 'client' })
      .eq('id', cancelBookingId)
    setCancelling(false)
    if (!error) {
      setBookings((prev) => prev.map((b) => b.id === cancelBookingId ? { ...b, status: 'cancelled' as const, cancelled_by: 'client' as const } : b))
      showToast('Request cancelled.')
    }
    setCancelBookingId(null)
  }

  async function submitReview() {
    if (!reviewBookingId || stars === 0 || !session?.user) return
    const booking = bookings.find((b) => b.id === reviewBookingId)
    if (!booking) return
    setSubmittingReview(true)
    await supabase.from('reviews').insert({
      booking_id: reviewBookingId,
      client_id: session.user.id,
      provider_id: booking.provider_id,
      rating: stars,
      body: reviewText.trim() || null,
    })
    setSubmittingReview(false)
    setReviewBookingId(null)
    setStars(0)
    setReviewText('')
    showToast('Review submitted — thank you.')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>My arrangements</h1>
      </div>

      <div className={styles.list}>
        {loading ? (
          <>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </>
        ) : bookings.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyEmoji}>📅</div>
            <p className={styles.emptyText}>No arrangements yet. Browse companions to request one.</p>
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.type}>{b.type} arrangement</span>
                <span className={`${styles.status} ${styles[`status_${b.status}`]}`}>
                  {STATUS_LABEL[b.status]}
                </span>
              </div>
              <p className={styles.meta}>
                {formatDate(b.booking_date)}
                {b.start_time ? ` · ${formatTime(b.start_time)}` : ''}
                {b.end_time ? ` – ${formatTime(b.end_time)}` : ''}
              </p>
              {b.price_agreed && (
                <p className={styles.price}>${b.price_agreed} NZD</p>
              )}
              {b.status === 'pending' && (
                cancelBookingId === b.id ? (
                  <div className={styles.cancelConfirm}>
                    <p className={styles.cancelPrompt}>Cancel this request?</p>
                    <div className={styles.actions}>
                      <button className={styles.actionBtnPrimary} onClick={cancelRequest} disabled={cancelling}>
                        {cancelling ? 'Cancelling…' : 'Yes, cancel'}
                      </button>
                      <button className={styles.actionBtn} onClick={() => setCancelBookingId(null)}>Keep it</button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.actions}>
                    <button className={styles.actionBtn} onClick={() => navigate('/messages')}>Message</button>
                    <button className={styles.actionBtnGhost} onClick={() => setCancelBookingId(b.id)}>Cancel request</button>
                  </div>
                )
              )}
              {b.status === 'confirmed' && (
                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => navigate('/messages')}>Message</button>
                </div>
              )}
              {b.status === 'completed' && (
                <div className={styles.actions}>
                  <button className={styles.actionBtnPrimary} onClick={() => { setReviewBookingId(b.id); setStars(0); setReviewText('') }}>Leave a review</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Review sheet */}
      {reviewBookingId && (
        <div className={styles.sheetOverlay} onClick={() => setReviewBookingId(null)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sheetHandle} />
            <h2 className={styles.sheetTitle}>Leave a review</h2>
            <div className={styles.starRow}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} className={styles.star} onClick={() => setStars(n)}
                  style={{ color: n <= stars ? 'var(--gold)' : 'var(--border)' }}>★</button>
              ))}
            </div>
            <textarea
              className={styles.reviewTextarea}
              placeholder="Tell others what made this arrangement special… (optional)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
            <button
              className={styles.submitBtn}
              disabled={stars === 0 || submittingReview}
              onClick={submitReview}
            >
              {submittingReview ? 'Submitting…' : 'Submit review'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
