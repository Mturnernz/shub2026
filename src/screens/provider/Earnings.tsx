import { useState, useEffect } from 'react'
import { Chip } from '../../components/primitives'
import EarningsBarChart from '../../components/charts/EarningsBarChart'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import type { Booking } from '../../types'
import styles from './Earnings.module.css'

type Period = 'week' | 'month' | 'quarter'

function getChartData(bookings: Booking[], period: Period) {
  const days = period === 'week' ? 7 : period === 'month' ? 30 : 90
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const buckets: Record<string, number> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const label = period === 'week' ? labels[d.getDay()] : `${d.getDate()}/${d.getMonth() + 1}`
    buckets[key] = 0
    if (period === 'week') buckets[label] = 0
  }
  bookings.filter((b) => b.status === 'completed' && b.price_agreed).forEach((b) => {
    const d = new Date(); d.setDate(d.getDate())
    const key = period === 'week' ? labels[new Date(b.booking_date).getDay()] : b.booking_date
    if (key in buckets) buckets[key] += b.price_agreed ?? 0
  })
  return Object.entries(buckets).map(([day, amount]) => ({ day, amount })).slice(-7)
}

export default function Earnings() {
  const { profile } = useAuthStore()
  const [period, setPeriod] = useState<Period>('week')
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('bookings').select('*').eq('provider_id', profile.id).eq('status', 'completed').order('booking_date', { ascending: false })
      .then(({ data }) => { setBookings((data as Booking[]) ?? []); setLoading(false) })
  }, [profile?.id])

  const chartData = getChartData(bookings, period)
  const total = bookings.reduce((s, b) => s + (b.price_agreed ?? 0), 0)

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Earnings</h1>

      <div className={styles.totalCard}>
        <p className={styles.totalLabel}>Total earned</p>
        <p className={styles.totalNum}>${total.toLocaleString()}</p>
        <p className={styles.totalSub}>across {bookings.length} completed arrangement{bookings.length !== 1 ? 's' : ''}</p>
      </div>

      <div className={styles.periodRow}>
        {(['week', 'month', 'quarter'] as Period[]).map((p) => (
          <Chip key={p} active={period === p} onClick={() => setPeriod(p)}>
            {p === 'week' ? 'This week' : p === 'month' ? 'This month' : 'Last 3 months'}
          </Chip>
        ))}
      </div>

      <div className={styles.chartCard}>
        <EarningsBarChart data={chartData} />
      </div>

      <div className={styles.txList}>
        <p className={styles.txTitle}>Completed arrangements</p>
        {loading ? (
          [1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)
        ) : bookings.length === 0 ? (
          <p className={styles.empty}>No completed arrangements yet.</p>
        ) : bookings.map((b) => (
          <div key={b.id} className={styles.txRow}>
            <div>
              <p className={styles.txDate}>{new Date(b.booking_date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
              <p className={styles.txType}>{b.type}</p>
            </div>
            <span className={styles.txAmt}>${(b.price_agreed ?? 0).toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
