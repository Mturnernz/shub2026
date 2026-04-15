import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProgressBar, StepLabel } from '../components/primitives'
import { supabase } from '../lib/supabase'
import { useUIStore } from '../store/ui.store'
import { useAuthStore } from '../store/auth.store'
import { initialData, STEP_LABELS, TOTAL_STEPS } from './types'
import type { OnboardingData } from './types'
import Step0Earnings from './Step0Earnings'
import Step1Identity from './Step1Identity'
import Step2Vibe from './Step2Vibe'
import Step3Comfort from './Step3Comfort'
import Step4Terms from './Step4Terms'
import Step5Safety from './Step5Safety'
import Step6Preview from './Step6Preview'
import Step7Done from './Step7Done'
import styles from './ProviderOnboarding.module.css'

export default function ProviderOnboarding() {
  const navigate = useNavigate()
  const { showToast } = useUIStore()
  const { session, profile, setActiveRole, setProfile } = useAuthStore()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<OnboardingData>(initialData)
  const [submitting, setSubmitting] = useState(false)

  const update = (patch: Partial<OnboardingData>) =>
    setData((d) => ({ ...d, ...patch }))

  const next = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS))
  const back = () => {
    if (step === 0) navigate('/')
    else setStep((s) => s - 1)
  }

  const handleSubmit = async () => {
    if (!session?.user) {
      // Create account first, then submit
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: crypto.randomUUID(), // temp — user sets via email link
        options: {
          data: { display_name: data.displayName },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })
      if (authError) {
        showToast('Something went wrong. Please try again.')
        return
      }
      if (authData.user) {
        await persistListing(authData.user.id)
      }
    } else {
      await persistListing(session.user.id)
    }
  }

  const persistListing = async (userId: string) => {
    setSubmitting(true)
    // Merge provider role into any existing roles (e.g. existing client becomes ['client','provider'])
    const existingRoles = profile?.role ?? []
    const mergedRoles = Array.from(new Set([...existingRoles, 'provider']))
    try {
      // Upsert profile
      const { data: updatedProfile } = await supabase.from('profiles').upsert({
        id: userId,
        display_name: data.displayName,
        email: data.email,
        dob: data.dob || null,
        context: data.context,
        avatar_emoji: data.avatar,
        bio: data.bio,
        quote: data.quote || null,
        suburb: data.suburb || null,
        pronouns: data.pronouns || null,
        phone: data.phone || null,
        role: mergedRoles,
        active_role: 'provider',
      }).select().single()
      if (updatedProfile) setProfile(updatedProfile as import('../types').Profile)

      // Insert listing
      await supabase.from('provider_listings').upsert({
        provider_id: userId,
        type: data.comfortLevels.includes('intimate') || data.comfortLevels.includes('overnight')
          ? 'inperson' : 'inperson',
        mood_tags: data.vibes,
        comfort_levels: data.comfortLevels,
        price_social: data.rateSocial ? parseInt(data.rateSocial) : null,
        price_intimate: data.rateIntimate ? parseInt(data.rateIntimate) : null,
        in_calls: data.inCall,
        out_calls: data.outCall,
        pre_screening: data.preScreening,
        new_clients: data.newClients,
        health_check_declared: !!data.healthDate,
        health_check_date: data.healthDate || null,
        emergency_contact_name: data.emergencyName || null,
        emergency_contact_phone: data.emergencyPhone || null,
        submitted_at: new Date().toISOString(),
        status: 'pending',
      })

      // Write availability slots
      if (data.availMode === 'days' && data.days.length > 0) {
        const DAY_MAP: Record<string, number> = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 0 }
        const slots = data.days.map((d) => ({
          provider_id: userId,
          day_of_week: DAY_MAP[d],
          start_time: data.dayTimes[d]?.start ?? '09:00',
          end_time: data.dayTimes[d]?.end ?? '21:00',
        }))
        await supabase.from('availability_slots').upsert(slots)
      }

      // Write consent log via edge function (server-side IP capture)
      await supabase.functions.invoke('on_consent_submitted', {
        body: {
          provider_id: userId,
          agreed_age: data.consentAge,
          agreed_work_rights: data.consentWorkRights,
          agreed_terms: data.consentTerms,
          user_agent: navigator.userAgent,
        },
      })

      setActiveRole('provider')
      setStep(7)
    } catch {
      showToast('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const isDone = step === 7

  return (
    <div className={styles.page}>
      {/* Sticky header */}
      {!isDone && (
        <div className={styles.header}>
          <ProgressBar step={step + 1} total={TOTAL_STEPS} />
          <div className={styles.headerRow}>
            <StepLabel step={step + 1} total={TOTAL_STEPS} label={STEP_LABELS[step]} />
          </div>
        </div>
      )}

      <div className={styles.body}>
        {/* Wordmark */}
        <p className={styles.wordmark}>shub</p>

        {step === 0 && <Step0Earnings data={data} update={update} onNext={next} />}
        {step === 1 && <Step1Identity data={data} update={update} onNext={next} onBack={back} />}
        {step === 2 && <Step2Vibe data={data} update={update} onNext={next} onBack={back} />}
        {step === 3 && <Step3Comfort data={data} update={update} onNext={next} onBack={back} />}
        {step === 4 && <Step4Terms data={data} update={update} onNext={next} onBack={back} />}
        {step === 5 && <Step5Safety data={data} update={update} onNext={next} onBack={back} />}
        {step === 6 && (
          <Step6Preview data={data} update={update} onSubmit={handleSubmit} onBack={back} submitting={submitting} />
        )}
        {step === 7 && <Step7Done data={data} />}
      </div>
    </div>
  )
}
