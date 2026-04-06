import React from 'react'
import styles from './Btn.module.css'

export type BtnVariant = 'primary' | 'gold' | 'teal' | 'ghost' | 'ink' | 'soft' | 'sage'

export interface BtnProps {
  children: React.ReactNode
  onClick?: () => void
  v?: BtnVariant
  full?: boolean
  sm?: boolean
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
  style?: React.CSSProperties
  className?: string
}

export default function Btn({
  children,
  onClick,
  v = 'primary',
  full = false,
  sm = false,
  disabled = false,
  loading = false,
  type = 'button',
  style,
  className = '',
}: BtnProps) {
  const classes = [
    styles.btn,
    styles[v],
    full ? styles.full : '',
    sm ? styles.sm : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      style={style}
    >
      {loading ? <span className={styles.spinner} aria-hidden="true" /> : null}
      <span style={loading ? { opacity: 0 } : undefined}>{children}</span>
    </button>
  )
}
