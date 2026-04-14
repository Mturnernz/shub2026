import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
)

const resendApiKey = Deno.env.get('RESEND_API_KEY')

const sendEmail = async (to: string, subject: string, html: string) => {
  if (!resendApiKey) return
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: 'notifications@shub.nz', to, subject, html }),
  })
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const booking = await req.json()
    const { provider_id, client_id, id: booking_id, booking_date, start_time } = booking

    const [providerErr, clientErr] = await Promise.all([
      supabase.from('notifications').insert({
        user_id: provider_id,
        type: 'new_enquiry',
        title: 'New arrangement request',
        body: `A client has requested an arrangement on ${booking_date} at ${start_time}.`,
        entity_type: 'booking',
        entity_id: booking_id,
      }).then(({ error }) => error),
      supabase.from('notifications').insert({
        user_id: client_id,
        type: 'booking_requested',
        title: 'Arrangement request sent',
        body: `Your request for ${booking_date} has been sent to the provider.`,
        entity_type: 'booking',
        entity_id: booking_id,
      }).then(({ error }) => error),
    ])

    if (providerErr || clientErr) {
      return new Response(
        JSON.stringify({ error: providerErr?.message ?? clientErr?.message }),
        { status: 500 }
      )
    }

    sendEmail(
      'provider@example.com',
      'New arrangement request',
      `<p>You have a new arrangement request for ${booking_date}.</p>`,
    ).catch((err) => console.error('Email send failed', err))

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
