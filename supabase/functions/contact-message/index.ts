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
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const from = Deno.env.get('TWILIO_FROM_NUMBER')
  const to = Deno.env.get('CONTACT_ALERT_PHONE')
  if (!accountSid || !authToken || !from || !to) {
    console.error('SMS contact alerts are not configured')
    return json(503, { error: 'Contact alerts are not configured yet' }, origin)
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

  const sendSmsAlert = async () => {
    const params = new URLSearchParams({
      To: to,
      From: from,
      Body: `New portfolio message from ${name} (${email}). Sign in to your portfolio admin to read it.`,
    })
    try {
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params,
      })
      if (!response.ok) console.error('Contact SMS delivery failed with status', response.status)
    } catch {
      console.error('Contact SMS delivery request failed')
    }
  }
  await sendSmsAlert()

  return json(200, { ok: true }, origin)
})
