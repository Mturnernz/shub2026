import styles from './Toggle.module.css'

export interface ToggleProps {
  on: boolean
  onChange: (v: boolean) => void
  label?: string
  hint?: string
  disabled?: boolean
}

export default function Toggle({ on, onChange, label, hint, disabled = false }: ToggleProps) {
  return (
    <label className={styles.wrapper}>
      <div className={styles.textGroup}>
        {label && <span className={styles.label}>{label}</span>}
        {hint && <span className={styles.hint}>{hint}</span>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        disabled={disabled}
        className={[styles.track, on ? styles.on : ''].filter(Boolean).join(' ')}
        onClick={() => onChange(!on)}
      >
        <span className={styles.thumb} />
      </button>
    </label>
  )
}
