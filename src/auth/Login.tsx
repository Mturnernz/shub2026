import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUIStore } from '../store/ui.store'
import { Btn, OBInput } from '../components/primitives'
import styles from './auth.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (authError) {
      setError('Incorrect email or password.')
    } else {
      showToast('Welcome back.')
      navigate('/discover')
    }
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
