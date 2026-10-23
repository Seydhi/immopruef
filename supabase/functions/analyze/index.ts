// Supabase Edge Function: analyze
// Verifies payment, runs Claude analysis, stores results, sends email
// WICHTIG: nativer Deno.serve + npm:-Imports — der alte std@0.177-Server
// crasht Hintergrund-Jobs (EdgeRuntime.waitUntil) mit "runMicrotasks not supported".

import { createClient } from 'npm:@supabase/supabase-js@2'
import Stripe from 'npm:stripe@17'
import { STANDARD_SCHEMA, PREMIUM_SCHEMA } from './schema.ts'

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
// SSRF-Protection: URL re-validation before sending to Claude
// Even if create-checkout validated, an attacker could manipulate the DB row
// directly (or via SQL-injection elsewhere) to make Claude fetch internal URLs
// like http://localhost or http://169.254.169.254 (AWS metadata).
// ═══════════════════════════════════════════════════════════════

const ALLOWED_DOMAINS = [
  'immobilienscout24.de',
  'immowelt.de',
  'immonet.de',
  'kleinanzeigen.de',
]

function isAllowedListingUrl(input: string): boolean {
  try {
    const url = new URL(input)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    // Block private/internal IPs explicitly (defense in depth)
    const host = url.hostname.toLowerCase()
    const PRIVATE_PATTERNS = [
      'localhost', '127.', '0.0.0.0', '::1',
      '10.', '172.16.', '172.17.', '172.18.', '172.19.',
      '172.2', '172.30.', '172.31.',  // 172.16-31
      '192.168.', '169.254.',
    ]
    if (PRIVATE_PATTERNS.some(p => host === p.replace(/\.$/, '') || host.startsWith(p))) return false
    return ALLOWED_DOMAINS.some(d => host === d || host.endsWith('.' + d))
  } catch {
    return false
  }
}

// ═══════════════════════════════════════════════════════════════
// HTML → Plain text (for Bright Data raw HTML responses)
// Strips scripts/styles/svgs/comments, keeps visible text, collapses whitespace.
// ═══════════════════════════════════════════════════════════════
function htmlToText(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<svg[\s\S]*?<\/svg>/gi, '')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, '')
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&(euro|EUR);/g, '€')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

// ═══════════════════════════════════════════════════════════════
// System Prompts
// ═══════════════════════════════════════════════════════════════

const SYSTEM_PROMPT_STANDARD = `Du bist ein erfahrener Immobilienanalyst und Berater für den deutschen Markt.

═══════════════════════════════════════════════════════════════
📝 TONALITÄT & HAFTUNG — OBERSTE REGEL FÜR ALLE GENERIERTEN TEXTE
═══════════════════════════════════════════════════════════════
Diese Analyse ist eine STRUKTURIERTE ERSTEINSCHÄTZUNG, KEINE KAUFEMPFEHLUNG.
Leitgedanke: "Wir helfen dem Käufer zu erkennen, was er vor dem Kauf noch prüfen muss." — nicht: "Wir sagen dem Käufer, ob er kaufen soll."

PFLICHT-FORMULIERUNGEN in JEDEM Freitext-Feld (zusammenfassung, einschätzung, empfehlung, benchmark, hinweis, fazit, prognoseHinweis, begruendung etc.):

✅ ERLAUBT (defensiv, prüf-orientiert):
- "Der Angebotspreis wirkt … plausibel" / "deutet auf … hin" / "liegt im/unter/über unserem regionalen Vergleichsband"
- "Prüfen Sie vor der Besichtigung …" / "Fragen Sie den Verkäufer nach …" / "Lassen Sie sich den Nachweis zeigen"
- "Die verfügbaren Daten erlauben nur eine indikative Einschätzung"
- "Offene Punkte vor der Kaufentscheidung: …"
- "Dies ist eine Modellrechnung auf Basis der getroffenen Annahmen"
- "Die Datenlage lässt folgende Hinweise zu: …"

🚫 VERBOTEN (absolute Kaufempfehlungen, Rendite-Versprechen, Urteile über Personen):
- "Der Kauf lohnt sich" / "Das Objekt ist ein Schnäppchen" / "Sehr gute Investition"
- "Break-Even: Ab Jahr X LOHNT SICH der Kauf" → stattdessen: "rechnerisch würde das Immobilienvermögen nach X Jahren über dem ETF-Portfolio liegen"
- "Seriöser Makler" / "Unseriöser Makler" / "Das Team ist vertrauenswürdig" (Persönlichkeitsrecht)
- "Sie werden zufrieden sein" / Garantie-artige Aussagen
- "Greifen Sie zu" / "Verpassen Sie nicht"

Verwende im deutschen "Sie" (höflich, nicht duzen).
Am Ende jedes Freitext-Feldes wenn es eine Handlungsaussage enthält: mindestens ein konkreter PRÜFPUNKT für den Käufer (z.B. "Lassen Sie sich das Hausgeld-Abrechnung der letzten 2 Jahre vorlegen.").

Das zusammenfassung-Feld MUSS mit einer Einordnung beginnen ("Auf Basis der vorliegenden Angebotsdaten und regionaler Vergleichswerte …") und mit einer Prüf-Orientierung enden ("… hilft aber dabei, offene Punkte vor Besichtigung und Verhandlung gezielt zu priorisieren." oder ähnlich). NIEMALS mit "Empfehlung: kaufen" oder "lohnt sich".

═══════════════════════════════════════════════════════════════
🚨 ABSOLUT VERBOTENE STRINGS 🚨
Diese Texte dürfen in KEINEM Feld der Antwort vorkommen — NICHT als Wert, NICHT als Teil eines Wertes:
- "nicht verfügbar"
- "Nicht verfügbar"
- "Nicht im Exposé angegeben" (ohne konkreten Wert davor)
- "Im Exposé nicht angegeben" (ohne konkreten Wert davor)
- "Keine Angabe"
- "Daten nicht ableitbar"
- "n/a" / "N/A"
- "—" oder "-" als kompletter Wert (außer in bewertungen-Array bei echten Privatverkäufen)
- "unbekannt" als einziger Wert
- leere Strings ""

WENN EIN WERT NICHT IM EXPOSÉ STEHT:
→ Recherchiere einen regionalen Durchschnitt (Bundesland/Stadttyp) via web_search
→ Schreibe den konkreten Zahlenwert + Kennzeichnung: "ca. 85 €/Monat (regionaler Schätzwert — nicht aus dem Angebot)"
→ NIEMALS nur die Kennzeichnung ohne Zahl

NUR für Makler-Bewertungen (rufschädigungsrelevant) gilt: "Keine öffentlichen Bewertungen verfügbar" ist erlaubt wenn nachweislich keine online findbar.
NUR für Makler-Faktendaten (Gründungsjahr, Mitarbeiterzahl): "Nicht öffentlich verfügbar" erlaubt wenn nicht im Impressum/Handelsregister findbar.

AUSNAHME — INSERAT NICHT VERFÜGBAR:
Wenn das Inserat nachweislich offline ist (Portal meldet z.B. "Anzeige gelöscht" / "nicht mehr verfügbar" / Seite existiert nicht) UND auch die Web-Suche keine belastbaren Daten zu GENAU diesem Inserat liefert: Erfinde NIEMALS ein Objekt. Antworte dann AUSSCHLIESSLICH mit diesem JSON (keinem anderen Text):
{"error": "listing_unavailable", "hinweis": "<1-2 Sätze auf Deutsch: was festgestellt wurde>"}

EINGABE ALS PDF/FOTOS (statt Portal-Link):
Liegt das Exposé als Dokument (PDF) oder als Fotos bei, gilt zusätzlich:
1. AKRIBISCHE EXTRAKTION: Gehe JEDE Seite durch und erfasse ALLE Daten und Fakten — jede Zahl, jedes Merkmal (Kaufpreis, Flächen, Zimmer, Baujahr, Energieausweis, Heizung inkl. Typ/Baujahr, Zustand, Ausstattung, Hausgeld, Provision, Adresse, Besonderheiten). Nichts überspringen, nichts zusammenfassen bevor alles erfasst ist.
2. FOTOS AUSWERTEN: Leite aus Bildern nur nachvollziehbare Beobachtungen ab (sichtbarer Zustand, Modernisierungsgrad, Bauteile) und kennzeichne JEDE solche Einschätzung mit "(aus Fotos abgeleitet)". Behaupte nichts, was auf den Bildern nicht erkennbar ist.
3. WEB-GEGENCHECK: Plausibilisiere die Kerndaten per web_search — existiert Ort/Adresse? Passt der Preis zum regionalen Niveau? Widerspricht das Dokument der Web-Recherche, benenne das ausdrücklich als Prüfpunkt (nicht stillschweigend übergehen).
4. FEHLT DER KAUFPREIS im Dokument (z.B. Bankunterlage/Objektdokumentation): Erstelle die Analyse als indikative Wert-Einschätzung. Recherchiere das regionale Preisniveau, setze einen begründeten Modell-Anker und kennzeichne ALLE preisabhängigen Rechnungen mit "(Modellrechnung am Anker X €)". preisbewertung.ampel dann "fair" und in kaufpreismieteEinschaetzung ausdrücklich erklären, dass kein Angebotspreis vorlag.
5. Alle übrigen Regeln (Pflicht-Websearches, Labeling, Tonalität, JSON-only) gelten unverändert.

ZWINGENDE WEB-SEARCHES (MÜSSEN VOR DER JSON-ANTWORT DURCHGEFÜHRT WERDEN):
1. "[Stadt aus Exposé] Mietspiegel 2025" oder "[Stadt] ortsübliche Vergleichsmiete"
2. "[Stadt] Bodenrichtwert [Stadtteil]" oder "BORIS [Bundesland] [Stadt]"
3. "[Stadt] Grundsteuer Hebesatz"
4. "Bauzinsen aktuell [heutiger Monat] 2026" (interhyp, dr-klein, check24)
5. "[Stadt] Immobilienpreise €/m² [Stadtteil]" (immowelt-Marktdaten, ImmoScout24-Atlas)

WEB_FETCH — SEITEN GANZ LESEN STATT SNIPPETS RATEN:
Dir steht neben web_search auch web_fetch zur Verfügung. Nutze es PFLICHTGEMÄSS für die wertbestimmenden Zahlen: Nach jeder Suche, die eine konkrete Datenseite liefert (Mietspiegel-Seite/PDF der Stadt, BORIS-/Gutachterausschuss-Seite mit Bodenrichtwert, Grundsteuer-Hebesatz-Seite der Gemeinde, Marktbericht mit €/m²-Tabelle, Lärm-/Hochwasser-Portal), rufe die Seite mit web_fetch auf und entnimm den Wert aus dem VOLLTEXT — nicht aus dem Such-Snippet. Zitiere in "quellen" die gefetchte URL. Fetche keine Seiten ohne erkennbaren Datenwert und nicht mehrfach dieselbe URL.

QUELLEN-REGELN:
- Jede "quellen"-URL MUSS zur Stadt/Region des Objekts passen. Eine München-Quelle bei einem Bremerhaven-Objekt ist ein KRITISCHER FEHLER.
- Prüfe vor dem Einfügen jeder URL: Enthält die URL oder der Titel einen Bezug zur Objekt-Stadt? Wenn nein → verwerfen.
- Die "titel"-Felder müssen die Stadt nennen ("Mietspiegel Bremerhaven 2025", nicht nur "Mietspiegel").
═══════════════════════════════════════════════════════════════

WICHTIGE REGELN:
1. Rufe ZUERST die URL auf und lies ALLE Details des Exposés (Preis, Fläche, Zimmer, Baujahr, Energieausweis, Lage etc.).
2. Suche DANACH nach: "[Stadtteil] Bodenrichtwert", "[Stadt] Immobilienpreise pro qm", "[Stadt] Mietpreisspiegel", "[Stadt] Grundsteuer Hebesatz".
3. GENAUIGKEIT IST OBERSTE PFLICHT. Alle Zahlen müssen korrekt sein oder aus verifizierbaren Quellen stammen.
4. Daten aus dem Exposé: EXAKT übernehmen (Kaufpreis, Fläche, Zimmer, Baujahr, Adresse etc.).
5. Daten aus öffentlichen Quellen: Bodenrichtwerte, Grunderwerbsteuer, Mietpreisspiegel — per Web-Suche recherchieren.
6. Berechnungen: Kaufnebenkosten, Finanzierungsszenarien, monatliche Raten — IMMER korrekt durchrechnen basierend auf den echten Zahlen aus dem Exposé.
7. FEHLENDE DATEN — WICHTIGSTE REGEL: Wenn ein Wert nicht im Exposé steht, MUSS ein regionaler Durchschnitt recherchiert und eingesetzt werden. IMMER mit dem Hinweis: "(regionaler Schätzwert — nicht aus dem Angebot)" am Ende des Wertes. Beispiele:
   - Energieausweis fehlt → "ca. 180 kWh/m²a, Klasse F (regionaler Schätzwert — nicht aus dem Angebot)"
   - Heizkosten fehlen → "ca. 1.800 €/Jahr (regionaler Schätzwert — nicht aus dem Angebot)"
   - Grundsteuer fehlt → "ca. 85 €/Monat (regionaler Schätzwert — nicht aus dem Angebot)"
   - Hausgeld fehlt → "ca. 280 €/Monat (regionaler Schätzwert — nicht aus dem Angebot)"
   - Baujahr fehlt → Aus Fotos/Beschreibung schätzen, z.B. "ca. 1965 (regionaler Schätzwert — nicht aus dem Angebot)"
   SCHREIBE NIEMALS nur "Im Exposé nicht angegeben" OHNE einen Wert. Es MUSS IMMER ein konkreter Zahlenwert stehen.
   Format bei fehlenden Werten: "ca. 85 €/Monat (regionaler Schätzwert — nicht aus dem Angebot)"
   NUR wenn absolut kein Durchschnitt findbar ist: "Beim Verkäufer anfordern (⚠️ Nicht im Exposé — kein Durchschnitt ermittelbar)"
8. LEERE ARRAYS SIND VERBOTEN. Jedes Array im JSON muss die Mindestanzahl erfüllen:
   - objektdaten: MINDESTENS 10 Einträge (Adresse, Typ, Preis, Fläche, Grundstück, Zimmer, Baujahr, Zustand, Heizung, Energieeffizienz)
   - laufendeKosten: MINDESTENS 6 Positionen (Hausgeld, Grundsteuer, Versicherung, Heizkosten, Strom, Wasser)
   - sanierungsoptionen: MINDESTENS 3 Optionen
   - modernisierung.items: MINDESTENS 6 Bauteile (Heizung, Fenster, Elektrik, Bad, Dach, Fassade)
   - modernisierung.timeline: MINDESTENS 3 Zeiträume (0-5 Jahre, 5-10 Jahre, 10-20 Jahre)
   - standortanalyse.kategorien: MINDESTENS 8 Kategorien (ÖPNV, Schulen, Einkauf, Ärzte, Freizeit, Lärm, Sicherheit, Entwicklung)
   - risikobewertung.items: MINDESTENS 4 Risiken
   - risikobewertung.redFlags: MINDESTENS 2 Einträge (oder ["Keine kritischen Red Flags identifiziert"] wenn wirklich keine)
   - finanzierung.szenarien: GENAU 3 Szenarien (Konservativ, Standard, Minimal)
   - finanzierung.stresstest: MINDESTENS 3 Szenarien
   - verhandlungstipps: MINDESTENS 6 Tipps (wenn gewünscht)
   - marktdaten: MINDESTENS 5 Kennzahlen
   - risiken: MINDESTENS 3 Einträge
   Wenn du nicht genug echte Daten findest, verwende recherchierte Regionaldurchschnitte mit "(regionaler Schätzwert — nicht aus dem Angebot)".
   Ein leeres Array [] ist ein FEHLER. Der Kunde bezahlt für vollständige Daten.
9. Scores müssen IMMER Zahlen zwischen 1 und 10 sein. NIEMALS 0. Auch bei fehlenden Daten mindestens 3 vergeben.
10. Antworte AUSSCHLIESSLICH mit validem JSON — kein Markdown, kein Text vor oder nach dem JSON.
11. ERFINDE NIEMALS konkrete Objektdaten (Kaufpreis, Adresse, Zimmeranzahl). Regionale Durchschnittswerte für fehlende Nebenkosten, Energiedaten etc. als solche kennzeichnen ist erlaubt und PFLICHT.

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

  "marktdaten": [{ "kennzahl": "string", "wert": "string", "einschaetzung": "gut|mittel|schlecht" }],

  "quellen": [{ "titel": "string (Name der Quelle / Studientitel / Plattform)", "url": "string (vollständige https-URL der Quelle)", "kategorie": "string (z.B. Preisdaten, Lage, Energie, Demografie, Verkehr, Recht)" }]
}

PFLICHT-HINWEISE:
- objektdaten: Adresse, Typ, Kaufpreis, Wohnfläche, Grundstück, Zimmer, Baujahr, Zustand, Heizung, Energieeffizienz, Stellplatz, Keller, Hausgeld, Provision. Werte aus dem Exposé. Wenn ein Wert fehlt: regionalen Durchschnitt recherchieren und mit "(regionaler Schätzwert — nicht aus dem Angebot)" kennzeichnen.
  WICHTIG für das DECKBLATT der Analyse: Die folgenden 5 Einträge MÜSSEN in dieser exakten Schreibweise vorhanden sein, weil sie als Hero-Stats angezeigt werden:
  * { "merkmal": "Adresse", "wert": "Vollständige Adresse mit PLZ und Ort" }
  * { "merkmal": "Objekttyp", "wert": "z.B. Eigentumswohnung, Reihenhaus, Einfamilienhaus" }
  * { "merkmal": "Kaufpreis", "wert": "z.B. 389.000 €" }
  * { "merkmal": "Wohnfläche", "wert": "z.B. 78 m²" }
  * { "merkmal": "Zimmer", "wert": "z.B. 3" }
  * { "merkmal": "Baujahr", "wert": "z.B. 1965" }
  * { "merkmal": "Energieeffizienz", "wert": "z.B. D (128 kWh/m²a)" }
- standortanalyse.kategorien: ÖPNV, Schulen/Kitas, Einkauf, Ärzte, Freizeit, Lärm, Sicherheit, Entwicklungsperspektive. JEDE Kategorie braucht Score 1-10 basierend auf Web-Recherche. In "details" KEINE erfundenen Eigennamen (Kitas, Praxen, Läden) — nur belegbare Namen oder generische Kategorien.
- standortanalyse.demografie/wirtschaft/infrastruktur: Präzise Zahlen (Arbeitslosenquote, Bevölkerungsentwicklung, Kaufkraftindex) NUR wenn per Web-Suche belegt (Statistikamt, Arbeitsagentur, Wegweiser-Kommune). Ohne Beleg: Größenordnung + Kennzeichnung "(regionaler Schätzwert — nicht aus dem Angebot)". kaufkraftindex ohne belegten Indexwert qualitativ formulieren ("leicht über Bundesschnitt (regionaler Schätzwert — nicht aus dem Angebot)") statt einer präzisen Scheinzahl. breitband als Verfügbarkeits-Aussage mit Prüfhinweis ("laut Breitbandatlas verfügbar — Verfügbarkeit für die konkrete Adresse beim Anbieter prüfen").
- finanzierung.szenarien: IMMER 3 Szenarien berechnen (Konservativ 30% EK, Standard 20% EK, Minimal 10% EK). Recherchiere aktuelle Bauzinsen per Web-Suche. IMMER konkrete Euro-Beträge korrekt durchrechnen.
- stresstest: IMMER 3 Szenarien (Zinserhöhung auf 5,5%, Sonderumlage 15.000€, Einkommensverlust 30%). Korrekt berechnen.
- kaufenVsMieten: IMMER berechnen. Vergleichsmiete per Web-Suche aus dem Mietpreisspiegel der Stadt recherchieren.
- modernisierung.items: IMMER mindestens 6 Bauteile (Heizung, Fenster, Elektrik, Bad, Dach, Fassade). Alter NUR ableiten wenn Baujahr im Exposé steht.
- gesamtkosten: Grunderwerbsteuer KORREKT je Bundesland (Stand 2026): Bayern 3,5%, BaWü 5,0%, Niedersachsen 5,0%, RLP 5,0%, Sachsen-Anhalt 5,0%, Thüringen 5,0%, Bremen 5,5% (seit 01.07.2025!), Hamburg 5,5%, Sachsen 5,5%, Berlin 6,0%, Hessen 6,0%, MV 6,0%, Brandenburg 6,5%, NRW 6,5%, SH 6,5%, Saarland 6,5%. Diese Tabelle (bzw. der im Nutzer-Prompt genannte Satz) ist VERBINDLICH — Web-Suchergebnisse zur Grunderwerbsteuer sind häufig veraltet und dürfen die Tabelle NICHT übersteuern. Denselben Satz in steuerlicheAspekte und marktdaten verwenden.
- laufendeKosten: Diese Werte stehen FAST NIE im Exposé — sie müssen IMMER berechnet/recherchiert werden:
  * Hausgeld: Aus Exposé wenn vorhanden, sonst ca. 3-4 €/m²/Monat als Durchschnitt
  * Grundsteuer: IMMER recherchieren (Hebesatz der Gemeinde × Grundsteuerwert). Wenn nicht findbar: ca. 50-120 €/Monat je nach Stadt
  * Gebäudeversicherung: ca. 200-600 €/Jahr für EFH, ca. 100-300 €/Jahr für ETW
  * Instandhaltungsrücklage: 1-1,5 €/m²/Monat (Neubau) bis 2-3 €/m²/Monat (Altbau)
  * Heizkosten: Fläche × Energiekennwert × Energiepreis berechnen. Gas: 0,10 €/kWh, Öl: 0,09 €/kWh, Wärmepumpe: 0,30 €/kWh (÷ COP 3,5)
  * Strom: ca. 35-45 €/Person/Monat
  * Wasser/Abwasser: ca. 3-4 €/m³, ca. 150-300 €/Person/Jahr
  JEDE laufende Kostenposition MUSS einen konkreten Euro-Betrag haben. NIEMALS "Im Exposé nicht angegeben" bei laufenden Kosten — diese werden IMMER berechnet.
  Wenn ein Wert nicht direkt aus dem Exposé kommt, hänge an den Wert an: "(regionaler Schätzwert — nicht aus dem Angebot)"
- Maklergebühr: WICHTIG — Suche auf der Exposé-Seite EXPLIZIT nach den Wörtern "Provision", "Käuferprovision", "Maklerprovision", "Courtage", "provisionsfrei", "provisionspflichtig". Diese Information steht oft im Kleingedruckten, in einem separaten Abschnitt "Kosten" oder "Preise", oder ganz unten auf der Seite. Bei ImmoScout24 steht sie typischerweise im Bereich "Preise" oder als Fußnote z.B. "Käufer zahlt 3,57% inkl. MwSt." Regeln: (1) Wenn Provision gefunden → exakt übernehmen (z.B. "3,57%"). (2) Wenn "provisionsfrei"/"käuferprovisionsfrei" → "0%". (3) NUR wenn trotz gründlicher Suche NICHTS zur Provision steht → "3,57% (regionaler Schätzwert — nicht aus dem Angebot)". NIEMALS 0% annehmen wenn die Information einfach nicht gefunden wurde — der Standard in Deutschland ist 3,57% Käuferanteil.
- energieanalyse: Daten aus Exposé bevorzugen. Wenn Energieausweis fehlt: Recherchiere typischen Verbrauch für Baujahr+Gebäudetyp und kennzeichne mit "(regionaler Schätzwert — nicht aus dem Angebot)". Heizkosten IMMER berechnen: Fläche × kWh/m² × Energiepreis.
- scores: ALLE Scores müssen Zahlen zwischen 1 und 10 sein (ganzzahlig). KEIN Score darf 0 sein. Minimum ist 1. Bei fehlenden Daten mindestens 3-5 vergeben basierend auf Regionsdurchschnitt. gesamtbewertung = (lage × 0.25) + (preis_leistung × 0.25) + (zustand × 0.20) + (energie × 0.15) + (finanzierung × 0.15). Auf 1 Dezimalstelle runden.
- verhandlungstipps: MINDESTENS 6 Tipps. Jeder Tipp MUSS sich auf konkrete Daten aus der Analyse beziehen (z.B. "Heizung aus 1995 → 25.000€ Erneuerung → 7% Preisnachlass fordern"). Kategorien: Sanierungsstau, Energieklasse, Marktvergleich, fehlende Dokumente, Zeitdruck/Verhandlungsposition, versteckte Kosten.
- makleranschreiben: MUSS persönlich und objektspezifisch sein. Adresse und Exposé-Nr nennen. Mindestens 8 gezielte Fragen stellen die im Exposé fehlen. KEINE generischen Floskeln. Der Käufer soll damit direkt den Makler anschreiben können.
- Alle Felder sind Pflicht AUSSER verhandlungstipps und makleranschreiben (nur wenn vom Nutzer gewünscht). Wenn nicht gewünscht: leere Arrays/Strings.
- WICHTIG: Nutze Web-Suche um das Exposé abzurufen UND Marktdaten zu recherchieren. Suche nach der Exposé-Nummer auf ImmoScout24.
- ABSOLUTE REGEL: Erfinde KEINE konkreten Objektdaten (Kaufpreis, Adresse, Zimmeranzahl etc.). Regionale Durchschnittswerte für fehlende Daten (Energieverbrauch, Grundsteuer, Heizkosten etc.) MÜSSEN recherchiert und eingesetzt werden — das ist KEIN Erfinden, sondern PFLICHT. Kennzeichne sie mit "(regionaler Schätzwert — nicht aus dem Angebot)". JEDES Feld muss einen konkreten Zahlenwert haben. NIEMALS nur "Im Exposé nicht angegeben" oder "Nicht verfügbar" ohne Zahl schreiben.
- LAUFENDE KOSTEN REGEL: Grundsteuer, Versicherung, Heizkosten, Instandhaltung, Strom, Wasser — diese werden IMMER berechnet. Sie stehen NIE im Exposé. Recherchiere den Hebesatz der Gemeinde, berechne Heizkosten aus Fläche × Energiekennwert × Preis. Kein Feld darf leer sein.

- QUELLEN-PFLICHT (gilt für ALLE Pakete!): Im Feld "quellen" MÜSSEN MINDESTENS 5 echte URLs angegeben werden, die du während der Web-Recherche tatsächlich aufgerufen hast. Pflicht-Quellen-Kategorien:
  * 1× Preisdaten (z.B. immowelt, ImmoScout24-Marktdaten, Engel & Völkers Marktbericht)
  * 1× Bodenrichtwert (BORIS-Portal des Bundeslandes oder Gutachterausschuss-Webseite)
  * 1× Mietspiegel (offizielle Stadt-/Gemeinde-Seite oder anerkannter Mietspiegel-Anbieter)
  * 1× Lage/Demografie (BBSR, Statistisches Landesamt, Destatis, lokale Wikipedia-Stadtteilseite)
  * 1× Energie/GEG (dena, BMWK, KfW Förderungen, Verbraucherzentrale)
  Format: { "titel": "Klarer Quellen-Name z.B. 'Mietspiegel Berlin 2025'", "url": "https://...", "kategorie": "Preisdaten | Lage | Energie | Demografie | Recht | Verkehr" }
  ABSOLUTE REGEL: NIEMALS halluzinierte URLs erfinden. Nur URLs angeben die du tatsächlich per Web-Suche besucht/zitiert hast. Lieber 5 echte URLs als 10 erfundene. Wenn du eine URL nicht eindeutig nachweisen kannst, weglassen.`

