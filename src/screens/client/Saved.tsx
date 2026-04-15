import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import ProviderCard from '../../components/cards/ProviderCard'
import CompanionProfileSheet from '../../components/sheets/CompanionProfileSheet'
import ConnectSheet from '../../components/sheets/ConnectSheet'
import type { ProviderListing, Profile } from '../../types'
import styles from './Saved.module.css'

export default function Saved() {
  const { session } = useAuthStore()
  const [profileSheetId, setProfileSheetId] = useState<string | null>(null)
  const [connectSheetId, setConnectSheetId] = useState<string | null>(null)
  const [activeListing, setActiveListing] = useState<ProviderListing | null>(null)

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ['saved', session?.user.id],
    enabled: !!session?.user,
    queryFn: async () => {
      const { data } = await supabase
        .from('saved_providers')
        .select('provider_id, provider_listings!inner(*, profiles!inner(*))')
        .eq('client_id', session!.user.id)
      return (data ?? []).map((row: Record<string, unknown>) => row.provider_listings) as (ProviderListing & { profiles: Profile })[]
    },
  })

  function openProfile(listing: ProviderListing) {
    setActiveListing(listing)
    setProfileSheetId(listing.provider_id)
  }

  function openConnect() {
    setProfileSheetId(null)
    setConnectSheetId(activeListing?.provider_id ?? null)
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Saved companions</h1>
      </div>

      <div className={styles.grid}>
        {isLoading ? (
          <>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </>
        ) : listings.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyEmoji}>♥</div>
            <p className={styles.emptyText}>
              No saved companions yet. Tap the heart on any profile to save them here.
            </p>
          </div>
        ) : (
          listings.map((listing) => (
            <ProviderCard
              key={listing.id}
              listing={listing}
              onClick={() => openProfile(listing)}
            />
          ))
        )}
      </div>

      <CompanionProfileSheet
        providerId={profileSheetId}
        open={!!profileSheetId}
        onClose={() => setProfileSheetId(null)}
        onConnect={openConnect}
      />
      <ConnectSheet
        providerId={connectSheetId}
        open={!!connectSheetId}
        onClose={() => setConnectSheetId(null)}
        listing={activeListing}
        onViewProfile={() => setProfileSheetId(activeListing?.provider_id ?? null)}
      />
    </div>
  )
}
