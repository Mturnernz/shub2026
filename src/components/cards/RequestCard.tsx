import { Tag, Chip } from '../primitives'
import type { Request, Profile } from '../../types'
import styles from './RequestCard.module.css'

export interface RequestCardProps {
  request: Request & { profiles?: Profile }
  onClick: () => void
  showInterest?: boolean
}

const TYPE_LABELS: Record<Request['type'], string> = {
  weekend: 'Weekend Escape',
  event: 'Special Event',
  extended: 'Extended Stay',
  daytrip: 'Day Trip',
}

function daysAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

export default function RequestCard({ request, onClick, showInterest = false }: RequestCardProps) {
  const profile = request.profiles
  const typeLabel = TYPE_LABELS[request.type]

  const budgetText =
    request.budget_label
      ? request.budget_label
      : request.budget_min && request.budget_max
      ? `$${request.budget_min.toLocaleString()} – $${request.budget_max.toLocaleString()} NZD`
      : request.budget_max
      ? `up to $${request.budget_max.toLocaleString()} NZD`
      : null

  const COVERS_LABELS: Record<string, string> = {
    flights: 'Flights',
    accommodation: 'Accommodation',
    meals: 'Meals',
    transport: 'Transport',
    activities: 'Activities',
    expenses: 'Expenses',
  }

  return (
    <article className={styles.card} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      {/* Gradient banner */}
      <div
        className={styles.banner}
        style={{ background: `linear-gradient(135deg, ${request.gradient_from}, ${request.gradient_to})` }}
      >
        <div className={styles.bannerContent}>
          <span className={styles.bannerEmoji}>{request.emoji}</span>
          <h3 className={styles.destination}>{request.destination}</h3>
          <span className={styles.typeChip}>{typeLabel}</span>
        </div>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        {/* Posted by */}
        <div className={styles.postedBy}>
          {profile ? (
            <>
              <span className={styles.profileEmoji}>{profile.avatar_emoji}</span>
              <span className={styles.profileName}>{profile.display_name}</span>
              {profile.role?.includes('verified') && (
                <span className={styles.verified}>verified</span>
              )}
            </>
          ) : (
            <span className={styles.profileName}>Anonymous</span>
          )}
          <span className={styles.timestamp}>{daysAgo(request.created_at)}</span>
        </div>

        {/* Covers */}
        {request.covers && request.covers.length > 0 && (
          <div className={styles.covers}>
            {request.covers.map((c) => (
              <Tag key={c}>{COVERS_LABELS[c] ?? c}</Tag>
            ))}
          </div>
        )}

        {/* Footer: budget + nights + interest */}
        <div className={styles.footer}>
          <div className={styles.budgetRow}>
            {budgetText && <span className={styles.budget}>{budgetText}</span>}
            {request.nights > 0 && (
              <span className={styles.nights}>{request.nights} night{request.nights !== 1 ? 's' : ''}</span>
            )}
          </div>
          {showInterest && (
            <Chip accent>Express interest →</Chip>
          )}
        </div>
      </div>
    </article>
  )
}
