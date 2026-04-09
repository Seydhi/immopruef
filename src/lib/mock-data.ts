import type { AnalysisResult } from './types'

export const MOCK_ANALYSIS_RESULT: AnalysisResult = {
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
    { merkmal: 'Energieeffizienzklasse', wert: 'D' },
    { merkmal: 'Stellplatz', wert: 'Kein Stellplatz' },
    { merkmal: 'Keller', wert: 'Ja, ca. 5 m\u00b2' },
    { merkmal: 'Maklerprovision', wert: '3,57% inkl. MwSt.' },
  ],
  standortanalyse: [
    { kategorie: '\u00d6PNV-Anbindung', bewertung: 'Sehr gut', details: 'U-Bahn U6/U7 Mehringdamm in 2 Min. Fu\u00dfweg, zahlreiche Buslinien' },
    { kategorie: 'Schulen & Kinderg\u00e4rten', bewertung: 'Gut', details: '3 Grundschulen und 5 Kitas im Umkreis von 1 km' },
    { kategorie: 'Einkaufsm\u00f6glichkeiten', bewertung: 'Sehr gut', details: 'Supermarkt im Erdgeschoss, Markthalle neun in 10 Min.' },
    { kategorie: '\u00c4rzte & Apotheken', bewertung: 'Sehr gut', details: 'Mehrere Praxen und Apotheken in direkter Umgebung' },
    { kategorie: 'Freizeitangebote', bewertung: 'Sehr gut', details: 'Viktoriapark, Bergmannstra\u00dfe, Tempelhof in Laufn\u00e4he' },
    { kategorie: 'L\u00e4rmbelastung', bewertung: 'M\u00e4\u00dfig', details: 'Mehringdamm ist eine Hauptverkehrsstra\u00dfe, Hinterhof ruhiger' },
    { kategorie: 'Soziale Lage', bewertung: 'Gut', details: 'Kreuzberg 61, gehobenes Mischgebiet, stabile Nachbarschaft' },
    { kategorie: 'Entwicklungsperspektive', bewertung: 'Sehr gut', details: 'Anhaltende Gentrifizierung, steigende Nachfrage, geplante Quartiersentwicklung' },
  ],
  marktdaten: [
    { kennzahl: 'Angebotspreis pro m\u00b2', wert: '4.987 \u20ac/m\u00b2', einschaetzung: 'mittel' },
    { kennzahl: 'Regionaler Marktdurchschnitt', wert: '5.200 \u20ac/m\u00b2', einschaetzung: 'gut' },
    { kennzahl: 'Preisabweichung vom Markt', wert: '-4,1%', einschaetzung: 'gut' },
    { kennzahl: 'Mietrendite (gesch\u00e4tzt)', wert: '3,2%', einschaetzung: 'mittel' },
    { kennzahl: 'Wertsteigerungspotenzial (5 Jahre)', wert: '+12\u201318%', einschaetzung: 'gut' },
    { kennzahl: 'Vergleichbare Angebote in der Region', wert: '47 Objekte', einschaetzung: 'schlecht' },
  ],
  scores: {
    gesamtbewertung: 7,
    lage: 8,
    preis_leistung: 6,
    zustand: 7,
  },
  risiken: [
    'Baujahr 1965: M\u00f6gliche Altlasten (Asbest, alte Leitungen) sollten vor Kauf gepr\u00fcft werden.',
    'Energieeffizienzklasse D: Mittelfristig k\u00f6nnten Sanierungskosten f\u00fcr bessere D\u00e4mmung anfallen.',
    'Kein Stellplatz: In Kreuzberg schwierige Parksituation, k\u00f6nnte Wiederverkaufswert mindern.',
    'Hohe Maklerprovision von 3,57% erh\u00f6ht die Gesamtkosten um ca. 13.900 \u20ac.',
  ],
  verhandlungstipps: [
    'Der Quadratmeterpreis liegt 4% unter dem Marktdurchschnitt \u2013 Spielraum f\u00fcr Verhandlung ist begrenzt, aber 5\u201310% Nachlass sind realistisch.',
    'Fragen Sie gezielt nach dem Energieausweis und argumentieren Sie mit den zu erwartenden Sanierungskosten.',
    'Erkundigen Sie sich nach der H\u00f6he des Hausgelds und der Instandhaltungsr\u00fccklage \u2013 niedrige R\u00fccklage = Verhandlungsargument.',
    'Pr\u00fcfen Sie, wie lange das Objekt bereits inseriert ist. Ab 60 Tagen steigt die Verhandlungsbereitschaft deutlich.',
    'Bieten Sie eine schnelle, unkomplizierte Abwicklung an \u2013 das ist f\u00fcr viele Verk\u00e4ufer wertvoller als ein h\u00f6herer Preis.',
  ],
  makleranschreiben: `Sehr geehrte Damen und Herren,

mit gro\u00dfem Interesse habe ich Ihr Angebot der 3-Zimmer-Eigentumswohnung am Mehringdamm 45, 10961 Berlin, auf ImmobilienScout24 gesehen. Die Lage in Kreuzberg sowie der Grundriss entsprechen meinen Vorstellungen, und ich m\u00f6chte mich hiermit als ernsthafter Kaufinteressent bei Ihnen melden.

Um die Immobilie besser einsch\u00e4tzen zu k\u00f6nnen, w\u00fcrde ich mich \u00fcber Antworten auf folgende Fragen freuen: Wann wurden zuletzt gr\u00f6\u00dfere Renovierungs- oder Modernisierungsma\u00dfnahmen durchgef\u00fchrt? Gibt es bekannte M\u00e4ngel oder anstehende Sanierungsarbeiten am Gemeinschaftseigentum? Liegt ein aktueller Energieausweis vor, und wie hoch sind die monatlichen Nebenkosten bzw. das Hausgeld? Besteht grunds\u00e4tzlich Verhandlungsbereitschaft beim Kaufpreis? Ab wann w\u00e4re ein Einzug m\u00f6glich?

Ich w\u00fcrde die Wohnung sehr gerne im Rahmen eines Besichtigungstermins pers\u00f6nlich in Augenschein nehmen. Bitte teilen Sie mir m\u00f6gliche Termine mit \u2013 ich bin zeitlich flexibel. Vielen Dank im Voraus f\u00fcr Ihre R\u00fcckmeldung.

Mit freundlichen Gr\u00fc\u00dfen`,
  zusammenfassung: 'Solide 3-Zimmer-Wohnung in sehr guter Kreuzberger Lage mit leicht unterdurchschnittlichem Quadratmeterpreis. Die Substanz ist gepflegt, jedoch sollten Baujahr und Energieeffizienz bei der Kaufentscheidung ber\u00fccksichtigt werden.',
}
