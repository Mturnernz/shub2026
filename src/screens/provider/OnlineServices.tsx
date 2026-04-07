import { useState, useEffect } from 'react'
import { Btn, Sheet, OBInput, OBTextarea, OBToggle, Tag } from '../../components/primitives'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import type { ProviderSubscription, ProviderContent, ShopItem } from '../../types'
import styles from './OnlineServices.module.css'

type SheetType = 'sub' | 'content' | 'shop' | null

export default function OnlineServices() {
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [subs, setSubs] = useState<ProviderSubscription[]>([])
  const [content, setContent] = useState<ProviderContent[]>([])
  const [shop, setShop] = useState<ShopItem[]>([])
  const [sheetType, setSheetType] = useState<SheetType>(null)
  const [saving, setSaving] = useState(false)

  // Sub form
  const [subName, setSubName] = useState(''); const [subEmoji, setSubEmoji] = useState('✨'); const [subPrice, setSubPrice] = useState(''); const [subDesc, setSubDesc] = useState(''); const [subPopular, setSubPopular] = useState(false)
  // Content form
  const [cName, setCName] = useState(''); const [cEmoji, setCEmoji] = useState('🎬'); const [cPrice, setCPrice] = useState(''); const [cDesc, setCDesc] = useState(''); const [cHours, setCHours] = useState('48')
  // Shop form
  const [sName, setSName] = useState(''); const [sEmoji, setSEmoji] = useState('📦'); const [sPrice, setSPrice] = useState(''); const [sDesc, setSDesc] = useState(''); const [sStock, setSStock] = useState('1')

  useEffect(() => {
    if (!profile?.id) return
    Promise.all([
      supabase.from('provider_subscriptions').select('*').eq('provider_id', profile.id),
      supabase.from('provider_content').select('*').eq('provider_id', profile.id),
      supabase.from('shop_items').select('*').eq('provider_id', profile.id),
    ]).then(([{ data: s }, { data: c }, { data: sh }]) => {
      setSubs((s as ProviderSubscription[]) ?? [])
      setContent((c as ProviderContent[]) ?? [])
      setShop((sh as ShopItem[]) ?? [])
    })
  }, [profile?.id])

  async function addSub() {
    if (!profile?.id || !subName || !subPrice) return
    setSaving(true)
    const { data } = await supabase.from('provider_subscriptions').insert({ provider_id: profile.id, name: subName, emoji: subEmoji, price: parseInt(subPrice), description: subDesc, is_popular: subPopular }).select().single()
    if (data) setSubs((s) => [...s, data as ProviderSubscription])
    setSaving(false); setSheetType(null); showToast('Tier added.')
  }

  async function addContent() {
    if (!profile?.id || !cName || !cPrice) return
    setSaving(true)
    const { data } = await supabase.from('provider_content').insert({ provider_id: profile.id, name: cName, emoji: cEmoji, price: parseInt(cPrice), description: cDesc, delivery_hours: parseInt(cHours) }).select().single()
    if (data) setContent((c) => [...c, data as ProviderContent])
    setSaving(false); setSheetType(null); showToast('Content item added.')
  }

  async function addShop() {
    if (!profile?.id || !sName || !sPrice) return
    setSaving(true)
    const { data } = await supabase.from('shop_items').insert({ provider_id: profile.id, name: sName, emoji: sEmoji, price: parseInt(sPrice), description: sDesc, stock: parseInt(sStock) }).select().single()
    if (data) setShop((s) => [...s, data as ShopItem])
    setSaving(false); setSheetType(null); showToast('Shop item added.')
  }

  async function deleteSub(id: string) { await supabase.from('provider_subscriptions').delete().eq('id', id); setSubs((s) => s.filter((x) => x.id !== id)); showToast('Tier removed.') }
  async function deleteContent(id: string) { await supabase.from('provider_content').delete().eq('id', id); setContent((c) => c.filter((x) => x.id !== id)); showToast('Removed.') }
  async function deleteShop(id: string) { await supabase.from('shop_items').delete().eq('id', id); setShop((s) => s.filter((x) => x.id !== id)); showToast('Removed.') }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Online & shop</h1>

      {/* Subscriptions */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTitle}>Subscription tiers</p>
          <Btn v="soft" sm onClick={() => setSheetType('sub')}>+ Add tier</Btn>
        </div>
        {subs.length === 0 ? <p className={styles.empty}>No tiers yet.</p> : subs.map((s) => (
          <div key={s.id} className={styles.itemRow}>
            <span className={styles.itemEmoji}>{s.emoji}</span>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{s.name} {s.is_popular && <Tag>Popular</Tag>}</span>
              <span className={styles.itemMeta}>${s.price} / month</span>
            </div>
            <button className={styles.delBtn} onClick={() => deleteSub(s.id)}>✕</button>
          </div>
        ))}
      </section>

      {/* Content */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTitle}>Custom content</p>
          <Btn v="soft" sm onClick={() => setSheetType('content')}>+ Add</Btn>
        </div>
        {content.length === 0 ? <p className={styles.empty}>No content items yet.</p> : content.map((c) => (
          <div key={c.id} className={styles.itemRow}>
            <span className={styles.itemEmoji}>{c.emoji}</span>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{c.name}</span>
              <span className={styles.itemMeta}>${c.price} · {c.delivery_hours}hr delivery</span>
            </div>
            <button className={styles.delBtn} onClick={() => deleteContent(c.id)}>✕</button>
          </div>
        ))}
      </section>

      {/* Shop */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <p className={styles.sectionTitle}>Shop items</p>
          <Btn v="soft" sm onClick={() => setSheetType('shop')}>+ Add item</Btn>
        </div>
        {shop.length === 0 ? <p className={styles.empty}>No shop items yet.</p> : shop.map((s) => (
          <div key={s.id} className={styles.itemRow}>
            <span className={styles.itemEmoji}>{s.emoji}</span>
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{s.name}</span>
              <span className={styles.itemMeta}>${s.price} · {s.stock} in stock</span>
            </div>
            <button className={styles.delBtn} onClick={() => deleteShop(s.id)}>✕</button>
          </div>
        ))}
      </section>

      {/* Add subscription sheet */}
      <Sheet open={sheetType === 'sub'} onClose={() => setSheetType(null)}>
        <div className={styles.formSheet}>
          <h3 className={styles.formHeading}>New subscription tier</h3>
          <OBInput label="Name" placeholder="e.g. Fan Club" value={subName} onChange={(e) => setSubName(e.target.value)} />
          <OBInput label="Emoji" value={subEmoji} onChange={(e) => setSubEmoji(e.target.value)} />
          <OBInput label="Price (NZD / month)" type="number" value={subPrice} onChange={(e) => setSubPrice(e.target.value)} />
          <OBTextarea label="Description" value={subDesc} onChange={(e) => setSubDesc(e.target.value)} rows={3} />
          <OBToggle on={subPopular} onChange={setSubPopular} label="Mark as popular" />
          <Btn full loading={saving} disabled={!subName || !subPrice} onClick={addSub}>Add tier</Btn>
        </div>
      </Sheet>

      {/* Add content sheet */}
      <Sheet open={sheetType === 'content'} onClose={() => setSheetType(null)}>
        <div className={styles.formSheet}>
          <h3 className={styles.formHeading}>New content item</h3>
          <OBInput label="Name" placeholder="e.g. Custom video message" value={cName} onChange={(e) => setCName(e.target.value)} />
          <OBInput label="Emoji" value={cEmoji} onChange={(e) => setCEmoji(e.target.value)} />
          <OBInput label="Price (NZD)" type="number" value={cPrice} onChange={(e) => setCPrice(e.target.value)} />
          <OBTextarea label="Description" value={cDesc} onChange={(e) => setCDesc(e.target.value)} rows={3} />
          <OBInput label="Delivery hours" type="number" value={cHours} onChange={(e) => setCHours(e.target.value)} />
          <Btn full loading={saving} disabled={!cName || !cPrice} onClick={addContent}>Add content</Btn>
        </div>
      </Sheet>

      {/* Add shop sheet */}
      <Sheet open={sheetType === 'shop'} onClose={() => setSheetType(null)}>
        <div className={styles.formSheet}>
          <h3 className={styles.formHeading}>New shop item</h3>
          <OBInput label="Name" placeholder="e.g. Signed photo" value={sName} onChange={(e) => setSName(e.target.value)} />
          <OBInput label="Emoji" value={sEmoji} onChange={(e) => setSEmoji(e.target.value)} />
          <OBInput label="Price (NZD)" type="number" value={sPrice} onChange={(e) => setSPrice(e.target.value)} />
          <OBTextarea label="Description" value={sDesc} onChange={(e) => setSDesc(e.target.value)} rows={2} />
          <OBInput label="Stock" type="number" value={sStock} onChange={(e) => setSStock(e.target.value)} />
          <Btn full loading={saving} disabled={!sName || !sPrice} onClick={addShop}>Add item</Btn>
        </div>
      </Sheet>
    </div>
  )
}
