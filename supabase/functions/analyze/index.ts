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
7. FEHLENDE DATEN — WICHTIGSTE REGEL: Wenn ein Wert nicht im Exposé steht, MUSS ein regionaler Durchschnitt recherchiert und eingesetzt werden. IMMER mit dem Hinweis: "(⚠️ Regionsdurchschnitt — nicht im Exposé)" am Ende des Wertes. Beispiele:
   - Energieausweis fehlt → "ca. 180 kWh/m²a, Klasse F (⚠️ Regionsdurchschnitt — nicht im Exposé)"
   - Heizkosten fehlen → "ca. 1.800 €/Jahr (⚠️ Regionsdurchschnitt — nicht im Exposé)"
   - Grundsteuer fehlt → "ca. 85 €/Monat (⚠️ Regionsdurchschnitt — nicht im Exposé)"
   - Hausgeld fehlt → "ca. 280 €/Monat (⚠️ Regionsdurchschnitt — nicht im Exposé)"
   - Baujahr fehlt → Aus Fotos/Beschreibung schätzen, z.B. "ca. 1965 (⚠️ Regionsdurchschnitt — nicht im Exposé)"
   SCHREIBE NIEMALS nur "Im Exposé nicht angegeben" OHNE einen Wert. Es MUSS IMMER ein konkreter Zahlenwert stehen.
   Format bei fehlenden Werten: "ca. 85 €/Monat (⚠️ Regionsdurchschnitt — nicht im Exposé)"
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
   Wenn du nicht genug echte Daten findest, verwende recherchierte Regionaldurchschnitte mit "(⚠️ Regionsdurchschnitt — nicht im Exposé)".
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
- objektdaten: Adresse, Typ, Kaufpreis, Wohnfläche, Grundstück, Zimmer, Baujahr, Zustand, Heizung, Energieeffizienz, Stellplatz, Keller, Hausgeld, Provision. Werte aus dem Exposé. Wenn ein Wert fehlt: regionalen Durchschnitt recherchieren und mit "(⚠️ Regionsdurchschnitt — nicht im Exposé)" kennzeichnen.
- standortanalyse.kategorien: ÖPNV, Schulen/Kitas, Einkauf, Ärzte, Freizeit, Lärm, Sicherheit, Entwicklungsperspektive. JEDE Kategorie braucht Score 1-10 basierend auf Web-Recherche.
- finanzierung.szenarien: IMMER 3 Szenarien berechnen (Konservativ 30% EK, Standard 20% EK, Minimal 10% EK). Recherchiere aktuelle Bauzinsen per Web-Suche. IMMER konkrete Euro-Beträge korrekt durchrechnen.
- stresstest: IMMER 3 Szenarien (Zinserhöhung auf 5,5%, Sonderumlage 15.000€, Einkommensverlust 30%). Korrekt berechnen.
- kaufenVsMieten: IMMER berechnen. Vergleichsmiete per Web-Suche aus dem Mietpreisspiegel der Stadt recherchieren.
- modernisierung.items: IMMER mindestens 6 Bauteile (Heizung, Fenster, Elektrik, Bad, Dach, Fassade). Alter NUR ableiten wenn Baujahr im Exposé steht.
- gesamtkosten: Grunderwerbsteuer KORREKT je Bundesland: Bayern 3,5%, Sachsen 3,5%, BaWü 5,0%, NRW 6,5%, Berlin 6,0%, Hamburg 5,5%, Hessen 6,0%, Niedersachsen 5,0%, Brandenburg 6,5%, SH 6,5%, Bremen 5,0%, RLP 5,0%, Saarland 6,5%, Sachsen-Anhalt 5,0%, MV 6,0%, Thüringen 5,0%.
- laufendeKosten: Diese Werte stehen FAST NIE im Exposé — sie müssen IMMER berechnet/recherchiert werden:
  * Hausgeld: Aus Exposé wenn vorhanden, sonst ca. 3-4 €/m²/Monat als Durchschnitt
  * Grundsteuer: IMMER recherchieren (Hebesatz der Gemeinde × Grundsteuerwert). Wenn nicht findbar: ca. 50-120 €/Monat je nach Stadt
  * Gebäudeversicherung: ca. 200-600 €/Jahr für EFH, ca. 100-300 €/Jahr für ETW
  * Instandhaltungsrücklage: 1-1,5 €/m²/Monat (Neubau) bis 2-3 €/m²/Monat (Altbau)
  * Heizkosten: Fläche × Energiekennwert × Energiepreis berechnen. Gas: 0,10 €/kWh, Öl: 0,09 €/kWh, Wärmepumpe: 0,30 €/kWh (÷ COP 3,5)
  * Strom: ca. 35-45 €/Person/Monat
  * Wasser/Abwasser: ca. 3-4 €/m³, ca. 150-300 €/Person/Jahr
  JEDE laufende Kostenposition MUSS einen konkreten Euro-Betrag haben. NIEMALS "Im Exposé nicht angegeben" bei laufenden Kosten — diese werden IMMER berechnet.
  Wenn ein Wert nicht direkt aus dem Exposé kommt, hänge an den Wert an: "(⚠️ Regionsdurchschnitt — nicht im Exposé)"
