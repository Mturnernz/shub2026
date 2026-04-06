import styles from './Chip.module.css'

export interface ChipProps {
  children: React.ReactNode
  active?: boolean
  onClick?: () => void
  accent?: boolean // gold accent when true
}

export default function Chip({ children, active = false, onClick, accent = false }: ChipProps) {
  const classes = [
    styles.chip,
    active ? (accent ? styles.accentActive : styles.active) : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" className={classes} onClick={onClick}>
      {children}
    </button>
  )
}