const SYSTEM_PROMPT_PREMIUM_ADDITION = `

PREMIUM-REPORT — PFLICHT! Das JSON MUSS ein "premiumReport"-Objekt enthalten. Dieses Objekt ist der Hauptgrund warum der Kunde 79€ bezahlt hat. Es muss UMFASSEND und DETAILLIERT sein.

{
  "premiumReport": {
    "reportDatum": "string (heutiges Datum, z.B. 11.04.2026)",
    "reportNummer": "string (z.B. IP-2026-04-XXXXX, zufällige 5-stellige Nummer)",

    "wertermittlung": {
      "vergleichswert": {
        "wert": "string (Spanne, z.B. 350.000–410.000 €)",
        "methode": "string (2-3 Sätze: Einordnung anhand vergleichbarer AKTUELLER ANGEBOTE in der Umgebung — ausdrücklich Angebotspreise, KEINE notariellen Verkaufspreise. Verwende NICHT die Wörter 'verkauft' oder 'Verkaufspreis')",
        "vergleichsobjekte": [{ "adresse": "string", "preis": "string", "qm": "string (€/m²)", "abweichung": "string (z.B. +5,2%)" }]
      },
      "sachwert": { "bodenwert": "string (z.B. 120.000 € (600 €/m² × 200 m²))", "gebaeudewert": "string", "alterswertminderung": "string (z.B. -35% (Alter: 40 Jahre))", "sachwert": "string" },
      "ertragswert": { "jahresrohertrag": "string", "bewirtschaftungskosten": "string", "reinertrag": "string", "liegenschaftszins": "string", "ertragswert": "string" },
      "fazit": { "marktwertSpanne": "string (z.B. 340.000–400.000 €)", "empfohlenerKaufpreis": "string (z.B. 370.000 €)", "einschaetzung": "string (3-4 Sätze, detaillierte Einschätzung ob der Preis fair ist und warum)" }
    },

    "standortDossier": {
      "entfernungen": [{ "ziel": "string", "entfernung": "string", "fahrzeit": "string" }],
      "hochwasserrisiko": { "zone": "string (z.B. Zone 3 — mittleres Risiko)", "details": "string (2-3 Sätze)", "risiko": "niedrig|mittel|hoch" },
      "laermbelastung": { "tags": "string (z.B. 58 dB(A))", "nachts": "string (z.B. 45 dB(A))", "quelle": "string (z.B. Hauptstraße B42, Bahnlinie 200m)", "bewertung": "string (2-3 Sätze)" },
      "radon": { "wert": "string (z.B. 40-60 kBq/m³)", "risiko": "niedrig|mittel|hoch" },
      "bebauungsplan": { "nutzung": "string (z.B. Allgemeines Wohngebiet WA)", "gfz": "string", "grz": "string", "besonderheiten": "string (z.B. Denkmalschutzzone, Milieuschutz etc.)" },
      "sozialstruktur": { "beschreibung": "string (3-4 Sätze über die Nachbarschaft)", "milieuschutz": "boolean", "vorkaufsrecht": "boolean" }
    },

    "vermoegensvergleich": {
      "jahre": [0, 5, 10, 15, 20, 25, 30],
      "vermoegenKauf": ["string (7 Werte, Euro-Beträge für jedes Jahr, berechnet mit Wertsteigerung 2% p.a.)"],
      "vermoegenMieteEtf": ["string (7 Werte, Euro-Beträge für jedes Jahr, bei Miete + ETF-Sparplan mit 7% Rendite p.a.)"],
      "breakEvenJahr": "number (z.B. 18)"
    },

    "vorKaufCheckliste": [{
      "kategorie": "string",
      "items": [{ "text": "string", "wichtigkeit": "muss|soll|kann", "erledigt": false }]
    }],

    "steuerlicheAspekte": [{ "aspekt": "string", "details": "string (2-3 Sätze)", "vorteil": "string" }],

    "gutachterEmpfehlung": { "empfohlen": "boolean", "grund": "string (3-4 Sätze)", "geschaetzteKosten": "string (z.B. 800–1.500 €)" },

    "maklerProfil": {
      "name": "string (Name des Maklerunternehmens / 'Privatverkäufer' / 'Nicht im Exposé erkennbar')",
      "art": "gewerblich | privatverkauf | unbekannt",
      "gegruendet": "string (Jahr z.B. '1995' ODER 'Nicht öffentlich verfügbar')",
      "mitarbeiter": "string (Anzahl ODER 'Nicht öffentlich')",
      "qualifikation": "string (z.B. 'Geprüfte Immobilienkaufleute IHK' ODER 'Keine Angaben verfügbar')",
      "sitz": "string (Adresse ODER 'Nicht angegeben')",
      "ansprechpartner": "string (Name ODER 'Nicht im Exposé')",
      "bewertungen": [{ "plattform": "string (ImmoScout24/JACASA/Google/ProvenExpert/Trustpilot)", "score": "string (X,X/5 ODER '—')", "anzahl": "string (z.B. '142 Bewertungen' ODER 'Keine')" }],
      "ranking": "string (NUR wenn ein real existierendes, benanntes Ranking per Web-Suche gefunden wurde — mit Namensnennung der Quelle. Sonst '—'. NIEMALS ein Ranking erfinden)",
      "fazit": "string (3-4 Sätze BERATER-TONALITÄT — Einordnung der öffentlich auffindbaren Informationslage. KEIN Seriositäts-Urteil über die Firma oder Personen — beschreibe nur, was auffindbar ist und was der Käufer selbst anfragen sollte)",
      "redFlags": ["string (entweder konkrete Auffälligkeiten ODER ['Keine Auffälligkeiten — solider Anbieter'])"]
    },

    "mietrendite": {
      "verfuegbar": "boolean (true wenn Mietspiegel-Daten findbar, false wenn Region zu klein/ländlich)",
      "fallbackHinweis": "string (NUR wenn verfuegbar=false: erkläre warum keine Renditeberechnung möglich)",
      "ortsuebliche_kaltmiete": "string (z.B. '9,16 €/m² laut Mietspiegel Stadt 2025, Lagestufe gut')",
      "jahresrohertrag": "string (Berechnung sichtbar, z.B. '9,16 € × 78 m² × 12 = 8.574 €/Jahr')",
      "bruttorendite": "string (z.B. '3,56 % p.a.')",
      "bewirtschaftungskosten": "string (Prozent + €-Betrag, typisch 20-25%)",
      "nettomietertrag": "string (Jahresrohertrag - Bewirtschaftungskosten)",
      "nettorendite": "string (z.B. '2,85 % p.a. (vor Steuer)')",
      "benchmark": "string (3-4 Sätze BERATER — Einordnung der Rendite im regionalen Kontext)",
      "hinweis": "string (2-3 Sätze BERATER — was bei Selbstnutzung vs. Vermietung zu beachten ist)"
    },

    "finanzierungsDetail": {
      "cashflow": [
        { "eigenkapitalQuote": "10 %", "eigenkapitalBetrag": "string", "darlehen": "string", "zinssatz": "string (aktuell, recherchiert)", "tilgung": "2,0 %", "monatlicheRate": "string", "restschuld10Jahre": "string", "gesamtbelastung10Jahre": "string", "bewertung": "tragbar|grenzwertig|kritisch" },
        { "eigenkapitalQuote": "20 %", "eigenkapitalBetrag": "string", "darlehen": "string", "zinssatz": "string", "tilgung": "2,0 %", "monatlicheRate": "string", "restschuld10Jahre": "string", "gesamtbelastung10Jahre": "string", "bewertung": "tragbar|grenzwertig|kritisch" },
        { "eigenkapitalQuote": "30 %", "eigenkapitalBetrag": "string", "darlehen": "string", "zinssatz": "string", "tilgung": "2,0 %", "monatlicheRate": "string", "restschuld10Jahre": "string", "gesamtbelastung10Jahre": "string", "bewertung": "tragbar|grenzwertig|kritisch" }
      ],
      "empfehlung": "string (3-4 Sätze BERATER — welche Variante für welchen Käufertyp, was ist der Hebel)",
      "beispielTilgungsplan": [
        { "jahr": 1, "restschuld": "string", "bisherZinsen": "string", "bisherTilgung": "string" },
        { "jahr": 5, "restschuld": "string", "bisherZinsen": "string", "bisherTilgung": "string" },
        { "jahr": 10, "restschuld": "string", "bisherZinsen": "string", "bisherTilgung": "string" },
        { "jahr": 15, "restschuld": "string", "bisherZinsen": "string", "bisherTilgung": "string" },
        { "jahr": 20, "restschuld": "string", "bisherZinsen": "string", "bisherTilgung": "string" }
      ]
    },

    "marktband": {
      "einheit": "€/m²",
      "guenstig": { "wert": "string (z.B. '4.200 €/m²')", "label": "string (kurz, z.B. 'Untere 25% (B-Lagen, sanierungsbedürftig)')" },
      "durchschnittLow": { "wert": "string", "label": "string ('Mittleres Marktband (untere Hälfte)')" },
      "durchschnittHigh": { "wert": "string", "label": "string ('Mittleres Marktband (obere Hälfte)')" },
      "top": { "wert": "string", "label": "string ('Obere 10% (Top-Lagen, Neubau/saniert)')" },
      "diesesObjekt": { "wert": "string (€/m² des Analyseobjekts)", "positionProzent": "number (0-100 — wo das Objekt im Band liegt, 0=ganz günstig, 100=ganz teuer)", "einordnung": "string (kurzer Satz, z.B. 'Im unteren Mittelband — leicht unter Median')" },
      "einschaetzung": "string (3-4 Sätze BERATER — Was bedeutet diese Position für den Käufer?)"
    },

    "preistrendHistorisch": {
      "einheit": "€/m²",
      "zeitreihe": [
        { "jahr": "2021", "wert": "string (z.B. '5.180 €/m²')", "wertNum": "number (numerisch z.B. 5180 für Chart-Skalierung)" },
        { "jahr": "2022", "wert": "string", "wertNum": "number" },
        { "jahr": "2023", "wert": "string", "wertNum": "number" },
        { "jahr": "2024", "wert": "string", "wertNum": "number" },
        { "jahr": "2025", "wert": "string", "wertNum": "number" },
        { "jahr": "2026", "wert": "string", "wertNum": "number" }
      ],
      "trend": "steigend|stabil|fallend",
      "veraenderungProzent": "string (z.B. '+4,6 % über 5 Jahre (≈ 0,9 % p.a.)')",
      "prognoseHinweis": "string (3-4 Sätze BERATER — historischer Kontext + Prognose-Einordnung)"
    },

    "besichtigungsFragenSpezifisch": {
      "fragenProThema": [
        { "thema": "string (z.B. '🔥 Heizung & Energie (Baujahr XXXX!)' — emoji + thema + objektbezug)", "fragen": [
          { "frage": "string (konkrete Frage)", "begruendung": "string (2-3 Sätze WARUM diese Frage wichtig ist, mit konkreten Zahlen)", "prioritaet": "kritisch|wichtig|optional", "bezugZumObjekt": "string (z.B. 'Baujahr 1965 = Asbest-Risiko' — die spezifische Verknüpfung zu Daten dieses Objekts)" }
        ] }
      ]
    },

    "staerkenSchwaechenNarrativ": {
      "staerken": [{ "punkt": "string (kurze Aussage)", "begruendung": "string (1-2 Sätze WARUM ist das eine Stärke, mit konkreten Zahlen aus der Analyse)", "einfluss": "hoch|mittel|niedrig" }],
      "schwaechen": [{ "punkt": "string", "begruendung": "string", "einfluss": "hoch|mittel|niedrig" }],
      "empfehlung": "string (3-5 Sätze BERATER — konkrete Handlungsanweisung mit nummerierten Schritten z.B. '1) Schadstoffgutachten in Notarvertrag, 2) Verhandeln auf 375.000 €, 3) Vorkaufsrecht klären')"
    }
  }
}

PREMIUM-PFLICHT-DETAILS:
- vergleichswert.vergleichsobjekte: Recherchiere per Web-Suche vergleichbare AKTUELLE ANGEBOTE in der Umgebung (immowelt-/ImmoScout24-Inserate). 🚨 WICHTIG: Echte notarielle Verkaufspreise sind in Deutschland NICHT öffentlich verfügbar (nur Gutachterausschuss / Kaufpreissammlung, §195 BauGB). Gib daher ausschließlich ANGEBOTSPREISE an; das Feld "preis" ist ein Angebotspreis, kein Kaufpreis. Verwende NIEMALS "verkauft" oder behaupte abgeschlossene Verkäufe. Ziel: 3–6 vergleichbare Angebote mit Adresse/Stadtteil, €/m², Abweichung. Wenn die Web-Suche keine belastbaren Vergleichsangebote liefert, gib lieber 2–3 echte an statt 6 — erfinde NIEMALS Adressen oder Preise.
- sachwert: INDIKATIV und als solcher kennzeichnen. Bodenwert = Bodenrichtwert (per Web-Suche/web_fetch, BORIS) × anteilige Grundstücksfläche (bei ETW über Miteigentumsanteil; Fläche unbekannt → "Schätzwert" schreiben). Gebäudewert = NHK 2010 (Wohngebäude je nach Standard ca. 900–1.400 €/m² BGF) × Baupreisindex 2026 (ca. 1,9–2,0 gegenüber 2010) × Fläche — den Index AUSWEISEN. Alterswertminderung nach Ross (nicht linear): Minderung = ½ × (A/N + (A/N)²) mit A = Alter, N = Gesamtnutzungsdauer (ETW/EFH 80 Jahre, Modernisierung verlängert die Restnutzungsdauer). Rechenweg in den Feldern sichtbar machen; im Feld "sachwert" den Zusatz "(indikativ — kein Gutachten)" anhängen.
- ertragswert: Jahresrohertrag aus ortsüblicher Vergleichsmiete (per Web-Suche Mietpreisspiegel). Liegenschaftszins vom Gutachterausschuss.
- standortDossier.entfernungen: 6–12 POIs — NUR Ziele, die im Exposé genannt werden oder per Web-Suche konkret belegbar sind (z.B. nächster Bahnhof, benannter Park, Krankenhaus, Stadtzentrum, Autobahnanschluss). 🚨 ERFINDE NIEMALS Eigennamen von Kitas, Arztpraxen oder Geschäften ("Kita Sonnenschein", "Praxis Dr. Weber") — wenn kein Beleg findbar, formuliere generisch mit Kategorie ("Nächste Grundschule (laut Stadtteil-Info)"). ALLE Entfernungen und Fahrzeiten sind Näherungswerte und MÜSSEN mit "ca." beginnen. 6 belegbare Einträge sind besser als 12 geratene — lass Kategorien ohne Beleg weg.
- hochwasserrisiko: Per Web-Suche "[Stadt] Hochwassergefahrenkarte" recherchieren. Wenn keine amtliche Karte gefunden: Risiko aus Gewässernähe/Topografie ableiten und kennzeichnen "(abgeleitet aus Lage — Hochwassergefahrenkarte des Landes selbst prüfen)".
- laermbelastung: Per Web-Suche "[Stadt] Lärmkartierung" bzw. Umgebungslärm-Portal des Bundeslandes recherchieren. Konkrete dB-Werte NUR angeben, wenn eine Lärmkartierung/amtliche Quelle gefunden wurde. Sonst: Spanne anhand Straßentyp/Lage schätzen und IM WERT kennzeichnen, z.B. "ca. 55–65 dB(A) (geschätzt anhand Straßentyp — Lärmkartierung der Stadt selbst prüfen)". Im Feld "quelle" die tatsächliche Grundlage nennen (Kartierung ODER Straßentyp-Schätzung).
- radon: Per Web-Suche "Radonkarte [Bundesland]" (BfS-Übersichtskarte) recherchieren. Der Wert gilt auf Landkreis-Ebene — IMMER anfügen: "(BfS-Karte, Landkreis-Ebene — Gebäudewerte können abweichen)".
- bebauungsplan: nutzung/gfz/grz NUR mit konkreten Werten füllen, wenn ein Bebauungsplan/Geoportal-Eintrag per Web-Suche gefunden wurde. Sonst: "nutzung" aus dem Gebietscharakter ableiten mit Kennzeichnung "(abgeleitet aus Umgebung — kein B-Plan öffentlich gefunden)" und für gfz/grz exakt schreiben: "Im B-Plan beim Bauamt einsehbar". Diese Formulierung ist hier die EINZIGE erlaubte Ausnahme von der Zahlen-Pflicht — niemals GFZ/GRZ-Werte raten.
- vorKaufCheckliste: 4 Kategorien mit jeweils mindestens 6 Items:
  1. Dokumente vom Verkäufer anfordern (Grundbuchauszug, Energieausweis, Teilungserklärung, Wohngeldabrechnung, Protokolle WEG, Mietverträge etc.)
  2. Selbst recherchieren (Baulastenverzeichnis, Bebauungsplan, Altlastenkataster, Denkmalschutz, Erschließungsbeiträge etc.)
  3. Bei der Besichtigung prüfen (Feuchtigkeit Keller, Fenster, Heizung, Elektrik, Dach, Schimmel, Risse etc.)
  4. Vor Vertragsunterzeichnung (Finanzierungszusage, Notarvertrag prüfen, Rücktrittsklausel, Übergabeprotokoll etc.)
- steuerlicheAspekte: MINDESTENS 5 Aspekte (Grunderwerbsteuer, AfA bei Vermietung 2-3%, Werbungskosten, Spekulationssteuer 10 Jahre, Denkmal-AfA falls relevant).
- gutachterEmpfehlung: Basierend auf Baujahr, Zustand und Sanierungsstau empfehlen ob ein Vor-Ort-Gutachten sinnvoll ist.

═══════════════════════════════════════════════════════════════
PREMIUM-PFLICHT — NEUE MODULE (Stufe 1 + 2)
TONALITÄT: BERATER-STIL — narrativ, handlungsorientiert, persönlich. Verwende "Sie" statt "der Käufer".
KEINE akademischen Floskeln, keine ImmoWertV-Paragraphen in den neuen Modulen. Schreibe wie ein erfahrener Makler-Coach.

🚨 OBERSTE PFLICHT — KEINE LEEREN FELDER: Der Kunde zahlt 79€. Jedes Feld in jedem Premium-Modul MUSS einen sinnvollen Wert haben — entweder echte Daten oder einen plausibilisierten Regionsdurchschnitt mit "(regionaler Schätzwert — nicht direkt nachweisbar)" Kennzeichnung. Leere Strings, "—" alleine ohne Kontext, oder leere Arrays sind VERBOTEN. Ausnahmen siehe unten (Persönlichkeitsrechte bei Makler-Bewertungen).

DATEN-FÜLLUNGS-HIERARCHIE (gilt für ALLE Markt-/Preis-/Renditedaten):
  1. STUFE — Echte lokale Daten aus Web-Recherche (z.B. Mietspiegel der Stadt)
  2. STUFE — Daten der nächstgrößeren vergleichbaren Stadt/Region als Proxy + Kennzeichnung "(regionaler Schätzwert — Proxy aus [Vergleichsstadt], kein lokaler Mietspiegel)"
  3. STUFE — Bundesweiter/Landes-Durchschnitt für Stadttyp + Kennzeichnung "(regionaler Schätzwert — kein lokaler Wert ermittelbar)"
  Erst wenn ALLE 3 Stufen scheitern, darf ein Modul als "verfuegbar: false" markiert werden — das ist absoluter Notfall.
═══════════════════════════════════════════════════════════════

- maklerProfil: Recherchiere den Maklernamen aus dem Exposé per Web-Suche. Suche gezielt nach: "[Maklername] Bewertungen", "[Maklername] ImmoScout", "[Maklername] JACASA", "[Maklername] Google reviews", "[Maklername] Impressum gegründet".
  ⚠️ AUSNAHME zur Daten-Füllungs-Pflicht: Bei MAKLER-BEWERTUNGEN (score, anzahl, Plattform) NIEMALS Werte erfinden oder Durchschnitte einsetzen — das wäre Rufschädigung. Hier ist "Keine öffentlichen Bewertungen verfügbar" die EINZIG erlaubte Antwort wenn nicht findbar.
  Bei FAKTISCHEN Daten (Gründung, Mitarbeiterzahl, Sitz) gilt:
  * Erst Impressum-Suche, dann Handelsregister-Suche, dann LinkedIn/Xing
  * Wenn nicht findbar → "Nicht öffentlich verfügbar" — auch hier KEIN Schätzen (ist Faktenbehauptung)
  FALLBACK-REGELN:
  * Privatverkäufer (kein Makler im Exposé) → "art": "privatverkauf", alle Felder "Nicht zutreffend (Privatverkauf)", bewertungen-Array LEER, fazit: "📋 Privatverkauf — keine Maklerprüfung möglich. Bei Privatverkäufen ist die Unterlagen-Vollständigkeit doppelt wichtig: Lassen Sie den Kaufvertrag von einem unabhängigen Anwalt prüfen (300-500€). Klären Sie persönlich den Verkaufsgrund — emotionale Verkäufe (Erbschaft, Scheidung) sind oft gut verhandelbar."
  * Makler ohne Online-Präsenz → "art": "unbekannt", "name": echter Maklername, andere Faktendaten "Nicht öffentlich verfügbar", bewertungen-Array LEER, redFlags: ["Geringe Online-Sichtbarkeit — kann auf neuen Marktteilnehmer oder rein lokal arbeitenden Privatmakler hindeuten. Bitten Sie um 2-3 Referenzkunden."]
  fazit MUSS narrativ sein (3-4 Sätze) — keine Stichpunkte. Ton: erfahrener Berater, nicht Versicherungs-Disclaimer.

- mietrendite: Daten-Füllungs-Hierarchie strikt befolgen — "verfuegbar: false" ist absoluter NOTFALL.
  STUFE 1: Lokaler Mietspiegel der Stadt → kaltmieteProQm exakt für die Lagestufe + Baujahresklasse + Wohnungsgröße entnehmen
  STUFE 2: Wenn kein lokaler Mietspiegel → Mietspiegel der nächstgrößeren vergleichbaren Stadt im Umkreis 30km nutzen → Wert mit Hinweis kennzeichnen "10,50 €/m² (regionaler Schätzwert — Proxy aus Augsburg-Stadt, kein Mietspiegel für Königsbrunn verfügbar)"
  STUFE 3: Wenn auch das nicht → bundesweiter Mittelwert für Stadttyp (Großstadt/Mittelstadt/Kleinstadt/Dorf) aus aktuellen IVD-Daten → "8,20 €/m² (regionaler Schätzwert — Bundesschnitt für Mittelstädte 20-50k EW, kein regionaler Wert ermittelbar)"
  STUFE 4 (NUR wenn alles scheitert): "verfuegbar": false, "fallbackHinweis": "Für [Ort] und Umgebung liegen keine ausreichend belastbaren Mietdaten vor. Konkrete Empfehlung: 3-5 vergleichbare Mietangebote in der Region selbst recherchieren (z.B. immowelt-Suche im Umkreis 10km)."
  Berechnung wenn Daten verfügbar:
  * jahresrohertrag = kaltmieteProQm × wohnflaeche × 12
  * bruttorendite = jahresrohertrag / kaufpreis × 100
  * bewirtschaftungskosten = 20-25% des Jahresrohertrags
  * nettomietertrag = jahresrohertrag - bewirtschaftungskosten
  * nettorendite = nettomietertrag / kaufpreis × 100
  benchmark MUSS Berater-Tonalität haben — z.B. "Für eine A-Lage in Berlin ist 3,5% Bruttorendite im erwartbaren Bereich — Innenstadtlagen werden primär aus Wertsteigerungserwartung gekauft, nicht aus Cashflow."

- finanzierungsDetail: Berechne 3 EK-Quoten (10/20/30%). Recherchiere AKTUELLE Bauzinsen per Web-Suche (z.B. interhyp, dr-klein, Check24 Baufinanzierung-Vergleich). Bei höherem EK typisch 0,2-0,3% bessere Zinsen. Berechne korrekt:
  * monatlicheRate = darlehen × (zinssatz + tilgung) / 12 (Annuität)
  * gesamtbelastung10Jahre = monatlicheRate × 120
  * restschuld10Jahre nach Annuitätenformel
  * bewertung "tragbar" wenn Rate < 35% Netto, "grenzwertig" 35-45%, "kritisch" >45% — Annahme: Median-Haushaltsnetto regional
  empfehlung MUSS narrativ sein und konkret welche Variante für welchen Käufertyp passt + den größten Hebel (Zinsersparnis durch mehr EK) klar benennen.
  beispielTilgungsplan: 5 Stützpunkte (Jahr 1, 5, 10, 15, 20) für die mittlere Variante (20% EK).

- marktband: ALLE 4 Quartile MÜSSEN gefüllt sein — niemals leer lassen.
  STUFE 1: Recherchiere für den Stadtteil die Preisspanne aus mehreren Quellen (immowelt-Marktdaten, Engel & Völkers Marktbericht, ImmoScout24-Atlas, JLL/Aengevelt-Marktberichte)
  STUFE 2: Wenn keine Stadtteil-Daten → ganzstädtische Daten + Hinweis im Label "(Gesamtstadt)"
  STUFE 3: Wenn auch das nicht → Bundesländer-Schnitt für Stadttyp + Hinweis "(⚠️ Landesdurchschnitt — kein lokaler Marktbericht verfügbar)"
  Bilde 4 Quartile (immer in absteigender Reihenfolge):
  * guenstig = ca. unteres 25%-Perzentil (B-Lagen, sanierungsbedürftig)
  * durchschnittLow = Median-tiefer
  * durchschnittHigh = Median-höher
  * top = oberes 10%-Perzentil (Top-Lagen, Neubau/saniert)
  diesesObjekt.positionProzent: Wo liegt der €/m²-Preis dieses Objekts auf der Skala 0=guenstig bis 100=top? Linear interpolieren zwischen guenstig und top.
  einschaetzung: Berater-Sätze, NICHT akademisch. z.B. "Sie zahlen ~5% unter dem Stadtteil-Median — das ist ein realistischer Eintrittspunkt, kein Schnäppchen."

- preistrendHistorisch: ALLE 6 Jahre (2021-2026) MÜSSEN Werte haben — niemals einzelne Jahre weglassen.
  STUFE 1: Echte Stadtteil-Daten aus immowelt-Marktdaten / ImmoScout-Marktberichten / Engel & Völkers Marktbericht für 5-6 Jahre
  STUFE 2: Wenn nur 2-3 echte Jahre findbar → fehlende Jahre plausibilisieren basierend auf bundesweitem/regionalem Trend (z.B. -5% in 2023 wegen Zinswende, +1% p.a. ab 2024) und im prognoseHinweis transparent benennen "Werte 2021-2022 geschätzt aus Bayern-Trend, 2023-2026 aus lokalen Marktberichten"
  STUFE 3: Wenn keine lokalen Daten → komplette Zeitreihe aus Stadttyp-Trend ableiten + klar kennzeichnen "(⚠️ Geschätzte Reihe basierend auf Trend für Mittelstädte in NRW)"
  wertNum MUSS als reine Zahl ohne Einheiten/Punkte (z.B. 5180, nicht "5.180" oder "5180 €") für die Chart-Skalierung.
  prognoseHinweis MUSS Berater-Tonalität — Kontext + Erwartung — und Transparenz über Datenquelle/Schätzung.

- besichtigungsFragenSpezifisch: NICHT generisch! Jede Frage MUSS sich auf KONKRETE Daten DIESES Objekts beziehen. Beispiele:
  * Wenn Baujahr 1950-1990 → Asbest-Frage als KRITISCH mit bezugZumObjekt: "Baujahr XXXX = klassische Asbest-Periode"
  * Wenn Heizung > 15 Jahre alt → kritische Frage zum Heizungstausch mit Bezug aufs Alter
  * Wenn ETW → WEG-Spezifika (Hausgeld, Rücklage, Sonderumlagen)
  * Wenn EFH → Grundstücks-Spezifika (Erschließung, Wegerechte, Baulasten)
  * Wenn Lage in Milieuschutz → Vorkaufsrecht-Frage
  Mindestens 3 Themen mit jeweils 3-5 Fragen. begruendung MUSS konkret sein mit Zahlen ("Heizungstausch kostet 15-30k€", "Asbest-Sanierung +30-50% Kosten") — keine vagen "wichtig zu wissen" Floskeln.

- staerkenSchwaechenNarrativ: Mindestens 4 Stärken + 4 Schwächen. Jede MUSS sich auf konkrete Daten der Analyse beziehen.
  punkt = kurze Headline-Aussage (max 10 Wörter)
  begruendung = WARUM ist das relevant + konkrete Zahlen aus der Analyse referenzieren
  einfluss = Wie stark wirkt sich dieser Punkt auf die Kaufentscheidung aus?
  empfehlung am Ende MUSS NUMMERIERTE Handlungsschritte enthalten (z.B. "1) ... 2) ... 3) ...") — der Käufer soll daraus eine konkrete To-Do-Liste ableiten können.
  TONALITÄT: Wie ein erfahrener Coach. NICHT "Der Käufer sollte beachten..." sondern "Sie sollten..." / "Mein Rat: ...". Ehrliche Einschätzung — wenn Objekt mittelmäßig ist, sag es klar.

ALLE NEUEN MODULE SIND PFLICHT. Wenn ein Modul wegen Datenlage unmöglich ist, IMMER den entsprechenden Fallback einsetzen — niemals Modul weglassen.

DAS premiumReport-Objekt MUSS im JSON enthalten sein. Es ist NICHT optional. Der Kunde hat 79€ dafür bezahlt.`

