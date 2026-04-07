import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { useUIStore } from '../store/ui.store'
import { Btn, OBInput } from '../components/primitives'
import type { Profile } from '../types'
import styles from './auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setProfile, setActiveRole, activeRole } = useAuthStore()
  const { showToast } = useUIStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = (location.state as { from?: Location })?.from?.pathname

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single()
      if (profile) {
        setProfile(profile as Profile)
        const role = (profile as Profile).active_role as 'client' | 'provider'
        setActiveRole(role)
        showToast('Welcome back.')
        const dest = from ?? (role === 'provider' ? '/dashboard' : '/discover')
        navigate(dest, { replace: true })
        return
      }
    }
    showToast('Welcome back.')
    navigate(activeRole === 'provider' ? '/dashboard' : '/discover', { replace: true })
    setLoading(false)
  }

  return (
    <div className={styles.page}>
      <div className={styles.wordmark}>shub</div>
      <div className={styles.card}>
        <h1 className={styles.heading}>Sign in</h1>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <OBInput
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            required
          />
          <OBInput
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <Btn type="submit" full loading={loading} disabled={!email || !password}>
            Sign in
          </Btn>
        </form>
        <div className={styles.links}>
          <Link to="/reset-password" className={styles.link}>Forgot password?</Link>
          <span className={styles.divider}>·</span>
          <Link to="/signup/client" className={styles.link}>Create account</Link>
        </div>
      </div>
    </div>
  )
}
