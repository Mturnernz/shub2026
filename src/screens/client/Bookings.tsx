import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
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
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

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
            </div>
          ))
        )}
      </div>
    </div>
  )
}
