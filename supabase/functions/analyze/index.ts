// Supabase Edge Function: analyze
// Verifies payment, runs Claude analysis, stores results, sends email

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@17?target=deno'

// ═══════════════════════════════════════════════════════════════
// CORS
// ═══════════════════════════════════════════════════════════════

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

// ═══════════════════════════════════════════════════════════════
// System Prompts
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT_STANDARD = `Du bist ein erfahrener Immobilienanalyst und Berater für den deutschen Markt. Du analysierst Immobilienangebote tiefgehend anhand öffentlich verfügbarer Daten.

Wenn du einen Immobilien-Link erhältst, recherchiere über Web-Suche aktuelle Daten und erstelle eine vollständige Analyse.

Antworte AUSSCHLIESSLICH mit validem JSON — kein Markdown, keine Prosa außerhalb des JSON.

JSON-Schema (alle Felder sind Pflicht):

{
  "objektdaten": [{ "merkmal": "string", "wert": "string" }],

  "preisbewertung": {
    "preisProQm": "string (z.B. 4.987 €/m²)",
    "regionalerDurchschnitt": "string",
    "abweichung": "string (z.B. -8,0%)",
    "ampel": "guenstig | fair | teuer",
    "kaufpreismieteVerhaeltnis": "string (Zahl)",
    "kaufpreismieteEinschaetzung": "string",
    "bodenrichtwert": "string",
    "preisentwicklung5Jahre": "string",
    "preisprognose5Jahre": "string"
  },

  "gesamtkosten": {
    "kaufpreis": "string",
    "kaufnebenkosten": {
      "grunderwerbsteuer": { "satz": "string (z.B. 6,0% (Berlin))", "betrag": "string" },
      "notar": { "satz": "string", "betrag": "string" },
      "grundbuch": { "satz": "string", "betrag": "string" },
      "makler": { "satz": "string", "betrag": "string" },
      "gesamt": "string"
    },
    "geschaetzteSanierung": "string",
    "gesamtinvestition": "string",
    "laufendeKosten": [{ "position": "string", "betragMonat": "string", "betragJahr": "string" }],
    "laufendeKostenGesamt": { "monat": "string", "jahr": "string" }
  },

  "energieanalyse": {
    "effizienzklasse": "string (A+ bis H)",
    "endenergiebedarf": "string",
    "heizkostenJahr": "string",
    "heizungstyp": "string",
    "heizungsalter": "string",
    "gegPflicht": { "besteht": "boolean", "details": "string" },
    "sanierungsoptionen": [{ "massnahme": "string", "kosten": "string", "ersparnis": "string", "foerderung": "string" }],
    "foerdermittelGesamt": "string"
  },

  "modernisierung": {
    "sanierungsstauGesamt": "string",
    "items": [{ "bauteil": "string", "geschaetztesAlter": "string", "lebensdauer": "string", "zustand": "gut|mittel|kritisch", "geschaetzteKosten": "string", "faelligIn": "string" }],
    "timeline": [{ "zeitraum": "string", "massnahmen": "string", "kosten": "string" }]
  },

  "standortanalyse": {
    "gesamtScore": "number 1-10",
    "kategorien": [{ "kategorie": "string", "bewertung": "string", "score": "number 1-10", "details": "string" }],
    "demografie": { "bevoelkerungsentwicklung": "string", "trend": "wachsend|stabil|schrumpfend", "altersstruktur": "string", "kaufkraftindex": "string" },
    "wirtschaft": { "arbeitslosenquote": "string", "topArbeitgeber": ["string"], "branchenstruktur": "string" },
    "infrastruktur": { "breitband": "string", "breitbandTyp": "string", "mobilfunk": "string" }
  },

  "risikobewertung": {
    "gesamtrisiko": "niedrig|mittel|hoch",
    "items": [{ "kategorie": "string", "risiko": "niedrig|mittel|hoch", "details": "string", "handlungsempfehlung": "string" }],
    "redFlags": ["string"]
  },

  "finanzierung": {
    "szenarien": [{ "name": "string", "eigenkapital": "string", "darlehenssumme": "string", "zinssatz": "string", "tilgung": "string", "monatlicheRate": "string", "restschuld10Jahre": "string", "gesamtlaufzeit": "string" }],
    "empfohleneEigenkapitalquote": "string",
    "kaufenVsMieten": { "mpiMieteMonat": "string", "kostenMiete20Jahre": "string", "kostenKauf20Jahre": "string", "vorteil": "kaufen|mieten", "differenz": "string" },
    "stresstest": [{ "szenario": "string", "monatlicheRate": "string", "bewertung": "tragbar|grenzwertig|kritisch" }]
  },

  "scores": { "gesamtbewertung": "number", "lage": "number", "preis_leistung": "number", "zustand": "number", "energie": "number", "finanzierung": "number" },

  "risiken": ["string (kurze Zusammenfassung der wichtigsten Risiken)"],
  "verhandlungstipps": ["string"],
  "makleranschreiben": "string (professionell, mit konkreten Fragen)",
  "zusammenfassung": "string (3-4 Sätze Fazit mit Gesamtinvestition und Empfehlung)",

  "marktdaten": [{ "kennzahl": "string", "wert": "string", "einschaetzung": "gut|mittel|schlecht" }]
}

Hinweise:
- Für objektdaten: Adresse, Typ, Kaufpreis, Wohnfläche, Grundstück, Zimmer, Baujahr, Zustand, Heizung, Energieeffizienz, Stellplatz, Keller, Hausgeld, Provision.
- Für standortanalyse.kategorien: ÖPNV, Schulen/Kitas, Einkauf, Ärzte, Freizeit, Lärm, Sicherheit, Entwicklungsperspektive.
- Für finanzierung.szenarien: Erstelle 3 Szenarien (Konservativ 30% EK, Standard 20% EK, Minimal 10% EK) mit aktuellen Bauzinsen.
- Für stresstest: Mindestens 3 Szenarien (Zinserhöhung, Sonderumlage, Einkommensverlust).
- Für modernisierung.items: Heizung, Fenster, Elektrik, Bad, Dach, Fassade.
- Für gesamtkosten: Berechne Grunderwerbsteuer korrekt je Bundesland!
- Für laufendeKosten: Hausgeld, Grundsteuer, Versicherung, Rücklagen, Heizkosten, Strom, Wasser.
- Optionale Felder (nur wenn vom Nutzer gewünscht): verhandlungstipps, makleranschreiben. Wenn nicht gewünscht: leere Arrays/Strings.
- Sei präzise mit Zahlen. Nutze Web-Suche für aktuelle Marktpreise, Bodenrichtwerte und Standortdaten.`

