import React, { useEffect, useRef } from 'react'
import styles from './Sheet.module.css'

export interface SheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
  tall?: boolean
}

export default function Sheet({ open, onClose, children, tall = false }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open, onClose])

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div
        ref={sheetRef}
        className={[styles.sheet, tall ? styles.tall : ''].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
