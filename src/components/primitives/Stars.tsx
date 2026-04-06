import styles from './Stars.module.css'

export interface StarsProps {
  n: number
  size?: number
}

export default function Stars({ n, size = 14 }: StarsProps) {
  const full = Math.floor(n)
  const half = n - full >= 0.5

  return (
    <span className={styles.stars} style={{ fontSize: size }} aria-label={`${n} stars`}>
      {Array.from({ length: 5 }, (_, i) => {
        if (i < full) return <span key={i} className={styles.filled}>★</span>
        if (i === full && half) return <span key={i} className={styles.half}>★</span>
        return <span key={i} className={styles.empty}>★</span>
      })}
    </span>
  )
}
