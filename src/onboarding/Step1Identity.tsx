import { OBInput } from '../components/primitives'
import type { OnboardingData } from './types'
import styles from './onboarding.module.css'

const AVATARS = ['🌸', '✨', '🌙', '🦋', '🌺', '💫', '🌿', '🔮', '🌊', '🦚', '🌹', '🍀']
const SUBURBS = ['Auckland CBD', 'Ponsonby', 'Parnell', 'Newmarket', 'Mt Eden', 'Grey Lynn', 'Takapuna', 'Remuera', 'Onehunga', 'Henderson', 'Manukau', 'Wellington CBD', 'Christchurch CBD', 'Dunedin CBD', 'Hamilton CBD']
const PRONOUNS = ['she/her', 'he/him', 'they/them', 'she/they', 'he/they', 'any/all']

interface Props {
  data: OnboardingData
  update: (d: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step1Identity({ data, update, onNext, onBack }: Props) {
  const canContinue = data.displayName.trim().length > 0 && data.suburb.length > 0

  return (
    <div className={styles.stepContent}>
      {/* Avatar picker */}
      <div>
        <p className={styles.fieldHeading}>Pick your avatar</p>
        <div className={styles.avatarGrid}>
          {AVATARS.map((a) => (
            <button
              key={a}
              type="button"
              className={[styles.avatarBtn, data.avatar === a ? styles.avatarActive : ''].filter(Boolean).join(' ')}
              onClick={() => update({ avatar: a })}
              aria-label={a}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <OBInput
        label="Display name"
        placeholder="How you'd like to be known — not your real name"
        value={data.displayName}
        onChange={(e) => update({ displayName: e.target.value })}
        hint="This is what clients will see"
      />

      {/* Suburb */}
      <div>
        <p className={styles.fieldHeading}>Your suburb</p>
        <div className={styles.chipWrap}>
          {SUBURBS.map((s) => (
            <button
              key={s}
              type="button"
              className={[styles.chip, data.suburb === s ? styles.chipActive : ''].filter(Boolean).join(' ')}
              onClick={() => update({ suburb: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Pronouns */}
      <div>
        <p className={styles.fieldHeading}>Pronouns <span className={styles.optional}>(optional)</span></p>
        <div className={styles.chipWrap}>
          {PRONOUNS.map((p) => (
            <button
              key={p}
              type="button"
              className={[styles.chip, data.pronouns === p ? styles.chipActive : ''].filter(Boolean).join(' ')}
              onClick={() => update({ pronouns: data.pronouns === p ? '' : p })}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <OBInput
        label="NZ phone number"
        type="tel"
        placeholder="021 000 0000"
        value={data.phone}
        onChange={(e) => update({ phone: e.target.value })}
        hint="Optional — only visible to you and confirmed bookings"
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
