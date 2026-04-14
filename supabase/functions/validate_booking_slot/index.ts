import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false } }
)

interface BookingSlotPayload {
  provider_id: string
  booking_date: string
  start_time: string
  end_time: string
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const payload = await req.json() as BookingSlotPayload
    const dayOfWeek = new Date(payload.booking_date).getUTCDay()

    const { data: availability, error: availErr } = await supabase
      .from('availability_slots')
      .select('start_time, end_time, slot_type')
      .eq('provider_id', payload.provider_id)
      .eq('day_of_week', dayOfWeek)

    if (availErr) {
      return new Response(JSON.stringify({ available: false, reason: availErr.message }), { status: 500 })
    }

    const slot = availability?.find((s) =>
      s.slot_type === 'available' &&
      s.start_time <= payload.start_time &&
      s.end_time >= payload.end_time
    )

    if (!slot) {
      return new Response(
        JSON.stringify({ available: false, reason: 'Requested time is outside provider availability.' }),
        { status: 200 }
      )
    }

    const { data: existing, error: bookingErr } = await supabase
      .from('bookings')
      .select('id')
      .eq('provider_id', payload.provider_id)
      .in('status', ['pending', 'confirmed'])
      .eq('booking_date', payload.booking_date)
      .or(
        `and(start_time.lte.${payload.start_time},end_time.gte.${payload.start_time}),` +
        `and(start_time.lte.${payload.end_time},end_time.gte.${payload.end_time}),` +
        `and(start_time.gte.${payload.start_time},start_time.lt.${payload.end_time})`
      )

    if (bookingErr) {
      return new Response(JSON.stringify({ available: false, reason: bookingErr.message }), { status: 500 })
    }

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({ available: false, reason: 'Provider already has a booking during this time.' }),
        { status: 200 }
      )
    }

    return new Response(JSON.stringify({ available: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
