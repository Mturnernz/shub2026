import styles from './StepLabel.module.css'

export interface StepLabelProps {
  step: number
  total: number
  label: string
}

export default function StepLabel({ step, total, label }: StepLabelProps) {
  return (
    <p className={styles.label}>
      <span className={styles.name}>{label.toUpperCase()}</span>
      <span className={styles.dot}>·</span>
      <span className={styles.count}>{step} of {total}</span>
    </p>
  )
}
