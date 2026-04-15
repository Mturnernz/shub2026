import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { useUIStore } from '../store/ui.store'
import { Btn, OBInput } from '../components/primitives'
import styles from './auth.module.css'

export default function UpdatePassword() {
  const navigate = useNavigate()
  const { activeRole } = useAuthStore()
  const { showToast } = useUIStore()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Check hash immediately — Supabase puts type=recovery there on redirect
    if (window.location.hash.includes('type=recovery')) {
      setReady(true)
    }
    // Also listen for the PASSWORD_RECOVERY auth event
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setError('')
    setLoading(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (updateError) {
      setError(updateError.message)
      return
    }
    showToast('Password updated.')
    navigate(activeRole === 'provider' ? '/dashboard' : '/discover', { replace: true })
  }

  const valid = password.length >= 8 && confirm.length >= 8

  if (!ready) {
    return (
      <div className={styles.page}>
        <div className={styles.wordmark}>shub</div>
        <div className={styles.card}>
          <h1 className={styles.heading}>Link expired</h1>
          <p className={styles.body}>This password reset link is invalid or has already been used.</p>
          <Link to="/reset-password">
            <Btn full>Request a new link</Btn>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.wordmark}>shub</div>
      <div className={styles.card}>
        <h1 className={styles.heading}>Set new password</h1>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <OBInput
            label="New password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            hint="At least 8 characters"
            required
          />
          <OBInput
            label="Confirm password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <Btn type="submit" full loading={loading} disabled={!valid}>
            Update password
          </Btn>
        </form>
      </div>
    </div>
  )
}
