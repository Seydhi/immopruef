// ─── Objektdaten ───
export interface Objektdaten {
  merkmal: string
  wert: string
}

// ─── 1. Preisbewertung ───
export interface Preisbewertung {
  preisProQm: string
  regionalerDurchschnitt: string
  abweichung: string
  ampel: 'guenstig' | 'fair' | 'teuer'
  kaufpreismieteVerhaeltnis: string
  kaufpreismieteEinschaetzung: string
  bodenrichtwert: string
  preisentwicklung5Jahre: string
  preisprognose5Jahre: string
}

// ─── 2. Gesamtkosten ───
export interface Kaufnebenkosten {
  grunderwerbsteuer: { satz: string; betrag: string }
  notar: { satz: string; betrag: string }
  grundbuch: { satz: string; betrag: string }
  makler: { satz: string; betrag: string }
  gesamt: string
}

export interface LaufendeKosten {
  position: string
  betragMonat: string
  betragJahr: string
}

export interface Gesamtkosten {
  kaufpreis: string
  kaufnebenkosten: Kaufnebenkosten
  geschaetzteSanierung: string
  gesamtinvestition: string
  laufendeKosten: LaufendeKosten[]
  laufendeKostenGesamt: { monat: string; jahr: string }
}

// ─── 3. Energieanalyse ───
export interface Energieanalyse {
  effizienzklasse: string
  endenergiebedarf: string
  heizkostenJahr: string
  heizungstyp: string
  heizungsalter: string
  gegPflicht: { besteht: boolean; details: string }
  sanierungsoptionen: {
    massnahme: string
    kosten: string
    ersparnis: string
    foerderung: string
  }[]
  foerdermittelGesamt: string
}

// ─── 4. Modernisierungs-Check ───
export interface ModernisierungsItem {
  bauteil: string
  geschaetztesAlter: string
  lebensdauer: string
  zustand: 'gut' | 'mittel' | 'kritisch'
  geschaetzteKosten: string
  faelligIn: string
}

export interface Modernisierung {
  sanierungsstauGesamt: string
  items: ModernisierungsItem[]
  timeline: { zeitraum: string; massnahmen: string; kosten: string }[]
}

// ─── 5. Standortanalyse (erweitert) ───
export interface StandortKategorie {
  kategorie: string
  bewertung: string
  score: number
  details: string
  icon?: string
}

export interface StandortDemografie {
  bevoelkerungsentwicklung: string
  trend: 'wachsend' | 'stabil' | 'schrumpfend'
  altersstruktur: string
  kaufkraftindex: string
}

export interface StandortWirtschaft {
  arbeitslosenquote: string
  topArbeitgeber: string[]
  branchenstruktur: string
}

export interface StandortInfrastruktur {
  breitband: string
  breitbandTyp: string
  mobilfunk: string
}

export interface StandortanalyseErweitert {
  kategorien: StandortKategorie[]
  demografie: StandortDemografie
  wirtschaft: StandortWirtschaft
  infrastruktur: StandortInfrastruktur
  gesamtScore: number
}

// ─── 6. Risikobewertung ───
export interface RisikoItem {
  kategorie: string
  risiko: 'niedrig' | 'mittel' | 'hoch'
  details: string
  handlungsempfehlung: string
}

export interface Risikobewertung {
  gesamtrisiko: 'niedrig' | 'mittel' | 'hoch'
  items: RisikoItem[]
  redFlags: string[]
}

// ─── 7. Finanzierung ───
export interface FinanzierungsSzenario {
  name: string
  eigenkapital: string
  darlehenssumme: string
  zinssatz: string
  tilgung: string
  monatlicheRate: string
  restschuld10Jahre: string
  gesamtlaufzeit: string
}

export interface KaufenVsMieten {
  mpiMieteMonat: string
  kostenMiete20Jahre: string
  kostenKauf20Jahre: string
  vorteil: 'kaufen' | 'mieten'
  differenz: string
}

export interface Finanzierung {
  szenarien: FinanzierungsSzenario[]
  empfohleneEigenkapitalquote: string
  kaufenVsMieten: KaufenVsMieten
  stresstest: {
    szenario: string
    monatlicheRate: string
    bewertung: 'tragbar' | 'grenzwertig' | 'kritisch'
  }[]
}

// ─── Scores ───
export interface Scores {
  gesamtbewertung: number
  lage: number
  preis_leistung: number
  zustand: number
  energie: number
  finanzierung: number
}

// ─── Options ───
export interface AnalysisOptions {
  makleranschreiben: boolean
  verhandlungstipps: boolean
  risiken: boolean
}

// ─── Marktdaten (legacy compat) ───
export interface Marktdaten {
  kennzahl: string
  wert: string
  einschaetzung: 'gut' | 'mittel' | 'schlecht'
}