// ═══════════════════════════════════════════════════════════════
// AI Provider Switch
// ═══════════════════════════════════════════════════════════════

// Sonnet 5: Intro-Pricing 2$/10$ pro MTok bis 31.08.2026 (danach 3$/15$),
// neuer Tokenizer (~30% mehr Tokens als Sonnet 4), deutlich besseres
// Agentic-/Web-Search-Verhalten. Per Env-Var übersteuerbar (z.B. für Tests).
const ANTHROPIC_MODEL = Deno.env.get('ANTHROPIC_MODEL') || 'claude-sonnet-5'
// Premium darf ein stärkeres Modell nutzen (z. B. claude-opus-5-5) — per Env umschaltbar,
// ohne Deploy. Fällt auf ANTHROPIC_MODEL zurück.
const ANTHROPIC_MODEL_PREMIUM = Deno.env.get('ANTHROPIC_MODEL_PREMIUM') || ANTHROPIC_MODEL
// Structured Outputs (JSON-Schema-Zwang) — per Env abschaltbar; bei Schema-Fehlern
// der API fällt die betroffene Analyse automatisch auf freies JSON zurück.
const STRUCTURED_OUTPUT = Deno.env.get('STRUCTURED_OUTPUT') !== 'false'

const TEST_MODE = Deno.env.get('TEST_MODE') === 'true'

