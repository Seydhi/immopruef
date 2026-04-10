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
2. Suche DANACH nach: "[Stadtteil] Bodenrichtwert", "[Stadt] Immobilienpreise pro qm", "[Stadt] Mietpreisspiegel", "[Stadt] Grundsteuer Hebesatz".
3. GENAUIGKEIT IST OBERSTE PFLICHT. Alle Zahlen müssen korrekt sein oder aus verifizierbaren Quellen stammen.
4. Daten aus dem Exposé: EXAKT übernehmen (Kaufpreis, Fläche, Zimmer, Baujahr, Adresse etc.).
5. Daten aus öffentlichen Quellen: Bodenrichtwerte, Grunderwerbsteuer, Mietpreisspiegel — per Web-Suche recherchieren.
6. Berechnungen: Kaufnebenkosten, Finanzierungsszenarien, monatliche Raten — IMMER korrekt durchrechnen basierend auf den echten Zahlen aus dem Exposé.
7. FEHLENDE DATEN — WICHTIGSTE REGEL: Wenn ein Wert nicht im Exposé steht, MUSS ein regionaler Durchschnitt recherchiert und eingesetzt werden. IMMER mit dem Hinweis: "(Durchschnitt der Region — im Exposé nicht angegeben)" am Ende des Wertes. Beispiele:
   - Energieausweis fehlt → "ca. 180 kWh/m²a, Klasse F (Durchschnitt der Region — im Exposé nicht angegeben)"
   - Heizkosten fehlen → "ca. 1.800 €/Jahr (Durchschnitt der Region — im Exposé nicht angegeben)"
   - Grundsteuer fehlt → "ca. 85 €/Monat (Durchschnitt der Region — im Exposé nicht angegeben)"
   - Hausgeld fehlt → "ca. 280 €/Monat (Durchschnitt der Region — im Exposé nicht angegeben)"
   - Baujahr fehlt → Aus Fotos/Beschreibung schätzen, z.B. "ca. 1965 (Durchschnitt der Region — im Exposé nicht angegeben)"
   SCHREIBE NIEMALS nur "Im Exposé nicht angegeben". Es MUSS IMMER ein Durchschnittswert recherchiert werden.
   NUR wenn absolut kein Durchschnitt findbar ist: "Beim Verkäufer anfordern (Durchschnitt nicht ermittelbar)"
8. Scores müssen IMMER Zahlen zwischen 1 und 10 sein. NIEMALS 0. Auch bei fehlenden Daten mindestens 3 vergeben.
9. Antworte AUSSCHLIESSLICH mit validem JSON — kein Markdown, kein Text vor oder nach dem JSON.
10. ERFINDE NIEMALS konkrete Objektdaten. Regionale Durchschnittswerte als solche kennzeichnen ist erlaubt und erwünscht.

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
  "verhandlungstipps": ["string — MINDESTENS 6 konkrete, auf das Objekt zugeschnittene Tipps. Jeder Tipp muss einen konkreten Geldbetrag oder Prozentsatz enthalten, z.B. 'Sanierungsstau Heizung (Baujahr 1995, Lebensdauer überschritten): Argumentieren Sie mit 15.000–25.000 € Erneuerungskosten für eine Preisreduktion von 5–8%'. Kategorien: Sanierungsstau, Energetische Mängel, Marktvergleich (falls überteuert), Verhandlungszeitpunkt, Nebenkosten als Druckmittel, fehlende Unterlagen"],
  "makleranschreiben": "string — Professionelles, persönliches Anschreiben an den Makler/Verkäufer. MUSS enthalten: (1) Höfliche Einleitung mit Bezug auf das konkrete Objekt (Adresse, Exposé-Nr), (2) Kurze Vorstellung als seriöser Kaufinteressent, (3) Mindestens 8 konkrete Fragen zum Objekt die im Exposé NICHT beantwortet werden (z.B. Grund des Verkaufs, Alter der Heizung, letzte Renovierungen, Baulasten, Erschließungsbeiträge, Energieausweis-Details, Hausgeldentwicklung, anstehende Sanierungen der WEG, Rücklagenhöhe, Nachbarschaft), (4) Frage nach Besichtigungstermin, (5) Professioneller Abschluss. Ton: seriös aber nicht unterwürfig. Länge: ca. 200-300 Wörter. Mit Absätzen formatiert (\\n\\n für Absätze).",
  "zusammenfassung": "string (3-4 Sätze Fazit mit Gesamtinvestition und Empfehlung)",

  "marktdaten": [{ "kennzahl": "string", "wert": "string", "einschaetzung": "gut|mittel|schlecht" }]
}

