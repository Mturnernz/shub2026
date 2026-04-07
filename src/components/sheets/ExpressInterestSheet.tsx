import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sheet, OBInput, OBTextarea, Btn } from '../primitives'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import styles from './ExpressInterestSheet.module.css'

export interface ExpressInterestSheetProps {
  requestId: string | null
  open: boolean
  onClose: () => void
}

export default function ExpressInterestSheet({ requestId, open, onClose }: ExpressInterestSheetProps) {
  const { session } = useAuthStore()
  const { showToast } = useUIStore()
  const navigate = useNavigate()
  const [fee, setFee] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = fee.length > 0 && message.trim().length >= 20

  async function handleSubmit() {
    if (!session?.user) { navigate('/login'); return }
    setError('')
    setLoading(true)
    const { error: err } = await supabase.from('pitches').insert({
      request_id: requestId,
      provider_id: session.user.id,
      fee: parseInt(fee),
      message: message.trim(),
    })
    setLoading(false)
    if (err) { setError('Something went wrong. Please try again.'); return }
    setFee('')
    setMessage('')
    onClose()
    showToast('Interest sent.')
  }

  return (
    <Sheet open={open} onClose={onClose}>
      <div className={styles.wrapper}>
        <h2 className={styles.heading}>Express interest</h2>
        <p className={styles.sub}>Your fee and message go directly to the client.</p>

        <OBInput
          label="Your fee (NZD total)"
          type="number"
          placeholder="e.g. 800"
          value={fee}
          onChange={(e) => setFee(e.target.value)}
          hint="Total for the arrangement, not per hour"
        />
        <OBTextarea
          label="Your message"
          placeholder="Introduce yourself and why you'd be a great fit for this arrangement…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          hint={`${message.trim().length}/20 characters minimum`}
        />
        {error && <p className={styles.error}>{error}</p>}
        <Btn full loading={loading} disabled={!canSubmit} onClick={handleSubmit}>
          Send interest →
        </Btn>
      </div>
    </Sheet>
  )
}
