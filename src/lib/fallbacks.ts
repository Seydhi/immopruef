import type {
  AnalysisResult,
  Objektdaten,
  KaufenVsMieten,
  Vermoegensvergleich,
  Wertermittlung,
  MaklerProfil,
} from './types'

// ════════════════════════════════════════════════════════════════════
// FALLBACKS — Deterministische Schätzungen für Premium-Felder
//
// Wird clientseitig angewendet, wenn der Server "nicht verfügbar"/
// "nicht berechenbar" zurückgibt. Alle Schätzungen nutzen reale
// Kaufpreis-, Flächen-, Baujahr- und Regionaldaten und werden mit
// einem klaren "Schätzung"-Label ausgeliefert.
// ════════════════════════════════════════════════════════════════════

// ─── Erkennung: Platzhalter statt Wert ───
const UNAVAILABLE_RE = /nicht verf[üu]gbar|nicht berechenbar|nicht erkennbar|nicht bestimmbar|k\.? *a\.?|^—$|^-$|^n\/a$/i

export function isUnavailable(value: string | undefined | null): boolean {
  if (!value) return true
  const trimmed = String(value).trim()
  if (!trimmed) return true
  return UNAVAILABLE_RE.test(trimmed)
}

// ─── Parser: Rohzahl aus "€/m²/etc."-String ───
function parseNumber(value: string | undefined | null): number | null {
  if (!value) return null
  // "75.000 €" → "75000", "56 m²" → "56", "3,5%" → "3.5"
  const cleaned = String(value)
    .replace(/[^0-9.,\-]/g, '')
    .replace(/\.(?=\d{3}(?:\D|$))/g, '') // thousand-separator "." entfernen
    .replace(',', '.')
  const num = parseFloat(cleaned)
  return isNaN(num) ? null : num
}

function fmtEuro(n: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n)
}

function fmtEuroM2(n: number): string {
  return `${Math.round(n).toLocaleString('de-DE')} €/m²`
}

// ─── Objektdaten-Extraktion ───
export interface ParsedObjekt {
  kaufpreis: number | null
  wohnflaeche: number | null
  grundstueck: number | null
  zimmer: number | null
  baujahr: number | null
  stadt: string | null
  bundesland: string | null
  zustand: string | null
  effizienzklasse: string | null
  heizungstyp: string | null
  objektart: string | null
}

function findValue(objektdaten: Objektdaten[], patterns: RegExp[]): string | null {
  for (const od of objektdaten || []) {
    for (const pat of patterns) {
      if (pat.test(od.merkmal)) return od.wert
    }
  }
  return null
}

export function parseObjektdaten(result: AnalysisResult): ParsedObjekt {
  const od = result.objektdaten || []
  const kaufpreisStr = findValue(od, [/kaufpreis/i, /preis/i]) || result.gesamtkosten?.kaufpreis || null
  const wohnflaecheStr = findValue(od, [/wohnfl[äa]che/i, /^fl[äa]che$/i])
  const grundstueckStr = findValue(od, [/grundst[üu]ck/i])
  const zimmerStr = findValue(od, [/zimmer/i])
  const baujahrStr = findValue(od, [/baujahr/i])
  const stadtStr = findValue(od, [/stadt/i, /ort/i, /lage/i, /adresse/i])
  const zustand = findValue(od, [/zustand/i, /objektzustand/i])
  const effizienzklasse = findValue(od, [/effizienz/i, /energie/i]) || result.energieanalyse?.effizienzklasse || null
  const heizungstyp = findValue(od, [/heizung/i]) || result.energieanalyse?.heizungstyp || null
  const objektart = findValue(od, [/objektart/i, /typ/i, /immobilientyp/i])

  // Bundesland heuristisch
  const bundesland = stadtStr ? detectBundesland(stadtStr) : null

  return {
    kaufpreis: parseNumber(kaufpreisStr),
    wohnflaeche: parseNumber(wohnflaecheStr),
    grundstueck: parseNumber(grundstueckStr),
    zimmer: parseNumber(zimmerStr),
    baujahr: parseNumber(baujahrStr),
    stadt: stadtStr ? stadtStr.split(',')[0].trim() : null,
    bundesland,
    zustand,
    effizienzklasse,
    heizungstyp,
    objektart,
  }
}

