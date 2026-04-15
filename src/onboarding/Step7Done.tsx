import { useNavigate } from 'react-router-dom'
import type { OnboardingData } from './types'
import styles from './Step7Done.module.css'

interface Props {
  data: OnboardingData
}

export default function Step7Done({ data }: Props) {
  const navigate = useNavigate()

  return (
    <div className={styles.wrap}>
      <div className={styles.dots}>
        <div className={styles.dot} style={{ background: 'var(--primary)' }} />
        <div className={styles.dot} style={{ background: 'var(--gold)' }} />
        <div className={styles.dot} style={{ background: 'var(--sage)' }} />
        <div className={styles.dot} style={{ background: 'var(--primary)', opacity: 0.4 }} />
        <div className={styles.dot} style={{ background: 'var(--gold)', opacity: 0.4 }} />
      </div>

      <h2 className={styles.heading}>Welcome to<br />the network.</h2>
      <p className={styles.sub}>
        Your listing is under review.{' '}
        We'll email {data.email ? data.email : 'you'} within 24 hours.
      </p>

      <div className={styles.cards}>
        <button className={styles.actionCard} onClick={() => navigate('/listing/availability')}>
          <span className={styles.actionIcon}>📅</span>
          <div className={styles.actionText}>
            <span className={styles.actionTitle}>Set availability</span>
            <span className={styles.actionSub}>Choose your days and hours</span>
          </div>
          <span className={styles.actionArrow}>›</span>
        </button>

        <button className={styles.actionCard} onClick={() => navigate('/listing/online')}>
          <span className={styles.actionIcon}>✦</span>
          <div className={styles.actionText}>
            <span className={styles.actionTitle}>Add services</span>
            <span className={styles.actionSub}>Subscriptions, content, extras</span>
          </div>
          <span className={styles.actionArrow}>›</span>
        </button>

        <button className={styles.actionCard} onClick={() => navigate('/discover')}>
          <span className={styles.actionIcon}>🔍</span>
          <div className={styles.actionText}>
            <span className={styles.actionTitle}>Explore as client</span>
            <span className={styles.actionSub}>See shub from the other side</span>
          </div>
          <span className={styles.actionArrow}>›</span>
        </button>
      </div>

      <button className={styles.dashBtn} onClick={() => navigate('/dashboard')}>
        Go to my dashboard →
      </button>

      <p className={styles.nzpc}>
        NZPC is here if you need support — <strong>0800 NZPC (6972)</strong>
      </p>
    </div>
  )
}
