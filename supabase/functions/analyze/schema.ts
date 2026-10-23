// JSON-Schemas für Structured Outputs (output_config.format).
// Regeln der API: jedes Objekt braucht `required` (alle Felder) und
// `additionalProperties: false`; keine min/max-Constraints; enum/anyOf erlaubt.
// Die Feldnamen entsprechen exakt dem Schema im System-Prompt und den
// Frontend-Typen (src/lib/types.ts). Zahlenfelder sind hier echte Zahlen.

type Schema = Record<string, unknown>

const S: Schema = { type: 'string' }
const N: Schema = { type: 'number' }
const B: Schema = { type: 'boolean' }
const E = (...values: string[]): Schema => ({ type: 'string', enum: values })
const arr = (items: Schema): Schema => ({ type: 'array', items })
const obj = (properties: Record<string, Schema>): Schema => ({
  type: 'object',
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
})

const kv = obj({ merkmal: S, wert: S })
const nkPosten = obj({ satz: S, betrag: S })

const STANDARD_PROPS: Record<string, Schema> = {
  objektdaten: arr(kv),
  preisbewertung: obj({
    preisProQm: S, regionalerDurchschnitt: S, abweichung: S,
    ampel: E('guenstig', 'fair', 'teuer'),
    kaufpreismieteVerhaeltnis: S, kaufpreismieteEinschaetzung: S,
    bodenrichtwert: S, preisentwicklung5Jahre: S, preisprognose5Jahre: S,
  }),
  gesamtkosten: obj({
    kaufpreis: S,
    kaufnebenkosten: obj({ grunderwerbsteuer: nkPosten, notar: nkPosten, grundbuch: nkPosten, makler: nkPosten, gesamt: S }),
    geschaetzteSanierung: S, gesamtinvestition: S,
    laufendeKosten: arr(obj({ position: S, betragMonat: S, betragJahr: S })),
    laufendeKostenGesamt: obj({ monat: S, jahr: S }),
  }),
  energieanalyse: obj({
    effizienzklasse: S, endenergiebedarf: S, heizkostenJahr: S, heizungstyp: S, heizungsalter: S,
    gegPflicht: obj({ besteht: B, details: S }),
    sanierungsoptionen: arr(obj({ massnahme: S, kosten: S, ersparnis: S, foerderung: S })),
    foerdermittelGesamt: S,
  }),
  modernisierung: obj({
    sanierungsstauGesamt: S,
    items: arr(obj({ bauteil: S, geschaetztesAlter: S, lebensdauer: S, zustand: E('gut', 'mittel', 'kritisch'), geschaetzteKosten: S, faelligIn: S })),
    timeline: arr(obj({ zeitraum: S, massnahmen: S, kosten: S })),
  }),
  standortanalyse: obj({
    gesamtScore: N,
    kategorien: arr(obj({ kategorie: S, bewertung: S, score: N, details: S })),
    demografie: obj({ bevoelkerungsentwicklung: S, trend: E('wachsend', 'stabil', 'schrumpfend'), altersstruktur: S, kaufkraftindex: S }),
    wirtschaft: obj({ arbeitslosenquote: S, topArbeitgeber: arr(S), branchenstruktur: S }),
    infrastruktur: obj({ breitband: S, breitbandTyp: S, mobilfunk: S }),
  }),
  risikobewertung: obj({
    gesamtrisiko: E('niedrig', 'mittel', 'hoch'),
    items: arr(obj({ kategorie: S, risiko: E('niedrig', 'mittel', 'hoch'), details: S, handlungsempfehlung: S })),
    redFlags: arr(S),
  }),
  finanzierung: obj({
    szenarien: arr(obj({ name: S, eigenkapital: S, darlehenssumme: S, zinssatz: S, tilgung: S, monatlicheRate: S, restschuld10Jahre: S, gesamtlaufzeit: S })),
    empfohleneEigenkapitalquote: S,
    kaufenVsMieten: obj({ mpiMieteMonat: S, kostenMiete20Jahre: S, kostenKauf20Jahre: S, vorteil: E('kaufen', 'mieten'), differenz: S }),
    stresstest: arr(obj({ szenario: S, monatlicheRate: S, bewertung: E('tragbar', 'grenzwertig', 'kritisch') })),
  }),
  scores: obj({ gesamtbewertung: N, lage: N, preis_leistung: N, zustand: N, energie: N, finanzierung: N }),
  risiken: arr(S),
  verhandlungstipps: arr(S),
  makleranschreiben: S,
  zusammenfassung: S,
  marktdaten: arr(obj({ kennzahl: S, wert: S, einschaetzung: E('gut', 'mittel', 'schlecht') })),
  quellen: arr(obj({ titel: S, url: S, kategorie: S })),
}

