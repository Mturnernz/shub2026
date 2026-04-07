import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Btn, Chip, OBInput, OBTextarea } from '../components/primitives'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { useUIStore } from '../store/ui.store'
import styles from './PostRequest.module.css'

const TYPES = [
  { id: 'weekend', label: 'Weekend Escape' },
  { id: 'event', label: 'Special Event' },
  { id: 'extended', label: 'Extended Stay' },
  { id: 'daytrip', label: 'Day Trip' },
] as const

const COVERS = [
  { id: 'flights', label: '✈ Flights' },
  { id: 'accommodation', label: '🏨 Accommodation' },
  { id: 'meals', label: '🍽 Meals' },
  { id: 'transport', label: '🚗 Transport' },
  { id: 'activities', label: '🎭 Activities' },
  { id: 'expenses', label: '💰 Expenses' },
]

const TODAY = new Date().toISOString().split('T')[0]

export default function PostRequest() {
  const navigate = useNavigate()
  const { session } = useAuthStore()
  const { showToast } = useUIStore()
  const [step, setStep] = useState(0)
  const [destination, setDestination] = useState('')
  const [type, setType] = useState<string>('weekend')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [covers, setCovers] = useState<string[]>([])
  const [budgetMin, setBudgetMin] = useState('')
  const [budgetMax, setBudgetMax] = useState('')
  const [budgetLabel, setBudgetLabel] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const toggleCover = (id: string) =>
    setCovers((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id])

  const step0Valid = destination.trim().length > 0 && startDate && endDate
  const step2Valid = description.trim().length >= 20

  async function handleSubmit() {
    if (!session?.user) return
    setLoading(true)
    const { error } = await supabase.from('requests').insert({
      client_id: session.user.id,
      destination,
      type,
      start_date: startDate,
      end_date: endDate,
      covers: covers.length > 0 ? covers : null,
      budget_min: budgetMin ? parseInt(budgetMin) : null,
      budget_max: budgetMax ? parseInt(budgetMax) : null,
      budget_label: budgetLabel || null,
      description,
    })
    setLoading(false)
    if (error) { showToast('Something went wrong.'); return }
    showToast('Request posted.')
    navigate('/my-requests')
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => step === 0 ? navigate(-1) : setStep(step - 1)}>←</button>
        <p className={styles.wordmark}>shub</p>
        <div className={styles.dots}>
          {[0, 1, 2].map((i) => <span key={i} className={[styles.dot, i === step ? styles.dotActive : ''].join(' ')} />)}
        </div>
      </div>

      {step === 0 && (
        <div className={styles.stepWrap}>
          <h1 className={styles.heading}>Where are you going?</h1>
          <OBInput label="Destination" placeholder="e.g. Queenstown, Hawke's Bay, Sydney" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <div>
            <p className={styles.fieldLabel}>Type of trip</p>
            <div className={styles.chipGrid}>
              {TYPES.map((t) => (
                <Chip key={t.id} active={type === t.id} onClick={() => setType(t.id)}>{t.label}</Chip>
              ))}
            </div>
          </div>
          <OBInput label="Start date" type="date" min={TODAY} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <OBInput label="End date" type="date" min={startDate || TODAY} value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <Btn full disabled={!step0Valid} onClick={() => setStep(1)}>Continue →</Btn>
        </div>
      )}

      {step === 1 && (
        <div className={styles.stepWrap}>
          <h1 className={styles.heading}>What's covered?</h1>
          <p className={styles.sub}>Select everything your companion can expect you to cover</p>
          <div className={styles.coversGrid}>
            {COVERS.map((c) => (
              <button
                key={c.id}
                className={[styles.coverBtn, covers.includes(c.id) ? styles.coverActive : ''].join(' ')}
                onClick={() => toggleCover(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>
          <Btn full onClick={() => setStep(2)}>Continue →</Btn>
        </div>
      )}

      {step === 2 && (
        <div className={styles.stepWrap}>
          <h1 className={styles.heading}>Compensation details</h1>
          <div className={styles.budgetRow}>
            <OBInput label="Min (NZD)" type="number" placeholder="500" value={budgetMin} onChange={(e) => setBudgetMin(e.target.value)} />
            <OBInput label="Max (NZD)" type="number" placeholder="1500" value={budgetMax} onChange={(e) => setBudgetMax(e.target.value)} />
          </div>
          <OBInput label="Budget label" placeholder='e.g. "Negotiable" or "All inclusive"' value={budgetLabel} onChange={(e) => setBudgetLabel(e.target.value)} hint="Optional — overrides the range display" />
          <OBTextarea label="About this arrangement" placeholder="Tell companions what you're looking for, what the trip involves, and what kind of person you'd love to spend it with…" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} hint={`${description.trim().length}/20 characters minimum`} />
          <Btn full loading={loading} disabled={!step2Valid} onClick={handleSubmit}>Post request →</Btn>
        </div>
      )}
    </div>
  )
}
