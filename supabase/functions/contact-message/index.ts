import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = (origin: string) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
})

const json = (status: number, body: Record<string, unknown>, origin: string) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' } })

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin') ?? ''
  const allowedOrigin = Deno.env.get('SITE_ORIGIN') ?? ''
  const localOrigin = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
  if (origin !== allowedOrigin && !localOrigin) return new Response('Forbidden', { status: 403 })
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders(origin) })
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' }, origin)
  if (Number(req.headers.get('content-length') ?? '0') > 12_000) return json(413, { error: 'Request too large' }, origin)

  let payload: { name?: unknown; email?: unknown; body?: unknown; website?: unknown }
  try { payload = await req.json() } catch { return json(400, { error: 'Invalid request' }, origin) }
  if (typeof payload.website === 'string' && payload.website.trim()) return json(200, { ok: true }, origin)
  const name = typeof payload.name === 'string' ? payload.name.trim() : ''
  const email = typeof payload.email === 'string' ? payload.email.trim().toLowerCase() : ''
  const body = typeof payload.body === 'string' ? payload.body.trim() : ''
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !body || body.length > 5000) {
    return json(400, { error: 'Please check the form fields' }, origin)
  }
  const forwarded = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(forwarded))
  const ipHash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })

  const { data: allowed, error: rateError } = await supabase.rpc('consume_contact_rate_limit', { p_ip_hash: ipHash })
  if (rateError) {
    console.error('Contact rate limit check failed')
    return json(503, { error: 'Temporarily unavailable' }, origin)
  }
  if (!allowed) return json(429, { error: 'Please wait before sending another message' }, origin)

  const { error: insertError } = await supabase.from('messages').insert({ name, email, body })
  if (insertError) {
    console.error('Contact message storage failed')
    return json(503, { error: 'Could not save message' }, origin)
  }

  // Messages are delivered to the private Admin inbox in the portfolio.
  return json(200, { ok: true }, origin)
})
