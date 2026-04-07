import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Callout, OBInput } from '../components/primitives'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { useUIStore } from '../store/ui.store'
import styles from './ContentRequest.module.css'

const CONTENT_TYPES = [
  { value: 'photo', label: 'Photo set', icon: '📷' },
  { value: 'video', label: 'Video', icon: '🎬' },
  { value: 'voice', label: 'Voice message', icon: '🎙️' },
  { value: 'written', label: 'Written story', icon: '✍️' },
]

export default function ContentRequest() {
  const { providerId } = useParams<{ providerId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [step, setStep] = useState(0)
  const [contentType, setContentType] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    if (!profile?.id || !providerId) return
    setLoading(true)
    const { error } = await supabase.from('content_requests').insert({
      client_id: profile.id,
      provider_id: providerId,
      content_type: contentType,
      description,
      budget_nzd: budget ? parseFloat(budget) : null,
      status: 'pending',
    })
    setLoading(false)
    if (error) {
      showToast('Something went wrong — please try again.')
    } else {
      showToast('Content request sent!')
      navigate(-1)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}>
          ← {step === 0 ? 'Back' : 'Previous'}
        </button>
        <div className={styles.progress}>
          {[0, 1].map((i) => (
            <div key={i} className={`${styles.dot} ${i <= step ? styles.dotActive : ''}`} />
          ))}
        </div>
      </div>

      {step === 0 && (
        <div className={styles.stepWrap}>
          <h1 className={styles.heading}>What type of content?</h1>
          <p className={styles.sub}>Choose the format you'd like to request</p>
          <div className={styles.typeGrid}>
            {CONTENT_TYPES.map((t) => (
              <button
                key={t.value}
                className={`${styles.typeCard} ${contentType === t.value ? styles.typeCardSelected : ''}`}
                onClick={() => setContentType(t.value)}
              >
                <span className={styles.typeIcon}>{t.icon}</span>
                <span className={styles.typeLabel}>{t.label}</span>
              </button>
            ))}
          </div>
          <Btn full disabled={!contentType} onClick={() => setStep(1)}>
            Next
          </Btn>
        </div>
      )}

      {step === 1 && (
        <div className={styles.stepWrap}>
          <h1 className={styles.heading}>Describe your request</h1>
          <p className={styles.sub}>Be specific so the companion can give you an accurate quote</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label style={{ fontFamily: 'var(--font-body)', fontSize: '0.875rem', fontWeight: 500, color: 'var(--ink)' }}>
              What would you like?
            </label>
            <textarea
              placeholder="Describe the theme, scenario, or specific details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              style={{
                fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--ink)',
                background: 'var(--card)', border: '1.5px solid var(--border)', borderRadius: 'var(--radius)',
                padding: '10px 14px', resize: 'vertical', lineHeight: 1.45, outline: 'none', width: '100%',
                boxSizing: 'border-box',
              }}
            />
          </div>
          <OBInput
            label="Your budget (NZD)"
            type="number"
            placeholder="e.g. 80"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            hint="Optional — helps the companion tailor their response"
          />
          <Callout v="lavender" icon="◆">
            The companion may counter-offer or decline. You only pay if both parties agree.
          </Callout>
          <Btn full loading={loading} disabled={description.length < 20} onClick={handleSubmit}>
            Send request
          </Btn>
        </div>
      )}
    </div>
  )
}
