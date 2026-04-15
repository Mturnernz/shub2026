import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useUIStore } from '../store/ui.store'
import { Btn, OBInput, Callout } from '../components/primitives'
import styles from './auth.module.css'

export default function SignupClient() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { showToast } = useUIStore()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: `${window.location.origin}/welcome`,
      },
    })
    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }
    if (data.user) {
      // Insert profile row
      await supabase.from('profiles').insert({
        id: data.user.id,
        display_name: displayName,
        email,
        role: ['client'],
        active_role: 'client',
      })
    }
    setLoading(false)
    showToast('Check your email to confirm your account.')
    const next = searchParams.get('next')
    navigate(next === 'provider' ? '/signup/provider' : '/login')
  }

  const valid = displayName.trim().length > 0 && email.length > 0 && password.length >= 8

  return (
    <div className={styles.page}>
      <div className={styles.wordmark}>shub</div>
      <div className={styles.card}>
        <h1 className={styles.heading}>Create account</h1>
        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <OBInput
            label="Display name"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            autoComplete="name"
            placeholder="How you'd like to be known"
            required
          />
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
            autoComplete="new-password"
            hint="At least 8 characters"
            required
          />
          {error && <p className={styles.error}>{error}</p>}
          <Btn type="submit" full loading={loading} disabled={!valid}>
            Create account
          </Btn>
        </form>
        <Callout v="ink" icon="ℹ">
          By signing up you agree to our privacy-first approach. We never share your data.
        </Callout>
        <div className={styles.links}>
          <Link to="/login" className={styles.link}>Already have an account? Sign in</Link>
        </div>
      </div>
    </div>
  )
}