const PREMIUM_REPORT: Schema = obj({
  reportDatum: S,
  reportNummer: S,
  wertermittlung: obj({
    vergleichswert: obj({ wert: S, methode: S, vergleichsobjekte: arr(obj({ adresse: S, preis: S, qm: S, abweichung: S })) }),
    sachwert: obj({ bodenwert: S, gebaeudewert: S, alterswertminderung: S, sachwert: S }),
    ertragswert: obj({ jahresrohertrag: S, bewirtschaftungskosten: S, reinertrag: S, liegenschaftszins: S, ertragswert: S }),
    fazit: obj({ marktwertSpanne: S, empfohlenerKaufpreis: S, einschaetzung: S }),
  }),
  standortDossier: obj({
    entfernungen: arr(obj({ ziel: S, entfernung: S, fahrzeit: S })),
    hochwasserrisiko: obj({ zone: S, details: S, risiko: E('niedrig', 'mittel', 'hoch') }),
    laermbelastung: obj({ tags: S, nachts: S, quelle: S, bewertung: S }),
    radon: obj({ wert: S, risiko: E('niedrig', 'mittel', 'hoch') }),
    bebauungsplan: obj({ nutzung: S, gfz: S, grz: S, besonderheiten: S }),
    sozialstruktur: obj({ beschreibung: S, milieuschutz: B, vorkaufsrecht: B }),
  }),
  vermoegensvergleich: obj({
    jahre: arr(N), vermoegenKauf: arr(S), vermoegenMieteEtf: arr(S),
    breakEvenJahr: { anyOf: [{ type: 'number' }, { type: 'null' }] },
  }),
  vorKaufCheckliste: arr(obj({ kategorie: S, items: arr(obj({ text: S, wichtigkeit: E('muss', 'soll', 'kann'), erledigt: B })) })),
  steuerlicheAspekte: arr(obj({ aspekt: S, details: S, vorteil: S })),
  gutachterEmpfehlung: obj({ empfohlen: B, grund: S, geschaetzteKosten: S }),
  maklerProfil: obj({
    name: S, art: E('gewerblich', 'privatverkauf', 'unbekannt'), gegruendet: S, mitarbeiter: S, qualifikation: S, sitz: S, ansprechpartner: S,
    bewertungen: arr(obj({ plattform: S, score: S, anzahl: S })),
    ranking: S, fazit: S, redFlags: arr(S),
  }),
  mietrendite: obj({
    verfuegbar: B, fallbackHinweis: S, ortsuebliche_kaltmiete: S, jahresrohertrag: S, bruttorendite: S,
    bewirtschaftungskosten: S, nettomietertrag: S, nettorendite: S, benchmark: S, hinweis: S,
  }),
  finanzierungsDetail: obj({
    cashflow: arr(obj({ eigenkapitalQuote: S, eigenkapitalBetrag: S, darlehen: S, zinssatz: S, tilgung: S, monatlicheRate: S, restschuld10Jahre: S, gesamtbelastung10Jahre: S, bewertung: E('tragbar', 'grenzwertig', 'kritisch') })),
    empfehlung: S,
    beispielTilgungsplan: arr(obj({ jahr: N, restschuld: S, bisherZinsen: S, bisherTilgung: S })),
  }),
  marktband: obj({
    einheit: S,
    guenstig: obj({ wert: S, label: S }), durchschnittLow: obj({ wert: S, label: S }),
    durchschnittHigh: obj({ wert: S, label: S }), top: obj({ wert: S, label: S }),
    diesesObjekt: obj({ wert: S, positionProzent: N, einordnung: S }),
    einschaetzung: S,
  }),
  preistrendHistorisch: obj({
    einheit: S,
    zeitreihe: arr(obj({ jahr: S, wert: S, wertNum: N })),
    trend: E('steigend', 'stabil', 'fallend'), veraenderungProzent: S, prognoseHinweis: S,
  }),
  besichtigungsFragenSpezifisch: obj({
    fragenProThema: arr(obj({ thema: S, fragen: arr(obj({ frage: S, begruendung: S, prioritaet: E('kritisch', 'wichtig', 'optional'), bezugZumObjekt: S })) })),
  }),
  staerkenSchwaechenNarrativ: obj({
    staerken: arr(obj({ punkt: S, begruendung: S, einfluss: E('hoch', 'mittel', 'niedrig') })),
    schwaechen: arr(obj({ punkt: S, begruendung: S, einfluss: E('hoch', 'mittel', 'niedrig') })),
    empfehlung: S,
  }),
})

// Inserat offline → das Modell darf statt der Analyse diese Fehlerform liefern.
const LISTING_UNAVAILABLE: Schema = obj({ error: { type: 'string', enum: ['listing_unavailable'] }, hinweis: S })

export const STANDARD_SCHEMA: Schema = { anyOf: [obj(STANDARD_PROPS), LISTING_UNAVAILABLE] }
export const PREMIUM_SCHEMA: Schema = { anyOf: [obj({ ...STANDARD_PROPS, premiumReport: PREMIUM_REPORT }), LISTING_UNAVAILABLE] }
