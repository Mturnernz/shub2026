import { useNavigate } from 'react-router-dom'
import { Btn } from '../components/primitives'
import styles from './auth.module.css'

export default function EmailConfirmed() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.wordmark}>shub</div>
      <div className={styles.card}>
        <h1 className={styles.heading}>You're confirmed</h1>
        <p className={styles.body}>
          Your email address has been verified. Welcome to shub.
        </p>
        <Btn full onClick={() => navigate('/discover', { replace: true })}>
          Start browsing
        </Btn>
      </div>
    </div>
  )
}
