import { useState } from 'react'
import { Callout, Btn } from '../../components/primitives'
import RequestCard from '../../components/cards/RequestCard'
import { useMyRequests, usePitchesForRequest } from '../../lib/queries'
import { supabase } from '../../lib/supabase'
import { useUIStore } from '../../store/ui.store'
import type { Request } from '../../types'
import styles from './MyRequests.module.css'

type Tab = 'requests' | 'pitches'

function PitchList({ request }: { request: Request }) {
  const { data: pitches = [] } = usePitchesForRequest(request.id)
  const { showToast } = useUIStore()

  async function accept(pitchId: string) {
    await supabase.from('pitches').update({ status: 'accepted' }).eq('id', pitchId)
    showToast('Pitch accepted — a conversation has been started.')
  }

  async function decline(pitchId: string) {
    await supabase.from('pitches').update({ status: 'declined' }).eq('id', pitchId)
    showToast('Pitch declined.')
  }

  if (pitches.length === 0) return (
    <p className={styles.noPitches}>No pitches yet for {request.destination}</p>
  )

  return (
    <div className={styles.pitchGroup}>
      <p className={styles.pitchGroupTitle}>{request.destination} · {request.type}</p>
      {pitches.map((p) => (
        <div key={p.id} className={styles.pitchCard}>
          <div className={styles.pitchHeader}>
            <span className={styles.pitchFee}>${p.fee.toLocaleString()} NZD</span>
            <span className={[styles.pitchStatus, styles[`status_${p.status}`]].join(' ')}>
              {p.status}
            </span>
          </div>
          <p className={styles.pitchMessage}>{p.message}</p>
          {p.status === 'pending' && (
            <div className={styles.pitchActions}>
              <Btn v="sage" sm onClick={() => accept(p.id)}>Accept</Btn>
              <Btn v="ghost" sm onClick={() => decline(p.id)}>Decline</Btn>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default function MyRequests() {
  const [tab, setTab] = useState<Tab>('requests')
  const { data: requests = [], isLoading } = useMyRequests()

  const openRequests = requests.filter((r) => r.status === 'open')
  const requestsWithPitches = requests.filter((r) => r.status === 'open')

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>My requests</h1>
      </div>

      <div className={styles.tabs}>
        <button className={[styles.tab, tab === 'requests' ? styles.tabActive : ''].join(' ')} onClick={() => setTab('requests')}>
          My requests ({requests.length})
        </button>
        <button className={[styles.tab, tab === 'pitches' ? styles.tabActive : ''].join(' ')} onClick={() => setTab('pitches')}>
          Pitches received
        </button>
      </div>

      {tab === 'requests' && (
        <div className={styles.list}>
          {isLoading ? (
            [1, 2].map((i) => <div key={i} className={styles.skeleton} />)
          ) : openRequests.length === 0 ? (
            <Callout v="ink">You haven't posted any requests yet.</Callout>
          ) : (
            openRequests.map((req) => (
              <RequestCard key={req.id} request={req} onClick={() => {}} />
            ))
          )}
        </div>
      )}

      {tab === 'pitches' && (
        <div className={styles.list}>
          {requestsWithPitches.length === 0 ? (
            <Callout v="ink">No open requests to show pitches for.</Callout>
          ) : (
            requestsWithPitches.map((req) => (
              <PitchList key={req.id} request={req} />
            ))
          )}
        </div>
      )}
    </div>
  )
}
