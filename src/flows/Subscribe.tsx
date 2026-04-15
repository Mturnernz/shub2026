import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Callout } from '../components/primitives'
import { useProviderSubscriptions } from '../lib/queries'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { useUIStore } from '../store/ui.store'
import styles from './Subscribe.module.css'

export default function Subscribe() {
  const { providerId } = useParams<{ providerId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { data: tiers, isLoading: tiersLoading } = useProviderSubscriptions(providerId ?? '')

  async function handleSubscribe() {
    if (!selected || !profile?.id || !providerId) return
    setLoading(true)
    const { error } = await supabase.from('subscriptions').insert({
      client_id: profile.id,
      provider_id: providerId,
      provider_subscription_id: selected,
      status: 'active',
    })
    setLoading(false)
    if (error) {
      showToast('Something went wrong — please try again.')
    } else {
      showToast('Subscription activated!')
      navigate(-1)
    }
  }

  const selectedTier = tiers?.find((t) => t.id === selected)

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.heading}>Subscribe</h1>
        <p className={styles.sub}>Choose a plan to access exclusive content</p>
      </div>

      {tiersLoading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>Loading plans…</p>
      ) : !tiers?.length ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: '#6B7280' }}>
          No subscription plans available yet.
        </p>
      ) : (
        <div className={styles.tiers}>
          {tiers.map((tier) => (
            <button
              key={tier.id}
              className={`${styles.tier} ${selected === tier.id ? styles.tierSelected : ''}`}
              onClick={() => setSelected(tier.id)}
            >
              <div className={styles.tierTop}>
                <span className={styles.tierLabel}>{tier.emoji} {tier.name}</span>
                <span className={styles.tierPrice}>${tier.price}<span className={styles.tierPer}>/mo</span></span>
              </div>
              {tier.description && <p className={styles.tierDesc}>{tier.description}</p>}
              {tier.includes && tier.includes.length > 0 && (
                <ul className={styles.perkList}>
                  {tier.includes.map((p) => (
                    <li key={p} className={styles.perk}><span>✓</span> {p}</li>
                  ))}
                </ul>
              )}
            </button>
          ))}
        </div>
      )}

      <Callout v="ink">Subscriptions renew monthly and can be cancelled at any time from your account.</Callout>

      <div className={styles.footer}>
        <Btn full loading={loading} disabled={!selected || tiersLoading} onClick={handleSubscribe}>
          Subscribe {selectedTier ? `· $${selectedTier.price}/mo` : ''}
        </Btn>
      </div>
    </div>
  )
}
