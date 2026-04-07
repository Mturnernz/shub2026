import { useState } from 'react'
import { Callout, OBTextarea } from '../components/primitives'
import type { OnboardingData } from './types'
import styles from './onboarding.module.css'

const LEVELS = [
  {
    id: 'social',
    label: 'Social',
    desc: 'Company, conversation, dining, events',
    locked: true,
    examples: ['Dinner dates', 'Event companionship', 'Social occasions', 'Cultural outings'],
  },
  {
    id: 'sensual',
    label: 'Sensual',
    desc: 'Massage, kissing, light intimacy',
    locked: false,
    examples: ['Full body massage', 'Sensual touch', 'GFE / BFE experience'],
  },
  {
    id: 'intimate',
    label: 'Intimate',
    desc: 'Full intimacy services',
    locked: false,
    examples: ['Intimate encounters', 'Overnight intimacy', 'Fantasy experiences'],
  },
  {
    id: 'overnight',
    label: 'Overnight',
    desc: 'Extended stays, travel companionship',
    locked: false,
    examples: ['Overnight stays', 'Weekend trips', 'Travel companion'],
  },
]

interface Props {
  data: OnboardingData
  update: (d: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step3Comfort({ data, update, onNext, onBack }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (id: string) => {
    if (id === 'social') return
    const has = data.comfortLevels.includes(id)
    update({ comfortLevels: has ? data.comfortLevels.filter((x) => x !== id) : [...data.comfortLevels, id] })
  }

  return (
    <div className={styles.stepContent}>
      <div className={styles.comfortList}>
        {LEVELS.map((level) => {
          const active = data.comfortLevels.includes(level.id)
          return (
            <div key={level.id} className={styles.comfortRow}>
              <div className={styles.comfortMain}>
                <button
                  type="button"
                  className={[styles.comfortCheck, active ? styles.comfortCheckActive : '', level.locked ? styles.comfortCheckLocked : ''].filter(Boolean).join(' ')}
                  onClick={() => toggle(level.id)}
                  aria-pressed={active}
                  disabled={level.locked}
                  aria-label={level.label}
                />
                <div className={styles.comfortText}>
                  <span className={styles.comfortLabel}>{level.label}</span>
                  <span className={styles.comfortDesc}>{level.desc}</span>
                </div>
                <button
                  type="button"
                  className={styles.expandBtn}
                  onClick={() => setExpanded(expanded === level.id ? null : level.id)}
                  aria-label="Show examples"
                >
                  {expanded === level.id ? '▲' : '▼'}
                </button>
              </div>
              {expanded === level.id && (
                <ul className={styles.exampleList}>
                  {level.examples.map((e) => <li key={e}>{e}</li>)}
                </ul>
              )}
            </div>
          )
        })}
      </div>

      <Callout v="ink" icon="ℹ">
        Not sure yet? Starting with Social only is completely normal — you can update anytime.
      </Callout>

      <OBTextarea
        label="Private notes to yourself"
        placeholder="Hard limits, preferences, anything you want to remember — never shown to clients"
        value={data.privateNotes}
        onChange={(e) => update({ privateNotes: e.target.value })}
        rows={3}
        hint="Only visible to you"
      />

      <Callout v="lavender" icon="◆">
        Under the Prostitution Reform Act 2003, you have the right to refuse any request, at any time, for any reason.
      </Callout>

      <div className={styles.navRow}>
        <button type="button" className={styles.backBtn} onClick={onBack}>← Back</button>
        <button type="button" className={styles.nextBtn} onClick={onNext} style={{ flex: 1 }}>
          Continue →
        </button>
      </div>
    </div>
  )
}
