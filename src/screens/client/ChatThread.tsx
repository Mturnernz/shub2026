import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useMessages, useSendMessage } from '../../lib/queries'
import { useAuthStore } from '../../store/auth.store'
import type { Message } from '../../types'
import styles from './ChatThread.module.css'

export default function ChatThread() {
  const { conversationId } = useParams<{ conversationId: string }>()
  const navigate = useNavigate()
  const { profile } = useAuthStore()
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { data: messages = [], refetch } = useMessages(conversationId ?? null)
  const sendMessage = useSendMessage()

  // Realtime subscription
  useEffect(() => {
    if (!conversationId) return
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` },
        () => refetch()
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [conversationId, refetch])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // Mark as read
  useEffect(() => {
    if (!conversationId || !profile?.id) return
    supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('conversation_id', conversationId)
      .neq('sender_id', profile.id)
      .is('read_at', null)
      .then(() => {})
  }, [conversationId, profile?.id, messages.length])

  async function handleSend() {
    if (!text.trim() || !conversationId || !profile?.id) return
    const body = text.trim()
    setText('')
    await sendMessage.mutateAsync({ conversationId, body })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function groupMessages(msgs: Message[]) {
    const groups: { date: string; messages: Message[] }[] = []
    for (const msg of msgs) {
      const date = new Date(msg.created_at).toLocaleDateString('en-NZ', { weekday: 'long', day: 'numeric', month: 'long' })
      const last = groups[groups.length - 1]
      if (last?.date === date) {
        last.messages.push(msg)
      } else {
        groups.push({ date, messages: [msg] })
      }
    }
    return groups
  }

  const groups = groupMessages(messages)

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className={styles.back} onClick={() => navigate(-1)}>←</button>
        <span className={styles.title}>Conversation</span>
      </div>

      <div className={styles.messageList}>
        {groups.map((group) => (
          <div key={group.date}>
            <div className={styles.dateDivider}><span>{group.date}</span></div>
            {group.messages.map((msg) => {
              const mine = msg.sender_id === profile?.id
              return (
                <div key={msg.id} className={`${styles.bubble} ${mine ? styles.bubbleMine : styles.bubbleTheirs}`}>
                  <p className={styles.bubbleText}>{msg.body}</p>
                  <span className={styles.bubbleTime}>
                    {new Date(msg.created_at).toLocaleTimeString('en-NZ', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className={styles.composer}>
        <textarea
          className={styles.input}
          rows={1}
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className={styles.sendBtn}
          disabled={!text.trim() || sendMessage.isPending}
          onClick={handleSend}
        >
          ↑
        </button>
      </div>
    </div>
  )
}
