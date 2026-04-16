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

  // ═══════════════════════════════════════════════════════════════
  // STUFE 1 — neue Module (Berater-Style, narrativ)
  // ═══════════════════════════════════════════════════════════════

  maklerProfil: {
    name: 'BERLIN24 Immobilien GmbH',
    art: 'gewerblich',
    gegruendet: '2008',
    mitarbeiter: '14',
    qualifikation: 'Geprüfte Immobilienkaufleute (IHK), Sachverständige für Immobilienbewertung',
    sitz: 'Hauptstr. 117, 10827 Berlin-Schöneberg',
    ansprechpartner: 'Frau Dr. Anika Brenner',
    bewertungen: [
      { plattform: 'ImmoScout24', score: '4,7/5', anzahl: '142 Bewertungen' },
      { plattform: 'Google', score: '4,6/5', anzahl: '89 Bewertungen' },
      { plattform: 'ProvenExpert', score: '4,8/5', anzahl: '67 Bewertungen' },
    ],
    ranking: 'Top 20 Berliner Makler (ImmoScout-Ranking 2026)',
    fazit: 'Etablierter Makler mit 18 Jahren Markterfahrung und konsistent guten Bewertungen über mehrere Plattformen. Keine Hinweise auf intransparente Geschäftspraktiken — die Reaktionszeiten in den Bewertungen werden durchgängig positiv erwähnt. Kontakt direkt über die Ansprechpartnerin empfehlenswert.',
    redFlags: ['Keine Auffälligkeiten — solider gewerblicher Anbieter'],
  },

  mietrendite: {
    verfuegbar: true,
    ortsuebliche_kaltmiete: '14,80 €/m² (Mietspiegel Berlin-Kreuzberg 2025, Lagestufe „gut")',
    jahresrohertrag: '14,80 € × 78 m² × 12 = 13.853 €/Jahr',
    bruttorendite: '3,56 % p.a.',
    bewirtschaftungskosten: '20 % (2.770 €/Jahr) — Hausgeld nicht-umlagefähig + Mietausfallwagnis + Verwaltung',
    nettomietertrag: '11.083 €/Jahr',
    nettorendite: '2,85 % p.a. (vor Steuer)',
    benchmark: 'Für eine A-Lage in Berlin (Kreuzberg-61) liegt eine Bruttorendite von 3,5 % im erwartbaren Bereich — Berliner Innenstadtlagen werden primär aus Wertsteigerungserwartung gekauft, nicht aus laufendem Cashflow.',
    hinweis: 'Bei Selbstnutzung greift diese Rechnung nicht. Bei späterer Vermietung sollten Sie zusätzlich AfA und Werbungskosten ansetzen — die Steuerersparnis hebt die effektive Nettorendite typischerweise auf ~3,5–4 %.',
  },

  finanzierungsDetail: {
    cashflow: [
      { eigenkapitalQuote: '10 %', eigenkapitalBetrag: '38.900 €', darlehen: '350.100 €', zinssatz: '3,8 %', tilgung: '2,0 %', monatlicheRate: '1.692 €', restschuld10Jahre: '283.000 €', gesamtbelastung10Jahre: '203.040 €', bewertung: 'grenzwertig' },
      { eigenkapitalQuote: '20 %', eigenkapitalBetrag: '77.800 €', darlehen: '311.200 €', zinssatz: '3,5 %', tilgung: '2,0 %', monatlicheRate: '1.426 €', restschuld10Jahre: '252.000 €', gesamtbelastung10Jahre: '171.120 €', bewertung: 'tragbar' },
      { eigenkapitalQuote: '30 %', eigenkapitalBetrag: '116.700 €', darlehen: '272.300 €', zinssatz: '3,3 %', tilgung: '2,0 %', monatlicheRate: '1.202 €', restschuld10Jahre: '220.000 €', gesamtbelastung10Jahre: '144.240 €', bewertung: 'tragbar' },
    ],
    empfehlung: 'Mit 20 % Eigenkapital landen Sie bei einer monatlichen Belastung von ~1.426 € — das entspricht etwa 35 % eines Nettoeinkommens von 4.000 €. Banken akzeptieren bis ~40 % Belastungsquote. Wer die 30 %-Variante stemmen kann, spart über 10 Jahre fast 60.000 € an Zinsen — das ist der mit Abstand größte Hebel in der Finanzierung.',
    beispielTilgungsplan: [
      { jahr: 1, restschuld: '305.000 €', bisherZinsen: '10.892 €', bisherTilgung: '6.220 €' },
      { jahr: 5, restschuld: '278.000 €', bisherZinsen: '53.300 €', bisherTilgung: '32.812 €' },
      { jahr: 10, restschuld: '252.000 €', bisherZinsen: '102.084 €', bisherTilgung: '69.036 €' },
      { jahr: 15, restschuld: '224.000 €', bisherZinsen: '146.700 €', bisherTilgung: '109.000 €' },
      { jahr: 20, restschuld: '194.000 €', bisherZinsen: '187.600 €', bisherTilgung: '152.400 €' },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // STUFE 2 — neue Module (Visualisierung + Narrative)
  // ═══════════════════════════════════════════════════════════════

  marktband: {
    einheit: '€/m²',
    guenstig: { wert: '4.200 €/m²', label: 'Untere 25 % (B-Lagen, sanierungsbedürftig)' },
    durchschnittLow: { wert: '4.800 €/m²', label: 'Mittleres Marktband (untere Hälfte)' },
    durchschnittHigh: { wert: '5.420 €/m²', label: 'Mittleres Marktband (obere Hälfte)' },
    top: { wert: '6.900 €/m²', label: 'Obere 10 % (Top-Lagen, Neubau/saniert)' },
    diesesObjekt: { wert: '4.987 €/m²', positionProzent: 28, einordnung: 'Im unteren Mittelband — leicht unter dem Median für Kreuzberg-61' },
    einschaetzung: 'Das Objekt liegt mit ~5.000 €/m² etwa 8 % unter dem Stadtteil-Median und damit im "günstigeren Mittelband". Für Kreuzberg ist das ein realistisch bepreister Eintrittspunkt — kein Sonderschnäppchen, aber auch keine Überzahlung. Rechtfertigt aufgrund Baujahr 1965 keinen Aufpreis.',
  },

  preistrendHistorisch: {
    einheit: '€/m²',
    zeitreihe: [
      { jahr: '2021', wert: '5.180 €/m²', wertNum: 5180 },
      { jahr: '2022', wert: '5.420 €/m²', wertNum: 5420 },
      { jahr: '2023', wert: '5.310 €/m²', wertNum: 5310 },
      { jahr: '2024', wert: '5.350 €/m²', wertNum: 5350 },
      { jahr: '2025', wert: '5.420 €/m²', wertNum: 5420 },
      { jahr: '2026', wert: '5.420 €/m²', wertNum: 5420 },
    ],
    trend: 'stabil',
    veraenderungProzent: '+4,6 % über 5 Jahre (≈ 0,9 % p.a.)',
    prognoseHinweis: 'Berlin-Kreuzberg hat nach dem Korrektur-Jahr 2023 wieder das Vor-Pandemie-Niveau erreicht und verharrt seit 2024 stabil. Für die nächsten 5 Jahre wird vom IVD und Engel & Völkers eine moderate Aufwärtsentwicklung von 1–2 % p.a. erwartet — getrieben durch anhaltende Wohnraumknappheit, gebremst durch hohe Zinsen.',
  },

  besichtigungsFragenSpezifisch: {
    fragenProThema: [
      {
        thema: '🔥 Heizung & Energie (Baujahr 1965!)',
        fragen: [
          { frage: 'Wie alt ist die aktuelle Gasheizung und wann war die letzte Wartung?', begruendung: 'Gasheizungen halten 20–25 Jahre. Bei Baujahr 1965 wurde die Heizung sehr wahrscheinlich schon mindestens 1× erneuert — aber wann? GEG-Pflicht ab 30 Jahre Alter.', prioritaet: 'kritisch', bezugZumObjekt: 'Baujahr 1965 + Gasheizung im Exposé' },
          { frage: 'Liegt ein Bedarfsausweis (nicht nur Verbrauchsausweis) vor?', begruendung: 'Bedarfsausweis ist objektiver — der Verbrauchsausweis hängt stark vom Vorbewohner ab. Bei Effizienzklasse D im Verbrauchsausweis kann der Bedarf bis F sein.', prioritaet: 'wichtig', bezugZumObjekt: 'Klasse D im Exposé' },
          { frage: 'Wann wurde die Fassade zuletzt gedämmt?', begruendung: 'Bei Baujahr 1965 und Klasse D wurde meist nur das Dach gedämmt, die Fassade nicht. Nachrüstung kostet 18.000–35.000 €.', prioritaet: 'wichtig', bezugZumObjekt: 'Baujahr 1965' },
        ],
      },
      {
        thema: '🏗️ Bausubstanz & Schadstoffe (Asbest-Risikobaujahr!)',
        fragen: [
          { frage: 'Wurde jemals ein Schadstoffgutachten gemacht (Asbest, PAK)?', begruendung: 'Baujahre 1950–1990 sind die kritische Asbest-Spanne. Im Innenputz, in Bodenbelägen, in Fensterkitten. Bei Renovierung Pflicht zur Sondersanierung.', prioritaet: 'kritisch', bezugZumObjekt: 'Baujahr 1965 = klassische Asbest-Periode' },
          { frage: 'Gibt es Feuchtigkeitsspuren im Keller oder an Außenwänden?', begruendung: 'Vertikalsperren waren in den 60ern noch primitiv. Aufsteigende Feuchtigkeit ist die häufigste versteckte Mangel-Ursache.', prioritaet: 'kritisch', bezugZumObjekt: 'Baujahr 1965' },
          { frage: 'Wann wurden die Fenster zuletzt erneuert? Kunststoff oder noch Holz?', begruendung: 'Originalfenster von 1965 sind energetische Katastrophe. Kunststofffenster aus den 90ern halten noch 5–10 Jahre.', prioritaet: 'wichtig', bezugZumObjekt: 'Baujahr 1965 + Klasse D' },
        ],
      },
      {
        thema: '📋 WEG & laufende Kosten',
        fragen: [
          { frage: 'Höhe der aktuellen Instandhaltungsrücklage und Plan für die nächsten 5 Jahre?', begruendung: 'Bei einem Gebäude von 1965 stehen mittelfristig große Sanierungen an. Eine niedrige Rücklage = Sonderumlagen.', prioritaet: 'kritisch', bezugZumObjekt: 'Älteres Gebäude, ETW' },
          { frage: 'Sind in den letzten 3 WEG-Versammlungen Sonderumlagen beschlossen worden?', begruendung: 'Wenn ja, übernehmen Sie diese Verpflichtung mit dem Kauf. Direkter Einfluss auf die Gesamtkosten.', prioritaet: 'kritisch', bezugZumObjekt: 'ETW-Spezifika' },
          { frage: 'Gilt für das Gebäude die Milieuschutzverordnung?', begruendung: 'Kreuzberg-61 ist Erhaltungsgebiet. Vorkaufsrecht der Gemeinde verzögert den Notar-Termin um 2–3 Monate.', prioritaet: 'wichtig', bezugZumObjekt: 'Lage Kreuzberg-61' },
        ],
      },
    ],
  },

  staerkenSchwaechenNarrativ: {
    staerken: [
      { punkt: 'Preis liegt 8 % unter dem Stadtteil-Median', begruendung: 'Bei stabiler Marktentwicklung in Kreuzberg ist das ein realistisch bepreister Einstieg — keine Überzahlung. Verhandlungsspielraum auf 370–380k vorhanden.', einfluss: 'hoch' },
      { punkt: 'Lage Kreuzberg-61: hohe Wertstabilität', begruendung: 'Innenstadtlage mit U6/U7, 5 Min. zum Viktoriapark, gemischtes Quartier — historisch hat Kreuzberg-61 selbst in Korrekturphasen kaum Wert verloren.', einfluss: 'hoch' },
      { punkt: 'Energieklasse D — keine GEG-Sofortpflicht', begruendung: 'Erst ab Klasse F greift die Tausch-Pflicht für Heizung. Sie haben 5–10 Jahre Zeit zur energetischen Sanierung — das ist planbar.', einfluss: 'mittel' },
      { punkt: 'Etablierter Makler mit 18 Jahren Erfahrung', begruendung: 'BERLIN24 Immobilien hat über 290 Bewertungen mit Schnitt 4,7+ — keine Hinweise auf intransparente Praktiken oder versteckte Provisionen.', einfluss: 'mittel' },
    ],
    schwaechen: [
      { punkt: 'Baujahr 1965 — kritische Asbest-Periode', begruendung: 'Innenputz, Bodenbeläge und Fensterkitt aus diesen Jahren enthalten häufig Asbest. Bei Renovierung Sondersanierung Pflicht (+30–50 % Kosten).', einfluss: 'hoch' },
      { punkt: 'Mietrendite mit 2,85 % netto unterdurchschnittlich', begruendung: 'Berliner Innenstadtlagen werden primär aus Wertsteigerungserwartung gekauft, nicht aus Cashflow. Wer das Objekt zur reinen Vermietung sucht, findet bessere Renditen in B-Städten.', einfluss: 'mittel' },
      { punkt: 'Milieuschutz = Vorkaufsrecht der Gemeinde', begruendung: 'Der Bezirk hat 2 Monate Zeit zur Prüfung — der Notar-Termin verschiebt sich entsprechend. In <5 % der Fälle wird das Vorkaufsrecht ausgeübt, ist aber ein Restrisiko.', einfluss: 'mittel' },
      { punkt: 'Kein Stellplatz im Exposé', begruendung: 'In Kreuzberg ist Parken eine Herausforderung. Mindert Wiederverkaufswert um 5–8 %, vor allem für Familien.', einfluss: 'niedrig' },
    ],
    empfehlung: 'Solides Objekt mit klarem Profil: Sie kaufen Lage und Wertstabilität, nicht Cashflow. Konkretes Vorgehen: 1) Schadstoffgutachten als Bedingung in den Notar-Vertrag, 2) Verhandeln Sie auf 375.000 € (–3,6 %), 3) Klären Sie vor Notar das Vorkaufsrecht des Bezirks. Bei diesem Preis und mit Schadstoffsicherheit ist das ein guter Kauf für 10+ Jahre Haltedauer.',
  },
}
