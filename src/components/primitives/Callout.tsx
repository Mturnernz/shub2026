import React from 'react'
import styles from './Callout.module.css'

export type CalloutVariant = 'sage' | 'gold' | 'primary' | 'ink' | 'lavender'

const ICONS: Record<CalloutVariant, string> = {
  sage: '✓',
  gold: '★',
  primary: '♦',
  ink: 'ℹ',
  lavender: '◆',
}

export interface CalloutProps {
  v?: CalloutVariant
  children: React.ReactNode
  icon?: string
}

export default function Callout({ v = 'sage', children, icon }: CalloutProps) {
  return (
    <div className={[styles.callout, styles[v]].join(' ')}>
      <span className={styles.icon} aria-hidden="true">{icon ?? ICONS[v]}</span>
      <div className={styles.body}>{children}</div>
    </div>
  )
}