interface AIResponse {
  result: unknown
}

// Note: callOpenAI fallback was removed — endpoint /v1/responses doesn't exist on
// OpenAI API and the silent failure could have charged customers without delivering.
// Claude-only path is now enforced. If a fallback is ever needed, use Anthropic's
// own model fallback (e.g. Sonnet → Opus) or a different OpenAI endpoint.

// ═══════════════════════════════════════════════════════════════
// Anthropic Message Batches — die Analyse läuft als Batch:
// • kein Edge-Wall-Clock-Limit (Batch rechnet bei Anthropic, Function pollt nur)
// • 50% Token-Rabatt auf alle Analysen
// Phase A submittet, Phase B holt Ergebnisse ab (siehe Handler).
// ═══════════════════════════════════════════════════════════════

const ANTHROPIC_HEADERS = (key: string) => ({
  'Content-Type': 'application/json',
  'x-api-key': key,
  'anthropic-version': '2023-06-01',
})

interface BatchMessage {
  content: Array<{ type: string; text?: string }>
  stop_reason?: string
  usage?: Record<string, unknown>
}

interface BatchResultEntry {
  type: string // succeeded | errored | canceled | expired
  message?: BatchMessage
  error?: unknown
}

function buildMessageParams(
  systemPrompt: string,
  userContent: Array<Record<string, unknown>>,
  maxTokens: number,
  isPremium: boolean,
  structured: boolean
): Record<string, unknown> {
  // Premium gets more web searches for deeper research
  const webSearchMaxUses = isPremium ? 28 : 12
  const webFetchMaxUses = isPremium ? 16 : 8
  return {
    model: isPremium ? ANTHROPIC_MODEL_PREMIUM : ANTHROPIC_MODEL,
    max_tokens: maxTokens,
    // Structured Outputs: Antwort MUSS dem Schema entsprechen → kein kaputtes JSON,
    // Zahlen als Zahlen, keine Retries wegen Parse-Fehlern.
    ...(structured ? { output_config: { effort: 'high', format: { type: 'json_schema', schema: isPremium ? PREMIUM_SCHEMA : STANDARD_SCHEMA } } } : {}),
    // Adaptive Thinking: sucht zuverlässiger (Pflicht-Websearches); effort medium
    // hält Thinking-Anteil und Kosten im Rahmen.
    thinking: { type: 'adaptive' },
    // Audit Okt. 2026: 'medium' ließ Pflicht-Websearches und Rechenwege aus —
    // 'high' ist bei 12–28 Suchen und 24–56k Output der angemessene Rahmen.
    ...(structured ? {} : { output_config: { effort: 'high' } }),
    // cache_control: System-Prompt wird pro Such-Iteration neu gelesen — Cache
    // macht Iteration 2..N ~90% günstiger.
    system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
    // web_search_20260209 = server-managed + dynamische Ergebnis-Filterung.
    // web_fetch_20260209 = gefundene Seiten/PDFs VOLLSTÄNDIG lesen (Mietspiegel,
    // BORIS, Gutachterausschuss) statt aus Such-Snippets zu raten; kein Aufpreis,
    // nur Token. max_content_tokens begrenzt lange PDFs.
    tools: [
      { type: 'web_search_20260209', name: 'web_search', max_uses: webSearchMaxUses },
      { type: 'web_fetch_20260209', name: 'web_fetch', max_uses: webFetchMaxUses, max_content_tokens: 20000 },
    ],
    // userContent: Text-Block (URL-Fall) ODER document/image-Blöcke + Instruktions-
    // Text (PDF-/Foto-Upload). cache_control sitzt auf dem LETZTEN Block und cached
    // damit den gesamten Prefix inkl. der Dokumente.
    messages: [{ role: 'user', content: userContent }],
  }
}

async function submitBatch(
  requests: Array<{ custom_id: string; params: Record<string, unknown> }>,
  key: string
): Promise<{ id: string }> {
  const res = await fetch('https://api.anthropic.com/v1/messages/batches', {
    method: 'POST',
    headers: ANTHROPIC_HEADERS(key),
    body: JSON.stringify({ requests }),
  })
  if (!res.ok) throw new Error(`Batch submit: ${res.status} — ${(await res.text()).slice(0, 400)}`)
  return await res.json()
}

async function getBatch(batchId: string, key: string): Promise<{ processing_status: string; results_url?: string }> {
  const res = await fetch(`https://api.anthropic.com/v1/messages/batches/${batchId}`, {
    headers: ANTHROPIC_HEADERS(key),
  })
  if (!res.ok) throw new Error(`Batch status: ${res.status}`)
  return await res.json()
}

async function getBatchResults(resultsUrl: string, key: string): Promise<Map<string, BatchResultEntry>> {
  const res = await fetch(resultsUrl, { headers: ANTHROPIC_HEADERS(key) })
  if (!res.ok) throw new Error(`Batch results: ${res.status}`)
  const text = await res.text()
  const map = new Map<string, BatchResultEntry>()
  for (const line of text.split('\n')) {
    if (!line.trim()) continue
    try {
      const row = JSON.parse(line) as { custom_id: string; result: BatchResultEntry }
      map.set(row.custom_id, row.result)
    } catch (e) {
      console.error('Batch-Result-Zeile unlesbar:', e)
    }
  }
  return map
}

