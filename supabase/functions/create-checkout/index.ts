// Supabase Edge Function: create-checkout
// Creates a Stripe Checkout Session and pending analysis records

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13?target=deno'

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

const PACKAGE_URL_COUNT: Record<string, number> = { single: 1, double: 2, triple: 3 }
const PRICE_ENV: Record<string, string> = {
  single: 'STRIPE_PRICE_SINGLE',
  double: 'STRIPE_PRICE_DOUBLE',
  triple: 'STRIPE_PRICE_TRIPLE',
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const { urls, options, package: pkg } = await req.json()

    // Validate package
    const expectedCount = PACKAGE_URL_COUNT[pkg]
    if (!expectedCount) {
      return new Response(JSON.stringify({ error: 'Ungültiges Paket' }), { status: 400 })
    }

    // Validate URLs
    if (!Array.isArray(urls) || urls.length !== expectedCount) {
      return new Response(JSON.stringify({ error: `${expectedCount} URL(s) erforderlich` }), { status: 400 })
    }

    const invalidUrls: number[] = []
    for (let i = 0; i < urls.length; i++) {
      if (!isValidUrl(urls[i])) invalidUrls.push(i)
    }
    if (invalidUrls.length > 0) {
      return new Response(JSON.stringify({ error: 'Ungültige URL(s)', invalidUrls }), { status: 400 })
    }

    // Stripe
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
    const priceId = Deno.env.get(PRICE_ENV[pkg])!
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        urls: JSON.stringify(urls),
        options: JSON.stringify(options),
        package: pkg,
      },
      success_url: `${appUrl}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?payment=cancelled`,
    })

    // Create order + analyses in DB
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({ stripe_session_id: session.id, package: pkg })
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

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-checkout error:', err)
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), { status: 500 })
  }
})
