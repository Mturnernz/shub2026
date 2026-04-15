import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Callout, OBInput, OBTextarea } from '../components/primitives'
import { useProvider } from '../lib/queries'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { useUIStore } from '../store/ui.store'
import styles from './Book.module.css'

const TYPES = [
  { id: 'social', label: 'Social', desc: 'Dinner, events, company', priceKey: 'price_social' as const },
  { id: 'intimate', label: 'Intimate', desc: 'Full intimacy', priceKey: 'price_intimate' as const },
  { id: 'overnight', label: 'Overnight', desc: 'Extended stay / travel', priceKey: 'price_intimate' as const },
] as const

type BookingType = 'social' | 'intimate' | 'overnight'

const TODAY = new Date().toISOString().split('T')[0]

export default function Book() {
  const { providerId } = useParams<{ providerId: string }>()
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { showToast } = useUIStore()
  const { data: listing } = useProvider(providerId ?? '')

  const [step, setStep] = useState(0)
  const [type, setType] = useState<BookingType>('social')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('18:00')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const profile = listing?.profiles
  const availableTypes = TYPES.filter((t) => {
    if (t.id === 'social') return true
    return listing?.comfort_levels?.includes(t.id === 'overnight' ? 'overnight' : 'intimate') ?? false
  })
  const selectedType = TYPES.find((t) => t.id === type)
  const price = listing?.[selectedType?.priceKey ?? 'price_social']

  async function handleSubmit() {
    if (!session?.user || !providerId) return
    setError('')
    setLoading(true)

    // Validate slot
    const { data: valid } = await supabase.functions.invoke('validate_booking_slot', {
      body: { provider_id: providerId, booking_date: date, start_time: time, end_time: time },
    })
    if (valid && !valid.available) {
      setError(valid.reason ?? 'That time is unavailable. Please pick another.')
      setLoading(false)
      return
    }

    const { error: insertErr } = await supabase.from('bookings').insert({
      client_id: session.user.id,
      provider_id: providerId,
      type,
      booking_date: date,
      start_time: time,
      note: note || null,
      price_agreed: price ?? null,
      status: 'pending',
    })
    setLoading(false)
    if (insertErr) { setError('Something went wrong. Please try again.'); return }
    showToast('Arrangement requested — you\'ll hear back soon.')
    navigate('/discover')
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.back} onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}>←</button>
        <p className={styles.wordmark}>shub</p>
        <div className={styles.dots}>
          {[0, 1, 2].map((i) => <span key={i} className={[styles.dot, i === step ? styles.dotActive : ''].join(' ')} />)}
        </div>
      </div>

      {profile && listing && (
        <div className={styles.providerChip}>
          <span>{profile.avatar_emoji}</span>
          <span>{profile.display_name}</span>
        </div>
      )}

      {/* Step 0: Type */}
      {step === 0 && (
        <div className={styles.stepWrap}>
          <h1 className={styles.stepHeading}>What kind of arrangement?</h1>
          <div className={styles.typeList}>
            {availableTypes.map((t) => (
              <button
                key={t.id}
                className={[styles.typeCard, type === t.id ? styles.typeCardActive : ''].join(' ')}
                onClick={() => setType(t.id)}
              >
                <div className={styles.typeInfo}>
                  <span className={styles.typeLabel}>{t.label}</span>
                  <span className={styles.typeDesc}>{t.desc}</span>
                </div>
                {listing?.[t.priceKey] && (
                  <span className={styles.typePrice}>from ${listing[t.priceKey]} / hr</span>
                )}
              </button>
            ))}
          </div>
          <Btn full onClick={() => setStep(1)}>Continue →</Btn>
        </div>
      )}

      {/* Step 1: Date + time */}
      {step === 1 && (
        <div className={styles.stepWrap}>
          <h1 className={styles.stepHeading}>When would you like to meet?</h1>
          <OBInput label="Date" type="date" min={TODAY} value={date} onChange={(e) => setDate(e.target.value)} />
          <OBInput label="Start time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          <Btn full disabled={!date} onClick={() => setStep(2)}>Continue →</Btn>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 2 && (
        <div className={styles.stepWrap}>
          <h1 className={styles.stepHeading}>Review your request</h1>
          <div className={styles.summary}>
            <div className={styles.summaryRow}><span>Type</span><span>{selectedType?.label}</span></div>
            <div className={styles.summaryRow}><span>Date</span><span>{new Date(date).toLocaleDateString('en-NZ', { weekday: 'short', day: 'numeric', month: 'long' })}</span></div>
            <div className={styles.summaryRow}><span>Time</span><span>{time}</span></div>
            {price && <div className={styles.summaryRow}><span>Rate</span><span className={styles.summaryPrice}>from ${price} / hr</span></div>}
          </div>
          <OBTextarea label="Optional note" placeholder="Anything you'd like them to know…" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
          <Callout v="gold" icon="★">
            This is a request — the companion will confirm before any arrangement is finalised.
          </Callout>
          {error && <p className={styles.error}>{error}</p>}
          <Btn full loading={loading} onClick={handleSubmit}>Request arrangement →</Btn>
        </div>
      )}
    </div>
  )
}