PFLICHT-HINWEISE:
- objektdaten: Adresse, Typ, Kaufpreis, Wohnfläche, Grundstück, Zimmer, Baujahr, Zustand, Heizung, Energieeffizienz, Stellplatz, Keller, Hausgeld, Provision. Werte aus dem Exposé. Wenn ein Wert fehlt: regionalen Durchschnitt recherchieren und mit "(Durchschnitt der Region — im Exposé nicht angegeben)" kennzeichnen.
- standortanalyse.kategorien: ÖPNV, Schulen/Kitas, Einkauf, Ärzte, Freizeit, Lärm, Sicherheit, Entwicklungsperspektive. JEDE Kategorie braucht Score 1-10 basierend auf Web-Recherche.
- finanzierung.szenarien: IMMER 3 Szenarien berechnen (Konservativ 30% EK, Standard 20% EK, Minimal 10% EK). Recherchiere aktuelle Bauzinsen per Web-Suche. IMMER konkrete Euro-Beträge korrekt durchrechnen.
- stresstest: IMMER 3 Szenarien (Zinserhöhung auf 5,5%, Sonderumlage 15.000€, Einkommensverlust 30%). Korrekt berechnen.
- kaufenVsMieten: IMMER berechnen. Vergleichsmiete per Web-Suche aus dem Mietpreisspiegel der Stadt recherchieren.
- modernisierung.items: IMMER mindestens 6 Bauteile (Heizung, Fenster, Elektrik, Bad, Dach, Fassade). Alter NUR ableiten wenn Baujahr im Exposé steht.
- gesamtkosten: Grunderwerbsteuer KORREKT je Bundesland: Bayern 3,5%, Sachsen 3,5%, BaWü 5,0%, NRW 6,5%, Berlin 6,0%, Hamburg 5,5%, Hessen 6,0%, Niedersachsen 5,0%, Brandenburg 6,5%, SH 6,5%, Bremen 5,0%, RLP 5,0%, Saarland 6,5%, Sachsen-Anhalt 5,0%, MV 6,0%, Thüringen 5,0%.
- laufendeKosten: Hausgeld (aus Exposé), Grundsteuer (recherchieren), Gebäudeversicherung (recherchieren), Rücklagen, Heizkosten (aus Energieausweis berechnen), Strom, Wasser/Abwasser.
- energieanalyse: Daten aus Exposé bevorzugen. Wenn Energieausweis fehlt: Recherchiere typischen Verbrauch für Baujahr+Gebäudetyp und kennzeichne mit "(Durchschnitt der Region — im Exposé nicht angegeben)". Heizkosten IMMER berechnen: Fläche × kWh/m² × Energiepreis.
- scores: ALLE Scores müssen Zahlen zwischen 1 und 10 sein. KEIN Score darf 0 sein. Minimum ist 1. Bei fehlenden Daten mindestens 3-5 vergeben basierend auf Regionsdurchschnitt. gesamtbewertung ist der gewichtete Durchschnitt aller Einzelscores.
- verhandlungstipps: MINDESTENS 6 Tipps. Jeder Tipp MUSS sich auf konkrete Daten aus der Analyse beziehen (z.B. "Heizung aus 1995 → 25.000€ Erneuerung → 7% Preisnachlass fordern"). Kategorien: Sanierungsstau, Energieklasse, Marktvergleich, fehlende Dokumente, Zeitdruck/Verhandlungsposition, versteckte Kosten.
- makleranschreiben: MUSS persönlich und objektspezifisch sein. Adresse und Exposé-Nr nennen. Mindestens 8 gezielte Fragen stellen die im Exposé fehlen. KEINE generischen Floskeln. Der Käufer soll damit direkt den Makler anschreiben können.
- Optionale Felder (nur wenn vom Nutzer gewünscht): verhandlungstipps, makleranschreiben. Wenn nicht gewünscht: leere Arrays/Strings.
- WICHTIG: Nutze Web-Suche um das Exposé abzurufen UND Marktdaten zu recherchieren. Suche nach der Exposé-Nummer auf ImmoScout24.
- ABSOLUTE REGEL: Erfinde KEINE konkreten Objektdaten. Regionale Durchschnittswerte MÜSSEN recherchiert und mit "(Durchschnitt der Region — im Exposé nicht angegeben)" gekennzeichnet werden. JEDES Feld muss einen Wert haben. NIEMALS nur "Im Exposé nicht angegeben" schreiben — IMMER einen recherchierten Durchschnitt liefern.`

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
// AI Provider Switch
// ═══════════════════════════════════════════════════════════════

const TEST_MODE = Deno.env.get('TEST_MODE') === 'true'

interface AIResponse {
  result: unknown
}

async function callOpenAI(systemPrompt: string, userMessage: string, maxTokens: number): Promise<AIResponse> {
  const apiKey = Deno.env.get('OPENAI_API_KEY')!
  console.log('Using OpenAI GPT-4o with web search (test mode)')

  // Web Search + JSON mode can't be combined — use web search, extract JSON manually
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      instructions: systemPrompt + '\n\nAntworte AUSSCHLIESSLICH mit validem JSON. Kein Text vor oder nach dem JSON.',
      input: userMessage,
      tools: [{ type: 'web_search_preview' }],
      max_output_tokens: maxTokens,
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    console.error(`OpenAI API error: ${errBody}`)
    throw new Error(`OpenAI API error: ${response.status} — ${errBody}`)
  }

  const data = await response.json()

  // Extract text from output items
  let text = ''
  for (const item of (data.output || [])) {
    if (item.type === 'message') {
      for (const content of (item.content || [])) {
        if (content.type === 'output_text') {
          text = content.text
        }
      }
    }
  }

  if (!text) {
    console.error('OpenAI response:', JSON.stringify(data).slice(0, 1000))
    throw new Error('No text output from OpenAI')
  }

  console.log(`OpenAI response: ${text.length} chars`)
  return { result: parseJson(text) }
}

async function callClaude(
  systemPrompt: string,
  userMessage: string,
  maxTokens: number,
  anthropicKey: string
): Promise<AIResponse> {
  console.log('Using Claude Sonnet 4 (production mode)')

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
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`Anthropic API error: ${response.status} — ${errBody}`)
  }

  const data = await response.json()
  console.log(`Claude initial response: stop_reason=${data.stop_reason}, content_blocks=${data.content?.length}`)

  // Handle multi-turn web search
  let finalData = data
  let turns = 0
  const messages: Array<{ role: string; content: unknown }> = [
    { role: 'user', content: userMessage },
  ]

  while (finalData.stop_reason === 'tool_use' && turns < 5) {
    turns++
    console.log(`Web search turn ${turns}...`)
    messages.push({ role: 'assistant', content: finalData.content })

    const toolUseBlocks = finalData.content.filter((b: { type: string }) => b.type === 'tool_use')
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
        tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: 5 }],
        messages,
      }),
    })

    if (!continueResponse.ok) {
      const errBody = await continueResponse.text()
      throw new Error(`Anthropic API continue error: ${continueResponse.status} — ${errBody}`)
    }

    finalData = await continueResponse.json()
  }

  return { result: extractClaudeJson(finalData) }
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

/**
 * Extract JSON from Claude's response, handling web_search tool use blocks.
 */
function extractClaudeJson(data: { content: Array<{ type: string; text?: string }> }): unknown {
  const textBlocks = data.content.filter(
    (b: { type: string }) => b.type === 'text'
  )

  if (textBlocks.length === 0) {
    throw new Error('No text response from Claude')
  }
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

    // If still pending payment
    if (order.status === 'pending') {
      return jsonResponse({ error: 'pending', message: 'Zahlung wird noch verarbeitet' }, 402)
    }

    // Set order to processing if it's paid (first time)
    if (order.status === 'paid') {
      await supabase
        .from('orders')
        .update({ status: 'processing' })
        .eq('id', order.id)
    }

    // For completed orders: check if there are still pending analyses to process
    // (can happen if order was marked completed prematurely)

    // Fetch all analyses for this order
    const { data: allAnalyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('order_id', order.id)

    if (!allAnalyses?.length) {
      return jsonResponse({ error: 'No analyses found' }, 500)
    }

    // Reset stuck "processing" analyses (from previous timed-out calls) back to pending
    for (const a of allAnalyses) {
      if (a.status === 'processing') {
        console.log(`Resetting stuck analysis ${a.id} from processing → pending`)
        await supabase.from('analyses').update({ status: 'pending' }).eq('id', a.id)
        a.status = 'pending'
      }
    }

    // Check if all are already done
    const allDone = allAnalyses.every((a: { status: string }) => a.status === 'completed' || a.status === 'failed')
    if (allDone) {
      await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id)
      return jsonResponse({ order_status: 'completed', analyses: allAnalyses })
    }

    // Find the NEXT pending analysis (process ONE at a time to avoid timeout)
    const nextPending = allAnalyses.find((a: { status: string }) => a.status === 'pending')
    if (!nextPending) {
      // Some still processing from a previous call — return current state
      return jsonResponse({ order_status: 'processing', analyses: allAnalyses })
    }

    // Determine if premium
    const isPremium = order.package === 'premium'
    const systemPrompt = isPremium
      ? SYSTEM_PROMPT_STANDARD + SYSTEM_PROMPT_PREMIUM_ADDITION
      : SYSTEM_PROMPT_STANDARD
    const maxTokens = isPremium ? 24000 : 16000

    // Process ONE analysis per function call (avoids 150s timeout)
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!
    const appUrl = Deno.env.get('APP_URL') || 'https://immopruef.de'

    const analysis = nextPending
    {
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

WICHTIG: Alle Daten müssen korrekt sein. Exposé-Daten exakt übernehmen. Marktdaten recherchieren. Berechnungen korrekt durchführen. Wenn ein Wert nicht findbar ist: "Im Exposé nicht angegeben — beim Verkäufer anfordern". NIEMALS Zahlen erfinden. Antworte ausschließlich mit JSON.`

        // Call AI provider based on TEST_MODE
        const { result } = TEST_MODE
          ? await callOpenAI(systemPrompt, userMessage, maxTokens)
          : await callClaude(systemPrompt, userMessage, maxTokens, anthropicKey)

        await supabase
          .from('analyses')
          .update({ result, status: 'completed' })
          .eq('id', analysis.id)
      } catch (err) {
        console.error(`Analysis attempt failed for ${analysis.url}:`, err)

        // Auto-retry up to 2 more times with simplified prompt
        let retrySuccess = false
        for (let retry = 1; retry <= 2; retry++) {
          console.log(`Retry ${retry}/2 for ${analysis.url}...`)
          try {
            const retryMessage = `Analysiere diese Immobilie. Exposé-URL: ${analysis.url.split('#')[0].split('?')[0]}
${analysis.url.match(/expose\/(\d+)/) ? `Exposé-Nr: ${analysis.url.match(/expose\/(\d+)/)![1]}` : ''}

Suche im Web nach dieser Immobilie und erstelle die Analyse. NUR verifizierte Daten verwenden. Antworte mit JSON.`

            const { result: retryResult } = TEST_MODE
              ? await callOpenAI(systemPrompt, retryMessage, maxTokens)
              : await callClaude(systemPrompt, retryMessage, maxTokens, anthropicKey)

            await supabase.from('analyses').update({ result: retryResult, status: 'completed' }).eq('id', analysis.id)
            retrySuccess = true
            console.log(`Retry ${retry} succeeded`)
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

    // Re-fetch all analyses to check if ALL are now done
    const { data: updatedAnalyses } = await supabase
      .from('analyses')
      .select('*')
      .eq('order_id', order.id)

    const analyses = updatedAnalyses || allAnalyses
    const nowAllDone = analyses.every((a: { status: string }) => a.status === 'completed' || a.status === 'failed')

    if (nowAllDone) {
      await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id)
    } else {
      // Still more analyses pending — frontend will poll again and trigger next one
      return jsonResponse({ order_status: 'processing', analyses })
    }

    // Send email only when ALL analyses are done
    console.log('All analyses done — sending email...')

    // Get email from order or Stripe
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

    console.log(`Email recipient: ${email || 'NONE'}`)

    // Send email via Resend
    if (email) {
      try {
        const { data: completedAnalyses } = await supabase
          .from('analyses')
          .select('*')
          .eq('order_id', order.id)

        const completed = (completedAnalyses || []).filter((a: { status: string }) => a.status === 'completed')
        const analysisCount = completed.length

        const linkRows = completed
          .map((a: { token: string; url: string }, i: number) => {
            const exposeNr = a.url.match(/expose\/(\d+)/)?.[1] || ''
            return `
              <tr>
                <td style="padding:12px 16px;border-bottom:1px solid #f0f0f0;">
                  <div style="font-size:13px;color:#666;margin-bottom:4px;">Immobilie ${i + 1}${exposeNr ? ` · Exposé ${exposeNr}` : ''}</div>
                  <a href="${appUrl}?result=${a.token}" style="color:#1a6b3c;font-weight:600;font-size:15px;text-decoration:none;">
                    Analyse ansehen →
                  </a>
                </td>
              </tr>`
          }).join('')

        const subject = isPremium
          ? 'Ihr Kaufentscheidungs-Report ist fertig'
          : analysisCount === 1
            ? 'Ihre Immobilienanalyse ist fertig'
            : `Ihre ${analysisCount} Immobilienanalysen sind fertig`

        const greeting = isPremium ? 'Ihr umfassender Kaufentscheidungs-Report' : analysisCount === 1 ? 'Ihre Immobilienanalyse' : `Ihre ${analysisCount} Immobilienanalysen`

        const emailFrom = Deno.env.get('EMAIL_FROM') || 'ImmoPrüf <info@immopruef.de>'
        console.log(`Sending email from=${emailFrom} to=${email} subject="${subject}"`)

        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          },
          body: JSON.stringify({
            from: emailFrom,
            to: email,
            subject,
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
      <p style="margin:0 0 6px;font-size:18px;font-weight:600;color:#1a1a1a;">
        ${greeting} ${analysisCount === 1 ? 'ist' : 'sind'} fertig ✓
      </p>
      <p style="margin:0 0 24px;font-size:14px;color:#666;line-height:1.5;">
        Klicken Sie auf den Link um Ihre vollständige Analyse aufzurufen. Der Link ist 180 Tage gültig.
      </p>

      <!-- Analysis Links -->
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f8f5;border-radius:8px;overflow:hidden;">
        ${linkRows}
      </table>

      ${isPremium ? `
      <div style="margin-top:20px;padding:14px 16px;background:#fef9ee;border:1px solid #e8d9a8;border-radius:8px;">
        <div style="font-size:13px;color:#8a6d1b;font-weight:600;margin-bottom:4px;">★ Premium Kaufentscheidungs-Report</div>
        <div style="font-size:12px;color:#a68b2e;line-height:1.4;">Inkl. Wertermittlung, Standort-Dossier, 30-Jahres-Vermögensvergleich und Vor-Kauf-Checkliste.</div>
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div style="background:#f9f8f5;border-radius:0 0 12px 12px;padding:20px 24px;border:1px solid #e8e4dc;border-top:none;">
      <p style="margin:0 0 8px;font-size:11px;color:#999;line-height:1.4;">
        KI-Analyse auf Basis öffentlich verfügbarer Daten. Keine Gewähr für Vollständigkeit oder Richtigkeit. Ersetzt keine professionelle Beratung.
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

        const emailResult = await emailRes.json()
        console.log(`Resend response: ${emailRes.status}`, JSON.stringify(emailResult))
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
