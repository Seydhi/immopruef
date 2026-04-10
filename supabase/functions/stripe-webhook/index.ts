// Supabase Edge Function: stripe-webhook
// Handles Stripe webhook events, marks orders as paid

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13?target=deno'

serve(async (req) => {
  // Webhooks only come as POST from Stripe — no CORS needed
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!

  try {
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')!

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      )

      // Idempotency check
      const { error: idempotencyErr } = await supabase
        .from('processed_events')
        .insert({ event_id: event.id })

      if (idempotencyErr) {
        // Duplicate — already processed
        return new Response('OK', { status: 200 })
      }

      // Mark order as paid, store email
      const email = session.customer_details?.email || ''
      const { error: updateErr } = await supabase
        .from('orders')
        .update({ status: 'paid', email })
        .eq('stripe_session_id', session.id)
        .eq('status', 'pending')

      if (updateErr) {
        console.error('Failed to update order:', updateErr)
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Webhook Error', { status: 400 })
  }
})