// ─── Regionale Konstanten ───
const STADT_MIETE_M2: Record<string, number> = {
  München: 22, Muenchen: 22, Stuttgart: 16, Frankfurt: 17, Hamburg: 15, Berlin: 14, Köln: 14, Koeln: 14,
  Düsseldorf: 14, Duesseldorf: 14, Bonn: 13, Freiburg: 15, Heidelberg: 15, Mainz: 13, Wiesbaden: 13,
  Nürnberg: 12, Nuernberg: 12, Karlsruhe: 12, Leipzig: 10, Dresden: 10, Hannover: 11, Bremen: 10,
  Bremerhaven: 7, Duisburg: 8, Gelsenkirchen: 7, Essen: 9, Dortmund: 9, Bochum: 8, Kiel: 10,
  Lübeck: 10, Luebeck: 10, Rostock: 9, Magdeburg: 8, Halle: 8, Chemnitz: 7, Erfurt: 9, Wuppertal: 9,
  Saarbrücken: 9, Saarbruecken: 9, Mönchengladbach: 9, Moenchengladbach: 9,
}

const BUNDESLAND_MIETE_M2: Record<string, number> = {
  Bayern: 13, Hessen: 12, 'Baden-Württemberg': 12, 'Baden-Wuerttemberg': 12, Hamburg: 15, Berlin: 14,
  'Nordrhein-Westfalen': 10, 'Rheinland-Pfalz': 10, 'Schleswig-Holstein': 10, Bremen: 9, Niedersachsen: 9,
  Saarland: 9, Thüringen: 8, Thueringen: 8, Sachsen: 8, Brandenburg: 9, 'Sachsen-Anhalt': 7,
  'Mecklenburg-Vorpommern': 8,
}

function detectBundesland(ortsbezeichnung: string): string | null {
  const s = ortsbezeichnung.toLowerCase()
  // grobe Heuristik über bekannte Städte
  if (/münchen|nürnberg|augsburg|regensburg|würzburg|ingolstadt|erlangen|fürth/.test(s)) return 'Bayern'
  if (/stuttgart|karlsruhe|mannheim|heidelberg|freiburg|ulm|heilbronn|pforzheim|tübingen/.test(s)) return 'Baden-Württemberg'
  if (/hamburg/.test(s)) return 'Hamburg'
  if (/berlin/.test(s)) return 'Berlin'
  if (/bremen|bremerhaven/.test(s)) return 'Bremen'
  if (/köln|düsseldorf|dortmund|essen|duisburg|bochum|wuppertal|bielefeld|münster|mönchengladbach|aachen|bonn|gelsenkirchen|krefeld|solingen|herne|leverkusen|oberhausen|hagen|hamm/.test(s)) return 'Nordrhein-Westfalen'
  if (/frankfurt|wiesbaden|kassel|darmstadt|offenbach|hanau|gießen|marburg|fulda/.test(s)) return 'Hessen'
  if (/mainz|ludwigshafen|koblenz|trier|kaiserslautern/.test(s)) return 'Rheinland-Pfalz'
  if (/hannover|braunschweig|oldenburg|osnabrück|göttingen|wolfsburg/.test(s)) return 'Niedersachsen'
  if (/kiel|lübeck|flensburg|neumünster/.test(s)) return 'Schleswig-Holstein'
  if (/rostock|schwerin|stralsund|greifswald/.test(s)) return 'Mecklenburg-Vorpommern'
  if (/leipzig|dresden|chemnitz|zwickau/.test(s)) return 'Sachsen'
  if (/halle|magdeburg|dessau/.test(s)) return 'Sachsen-Anhalt'
  if (/erfurt|jena|weimar|gera/.test(s)) return 'Thüringen'
  if (/potsdam|cottbus|brandenburg/.test(s)) return 'Brandenburg'
  if (/saarbrücken|saarland/.test(s)) return 'Saarland'
  return null
}

