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

      // Get order details before updating
      const { data: orderData } = await supabase
        .from('orders')
        .select('id, package')
        .eq('stripe_session_id', sessionId)
        .single()

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

      // ═══════════════════════════════════════════════════════
      // Send instant confirmation email
      // ═══════════════════════════════════════════════════════
      if (email && Deno.env.get('RESEND_API_KEY')) {
        try {
          const pkg = orderData?.package || 'single'
          const isPremium = pkg === 'premium'
          const appUrl = Deno.env.get('APP_URL') || 'https://immopruef.de'
          const emailFrom = Deno.env.get('EMAIL_FROM') || 'ImmoPrüf <info@immopruef.de>'

          const packageNames: Record<string, string> = {
            single: '1 Immobilie · Quick-Check',
            double: '2 Immobilien · Quick-Check Duo',
            triple: '3 Immobilien · Quick-Check Triple',
            premium: '1 Immobilie · Kaufentscheidungs-Report',
          }
          const packagePrices: Record<string, string> = {
            single: '19,00 €',
            double: '29,00 €',
            triple: '34,00 €',
            premium: '79,00 €',
          }

          // Get analyses URLs for this order
          const { data: orderAnalyses } = await supabase
            .from('analyses')
            .select('url')
            .eq('order_id', orderData?.id)

          const urlList = (orderAnalyses || [])
            .map((a: { url: string }, i: number) => {
              const cleanUrl = a.url.split('#')[0].split('?')[0]
              const exposeNr = a.url.match(/expose\/(\d+)/)?.[1] || ''
              return `
                <tr>
                  <td style="padding:10px 16px;border-bottom:1px solid #f0f0f0;">
                    <div style="font-size:13px;color:#444;">
                      <span style="color:#1a6b3c;font-weight:600;">${i + 1}.</span>
                      ${exposeNr ? `Exposé ${exposeNr}` : cleanUrl}
                    </div>
                    <div style="font-size:11px;color:#999;margin-top:2px;">
                      <a href="${cleanUrl}" style="color:#999;text-decoration:none;">${cleanUrl}</a>
                    </div>
                  </td>
                </tr>`
            }).join('')

          const estimatedMinutes = isPremium ? '3–5' : (orderAnalyses?.length || 1) > 1 ? '3–6' : '1–3'

          console.log(`Sending confirmation email to ${email}`)

          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
            },
            body: JSON.stringify({
              from: emailFrom,
              to: email,
              subject: 'Bestellung bestätigt — Ihre Analyse wird erstellt',
              html: `
<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f5f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">

    <!-- Header -->
    <div style="background:#1a3c2a;border-radius:12px 12px 0 0;padding:28px 24px;text-align:center;">
      <h1 style="margin:0;color:#f7f5f0;font-size:22px;font-weight:600;letter-spacing:0.5px;">
        Immo<span style="color:#c9a84c;">Prüf</span>
      </h1>
    </div>

    <!-- Body -->
    <div style="background:#ffffff;padding:28px 24px;border-left:1px solid #e8e4dc;border-right:1px solid #e8e4dc;">

      <!-- Success Banner -->
      <div style="background:#e8f5e9;border:1px solid #a5d6a7;border-radius:8px;padding:16px;margin-bottom:24px;text-align:center;">
        <div style="font-size:28px;margin-bottom:6px;">✓</div>
        <div style="font-size:16px;font-weight:600;color:#2e7d32;">Zahlung erfolgreich!</div>
        <div style="font-size:13px;color:#4a8c5c;margin-top:4px;">Ihre Bestellung wurde bestätigt.</div>
      </div>

      <!-- Order Details -->
      <div style="background:#f9f8f5;border-radius:8px;padding:16px;margin-bottom:20px;">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">Bestelldetails</div>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="font-size:14px;color:#333;padding:4px 0;">Paket</td>
            <td style="font-size:14px;color:#333;padding:4px 0;text-align:right;font-weight:600;">${packageNames[pkg] || pkg}</td>
          </tr>
          <tr>
            <td style="font-size:14px;color:#333;padding:4px 0;">Betrag</td>
            <td style="font-size:14px;color:#1a6b3c;padding:4px 0;text-align:right;font-weight:600;">${packagePrices[pkg] || '—'}</td>
          </tr>
        </table>
      </div>

      <!-- URLs being analyzed -->
      <div style="margin-bottom:20px;">
        <div style="font-size:11px;color:#999;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Wird analysiert</div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f5;border-radius:8px;overflow:hidden;">
          ${urlList}
        </table>
      </div>

      <!-- Timer Info -->
      <div style="background:#fff8e1;border:1px solid #ffe082;border-radius:8px;padding:16px;margin-bottom:20px;">
        <table cellpadding="0" cellspacing="0"><tr>
          <td style="vertical-align:top;padding-right:12px;">
            <div style="font-size:24px;">⏱</div>
          </td>
          <td>
            <div style="font-size:14px;font-weight:600;color:#f57f17;margin-bottom:4px;">Analyse läuft — ca. ${estimatedMinutes} Minuten</div>
            <div style="font-size:13px;color:#666;line-height:1.5;">
              Unsere KI analysiert jetzt Ihr${isPremium ? ' Objekt im Detail' : (orderAnalyses?.length || 1) > 1 ? 'e Immobilien' : 'e Immobilie'}.
              Sie erhalten eine <strong>zweite E-Mail</strong> sobald die Analyse fertig ist — mit direktem Link zum Ergebnis.
            </div>
          </td>
        </tr></table>
      </div>

      <!-- Reassurance -->
      <div style="text-align:center;padding:8px 0;">
        <div style="font-size:13px;color:#888;line-height:1.5;">
          Sie können diese Seite bedenkenlos schließen.<br/>
          Ihr Ergebnis geht nicht verloren.
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#f9f8f5;border-radius:0 0 12px 12px;padding:20px 24px;border:1px solid #e8e4dc;border-top:none;">
      <p style="margin:0 0 8px;font-size:11px;color:#999;line-height:1.4;">
        Bei Fragen antworten Sie einfach auf diese E-Mail oder kontaktieren Sie uns unter
        <a href="mailto:info@immopruef.com" style="color:#1a6b3c;text-decoration:none;">info@immopruef.com</a>
      </p>
      <p style="margin:0;font-size:11px;color:#bbb;">
        <a href="${appUrl}" style="color:#1a6b3c;text-decoration:none;">immopruef.de</a> · Professionelle Immobilienanalyse
      </p>
    </div>

  </div>
</body></html>
              `,
            }),
          })

          console.log('Confirmation email sent successfully')
        } catch (emailErr) {
          console.error('Failed to send confirmation email:', emailErr)
          // Don't fail the webhook because of email issues
        }
      }
    }

    return new Response('OK', { status: 200 })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response('Webhook Error', { status: 400 })
  }
})
