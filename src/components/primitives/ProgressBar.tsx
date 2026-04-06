import styles from './ProgressBar.module.css'

export interface ProgressBarProps {
  step: number
  total: number
}

export default function ProgressBar({ step, total }: ProgressBarProps) {
  return (
    <div className={styles.bar} role="progressbar" aria-valuenow={step} aria-valuemin={0} aria-valuemax={total}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={[styles.segment, i < step ? styles.filled : ''].filter(Boolean).join(' ')}
        />
      ))}
    </div>
  )
}