function regionMietpreis(p: ParsedObjekt): number {
  if (p.stadt) {
    const key = Object.keys(STADT_MIETE_M2).find(k => new RegExp(k, 'i').test(p.stadt!))
    if (key) return STADT_MIETE_M2[key]
  }
  if (p.bundesland && BUNDESLAND_MIETE_M2[p.bundesland]) return BUNDESLAND_MIETE_M2[p.bundesland]
  return 9 // bundesweiter Mittelwert als Default
}

// ─── Sanierungskosten-Schätzung ───
export function estimateSanierung(p: ParsedObjekt): { wert: string; label: string } | null {
  if (!p.wohnflaeche) return null
  const baujahr = p.baujahr ?? 1980
  const zustand = (p.zustand || '').toLowerCase()

  let eurProM2 = 0
  if (/neu|neubau|kernsaniert|vollst[äa]ndig saniert|sehr gut/i.test(zustand)) {
    eurProM2 = 50
  } else if (/gepflegt|gut|modernisiert/i.test(zustand)) {
    eurProM2 = 200
  } else if (/mittel|solide|teilsaniert|bezugsfertig/i.test(zustand)) {
    eurProM2 = 400
  } else if (/renovierungsbed[üu]rftig|modernisierungsbed[üu]rftig|sanierungsbed[üu]rftig/i.test(zustand)) {
    eurProM2 = 700
  } else if (/stark sanierungsbed[üu]rftig|entkernt|abrissreif|kritisch/i.test(zustand)) {
    eurProM2 = 1000
  } else {
    eurProM2 = 300 // unbekannter Zustand → Mittelwert
  }

  // Altersaufschlag: vor 1990 ohne "saniert"-Hinweis → +150 €/m²
  if (baujahr < 1990 && !/saniert|modernisiert|neu/i.test(zustand)) {
    eurProM2 += 150
  }
  if (baujahr < 1970 && !/saniert|modernisiert/i.test(zustand)) {
    eurProM2 += 100
  }

  const gesamt = Math.round(p.wohnflaeche * eurProM2)
  return {
    wert: `${fmtEuro(gesamt)} (ca. ${eurProM2} €/m²)`,
    label: 'Schätzung (regional/Baujahr/Zustand)',
  }
}

// ─── Kaufen vs Mieten (20 Jahre) ───
export function estimateKaufenVsMieten(p: ParsedObjekt): KaufenVsMieten | null {
  if (!p.kaufpreis || !p.wohnflaeche) return null
  const kp = p.kaufpreis
  const flaeche = p.wohnflaeche
  const mietpreisM2 = regionMietpreis(p)

  // Mieten: Kaltmiete × 12 × 20 mit 2% Mietsteigerung → Faktor ≈ 24,3 Jahre
  const kaltmiete = Math.round(flaeche * mietpreisM2)
  const mieteFactor20 = 12 * ((Math.pow(1.02, 20) - 1) / 0.02) // Annuitätenfaktor bei 2% Steigerung ≈ 292 Monate
  const kostenMiete20 = Math.round(kaltmiete * mieteFactor20)

  // Kaufen: 10% EK, 90% Darlehen @ 3,8% Zins + 2% Tilgung = 5,8% Annuität p.a.
  const ekQuote = 0.1
  const nebenkostenQuote = 0.105 // 10,5% Grunderwerbs/Notar/Grundbuch/Makler (Deutschland Schnitt)
  const zinsTilgung = 0.058
  const ek = Math.round(kp * ekQuote)
  const darlehen = kp * (1 - ekQuote)
  const annuitaet20 = Math.round(darlehen * zinsTilgung * 20)
  const nebenkosten = Math.round(kp * nebenkostenQuote)
  const laufendeKostenM2Monat = 3 // Hausgeld/Instandhaltung/Grundsteuer
  const laufendeKosten20 = Math.round(laufendeKostenM2Monat * flaeche * 12 * 20)
  const kostenKauf20 = ek + annuitaet20 + nebenkosten + laufendeKosten20

  const vorteil: 'kaufen' | 'mieten' = kostenKauf20 < kostenMiete20 ? 'kaufen' : 'mieten'
  const differenz = Math.abs(kostenKauf20 - kostenMiete20)

  return {
    mpiMieteMonat: fmtEuro(kaltmiete),
    kostenMiete20Jahre: fmtEuro(kostenMiete20),
    kostenKauf20Jahre: fmtEuro(kostenKauf20),
    vorteil,
    differenz: `Schätzung: ${vorteil === 'kaufen' ? 'Kaufen' : 'Mieten'} ca. ${fmtEuro(differenz)} günstiger über 20 Jahre (regionaler Mietpreis ${mietpreisM2} €/m²). Enthält Kaufnebenkosten, Finanzierung 90% @ 3,8% Zins/2% Tilgung, Hausgeld/Instandhaltung und 2% Mietsteigerung p.a.`,
  }
}

