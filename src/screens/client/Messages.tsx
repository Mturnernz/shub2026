import { useNavigate } from 'react-router-dom'
import { useConversations } from '../../lib/queries'
import { useAuthStore } from '../../store/auth.store'
import styles from './Messages.module.css'

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

export default function Messages() {
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const { data: conversations = [], isLoading } = useConversations()

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.heading}>Messages</h1>
      </div>

      {isLoading ? (
        <div className={styles.list}>
          {[1, 2, 3, 4].map((i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : conversations.length === 0 ? (
        <div className={styles.empty}>
          <p className={styles.emptyTitle}>No conversations yet</p>
          <p className={styles.emptySub}>Connect with a companion to start chatting</p>
        </div>
      ) : (
        <div className={styles.list}>
          {conversations.map((conv) => {
            const other = conv.participant_a === profile?.id ? conv.participant_b_profile : conv.participant_a_profile
            const unread = (conv.unread_count ?? 0) > 0
            return (
              <button
                key={conv.id}
                className={`${styles.row} ${unread ? styles.rowUnread : ''}`}
                onClick={() => navigate(`/messages/${conv.id}`)}
              >
                <div className={styles.avatar}>
                  {other?.avatar_url
                    ? <img src={other.avatar_url} className={styles.avatarImg} alt="" />
                    : <span className={styles.avatarEmoji}>{other?.display_name?.[0] ?? '?'}</span>
                  }
                  {unread && <span className={styles.unreadDot} />}
                </div>
                <div className={styles.rowBody}>
                  <div className={styles.rowTop}>
                    <span className={styles.name}>{other?.display_name ?? 'Unknown'}</span>
                    <span className={styles.time}>{conv.last_message_at ? timeAgo(conv.last_message_at) : ''}</span>
                  </div>
                  <p className={styles.preview}>{conv.last_message_preview ?? 'No messages yet'}</p>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
