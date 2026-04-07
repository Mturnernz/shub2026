import { useState } from 'react'
import { OBInput, OBTextarea, Callout } from '../components/primitives'
import type { OnboardingData } from './types'
import styles from './onboarding.module.css'

const CONTEXTS = [
  { id: 'student', label: 'Student', emoji: '📚', prompt: 'Tell us a little about yourself — what you study, what you enjoy. This helps set the tone for your listing.' },
  { id: 'backpacker', label: 'Backpacker', emoji: '🌏', prompt: 'Where are you from, where are you headed? A line or two about your travels works perfectly.' },
  { id: 'extra', label: 'Extra income', emoji: '💸', prompt: 'What brings you here? A brief, warm intro works well — clients appreciate authenticity.' },
  { id: 'curious', label: 'Exploring', emoji: '✨', prompt: 'No pressure to share much — a short, open intro is all you need to get started.' },
] as const

interface Props {
  data: OnboardingData
  update: (d: Partial<OnboardingData>) => void
  onNext: () => void
}

const MAX_DOB = (() => {
  const d = new Date()
  d.setFullYear(d.getFullYear() - 16)
  return d.toISOString().split('T')[0]
})()

export default function Step0Earnings({ data, update, onNext }: Props) {
  const [showFields, setShowFields] = useState(!!data.context)
  const weekly = data.bookingsPerWeek * 220
  const monthly = weekly * 4

  const selectContext = (id: typeof CONTEXTS[number]['id']) => {
    update({ context: id })
    setShowFields(true)
  }

  const canContinue =
    !!data.context &&
    data.bio.trim().length > 10 &&
    data.email.trim().length > 0 &&
    data.dob.length > 0

  return (
    <div className={styles.stepContent}>
      {/* Earnings preview */}
      <div className={styles.earningsCard}>
        <p className={styles.earningsLabel}>Estimated weekly</p>
        <p className={styles.earningsAmount}>${weekly.toLocaleString()}</p>
        <p className={styles.earningsSub}>~${monthly.toLocaleString()} / month · 0% platform fee</p>
        <div className={styles.sliderRow}>
          <span className={styles.sliderLabel}>1 arrangement/wk</span>
          <input
            type="range"
            min={1}
            max={7}
            value={data.bookingsPerWeek}
            onChange={(e) => update({ bookingsPerWeek: Number(e.target.value) })}
            className={styles.slider}
            aria-label="Arrangements per week"
          />
          <span className={styles.sliderLabel}>7/wk</span>
        </div>
      </div>

      <Callout v="sage" icon="◆">
        shub charges 0% — you keep everything you earn.
      </Callout>

      {/* Context selector */}
      <div>
        <p className={styles.fieldHeading}>What brings you to shub?</p>
        <div className={styles.contextGrid}>
          {CONTEXTS.map((c) => (
            <button
              key={c.id}
              type="button"
              className={[styles.contextCard, data.context === c.id ? styles.contextActive : ''].filter(Boolean).join(' ')}
              onClick={() => selectContext(c.id)}
            >
              <span className={styles.contextEmoji}>{c.emoji}</span>
              <span className={styles.contextLabel}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {showFields && data.context && (
        <div className={styles.fieldStack}>
          <OBTextarea
            label="A little about you"
            placeholder={CONTEXTS.find((c) => c.id === data.context)?.prompt ?? ''}
            value={data.bio}
            onChange={(e) => update({ bio: e.target.value })}
            rows={4}
          />
          <OBInput
            label="Email address"
            type="email"
            value={data.email}
            onChange={(e) => update({ email: e.target.value })}
            autoComplete="email"
          />
          <OBInput
            label="Date of birth"
            type="date"
            value={data.dob}
            max={MAX_DOB}
            onChange={(e) => update({ dob: e.target.value })}
            hint="You must be 16 or older to list"
          />
        </div>
      )}

      <button
        type="button"
        className={styles.nextBtn}
        disabled={!canContinue}
        onClick={onNext}
      >
        Continue →
      </button>
    </div>
  )
}
