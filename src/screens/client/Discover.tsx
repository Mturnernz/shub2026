import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Chip, Btn, Callout } from '../../components/primitives'
import ProviderCard from '../../components/cards/ProviderCard'
import RequestCard from '../../components/cards/RequestCard'
import CompanionProfileSheet from '../../components/sheets/CompanionProfileSheet'
import ConnectSheet from '../../components/sheets/ConnectSheet'
import { useProviders, useOpenRequests } from '../../lib/queries'
import { useAuthStore } from '../../store/auth.store'
import type { ProviderFilters, ProviderListing } from '../../types'
import styles from './Discover.module.css'

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

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export default function Discover() {
  const { profile } = useAuthStore()
  const navigate = useNavigate()

  // Search state
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Filter state
  const [typeFilter, setTypeFilter] = useState<ProviderFilters['type']>(undefined)
  const [priceMax, setPriceMax] = useState<number | undefined>(undefined)
  const [available, setAvailable] = useState(false)

  // Sheet state
  const [profileSheetId, setProfileSheetId] = useState<string | null>(null)
  const [connectSheetId, setConnectSheetId] = useState<string | null>(null)
  const [activeListing, setActiveListing] = useState<ProviderListing | null>(null)

  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistDone, setWaitlistDone] = useState(false)

  const isSearching = debouncedSearch.length > 0 || !!typeFilter || available || !!priceMax

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

  const { data: providers = [], isLoading: loadingProviders } = useProviders(filters)
  const { data: requests = [] } = useOpenRequests()

  function openProfile(listing: ProviderListing) {
    setActiveListing(listing)
    setProfileSheetId(listing.provider_id)
  }

  function openConnect() {
    setProfileSheetId(null)
    setConnectSheetId(activeListing?.provider_id ?? null)
  }

  const cardProps = (listing: ProviderListing) => ({
    listing: listing as Parameters<typeof ProviderCard>[0]['listing'],
    onClick: () => openProfile(listing),
  })

  return (
    <div className={styles.page}>
      {/* Header — shown only when not actively searching */}
      {!isSearching && (
        <div className={styles.header}>
          <h1 className={styles.greeting}>
            {greeting()}, {profile?.display_name ?? 'there'}
          </h1>
        </div>
      )}

      {/* Search bar */}
      <div className={styles.searchWrap}>
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search companions, suburbs, vibes…"
            value={search}
            onChange={(e) => debounce(e.target.value)}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => { setSearch(''); setDebouncedSearch('') }}>✕</button>
          )}
        </div>
      </div>

      {/* Filter chips */}
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
            active={priceMax === f.max && priceMax !== undefined}
            onClick={() => setPriceMax(priceMax === f.max ? undefined : f.max)}
            accent
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {/* ── SEARCH MODE: grid results ────────────────────── */}
      {isSearching ? (
        <>
          {loadingProviders ? (
            <div className={styles.grid}>
              {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className={styles.gridSkeleton} />)}
            </div>
          ) : providers.length === 0 ? (
            <div className={styles.searchEmpty}>
              <Callout v="sage">No companions match your search — try adjusting your filters.</Callout>
            </div>
          ) : (
            <div className={styles.grid}>
              {providers.map((listing) => (
                <ProviderCard key={listing.id} {...cardProps(listing)} />
              ))}
            </div>
          )}
        </>
      ) : (
        /* ── CURATED MODE: editorial rows ──────────────── */
        <>
          {loadingProviders ? (
            <section className={styles.section}>
              <div className={styles.hScroll}>
                {[1, 2, 3].map((i) => <div key={i} className={styles.cardSkeleton} />)}
              </div>
            </section>
          ) : providers.length === 0 ? (
            <section className={styles.section}>
              <div className={styles.waitlist}>
                {waitlistDone ? (
                  <>
                    <div className={styles.waitlistTick}>✓</div>
                    <p className={styles.waitlistHead}>You're on the list.</p>
                    <p className={styles.waitlistSub}>We'll email you when companions are available in your area.</p>
                  </>
                ) : (
                  <>
                    <p className={styles.waitlistHead}>We're launching soon.</p>
                    <p className={styles.waitlistSub}>Be first to know when companions are available in your area.</p>
                    <div className={styles.waitlistRow}>
                      <input
                        className={styles.waitlistInput}
                        type="email"
                        placeholder="Your email"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                      />
                      <Btn onClick={() => waitlistEmail && setWaitlistDone(true)} disabled={!waitlistEmail}>Notify me</Btn>
                    </div>
                  </>
                )}
              </div>
            </section>
          ) : (
            <>
              {/* New on shub */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>New on shub</h2>
                <div className={styles.hScroll}>
                  {[...providers]
                    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                    .slice(0, 6)
                    .map((listing) => (
                      <div key={listing.id} className={styles.hCard}>
                        <ProviderCard {...cardProps(listing)} />
                      </div>
                    ))}
                </div>
              </section>

              {/* Featured companions */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Featured companions</h2>
                <div className={styles.hScroll}>
                  {[...providers]
                    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || (b.review_count ?? 0) - (a.review_count ?? 0))
                    .slice(0, 6)
                    .map((listing) => (
                      <div key={listing.id} className={styles.hCard}>
                        <ProviderCard {...cardProps(listing)} />
                      </div>
                    ))}
                </div>
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
            </>
          )}
        </>
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
