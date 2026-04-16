// Supabase Edge Function: create-checkout
// Creates a Stripe Checkout Session and pending analysis records

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

// ═══════════════════════════════════════════════════════════════
// CORS — restricted to known origins (prevents CSRF + budget abuse via random sites)
// ═══════════════════════════════════════════════════════════════

const ALLOWED_ORIGINS = new Set([
  'https://immopruef.de',
  'https://www.immopruef.de',
  'http://localhost:5173',  // local dev
  'http://localhost:4173',  // vite preview
])

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://immopruef.de'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Vary': 'Origin',
  }
}

function jsonResponse(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

// ═══════════════════════════════════════════════════════════════
// Rate-Limiting — IP-based, sliding window via Supabase
// Protects against budget abuse: e.g. 1000 spam-checkouts → 1000 paid analyses
// ═══════════════════════════════════════════════════════════════

const RATE_LIMIT_MAX_PER_HOUR = 5   // max 5 checkout attempts per IP per hour
const RATE_LIMIT_MAX_PER_DAY = 20   // max 20 per IP per day

async function checkRateLimit(supabase: ReturnType<typeof createClient>, ip: string): Promise<{ ok: boolean; reason?: string }> {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Count recent attempts. Failures here should NOT block legitimate traffic.
  try {
    const { count: hourCount, error: hourErr } = await supabase
      .from('checkout_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', oneHourAgo)

    if (hourErr) {
      console.warn('Rate-limit query failed (allowing):', hourErr.message)
      return { ok: true }
    }
    if ((hourCount ?? 0) >= RATE_LIMIT_MAX_PER_HOUR) {
      return { ok: false, reason: `Zu viele Anfragen (max ${RATE_LIMIT_MAX_PER_HOUR}/Std). Bitte später erneut versuchen.` }
    }

    const { count: dayCount } = await supabase
      .from('checkout_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', oneDayAgo)

    if ((dayCount ?? 0) >= RATE_LIMIT_MAX_PER_DAY) {
      return { ok: false, reason: `Tageslimit erreicht (max ${RATE_LIMIT_MAX_PER_DAY}/Tag).` }
    }

    return { ok: true }
  } catch (e) {
    console.warn('Rate-limit check threw, allowing:', e)
    return { ok: true }
  }
}

async function recordCheckoutAttempt(supabase: ReturnType<typeof createClient>, ip: string): Promise<void> {
  await supabase.from('checkout_attempts').insert({ ip }).throwOnError().catch(() => {})
}

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || req.headers.get('cf-connecting-ip')
    || req.headers.get('x-real-ip')
    || 'unknown'
}

// Email format validation — RFC 5322 simplified
const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
function isValidEmail(email: string): boolean {
  return typeof email === 'string'
    && email.length >= 5
    && email.length <= 254
    && EMAIL_RE.test(email)
}

// ═══════════════════════════════════════════════════════════════
// Config
// ═══════════════════════════════════════════════════════════════

const SUPPORTED_DOMAINS = [
  'immobilienscout24.de',
  'immowelt.de',
  'immonet.de',
  'kleinanzeigen.de',
]

function isValidUrl(input: string): boolean {
  try {
    const url = new URL(input)
    return SUPPORTED_DOMAINS.some(
      (d) => url.hostname === d || url.hostname.endsWith('.' + d)
    )
  } catch {
    return false
  }
}

function nanoid(size = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let id = ''
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  for (const byte of bytes) id += chars[byte % chars.length]
  return id
}

const PACKAGE_URL_COUNT: Record<string, number> = { single: 1, double: 2, triple: 3, premium: 1 }
const PRICE_ENV: Record<string, string> = {
  single: 'STRIPE_PRICE_SINGLE',
  double: 'STRIPE_PRICE_DOUBLE',
  triple: 'STRIPE_PRICE_TRIPLE',
  premium: 'STRIPE_PRICE_PREMIUM',
}

// ═══════════════════════════════════════════════════════════════
// Main Handler
// ═══════════════════════════════════════════════════════════════

serve(async (req) => {
  const origin = req.headers.get('origin')

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, origin)
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SB_SERVICE_ROLE_KEY')!
    )

    // ─── Rate-Limit BEFORE any heavy work ───
    const clientIp = getClientIp(req)
    const limit = await checkRateLimit(supabase, clientIp)
    if (!limit.ok) {
      console.warn(`Rate-limited IP ${clientIp}: ${limit.reason}`)
      return jsonResponse({ error: limit.reason }, 429, origin)
    }

    const { urls, options, package: pkg, email, consents } = await req.json()

    // Validate package
    const expectedCount = PACKAGE_URL_COUNT[pkg]
    if (!expectedCount) {
      return jsonResponse({ error: 'Ungültiges Paket' }, 400, origin)
    }

    // Validate URLs
    if (!Array.isArray(urls) || urls.length !== expectedCount) {
      return jsonResponse({ error: `${expectedCount} URL(s) erforderlich` }, 400, origin)
    }

    const invalidUrls: number[] = []
    for (let i = 0; i < urls.length; i++) {
      if (!isValidUrl(urls[i])) invalidUrls.push(i)
    }
    if (invalidUrls.length > 0) {
      return jsonResponse({ error: 'Ungültige URL(s)', invalidUrls }, 400, origin)
    }

    // Validate email if provided (Stripe webhook also validates, but defense-in-depth)
    const cleanEmail = (email || '').trim()
    if (cleanEmail && !isValidEmail(cleanEmail)) {
      return jsonResponse({ error: 'Ungültige E-Mail-Adresse' }, 400, origin)
    }

    // Validate legal consents — Pflicht fuer Vertragsschluss + Widerrufsverzicht (BGB § 356 Abs. 5)
    if (!consents || consents.agbAccepted !== true || consents.widerrufWaived !== true) {
      return jsonResponse(
        { error: 'Zustimmung zu AGB und Widerrufsverzicht ist erforderlich.' },
        400,
        origin
      )
    }
    const consentTimestamp = typeof consents.timestamp === 'string' && consents.timestamp
      ? consents.timestamp
      : new Date().toISOString()

    // Record this attempt for rate-limiting (whether or not Stripe succeeds)
    await recordCheckoutAttempt(supabase, clientIp)

    // Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
    const priceId = Deno.env.get(PRICE_ENV[pkg])!
    const appUrl = Deno.env.get('APP_URL') || 'https://immopruef.de'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: cleanEmail || undefined,
      metadata: {
        urls: JSON.stringify(urls),
        options: JSON.stringify(options),
        package: pkg,
        agb_accepted: 'true',
        widerruf_waived: 'true',
        consent_timestamp: consentTimestamp,
        consent_ip: clientIp,
      },
      success_url: `${appUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?payment=cancelled`,
    })

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        stripe_session_id: session.id,
        package: pkg,
        email: cleanEmail,
        agb_accepted: true,
        widerruf_waived: true,
        consent_timestamp: consentTimestamp,
        consent_ip: clientIp,
      })
      .select('id')
      .single()

    if (orderErr) throw orderErr

    const analysisRows = urls.map((url: string) => ({
      order_id: order.id,
      token: nanoid(),
      url,
      options,
    }))

    const { error: analysisErr } = await supabase.from('analyses').insert(analysisRows)
    if (analysisErr) throw analysisErr

    return jsonResponse({ url: session.url }, 200, origin)
  } catch (err) {
    console.error('create-checkout error:', err)
    return jsonResponse({ error: 'Interner Fehler' }, 500, origin)
  }
})