// ─── Vermögensvergleich (30 Jahre) ───
export function estimateVermoegensvergleich(p: ParsedObjekt): Vermoegensvergleich | null {
  if (!p.kaufpreis) return null
  const kp = p.kaufpreis
  const ekQuote = 0.1
  const ek = kp * ekQuote
  const immoWertsteigerung = 0.02 // 2% p.a.
  const etfRendite = 0.07 // 7% p.a.
  const zins = 0.038
  const tilgung = 0.02
  const darlehen = kp * (1 - ekQuote)
  const annuitaetMonat = (darlehen * (zins + tilgung)) / 12

  // Monatliche Miete zum Vergleich
  const flaeche = p.wohnflaeche || 80
  const kaltmieteMonat = flaeche * regionMietpreis(p)
  const sparDifferenzMonat = Math.max(0, annuitaetMonat - kaltmieteMonat)

  const jahre = [0, 5, 10, 15, 20, 25, 30]
  const vermoegenKauf: string[] = []
  const vermoegenMieteEtf: string[] = []
  let breakEven = 0

  for (const j of jahre) {
    // Immo: Marktwert × Wertsteigerung minus Restschuld nach j Jahren (grob lineare Tilgung angenommen)
    const immoMarktwert = kp * Math.pow(1 + immoWertsteigerung, j)
    const getilgt = (darlehen * tilgung) * j // linear ohne Zinseszins (vereinfacht)
    const restschuld = Math.max(0, darlehen - getilgt)
    const immoVermoegen = immoMarktwert - restschuld

    // ETF: EK × 1.07^j + monatliche Sparrate (Differenz) × Zukunftsfaktor
    const ekKapital = ek * Math.pow(1 + etfRendite, j)
    const sparRateKapital = j === 0 ? 0 : sparDifferenzMonat * 12 * ((Math.pow(1 + etfRendite, j) - 1) / etfRendite)
    const etfVermoegen = ekKapital + sparRateKapital

    vermoegenKauf.push(fmtEuro(Math.round(immoVermoegen)))
    vermoegenMieteEtf.push(fmtEuro(Math.round(etfVermoegen)))

    if (breakEven === 0 && j > 0 && immoVermoegen > etfVermoegen) {
      breakEven = j
    }
  }

  return {
    jahre,
    vermoegenKauf,
    vermoegenMieteEtf,
    breakEvenJahr: breakEven,
  }
}

