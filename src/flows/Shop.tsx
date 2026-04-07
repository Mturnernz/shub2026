import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Btn, Callout } from '../components/primitives'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { useUIStore } from '../store/ui.store'
import styles from './Shop.module.css'

interface ShopItem {
  id: string
  title: string
  description: string | null
  price_nzd: number
  category: string
}

export default function Shop() {
  const { providerId } = useParams<{ providerId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [items, setItems] = useState<ShopItem[]>([])
  const [loading, setLoading] = useState(true)
  const [purchasing, setPurchasing] = useState<string | null>(null)

  useEffect(() => {
    if (!providerId) return
    supabase
      .from('shop_items')
      .select('*')
      .eq('provider_id', providerId)
      .eq('active', true)
      .then(({ data }) => {
        setItems((data as ShopItem[]) ?? [])
        setLoading(false)
      })
  }, [providerId])

  async function handlePurchase(item: ShopItem) {
    if (!profile?.id) return
    setPurchasing(item.id)
    const { error } = await supabase.from('shop_orders').insert({
      buyer_id: profile.id,
      provider_id: providerId,
      item_id: item.id,
      amount_nzd: item.price_nzd,
      status: 'pending',
    })
    setPurchasing(null)
    if (error) {
      showToast('Something went wrong — please try again.')
    } else {
      showToast(`${item.title} purchased!`)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <button className={styles.back} onClick={() => navigate(-1)}>← Back</button>
        <h1 className={styles.heading}>Shop</h1>
        <p className={styles.sub}>Purchase exclusive items and content</p>
      </div>

      {loading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : items.length === 0 ? (
        <Callout v="sage">No items available yet — check back soon.</Callout>
      ) : (
        <div className={styles.list}>
          {items.map((item) => (
            <div key={item.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemCategory}>{item.category}</span>
                <p className={styles.itemTitle}>{item.title}</p>
                {item.description && <p className={styles.itemDesc}>{item.description}</p>}
              </div>
              <div className={styles.itemActions}>
                <span className={styles.itemPrice}>${item.price_nzd}</span>
                <Btn
                  sm
                  loading={purchasing === item.id}
                  onClick={() => handlePurchase(item)}
                >
                  Buy
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      <Callout v="ink">All purchases are final. Content will be delivered within 24 hours.</Callout>
    </div>
  )
}
