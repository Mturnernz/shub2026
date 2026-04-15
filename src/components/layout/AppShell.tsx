import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Wordmark from './Wordmark'
import BottomNav from './BottomNav'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import type { Booking } from '../../types'
import styles from './AppShell.module.css'

// Routes that get the full shell (wordmark + bottom nav)
const SHELL_ROUTES = [
  '/discover', '/browse', '/requests', '/my-requests',
  '/messages', '/account', '/bookings',
  '/dashboard', '/provider/requests', '/listing', '/earnings', '/verification',
]

function useShouldShowShell() {
  const { pathname } = useLocation()
  return SHELL_ROUTES.some((r) => pathname === r || pathname.startsWith(r + '/'))
}

export default function AppShell() {
  const showShell = useShouldShowShell()
  const { session } = useAuthStore()
  const [checkinBooking, setCheckinBooking] = useState<Booking | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [confirming, setConfirming] = useState(false)

  useEffect(() => {
    if (!session?.user || dismissed) return
    const today = new Date().toISOString().split('T')[0]
    const now = new Date()
    supabase
      .from('bookings')
      .select('*')
      .eq('client_id', session.user.id)
      .eq('status', 'confirmed')
      .eq('booking_date', today)
      .eq('client_confirmed_safe', false)
      .then(({ data }) => {
        if (!data?.length) return
        const upcoming = (data as Booking[]).find((b) => {
          const [h, m] = b.start_time.split(':').map(Number)
          const startMs = new Date(today).setHours(h, m)
          const diffMins = (startMs - now.getTime()) / 60000
          return diffMins >= -60 && diffMins <= 120
        })
        if (upcoming) setCheckinBooking(upcoming)
      })
  }, [session?.user, dismissed])

  async function confirmSafe() {
    if (!checkinBooking) return
    setConfirming(true)
    await supabase
      .from('bookings')
      .update({ client_confirmed_safe: true })
      .eq('id', checkinBooking.id)
    setConfirming(false)
    setCheckinBooking(null)
    setDismissed(true)
  }

  return (
    <>
      {showShell && <Wordmark />}

      {showShell && checkinBooking && !dismissed && (
        <div className={styles.checkinBanner}>
          <span className={styles.checkinText}>Your arrangement starts soon. Are you safe?</span>
          <div className={styles.checkinActions}>
            <button className={styles.checkinBtn} onClick={confirmSafe} disabled={confirming}>
              {confirming ? '…' : "I'm safe ✓"}
            </button>
            <button className={styles.checkinDismiss} onClick={() => setDismissed(true)}>✕</button>
          </div>
        </div>
      )}

      <main style={{ paddingBottom: showShell ? 72 : 0 }}>
        <Outlet />
      </main>
      {showShell && <BottomNav />}
    </>
  )
}
