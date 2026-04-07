import { Callout } from '../components/primitives'
import type { OnboardingData } from './types'
import styles from './onboarding.module.css'

interface Props {
  data: OnboardingData
  update: (d: Partial<OnboardingData>) => void
  onSubmit: () => void
  onBack: () => void
  submitting: boolean
}

export default function Step6Preview({ data, update, onSubmit, onBack, submitting }: Props) {
  const canSubmit = data.consentAge && data.consentWorkRights && data.consentTerms

  return (
    <div className={styles.stepContent}>
      {/* Profile preview */}
      <div className={styles.previewCard} style={{ background: `linear-gradient(135deg, #F5D8E0, #ECC8D0)` }}>
        <div className={styles.previewAvatar}>{data.avatar}</div>
        <p className={styles.previewName}>{data.displayName || 'Your name'}</p>
        {data.suburb && <p className={styles.previewSub}>{data.suburb}</p>}
        {data.pronouns && <p className={styles.previewSub}>{data.pronouns}</p>}
        {data.quote && <p className={styles.previewQuote}>"{data.quote}"</p>}
        {data.vibes.length > 0 && (
          <div className={styles.previewVibes}>
            {data.vibes.map((v) => <span key={v} className={styles.previewVibe}>{v}</span>)}
          </div>
        )}
        {data.rateSocial && <p className={styles.previewPrice}>from ${data.rateSocial} / hr</p>}
      </div>

      {/* What happens next */}
      <div className={styles.nextSteps}>
        <p className={styles.fieldHeading}>What happens next</p>
        {[
          'Your listing is submitted for review',
          'Our team checks it within 24 hours',
          'You\'ll receive an email when it goes live',
          'You can edit your listing at any time',
        ].map((s, i) => (
          <div key={i} className={styles.nextStep}>
            <span className={styles.nextStepNum}>{i + 1}</span>
            <span>{s}</span>
          </div>
        ))}
      </div>

      {/* Consent */}
      <div className={styles.consentStack}>
        <label className={styles.consentRow}>
          <input
            type="checkbox"
            checked={data.consentAge}
            onChange={(e) => update({ consentAge: e.target.checked })}
            className={styles.checkbox}
          />
          <span className={styles.consentText}>
            I confirm I am 18 years of age or older. I understand that listing on shub as a companion under the age of 18 is prohibited, and that providing a false declaration is a breach of the shub provider terms.
          </span>
        </label>

        <label className={styles.consentRow}>
          <input
            type="checkbox"
            checked={data.consentWorkRights}
            onChange={(e) => update({ consentWorkRights: e.target.checked })}
            className={styles.checkbox}
          />
          <span className={styles.consentText}>
            I confirm I have the legal right to work in New Zealand. I understand that sex work on a visitor or tourist visa is not permitted under NZ immigration law and that it is my responsibility to ensure my visa conditions allow this activity.
          </span>
        </label>

        <Callout v="lavender" icon="◆">
          Unsure about your visa? NZPC can advise confidentially. <strong>0800 NZPC (6972)</strong>
        </Callout>

        <label className={styles.consentRow}>
          <input
            type="checkbox"
            checked={data.consentTerms}
            onChange={(e) => update({ consentTerms: e.target.checked })}
            className={styles.checkbox}
          />
          <span className={styles.consentText}>
            I am listing on shub of my own free will. I understand I can decline any enquiry, pause my listing, or remove it entirely at any time. I agree to shub's provider terms and safety guidelines.
          </span>
        </label>
      </div>

      <div className={styles.navRow}>
        <button type="button" className={styles.backBtn} onClick={onBack}>← Back</button>
        <button
          type="button"
          className={styles.nextBtn}
          disabled={!canSubmit || submitting}
          onClick={onSubmit}
          style={{ flex: 1 }}
        >
          {submitting ? 'Submitting…' : 'Submit listing →'}
        </button>
      </div>
    </div>
  )
}
