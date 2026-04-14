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
    const { user_id } = await req.json() as { user_id: string }
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'Missing user_id' }), { status: 400 })
    }

    const { data, error } = await supabase
      .from('admin_users')
      .select('permission_level')
      .eq('profile_id', user_id)
      .single()

    if (error && error.code !== 'PGRST116') {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 })
    }

    if (!data) {
      return new Response(JSON.stringify({ admin: false }), { status: 200 })
    }

    return new Response(
      JSON.stringify({ admin: true, level: data.permission_level }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
  }
})
