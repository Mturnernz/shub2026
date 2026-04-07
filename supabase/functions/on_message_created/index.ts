import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

serve(async (req) => {
  try {
    const { record } = await req.json()

    // Determine the recipient
    const { data: conv } = await supabase
      .from('conversations')
      .select('participant_a, participant_b')
      .eq('id', record.conversation_id)
      .single()

    if (!conv) return new Response('Not found', { status: 404 })

    const recipientId = conv.participant_a === record.sender_id
      ? conv.participant_b
      : conv.participant_a

    // Get sender display name
    const { data: sender } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', record.sender_id)
      .single()

    // Insert notification for recipient
    await supabase.from('notifications').insert({
      user_id: recipientId,
      type: 'message',
      title: `New message from ${sender?.display_name ?? 'someone'}`,
      body: record.body.length > 80 ? record.body.slice(0, 80) + '…' : record.body,
      link: `/messages/${record.conversation_id}`,
      reference_id: record.id,
    })

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
