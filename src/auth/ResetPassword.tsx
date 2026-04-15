import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Btn, OBInput } from '../components/primitives'
import styles from './auth.module.css'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    setLoading(false)
    if (authError) {
      setError(authError.message)
    } else {
      setSent(true)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.wordmark}>shub</div>
      <div className={styles.card}>
        <h1 className={styles.heading}>Reset password</h1>
        {sent ? (
          <div className={styles.form}>
            <p className={styles.body}>
              If an account exists for <strong>{email}</strong>, you'll receive a reset link shortly.
            </p>
            <Link to="/login">
              <Btn full v="ghost">Back to sign in</Btn>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <OBInput
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <Btn type="submit" full loading={loading} disabled={!email}>
              Send reset link
            </Btn>
            <Link to="/login">
              <Btn full v="ghost">Back to sign in</Btn>
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
