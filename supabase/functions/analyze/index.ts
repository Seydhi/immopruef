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

const SYSTEM_PROMPT_STANDARD = `Du bist ein erfahrener Immobilienanalyst und Berater für den deutschen Markt.

WICHTIGE REGELN:
1. Rufe ZUERST die URL auf und lies ALLE Details des Exposés (Preis, Fläche, Zimmer, Baujahr, Energieausweis, Lage etc.).
2. Suche DANACH nach: "[Stadtteil] Bodenrichtwert", "[Stadt] Immobilienpreise pro qm", "[Stadt] Mietpreisspiegel".
3. JEDES Feld muss einen konkreten Wert haben. NIEMALS "nicht verfügbar", "n/a" oder "nicht berechenbar" schreiben.
4. Wenn ein Wert nicht direkt im Exposé steht, SCHÄTZE ihn realistisch basierend auf Baujahr, Lage und Objekttyp.
5. Berechne IMMER alle Finanzierungsszenarien, auch wenn du den Preis schätzen musst.
6. Scores müssen IMMER Zahlen zwischen 1-10 sein, niemals 0.
7. Antworte AUSSCHLIESSLICH mit validem JSON — kein Markdown, keine Prosa.

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

PFLICHT-HINWEISE:
- objektdaten: Adresse, Typ, Kaufpreis, Wohnfläche, Grundstück, Zimmer, Baujahr, Zustand, Heizung, Energieeffizienz, Stellplatz, Keller, Hausgeld, Provision. Falls Wert nicht im Exposé: "ca. [Schätzwert]" schreiben.
- standortanalyse.kategorien: ÖPNV, Schulen/Kitas, Einkauf, Ärzte, Freizeit, Lärm, Sicherheit, Entwicklungsperspektive. JEDE Kategorie braucht Score 1-10.
- finanzierung.szenarien: IMMER 3 Szenarien berechnen (Konservativ 30% EK, Standard 20% EK, Minimal 10% EK). Aktuelle Bauzinsen ca. 3,5-4,0%. IMMER konkrete Euro-Beträge.
- stresstest: IMMER 3 Szenarien (Zinserhöhung auf 5,5%, Sonderumlage 15.000€, Einkommensverlust 30%).
- kaufenVsMieten: IMMER berechnen. Vergleichsmiete aus Mietpreisspiegel der Stadt verwenden. NIEMALS "nicht berechenbar".
- modernisierung.items: IMMER mindestens 6 Bauteile (Heizung, Fenster, Elektrik, Bad, Dach, Fassade). Alter aus Baujahr ableiten.
- gesamtkosten: Grunderwerbsteuer KORREKT je Bundesland berechnen! Grunderwerbsteuer-Sätze: Bayern 3,5%, Sachsen 3,5%, BaWü 5,0%, NRW 6,5%, Berlin 6,0%, Hamburg 5,5%, Hessen 6,0%, Niedersachsen 5,0%, Brandenburg 6,5%, SH 6,5%.
- laufendeKosten: IMMER mit konkreten Beträgen: Hausgeld, Grundsteuer, Gebäudeversicherung, Rücklagen, Heizkosten, Strom, Wasser/Abwasser.
- energieanalyse: Wenn Energieausweis fehlt, SCHÄTZE basierend auf Baujahr (vor 1980: Klasse F-H, 1980-2000: D-E, 2000-2015: B-C, nach 2015: A-B).
- scores: ALLE Scores müssen Zahlen 1-10 sein. KEIN Score darf 0 sein.
- Optionale Felder (nur wenn vom Nutzer gewünscht): verhandlungstipps, makleranschreiben. Wenn nicht gewünscht: leere Arrays/Strings.
- WICHTIG: Nutze Web-Suche um das Exposé abzurufen. Suche nach der Exposé-Nummer auf ImmoScout24.`

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

        // Clean URL for better web search results
        const cleanUrl = analysis.url.split('#')[0].split('?')[0]
        const exposeMatch = analysis.url.match(/expose\/(\d+)/)
        const exposeId = exposeMatch ? exposeMatch[1] : ''

        const userMessage = `Analysiere diese Kaufimmobilie vollständig.

URL: ${cleanUrl}
${exposeId ? `Exposé-Nr: ${exposeId}` : ''}

SCHRITT 1: Rufe die URL auf und lies ALLE Exposé-Details (Kaufpreis, Fläche, Zimmer, Baujahr, Adresse, Energieausweis etc.)
SCHRITT 2: Suche nach Marktdaten für die Region (Bodenrichtwert, Vergleichspreise, Mietpreisspiegel)
SCHRITT 3: Erstelle die vollständige Analyse mit ALLEN Berechnungen

Optionen:
- Makleranschreiben: ${opts.makleranschreiben ? 'ja' : 'nein'}
- Verhandlungstipps: ${opts.verhandlungstipps ? 'ja' : 'nein'}
- Risikohinweise: ${opts.risiken ? 'ja' : 'nein'}
${isPremium ? '- Premium-Report: ja (inkl. Wertermittlung, Standort-Dossier, Vermögensvergleich, Checkliste)' : ''}

WICHTIG: Jedes Feld muss einen konkreten Wert haben. Keine leeren Felder, kein "n/a", kein "nicht verfügbar". Wenn ein Wert fehlt, schätze realistisch. Antworte ausschließlich mit JSON.`

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
                max_uses: 5,
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
        console.log(`Claude initial response: stop_reason=${data.stop_reason}, content_blocks=${data.content?.length}`)

        // Handle multi-turn: if Claude stopped to use a tool, we may need to continue
        let finalData = data
        let turns = 0
        const messages: Array<{ role: string; content: unknown }> = [
          { role: 'user', content: userMessage },
        ]

        while (finalData.stop_reason === 'tool_use' && turns < 5) {
          turns++
          console.log(`Web search turn ${turns}...`)
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
                  max_uses: 5,
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
        console.error(`Analysis attempt failed for ${analysis.url}:`, err)

        // Auto-retry up to 2 more times
        let retrySuccess = false
        for (let retry = 1; retry <= 2; retry++) {
          console.log(`Retry ${retry}/2 for ${analysis.url}...`)
          try {
            // Simplified retry without web search (faster, more reliable)
            const retryMessage = `Analysiere diese Immobilie. Die URL konnte möglicherweise nicht direkt abgerufen werden.

URL: ${analysis.url.split('#')[0].split('?')[0]}
${analysis.url.match(/expose\/(\d+)/) ? `Exposé-Nr: ${analysis.url.match(/expose\/(\d+)/)![1]}` : ''}

Suche im Web nach dieser Immobilie (Exposé-Nummer auf ImmoScout24) und erstelle die vollständige Analyse.
Falls du keine Details findest, suche nach vergleichbaren Immobilien in der Region und erstelle eine realistische Schätzanalyse.
JEDES Feld muss ausgefüllt sein. KEIN "n/a" oder "nicht verfügbar". Antworte ausschließlich mit JSON.`

            const retryResponse = await fetch('https://api.anthropic.com/v1/messages', {
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
                tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
                messages: [{ role: 'user', content: retryMessage }],
              }),
            })

            if (!retryResponse.ok) throw new Error(`Retry API error: ${retryResponse.status}`)

            let retryData = await retryResponse.json()

            // Handle one round of tool use
            if (retryData.stop_reason === 'tool_use') {
              const retryMessages: Array<{ role: string; content: unknown }> = [
                { role: 'user', content: retryMessage },
                { role: 'assistant', content: retryData.content },
              ]
              const toolBlocks = retryData.content.filter((b: { type: string }) => b.type === 'tool_use')
              retryMessages.push({
                role: 'user',
                content: toolBlocks.map((t: { id: string }) => ({
                  type: 'tool_result', tool_use_id: t.id,
                  content: 'Ergebnis verarbeitet. Antworte jetzt mit dem vollständigen JSON.',
                })),
              })

              const cont = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01' },
                body: JSON.stringify({
                  model: 'claude-sonnet-4-20250514', max_tokens: maxTokens, system: systemPrompt,
                  tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }],
                  messages: retryMessages,
                }),
              })
              if (cont.ok) retryData = await cont.json()
            }

            const retryResult = extractClaudeJson(retryData)
            await supabase.from('analyses').update({ result: retryResult, status: 'completed' }).eq('id', analysis.id)
            retrySuccess = true
            console.log(`Retry ${retry} succeeded for ${analysis.url}`)
            break
          } catch (retryErr) {
            console.error(`Retry ${retry} failed:`, retryErr)
          }
        }

        if (!retrySuccess) {
          console.error(`All retries failed for ${analysis.url}`)
          await supabase.from('analyses').update({ status: 'failed' }).eq('id', analysis.id)
        }
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