const SYSTEM_PROMPT_PREMIUM_ADDITION = `

ZUSÄTZLICH zum Standard-Schema: Füge ein "premiumReport"-Objekt hinzu:

{
  "premiumReport": {
    "reportDatum": "string (heutiges Datum)",
    "reportNummer": "string (z.B. IP-2026-04-XXXXX)",

    "wertermittlung": {
      "vergleichswert": {
        "wert": "string (Spanne)",
        "methode": "string (Beschreibung nach §15 ImmoWertV)",
        "vergleichsobjekte": [{ "adresse": "string", "preis": "string", "qm": "string", "abweichung": "string" }]
      },
      "sachwert": { "bodenwert": "string (Berechnung)", "gebaeudewert": "string", "alterswertminderung": "string", "sachwert": "string" },
      "ertragswert": { "jahresrohertrag": "string", "bewirtschaftungskosten": "string", "reinertrag": "string", "liegenschaftszins": "string", "ertragswert": "string" },
      "fazit": { "marktwertSpanne": "string", "empfohlenerKaufpreis": "string", "einschaetzung": "string (2-3 Sätze)" }
    },

    "standortDossier": {
      "entfernungen": [{ "ziel": "string", "entfernung": "string", "fahrzeit": "string" }],
      "hochwasserrisiko": { "zone": "string", "details": "string", "risiko": "niedrig|mittel|hoch" },
      "laermbelastung": { "tags": "string", "nachts": "string", "quelle": "string", "bewertung": "string" },
      "radon": { "wert": "string", "risiko": "niedrig|mittel|hoch" },
      "bebauungsplan": { "nutzung": "string", "gfz": "string", "grz": "string", "besonderheiten": "string" },
      "sozialstruktur": { "beschreibung": "string", "milieuschutz": "boolean", "vorkaufsrecht": "boolean" }
    },

    "vermoegensvergleich": {
      "jahre": [0, 5, 10, 15, 20, 25, 30],
      "vermoegenKauf": ["string (Werte für jedes Jahr)"],
      "vermoegenMieteEtf": ["string (Werte für jedes Jahr, bei 7% ETF-Rendite)"],
      "breakEvenJahr": "number"
    },

    "vorKaufCheckliste": [{
      "kategorie": "string",
      "items": [{ "text": "string", "wichtigkeit": "muss|soll|kann", "erledigt": false }]
    }],

    "steuerlicheAspekte": [{ "aspekt": "string", "details": "string", "vorteil": "string" }],

    "gutachterEmpfehlung": { "empfohlen": "boolean", "grund": "string", "geschaetzteKosten": "string" }
  }
}

Für die Wertermittlung:
- Vergleichswert: Recherchiere 5-6 echte Vergleichsobjekte in der Umgebung (verkauft oder angeboten).
- Sachwert: Berechne mit aktuellen Bodenrichtwerten und NHK 2010 (angepasst).
- Ertragswert: Nutze ortsübliche Vergleichsmiete und Liegenschaftszins vom Gutachterausschuss.

Für Entfernungen: Mindestens 10 POIs (ÖPNV, Schule, Kita, Arzt, Supermarkt, Park, Krankenhaus, Bahnhof, Flughafen).
Für Checkliste: 4 Kategorien (Dokumente vom Verkäufer, Selbst recherchieren, Bei Besichtigung, Vor Vertragsunterzeichnung).
Für Steuern: Eigennutzung, Vermietung-AfA, Werbungskosten, Spekulationssteuer, Grunderwerbsteuer.`

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Extract JSON from Claude's response, handling web_search tool use blocks.
 * When Claude uses web_search, the response contains multiple content blocks:
 * tool_use, tool_result, and finally text with the JSON.
 * We need to find the LAST text block which contains the final answer.
 */
