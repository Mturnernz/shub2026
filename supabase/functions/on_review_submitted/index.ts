import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
)

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const review = await req.json()
    const { provider_id, booking_id } = review

    const { data: stats, error: statsError } = await supabase
      .from('reviews')
      .select('rating')
      .eq('reviewee_id', provider_id)

    if (statsError) {
      return new Response(JSON.stringify({ error: statsError.message }), { status: 500 })
    }

    const ratings = stats?.map((r: { rating: number }) => r.rating) ?? []
    const averageRating = ratings.length
      ? ratings.reduce((sum, v) => sum + v, 0) / ratings.length
      : review.rating

    const { error: updateError } = await supabase
      .from('provider_listings')
      .update({ rating: averageRating, review_count: ratings.length })
      .eq('provider_id', provider_id)

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 })
    }

    const { error: notifyError } = await supabase.from('notifications').insert({
      user_id: provider_id,
      type: 'review_received',
      title: 'New review received',
      body: `A new review was added for booking ${booking_id}.`,
      entity_type: 'review',
      entity_id: review.id,
    })

    if (notifyError) {
      return new Response(JSON.stringify({ error: notifyError.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