// ─── Standortanalyse (legacy compat) ───
export interface Standortanalyse {
  kategorie: string
  bewertung: string
  details: string
}

// ─── Quellen / Sources (alle Pakete) ───
export interface Quelle {
  titel: string
  url: string
  kategorie: string  // z.B. "Preisdaten", "Lage", "Energie", "Makler-Bewertungen"
}

// ─── Full Analysis Result ───
export interface AnalysisResult {
  // Core
  objektdaten: Objektdaten[]
  scores: Scores
  zusammenfassung: string

  // 1. Preisbewertung
  preisbewertung: Preisbewertung

  // 2. Gesamtkosten
  gesamtkosten: Gesamtkosten

  // 3. Energie
  energieanalyse: Energieanalyse

  // 4. Modernisierung
  modernisierung: Modernisierung

  // 5. Standort (erweitert)
  standortanalyse: StandortanalyseErweitert

  // 6. Risiko
  risikobewertung: Risikobewertung

  // 7. Finanzierung
  finanzierung: Finanzierung

  // 8. Dokumente
  verhandlungstipps: string[]
  makleranschreiben: string

  // 9. Quellen (alle Pakete)
  quellen?: Quelle[]

  // Premium-only
  premiumReport?: PremiumReport

  // Legacy compat
  marktdaten: Marktdaten[]
  risiken: string[]
}

// ─── Premium Report ───
export interface Wertermittlung {
  vergleichswert: { wert: string; methode: string; vergleichsobjekte: { adresse: string; preis: string; qm: string; abweichung: string }[] }
  sachwert: { bodenwert: string; gebaeudewert: string; alterswertminderung: string; sachwert: string }
  ertragswert: { jahresrohertrag: string; bewirtschaftungskosten: string; reinertrag: string; liegenschaftszins: string; ertragswert: string }
  fazit: { marktwertSpanne: string; empfohlenerKaufpreis: string; einschaetzung: string }
}

export interface StandortDossier {
  entfernungen: { ziel: string; entfernung: string; fahrzeit: string }[]
  hochwasserrisiko: { zone: string; details: string; risiko: 'niedrig' | 'mittel' | 'hoch' }
  laermbelastung: { tags: string; nachts: string; quelle: string; bewertung: string }
  radon: { wert: string; risiko: 'niedrig' | 'mittel' | 'hoch' }
  bebauungsplan: { nutzung: string; gfz: string; grz: string; besonderheiten: string }
  sozialstruktur: { beschreibung: string; milieuschutz: boolean; vorkaufsrecht: boolean }
}

export interface Vermoegensvergleich {
  jahre: number[]
  vermoegenKauf: string[]
  vermoegenMieteEtf: string[]
  breakEvenJahr: number
}

export interface VorKaufCheckliste {
  kategorie: string
  items: { text: string; wichtigkeit: 'muss' | 'soll' | 'kann'; erledigt: boolean }[]
}

// ─── Stufe 1 Premium-Module ───
export interface MaklerProfil {
  name: string
  art: 'gewerblich' | 'privatverkauf' | 'unbekannt'
  gegruendet: string                  // z.B. "1995" oder "Nicht öffentlich verfügbar"
  mitarbeiter: string                 // z.B. "9" oder "Nicht öffentlich"
  qualifikation: string               // z.B. "Immobilienkaufleute IHK"
  sitz: string                        // Adresse oder "Nicht angegeben"
  ansprechpartner: string             // Name oder "Nicht im Exposé"
  bewertungen: {
    plattform: string                 // "ImmoScout24", "JACASA", "Google", "ProvenExpert"
    score: string                     // "4,8/5" oder "—"
    anzahl: string                    // "9 Bewertungen" oder "Keine"
  }[]
  ranking: string                     // z.B. "Top 10 Makler in Bremerhaven" oder "—"
  fazit: string                       // Berater-Style Einschätzung
  redFlags: string[]                  // Liste oder ["Keine Auffälligkeiten"]
}

export interface Mietrendite {
  verfuegbar: boolean                 // false → Fallback-Anzeige
  fallbackHinweis?: string            // wenn verfuegbar=false
  ortsuebliche_kaltmiete: string      // "9,16 €/m²" oder "—"
  jahresrohertrag: string             // "12.636 €/Jahr"
  bruttorendite: string               // "5,16%"
  bewirtschaftungskosten: string      // "25% (3.159 €/Jahr)"
  nettomietertrag: string             // "9.477 €/Jahr"
  nettorendite: string                // "3,87%"
  benchmark: string                   // Berater-Einschätzung
  hinweis: string                     // z.B. "B-Lage Norddeutschland: Bruttorendite 4-5% gilt als solide"
}

