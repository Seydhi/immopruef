// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events, marks orders as paid

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ═══════════════════════════════════════════════════════════════
// Manual webhook signature verification (no SDK dependency)
// ═══════════════════════════════════════════════════════════════

async function verifyWebhookSignature(
  payload: string,
  sigHeader: string,
  secret: string,
  tolerance = 300 // 5 minutes
): Promise<boolean> {
  const parts = sigHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=')
    acc[key.trim()] = value
    return acc
  }, {} as Record<string, string>)

  const timestamp = parts['t']
  const signature = parts['v1']

  if (!timestamp || !signature) return false

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000)
  if (Math.abs(now - parseInt(timestamp)) > tolerance) return false

  // Compute expected signature
  const signedPayload = `${timestamp}.${payload}`
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(signedPayload))
  const expectedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return expectedSig === signature
}

// ═══════════════════════════════════════════════════════════════
// Main Handler
// ═══════════════════════════════════════════════════════════════

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  try {
    const body = await req.text()
    const sigHeader = req.headers.get('stripe-signature')

    if (!sigHeader) {
      console.error('Missing stripe-signature header')
      return new Response('Missing signature', { status: 400 })
    }

    // Verify signature manually (avoids Stripe SDK version issues)
    const isValid = await verifyWebhookSignature(body, sigHeader, webhookSecret)
    if (!isValid) {
      console.error('Invalid webhook signature')
      return new Response('Invalid signature', { status: 400 })
    }

    const event = JSON.parse(body)
    console.log(`Webhook received: ${event.type} (${event.id})`)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      // Idempotency check
      const { error: idempotencyErr } = await supabase
        .from('processed_events')
        .insert({ event_id: event.id })

      if (idempotencyErr) {
        console.log('Duplicate event, skipping:', event.id)
        return new Response('OK', { status: 200 })
      }

      // Mark order as paid, store email
      const email = session.customer_details?.email || ''
      const sessionId = session.id

      console.log(`Marking order paid: session=${sessionId}, email=${email}`)

      const { data: updated, error: updateErr } = await supabase
        .from('orders')
        .update({ status: 'paid', email })
        .eq('stripe_session_id', sessionId)
        .eq('status', 'pending')
        .select('id')

      if (updateErr) {
        console.error('Failed to update order:', updateErr)
      } else {
        console.log(`Order updated:`, updated)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Webhook Error', { status: 400 })
  }
})