function extractClaudeJson(data: { content: Array<{ type: string; text?: string }> }): unknown {
  // Collect all text blocks — the last one has the final JSON answer
  const textBlocks = data.content.filter(
    (b: { type: string }) => b.type === 'text'
  )

  if (textBlocks.length === 0) {
    throw new Error('No text response from Claude')
  }

  // Use the last text block (after all web searches are done)
  const text = textBlocks[textBlocks.length - 1].text!
  return parseJson(text)
}

function parseJson(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*|```\s*/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    // Try to extract the outermost JSON object
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) return JSON.parse(match[0])
    throw new Error('Could not parse JSON from Claude response')
  }
}

// ═══════════════════════════════════════════════════════════════
// Main Handler
// ═══════════════════════════════════════════════════════════════

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const { session_id } = await req.json()
    if (!session_id) {
      return jsonResponse({ error: 'session_id required' }, 400)
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
      return jsonResponse({ error: 'Order not found' }, 404)
    }

    // If already completed, return existing results
    if (order.status === 'completed') {
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('order_id', order.id)
      return jsonResponse({ order_status: 'completed', analyses })
    }

    // If still pending payment
    if (order.status === 'pending') {
      return jsonResponse({ error: 'pending', message: 'Zahlung wird noch verarbeitet' }, 402)
    }

    // Atomic lock: set to processing (only if currently 'paid')
    const { data: locked, error: lockErr } = await supabase
      .from('orders')
      .update({ status: 'processing' })
      .eq('id', order.id)
      .eq('status', 'paid')
      .select()

    if (lockErr || !locked?.length) {
      // Already processing or completed by another request
      const { data: analyses } = await supabase
        .from('analyses')
        .select('*')
        .eq('order_id', order.id)
      return jsonResponse({ order_status: order.status, analyses })
    }

    // Fetch all analyses for this order
    const { data: analyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('order_id', order.id)

    if (!analyses?.length) {
      return jsonResponse({ error: 'No analyses found' }, 500)
    }

    // Determine if premium
    const isPremium = order.package === 'premium'
    const systemPrompt = isPremium
      ? SYSTEM_PROMPT_STANDARD + SYSTEM_PROMPT_PREMIUM_ADDITION
      : SYSTEM_PROMPT_STANDARD
    const maxTokens = isPremium ? 24000 : 16000

    // Run Claude analysis for each URL
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!
    const appUrl = Deno.env.get('APP_URL') || 'https://immopruef.de'

    for (const analysis of analyses) {
      try {
        await supabase.from('analyses').update({ status: 'processing' }).eq('id', analysis.id)

        const opts = analysis.options as { makleranschreiben: boolean; verhandlungstipps: boolean; risiken: boolean }
        const userMessage = `Analysiere diese Immobilie vollständig: ${analysis.url}

Optionen:
- Makleranschreiben: ${opts.makleranschreiben ? 'ja' : 'nein'}
- Verhandlungstipps: ${opts.verhandlungstipps ? 'ja' : 'nein'}
- Risikohinweise: ${opts.risiken ? 'ja' : 'nein'}
${isPremium ? '- Premium-Report: ja (inkl. Wertermittlung, Standort-Dossier, Vermögensvergleich, Checkliste)' : ''}

Nutze Web-Suche für aktuelle Marktpreise, Bodenrichtwerte und Standortdaten. Antworte ausschließlich mit JSON.`

        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: maxTokens,
            system: systemPrompt,
            tools: [
              {
                type: 'web_search_20250305',
                name: 'web_search',
                max_uses: 15,
              },
            ],
            messages: [{ role: 'user', content: userMessage }],
          }),
        })

        if (!response.ok) {
          const errBody = await response.text()
          throw new Error(`Anthropic API error: ${response.status} — ${errBody}`)
        }

        const data = await response.json()

        // Handle multi-turn: if Claude stopped to use a tool, we may need to continue
        let finalData = data
        let turns = 0
        const messages: Array<{ role: string; content: unknown }> = [
          { role: 'user', content: userMessage },
        ]

        while (finalData.stop_reason === 'tool_use' && turns < 15) {
          turns++
          // Add assistant response
          messages.push({ role: 'assistant', content: finalData.content })

          // Extract tool results and add them
          const toolUseBlocks = finalData.content.filter(
            (b: { type: string }) => b.type === 'tool_use'
          )
          const toolResults = toolUseBlocks.map((t: { id: string }) => ({
            type: 'tool_result',
            tool_use_id: t.id,
            content: 'Ergebnis verarbeitet. Bitte fahre mit der Analyse fort und antworte mit dem vollständigen JSON.',
          }))

          messages.push({ role: 'user', content: toolResults })

          const continueResponse = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': anthropicKey,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-20250514',
              max_tokens: maxTokens,
              system: systemPrompt,
              tools: [
                {
                  type: 'web_search_20250305',
                  name: 'web_search',
                  max_uses: 15,
                },
              ],
              messages,
            }),
          })

          if (!continueResponse.ok) {
            const errBody = await continueResponse.text()
            throw new Error(`Anthropic API continue error: ${continueResponse.status} — ${errBody}`)
          }

          finalData = await continueResponse.json()
        }

        const result = extractClaudeJson(finalData)

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

    // Get email from Stripe
    let email = order.email
    if (!email) {
      try {
        const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!)
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
          .map((a: { token: string; url: string }) => `<p><a href="${appUrl}?result=${a.token}" style="color:#16a34a;">Analyse ansehen: ${a.url}</a></p>`)
          .join('')

        const subject = isPremium
          ? 'Ihr Premium Kaufentscheidungs-Report ist fertig — ImmoPrüf'
          : analyses.length === 1
            ? 'Ihre Immobilienanalyse ist fertig — ImmoPrüf'
            : `Ihre ${analyses.length} Immobilienanalysen sind fertig — ImmoPrüf`

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          },
          body: JSON.stringify({
            from: Deno.env.get('EMAIL_FROM') || 'noreply@immopruef.de',
            to: email,
            subject,
            html: `
              <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
                <h2 style="color:#111;">ImmoPrüf</h2>
                <p>${isPremium ? 'Ihr Premium Kaufentscheidungs-Report' : 'Ihre Immobilienanalyse'} ist fertig.</p>
                ${links}
                <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
                <p style="color:#888;font-size:12px;">KI-Analyse auf Basis öffentlich verfügbarer Daten. Keine Gewähr für Vollständigkeit oder Richtigkeit.</p>
              </div>
            `,
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

    return jsonResponse({ order_status: 'completed', analyses: finalAnalyses })
  } catch (err) {
    console.error('Analyze error:', err)
    return jsonResponse({ error: 'Interner Fehler' }, 500)
  }
})
