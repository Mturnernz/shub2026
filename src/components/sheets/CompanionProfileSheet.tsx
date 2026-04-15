import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sheet, Btn, Tag, Callout } from '../primitives'
import { useProvider } from '../../lib/queries'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import { supabase } from '../../lib/supabase'
import styles from './CompanionProfileSheet.module.css'

export interface CompanionProfileSheetProps {
  providerId: string | null
  open: boolean
  onClose: () => void
  onConnect: () => void
}

type Tab = 'about' | 'assurance'

export default function CompanionProfileSheet({
  providerId,
  open,
  onClose,
  onConnect,
}: CompanionProfileSheetProps) {
  const [tab, setTab] = useState<Tab>('about')
  const [reportSent, setReportSent] = useState(false)
  const { session } = useAuthStore()
  const { showToast } = useUIStore()
  const navigate = useNavigate()

  async function handleReport() {
    if (!session?.user || !providerId || reportSent) return
    await supabase.from('incidents').insert({
      reporter_id: session.user.id,
      reported_id: providerId,
      type: 'report',
      urgent: false,
    })
    setReportSent(true)
    showToast('Report submitted. Our team will review it.')
  }

  const { data: listing, isLoading } = useProvider(providerId ?? '')

  function handleConnect() {
    if (!session) {
      navigate('/login')
      return
    }
    onConnect()
  }

  const profile = listing?.profiles

  return (
    <Sheet open={open} onClose={onClose} tall>
      <div className={styles.wrapper}>
        {isLoading || !listing || !profile ? (
          <div className={styles.skeletons}>
            <div className={styles.skeleton} style={{ height: 160 }} />
            <div className={styles.skeleton} style={{ height: 24, width: '60%' }} />
            <div className={styles.skeleton} style={{ height: 80 }} />
          </div>
        ) : (
          <>
            {/* Hero banner */}
            <div
              className={styles.hero}
              style={{ background: `linear-gradient(135deg, ${listing.bg_from}, ${listing.bg_to})` }}
            >
              <span className={styles.heroEmoji}>{profile.avatar_emoji}</span>
              <h2 className={styles.heroName}>{profile.display_name}</h2>
              <p className={styles.heroMeta}>
                {[profile.suburb, profile.pronouns].filter(Boolean).join(' · ')}
              </p>
            </div>

            {/* Tabs */}
            <div className={styles.tabs}>
              <button
                className={[styles.tab, tab === 'about' ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => setTab('about')}
              >
                About
              </button>
              <button
                className={[styles.tab, tab === 'assurance' ? styles.tabActive : ''].filter(Boolean).join(' ')}
                onClick={() => setTab('assurance')}
              >
                Trust & Safety
              </button>
            </div>

            {/* Tab content */}
            <div className={styles.content}>
              {tab === 'about' && (
                <div className={styles.aboutTab}>
                  {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
                  {profile.quote && <p className={styles.quote}>"{profile.quote}"</p>}

                  {listing.mood_tags && listing.mood_tags.length > 0 && (
                    <div className={styles.tagSection}>
                      <p className={styles.tagLabel}>Vibe</p>
                      <div className={styles.tagRow}>
                        {listing.mood_tags.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.comfort_levels && listing.comfort_levels.length > 0 && (
                    <div className={styles.tagSection}>
                      <p className={styles.tagLabel}>Comfort levels</p>
                      <div className={styles.tagRow}>
                        {listing.comfort_levels.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    </div>
                  )}

                  {listing.service_tags && listing.service_tags.length > 0 && (
                    <div className={styles.tagSection}>
                      <p className={styles.tagLabel}>Services</p>
                      <div className={styles.tagRow}>
                        {listing.service_tags.map((t) => (
                          <Tag key={t}>{t}</Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {tab === 'assurance' && (
                <div className={styles.assuranceTab}>
                  {listing.identity_verified ? (
                    <Callout v="sage" icon="✓">
                      <strong>Identity confirmed.</strong> This companion has submitted identity
                      documentation. shub holds a record of this verification on file.
                    </Callout>
                  ) : (
                    <Callout v="ink" icon="ℹ">
                      Identity confirmation not yet completed for this companion.
                    </Callout>
                  )}

                  {listing.health_check_declared ? (
                    <Callout v="sage" icon="✓">
                      <strong>Health check declared.</strong>
                      {listing.health_check_date && (
                        <> Declared on {new Date(listing.health_check_date).toLocaleDateString('en-NZ', { year: 'numeric', month: 'long', day: 'numeric' })}.</>
                      )}
                      {' '}shub holds a record of this declaration on file.
                    </Callout>
                  ) : (
                    <Callout v="ink" icon="ℹ">
                      Health check declaration not yet provided for this companion.
                    </Callout>
                  )}

                  <p className={styles.legalNote}>
                    This platform holds a record of declarations and identity submissions made by
                    companions. shub does not independently verify the accuracy of health
                    declarations. Companions operate under the Prostitution Reform Act 2003 (NZ).
                  </p>
                </div>
              )}
            </div>

            {/* Sticky bottom CTA */}
            <div className={styles.stickyBottom}>
              <Btn v="primary" full onClick={handleConnect}>
                Connect →
              </Btn>
              {session && (
                <button className={styles.reportLink} onClick={handleReport} disabled={reportSent}>
                  {reportSent ? 'Reported' : 'Report this profile'}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </Sheet>
  )
}
