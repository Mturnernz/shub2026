import { useNavigate } from 'react-router-dom'
import { Callout } from '../components/primitives'
import type { OnboardingData } from './types'
import styles from './onboarding.module.css'

interface Props {
  data: OnboardingData
}

export default function Step7Done({ data }: Props) {
  const navigate = useNavigate()

  return (
    <div className={styles.stepContent} style={{ textAlign: 'center', paddingTop: 32 }}>
      <div className={styles.doneAvatar}>{data.avatar}</div>
      <h2 className={styles.doneHeading}>Welcome to shub,<br />{data.displayName || 'friend'}.</h2>
      <p className={styles.doneSubtitle}>Your listing is under review. We'll email you within 24 hours.</p>

      <Callout v="sage" icon="✓">
        <strong>While you wait:</strong> browse other listings to get a feel for the platform, or set up your availability and services.
      </Callout>

      <Callout v="lavender" icon="◆">
        NZPC is here if you ever need support. <strong>0800 NZPC (6972)</strong>
      </Callout>

      <button
        type="button"
        className={styles.nextBtn}
        style={{ marginTop: 24 }}
        onClick={() => navigate('/dashboard')}
      >
        Go to my dashboard →
      </button>
    </div>
  )
}
