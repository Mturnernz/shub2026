import { OBTextarea } from '../components/primitives'
import type { OnboardingData } from './types'
import styles from './onboarding.module.css'

const VIBES = ['Warm', 'Witty', 'Adventurous', 'Calm', 'Cultured', 'Playful', 'Attentive', 'Confident']
const MAX_VIBES = 3

interface Props {
  data: OnboardingData
  update: (d: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step2Vibe({ data, update, onNext, onBack }: Props) {
  const toggleVibe = (v: string) => {
    if (data.vibes.includes(v)) {
      update({ vibes: data.vibes.filter((x) => x !== v) })
    } else if (data.vibes.length < MAX_VIBES) {
      update({ vibes: [...data.vibes, v] })
    }
  }

  const canContinue = data.vibes.length > 0

  return (
    <div className={styles.stepContent}>
      <p className={styles.fieldHeading}>Choose up to 3 words that describe you</p>
      <div className={styles.vibeGrid}>
        {VIBES.map((v) => {
          const active = data.vibes.includes(v)
          const maxed = data.vibes.length >= MAX_VIBES && !active
          return (
            <button
              key={v}
              type="button"
              className={[styles.vibeBtn, active ? styles.vibeBtnActive : '', maxed ? styles.vibeBtnDimmed : ''].filter(Boolean).join(' ')}
              onClick={() => !maxed && toggleVibe(v)}
              aria-pressed={active}
            >
              {v}
            </button>
          )
        })}
      </div>

      <OBTextarea
        label="Your opening quote"
        placeholder="Something that sounds like you — one sentence is perfect"
        value={data.quote}
        onChange={(e) => update({ quote: e.target.value })}
        rows={3}
        hint="Optional — shown on your profile card"
      />

      <div className={styles.navRow}>
        <button type="button" className={styles.backBtn} onClick={onBack}>← Back</button>
        <button type="button" className={styles.nextBtn} disabled={!canContinue} onClick={onNext} style={{ flex: 1 }}>
          Continue →
        </button>
      </div>
    </div>
  )
}
