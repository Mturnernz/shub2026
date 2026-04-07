import styles from './FieldLabel.module.css'

export interface FieldLabelProps {
  children: React.ReactNode
  htmlFor?: string
  required?: boolean
}

export default function FieldLabel({ children, htmlFor, required = false }: FieldLabelProps) {
  return (
    <label htmlFor={htmlFor} className={styles.label}>
      {children}
      {required && <span className={styles.required} aria-hidden="true"> *</span>}
    </label>
  )
}
