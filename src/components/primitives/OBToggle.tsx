import styles from './OBToggle.module.css'

export interface OBToggleProps {
  on: boolean
  onChange: (v: boolean) => void
  label: string
  hint?: string
  disabled?: boolean
}

export default function OBToggle({ on, onChange, label, hint, disabled = false }: OBToggleProps) {
  return (
    <div className={styles.row}>
      <div className={styles.textGroup}>
        <span className={styles.label}>{label}</span>
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
    </div>
  )
}
