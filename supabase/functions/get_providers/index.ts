import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
)

serve(async (req) => {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const url = new URL(req.url)
    const type = url.searchParams.get('type')
    const available = url.searchParams.get('available')
    const suburb = url.searchParams.get('suburb')
    const service_tag = url.searchParams.get('service_tag')
    const max_price_social = url.searchParams.get('max_price_social')
    const min_rating = url.searchParams.get('min_rating')
    const sort = url.searchParams.get('sort') ?? 'rating'
    const limit = Number(url.searchParams.get('limit') ?? '20')
    const offset = Number(url.searchParams.get('offset') ?? '0')

    let query = supabase
      .from('provider_listings')
      .select('id,provider_id,headline,type,price_social,price_intimate,price_online_from,service_tags,rating,review_count,available,status,profiles!inner(display_name,suburb,pronouns)')
      .eq('status', 'approved')
      .eq('paused', false)
      .limit(limit)
      .offset(offset)

    if (type) query = query.eq('type', type)
    if (available === 'true') query = query.eq('available', true)
    if (suburb) query = query.ilike('profiles.suburb', `%${suburb}%`)
    if (service_tag) query = query.contains('service_tags', [service_tag])
    if (max_price_social) query = query.lte('price_social', Number(max_price_social))
    if (min_rating) query = query.gte('rating', Number(min_rating))

    const sortMap: Record<string, string> = {
      price: 'price_social',
      rating: 'rating',
      review_count: 'review_count',
      created_at: 'created_at',
    }
    query = query.order(sortMap[sort] ?? 'rating', { ascending: false })

    const { data, error } = await query
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    return new Response(JSON.stringify({ data }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
