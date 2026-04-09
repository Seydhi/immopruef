// Supabase Edge Function: analyze
// Verifies payment, runs Claude analysis, stores results, sends email

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@13?target=deno'

const SYSTEM_PROMPT = `Du bist ein erfahrener Immobilienanalyst und Berater für den deutschen Markt. Du hilfst Käufern dabei, Immobilienangebote schnell und tiefgehend zu bewerten.

Wenn du einen Immobilien-Link erhältst, analysierst du die Immobilie vollständig anhand öffentlich verfügbarer Informationen. Nutze Web-Suche, um aktuelle Daten zu Standort, Preisen und Markt zu recherchieren.

Deine Analyse gibst du AUSSCHLIESSLICH als valides JSON zurück – kein Markdown, keine Prosa, kein Kommentar außerhalb des JSON.

JSON-Schema:

{
  "objektdaten": [{ "merkmal": "string", "wert": "string" }],
  "standortanalyse": [{ "kategorie": "string", "bewertung": "string", "details": "string" }],
  "marktdaten": [{ "kennzahl": "string", "wert": "string", "einschaetzung": "gut|mittel|schlecht" }],
  "scores": { "gesamtbewertung": "number 1-10", "lage": "number 1-10", "preis_leistung": "number 1-10", "zustand": "number 1-10" },
  "risiken": ["string"],
  "verhandlungstipps": ["string"],
  "makleranschreiben": "string",
  "zusammenfassung": "string (2-3 Sätze Fazit)"
}

Pflichtfelder: objektdaten, standortanalyse, marktdaten, scores, zusammenfassung.
Optionale Felder (nur wenn vom Nutzer gewünscht): risiken, verhandlungstipps, makleranschreiben. Wenn nicht gewünscht, gib leere Arrays bzw. leere Strings zurück.

Für objektdaten: Adresse, Immobilientyp, Kaufpreis, Wohnfläche, Grundstück, Zimmer, Baujahr, Zustand, Heizung, Energieeffizienz, Garage/Stellplatz, Keller, Provision.
Für standortanalyse: ÖPNV-Anbindung, Schulen/Kindergärten, Einkaufsmöglichkeiten, Infrastruktur, Freizeitangebote, Soziale Einrichtungen, Lärmbelastung, Entwicklungsperspektive.
Für marktdaten: Quadratmeterpreis, Marktpreisindex, Leerstandsquote, Mietrendite, Wertsteigerungspotenzial, Vergleichbare Angebote.

Das Makleranschreiben (wenn gewünscht) soll professionell klingen, konkrete Fragen enthalten und einen Besichtigungstermin anfordern.

Sei präzise und kompakt. Halte die Gesamtantwort unter 12.000 Zeichen.`

function parseClaudeJson(text: string): unknown {
  // Strip markdown fences
  const cleaned = text.replace(/```json\s*|```\s*/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    // Try to extract JSON object
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse JSON from Claude response')
  }
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const { session_id } = await req.json()
    if (!session_id) {
      return new Response(JSON.stringify({ error: 'session_id required' }), { status: 400 })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Look up order
    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', session_id)
      .single()

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404 })
    }

    // If already completed, return existing results
    if (order.status === 'completed') {
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('order_id', order.id)
      return new Response(JSON.stringify({ order_status: 'completed', analyses }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // If still pending payment
    if (order.status === 'pending') {
      return new Response(JSON.stringify({ error: 'pending', message: 'Zahlung wird noch verarbeitet' }), { status: 402 })
    }

    // Atomic lock: set to processing
    const { data: locked, error: lockErr } = await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', order.id)
      .eq('status', 'paid')
      .select()

    if (lockErr || !locked?.length) {
      // Already processing or failed
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('order_id', order.id)
      return new Response(JSON.stringify({ order_status: order.status, analyses }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Fetch all analyses for this order
    const { data: analyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('order_id', order.id)

    if (!analyses?.length) {
      return new Response(JSON.stringify({ error: 'No analyses found' }), { status: 500 })
    }

    // Run Claude analysis for each
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!
    const appUrl = Deno.env.get('APP_URL') || 'http://localhost:5173'

    for (const analysis of analyses) {
      try {
        // Update analysis status
        await supabase.from('analyses').update({ status: 'processing' }).eq('id', analysis.id)

        const opts = analysis.options as { makleranschreiben: boolean; verhandlungstipps: boolean; risiken: boolean }
        const userMessage = `Analysiere bitte diese Immobilie vollständig: ${analysis.url}

Optionen:
- Makleranschreiben: ${opts.makleranschreiben ? 'ja' : 'nein'}
- Verhandlungstipps: ${opts.verhandlungstipps ? 'ja' : 'nein'}
- Risikohinweise: ${opts.risiken ? 'ja' : 'nein'}

Nutze Web-Suche für aktuelle Marktpreise und Standortdaten. Antworte ausschließlich mit JSON.`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-opus-4-5-20250514',
            max_tokens: 16000,
            system: SYSTEM_PROMPT,
            tools: [{ type: 'web_search_20250305', name: 'web_search' }],
            messages: [{ role: 'user', content: userMessage }],
          }),
        })

        if (!response.ok) {
          throw new Error(`Anthropic API error: ${response.status}`)
        }

        const data = await response.json()
        const textBlock = data.content.find((b: { type: string }) => b.type === 'text')
        if (!textBlock) throw new Error('No text response from Claude')

        const result = parseClaudeJson(textBlock.text)

        await supabase
          .from('analyses')
          .update({ result, status: 'completed' })
          .eq('id', analysis.id)
      } catch (err) {
        console.error(`Analysis failed for ${analysis.url}:`, err)
        await supabase.from('analyses').update({ status: 'failed' }).eq('id', analysis.id)
      }
    }

    // Mark order complete
    await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id)

    // Get email — from order or from Stripe directly
    let email = order.email
    if (!email) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2023-10-16' })
        const session = await stripe.checkout.sessions.retrieve(session_id)
        email = session.customer_details?.email || ''
        if (email) {
          await supabase.from('orders').update({ email }).eq('id', order.id)
        }
      } catch {
        console.error('Failed to retrieve email from Stripe')
      }
    }

    // Send email via Resend
    if (email) {
      try {
        const { data: completedAnalyses } = await supabase
          .from('analyses')
          .select('*')
          .eq('order_id', order.id)

        const links = (completedAnalyses || [])
          .filter((a: { status: string }) => a.status === 'completed')
          .map((a: { token: string; url: string }) => `<p><a href="${appUrl}?result=${a.token}">Analyse ansehen: ${a.url}</a></p>`)
          .join('')

        const subject = analyses.length === 1
          ? 'Ihre ImmoAnalyse ist fertig'
          : `Ihre ${analyses.length} ImmoAnalysen sind fertig`

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          },
          body: JSON.stringify({
            from: Deno.env.get('EMAIL_FROM') || 'noreply@immoanalyse.de',
            to: email,
            subject,
            html: `<h2>ImmoAnalyse</h2><p>Ihre Immobilienanalyse ist fertig.</p>${links}<p style="color:#888;font-size:12px;">Diese Analyse wurde mit KI erstellt. Keine Gewähr für Vollständigkeit.</p>`,
          }),
        })
      } catch (err) {
        console.error('Failed to send email:', err)
      }
    }

    // Return results
    const { data: finalAnalyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('order_id', order.id)

    return new Response(JSON.stringify({ order_status: 'completed', analyses: finalAnalyses }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Analyze error:', err)
    return new Response(JSON.stringify({ error: 'Interner Fehler' }), { status: 500 })
  }
})