- Maklergebühr: WICHTIG — Suche auf der Exposé-Seite EXPLIZIT nach den Wörtern "Provision", "Käuferprovision", "Maklerprovision", "Courtage", "provisionsfrei", "provisionspflichtig". Diese Information steht oft im Kleingedruckten, in einem separaten Abschnitt "Kosten" oder "Preise", oder ganz unten auf der Seite. Bei ImmoScout24 steht sie typischerweise im Bereich "Preise" oder als Fußnote z.B. "Käufer zahlt 3,57% inkl. MwSt." Regeln: (1) Wenn Provision gefunden → exakt übernehmen (z.B. "3,57%"). (2) Wenn "provisionsfrei"/"käuferprovisionsfrei" → "0%". (3) NUR wenn trotz gründlicher Suche NICHTS zur Provision steht → "3,57% (⚠️ Regionsdurchschnitt — nicht im Exposé)". NIEMALS 0% annehmen wenn die Information einfach nicht gefunden wurde — der Standard in Deutschland ist 3,57% Käuferanteil.
- energieanalyse: Daten aus Exposé bevorzugen. Wenn Energieausweis fehlt: Recherchiere typischen Verbrauch für Baujahr+Gebäudetyp und kennzeichne mit "(⚠️ Regionsdurchschnitt — nicht im Exposé)". Heizkosten IMMER berechnen: Fläche × kWh/m² × Energiepreis.
- scores: ALLE Scores müssen Zahlen zwischen 1 und 10 sein (ganzzahlig). KEIN Score darf 0 sein. Minimum ist 1. Bei fehlenden Daten mindestens 3-5 vergeben basierend auf Regionsdurchschnitt. gesamtbewertung = (lage × 0.25) + (preis_leistung × 0.25) + (zustand × 0.20) + (energie × 0.15) + (finanzierung × 0.15). Auf 1 Dezimalstelle runden.
- verhandlungstipps: MINDESTENS 6 Tipps. Jeder Tipp MUSS sich auf konkrete Daten aus der Analyse beziehen (z.B. "Heizung aus 1995 → 25.000€ Erneuerung → 7% Preisnachlass fordern"). Kategorien: Sanierungsstau, Energieklasse, Marktvergleich, fehlende Dokumente, Zeitdruck/Verhandlungsposition, versteckte Kosten.
- makleranschreiben: MUSS persönlich und objektspezifisch sein. Adresse und Exposé-Nr nennen. Mindestens 8 gezielte Fragen stellen die im Exposé fehlen. KEINE generischen Floskeln. Der Käufer soll damit direkt den Makler anschreiben können.
- Alle Felder sind Pflicht AUSSER verhandlungstipps und makleranschreiben (nur wenn vom Nutzer gewünscht). Wenn nicht gewünscht: leere Arrays/Strings.
- WICHTIG: Nutze Web-Suche um das Exposé abzurufen UND Marktdaten zu recherchieren. Suche nach der Exposé-Nummer auf ImmoScout24.
- ABSOLUTE REGEL: Erfinde KEINE konkreten Objektdaten (Kaufpreis, Adresse, Zimmeranzahl etc.). Regionale Durchschnittswerte für fehlende Daten (Energieverbrauch, Grundsteuer, Heizkosten etc.) MÜSSEN recherchiert und eingesetzt werden — das ist KEIN Erfinden, sondern PFLICHT. Kennzeichne sie mit "(⚠️ Regionsdurchschnitt — nicht im Exposé)". JEDES Feld muss einen konkreten Zahlenwert haben. NIEMALS nur "Im Exposé nicht angegeben" oder "Nicht verfügbar" ohne Zahl schreiben.
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
        "methode": "string (2-3 Sätze Beschreibung nach §15 ImmoWertV)",
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
      "ranking": "string (z.B. 'Top 10 Makler Bremen' ODER '—')",
      "fazit": "string (3-4 Sätze BERATER-TONALITÄT — narrative Einschätzung der Seriosität)",
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
- vergleichswert.vergleichsobjekte: MINDESTENS 6 echte Vergleichsobjekte aus der Umgebung recherchieren (per Web-Suche). Adresse, Kaufpreis, €/m², Abweichung zum Analyseobjekt.
- sachwert: Bodenwert mit echtem Bodenrichtwert berechnen (per Web-Suche). Gebäudewert nach NHK 2010. Alterswertminderung nach Ross-Verfahren.
- ertragswert: Jahresrohertrag aus ortsüblicher Vergleichsmiete (per Web-Suche Mietpreisspiegel). Liegenschaftszins vom Gutachterausschuss.
- standortDossier.entfernungen: MINDESTENS 12 POIs (nächste U-Bahn/S-Bahn, Bushaltestelle, Grundschule, Gymnasium, Kindergarten, Hausarzt, Zahnarzt, Supermarkt, Apotheke, Park/Grünfläche, Krankenhaus, Hauptbahnhof). Entfernungen und Fahrzeiten per Web-Suche verifizieren.
- hochwasserrisiko: Per Web-Suche "[Stadt] Hochwassergefahrenkarte" recherchieren.
- laermbelastung: Per Web-Suche "[Adresse] Lärmkarte" oder "[Stadt] Lärmkartierung" recherchieren.
- radon: Per Web-Suche "Radonkarte [Bundesland]" recherchieren.
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

