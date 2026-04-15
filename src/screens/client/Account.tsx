import { useNavigate, Link } from 'react-router-dom'
import { Btn, Callout, Toggle } from '../../components/primitives'
import { supabase } from '../../lib/supabase'
import { useAuthStore } from '../../store/auth.store'
import styles from './Account.module.css'

function LinkRow({ label, to, icon }: { label: string; to: string; icon?: string }) {
  return (
    <Link to={to} className={styles.linkRow}>
      {icon && <span className={styles.linkIcon}>{icon}</span>}
      <span className={styles.linkLabel}>{label}</span>
      <span className={styles.linkArrow}>›</span>
    </Link>
  )
}

export default function Account() {
  const { profile, session, activeRole, setActiveRole, reset } = useAuthStore()
  const navigate = useNavigate()

  const isProvider = profile?.role?.includes('provider') ?? false

  async function signOut() {
    await supabase.auth.signOut()
    reset()
    navigate('/')
  }

  function switchRole() {
    const next = activeRole === 'client' ? 'provider' : 'client'
    setActiveRole(next)
    navigate(next === 'provider' ? '/dashboard' : '/discover')
  }

  if (!session || !profile) {
    return (
      <div className={styles.page}>
        <div className={styles.guestWrap}>
          <div className={styles.guestEmoji}>◎</div>
          <h2 className={styles.guestHeading}>Join shub</h2>
          <p className={styles.guestSub}>Create an account to book arrangements, save companions, and post requests.</p>
          <Btn full onClick={() => navigate('/signup/client')}>Create account</Btn>
          <Btn v="ghost" full onClick={() => navigate('/login')}>Sign in</Btn>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Profile header */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarLg}>{profile.avatar_emoji}</div>
        <h1 className={styles.displayName}>{profile.display_name}</h1>
        <p className={styles.email}>{profile.email}</p>
      </div>

      {/* Role switcher */}
      {isProvider && (
        <div className={styles.section}>
          <Toggle
            on={activeRole === 'provider'}
            onChange={switchRole}
            label="Companion view"
            hint="Switch to manage your listing"
          />
        </div>
      )}

      {/* Links */}
      <div className={styles.section}>
        <p className={styles.sectionLabel}>Activity</p>
        <div className={styles.sectionCard}>
          <LinkRow label="My arrangements" to="/bookings" icon="📅" />
          <LinkRow label="My requests" to="/my-requests" icon="🧳" />
          <LinkRow label="Saved companions" to="/saved" icon="♥" />
        </div>
      </div>

      {!isProvider && (
        <div className={styles.section}>
          <div className={styles.sectionCard}>
            <LinkRow label="Become a companion" to="/signup/provider" icon="✦" />
          </div>
        </div>
      )}

      <div className={styles.section}>
        <p className={styles.sectionLabel}>Settings</p>
        <div className={styles.sectionCard}>
          <LinkRow label="Privacy settings" to="/privacy" icon="🔒" />
          <div className={styles.safetyRow}>
            <span className={styles.linkIcon}>🛡</span>
            <div className={styles.safetyText}>
              <span className={styles.linkLabel}>Safety</span>
              <span className={styles.safetyNum}>0800 SAFE NZ</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <Callout v="ink" icon="ℹ">
          Your data is never sold or shared with third parties.
        </Callout>
      </div>

      <div className={styles.section}>
        <Btn v="ghost" full onClick={signOut}>Sign out</Btn>
      </div>
    </div>
  )
}
