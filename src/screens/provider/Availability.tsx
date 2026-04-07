import { useState, useEffect } from 'react'
import { Btn, Callout } from '../../components/primitives'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import { useUIStore } from '../../store/ui.store'
import type { AvailabilitySlot } from '../../types'
import styles from './Availability.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_MAP: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }

export default function Availability() {
  const { profile } = useAuthStore()
  const { showToast } = useUIStore()
  const [mode, setMode] = useState<'flexible' | 'days'>('flexible')
  const [activeDays, setActiveDays] = useState<string[]>([])
  const [times, setTimes] = useState<Record<string, { start: string; end: string }>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    supabase.from('availability_slots').select('*').eq('provider_id', profile.id)
      .then(({ data }) => {
        const slots = (data as AvailabilitySlot[]) ?? []
        if (slots.length > 0) {
          setMode('days')
          const dayNums = Object.fromEntries(Object.entries(DAY_MAP).map(([k, v]) => [v, k]))
          const loaded: string[] = []
          const t: Record<string, { start: string; end: string }> = {}
          slots.forEach((s) => {
            const d = dayNums[s.day_of_week]
            if (d) { loaded.push(d); t[d] = { start: s.start_time.slice(0, 5), end: s.end_time.slice(0, 5) } }
          })
          setActiveDays(loaded); setTimes(t)
        }
        setLoading(false)
      })
  }, [profile?.id])

  const toggleDay = (d: string) => {
    if (activeDays.includes(d)) {
      setActiveDays((a) => a.filter((x) => x !== d))
      setTimes((t) => { const c = { ...t }; delete c[d]; return c })
    } else {
      setActiveDays((a) => [...a, d])
      setTimes((t) => ({ ...t, [d]: { start: '09:00', end: '21:00' } }))
    }
  }

  async function save() {
    if (!profile?.id) return
    setSaving(true)
    await supabase.from('availability_slots').delete().eq('provider_id', profile.id)
    if (mode === 'days' && activeDays.length > 0) {
      const rows = activeDays.map((d) => ({
        provider_id: profile.id,
        day_of_week: DAY_MAP[d],
        start_time: times[d]?.start ?? '09:00',
        end_time: times[d]?.end ?? '21:00',
        slot_type: 'available',
      }))
      await supabase.from('availability_slots').insert(rows)
    }
    setSaving(false)
    showToast('Availability saved.')
  }

  if (loading) return <div className={styles.page}><div className={styles.skeleton} style={{ height: 300 }} /></div>

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Availability</h1>

      <div className={styles.modeToggle}>
        {(['flexible', 'days'] as const).map((m) => (
          <button key={m} className={[styles.modeBtn, mode === m ? styles.modeBtnActive : ''].join(' ')} onClick={() => setMode(m)}>
            {m === 'flexible' ? 'Flexible' : 'Specific days'}
          </button>
        ))}
      </div>

      {mode === 'flexible' && (
        <Callout v="sage">Your listing will show as generally available. Clients can request any time.</Callout>
      )}

      {mode === 'days' && (
        <div className={styles.daysSection}>
          <div className={styles.dayChips}>
            {DAYS.map((d) => (
              <button key={d} className={[styles.dayChip, activeDays.includes(d) ? styles.dayChipActive : ''].join(' ')} onClick={() => toggleDay(d)}>
                {d}
              </button>
            ))}
          </div>

          {activeDays.map((d) => (
            <div key={d} className={styles.timeRow}>
              <span className={styles.dayLabel}>{d}</span>
              <input type="time" className={styles.timeInput} value={times[d]?.start ?? '09:00'}
                onChange={(e) => setTimes((t) => ({ ...t, [d]: { ...t[d], start: e.target.value } }))} aria-label={`${d} start`} />
              <span className={styles.sep}>—</span>
              <input type="time" className={styles.timeInput} value={times[d]?.end ?? '21:00'}
                onChange={(e) => setTimes((t) => ({ ...t, [d]: { ...t[d], end: e.target.value } }))} aria-label={`${d} end`} />
            </div>
          ))}
        </div>
      )}

      <Btn full loading={saving} onClick={save}>Save availability</Btn>
    </div>
  )
}
