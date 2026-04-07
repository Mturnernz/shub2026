import { useState, useEffect } from 'react'
import { Callout, Btn, OBInput } from '../../components/primitives'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import type { ProviderListing } from '../../types'
import styles from './Verification.module.css'

export default function Verification() {
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [listing, setListing] = useState<ProviderListing | null>(null)
  const [healthDate, setHealthDate] = useState('')
  const [emergencyName, setEmergencyName] = useState('')
  const [emergencyPhone, setEmergencyPhone] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('provider_listings').select('*').eq('provider_id', profile.id).maybeSingle()
      .then(({ data }) => {
        const l = data as ProviderListing | null
        setListing(l)
        setHealthDate(l?.health_check_date ?? '')
        setEmergencyName(l?.emergency_contact_name ?? '')
        setEmergencyPhone(l?.emergency_contact_phone ?? '')
      })
  }, [profile?.id])

  const expiryDays = listing?.health_check_expires_at
    ? Math.ceil((new Date(listing.health_check_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  async function save() {
    if (!listing) return
    setSaving(true)
    await supabase.from('provider_listings').update({
      health_check_date: healthDate || null,
      health_check_declared: !!healthDate,
      emergency_contact_name: emergencyName || null,
      emergency_contact_phone: emergencyPhone || null,
    }).eq('id', listing.id)
    setSaving(false)
    showToast('Verification details saved.')
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Verification & safety</h1>

      {/* Identity */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>Identity</p>
        {listing?.identity_verified ? (
          <Callout v="sage" icon="✓">Identity confirmed — shub holds a record of your submitted document.</Callout>
        ) : (
          <>
            <Callout v="ink">Identity not yet confirmed. Upload a photo ID to unlock the verified badge.</Callout>
            <button className={styles.uploadBtn}><span>📎</span> Upload photo ID</button>
          </>
        )}
      </div>

      {/* Health check */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>Health check</p>
        {expiryDays !== null && expiryDays <= 14 && expiryDays > 0 && (
          <Callout v="gold" icon="★">Your health check expires in {expiryDays} day{expiryDays !== 1 ? 's' : ''} — time for a new one.</Callout>
        )}
        {expiryDays !== null && expiryDays <= 0 && (
          <Callout v="primary" icon="!">Your health check declaration has expired. Please update it.</Callout>
        )}
        <OBInput label="Date of last health check" type="date" value={healthDate} onChange={(e) => setHealthDate(e.target.value)} hint="We'll send a reminder 14 days before expiry (valid for 90 days)" />
        <a href="https://nzpc.org.nz/clinics" target="_blank" rel="noopener noreferrer" className={styles.clinicLink}>Find a free clinic →</a>
      </div>

      {/* Emergency contact */}
      <div className={styles.card}>
        <p className={styles.cardTitle}>Emergency contact</p>
        <OBInput label="Name" placeholder="Someone you trust" value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
        <OBInput label="Phone" type="tel" placeholder="021 000 0000" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
      </div>

      <Callout v="sage">shub holds a record of your submitted documents. These are never shared with clients.</Callout>
      <Callout v="lavender" icon="◆">NZPC offers free, confidential support. <strong>0800 NZPC (6972)</strong></Callout>

      <Btn full loading={saving} onClick={save}>Save changes</Btn>
    </div>
  )
}
