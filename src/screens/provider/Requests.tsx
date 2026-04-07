import { useState } from 'react'
import { Chip, Callout } from '../../components/primitives'
import RequestCard from '../../components/cards/RequestCard'
import ExpressInterestSheet from '../../components/sheets/ExpressInterestSheet'
import { useOpenRequests } from '../../lib/queries'
import type { Request } from '../../types'
import styles from './Requests.module.css'

const TYPE_FILTERS = [
  { label: 'All', value: undefined },
  { label: 'Weekend', value: 'weekend' as const },
  { label: 'Event', value: 'event' as const },
  { label: 'Extended', value: 'extended' as const },
  { label: 'Day Trip', value: 'daytrip' as const },
]

export default function ProviderRequests() {
  const [typeFilter, setTypeFilter] = useState<Request['type'] | undefined>(undefined)
  const [interestRequestId, setInterestRequestId] = useState<string | null>(null)
  const { data: requests = [], isLoading } = useOpenRequests()

  const filtered = typeFilter ? requests.filter((r) => r.type === typeFilter) : requests

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Client requests</h1>
        <p className={styles.sub}>Express interest in requests that suit you</p>
      </div>

      <div className={styles.filterRow}>
        {TYPE_FILTERS.map((f) => (
          <Chip
            key={f.label}
            active={typeFilter === f.value}
            onClick={() => setTypeFilter(f.value)}
          >
            {f.label}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <div className={styles.list}>
          {[1, 2, 3].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Callout v="sage">No open requests right now — check back soon.</Callout>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              onClick={() => setInterestRequestId(req.id)}
              showInterest
            />
          ))}
        </div>
      )}

      <ExpressInterestSheet
        requestId={interestRequestId}
        open={!!interestRequestId}
        onClose={() => setInterestRequestId(null)}
      />
    </div>
  )
}
