import { Callout, OBInput, OBToggle } from '../components/primitives'
import type { OnboardingData } from './types'
import styles from './onboarding.module.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

interface Props {
  data: OnboardingData
  update: (d: Partial<OnboardingData>) => void
  onNext: () => void
  onBack: () => void
}

export default function Step4Terms({ data, update, onNext, onBack }: Props) {
  const hasIntimate = data.comfortLevels.some((l) => ['intimate', 'overnight'].includes(l))

  const toggleDay = (day: string) => {
    const has = data.days.includes(day)
    update({ days: has ? data.days.filter((d) => d !== day) : [...data.days, day] })
  }

  const updateDayTime = (day: string, field: 'start' | 'end', val: string) => {
    update({ dayTimes: { ...data.dayTimes, [day]: { ...data.dayTimes[day], [field]: val } } })
  }

  return (
    <div className={styles.stepContent}>
      {/* Rates */}
      <div className={styles.fieldStack}>
        <OBInput
          label="Social rate (NZD / hr)"
          type="number"
          placeholder="e.g. 200"
          value={data.rateSocial}
          onChange={(e) => update({ rateSocial: e.target.value })}
          hint="Shown as 'from $X' on your listing"
        />
        {hasIntimate && (
          <OBInput
            label="Intimate rate (NZD / hr)"
            type="number"
            placeholder="e.g. 350"
            value={data.rateIntimate}
            onChange={(e) => update({ rateIntimate: e.target.value })}
          />
        )}
      </div>

      {/* Availability */}
      <div>
        <p className={styles.fieldHeading}>Availability</p>
        <div className={styles.availToggle}>
          {(['flexible', 'days'] as const).map((m) => (
            <button
              key={m}
              type="button"
              className={[styles.availBtn, data.availMode === m ? styles.availBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => update({ availMode: m })}
            >
              {m === 'flexible' ? 'Flexible' : 'Specific days'}
            </button>
          ))}
        </div>

        {data.availMode === 'days' && (
          <div className={styles.daysStack}>
            <div className={styles.dayChips}>
              {DAYS.map((d) => (
                <button
                  key={d}
                  type="button"
                  className={[styles.chip, data.days.includes(d) ? styles.chipActive : ''].filter(Boolean).join(' ')}
                  onClick={() => toggleDay(d)}
                >
                  {d}
                </button>
              ))}
            </div>
            {data.days.map((d) => (
              <div key={d} className={styles.dayTimeRow}>
                <span className={styles.dayLabel}>{d}</span>
                <input
                  type="time"
                  className={styles.timeInput}
                  value={data.dayTimes[d]?.start ?? '09:00'}
                  onChange={(e) => updateDayTime(d, 'start', e.target.value)}
                  aria-label={`${d} start time`}
                />
                <span className={styles.timeSep}>—</span>
                <input
                  type="time"
                  className={styles.timeInput}
                  value={data.dayTimes[d]?.end ?? '21:00'}
                  onChange={(e) => updateDayTime(d, 'end', e.target.value)}
                  aria-label={`${d} end time`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact preferences */}
      <div>
        <p className={styles.fieldHeading}>Contact preferences</p>
        <div className={styles.toggleStack}>
          <OBToggle on={data.inCall} onChange={(v) => update({ inCall: v })} label="In-calls" hint="Clients come to you" />
          <OBToggle on={data.outCall} onChange={(v) => update({ outCall: v })} label="Out-calls" hint="You travel to clients" />
          <OBToggle on={data.preScreening} onChange={(v) => update({ preScreening: v })} label="Pre-screening" hint="Verify clients before meeting" />
          <OBToggle on={data.newClients} onChange={(v) => update({ newClients: v })} label="New clients" hint="Accept first-time enquiries" />
        </div>
      </div>

      <Callout v="gold" icon="★">
        You can pause your listing at any time — no questions asked.
      </Callout>

      <div className={styles.navRow}>
        <button type="button" className={styles.backBtn} onClick={onBack}>← Back</button>
        <button type="button" className={styles.nextBtn} onClick={onNext} style={{ flex: 1 }}>
          Continue →
        </button>
      </div>
    </div>
  )
}
