import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Callout, Toggle, Btn } from '../../components/primitives'
import EarningsBarChart from '../../components/charts/EarningsBarChart'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import type { Booking, ProviderListing } from '../../types'
import styles from './Dashboard.module.css'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function last7Days(): Array<{ day: string; amount: number }> {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    return { day: days[d.getDay()], amount: 0 }
  })
}

export default function Dashboard() {
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [listing, setListing] = useState<ProviderListing | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [pausing, setPausing] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    Promise.all([
      supabase.from('provider_listings').select('*').eq('provider_id', profile.id).maybeSingle(),
      supabase.from('bookings').select('*').eq('provider_id', profile.id).order('booking_date', { ascending: true }),
    ]).then(([{ data: l }, { data: b }]) => {
      setListing(l as ProviderListing | null)
      setBookings((b as Booking[]) ?? [])
      setLoading(false)
    })
  }, [profile?.id])

  async function respondToBooking(bookingId: string, status: 'confirmed' | 'cancelled') {
    const { error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
    if (!error) {
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status } : b)
      )
      showToast(status === 'confirmed' ? 'Booking confirmed.' : 'Booking declined.')
    }
  }

  async function togglePause() {
    if (!listing) return
    setPausing(true)
    const { error } = await supabase
      .from('provider_listings')
      .update({ paused: !listing.paused })
      .eq('id', listing.id)
    if (!error) {
      setListing({ ...listing, paused: !listing.paused })
      showToast(listing.paused ? 'Listing is now live.' : 'Listing paused.')
    }
    setPausing(false)
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter((b) => b.status === 'confirmed' && b.booking_date >= today)
  const pending = bookings.filter((b) => b.status === 'pending')
  const chartData = last7Days()

  const thisWeek = bookings
    .filter((b) => b.status === 'completed' && b.price_agreed)
    .reduce((sum, b) => sum + (b.price_agreed ?? 0), 0)

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.skeleton} style={{ height: 48, width: '60%', marginBottom: 8 }} />
        <div className={styles.skeleton} style={{ height: 24, width: '40%', marginBottom: 24 }} />
        <div className={styles.skeleton} style={{ height: 180 }} />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className={styles.page}>
        <h1 className={styles.greeting}>{greeting()}, {profile?.display_name}</h1>
        <div className={styles.setupCard}>
          <p className={styles.setupText}>You don't have a listing yet.</p>
          <Link to="/listing"><Btn full>Set up your listing →</Btn></Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.greeting}>{greeting()}, {profile?.display_name}</h1>
        <Toggle on={!listing.paused} onChange={togglePause} label="" hint={pausing ? '…' : listing.paused ? 'Paused' : 'Live'} />
      </div>

      {listing.status === 'pending' && (
        <Callout v="gold" icon="★">Your listing is under review — usually within 24 hours.</Callout>
      )}

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <p className={styles.statNum}>${thisWeek.toLocaleString()}</p>
          <p className={styles.statLabel}>This week</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statNum}>{upcoming.length}</p>
          <p className={styles.statLabel}>Upcoming</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statNum}>{pending.length}</p>
          <p className={styles.statLabel}>Pending</p>
        </div>
      </div>

      {/* Chart */}
      <div className={styles.chartCard}>
        <p className={styles.chartTitle}>Last 7 days</p>
        <EarningsBarChart data={chartData} />
      </div>

      {/* Upcoming */}
      <div className={styles.section}>
        <p className={styles.sectionTitle}>Upcoming arrangements</p>
        {upcoming.length === 0 ? (
          <p className={styles.empty}>No upcoming arrangements.</p>
        ) : upcoming.slice(0, 5).map((b) => (
          <div key={b.id} className={styles.bookingRow}>
            <div>
              <p className={styles.bookingDate}>{new Date(b.booking_date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })} · {b.start_time.slice(0, 5)}</p>
              <p className={styles.bookingType}>{b.type}</p>
            </div>
            <span className={styles.confirmedBadge}>Confirmed</span>
          </div>
        ))}
      </div>

      {/* Pending */}
      {pending.length > 0 && (
        <div className={styles.section}>
          <p className={styles.sectionTitle}>Pending enquiries</p>
          {pending.slice(0, 3).map((b) => (
            <div key={b.id} className={styles.pendingCard}>
              <div className={styles.pendingInfo}>
                <p className={styles.bookingDate}>{new Date(b.booking_date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short' })} · {b.start_time.slice(0, 5)}</p>
                <p className={styles.bookingType}>{b.type} arrangement</p>
                {b.price_agreed && <p className={styles.bookingType}>${b.price_agreed} NZD</p>}
              </div>
              <div className={styles.pendingActions}>
                <button className={styles.btnAccept} onClick={() => respondToBooking(b.id, 'confirmed')}>Accept</button>
                <button className={styles.btnDecline} onClick={() => respondToBooking(b.id, 'cancelled')}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick actions */}
      <div className={styles.quickActions}>
        <Link to="/listing" className={styles.quickAction}>
          <span>✏</span><span>Edit listing</span>
        </Link>
        <Link to="/listing/availability" className={styles.quickAction}>
          <span>📅</span><span>Availability</span>
        </Link>
        <Link to="/listing/online" className={styles.quickAction}>
          <span>✦</span><span>Online services</span>
        </Link>
        <Link to="/earnings" className={styles.quickAction}>
          <span>$</span><span>Earnings</span>
        </Link>
      </div>
    </div>
  )
}
