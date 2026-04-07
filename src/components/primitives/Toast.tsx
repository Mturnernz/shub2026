import { useEffect } from 'react'
import styles from './Toast.module.css'

export interface ToastProps {
  msg: string
  onClose: () => void
}

const DISMISS_MS = 3200

export default function Toast({ msg, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, DISMISS_MS)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span>{msg}</span>
      <button onClick={onClose} className={styles.close} aria-label="Dismiss">✕</button>
    </div>
  )
}
