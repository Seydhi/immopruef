import type { AnalysisResult } from './types'

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
  // ─── Objektdaten ───
  objektdaten: [
    { merkmal: 'Adresse', wert: 'Mehringdamm 45, 10961 Berlin' },
    { merkmal: 'Immobilientyp', wert: 'Eigentumswohnung' },
    { merkmal: 'Kaufpreis', wert: '389.000 \u20ac' },
    { merkmal: 'Wohnfl\u00e4che', wert: '78 m\u00b2' },
    { merkmal: 'Grundst\u00fccksfl\u00e4che', wert: 'Gemeinschaftseigentum' },
    { merkmal: 'Zimmer', wert: '3' },
    { merkmal: 'Baujahr', wert: '1965' },
    { merkmal: 'Zustand', wert: 'Gepflegt, teilmodernisiert' },
    { merkmal: 'Heizung', wert: 'Zentralheizung (Gas)' },
    { merkmal: 'Energieeffizienzklasse', wert: 'D (128 kWh/m\u00b2a)' },
    { merkmal: 'Stellplatz', wert: 'Kein Stellplatz' },
    { merkmal: 'Keller', wert: 'Ja, ca. 5 m\u00b2' },
    { merkmal: 'Hausgeld', wert: '320 \u20ac/Monat' },
    { merkmal: 'Maklerprovision', wert: '3,57% inkl. MwSt.' },
  ],

  // ─── Zusammenfassung ───
  zusammenfassung: 'Solide 3-Zimmer-Wohnung in sehr guter Kreuzberger Lage mit leicht unterdurchschnittlichem Quadratmeterpreis. Die Gesamtinvestition inkl. Nebenkosten und notwendiger Sanierung liegt bei ca. 462.000 \u20ac. Die Energieeffizienz (Klasse D) erfordert mittelfristig Investitionen von ca. 18.000\u201335.000 \u20ac, wobei bis zu 40% F\u00f6rdermittel m\u00f6glich sind. Das Preis-Leistungs-Verh\u00e4ltnis ist angemessen \u2013 Verhandlungsspielraum von 5\u201310% besteht.',

  // ─── Scores ───
  scores: {
    gesamtbewertung: 7.2,
    lage: 8.5,
    preis_leistung: 6.8,
    zustand: 6.5,
    energie: 4.5,
    finanzierung: 7.0,
  },

  // ─── 1. Preisbewertung ───
  preisbewertung: {
    preisProQm: '4.987 \u20ac/m\u00b2',
    regionalerDurchschnitt: '5.420 \u20ac/m\u00b2',
    abweichung: '-8,0%',
    ampel: 'guenstig',
    kaufpreismieteVerhaeltnis: '28,4',
    kaufpreismieteEinschaetzung: 'Durchschnittlich \u2013 ab unter 25 gilt als g\u00fcnstig',
    bodenrichtwert: '4.200 \u20ac/m\u00b2 (Gutachterausschuss Berlin 2025)',
    preisentwicklung5Jahre: '+18,3% (2021\u20132025)',
    preisprognose5Jahre: '+8\u201314% (konservative Sch\u00e4tzung)',
  },

  // ─── 2. Gesamtkosten ───
  gesamtkosten: {
    kaufpreis: '389.000 \u20ac',
    kaufnebenkosten: {
      grunderwerbsteuer: { satz: '6,0% (Berlin)', betrag: '23.340 \u20ac' },
      notar: { satz: '1,5%', betrag: '5.835 \u20ac' },
      grundbuch: { satz: '0,5%', betrag: '1.945 \u20ac' },
      makler: { satz: '3,57%', betrag: '13.887 \u20ac' },
      gesamt: '45.007 \u20ac',
    },
    geschaetzteSanierung: '28.000 \u20ac',
    gesamtinvestition: '462.007 \u20ac',
    laufendeKosten: [
      { position: 'Hausgeld', betragMonat: '320 \u20ac', betragJahr: '3.840 \u20ac' },
      { position: 'Grundsteuer (neu ab 2025)', betragMonat: '45 \u20ac', betragJahr: '540 \u20ac' },
      { position: 'Geb\u00e4udeversicherung (Anteil)', betragMonat: '25 \u20ac', betragJahr: '300 \u20ac' },
      { position: 'R\u00fccklagen Instandhaltung', betragMonat: '117 \u20ac', betragJahr: '1.404 \u20ac' },
      { position: 'Heizkosten (Gas)', betragMonat: '115 \u20ac', betragJahr: '1.380 \u20ac' },
      { position: 'Strom', betragMonat: '55 \u20ac', betragJahr: '660 \u20ac' },
      { position: 'Wasser/Abwasser', betragMonat: '35 \u20ac', betragJahr: '420 \u20ac' },
    ],
    laufendeKostenGesamt: { monat: '712 \u20ac', jahr: '8.544 \u20ac' },
  },

  // ─── 3. Energieanalyse ───
  energieanalyse: {
    effizienzklasse: 'D',
    endenergiebedarf: '128 kWh/m\u00b2a',
    heizkostenJahr: '1.380 \u20ac',
    heizungstyp: 'Zentralheizung (Gas)',
    heizungsalter: 'ca. 15 Jahre (gesch\u00e4tzt)',
    gegPflicht: {
      besteht: true,
      details: 'Ab 2045 muss die Gasheizung durch erneuerbare Energien ersetzt werden (kommunale W\u00e4rmeplanung Berlin). Bei Heizungstausch vorher: 65%-EE-Pflicht gem\u00e4\u00df GEG.',
    },
    sanierungsoptionen: [
      {
        massnahme: 'W\u00e4rmepumpe (Luft-Wasser)',
        kosten: '18.000\u201325.000 \u20ac',
        ersparnis: 'ca. 40% Heizkosten',
        foerderung: 'Bis 70% \u00fcber BEG (Basis 30% + Klimabonus 20% + Einkommensbonus 20%)',
      },
      {
        massnahme: 'Fenster (3-fach Verglasung)',
        kosten: '8.000\u201312.000 \u20ac',
        ersparnis: 'ca. 15% Heizkosten',
        foerderung: '15% BAFA-Zuschuss + 5% iSFP-Bonus',
      },
      {
        massnahme: 'Fassadend\u00e4mmung (WDVS)',
        kosten: '15.000\u201325.000 \u20ac',
        ersparnis: 'ca. 25% Heizkosten',
        foerderung: '15% BAFA-Zuschuss + 5% iSFP-Bonus',
      },
      {
        massnahme: 'Kellerdeckend\u00e4mmung',
        kosten: '2.500\u20134.000 \u20ac',
        ersparnis: 'ca. 5% Heizkosten',
        foerderung: '15% BAFA-Zuschuss',
      },
    ],
    foerdermittelGesamt: 'Bis zu 37.000 \u20ac F\u00f6rderung m\u00f6glich (abh\u00e4ngig von Ma\u00dfnahmenkombination)',
  },

  // ─── 4. Modernisierung ───
  modernisierung: {
    sanierungsstauGesamt: '28.000\u201355.000 \u20ac',
    items: [
      {
        bauteil: 'Heizungsanlage',
        geschaetztesAlter: '~15 Jahre',
        lebensdauer: '15\u201325 Jahre',
        zustand: 'mittel',
        geschaetzteKosten: '18.000\u201325.000 \u20ac',
        faelligIn: '0\u201310 Jahre',
      },
      {
        bauteil: 'Fenster',
        geschaetztesAlter: '~25 Jahre',
        lebensdauer: '25\u201340 Jahre',
        zustand: 'mittel',
        geschaetzteKosten: '8.000\u201312.000 \u20ac',
        faelligIn: '0\u201315 Jahre',
      },
      {
        bauteil: 'Elektroinstallation',
        geschaetztesAlter: '~30 Jahre',
        lebensdauer: '30\u201340 Jahre',
        zustand: 'mittel',
        geschaetzteKosten: '5.000\u20138.000 \u20ac',
        faelligIn: '0\u201310 Jahre',
      },
      {
        bauteil: 'Badezimmer',
        geschaetztesAlter: '~20 Jahre',
        lebensdauer: '20\u201330 Jahre',
        zustand: 'mittel',
        geschaetzteKosten: '12.000\u201320.000 \u20ac',
        faelligIn: '0\u201310 Jahre',
      },
      {
        bauteil: 'Dach (Gemeinschaft)',
        geschaetztesAlter: '~30 Jahre',
        lebensdauer: '40\u201360 Jahre',
        zustand: 'gut',
        geschaetzteKosten: 'Anteil ca. 3.000\u20135.000 \u20ac',
        faelligIn: '10\u201330 Jahre',
      },
      {
        bauteil: 'Fassade (Gemeinschaft)',
        geschaetztesAlter: '~20 Jahre',
        lebensdauer: '30\u201350 Jahre',
        zustand: 'gut',
        geschaetzteKosten: 'Anteil ca. 2.000\u20134.000 \u20ac',
        faelligIn: '10\u201330 Jahre',
      },
    ],
    timeline: [
      { zeitraum: 'Sofort (0\u20132 Jahre)', massnahmen: 'Elektrik pr\u00fcfen, Bad-Sanierung planen', kosten: '5.000\u201315.000 \u20ac' },
      { zeitraum: 'Mittelfristig (3\u20137 Jahre)', massnahmen: 'Fenster tauschen, Heizung erneuern', kosten: '25.000\u201335.000 \u20ac' },
      { zeitraum: 'Langfristig (8\u201315 Jahre)', massnahmen: 'Dach & Fassade (Gemeinschaftsanteil)', kosten: '5.000\u20139.000 \u20ac' },
    ],
  },

  // ─── 5. Standortanalyse (erweitert) ───
  standortanalyse: {
    gesamtScore: 8.5,
    kategorien: [
      { kategorie: '\u00d6PNV-Anbindung', bewertung: 'Sehr gut', score: 9.5, details: 'U6/U7 Mehringdamm in 2 Min., zahlreiche Buslinien, S-Bahn Yorckstra\u00dfe 8 Min.' },
      { kategorie: 'Schulen & Kitas', bewertung: 'Gut', score: 7.5, details: '3 Grundschulen und 5 Kitas im Umkreis von 1 km' },
      { kategorie: 'Einkauf & Nahversorgung', bewertung: 'Sehr gut', score: 9.0, details: 'REWE im Erdgeschoss, Markthalle Neun 10 Min., Bio-Superm\u00e4rkte in der N\u00e4he' },
      { kategorie: '\u00c4rzte & Gesundheit', bewertung: 'Sehr gut', score: 9.0, details: 'Mehrere Praxen, 2 Apotheken, Urban-Krankenhaus 10 Min.' },
      { kategorie: 'Freizeit & Kultur', bewertung: 'Sehr gut', score: 9.5, details: 'Viktoriapark, Bergmannstra\u00dfe, Tempelhof, Kinos, Theater' },
      { kategorie: 'L\u00e4rmbelastung', bewertung: 'M\u00e4\u00dfig', score: 5.5, details: 'Mehringdamm ist Hauptverkehrsstra\u00dfe (65\u201370 dB tags\u00fcber), Hinterhof deutlich ruhiger (~45 dB)' },
      { kategorie: 'Sicherheit', bewertung: 'Gut', score: 7.0, details: 'Kreuzberg 61 ist ruhiger als Kreuzberg 36, durchschnittliche Kriminalit\u00e4tsbelastung' },
      { kategorie: 'Entwicklungsperspektive', bewertung: 'Sehr gut', score: 9.0, details: 'Anhaltende Aufwertung, steigende Nachfrage, Quartiersentwicklung Gleisdreieck' },
    ],
    demografie: {
      bevoelkerungsentwicklung: '+5,2% in den letzten 5 Jahren',
      trend: 'wachsend',
      altersstruktur: 'Jung & urban \u2013 Medianalter 35 Jahre, hoher Anteil 25\u201345',
      kaufkraftindex: '98,2 (leicht unter Bundesdurchschnitt, f\u00fcr Berlin \u00fcberdurchschnittlich)',
    },
    wirtschaft: {
      arbeitslosenquote: '8,1% (Berlin-Friedrichshain-Kreuzberg)',
      topArbeitgeber: ['Charit\u00e9', 'Deutsche Bahn', 'Zalando', 'Delivery Hero', 'Siemens'],
      branchenstruktur: 'Starker Dienstleistungs- und Tech-Sektor, wachsende Startup-Szene',
    },
    infrastruktur: {
      breitband: '1.000 Mbit/s verf\u00fcgbar',
      breitbandTyp: 'Glasfaser (FTTH)',
      mobilfunk: '5G verf\u00fcgbar (alle Netzbetreiber)',
    },
  },

  // ─── 6. Risikobewertung ───
  risikobewertung: {
    gesamtrisiko: 'mittel',
    items: [
      {
        kategorie: 'Hochwasser',
        risiko: 'niedrig',
        details: 'Keine Hochwassergefahrenzone laut Berliner Umweltatlas. Starkregengef\u00e4hrdung gering.',
        handlungsempfehlung: 'Kein Handlungsbedarf.',
      },
      {
        kategorie: 'L\u00e4rmbelastung',
        risiko: 'mittel',
        details: 'Mehringdamm: 65\u201370 dB tags\u00fcber (Hauptverkehrsstra\u00dfe). Grenzwert f\u00fcr Mischgebiet: 64 dB.',
        handlungsempfehlung: 'Hinterhof-Ausrichtung der Wohnr\u00e4ume pr\u00fcfen. Schallschutzfenster erw\u00e4gen.',
      },
      {
        kategorie: 'Schadstoffe (Baujahr 1965)',
        risiko: 'mittel',
        details: 'Asbest in Bodenbel\u00e4gen, Fliesenkleber oder Rohrisolierungen m\u00f6glich. PAK in alten Parkettklebern.',
        handlungsempfehlung: 'Schadstoffgutachten vor Kauf empfohlen (ca. 300\u2013500 \u20ac).',
      },
      {
        kategorie: 'Radon',
        risiko: 'niedrig',
        details: 'Berlin liegt in einer Radon-Niedrigrisikozone (<40 kBq/m\u00b3).',
        handlungsempfehlung: 'Kein Handlungsbedarf.',
      },
      {
        kategorie: 'GEG / Heizungstausch',
        risiko: 'mittel',
        details: 'Gasheizung muss mittelfristig ersetzt werden. Kosten: 18.000\u201325.000 \u20ac.',
        handlungsempfehlung: 'F\u00f6rdermittel (BEG) einplanen. WEG-Beschl\u00fcsse zur Heizung pr\u00fcfen.',
      },
      {
        kategorie: 'Instandhaltungsr\u00fccklage WEG',
        risiko: 'mittel',
        details: 'H\u00f6he der R\u00fccklage unbekannt. Bei niedrigem Stand drohen Sonderumlagen.',
        handlungsempfehlung: 'WEG-Protokolle der letzten 3 Jahre und R\u00fccklagen-Stand anfordern.',
      },
    ],
    redFlags: [
      'Baujahr 1965: Asbestpr\u00fcfung vor Renovierung zwingend erforderlich',
      'Kein Stellplatz: In Kreuzberg schwierige Parksituation, mindert Wiederverkaufswert',
      'Hausgeld von 320 \u20ac/Monat \u2013 pr\u00fcfen ob Instandhaltungsr\u00fccklage ausreichend',
      'Energieeffizienzklasse D \u2013 zuk\u00fcnftige EU-Geb\u00e4uderichtlinie k\u00f6nnte Sanierungspflicht ausl\u00f6sen',
    ],
  },

  // ─── 7. Finanzierung ───
  finanzierung: {
    szenarien: [
      {
        name: 'Konservativ (30% EK)',
        eigenkapital: '138.600 \u20ac',
        darlehenssumme: '323.400 \u20ac',
        zinssatz: '3,45%',
        tilgung: '2,0%',
        monatlicheRate: '1.468 \u20ac',
        restschuld10Jahre: '246.200 \u20ac',
        gesamtlaufzeit: '~30 Jahre',
      },
      {
        name: 'Standard (20% EK)',
        eigenkapital: '92.400 \u20ac',
        darlehenssumme: '369.600 \u20ac',
        zinssatz: '3,65%',
        tilgung: '2,0%',
        monatlicheRate: '1.742 \u20ac',
        restschuld10Jahre: '281.700 \u20ac',
        gesamtlaufzeit: '~32 Jahre',
      },
      {
        name: 'Minimal (10% EK)',
        eigenkapital: '46.200 \u20ac',
        darlehenssumme: '415.800 \u20ac',
        zinssatz: '3,95%',
        tilgung: '1,5%',
        monatlicheRate: '1.888 \u20ac',
        restschuld10Jahre: '343.900 \u20ac',
        gesamtlaufzeit: '~38 Jahre',
      },
    ],
    empfohleneEigenkapitalquote: 'Mindestens 20% empfohlen (92.400 \u20ac) \u2013 idealerweise 30% f\u00fcr beste Konditionen',
    kaufenVsMieten: {
      mpiMieteMonat: '1.140 \u20ac',
      kostenMiete20Jahre: '328.000 \u20ac (bei 2% j\u00e4hrlicher Steigerung)',
      kostenKauf20Jahre: '462.000 \u20ac (Invest) + 130.000 \u20ac (Zinsen) = 592.000 \u20ac',
      vorteil: 'kaufen',
      differenz: 'Kaufen lohnt sich bei >15 Jahren Haltedauer und >2% j\u00e4hrlicher Wertsteigerung. Verm\u00f6gensaufbau: ~180.000 \u20ac Eigenkapital nach 20 Jahren.',
    },
    stresstest: [
      { szenario: 'Zinserh\u00f6hung auf 5% (nach 10 J.)', monatlicheRate: '2.180 \u20ac', bewertung: 'grenzwertig' },
      { szenario: 'Sonderumlage WEG: 15.000 \u20ac', monatlicheRate: '+625 \u20ac/Monat (24 Raten)', bewertung: 'tragbar' },
      { szenario: 'Einkommensverlust 30%', monatlicheRate: 'Rate bleibt, Belastungsquote steigt auf 52%', bewertung: 'kritisch' },
      { szenario: 'Heizungstausch 20.000 \u20ac', monatlicheRate: '+280 \u20ac/Monat (KfW-Kredit, 6 J.)', bewertung: 'tragbar' },
    ],
  },

  // ─── 8. Dokumente ───
  verhandlungstipps: [
    'Der Quadratmeterpreis liegt 8% unter dem Marktdurchschnitt \u2013 dennoch ist Verhandlungsspielraum von 5\u201310% realistisch, da das Objekt bereits \u00fcber 45 Tage inseriert ist.',
    'Argumentieren Sie mit dem Sanierungsstau: Heizung, Fenster und Elektrik werden in den n\u00e4chsten 10 Jahren ca. 35.000\u201350.000 \u20ac kosten.',
    'Fragen Sie gezielt nach der H\u00f6he der Instandhaltungsr\u00fccklage. Unter 20 \u20ac/m\u00b2/Jahr ist ein starkes Verhandlungsargument.',
    'Die Energieeffizienzklasse D und die kommende GEG-Pflicht zum Heizungstausch sind weitere Kostenargumente.',
    'Erkundigen Sie sich nach den WEG-Protokollen der letzten 3 Jahre \u2013 geplante Sonderumlagen oder Streitigkeiten offenbaren Risiken.',
    'Bieten Sie eine schnelle, unkomplizierte Abwicklung an \u2013 das ist f\u00fcr viele Verk\u00e4ufer wertvoller als ein h\u00f6herer Preis.',
    'Pr\u00fcfen Sie ob ein Vorkaufsrecht der Gemeinde besteht (Milieuschutzgebiet Kreuzberg) \u2013 dies kann den Kauf verz\u00f6gern.',
  ],
  makleranschreiben: `Sehr geehrte Damen und Herren,

mit gro\u00dfem Interesse habe ich Ihr Angebot der 3-Zimmer-Eigentumswohnung am Mehringdamm 45, 10961 Berlin, auf ImmobilienScout24 gesehen. Die zentrale Lage in Kreuzberg sowie der Grundriss entsprechen genau meinen Vorstellungen, und ich m\u00f6chte mich hiermit als ernsthafter Kaufinteressent bei Ihnen melden.

Zu meiner Person: Ich bin beruflich in Berlin t\u00e4tig und suche eine Eigentumswohnung zur Selbstnutzung. Eine Finanzierungszusage meiner Bank liegt bereits vor, sodass eine z\u00fcgige Abwicklung gew\u00e4hrleistet ist.

Um die Immobilie besser einsch\u00e4tzen zu k\u00f6nnen, w\u00fcrde ich mich \u00fcber Antworten auf folgende Fragen freuen:

\u2022 Wann wurden zuletzt gr\u00f6\u00dfere Renovierungs- oder Modernisierungsma\u00dfnahmen durchgef\u00fchrt?
\u2022 Wie hoch ist die aktuelle Instandhaltungsr\u00fccklage der WEG?
\u2022 Sind Sonderumlagen geplant oder in den letzten 3 Jahren beschlossen worden?
\u2022 Liegt ein aktueller Energieausweis (Bedarfsausweis) vor?
\u2022 Wie hoch sind die monatlichen Nebenkosten bzw. das Hausgeld?
\u2022 Besteht grunds\u00e4tzlich Verhandlungsbereitschaft beim Kaufpreis?
\u2022 Ab wann w\u00e4re ein Einzug m\u00f6glich?

Ich w\u00fcrde die Wohnung sehr gerne im Rahmen eines Besichtigungstermins pers\u00f6nlich in Augenschein nehmen. Bitte teilen Sie mir m\u00f6gliche Termine mit \u2013 ich bin zeitlich flexibel.

Vielen Dank im Voraus f\u00fcr Ihre R\u00fcckmeldung.

Mit freundlichen Gr\u00fc\u00dfen`,

  // ─── Legacy fields ───
  marktdaten: [
    { kennzahl: 'Angebotspreis pro m\u00b2', wert: '4.987 \u20ac/m\u00b2', einschaetzung: 'gut' },
    { kennzahl: 'Regionaler Marktdurchschnitt', wert: '5.420 \u20ac/m\u00b2', einschaetzung: 'mittel' },
    { kennzahl: 'Preisabweichung vom Markt', wert: '-8,0%', einschaetzung: 'gut' },
    { kennzahl: 'Mietrendite (gesch\u00e4tzt)', wert: '3,2%', einschaetzung: 'mittel' },
    { kennzahl: 'Wertsteigerung 5 Jahre', wert: '+18,3%', einschaetzung: 'gut' },
    { kennzahl: 'Bodenrichtwert', wert: '4.200 \u20ac/m\u00b2', einschaetzung: 'gut' },
  ],
  risiken: [
    'Baujahr 1965: Asbestpr\u00fcfung vor Renovierung zwingend erforderlich.',
    'Energieeffizienzklasse D: Mittelfristig Sanierungskosten von 18.000\u201335.000 \u20ac.',
    'Kein Stellplatz: In Kreuzberg schwierige Parksituation, mindert Wiederverkaufswert.',
    'GEG-Pflicht: Gasheizung muss mittelfristig ersetzt werden.',
    'Hausgeld 320 \u20ac/Monat \u2013 H\u00f6he der Instandhaltungsr\u00fccklage pr\u00fcfen.',
    'Milieuschutzgebiet: Vorkaufsrecht der Gemeinde m\u00f6glich.',
  ],
}