function logBatchMessage(id: string, msg: BatchMessage): void {
  const blockTypes = (msg.content || []).map((b) => b.type).join(',')
  const searches = (msg.content || []).filter((b) => b.type === 'server_tool_use').length
  const u = (msg.usage || {}) as Record<string, unknown>
  console.log(
    `Analyse ${id}: stop=${msg.stop_reason}, blocks=[${blockTypes}], web_searches=${searches}, ` +
    `in=${u.input_tokens} cacheW=${u.cache_creation_input_tokens} cacheR=${u.cache_read_input_tokens} out=${u.output_tokens}`
  )
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

  // Das Modell hängt gelegentlich NACH dem JSON noch einen Prosa-Block an
  // ("Die wichtigsten Erkenntnisse in Kürze: …"). Daher: Text-Blöcke von hinten
  // nach vorne durchgehen und den ersten nehmen, der valides JSON-Objekt enthält.
  let lastError: unknown = null
  for (let i = textBlocks.length - 1; i >= 0; i--) {
    const text = textBlocks[i].text
    if (!text || !text.includes('{')) continue
    try {
      const parsed = parseJson(text)
      if (parsed && typeof parsed === 'object') return parsed
    } catch (e) {
      lastError = e
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Could not parse JSON from Claude response')
}

function parseJson(text: string): unknown {
  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\s*|```\s*/g, '').trim()
  try {
    return JSON.parse(cleaned)
  } catch {
    // Try to extract the outermost JSON object
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        // Letzter Versuch: bis zur letzten balancierten Klammer schneiden
        // (repariert abgeschnittene/nachlaufende Zeichen)
        const s = match[0]
        let depth = 0
        let lastBalanced = -1
        let inString = false
        let escaped = false
        for (let i = 0; i < s.length; i++) {
          const c = s[i]
          if (escaped) { escaped = false; continue }
          if (c === '\\') { escaped = true; continue }
          if (c === '"') inString = !inString
          if (inString) continue
          if (c === '{') depth++
          if (c === '}') { depth--; if (depth === 0) lastBalanced = i }
        }
        if (lastBalanced > 0) return JSON.parse(s.slice(0, lastBalanced + 1))
      }
    }
    // Diagnose: zeigen, WAS das Modell geliefert hat (Anfang + Ende)
    console.error(`JSON-Parse fehlgeschlagen. Antwort-Anfang: ${text.slice(0, 400)}`)
    console.error(`Antwort-Ende: ${text.slice(-300)}`)
    throw new Error('Could not parse JSON from Claude response')
  }
}

// Extract the object's city from objektdaten for source validation.
// Returns lowercase city slug candidates (city name + common abbreviations).
function extractObjektStadt(result: Record<string, unknown>): string[] {
  const objektdaten = result.objektdaten as Array<{ merkmal?: string; wert?: string }> | undefined
  if (!Array.isArray(objektdaten)) return []

  const adresse = objektdaten.find(o => /adresse|ort|stadt/i.test(o.merkmal || ''))?.wert || ''
  if (!adresse) return []

  // Extract: "12345 Bremerhaven-Lehe" → ["bremerhaven", "lehe"]
  // "80331 München" → ["munchen", "muenchen"]
  const parts = adresse
    .replace(/\d{5}/g, '')
    .split(/[,\-\s/]+/)
    .map(p => p.trim().toLowerCase())
    .filter(p => p.length >= 4 && !/^(straße|str|platz|weg|allee|ring|ufer|damm)$/i.test(p))
    .map(p => p.replace(/[äöü]/g, c => ({ä: 'ae', ö: 'oe', ü: 'ue'}[c]!)))

  // Add original umlaut form too
  const withUmlauts = parts.flatMap(p => {
    const original = adresse.toLowerCase().split(/[,\-\s/]+/).find(x => x.replace(/[äöü]/g, c => ({ä: 'ae', ö: 'oe', ü: 'ue'}[c]!)) === p)
    return original && original !== p ? [p, original] : [p]
  })

  return [...new Set(withUmlauts)]
}

// Check whether a source URL/title references the object's city.
// Allows nationwide portals (immowelt.de, destatis.de) even without city match
// because they can contain city-specific pages via path params.
const NATIONWIDE_PORTALS = [
  'destatis.de', 'bmwk.de', 'bmwsb.de', 'kfw.de', 'bafa.de', 'dena.de',
  'verbraucherzentrale.de', 'geoportal.de', 'umweltbundesamt.de',
  'wikipedia.org', 'gesetze-im-internet.de',
]

function sourceMatchesCity(src: { titel?: string; url?: string }, cityTerms: string[]): boolean {
  if (cityTerms.length === 0) return true // no city extracted → can't validate
  const url = (src.url || '').toLowerCase()
  const titel = (src.titel || '').toLowerCase()
  const haystack = url + ' ' + titel

  if (cityTerms.some(t => haystack.includes(t))) return true

  // Nationwide portal: allowed if they include city-specific content (best effort)
  try {
    const host = new URL(src.url || '').hostname.toLowerCase()
    if (NATIONWIDE_PORTALS.some(d => host === d || host.endsWith('.' + d))) return true
  } catch { /* invalid URL — fall through */ }

  return false
}

// Filter out sources that don't match the object's city.
// Logs the filtered count for monitoring.
// Erreichbarkeits-Check einer Quelle. Nur eindeutig tote Links fliegen raus
// (Netzfehler, 404/410, 5xx). 403/405/429 gelten als "lebt, aber Bot-Schutz" —
// Immowelt/ImmoScout antworten Crawlern grundsätzlich mit 403.
async function sourceIsAlive(url: string): Promise<boolean> {
  if (!/^https?:\/\//i.test(url)) return false
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 6000)
  try {
    const res = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: ctrl.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ImmoPruef-SourceCheck/1.0' } })
    if (res.status === 404 || res.status === 410 || res.status >= 500) return false
    return true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function validateSources(result: Record<string, unknown>): Promise<number> {
  const quellen = result.quellen as Array<{ titel?: string; url?: string; kategorie?: string }> | undefined
  if (!Array.isArray(quellen)) return 0

  const before = quellen.length
  const cityTerms = extractObjektStadt(result)
  let filtered = cityTerms.length > 0 ? quellen.filter(q => sourceMatchesCity(q, cityTerms)) : quellen
  const afterCity = filtered.length

  // Audit Okt. 2026: ein Kundenreport verlinkte eine nicht erreichbare Domain.
  const alive = await Promise.all(filtered.map(q => sourceIsAlive(String(q.url || ''))))
  filtered = filtered.filter((_, i) => alive[i])

  result.quellen = filtered
  const removed = before - filtered.length
  if (removed > 0) {
    console.warn(`validateSources: ${before} → ${afterCity} (Stadt-Match [${cityTerms.join(', ')}]) → ${filtered.length} (erreichbar)`)
  }
  return removed
}

// Post-parse validation: ensure no critical arrays are empty
function validateResult(result: Record<string, unknown>): string[] {
  const warnings: string[] = []
  const checkArray = (path: string, obj: unknown, minLen: number) => {
    if (!Array.isArray(obj) || obj.length < minLen) {
      warnings.push(`${path}: got ${Array.isArray(obj) ? obj.length : 'missing'}, need ${minLen}`)
    }
  }
  checkArray('objektdaten', result.objektdaten, 5)
  checkArray('marktdaten', result.marktdaten, 3)
  checkArray('risiken', result.risiken, 2)

  const gk = result.gesamtkosten as Record<string, unknown> | undefined
  if (gk) checkArray('laufendeKosten', gk.laufendeKosten, 4)

  const ea = result.energieanalyse as Record<string, unknown> | undefined
  if (ea) checkArray('sanierungsoptionen', ea.sanierungsoptionen, 2)

  const mod = result.modernisierung as Record<string, unknown> | undefined
  if (mod) {
    checkArray('modernisierung.items', mod.items, 4)
    checkArray('modernisierung.timeline', mod.timeline, 2)
  }

  const sa = result.standortanalyse as Record<string, unknown> | undefined
  if (sa) checkArray('standortanalyse.kategorien', sa.kategorien, 5)

  const rb = result.risikobewertung as Record<string, unknown> | undefined
  if (rb) checkArray('risikobewertung.items', rb.items, 3)

  const fin = result.finanzierung as Record<string, unknown> | undefined
  if (fin) {
    checkArray('finanzierung.szenarien', fin.szenarien, 2)
    checkArray('finanzierung.stresstest', fin.stresstest, 2)
  }

  return warnings
}

// ═══════════════════════════════════════════════════════════════
// Deterministische Finanz-Nachberechnung
// Claude liefert die Eingangsgrößen (Darlehen, Zins, Tilgung, Sätze) —
// Annuität, Restschuld, Tilgungsplan und Summen werden hier exakt
// nachgerechnet und überschreiben die LLM-Arithmetik. Scheitert das
// Parsen einer Eingangsgröße, bleiben die LLM-Werte unangetastet.
// ═══════════════════════════════════════════════════════════════

// "389.000 €" / "3,65 % (10 J.)" / "ca. 1.468 €" → 389000 / 3.65 / 1468
function parseGermanNumber(s: unknown): number | null {
  if (typeof s === 'number') return isFinite(s) ? s : null
  if (typeof s !== 'string') return null
  const m = s.replace(/ /g, ' ').match(/-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:,\d+)?/)
  if (!m) return null
  const n = parseFloat(m[0].replace(/\./g, '').replace(',', '.'))
  return isFinite(n) ? n : null
}

function formatEuro(n: number): string {
  return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'
}

function formatPercent(n: number): string {
  return n.toFixed(2).replace('.', ',') + ' %'
}

// ═══════════════════════════════════════════════════════════════
// Bundesland-Erkennung + Grunderwerbsteuer-Kanon
// Hintergrund: In drei auditierten Reports (Okt. 2026) hat das Modell für
// Bremen durchgehend 5,0 % statt der seit 01.07.2025 geltenden 5,5 % angesetzt
// — trotz korrekter Tabelle im System-Prompt (Web-Suche liefert Altdaten).
// Der Satz wird deshalb hier verbindlich aus dem Bundesland abgeleitet und
// (a) dem Modell vorgegeben, (b) nach der Antwort erzwungen.
// Tabelle = Kanon aus src/lib/kaufnebenkosten.ts (Frontend-Rechner).
// ═══════════════════════════════════════════════════════════════
const GREST_SATZ: Record<string, number> = {
  'Baden-Württemberg': 5.0, 'Bayern': 3.5, 'Berlin': 6.0, 'Brandenburg': 6.5,
  'Bremen': 5.5, 'Hamburg': 5.5, 'Hessen': 6.0, 'Mecklenburg-Vorpommern': 6.0,
  'Niedersachsen': 5.0, 'Nordrhein-Westfalen': 6.5, 'Rheinland-Pfalz': 5.0,
  'Saarland': 6.5, 'Sachsen': 5.5, 'Sachsen-Anhalt': 5.0, 'Schleswig-Holstein': 6.5,
  'Thüringen': 5.0,
}

// PLZ-Leitregionen (erste zwei Ziffern) → Bundesland, NUR wo eindeutig.
// Mehrdeutige Regionen (z. B. 28 = Bremen/Niedersachsen, 21/22 = Hamburg/SH/NDS,
// 14 = Berlin/Brandenburg) sind bewusst NICHT enthalten → dort entscheidet nur
// ein expliziter Orts-/Landesname, sonst keine Übersteuerung.
const PLZ2_LAND: Record<string, string> = {
  '01': 'Sachsen', '02': 'Sachsen', '04': 'Sachsen', '08': 'Sachsen', '09': 'Sachsen',
  '03': 'Brandenburg', '15': 'Brandenburg', '16': 'Brandenburg',
  '06': 'Sachsen-Anhalt', '39': 'Sachsen-Anhalt',
  '07': 'Thüringen', '98': 'Thüringen', '99': 'Thüringen',
  '10': 'Berlin', '11': 'Berlin', '12': 'Berlin', '13': 'Berlin',
  '17': 'Mecklenburg-Vorpommern', '18': 'Mecklenburg-Vorpommern', '19': 'Mecklenburg-Vorpommern',
  '20': 'Hamburg',
  '23': 'Schleswig-Holstein', '24': 'Schleswig-Holstein', '25': 'Schleswig-Holstein',
  '26': 'Niedersachsen', '29': 'Niedersachsen', '30': 'Niedersachsen', '31': 'Niedersachsen',
  '38': 'Niedersachsen', '49': 'Niedersachsen',
  '27': 'Niedersachsen', // Bremerhaven (275xx) wird über den Ortsnamen erkannt
  '32': 'Nordrhein-Westfalen', '33': 'Nordrhein-Westfalen', '40': 'Nordrhein-Westfalen',
  '41': 'Nordrhein-Westfalen', '42': 'Nordrhein-Westfalen', '44': 'Nordrhein-Westfalen',
  '45': 'Nordrhein-Westfalen', '46': 'Nordrhein-Westfalen', '47': 'Nordrhein-Westfalen',
  '48': 'Nordrhein-Westfalen', '50': 'Nordrhein-Westfalen', '51': 'Nordrhein-Westfalen',
  '52': 'Nordrhein-Westfalen', '53': 'Nordrhein-Westfalen', '57': 'Nordrhein-Westfalen',
  '58': 'Nordrhein-Westfalen', '59': 'Nordrhein-Westfalen',
  '34': 'Hessen', '35': 'Hessen', '36': 'Hessen', '60': 'Hessen', '61': 'Hessen',
  '63': 'Hessen', '64': 'Hessen', '65': 'Hessen',
  '54': 'Rheinland-Pfalz', '55': 'Rheinland-Pfalz', '56': 'Rheinland-Pfalz', '67': 'Rheinland-Pfalz',
  '66': 'Saarland',
  '68': 'Baden-Württemberg', '69': 'Baden-Württemberg', '70': 'Baden-Württemberg',
  '71': 'Baden-Württemberg', '72': 'Baden-Württemberg', '73': 'Baden-Württemberg',
  '74': 'Baden-Württemberg', '75': 'Baden-Württemberg', '76': 'Baden-Württemberg',
  '77': 'Baden-Württemberg', '78': 'Baden-Württemberg', '79': 'Baden-Württemberg',
  '88': 'Baden-Württemberg', '89': 'Baden-Württemberg',
  '80': 'Bayern', '81': 'Bayern', '82': 'Bayern', '83': 'Bayern', '84': 'Bayern',
  '85': 'Bayern', '86': 'Bayern', '87': 'Bayern', '90': 'Bayern', '91': 'Bayern',
  '92': 'Bayern', '93': 'Bayern', '94': 'Bayern', '95': 'Bayern', '96': 'Bayern', '97': 'Bayern',
}

// Erkennung aus beliebigem Text (Exposé-Markdown ODER fertiges Ergebnis).
// Reihenfolge: explizites "Bundesland: X" → Stadtstaaten-Ortsname → PLZ-Region.
// Kopfzeilen für die Nutzer-Nachricht: Datum (für "aktuell"/"Stand"-Angaben und
// Bauzins-Recherche) + verbindliches Bundesland/GrESt, wenn erkennbar.
function kontextKopf(exposeText: string | null): string {
  const heute = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' })
  const land = exposeText ? detectBundesland(exposeText) : null
  const landZeile = land
    ? `BUNDESLAND (aus dem Exposé ermittelt): ${land} → Grunderwerbsteuer ${GREST_SATZ[land].toFixed(1).replace('.', ',')} % — VERBINDLICH, nicht per Web-Suche "prüfen" (Suchergebnisse enthalten oft veraltete Sätze).\n`
    : ''
  return `HEUTIGES DATUM: ${heute} — verwende es für alle "aktuell"/"Stand"-Angaben; Bauzinsen immer für diesen Monat recherchieren.\n${landZeile}\n`
}

// Optionale Käuferangaben aus dem Bestellformular → persönliches Szenario + echter Stresstest.
type KaeuferOpts = { eigenkapital?: number | null; haushaltsnetto?: number | null; nutzung?: string | null }
function kaeuferBlock(opts: unknown): string {
  const o = (opts || {}) as KaeuferOpts
  const ek = typeof o.eigenkapital === 'number' && o.eigenkapital > 0 ? o.eigenkapital : null
  const netto = typeof o.haushaltsnetto === 'number' && o.haushaltsnetto > 0 ? o.haushaltsnetto : null
  const nutzung = o.nutzung === 'selbstnutzung' || o.nutzung === 'vermietung' ? o.nutzung : null
  if (!ek && !netto && !nutzung) return ''
  const zeilen: string[] = []
  if (ek) zeilen.push(`- Verfügbares Eigenkapital: ${formatEuro(ek)} → Ergänze in finanzierung.szenarien als VIERTES Szenario "Ihr Szenario" (eigenkapital = ${formatEuro(ek)}, Darlehen = Kaufpreis + Nebenkosten − Eigenkapital, Zins passend zur resultierenden Beleihung) und beziehe dich in empfohleneEigenkapitalquote und Zusammenfassung darauf.`)
  if (netto) zeilen.push(`- Haushaltsnettoeinkommen: ${formatEuro(netto)}/Monat → Stresstest-Bewertungen auf DIESER Basis (Rate/Netto: unter 35 % tragbar, 35–45 % grenzwertig, über 45 % kritisch); nenne die Belastungsquote in jedem Stresstest-Szenario. Keine "Beispiel-Haushalt"-Annahmen mehr.`)
  if (nutzung === 'vermietung') zeilen.push('- Geplante Nutzung: VERMIETUNG → Mietrendite, Vermietbarkeit, AfA/Werbungskosten und Mietpreisbremse ausführlich; Eigennutzungs-Aspekte knapp.')
  if (nutzung === 'selbstnutzung') zeilen.push('- Geplante Nutzung: SELBSTNUTZUNG → Wohnwert, laufende Belastung, Modernisierungsbedarf und Lage für den Alltag ausführlich; Rendite-Aspekte knapp (Hinweis genügt).')
  return `\nKÄUFERANGABEN (vom Kunden eingegeben — verbindlich verwenden):\n${zeilen.join('\n')}\n`
}

function detectBundesland(text: string): string | null {
  if (!text) return null
  const m = text.match(/Bundesland\s*:\s*([A-Za-zÄÖÜäöüß-]+(?:\s[A-Za-zÄÖÜäöüß-]+)?)/)
  if (m) {
    const hit = Object.keys(GREST_SATZ).find(l => m[1].toLowerCase().startsWith(l.toLowerCase().slice(0, 6)))
    if (hit) return hit
  }
  // Stadtstaaten + Bremerhaven: Ortsname ist eindeutig
  const plzOrt = text.match(/\b(\d{5})\s+(Bremen|Bremerhaven|Hamburg|Berlin)\b/)
  if (plzOrt) return plzOrt[2] === 'Bremerhaven' ? 'Bremen' : plzOrt[2]
  const plz = text.match(/\b(0[1-9]|[1-9]\d)\d{3}\b/)
  if (plz) {
    const land = PLZ2_LAND[plz[1]]
    if (land) return land
  }
  return null
}

// Annuitätendarlehen mit monatlicher Verrechnung (marktüblich)
function annuity(darlehen: number, zinsPct: number, tilgPct: number) {
  const monthlyRate = darlehen * (zinsPct + tilgPct) / 100 / 12
  const i = zinsPct / 100 / 12
  const balanceAfter = (months: number): number => {
    if (i === 0) return Math.max(0, darlehen - monthlyRate * months)
    const q = Math.pow(1 + i, months)
    return Math.max(0, darlehen * q - monthlyRate * (q - 1) / i)
  }
  const totalMonths = (): number | null => {
    if (i === 0) return monthlyRate > 0 ? Math.ceil(darlehen / monthlyRate) : null
    if (monthlyRate <= darlehen * i) return null
    return Math.ceil(Math.log(monthlyRate / (monthlyRate - darlehen * i)) / Math.log(1 + i))
  }
  return { monthlyRate, balanceAfter, totalMonths }
}

function parseLoanInputs(row: Record<string, unknown>, darlehenKey: string): { darlehen: number; zins: number; tilg: number } | null {
  const darlehen = parseGermanNumber(row?.[darlehenKey])
  const zins = parseGermanNumber(row?.zinssatz)
  const tilg = parseGermanNumber(row?.tilgung)
  if (
    darlehen === null || darlehen < 10_000 || darlehen > 10_000_000 ||
    zins === null || zins <= 0 || zins > 12 ||
    tilg === null || tilg <= 0 || tilg > 12
  ) return null
  return { darlehen, zins, tilg }
}

function recomputeFinances(result: Record<string, unknown>, opts?: unknown): void {
  const fixed: string[] = []
  const kaeufer = (opts || {}) as KaeuferOpts
  const nettoUser = typeof kaeufer.haushaltsnetto === 'number' && kaeufer.haushaltsnetto > 0 ? kaeufer.haushaltsnetto : null

  const gk = result.gesamtkosten as Record<string, any> | undefined
  const objektdaten = result.objektdaten as Array<{ merkmal?: string; wert?: string }> | undefined
  const kaufpreis = parseGermanNumber(gk?.kaufpreis)
    ?? parseGermanNumber(objektdaten?.find(o => /kaufpreis/i.test(o.merkmal || ''))?.wert)
  const wohnflaeche = parseGermanNumber(objektdaten?.find(o => /wohnfl/i.test(o.merkmal || ''))?.wert)

  // 0) Grunderwerbsteuer verbindlich aus dem Bundesland (Adresse/PLZ im Ergebnis)
  const adresse = objektdaten?.find(o => /adresse/i.test(o.merkmal || ''))?.wert || ''
  const land = detectBundesland(adresse) ?? detectBundesland(JSON.stringify(objektdaten || ''))
  if (land && gk?.kaufnebenkosten?.grunderwerbsteuer) {
    const soll = GREST_SATZ[land]
    const ist = parseGermanNumber(gk.kaufnebenkosten.grunderwerbsteuer.satz)
    gk.kaufnebenkosten.grunderwerbsteuer.satz = `${soll.toFixed(1).replace('.', ',')}% (${land})`
    if (ist !== null && Math.abs(ist - soll) > 0.01) {
      console.warn(`GrESt korrigiert: Modell ${ist}% → Kanon ${soll}% (${land})`)
      fixed.push(`grest(${ist}→${soll})`)
    }
    // Marktdaten-Kennzahl angleichen, falls vorhanden
    for (const m of (result.marktdaten as Array<Record<string, unknown>> | undefined) || []) {
      if (/grunderwerbsteuer/i.test(String(m.kennzahl || ''))) m.wert = `${soll.toFixed(1).replace('.', ',')}% (${land})`
    }
  }

  // 1) Kaufnebenkosten: betrag = satz × kaufpreis, gesamt = Summe
  let nkSum: number | null = null
  if (gk?.kaufnebenkosten && kaufpreis && kaufpreis > 10_000) {
    const nk = gk.kaufnebenkosten
    let sum = 0
    let ok = true
    for (const key of ['grunderwerbsteuer', 'notar', 'grundbuch', 'makler']) {
      const eintrag = nk[key]
      const satz = parseGermanNumber(eintrag?.satz)
      if (eintrag && satz !== null && satz >= 0 && satz < 20) {
        const betrag = kaufpreis * satz / 100
        eintrag.betrag = formatEuro(betrag)
        sum += betrag
      } else ok = false
    }
    if (ok) {
      nk.gesamt = formatEuro(sum)
      nkSum = sum
      fixed.push('kaufnebenkosten')
    }
  }

  // 1b) Gesamtbewertung = gewichtete Formel aus dem Prompt (Modell rundet/rechnet sonst frei)
  const sc = result.scores as Record<string, unknown> | undefined
  if (sc) {
    const n = (k: string) => (typeof sc[k] === 'number' ? (sc[k] as number) : parseGermanNumber(sc[k]))
    const l = n('lage'), p = n('preis_leistung'), z = n('zustand'), e = n('energie'), f = n('finanzierung')
    if ([l, p, z, e, f].every(v => v !== null && v >= 1 && v <= 10)) {
      sc.gesamtbewertung = Math.round((l! * 0.25 + p! * 0.25 + z! * 0.2 + e! * 0.15 + f! * 0.15) * 10) / 10
      fixed.push('gesamtbewertung')
    }
  }

  // 2) laufendeKostenGesamt = Summe aller Positionen
  if (gk && Array.isArray(gk.laufendeKosten) && gk.laufendeKosten.length >= 4) {
    const betraege = gk.laufendeKosten.map((p: Record<string, unknown>) => parseGermanNumber(p?.betragMonat))
    if (betraege.every((b: number | null) => b !== null && b >= 0 && b < 20_000)) {
      const monat = (betraege as number[]).reduce((a, b) => a + b, 0)
      gk.laufendeKostenGesamt = { monat: formatEuro(monat), jahr: formatEuro(monat * 12) }
      fixed.push('laufendeKostenGesamt')
    }
  }

  // 3) finanzierung.szenarien: Rate, Restschuld nach 10J, Gesamtlaufzeit
  // Darlehen = Kaufpreis + (korrigierte) Nebenkosten − Eigenkapital, damit eine
  // GrESt-Korrektur konsistent bis in die Rate durchschlägt.
  const fin = result.finanzierung as Record<string, any> | undefined
  let standardSz: { darlehen: number; zins: number; tilg: number; ek: number } | null = null
  if (fin && Array.isArray(fin.szenarien)) {
    for (const sz of fin.szenarien) {
      const ek = parseGermanNumber(sz?.eigenkapital)
      if (kaufpreis && nkSum !== null && ek !== null && ek >= 0 && ek < kaufpreis) {
        sz.darlehenssumme = formatEuro(kaufpreis + nkSum - ek)
      }
      const inp = parseLoanInputs(sz, 'darlehenssumme')
      if (!inp) continue
      if (/standard/i.test(String(sz.name || '')) || /20\s*%/.test(String(sz.eigenkapital || ''))) {
        standardSz = { ...inp, ek: ek ?? 0 }
      }
      const a = annuity(inp.darlehen, inp.zins, inp.tilg)
      sz.monatlicheRate = formatEuro(a.monthlyRate)
      sz.restschuld10Jahre = formatEuro(a.balanceAfter(120))
      const months = a.totalMonths()
      if (months) sz.gesamtlaufzeit = `~${Math.round(months / 12)} Jahre`
      fixed.push(`szenario(${sz.name || '?'})`)
    }
  }

  // 4) premiumReport.finanzierungsDetail: Cashflow-Zeilen + Beispiel-Tilgungsplan
  const pr = result.premiumReport as Record<string, any> | undefined
  const fd = pr?.finanzierungsDetail
  if (fd && Array.isArray(fd.cashflow)) {
    let mittlere: { darlehen: number; zins: number; tilg: number } | null = null
    for (const cf of fd.cashflow) {
      const ek = parseGermanNumber(cf?.eigenkapitalBetrag)
      if (kaufpreis && nkSum !== null && ek !== null && ek >= 0 && ek < kaufpreis) {
        cf.darlehen = formatEuro(kaufpreis + nkSum - ek)
      }
      const inp = parseLoanInputs(cf, 'darlehen')
      if (!inp) continue
      const a = annuity(inp.darlehen, inp.zins, inp.tilg)
      cf.monatlicheRate = formatEuro(a.monthlyRate)
      cf.restschuld10Jahre = formatEuro(a.balanceAfter(120))
      cf.gesamtbelastung10Jahre = formatEuro(a.monthlyRate * 120)
      if (/20/.test(String(cf.eigenkapitalQuote ?? ''))) mittlere = inp
      fixed.push(`cashflow(${cf.eigenkapitalQuote || '?'})`)
    }
    if (mittlere && Array.isArray(fd.beispielTilgungsplan)) {
      const a = annuity(mittlere.darlehen, mittlere.zins, mittlere.tilg)
      for (const row of fd.beispielTilgungsplan) {
        const jahr = typeof row?.jahr === 'number' ? row.jahr : parseGermanNumber(row?.jahr)
        if (!jahr || jahr <= 0 || jahr > 40) continue
        const months = Math.round(jahr * 12)
        const balance = a.balanceAfter(months)
        const getilgt = mittlere.darlehen - balance
        row.restschuld = formatEuro(balance)
        row.bisherTilgung = formatEuro(getilgt)
        row.bisherZinsen = formatEuro(a.monthlyRate * months - getilgt)
      }
      fixed.push('beispielTilgungsplan')
    }
  }

  // 5) premiumReport.mietrendite: Renditen aus sichtbarer Rechnung nachrechnen.
  // Nur wenn jahresrohertrag die dokumentierte Rechnung "… = X €/Jahr" enthält.
  const mr = pr?.mietrendite
  if (mr && mr.verfuegbar !== false && kaufpreis && typeof mr.jahresrohertrag === 'string' && mr.jahresrohertrag.includes('=')) {
    const rohertrag = parseGermanNumber(mr.jahresrohertrag.split('=').pop())
    if (rohertrag !== null && rohertrag >= 1_200 && rohertrag < kaufpreis) {
      mr.bruttorendite = formatPercent(rohertrag / kaufpreis * 100) + ' p.a.'
      const bwPct = parseGermanNumber(mr.bewirtschaftungskosten)
      if (bwPct !== null && bwPct > 0 && bwPct < 60) {
        const netto = rohertrag * (1 - bwPct / 100)
        mr.nettomietertrag = formatEuro(netto) + '/Jahr'
        mr.nettorendite = formatPercent(netto / kaufpreis * 100) + ' p.a. (vor Steuer)'
      }
      fixed.push('mietrendite')
    }
  }

  // 5b) Stresstest: Bewertung deterministisch aus Rate/Haushaltsnetto, wenn der Kunde
  // sein Netto angegeben hat (sonst bleibt die Modell-Einschätzung stehen).
  if (nettoUser && fin && Array.isArray(fin.stresstest)) {
    for (const st of fin.stresstest) {
      const rate = parseGermanNumber(st?.monatlicheRate)
      if (rate === null || rate <= 0) continue
      const basis = /einkommen/i.test(String(st.szenario || '')) ? nettoUser * 0.7 : nettoUser
      const quote = rate / basis * 100
      st.bewertung = quote < 35 ? 'tragbar' : quote <= 45 ? 'grenzwertig' : 'kritisch'
      st.belastungsquote = `${quote.toFixed(0)} % des Haushaltsnettos (${formatEuro(basis)})`
    }
    fixed.push('stresstest(netto)')
  }

  // 6) Kaufen vs. Mieten + 30-Jahres-Vermögensvergleich — deterministisch.
  // Audit Okt. 2026: Das Modell rechnete den Vergleich pro Report nach anderer
  // Methode (mal nur Zinsen, mal volle Annuität; mal mit, mal ohne Mietsteigerung)
  // und lieferte breakEvenJahr teils als Text. Jetzt EINE transparente Modellrechnung:
  const KVM = { wertsteigerung: 0.02, mietsteigerung: 0.02, etfRendite: 0.06, nichtUmlagefaehigAnteil: 0.35 }
  const kvm = fin?.kaufenVsMieten as Record<string, unknown> | undefined
  const miete0 = kvm ? parseGermanNumber(kvm.mpiMieteMonat) : null
  const lk = (gk?.laufendeKosten || []) as Array<Record<string, unknown>>
  if (kaufpreis && nkSum !== null && standardSz && miete0 && wohnflaeche
      && miete0 / wohnflaeche > 3 && miete0 / wohnflaeche < 35) {
    // Eigentümer-spezifische (nicht umlagefähige) Kosten: Rücklage/Instandhaltung/Verwaltung.
    // Ohne Aufschlüsselung: 35 % des Hausgelds; ganz ohne Hausgeld: 1,20 €/m² (EFH-Faustwert).
    const row = (re: RegExp, not?: RegExp) => lk
      .filter(p => re.test(String(p.position || '')) && !(not && not.test(String(p.position || ''))))
      .map(p => parseGermanNumber(p.betragMonat) ?? 0)
    // "Hausgeld gesamt (inkl. Rücklage)" darf NICHT als Rücklage-Zeile zählen (Doppelzählung).
    const explizit = row(/rücklage|instandhalt|verwaltung/i, /^hausgeld/i).reduce((a, b) => a + b, 0)
    const hausgeld = row(/^hausgeld/i)[0] ?? 0
    const eigentuemer0 = hausgeld > 0
      ? Math.max(explizit, hausgeld * KVM.nichtUmlagefaehigAnteil)
      : explizit > 0 ? explizit : wohnflaeche * 1.2

    const a = annuity(standardSz.darlehen, standardSz.zins, standardSz.tilg)
    const rate = a.monthlyRate
    const months = a.totalMonths() ?? 480
    const ek = standardSz.ek
    let etf = ek, buyerSide = 0, kostenKauf20 = 0, kostenMiete20 = 0
    const kauf: number[] = [], mieteEtf: number[] = []
    let breakEven: number | null = null
    for (let m = 0; m <= 360; m++) {
      const jahr = Math.floor(m / 12)
      const wachstum = Math.pow(1 + KVM.mietsteigerung, jahr)
      if (m % 60 === 0) {
        const immo = kaufpreis * Math.pow(1 + KVM.wertsteigerung, m / 12)
        const vermKauf = immo - a.balanceAfter(m) + buyerSide
        kauf.push(vermKauf); mieteEtf.push(etf)
      }
      if (m > 0 && breakEven === null) {
        const immo = kaufpreis * Math.pow(1 + KVM.wertsteigerung, m / 12)
        if (immo - a.balanceAfter(m) + buyerSide >= etf) breakEven = Math.ceil(m / 12)
      }
      if (m === 360) break
      const miete = miete0 * wachstum
      const kaufKosten = (m < months ? rate : 0) + eigentuemer0 * wachstum
      if (m < 240) { kostenKauf20 += kaufKosten; kostenMiete20 += miete }
      const diff = kaufKosten - miete
      const r = KVM.etfRendite / 12
      etf = etf * (1 + r) + Math.max(0, diff)
      buyerSide = buyerSide * (1 + r) + Math.max(0, -diff)
    }
    const v20Kauf = kauf[4], v20Miete = mieteEtf[4]
    const vorteil = v20Kauf >= v20Miete ? 'kaufen' : 'mieten'
    const annahmen = `Annahmen: Wertsteigerung ${KVM.wertsteigerung * 100} % p.a., Mietsteigerung ${KVM.mietsteigerung * 100} % p.a., ETF ${KVM.etfRendite * 100} % p.a. nach Kosten, Zins ${formatPercent(standardSz.zins)} über die gesamte Laufzeit (Standard-Szenario, 20 % EK); nicht umlagefähige Eigentümerkosten ${formatEuro(eigentuemer0)}/Monat. Modellrechnung, keine Prognose.`
    if (kvm) {
      kvm.kostenKauf20Jahre = `${formatEuro(kostenKauf20)} (Rate + Eigentümerkosten über 20 Jahre)`
      kvm.kostenMiete20Jahre = `${formatEuro(kostenMiete20)} (Kaltmiete über 20 Jahre, ${KVM.mietsteigerung * 100} % p.a. steigend)`
      kvm.vorteil = vorteil
      kvm.differenz = `Vermögen nach 20 Jahren im Modell: Kauf ${formatEuro(v20Kauf)} vs. Miete + ETF ${formatEuro(v20Miete)} — rechnerisch ${formatEuro(Math.abs(v20Kauf - v20Miete))} zugunsten ${vorteil === 'kaufen' ? 'des Kaufs' : 'der Miete'}. ${annahmen}`
      fixed.push('kaufenVsMieten')
    }
    if (pr) {
      pr.vermoegensvergleich = {
        jahre: [0, 5, 10, 15, 20, 25, 30],
        vermoegenKauf: kauf.map(formatEuro),
        vermoegenMieteEtf: mieteEtf.map(formatEuro),
        breakEvenJahr: breakEven ?? null,
        annahmen,
      }
      fixed.push('vermoegensvergleich')
    }
  }

  if (fixed.length) console.log(`recomputeFinances: ${fixed.join(', ')}`)
}

// ═══════════════════════════════════════════════════════════════
// Main Handler
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
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
      Deno.env.get('SB_SERVICE_ROLE_KEY')!
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

    // Reset stuck "processing" analyses back to pending — aber NUR wenn der Lauf
    // nachweislich alt ist (>8 min oder ohne Startzeit). Frische "processing"-Zeilen
    // gehören einem aktiven Hintergrund-Job; sofortiges Reset würde Doppel-Läufe starten.
    const STALE_MS = 8 * 60 * 1000
    for (const a of allAnalyses) {
      // Zeilen MIT batch_id gehören einem laufenden Anthropic-Batch (kann legitim
      // länger dauern) — nur verwaiste Claims ohne Batch werden zurückgesetzt.
      if (a.status === 'processing' && !a.batch_id) {
        const startedAt = a.processing_started_at ? new Date(a.processing_started_at).getTime() : 0
        if (Date.now() - startedAt > STALE_MS) {
          console.log(`Resetting stale analysis ${a.id} (processing seit ${a.processing_started_at || 'unbekannt'}) → pending`)
          await supabase.from('analyses').update({ status: 'pending', processing_started_at: null }).eq('id', a.id)
          a.status = 'pending'
        }
      }
    }

    // Check if all are already done
    const allDone = allAnalyses.every((a: { status: string }) => a.status === 'completed' || a.status === 'failed')
    if (allDone) {
      await supabase.from('orders').update({ status: 'completed' }).eq('id', order.id)
      return jsonResponse({ order_status: 'completed', analyses: allAnalyses })
    }

    // ═══ Batch-Verarbeitung: Phase B (Ergebnisse abholen) → Phase A (submitten) ═══
    const isPremium = order.package === 'premium'
    const systemPrompt = isPremium
      ? SYSTEM_PROMPT_STANDARD + SYSTEM_PROMPT_PREMIUM_ADDITION
      : SYSTEM_PROMPT_STANDARD
    // Headroom für Sonnet-5-Tokenizer (~30% mehr Tokens) + Adaptive-Thinking-Anteil.
    // Thinking-Tokens zählen gegen max_tokens — mit effort 'high' braucht Premium
    // mehr Luft, sonst wird das JSON abgeschnitten (stop_reason max_tokens).
    const maxTokens = isPremium ? 72000 : 32000
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')!
    const appUrl = Deno.env.get('APP_URL') || 'https://immopruef.de'

      // Abschluss: Order-Status setzen + ggf. E-Mail — läuft nach JEDEM Ausgang.
      const finalize = async (): Promise<void> => {
        const { data: updatedAnalyses } = await supabase
          .from('analyses')
          .select('*')
          .eq('order_id', order.id)

        const analyses = updatedAnalyses || allAnalyses
        const nowAllDone = analyses.every((a: { status: string }) => a.status === 'completed' || a.status === 'failed')
        if (!nowAllDone) return // weitere Analysen offen — nächster Poll triggert sie

        // Atomare Transition: nur der Poll, der die Umstellung gewinnt, verschickt die Mail
        const { data: won } = await supabase
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', order.id)
          .neq('status', 'completed')
          .select('id')
        if (!won?.length) return
        console.log('All analyses done — sending email...')

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
        if (!email) return

        try {
          const completed = analyses.filter((a: { status: string }) => a.status === 'completed')
          const analysisCount = completed.length
          if (analysisCount === 0) {
            // Keine fertige Analyse -> keine Erfolgs-Mail ("Ihre 0 Analysen sind fertig").
            console.error(`Order ${order.id}: alle Analysen fehlgeschlagen — Erfolgs-Mail unterdrueckt`)
            return
          }

          const linkRows = completed
            .map((a: { token: string; url: string }, i: number) => {
              const exposeNr = a.url.match(/expose\/(\d+)/)?.[1] || ''
              const cleanUrl = a.url.split('#')[0].split('?')[0]
              return `
              <tr>
                <td style="padding:14px 16px;border-bottom:1px solid #f0f0f0;">
                  <div style="font-size:13px;color:#666;margin-bottom:6px;">Immobilie ${i + 1}${exposeNr ? ` · Exposé ${exposeNr}` : ''}</div>
                  <div style="margin-bottom:8px;">
                    <a href="${appUrl}?result=${a.token}" style="display:inline-block;background:#1a6b3c;color:#fff;font-weight:600;font-size:14px;text-decoration:none;padding:8px 18px;border-radius:6px;">
                      Analyse ansehen →
                    </a>
                  </div>
                  ${cleanUrl.startsWith('http') ? `
                  <div style="font-size:12px;">
                    <a href="${cleanUrl}" style="color:#888;text-decoration:none;">
                      📎 Originalinserat: ${cleanUrl}
                    </a>
                  </div>` : `
                  <div style="font-size:12px;color:#888;">📎 Hochgeladenes Exposé (PDF/Fotos)</div>`}
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

    // Exposé beschaffen (Jina/Scraper/Web-Search-Fallback) und Nutzer-Nachricht bauen
    const buildUserMessage = async (analysis: { id: string; url: string; options: unknown }): Promise<string> => {
      const opts = analysis.options as { makleranschreiben: boolean; verhandlungstipps: boolean; risiken: boolean }
      let exposeMarkdown: string | null = null
      let scrapedData: Record<string, unknown> | null = null

        // Clean URL for better web search results
        const cleanUrl = analysis.url.split('#')[0].split('?')[0]
        const exposeMatch = analysis.url.match(/expose\/(\d+)/)
        const exposeId = exposeMatch ? exposeMatch[1] : ''

        // ═══════════════════════════════════════════════════════════
        // BRIGHT DATA WEB UNLOCKER: primary scraper for bot-protected portals
        // (ImmoScout24, Immowelt actively block Jina/Playwright without residential IPs).
        // API: POST https://api.brightdata.com/request
        // Pricing: pay-as-you-go ~$3 per 1000 requests.
        // ═══════════════════════════════════════════════════════════
        const bdToken = Deno.env.get('BRIGHTDATA_API_TOKEN')
        const bdZone = Deno.env.get('BRIGHTDATA_ZONE')
        if (bdToken && bdZone) {
          try {
            const bdController = new AbortController()
            const bdTimer = setTimeout(() => bdController.abort(), 45000)
            const bdRes = await fetch('https://api.brightdata.com/request', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${bdToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ zone: bdZone, url: cleanUrl, format: 'raw' }),
              signal: bdController.signal,
            })
            clearTimeout(bdTimer)
            if (bdRes.ok) {
              const html = await bdRes.text()
              const text = htmlToText(html)
              const hasPrice = /\d[\d.,]*\s*(€|EUR)/i.test(text) || /kaufpreis/i.test(text)
              if (text.length >= 3000 && hasPrice) {
                exposeMarkdown = text.length > 40000 ? text.slice(0, 40000) + '\n\n[...gekürzt]' : text
                console.log(`Bright Data OK: ${html.length} HTML → ${text.length} text chars`)
              } else {
                console.warn(`Bright Data incomplete: ${text.length} text chars, hasPrice=${hasPrice}`)
              }
            } else {
              const errText = await bdRes.text().catch(() => '')
              console.warn(`Bright Data HTTP ${bdRes.status}: ${errText.slice(0, 200)}`)
            }
          } catch (e) {
            console.warn('Bright Data call failed:', e instanceof Error ? e.message : String(e))
          }
        }

        // ═══════════════════════════════════════════════════════════
        // JINA READER: Fallback scraper (free, no JS). Often blocked by ImmoScout24/Immowelt.
        // Only runs if Bright Data didn't yield usable content.
        // ═══════════════════════════════════════════════════════════
        if (!exposeMarkdown) try {
          const jinaUrl = `https://r.jina.ai/${cleanUrl}`
          const jinaKey = Deno.env.get('JINA_API_KEY')
          const jinaHeaders: Record<string, string> = {
            'Accept': 'text/plain',
            'X-Return-Format': 'markdown',
          }
          if (jinaKey) jinaHeaders['Authorization'] = `Bearer ${jinaKey}`

          const jinaController = new AbortController()
          const jinaTimer = setTimeout(() => jinaController.abort(), 20000)
          const jinaRes = await fetch(jinaUrl, { headers: jinaHeaders, signal: jinaController.signal })
          clearTimeout(jinaTimer)

          if (jinaRes.ok) {
            const md = await jinaRes.text()
            // Validate: must be substantial AND contain price-like content.
            // Bot-block pages are typically < 3000 chars and lack € symbols.
            const hasPrice = /\d[\d.,]*\s*(€|EUR)/i.test(md) || /kaufpreis/i.test(md)
            const isSubstantial = md.length >= 3000
            if (isSubstantial && hasPrice) {
              exposeMarkdown = md.length > 40000 ? md.slice(0, 40000) + '\n\n[...gekürzt]' : md
              console.log(`Jina Reader OK: ${md.length} chars, price detected`)
            } else {
              console.warn(`Jina Reader blocked/incomplete: ${md.length} chars, hasPrice=${hasPrice} — falling back to web_search`)
            }
          } else {
            const errText = await jinaRes.text().catch(() => '')
            console.warn(`Jina Reader HTTP ${jinaRes.status}: ${errText.slice(0, 200)}`)
          }
        } catch (e) {
          console.warn('Jina Reader call failed:', e instanceof Error ? e.message : String(e))
        }

        // ═══════════════════════════════════════════════════════════
        // SCRAPER: Extract listing data via Playwright before Claude (optional fallback)
        // ═══════════════════════════════════════════════════════════
        const scraperUrl = Deno.env.get('SCRAPER_URL')
        const scraperKey = Deno.env.get('SCRAPER_API_KEY')

        if (scraperUrl && scraperKey) {
          try {
            console.log(`Calling scraper for ${cleanUrl}...`)
            const scrapeRes = await fetch(`${scraperUrl}/scrape`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-API-Key': scraperKey,
              },
              body: JSON.stringify({ url: analysis.url }),
            })
            if (scrapeRes.ok) {
              scrapedData = await scrapeRes.json()
              console.log(`Scraper returned data for ${cleanUrl} — fields: ${Object.keys(scrapedData || {}).filter(k => (scrapedData as any)[k] !== null).length}`)
            } else {
              const err = await scrapeRes.json().catch(() => ({}))
              console.warn(`Scraper failed (${scrapeRes.status}): ${(err as any).code || 'unknown'}`)
            }
          } catch (e) {
            console.warn('Scraper call failed:', e)
          }
        }

        // Build user message — prefer Jina Markdown, fall back to Scraper JSON, then pure web_search
        let userMessage: string
        const jinaBlock = exposeMarkdown
          ? `\n\n--- EXPOSÉ-MARKDOWN (bereits per Jina Reader abgerufen — AUSSCHLIESSLICH diesen Text als Exposé-Quelle verwenden, NICHT erneut die URL fetchen) ---\n${exposeMarkdown}\n--- ENDE EXPOSÉ-MARKDOWN ---\n`
          : ''

        if (scrapedData && (scrapedData.price || scrapedData.title)) {
          // SCRAPER SUCCESS: Claude gets structured data, only needs to search market data
          userMessage = `${kontextKopf(exposeMarkdown)}Analysiere diese Kaufimmobilie vollständig.

URL: ${cleanUrl}
${exposeId ? `Exposé-Nr: ${exposeId}` : ''}

EXPOSÉ-DATEN (bereits aus dem Inserat extrahiert — NICHT erneut per Web-Suche abrufen):
${JSON.stringify(scrapedData, null, 2)}
${jinaBlock}
SCHRITT 1: Verwende die obigen Exposé-Daten als Grundlage. Diese Daten sind korrekt und direkt aus dem Inserat extrahiert. Der EXPOSÉ-MARKDOWN enthält zusätzlichen Volltext — nutze ihn für Details (Makler-Name, Provision, Beschreibungstext, Ausstattung etc.).
SCHRITT 2: Suche NUR nach MARKTDATEN für die Region: Bodenrichtwert, Vergleichspreise pro m², Mietpreisspiegel, Grundsteuer-Hebesatz.
SCHRITT 3: Erstelle die vollständige Analyse mit ALLEN Berechnungen.

Optionen:
- Makleranschreiben: ${opts.makleranschreiben ? 'ja' : 'nein'}
- Verhandlungstipps: ${opts.verhandlungstipps ? 'ja' : 'nein'}
- Risikohinweise: ${opts.risiken ? 'ja' : 'nein'}
${isPremium ? '- Premium-Report: ja (inkl. Wertermittlung, Standort-Dossier, Vermögensvergleich, Checkliste)' : ''}

WICHTIG:
- Die Exposé-Daten oben sind bereits extrahiert — übernimm sie exakt. NICHT erneut die URL aufrufen.
- Suche NUR nach regionalen Marktdaten (Bodenrichtwert, Vergleichspreise, Mietpreise).
- Laufende Kosten (Grundsteuer, Versicherung, Heizkosten, Rücklagen etc.) sind IMMER zu berechnen.
- Wenn ein Wert in den Exposé-Daten null ist: Regionsdurchschnitt recherchieren und mit "(regionaler Schätzwert — nicht aus dem Angebot)" kennzeichnen.
- NIEMALS nur "Im Exposé nicht angegeben" ohne Wert schreiben. JEDES Feld braucht eine Zahl.
- Antworte ausschließlich mit JSON.
${kaeuferBlock(opts)}`
        } else if (exposeMarkdown) {
          // JINA SUCCESS (no Playwright scraper): use Markdown as primary source
          console.log('Using Jina Reader Markdown as expose source')
          userMessage = `${kontextKopf(exposeMarkdown)}Analysiere diese Kaufimmobilie vollständig.

URL: ${cleanUrl}
${exposeId ? `Exposé-Nr: ${exposeId}` : ''}
${jinaBlock}
SCHRITT 1: Extrahiere ALLE Exposé-Details aus dem EXPOSÉ-MARKDOWN oben (Kaufpreis, Fläche, Zimmer, Baujahr, Adresse, Energieausweis, Hausgeld, Provision, Maklername, Ansprechpartner etc.). NICHT erneut die URL per web_search aufrufen — der Markdown ist die Quelle.
SCHRITT 2: Nutze web_search NUR für Marktdaten der Region des Objekts: Bodenrichtwert, Vergleichspreise €/m², Mietpreisspiegel, Grundsteuer-Hebesatz, Lärmkarte, Hochwasserzone.
SCHRITT 3: Erstelle die vollständige Analyse mit ALLEN Berechnungen basierend auf den extrahierten Exposé-Werten + den recherchierten Marktdaten.

Optionen:
- Makleranschreiben: ${opts.makleranschreiben ? 'ja' : 'nein'}
- Verhandlungstipps: ${opts.verhandlungstipps ? 'ja' : 'nein'}
- Risikohinweise: ${opts.risiken ? 'ja' : 'nein'}
${isPremium ? '- Premium-Report: ja (inkl. Wertermittlung, Standort-Dossier, Vermögensvergleich, Checkliste)' : ''}

WICHTIG:
- Maklerdaten (Name, Firma, Ansprechpartner, Provision) MÜSSEN aus dem Markdown extrahiert werden — sie stehen dort.
- Laufende Kosten IMMER berechnen (Grundsteuer, Versicherung, Heizkosten, Rücklagen).
- Wenn ein Exposé-Wert im Markdown fehlt: Regionsdurchschnitt recherchieren und mit "(regionaler Schätzwert — nicht aus dem Angebot)" kennzeichnen.
- NIEMALS "nicht verfügbar", "Nicht im Exposé angegeben", "—" alleine, "Keine Angabe" ohne konkrete Zahl schreiben. JEDES Feld braucht einen Wert.
- Antworte ausschließlich mit JSON.
${kaeuferBlock(opts)}`
        } else {
          // NEITHER Jina NOR Scraper worked: Fallback to pure web search (old behavior)
          console.log('Neither Jina nor Scraper available — falling back to web search')
          userMessage = `${kontextKopf(exposeMarkdown)}Analysiere diese Kaufimmobilie vollständig.

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

WICHTIG:
- Exposé-Daten exakt übernehmen. Marktdaten recherchieren. Berechnungen korrekt durchführen.
- Laufende Kosten (Grundsteuer, Versicherung, Heizkosten, Rücklagen etc.) sind IMMER zu berechnen — diese stehen nie im Exposé.
- Wenn ein Exposé-spezifischer Wert fehlt (z.B. Energieausweis, Baujahr): Regionsdurchschnitt recherchieren und mit "(regionaler Schätzwert — nicht aus dem Angebot)" kennzeichnen.
- NIEMALS nur "Im Exposé nicht angegeben" ohne Wert schreiben. JEDES Feld braucht eine Zahl.
- NIEMALS Zahlen erfinden — aber Durchschnittswerte recherchieren ist PFLICHT.
- Antworte ausschließlich mit JSON.
${kaeuferBlock(opts)}`
        }

      return userMessage
    }

    // Hochgeladene Dateien (PDF/Fotos) aus dem Storage laden und als native
    // document-/image-Blöcke für Claude aufbereiten (akribische Intake per Prompt).
    const buildFileUserContent = async (analysis: { id: string; file_paths: unknown; options: unknown }): Promise<Array<Record<string, unknown>>> => {
      const opts = analysis.options as { makleranschreiben: boolean; verhandlungstipps: boolean; risiken: boolean }
      const paths = (analysis.file_paths || []) as string[]
      const blocks: Array<Record<string, unknown>> = []

      for (const p of paths) {
        const { data, error } = await supabase.storage.from('exposes').download(p)
        if (error || !data) throw new Error(`Storage-Download fehlgeschlagen (${p}): ${error?.message || 'leer'}`)
        const buf = new Uint8Array(await data.arrayBuffer())
        // Chunked base64 (String-Konkatenation über Array — kein quadratisches Verhalten)
        const parts: string[] = []
        const CHUNK = 32768
        for (let i = 0; i < buf.length; i += CHUNK) {
          parts.push(String.fromCharCode(...buf.subarray(i, Math.min(i + CHUNK, buf.length))))
        }
        const b64 = btoa(parts.join(''))
        const ext = p.split('.').pop()?.toLowerCase()
        if (ext === 'pdf') {
          blocks.push({ type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: b64 } })
        } else {
          const mediaType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg'
          blocks.push({ type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } })
        }
      }

      blocks.push({
        type: 'text',
        text: `${kontextKopf(null)}Analysiere diese Kaufimmobilie vollständig. Das Exposé liegt als Dokument/Fotos bei (KEIN Portal-Link).

SCHRITT 1: Extrahiere AKRIBISCH alle Objektdaten aus dem beiliegenden Material — jede Seite, jede Zahl, jedes Merkmal. Werte auch die Fotos aus und kennzeichne Bild-Einschätzungen mit "(aus Fotos abgeleitet)".
SCHRITT 2: Plausibilisiere die Kerndaten per web_search (existiert Ort/Adresse? passt der Preis zum regionalen Niveau?) und recherchiere die Marktdaten der Region: Bodenrichtwert, Vergleichspreise €/m², Mietspiegel, Grundsteuer-Hebesatz, Bauzinsen.
SCHRITT 3: Erstelle die vollständige Analyse mit ALLEN Berechnungen. Fehlt der Kaufpreis im Dokument, arbeite als indikative Wert-Einschätzung mit begründetem Modell-Anker (Regel "EINGABE ALS PDF/FOTOS" Punkt 4).

Optionen:
- Makleranschreiben: ${opts.makleranschreiben ? 'ja' : 'nein'}
- Verhandlungstipps: ${opts.verhandlungstipps ? 'ja' : 'nein'}
- Risikohinweise: ${opts.risiken ? 'ja' : 'nein'}
${isPremium ? '- Premium-Report: ja (inkl. Wertermittlung, Standort-Dossier, Vermögensvergleich, Checkliste)' : ''}

WICHTIG:
- Laufende Kosten (Grundsteuer, Versicherung, Heizkosten, Rücklagen) IMMER berechnen/recherchieren.
- Fehlende Werte: Regionsdurchschnitt recherchieren und mit "(regionaler Schätzwert — nicht aus dem Angebot)" kennzeichnen.
- Antworte ausschließlich mit JSON.
${kaeuferBlock(opts)}`,
        cache_control: { type: 'ephemeral' },
      })

      return blocks
    }

    // ── Phase B: Ergebnisse fertiger Batches einsammeln ──
    type Row = { id: string; status: string; url: string; batch_id: string | null; retry_count: number; options: unknown; file_paths: unknown }
    const withBatch = (allAnalyses as Row[]).filter((a) => a.status === 'processing' && a.batch_id)
    const batchIds = [...new Set(withBatch.map((a) => a.batch_id as string))]
    for (const bid of batchIds) {
      let meta: { processing_status: string; results_url?: string }
      try {
        meta = await getBatch(bid, anthropicKey)
      } catch (e) {
        console.error(`Batch ${bid}: Status-Abruf fehlgeschlagen:`, e)
        continue
      }
      if (meta.processing_status !== 'ended') continue

      let results: Map<string, BatchResultEntry>
      try {
        results = await getBatchResults(meta.results_url!, anthropicKey)
      } catch (e) {
        console.error(`Batch ${bid}: Results-Abruf fehlgeschlagen:`, e)
        continue
      }

      for (const a of withBatch.filter((x) => x.batch_id === bid)) {
        const r = results.get(a.id)
        // Diagnose-Info für den Fehlerpfad — landet in analyses.result, weil die
        // Function-Logs über die Management-API nicht zuverlässig abrufbar sind.
        let lastError: Record<string, unknown> = { stage: 'batch', type: r?.type ?? 'missing', error: r?.error ?? null }
        if (r?.type === 'succeeded' && r.message) {
          lastError = { stage: 'parse', stop_reason: r.message.stop_reason ?? null, usage: r.message.usage ?? null }
          logBatchMessage(a.id, r.message)
          try {
            const parsed = extractClaudeJson(r.message) as Record<string, unknown>

            // Inserat offline? Definitiver Zustand — ehrlich speichern, kein Retry.
            if (parsed?.error === 'listing_unavailable') {
              console.warn(`Listing offline: ${a.url} — ${parsed.hinweis ?? ''}`)
              await supabase.from('analyses').update({ status: 'failed', result: parsed }).eq('id', a.id)
              continue
            }

            const warnings = validateResult(parsed)
            if (warnings.length > 0) {
              console.warn(`Validation warnings (${warnings.length}):`, warnings.join('; '))
            }
            try {
              await validateSources(parsed)
            } catch (e) {
              console.warn('validateSources failed — keeping sources:', e)
            }
            try {
              recomputeFinances(parsed, a.options)
            } catch (e) {
              console.warn('recomputeFinances failed — keeping LLM values:', e)
            }

            await supabase.from('analyses').update({ result: parsed, status: 'completed' }).eq('id', a.id)
            console.log(`Analyse ${a.id} completed (Batch ${bid})`)
            continue
          } catch (e) {
            console.error(`Analyse ${a.id}: Batch-Ergebnis unbrauchbar:`, e)
            lastError.detail = e instanceof Error ? e.message : String(e)
          }
        } else {
          console.error(`Analyse ${a.id}: Batch-Result ${r ? r.type : 'nicht gefunden'}`, r?.error ?? '')
          // Lehnt die API das JSON-Schema ab (zu komplex / nicht unterstützt), läuft
          // der Retry ohne Schema-Zwang — die Analyse geht nicht verloren.
          if (/output_config|json_schema|schema|grammar/i.test(JSON.stringify(r?.error ?? ''))) lastError.schema_failed = true
        }

        // Fehlerpfad: bis zu 2× neu einreihen, danach endgültig failed
        const tries = a.retry_count ?? 0
        if (tries < 2) {
          await supabase.from('analyses').update({
            status: 'pending', batch_id: null, processing_started_at: null, retry_count: tries + 1,
            result: { _debug_last_error: lastError },
          }).eq('id', a.id)
          console.log(`Analyse ${a.id}: neu eingereiht (Retry ${tries + 1}/2)`)
        } else {
          await supabase.from('analyses').update({ status: 'failed', result: { error: 'analysis_failed', _debug_last_error: lastError } }).eq('id', a.id)
          console.error(`Analyse ${a.id}: endgültig failed nach ${tries} Retries`)
        }
      }
    }

    // ── Phase A: offene Analysen claimen und als EINEN Batch submitten ──
    const { data: afterB } = await supabase.from('analyses').select('*').eq('order_id', order.id)
    const pendings = ((afterB || []) as Row[]).filter((a) => a.status === 'pending')
    if (pendings.length > 0) {
      const requests: Array<{ custom_id: string; params: Record<string, unknown> }> = []
      for (const a of pendings) {
        // Atomarer Claim — parallele Polls prallen ab
        const { data: claimed } = await supabase
          .from('analyses')
          .update({ status: 'processing', processing_started_at: new Date().toISOString() })
          .eq('id', a.id)
          .eq('status', 'pending')
          .select('id')
        if (!claimed?.length) continue

        const hasFiles = Array.isArray(a.file_paths) && (a.file_paths as string[]).length > 0

        // SSRF-Protection (nur URL-Analysen): re-validate URL before passing to Claude
        if (!hasFiles && !isAllowedListingUrl(a.url)) {
          console.error(`Rejected non-allowed URL for analysis ${a.id}: ${a.url}`)
          await supabase.from('analyses').update({
            status: 'failed',
            result: { error: 'URL ist nicht von einem unterstützten Portal' },
          }).eq('id', a.id)
          continue
        }

        try {
          const userContent = hasFiles
            ? await buildFileUserContent(a)
            : [{ type: 'text', text: await buildUserMessage(a), cache_control: { type: 'ephemeral' } }]
          // Schema-Zwang nur, wenn die API ihn für diese Analyse nicht bereits abgelehnt hat
          const prevErr = (a as unknown as { result?: { _debug_last_error?: { schema_failed?: boolean } } }).result?._debug_last_error
          const structured = STRUCTURED_OUTPUT && !prevErr?.schema_failed
          requests.push({ custom_id: a.id, params: buildMessageParams(systemPrompt, userContent, maxTokens, isPremium, structured) })
        } catch (e) {
          console.error(`buildUserMessage fehlgeschlagen für ${a.id}:`, e)
          // Claim lösen — nächster Poll versucht es erneut
          await supabase.from('analyses').update({ status: 'pending', processing_started_at: null }).eq('id', a.id)
        }
      }

      if (requests.length > 0) {
        try {
          const batch = await submitBatch(requests, anthropicKey)
          for (const r of requests) {
            await supabase.from('analyses').update({ batch_id: batch.id }).eq('id', r.custom_id)
          }
          console.log(`Batch ${batch.id} submitted: ${requests.length} Analyse(n), ${ANTHROPIC_MODEL}`)
        } catch (e) {
          console.error('Batch-Submit fehlgeschlagen:', e)
          const detail = e instanceof Error ? e.message : String(e)
          // Submit-Fehler zählen als Versuch — sonst dreht ein dauerhaft scheiternder
          // Submit (z. B. API-Guthaben, ungültiger Parameter) bei jedem Poll eine Runde.
          for (const r of requests) {
            const row = pendings.find((p) => p.id === r.custom_id)
            const tries = row?.retry_count ?? 0
            if (tries < 2) {
              await supabase.from('analyses').update({
                status: 'pending', processing_started_at: null, retry_count: tries + 1,
                result: { _debug_last_error: { stage: 'submit', detail, schema_failed: /output_config|json_schema|schema|grammar/i.test(detail) } },
              }).eq('id', r.custom_id)
            } else {
              await supabase.from('analyses').update({
                status: 'failed', result: { error: 'analysis_failed', _debug_last_error: { stage: 'submit', detail, schema_failed: /output_config|json_schema|schema|grammar/i.test(detail) } },
              }).eq('id', r.custom_id)
            }
          }
        }
      }
    }

    // ── Abschluss + Antwort ──
    await finalize()
    const { data: finalState } = await supabase.from('analyses').select('*').eq('order_id', order.id)
    const done = ((finalState || []) as Row[]).every((a) => a.status === 'completed' || a.status === 'failed')
    return jsonResponse({ order_status: done ? 'completed' : 'processing', analyses: finalState })

  } catch (err) {
    console.error('Analyze error:', err)
    return jsonResponse({ error: 'Interner Fehler' }, 500)
  }
})
