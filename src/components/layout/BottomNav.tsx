import { NavLink } from 'react-router-dom'
import { useAuthStore } from '../../store/auth.store'
import styles from './BottomNav.module.css'

const CLIENT_TABS = [
  { path: '/discover', label: 'Discover', icon: '◆' },
  { path: '/browse', label: 'Browse', icon: '✦' },
  { path: '/requests', label: 'Requests', icon: '🧳' },
  { path: '/messages', label: 'Messages', icon: '💬' },
  { path: '/account', label: 'Account', icon: '◎' },
]

const PROVIDER_TABS = [
  { path: '/dashboard', label: 'Dashboard', icon: '◆' },
  { path: '/provider/requests', label: 'Requests', icon: '🧳' },
  { path: '/messages', label: 'Messages', icon: '💬' },
  { path: '/listing', label: 'My Listing', icon: '◎' },
]

export default function BottomNav() {
  const { activeRole } = useAuthStore()
  const tabs = activeRole === 'provider' ? PROVIDER_TABS : CLIENT_TABS

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {tabs.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          className={({ isActive }) =>
            [styles.tab, isActive ? styles.active : ''].filter(Boolean).join(' ')
          }
        >
          <span className={styles.icon} aria-hidden="true">{tab.icon}</span>
          <span className={styles.label}>{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
