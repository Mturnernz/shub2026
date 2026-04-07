import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip } from '../../components/primitives'
import ProviderCard from '../../components/cards/ProviderCard'
import RequestCard from '../../components/cards/RequestCard'
import CompanionProfileSheet from '../../components/sheets/CompanionProfileSheet'
import ConnectSheet from '../../components/sheets/ConnectSheet'
import { useProviders, useOpenRequests } from '../../lib/queries'
import { useAuthStore } from '../../store/auth.store'
import type { ProviderFilters, ProviderListing } from '../../types'
import styles from './Discover.module.css'

const FILTERS = [
  { label: 'All', value: undefined },
  { label: 'In-person', value: 'inperson' },
  { label: 'Online', value: 'online' },
  { label: 'Available now', value: 'available' },
] as const

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Discover() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Partial<ProviderFilters>>({})
  const [profileSheetId, setProfileSheetId] = useState<string | null>(null)
  const [connectSheetId, setConnectSheetId] = useState<string | null>(null)
  const [activeListing, setActiveListing] = useState<ProviderListing | null>(null)

  const { data: providers = [], isLoading: loadingProviders } = useProviders(filter)
  const { data: requests = [] } = useOpenRequests()

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
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.greeting}>
          {greeting()}, {profile?.display_name ?? 'there'}
        </h1>
        <p className={styles.sub}>New Zealand's independent companion platform</p>
      </div>

      {/* Filters */}
      <div className={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip
            key={f.label}
            active={
              f.value === undefined
                ? !filter.type && !filter.available
                : f.value === 'available'
                ? !!filter.available
                : filter.type === f.value
            }
            onClick={() => {
              if (f.value === undefined) setFilter({})
              else if (f.value === 'available') setFilter({ available: !filter.available })
              else setFilter({ type: f.value as ProviderFilters['type'] })
            }}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {/* Featured companions */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Featured companions</h2>
        {loadingProviders ? (
          <div className={styles.hScroll}>
            {[1, 2, 3].map((i) => <div key={i} className={styles.cardSkeleton} />)}
          </div>
        ) : providers.length === 0 ? (
          <p className={styles.empty}>No companions listed yet — check back soon.</p>
        ) : (
          <div className={styles.hScroll}>
            {providers.slice(0, 6).map((listing) => (
              <div key={listing.id} className={styles.hCard}>
                <ProviderCard
                  listing={listing as Parameters<typeof ProviderCard>[0]['listing']}
                  onClick={() => openProfile(listing)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Open requests */}
      {requests.length > 0 && (
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Arrangement requests</h2>
          <div className={styles.hScroll}>
            {requests.slice(0, 4).map((req) => (
              <div key={req.id} className={styles.hCard}>
                <RequestCard request={req} onClick={() => navigate('/requests')} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAB */}
      <button className={styles.fab} onClick={() => navigate('/post-request')} aria-label="Post a request">
        + Post a request
      </button>

      {/* Sheets */}
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
