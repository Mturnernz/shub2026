import { useState } from 'react'
import { Tag, Stars } from '../primitives'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import type { ProviderListing, Profile } from '../../types'
import styles from './ProviderCard.module.css'

export interface ProviderCardProps {
  listing: ProviderListing & { profiles: Profile }
  onClick: () => void
}

export default function ProviderCard({ listing, onClick }: ProviderCardProps) {
  const { session } = useAuthStore()
  const [saved, setSaved] = useState(false)
  const [savingInProgress, setSavingInProgress] = useState(false)

  const profile = listing.profiles
  const moodString = listing.mood_tags?.join(' · ') ?? ''

  const typeLabel =
    listing.type === 'inperson'
      ? 'In-person'
      : listing.type === 'online'
      ? 'Online'
      : 'Both'

  async function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    if (!session?.user || savingInProgress) return
    setSavingInProgress(true)
    if (saved) {
      await supabase
        .from('saved_providers')
        .delete()
        .eq('client_id', session.user.id)
        .eq('provider_id', listing.provider_id)
      setSaved(false)
    } else {
      await supabase
        .from('saved_providers')
        .upsert({ client_id: session.user.id, provider_id: listing.provider_id })
      setSaved(true)
    }
    setSavingInProgress(false)
  }

  return (
    <article className={styles.card} onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      {/* Gradient banner */}
      <div
        className={styles.banner}
        style={{ background: `linear-gradient(135deg, ${listing.bg_from}, ${listing.bg_to})` }}
      >
        <span className={styles.emoji}>{profile.avatar_emoji}</span>

        {/* Save heart */}
        {session && (
          <button
            className={styles.heart}
            onClick={handleSave}
            aria-label={saved ? 'Unsave companion' : 'Save companion'}
          >
            {saved ? '♥' : '♡'}
          </button>
        )}

        {/* Verification badges */}
        <div className={styles.badges}>
          {listing.identity_verified && (
            <span className={styles.badgeSage}>identity confirmed</span>
          )}
          {listing.health_check_declared && (
            <span className={styles.badgeTeal}>health check declared</span>
          )}
        </div>
      </div>

      {/* Card body */}
      <div className={styles.body}>
        <div className={styles.nameRow}>
          <span className={styles.displayName}>{profile.display_name}</span>
          <Tag>{typeLabel}</Tag>
        </div>

        <p className={styles.meta}>
          {[profile.suburb, profile.pronouns].filter(Boolean).join(' · ')}
        </p>

        {moodString && (
          <p className={styles.mood}>{moodString}</p>
        )}

        <div className={styles.footer}>
          <div className={styles.starsRow}>
            <Stars n={listing.rating} size={12} />
            <span className={styles.reviewCount}>({listing.review_count})</span>
          </div>
          {listing.price_social && (
            <span className={styles.price}>from ${listing.price_social} / hr</span>
          )}
        </div>
      </div>
    </article>
  )
}
