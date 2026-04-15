import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'
import styles from './RoleSelector.module.css'

const SEEN_KEY = 'shub-role-seen'

export default function RoleSelector() {
  const navigate = useNavigate()
  const { session, setActiveRole } = useAuthStore()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Slight delay so mount animation plays
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  // If already authed, redirect immediately
  useEffect(() => {
    if (session) {
      const role = localStorage.getItem(SEEN_KEY) as 'client' | 'provider' | null
      navigate(role === 'provider' ? '/dashboard' : '/discover', { replace: true })
    }
  }, [session, navigate])

  const choose = (role: 'client' | 'provider') => {
    setActiveRole(role)
    localStorage.setItem(SEEN_KEY, role)
    navigate(role === 'provider' ? '/signup/provider' : '/signup/client', { replace: true })
  }

  return (
    <div className={styles.page}>
      {/* Wordmark */}
      <div className={styles.wordmark}>shub</div>

      {/* Non-dismissible sheet */}
      <div className={[styles.sheet, visible ? styles.visible : ''].filter(Boolean).join(' ')}>
        <div className={styles.handle} aria-hidden="true" />

        <h1 className={styles.heading}>Extraordinary company,<br />on your terms.</h1>

        <div className={styles.cards}>
          <button className={[styles.card, styles.cardClient].join(' ')} onClick={() => choose('client')}>
            <span className={styles.cardEmoji}>◆</span>
            <span className={styles.cardTitle}>Find a companion</span>
            <span className={styles.cardDesc}>Discover trusted companions across New Zealand</span>
          </button>

          <button className={[styles.card, styles.cardProvider].join(' ')} onClick={() => choose('provider')}>
            <span className={styles.cardEmoji}>✦</span>
            <span className={styles.cardTitle}>List as a companion</span>
            <span className={styles.cardDesc}>Set your own rates and hours. Keep everything you earn.</span>
          </button>
        </div>

        <button className={styles.browseLink} onClick={() => navigate('/discover')}>
          Browse without signing up
        </button>

        <p className={styles.legal}>
          shub is a directory for independent adult service providers operating lawfully under the
          Prostitution Reform Act 2003.{' '}
          <span className={styles.legalMuted}>New Zealand only · 18+ only</span>
        </p>
      </div>
    </div>
  )
}
