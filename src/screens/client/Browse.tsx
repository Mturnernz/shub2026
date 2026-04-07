import { useState, useCallback } from 'react'
import { Chip, Callout, OBInput } from '../../components/primitives'
import ProviderCard from '../../components/cards/ProviderCard'
import CompanionProfileSheet from '../../components/sheets/CompanionProfileSheet'
import ConnectSheet from '../../components/sheets/ConnectSheet'
import { useProviders } from '../../lib/queries'
import type { ProviderFilters, ProviderListing } from '../../types'
import styles from './Browse.module.css'

const TYPE_FILTERS = [
  { label: 'All', type: undefined },
  { label: 'In-person', type: 'inperson' as const },
  { label: 'Online', type: 'online' as const },
]

const PRICE_FILTERS = [
  { label: 'Under $200', max: 200 },
  { label: '$200–$400', max: 400 },
  { label: '$400+', max: undefined },
]

export default function Browse() {
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<ProviderFilters['type']>(undefined)
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined)
  const [available, setAvailable] = useState(false)
  const [profileSheetId, setProfileSheetId] = useState<string | null>(null)
  const [connectSheetId, setConnectSheetId] = useState<string | null>(null)
  const [activeListing, setActiveListing] = useState<ProviderListing | null>(null)

  const debounce = useCallback((val: string) => {
    setSearch(val)
    const t = setTimeout(() => setDebouncedSearch(val), 300)
    return () => clearTimeout(t)
  }, [])

  const filters: ProviderFilters = {
    type: typeFilter,
    priceMax,
    available: available || undefined,
    search: debouncedSearch || undefined,
  }

  const { data: providers = [], isLoading } = useProviders(filters)

  function openProfile(listing: ProviderListing) {
    setActiveListing(listing)
    setProfileSheetId(listing.provider_id)
  }

  return (
    <div className={styles.page}>
      {/* Search */}
      <div className={styles.searchWrap}>
        <OBInput
          type="search"
          placeholder="Search companions, suburbs, vibes…"
          value={search}
          onChange={(e) => debounce(e.target.value)}
        />
      </div>

      {/* Type filters */}
      <div className={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <Chip
            key={f.label}
            active={typeFilter === f.type}
            onClick={() => setTypeFilter(f.type)}
          >
            {f.label}
          </Chip>
        ))}
        <Chip active={available} onClick={() => setAvailable(!available)}>
          Available now
        </Chip>
        {PRICE_FILTERS.map((f) => (
          <Chip
            key={f.label}
            active={priceMax === f.max}
            onClick={() => setPriceMax(priceMax === f.max ? undefined : f.max)}
            accent
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className={styles.skeleton} />
          ))}
        </div>
      ) : providers.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Callout v="sage">No companions match your filters — try adjusting your search.</Callout>
        </div>
      ) : (
        <div className={styles.grid}>
          {providers.map((listing) => (
            <ProviderCard
              key={listing.id}
              listing={listing as Parameters<typeof ProviderCard>[0]['listing']}
              onClick={() => openProfile(listing)}
            />
          ))}
        </div>
      )}

      <CompanionProfileSheet
        providerId={profileSheetId}
        open={!!profileSheetId}
        onClose={() => setProfileSheetId(null)}
        onConnect={() => { setProfileSheetId(null); setConnectSheetId(activeListing?.provider_id ?? null) }}
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
