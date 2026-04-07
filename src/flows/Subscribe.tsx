import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Callout } from '../components/primitives'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { useUIStore } from '../store/ui.store'
import styles from './Subscribe.module.css'

const TIERS = [
  {
    id: 'basic',
    label: 'Basic',
    price: 15,
    description: 'Access to exclusive photos and updates',
    perks: ['Weekly photo sets', 'Behind-the-scenes content', 'Direct message priority'],
  },
  {
    id: 'standard',
    label: 'Standard',
    price: 30,
    description: 'More content, more connection',
    perks: ['Everything in Basic', 'Video content', 'Monthly live Q&A', 'Custom requests (1/month)'],
  },
  {
    id: 'premium',
    label: 'Premium',
    price: 60,
    description: 'The full experience',
    perks: ['Everything in Standard', 'Unlimited custom requests', 'Video calls (30 min/month)', 'Priority booking'],
  },
]

export default function Subscribe() {
  const { providerId } = useParams<{ providerId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    if (!selected || !profile?.id || !providerId) return
    setLoading(true)
    const tier = TIERS.find((t) => t.id === selected)!
    const { error } = await supabase.from('subscriptions').insert({
      subscriber_id: profile.id,
      provider_id: providerId,
      tier: selected,
      price_nzd: tier.price,
      status: 'active',
      renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    setLoading(false)
    if (error) {
      showToast('Something went wrong — please try again.')
    } else {
      showToast('Subscription activated!')
      navigate(-1)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.heading}>Subscribe</h1>
        <p className={styles.sub}>Choose a plan to access exclusive content</p>
      </div>

      <div className={styles.tiers}>
        {TIERS.map((tier) => (
          <button
            key={tier.id}
            className={`${styles.tier} ${selected === tier.id ? styles.tierSelected : ''}`}
            onClick={() => setSelected(tier.id)}
          >
            <div className={styles.tierTop}>
              <span className={styles.tierLabel}>{tier.label}</span>
              <span className={styles.tierPrice}>${tier.price}<span className={styles.tierPer}>/mo</span></span>
            </div>
            <p className={styles.tierDesc}>{tier.description}</p>
            <ul className={styles.perkList}>
              {tier.perks.map((p) => (
                <li key={p} className={styles.perk}><span>✓</span> {p}</li>
              ))}
            </ul>
          </button>
        ))}
      </div>

      <Callout v="ink">Subscriptions renew monthly and can be cancelled at any time from your account.</Callout>

      <div className={styles.footer}>
        <Btn full loading={loading} disabled={!selected} onClick={handleSubscribe}>
          Subscribe {selected ? `· $${TIERS.find((t) => t.id === selected)!.price}/mo` : ''}
        </Btn>
      </div>
    </div>
  )
}