export interface FinanzierungsDetail {
  cashflow: {
    eigenkapitalQuote: string         // "10%", "20%", "30%"
    eigenkapitalBetrag: string
    darlehen: string
    zinssatz: string
    tilgung: string
    monatlicheRate: string
    restschuld10Jahre: string
    gesamtbelastung10Jahre: string
    bewertung: 'tragbar' | 'grenzwertig' | 'kritisch'
  }[]
  empfehlung: string                  // Berater-Style Handlungsempfehlung
  beispielTilgungsplan: {
    jahr: number
    restschuld: string
    bisherZinsen: string
    bisherTilgung: string
  }[]
}

// ─── Stufe 2 Premium-Module ───
export interface Marktband {
  einheit: string                     // "€/m²"
  guenstig: { wert: string; label: string }
  durchschnittLow: { wert: string; label: string }
  durchschnittHigh: { wert: string; label: string }
  top: { wert: string; label: string }
  diesesObjekt: { wert: string; positionProzent: number; einordnung: string }
  einschaetzung: string               // Berater-Kommentar
}

export interface PreistrendHistorisch {
  einheit: string                     // "€/m²"
  zeitreihe: { jahr: string; wert: string; wertNum: number }[]  // wertNum für Chart-Skalierung
  trend: 'steigend' | 'stabil' | 'fallend'
  veraenderungProzent: string         // "+3,1% YoY"
  prognoseHinweis: string             // Berater-Kommentar zur Entwicklung
}

export interface BesichtigungsFrage {
  frage: string
  begruendung: string                 // WARUM diese Frage wichtig ist (kontextualisiert)
  prioritaet: 'kritisch' | 'wichtig' | 'optional'
  bezugZumObjekt: string              // z.B. "Baujahr 1982 - Asbest-Risiko"
}

export interface BesichtigungsFragenSpezifisch {
  fragenProThema: {
    thema: string                     // "Heizung & Energie", "Bausubstanz", etc.
    fragen: BesichtigungsFrage[]
  }[]
}

export interface StaerkeSchwaeche {
  punkt: string                       // kurze Aussage z.B. "Reihenendhaus = nur ein Nachbar"
  begruendung: string                 // WARUM ist das eine Stärke/Schwäche
  einfluss: 'hoch' | 'mittel' | 'niedrig'
}

export interface StaerkenSchwaechenNarrativ {
  staerken: StaerkeSchwaeche[]
  schwaechen: StaerkeSchwaeche[]
  empfehlung: string                  // Berater-Handlungsempfehlung mit Tonalität
}

export interface PremiumReport {
  reportDatum: string
  reportNummer: string

  // Bestehend
  wertermittlung: Wertermittlung
  standortDossier: StandortDossier
  vermoegensvergleich: Vermoegensvergleich
  vorKaufCheckliste: VorKaufCheckliste[]
  steuerlicheAspekte: { aspekt: string; details: string; vorteil: string }[]
  gutachterEmpfehlung: { empfohlen: boolean; grund: string; geschaetzteKosten: string }

  // Stufe 1 (neu)
  maklerProfil?: MaklerProfil
  mietrendite?: Mietrendite
  finanzierungsDetail?: FinanzierungsDetail

  // Stufe 2 (neu)
  marktband?: Marktband
  preistrendHistorisch?: PreistrendHistorisch
  besichtigungsFragenSpezifisch?: BesichtigungsFragenSpezifisch
  staerkenSchwaechenNarrativ?: StaerkenSchwaechenNarrativ
}

// ─── Analysis & Order ───
export interface Analysis {
  id: string
  token: string
  url: string
  options: AnalysisOptions
  status: 'pending' | 'processing' | 'completed' | 'failed'
  result: AnalysisResult | null
  created_at: string
}

export interface OrderResult {
  order_status: 'pending' | 'paid' | 'processing' | 'completed' | 'failed'
  analyses: Analysis[]
}

export type Package = 'single' | 'double' | 'triple' | 'premium'

export interface PackageConfig {
  urls: number
  price: string
  priceNum: number
  perUnit: string
  saving: string | null
  label: string
  description: string
  isPremium?: boolean
}

export const PACKAGE_CONFIG: Record<Package, PackageConfig> = {
  single: { urls: 1, price: '19,00 \u20ac', priceNum: 19, perUnit: '19,00 \u20ac', saving: null, label: '1 Analyse', description: 'Quick-Check' },
  double: { urls: 2, price: '29,00 \u20ac', priceNum: 29, perUnit: '14,50 \u20ac', saving: '24%', label: '2 Analysen', description: 'Vergleich' },
  triple: { urls: 3, price: '34,00 \u20ac', priceNum: 34, perUnit: '11,33 \u20ac', saving: '40%', label: '3 Analysen', description: 'Bestpreis' },
  premium: { urls: 1, price: '79,00 \u20ac', priceNum: 79, perUnit: '79,00 \u20ac', saving: null, label: 'Premium-Report', description: 'Umfassender Report', isPremium: true },
}