// ─── Wertermittlung (Vergleichs-, Sach-, Ertragswert) ───
export function estimateWertermittlung(p: ParsedObjekt): Wertermittlung | null {
  if (!p.kaufpreis || !p.wohnflaeche) return null
  const kp = p.kaufpreis
  const flaeche = p.wohnflaeche
  const baujahr = p.baujahr ?? 1980
  const jetzt = new Date().getFullYear()
  const alter = Math.max(0, jetzt - baujahr)
  const preisProM2 = kp / flaeche

  // Vergleichswert: KP ± 15% Spanne, 3 Dummy-Vergleichsobjekte relativ zum KP
  const vergleichswert = kp // Annahme: Angebotspreis repräsentiert die Vergleichslage
  const vergleichsobjekte = [
    { abweichung: '-8%', faktor: 0.92 },
    { abweichung: '+3%', faktor: 1.03 },
    { abweichung: '+6%', faktor: 1.06 },
  ].map((obj, i) => ({
    adresse: `Vergleichsobjekt ${i + 1} (${p.stadt || 'Region'}, ähnl. Größe/Baujahr)`,
    preis: fmtEuro(Math.round(kp * obj.faktor)),
    qm: fmtEuroM2(preisProM2 * obj.faktor),
    abweichung: obj.abweichung,
  }))

  // Sachwert: Bodenwert + Gebäudewert (NHK) − Alterswertminderung
  // Eigentumswohnung: Bodenanteil ca. 20-30% des KP
  const isWohnung = /wohnung|etw|apartment/i.test(p.objektart || '')
  const bodenAnteilQuote = isWohnung ? 0.22 : 0.35
  const bodenwert = Math.round(kp * bodenAnteilQuote)
  const nhkProM2 = 1800 // Normalherstellungskosten 2010 grob, ohne Index
  const gebaeudewertNeuwert = Math.round(nhkProM2 * flaeche)
  const lebensdauer = 80
  const alterswertminderungQuote = Math.min(0.7, alter / lebensdauer)
  const alterswertminderung = Math.round(gebaeudewertNeuwert * alterswertminderungQuote)
  const sachwert = Math.max(0, bodenwert + gebaeudewertNeuwert - alterswertminderung)

  // Ertragswert: Jahresrohertrag × (Liegenschaftszinsfaktor)
  const mietpreisM2 = regionMietpreis(p)
  const jahresrohertrag = Math.round(flaeche * mietpreisM2 * 12)
  const bewirtschaftungskosten = Math.round(jahresrohertrag * 0.25)
  const reinertrag = jahresrohertrag - bewirtschaftungskosten
  const liegenschaftszins = 0.04 // 4% typisch Wohnimmobilie Deutschland
  const ertragswert = Math.round(reinertrag / liegenschaftszins)

  // Fazit: Spanne aus niedrigstem und höchstem der 3 Werte
  const werte = [vergleichswert, sachwert, ertragswert].filter(v => v > 0)
  const min = Math.min(...werte)
  const max = Math.max(...werte)
  const median = werte.sort((a, b) => a - b)[Math.floor(werte.length / 2)]

  let einschaetzung: string
  if (kp > max * 1.05) {
    einschaetzung = `Schätzung: Der Angebotspreis liegt oberhalb aller drei Verfahren — Verhandlungsspielraum prüfen. Empfohlener Kaufpreis orientiert sich am Median.`
  } else if (kp < min * 0.95) {
    einschaetzung = `Schätzung: Der Angebotspreis liegt unterhalb aller drei Verfahren — auffällig günstig. Zustand und Unterlagen besonders sorgfältig prüfen.`
  } else {
    einschaetzung = `Schätzung: Der Angebotspreis liegt im Rahmen der drei Verfahren. Der Median ist ein guter Verhandlungsanker.`
  }

  return {
    vergleichswert: {
      wert: fmtEuro(vergleichswert),
      methode: `Orientierung am Angebotspreis ± regionale Spanne (${p.stadt || 'Region'}). Schätzung ohne Zugriff auf aktuelle Gutachterausschuss-Daten.`,
      vergleichsobjekte,
    },
    sachwert: {
      bodenwert: fmtEuro(bodenwert),
      gebaeudewert: fmtEuro(gebaeudewertNeuwert),
      alterswertminderung: `− ${fmtEuro(alterswertminderung)} (${Math.round(alterswertminderungQuote * 100)}% bei Alter ${alter} J.)`,
      sachwert: fmtEuro(sachwert),
    },
    ertragswert: {
      jahresrohertrag: `${fmtEuro(jahresrohertrag)} (${mietpreisM2} €/m²)`,
      bewirtschaftungskosten: `${fmtEuro(bewirtschaftungskosten)} (25% Pauschale)`,
      reinertrag: fmtEuro(reinertrag),
      liegenschaftszins: '4,0% (Wohnimmobilie Standard)',
      ertragswert: fmtEuro(ertragswert),
    },
    fazit: {
      marktwertSpanne: `${fmtEuro(min)} – ${fmtEuro(max)}`,
      empfohlenerKaufpreis: fmtEuro(median),
      einschaetzung,
    },
  }
}

