import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Btn, Callout, OBInput, OBTextarea, Tag, Toggle, Sheet } from '../../components/primitives'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import type { ProviderListing } from '../../types'
import styles from './Listing.module.css'

type EditField = 'headline' | 'bio' | 'rateSocial' | 'rateIntimate' | 'moodTags' | null

const STATUS_META: Record<string, { label: string; v: 'gold' | 'sage' | 'primary' }> = {
  pending: { label: 'Pending review', v: 'gold' },
  approved: { label: 'Live', v: 'sage' },
  rejected: { label: 'Not approved', v: 'primary' },
}

export default function Listing() {
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [listing, setListing] = useState<ProviderListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [editField, setEditField] = useState<EditField>(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('provider_listings').select('*').eq('provider_id', profile.id).maybeSingle()
      .then(({ data }) => { setListing(data as ProviderListing | null); setLoading(false) })
  }, [profile?.id])

  async function togglePause() {
    if (!listing) return
    const { error } = await supabase.from('provider_listings').update({ paused: !listing.paused }).eq('id', listing.id)
    if (!error) { setListing({ ...listing, paused: !listing.paused }); showToast(listing.paused ? 'Listing is now live.' : 'Listing paused.') }
  }

  function openEdit(field: EditField, current: string) {
    setEditField(field)
    setEditVal(current)
  }

  async function saveEdit() {
    if (!listing || !editField) return
    setSaving(true)
    const fieldMap: Record<string, string> = { headline: 'headline', rateSocial: 'price_social', rateIntimate: 'price_intimate', moodTags: 'mood_tags' }
    const dbField = fieldMap[editField] ?? editField
    const value = ['rateSocial', 'rateIntimate'].includes(editField) ? parseInt(editVal) : editVal
    const { error } = await supabase.from('provider_listings').update({ [dbField]: value }).eq('id', listing.id)
    if (!error) {
      setListing({ ...listing, [dbField]: value } as ProviderListing)
      showToast('Saved.')
    }
    setSaving(false)
    setEditField(null)
  }

  if (loading) return <div className={styles.page}><div className={styles.skeleton} style={{ height: 300 }} /></div>

  if (!listing) return (
    <div className={styles.page}>
      <h1 className={styles.heading}>My listing</h1>
      <p className={styles.empty}>No listing found. Complete provider onboarding to create one.</p>
      <Btn onClick={() => {}} full v="ghost">Contact support</Btn>
    </div>
  )

  const status = STATUS_META[listing.status] ?? STATUS_META.pending

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <h1 className={styles.heading}>My listing</h1>
        <Callout v={status.v}>{status.label}</Callout>
      </div>

      <Toggle on={!listing.paused} onChange={togglePause} label="Listing live" hint={listing.paused ? 'Paused — not visible to clients' : 'Visible to clients'} />

      <div className={styles.fieldList}>
        {[
          { field: 'headline' as EditField, label: 'Headline', value: listing.headline ?? '' },
          { field: 'rateSocial' as EditField, label: 'Social rate (NZD/hr)', value: listing.price_social ? String(listing.price_social) : '' },
          { field: 'rateIntimate' as EditField, label: 'Intimate rate (NZD/hr)', value: listing.price_intimate ? String(listing.price_intimate) : '' },
          { field: 'moodTags' as EditField, label: 'Vibe tags', value: listing.mood_tags?.join(', ') ?? '' },
        ].map(({ field, label, value }) => (
          <div key={field} className={styles.fieldRow} onClick={() => openEdit(field, value)}>
            <div>
              <p className={styles.fieldLabel}>{label}</p>
              <p className={styles.fieldValue}>{value || <span className={styles.fieldEmpty}>Not set</span>}</p>
            </div>
            <span className={styles.editIcon}>✏</span>
          </div>
        ))}

        {/* Mood tags display */}
        {listing.mood_tags && listing.mood_tags.length > 0 && (
          <div className={styles.tagsRow}>
            {listing.mood_tags.map((t) => <Tag key={t}>{t}</Tag>)}
          </div>
        )}
      </div>

      <div className={styles.navLinks}>
        <Link to="/listing/online" className={styles.navLink}><span>✦</span><span>Online services & shop</span><span>›</span></Link>
        <Link to="/listing/availability" className={styles.navLink}><span>📅</span><span>Availability</span><span>›</span></Link>
        <Link to="/verification" className={styles.navLink}><span>✓</span><span>Verification & safety</span><span>›</span></Link>
      </div>

      {/* Edit sheet */}
      <Sheet open={!!editField} onClose={() => setEditField(null)}>
        <div className={styles.editSheet}>
          <h3 className={styles.editHeading}>Edit {editField}</h3>
          {editField === 'bio' ? (
            <OBTextarea label="" value={editVal} onChange={(e) => setEditVal(e.target.value)} rows={5} />
          ) : (
            <OBInput label="" type={['rateSocial', 'rateIntimate'].includes(editField ?? '') ? 'number' : 'text'} value={editVal} onChange={(e) => setEditVal(e.target.value)} />
          )}
          <Btn full loading={saving} onClick={saveEdit}>Save</Btn>
        </div>
      </Sheet>
    </div>
  )
}
