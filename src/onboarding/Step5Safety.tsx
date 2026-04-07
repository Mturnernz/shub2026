import { Callout, OBInput } from '../components/primitives'
import type { OnboardingData } from './types'
import styles from './onboarding.module.css'

interface Props {
  data: OnboardingData
  update: (d: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step5Safety({ data, update, onNext, onBack }: Props) {
  return (
    <div className={styles.stepContent}>
      {/* ID */}
      <div>
        <p className={styles.fieldHeading}>Identity document <span className={styles.optional}>(optional)</span></p>
        <button type="button" className={styles.uploadBtn}>
          <span>📎</span> Upload photo ID
        </button>
        <p className={styles.hint}>Stored securely. Never shared with clients. Helps unlock the verified badge.</p>
      </div>

      {/* Health check */}
      <OBInput
        label="Last health check date"
        type="date"
        value={data.healthDate}
        onChange={(e) => update({ healthDate: e.target.value })}
        hint="We'll send a reminder 14 days before it expires (every 90 days)"
      />
      <a href="https://nzpc.org.nz/clinics" target="_blank" rel="noopener noreferrer" className={styles.clinicLink}>
        Find a free clinic near you →
      </a>

      {/* Emergency contact */}
      <div className={styles.fieldStack}>
        <OBInput
          label="Emergency contact name"
          placeholder="Someone you trust"
          value={data.emergencyName}
          onChange={(e) => update({ emergencyName: e.target.value })}
        />
        <OBInput
          label="Emergency contact phone"
          type="tel"
          placeholder="021 000 0000"
          value={data.emergencyPhone}
          onChange={(e) => update({ emergencyPhone: e.target.value })}
        />
      </div>

      <Callout v="sage" icon="✓">
        Safety check-in: before each arrangement, shub sends both parties a check-in prompt. One tap to confirm you're safe.
      </Callout>

      <Callout v="lavender" icon="◆">
        NZPC offers free, confidential support for all sex workers in New Zealand.{' '}
        <strong>0800 NZPC (6972)</strong>
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