// ─── Makler-Erkennung aus Zusammenfassung/Makleranschreiben ───
export function estimateMaklerProfil(result: AnalysisResult): MaklerProfil | null {
  // Signal-Pool: alle Texte mit Hinweisen auf Verkäufer
  const text = [
    result.zusammenfassung || '',
    result.makleranschreiben || '',
    ...(result.objektdaten || []).map(o => `${o.merkmal}: ${o.wert}`),
  ].join('\n')

  const lower = text.toLowerCase()

  // Privatverkauf-Indikatoren
  const privat = /privatverkauf|privatanbieter|von privat|ohne makler|provisionsfrei für käufer/i.test(lower)

  // Makler-Indikatoren
  const gewerblich = /immobilien\s?(gmbh|ag|kg|ug|e\.k\.)|immobilienmakler|makler(büro|gesellschaft)?|engel\s*&\s*völkers|von poll|remax|century\s*21/i.test(lower)

  if (privat) {
    return {
      name: 'Privatverkauf',
      art: 'privatverkauf',
      gegruendet: '—',
      mitarbeiter: '—',
      qualifikation: '—',
      sitz: '—',
      ansprechpartner: 'Eigentümer direkt',
      bewertungen: [],
      ranking: '—',
      fazit: 'Schätzung: Privatverkauf erkannt. Kein Maklerprofil anwendbar. Vorteil: keine Maklerprovision, direkter Kontakt zum Eigentümer. Nachteil: Unterlagen und Kaufvertrag selbst organisieren. Lassen Sie den Kaufvertrag vor Notarbestellung durch einen Anwalt prüfen.',
      redFlags: ['Keine Auffälligkeiten — Privatverkauf üblich'],
    }
  }

  if (gewerblich) {
    // Versuche Maklernamen aus Anschreiben/Zusammenfassung zu ziehen
    const match = text.match(/([A-ZÄÖÜ][A-Za-zÄÖÜäöüß\s&\-.]{3,40}(?:Immobilien|Makler|GmbH|AG|KG))/)
    const name = match ? match[1].trim() : 'Gewerblicher Anbieter'

    return {
      name,
      art: 'gewerblich',
      gegruendet: 'Nicht öffentlich recherchiert',
      mitarbeiter: 'Nicht öffentlich recherchiert',
      qualifikation: 'Nicht öffentlich recherchiert',
      sitz: 'Nicht öffentlich recherchiert',
      ansprechpartner: 'Siehe Exposé',
      bewertungen: [],
      ranking: '—',
      fazit: `Schätzung: Gewerblicher Makler "${name}" im Exposé erkannt. Für eine vollständige Seriositätsprüfung (Bewertungen, Registereintrag, Mitarbeiterzahl) empfehlen wir eine manuelle Recherche auf ImmoScout24-Profil, JACASA, Google und ProvenExpert. Achten Sie auf: Gewerbeerlaubnis §34c GewO, öffentliche Bewertungen, transparente Kontaktdaten.`,
      redFlags: ['Manuelle Seriositätsprüfung empfohlen'],
    }
  }

  // Unklar: trotzdem Fallback-Profil liefern statt null
  return {
    name: 'Anbieter nicht eindeutig identifizierbar',
    art: 'unbekannt',
    gegruendet: '—',
    mitarbeiter: '—',
    qualifikation: '—',
    sitz: '—',
    ansprechpartner: 'Siehe Exposé',
    bewertungen: [],
    ranking: '—',
    fazit: 'Schätzung: Aus dem Exposé ließ sich nicht eindeutig erkennen, ob es sich um einen Makler oder Privatanbieter handelt. Fragen Sie dies vor einer Besichtigungsanfrage gezielt nach — bei Maklern haben Sie Anspruch auf ein schriftliches Exposé (§2 WoVermRG) und ein Nachweis der Gewerbeerlaubnis §34c GewO.',
    redFlags: ['Anbieterart nicht eindeutig — vor Kontaktaufnahme klären'],
  }
}
