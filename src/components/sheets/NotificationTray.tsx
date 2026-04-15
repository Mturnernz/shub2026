import { useEffect } from 'react'
import { Sheet } from '../primitives'
import { useNotifications, useMarkNotificationsRead } from '../../lib/queries'
import type { Notification } from '../../types'
import styles from './NotificationTray.module.css'

const TYPE_ICON: Record<string, string> = {
  message: '💬',
  new_enquiry: '◆',
  booking_requested: '📅',
  review_received: '★',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

interface Props {
  open: boolean
  onClose: () => void
}

export default function NotificationTray({ open, onClose }: Props) {
  const { data: notifications = [] } = useNotifications()
  const { mutate: markRead } = useMarkNotificationsRead()

  useEffect(() => {
    if (!open) return
    const unread = notifications.filter((n: Notification) => !n.read).map((n: Notification) => n.id)
    if (unread.length > 0) markRead(unread)
  }, [open, notifications, markRead])

  return (
    <Sheet open={open} onClose={onClose} tall>
      <div className={styles.wrap}>
        <h2 className={styles.heading}>Notifications</h2>
        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>🔔</div>
            <p>Nothing yet — updates on bookings, messages, and reviews will appear here.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((n: Notification) => (
              <div key={n.id} className={[styles.row, !n.read ? styles.unread : ''].filter(Boolean).join(' ')}>
                <div className={styles.icon}>{TYPE_ICON[n.type] ?? '●'}</div>
                <div className={styles.content}>
                  <p className={styles.title}>{n.title}</p>
                  {n.body && <p className={styles.body}>{n.body}</p>}
                  <p className={styles.time}>{timeAgo(n.created_at)}</p>
                </div>
                {!n.read && <div className={styles.dot} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}
