import type { PremiumReport } from './types'

export const MOCK_PREMIUM_REPORT: PremiumReport = {
  reportDatum: '10. April 2026',
  reportNummer: 'IA-2026-04-00847',

  // ─── Professionelle Wertermittlung ───
  wertermittlung: {
    vergleichswert: {
      wert: '375.000–405.000 €',
      methode: 'Vergleichswertverfahren nach §15 ImmoWertV auf Basis von 6 Vergleichsobjekten im Umkreis von 1 km, verkauft in den letzten 12 Monaten.',
      vergleichsobjekte: [
        { adresse: 'Bergmannstr. 28, 10961', preis: '395.000 €', qm: '82 m² (4.817 €/m²)', abweichung: '-3,4%' },
        { adresse: 'Gneisenaustr. 14, 10961', preis: '368.000 €', qm: '71 m² (5.183 €/m²)', abweichung: '+3,9%' },
        { adresse: 'Yorckstr. 78, 10965', preis: '412.000 €', qm: '85 m² (4.847 €/m²)', abweichung: '-2,8%' },
        { adresse: 'Mehringdamm 62, 10961', preis: '355.000 €', qm: '68 m² (5.221 €/m²)', abweichung: '+4,7%' },
        { adresse: 'Friesenstr. 5, 10965', preis: '378.000 €', qm: '76 m² (4.974 €/m²)', abweichung: '-0,3%' },
        { adresse: 'Zossener Str. 33, 10961', preis: '402.000 €', qm: '80 m² (5.025 €/m²)', abweichung: '+0,8%' },
      ],
    },
    sachwert: {
      bodenwert: '78 m² × 4.200 €/m² (Bodenrichtwert) = 327.600 €',
      gebaeudewert: 'Normalherstellungskosten: 1.800 €/m² × 78 m² = 140.400 €',
      alterswertminderung: '61 Jahre / 80 Jahre Gesamtlebensdauer = 76,25% → Minderung: 107.055 €',
      sachwert: '327.600 € + 33.345 € = 360.945 €',
    },
    ertragswert: {
      jahresrohertrag: '1.140 €/Monat × 12 = 13.680 €/Jahr (ortsübliche Vergleichsmiete)',
      bewirtschaftungskosten: '25% = 3.420 €/Jahr',
      reinertrag: '10.260 €/Jahr',
      liegenschaftszins: '2,8% (Gutachterausschuss Berlin, ETW Kreuzberg)',
      ertragswert: '10.260 € / 0,028 = 366.429 €',
    },
    fazit: {
      marktwertSpanne: '361.000–405.000 €',
      empfohlenerKaufpreis: '370.000–385.000 €',
      einschaetzung: 'Der angebotene Kaufpreis von 389.000 € liegt am oberen Rand der Marktwertspanne. Eine Verhandlung auf 370.000–380.000 € ist realistisch und empfehlenswert. Bei diesem Preis wäre das Preis-Leistungs-Verhältnis gut.',
    },
  },

  // ─── Vollständiges Standort-Dossier ───
  standortDossier: {
    entfernungen: [
      { ziel: 'U-Bhf Mehringdamm (U6/U7)', entfernung: '150 m', fahrzeit: '2 Min. zu Fuß' },
      { ziel: 'S-Bhf Yorckstraße', entfernung: '650 m', fahrzeit: '8 Min. zu Fuß' },
      { ziel: 'REWE Supermarkt', entfernung: '50 m', fahrzeit: 'Im Erdgeschoss' },
      { ziel: 'Viktoriapark', entfernung: '400 m', fahrzeit: '5 Min. zu Fuß' },
      { ziel: 'Tempelhofer Feld', entfernung: '1,2 km', fahrzeit: '15 Min. zu Fuß' },
      { ziel: 'Grundschule am Mehringdamm', entfernung: '300 m', fahrzeit: '4 Min. zu Fuß' },
      { ziel: 'Kita Sonnenschein', entfernung: '200 m', fahrzeit: '3 Min. zu Fuß' },
      { ziel: 'Hausarztpraxis Dr. Weber', entfernung: '100 m', fahrzeit: '1 Min. zu Fuß' },
      { ziel: 'Urban-Krankenhaus', entfernung: '800 m', fahrzeit: '10 Min. zu Fuß' },
      { ziel: 'Markthalle Neun', entfernung: '900 m', fahrzeit: '12 Min. zu Fuß' },
      { ziel: 'Flughafen BER', entfernung: '22 km', fahrzeit: '35 Min. (S-Bahn)' },
      { ziel: 'Berlin Hbf', entfernung: '5,5 km', fahrzeit: '15 Min. (U-Bahn)' },
    ],
    hochwasserrisiko: {
      zone: 'Keine Hochwassergefahrenzone (HQ100)',
      details: 'Das Grundstück liegt nicht in einem durch Flusshochwasser gefährdeten Gebiet. Starkregengefährdung: gering bis mittel. Nächstes Gewässer: Landwehrkanal (450 m entfernt). Laut Berliner Umweltatlas besteht kein erhöhtes Überflutungsrisiko.',
      risiko: 'niedrig',
    },
    laermbelastung: {
      tags: '65–70 dB(A) an der Straßenseite',
      nachts: '55–60 dB(A) an der Straßenseite',
      quelle: 'Hauptverkehrsstraße Mehringdamm (DTV: ca. 25.000 Kfz/Tag)',
      bewertung: 'Grenzwert für Mischgebiet: 64 dB(A) tags / 49 dB(A) nachts → Straßenseite überschreitet Grenzwerte. Hinterhof-Ausrichtung empfohlen (ca. 45 dB tags). Schallschutzfenster (Klasse 4) kosten ca. 3.000–5.000 € und reduzieren den Innenpegel auf unter 35 dB.',
    },
    radon: {
      wert: 'Geschätzt <40 kBq/m³ (Niedrigrisikozone)',
      risiko: 'niedrig',
    },
    bebauungsplan: {
      nutzung: 'MI – Mischgebiet (Wohnen und nicht wesentlich störendes Gewerbe)',
      gfz: '2,0 (Geschossflächenzahl)',
      grz: '0,6 (Grundflächenzahl)',
      besonderheiten: 'Milieuschutzgebiet „Chamissokiez / Bergmannstraße-Nord". Erhaltungsverordnung aktiv → Umwandlung von Miet- in Eigentumswohnungen genehmigungspflichtig. Bezirk hat Vorkaufsrecht (§ 24 BauGB), wird derzeit aber selten ausgeübt.',
    },
    sozialstruktur: {
      beschreibung: 'Kreuzberg 61 – gehobenes urbanes Mischgebiet. Stabile Bewohnerstruktur mit Trend zur Aufwertung. Hoher Anteil junger Berufstätiger und Familien. Gute soziale Durchmischung. Aktive Nachbarschaftsinitiative.',
      milieuschutz: true,
      vorkaufsrecht: true,
    },
  },

  // ─── 30-Jahres-Vermögensvergleich ───
  vermoegensvergleich: {
    jahre: [0, 5, 10, 15, 20, 25, 30],
    vermoegenKauf: ['0 €', '38.000 €', '112.000 €', '198.000 €', '305.000 €', '428.000 €', '572.000 €'],
    vermoegenMieteEtf: ['92.400 €', '128.000 €', '175.000 €', '238.000 €', '320.000 €', '425.000 €', '560.000 €'],
    breakEvenJahr: 22,
  },

  // ─── Vor-Kauf-Checkliste ───
  vorKaufCheckliste: [
    {
      kategorie: 'Dokumente vom Verkäufer anfordern',
      items: [
        { text: 'Grundbuchauszug (nicht älter als 3 Monate)', wichtigkeit: 'muss', erledigt: false },
        { text: 'Energieausweis (Bedarfsausweis bevorzugt)', wichtigkeit: 'muss', erledigt: false },
        { text: 'Teilungserklärung der WEG', wichtigkeit: 'muss', erledigt: false },
        { text: 'WEG-Protokolle der letzten 3 Jahre', wichtigkeit: 'muss', erledigt: false },
        { text: 'Wirtschaftsplan und Hausgeld-Abrechnung', wichtigkeit: 'muss', erledigt: false },
        { text: 'Höhe der Instandhaltungsrücklage', wichtigkeit: 'muss', erledigt: false },
        { text: 'Grundrisse und Wohnflächenberechnung', wichtigkeit: 'muss', erledigt: false },
        { text: 'Aufstellung durchgeführter Sanierungen', wichtigkeit: 'soll', erledigt: false },
        { text: 'Wartungsprotokolle Heizung/Schornsteinfeger', wichtigkeit: 'soll', erledigt: false },
        { text: 'Baugenehmigungen für Umbauten', wichtigkeit: 'soll', erledigt: false },
      ],
    },
    {
      kategorie: 'Selbst recherchieren',
      items: [
        { text: 'Baulastenverzeichnis beim Bauordnungsamt einsehen', wichtigkeit: 'muss', erledigt: false },
        { text: 'Altlastenkataster-Auskunft beim Umweltamt', wichtigkeit: 'soll', erledigt: false },
        { text: 'Bebauungsplan online prüfen (liegt bereits vor)', wichtigkeit: 'muss', erledigt: false },
        { text: 'Vorkaufsrecht der Gemeinde klären (Milieuschutz!)', wichtigkeit: 'muss', erledigt: false },
        { text: 'Geplante Sonderumlagen in der WEG', wichtigkeit: 'muss', erledigt: false },
      ],
    },
    {
      kategorie: 'Bei Besichtigung prüfen',
      items: [
        { text: 'Feuchtigkeit im Keller und an Wänden prüfen', wichtigkeit: 'muss', erledigt: false },
        { text: 'Fenster auf Dichtigkeit und Alter prüfen', wichtigkeit: 'muss', erledigt: false },
        { text: 'Heizungsanlage besichtigen (Alter, Zustand)', wichtigkeit: 'muss', erledigt: false },
        { text: 'Elektroverteilung prüfen (FI-Schutzschalter?)', wichtigkeit: 'soll', erledigt: false },
        { text: 'Wasserdrucke testen (Hähne aufdrehen)', wichtigkeit: 'kann', erledigt: false },
        { text: 'Wohnungstür zur Lärm-Einschätzung schließen', wichtigkeit: 'soll', erledigt: false },
        { text: 'Nachbarn freundlich nach WEG-Stimmung fragen', wichtigkeit: 'kann', erledigt: false },
        { text: 'Handy-Empfang in der Wohnung testen', wichtigkeit: 'kann', erledigt: false },
      ],
    },
    {
      kategorie: 'Vor Vertragsunterzeichnung',
      items: [
        { text: 'Finanzierungszusage der Bank einholen', wichtigkeit: 'muss', erledigt: false },
        { text: 'Kaufvertragsentwurf von Anwalt prüfen lassen', wichtigkeit: 'soll', erledigt: false },
        { text: 'Schadstoffgutachten beauftragen (Asbest, Baujahr 1965!)', wichtigkeit: 'muss', erledigt: false },
        { text: 'Ggf. Baugutachter für Zustandsbewertung (400–1.500 €)', wichtigkeit: 'soll', erledigt: false },
        { text: 'Notartermin erst nach vollständiger Prüfung aller Unterlagen', wichtigkeit: 'muss', erledigt: false },
      ],
    },
  ],

  // ─── Steuerliche Aspekte ───
  steuerlicheAspekte: [
    {
      aspekt: 'Eigennutzung',
      details: 'Bei Selbstnutzung keine Abschreibung (AfA) möglich. Kein steuerlicher Vorteil bei der Einkommensteuer.',
      vorteil: 'Steuerfreier Veräußerungsgewinn nach 3 Jahren Eigennutzung (kein Spekulationssteuer)',
    },
    {
      aspekt: 'Vermietung – AfA',
      details: 'Lineare AfA: 2% p.a. auf Gebäudeanteil (Baujahr vor 1925: 2,5%). Gebäudeanteil geschätzt: 60% von 389.000 € = 233.400 €.',
      vorteil: '4.668 €/Jahr steuerlich absetzbar → bei 42% Steuersatz: ~1.960 €/Jahr Ersparnis',
    },
    {
      aspekt: 'Vermietung – Werbungskosten',
      details: 'Zinsen, Hausverwaltung, Instandhaltung, Fahrtkosten sind als Werbungskosten absetzbar.',
      vorteil: 'Geschätzt 8.000–12.000 €/Jahr absetzbare Kosten',
    },
    {
      aspekt: 'Spekulationssteuer',
      details: 'Bei Verkauf innerhalb von 10 Jahren (nicht eigengenutzt): Gewinn ist einkommensteuerpflichtig.',
      vorteil: 'Vermeidung: Mindestens 10 Jahre halten oder mind. 3 Jahre vor Verkauf selbst nutzen',
    },
    {
      aspekt: 'Grunderwerbsteuer',
      details: '6,0% in Berlin = 23.340 € – nicht absetzbar bei Eigennutzung. Bei Vermietung: über AfA indirekt berücksichtigt.',
      vorteil: 'Politische Diskussion über Freibeträge für Ersterwerber – ggf. abwarten',
    },
  ],

  // ─── Gutachter-Empfehlung ───
  gutachterEmpfehlung: {
    empfohlen: true,
    grund: 'Aufgrund des Baujahrs 1965 empfehlen wir ein Schadstoffgutachten (Asbest/PAK) sowie eine Kurzbegehung durch einen Bausachverständigen. Das Gebäude fällt in die kritische Baujahresklasse für Asbest. Eine Vor-Ort-Prüfung der Bausubstanz kann versteckte Mängel aufdecken, die aus dem Inserat nicht ersichtlich sind.',
    geschaetzteKosten: 'Schadstoffgutachten: 300–500 € · Kaufberatung Sachverständiger: 400–800 € · Gesamt: 700–1.300 €',
  },
}
