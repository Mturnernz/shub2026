import { useState } from 'react'
import { useAuthStore } from '../../store/auth.store'
import { useNotifications } from '../../lib/queries'
import NotificationTray from '../sheets/NotificationTray'
import styles from './Wordmark.module.css'
import type { Notification } from '../../types'

export default function Wordmark() {
  const { session } = useAuthStore()
  const { data: notifications = [] } = useNotifications()
  const [trayOpen, setTrayOpen] = useState(false)

  const unreadCount = notifications.filter((n: Notification) => !n.read).length

  return (
    <>
      <div className={styles.bar} role="banner">
        <div className={styles.wordmark} aria-label="shub">shub</div>
        {session && (
          <button className={styles.bell} onClick={() => setTrayOpen(true)} aria-label="Notifications">
            🔔
            {unreadCount > 0 && (
              <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
            )}
          </button>
        )}
      </div>
      <NotificationTray open={trayOpen} onClose={() => setTrayOpen(false)} />
    </>
  )
}