🚨 OBERSTE PFLICHT — KEINE LEEREN FELDER: Der Kunde zahlt 79€. Jedes Feld in jedem Premium-Modul MUSS einen sinnvollen Wert haben — entweder echte Daten oder einen plausibilisierten Regionsdurchschnitt mit "(⚠️ Regionsdurchschnitt — nicht direkt nachweisbar)" Kennzeichnung. Leere Strings, "—" alleine ohne Kontext, oder leere Arrays sind VERBOTEN. Ausnahmen siehe unten (Persönlichkeitsrechte bei Makler-Bewertungen).

DATEN-FÜLLUNGS-HIERARCHIE (gilt für ALLE Markt-/Preis-/Renditedaten):
  1. STUFE — Echte lokale Daten aus Web-Recherche (z.B. Mietspiegel der Stadt)
  2. STUFE — Daten der nächstgrößeren vergleichbaren Stadt/Region als Proxy + Kennzeichnung "(⚠️ Proxy aus [Vergleichsstadt] — kein lokaler Mietspiegel)"
  3. STUFE — Bundesweiter/Landes-Durchschnitt für Stadttyp + Kennzeichnung "(⚠️ Regionsdurchschnitt — kein lokaler Wert ermittelbar)"
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
  STUFE 2: Wenn kein lokaler Mietspiegel → Mietspiegel der nächstgrößeren vergleichbaren Stadt im Umkreis 30km nutzen → Wert mit Hinweis kennzeichnen "10,50 €/m² (⚠️ Proxy aus Augsburg-Stadt — kein Mietspiegel für Königsbrunn verfügbar)"
  STUFE 3: Wenn auch das nicht → bundesweiter Mittelwert für Stadttyp (Großstadt/Mittelstadt/Kleinstadt/Dorf) aus aktuellen IVD-Daten → "8,20 €/m² (⚠️ Bundesschnitt für Mittelstädte 20-50k EW — kein regionaler Wert ermittelbar)"
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
  anthropicKey: string,
  isPremium: boolean = false
): Promise<AIResponse> {
  console.log('Using Claude Sonnet 4 (production mode)')

  // Premium gets more web searches for deeper research
  // (Makler-Bewertungen, Preistrend, Marktquartile, Mietspiegel, Bauzinsen, Quellen)
  const webSearchMaxUses = isPremium ? 28 : 12

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
      // Web search is a SERVER-MANAGED tool — the API handles search results automatically.
      // We do NOT need to manually handle tool_use/tool_result for web_search.
      tools: [{ type: 'web_search_20250305', name: 'web_search', max_uses: webSearchMaxUses }],
      messages: [{ role: 'user', content: userMessage }],
    }),
  })

  if (!response.ok) {
    const errBody = await response.text()
    throw new Error(`Anthropic API error: ${response.status} — ${errBody}`)
  }

  const data = await response.json()
  console.log(`Claude response: stop_reason=${data.stop_reason}, content_blocks=${data.content?.length}`)

  // Web search (server_tool_use) is handled automatically by the API.
  // The response comes back with stop_reason="end_turn" when done,
  // including all web search results already processed.
  // We only need to extract the final JSON from text blocks.
  //
  // If stop_reason is still "tool_use" it means a CLIENT tool was requested
  // (which we don't have), so we just extract whatever text we got.

  return { result: extractClaudeJson(data) }
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
    // Premium-Report stark erweitert (7 neue Module: Makler/Mietrendite/FinanzierungsDetail/Marktband/Preistrend/Besichtigungsfragen/Stärken-Schwächen + Quellen)
    const maxTokens = isPremium ? 48000 : 18000

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

        // ═══════════════════════════════════════════════════════════
        // SCRAPER: Extract listing data via Playwright before Claude
        // ═══════════════════════════════════════════════════════════
        const scraperUrl = Deno.env.get('SCRAPER_URL')
        const scraperKey = Deno.env.get('SCRAPER_API_KEY')
        let scrapedData: Record<string, unknown> | null = null

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

        // Build user message — with or without scraped data
        let userMessage: string

        if (scrapedData && (scrapedData.price || scrapedData.title)) {
          // SCRAPER SUCCESS: Claude gets structured data, only needs to search market data
          userMessage = `Analysiere diese Kaufimmobilie vollständig.

URL: ${cleanUrl}
${exposeId ? `Exposé-Nr: ${exposeId}` : ''}

EXPOSÉ-DATEN (bereits aus dem Inserat extrahiert — NICHT erneut per Web-Suche abrufen):
${JSON.stringify(scrapedData, null, 2)}

SCHRITT 1: Verwende die obigen Exposé-Daten als Grundlage. Diese Daten sind korrekt und direkt aus dem Inserat extrahiert.
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
- Wenn ein Wert in den Exposé-Daten null ist: Regionsdurchschnitt recherchieren und mit "(⚠️ Regionsdurchschnitt — nicht im Exposé)" kennzeichnen.
- NIEMALS nur "Im Exposé nicht angegeben" ohne Wert schreiben. JEDES Feld braucht eine Zahl.
- Antworte ausschließlich mit JSON.`
        } else {
          // SCRAPER FAILED: Fallback to web search (old behavior)
          console.log('Scraper unavailable — falling back to web search')
          userMessage = `Analysiere diese Kaufimmobilie vollständig.

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
- Wenn ein Exposé-spezifischer Wert fehlt (z.B. Energieausweis, Baujahr): Regionsdurchschnitt recherchieren und mit "(⚠️ Regionsdurchschnitt — nicht im Exposé)" kennzeichnen.
- NIEMALS nur "Im Exposé nicht angegeben" ohne Wert schreiben. JEDES Feld braucht eine Zahl.
- NIEMALS Zahlen erfinden — aber Durchschnittswerte recherchieren ist PFLICHT.
- Antworte ausschließlich mit JSON.`
        }

        // Call Claude Sonnet (primary) with GPT-4o fallback
        let result: unknown
        try {
          console.log('Calling Claude Sonnet 4 (primary)...')
          const claudeResult = await callClaude(systemPrompt, userMessage, maxTokens, anthropicKey, isPremium)
          result = claudeResult.result

          // Validate result completeness
          const warnings = validateResult(result as Record<string, unknown>)
          if (warnings.length > 0) {
            console.warn(`Validation warnings (${warnings.length}):`, warnings.join('; '))
          }
        } catch (claudeErr) {
          console.warn('Claude failed, falling back to GPT-4o:', claudeErr)
          try {
            const gptResult = await callOpenAI(systemPrompt, userMessage, maxTokens)
            result = gptResult.result
          } catch (gptErr) {
            console.error('GPT-4o fallback also failed:', gptErr)
            throw gptErr
          }
        }

        await supabase
          .from('analyses')
          .update({ result, status: 'completed' })
          .eq('id', analysis.id)
      } catch (err) {
        console.error(`Analysis attempt failed for ${analysis.url}:`, err)

        // Auto-retry up to 2 more times — use FULL prompt with all context
        let retrySuccess = false
        for (let retry = 1; retry <= 2; retry++) {
          console.log(`Retry ${retry}/2 for ${analysis.url}...`)
          try {
            const retryMessage = `Analysiere diese Kaufimmobilie vollständig.

URL: ${analysis.url.split('#')[0].split('?')[0]}
${analysis.url.match(/expose\/(\d+)/) ? `Exposé-Nr: ${analysis.url.match(/expose\/(\d+)/)![1]}` : ''}
${scrapedData ? `\n--- EXPOSÉ-DATEN (vom Scraper) ---\n${JSON.stringify(scrapedData, null, 2)}\n--- ENDE EXPOSÉ-DATEN ---\n` : ''}
SCHRITT 1: Rufe die URL auf und lies ALLE Exposé-Details
SCHRITT 2: Suche nach Marktdaten für die Region
SCHRITT 3: Erstelle die vollständige Analyse

Optionen:
- Makleranschreiben: ${opts.makleranschreiben ? 'ja' : 'nein'}
- Verhandlungstipps: ${opts.verhandlungstipps ? 'ja' : 'nein'}
- Risikohinweise: ${opts.risiken ? 'ja' : 'nein'}
${isPremium ? '- Premium-Report: ja' : ''}

WICHTIG: Verwende Exposé-Daten und recherchierte Regionsdurchschnitte. JEDES Feld braucht einen Wert. Antworte mit JSON.`

            // Retry: try Claude first, then GPT-4o
            let retryResult: unknown
            try {
              retryResult = (await callClaude(systemPrompt, retryMessage, maxTokens, anthropicKey, isPremium)).result
            } catch {
              console.warn(`Retry ${retry}: Claude failed, trying GPT-4o...`)
              retryResult = (await callOpenAI(systemPrompt, retryMessage, maxTokens)).result
            }

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
                  <div style="font-size:12px;">
                    <a href="${cleanUrl}" style="color:#888;text-decoration:none;">
                      📎 Originalinserat: ${cleanUrl}
                    </a>
                  </div>
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
