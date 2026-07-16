// Kategorie-Hubs für den Blog (/blog/thema/<slug>) — indexierbare Themen-
// Einstiegsseiten. Nur Tags mit genügend Artikeln (≥3) bekommen einen Hub;
// „Grundriss" (2) und „Recht" (1) wären Thin Content und bleiben ohne Hub.
// „Kaufratgeber" steht auf allen 115 Artikeln und taugt daher nicht als Kategorie.

export interface Kategorie {
  slug: string
  tag: string // exakter Tag-Name aus BLOG_POSTS
  name: string // kurzer Anzeigename (Chips, Breadcrumb)
  titel: string // H1 + SEO-Title (≤ 49 Zeichen, damit „ | ImmoPrüf" passt)
  beschreibung: string // Meta-Description (140–160 Zeichen)
  intro: string // Einleitungsabsatz auf der Hub-Seite
  tools: { href: string; label: string }[]
}

export const KATEGORIEN: Kategorie[] = [
  {
    slug: 'finanzierung',
    tag: 'Finanzierung',
    name: 'Finanzierung',
    titel: 'Baufinanzierung: Ratgeber für Käufer',
    beschreibung:
      'Alle Ratgeber zur Baufinanzierung: Eigenkapital, Zins und Tilgung, KfW-Förderung, Kaufnebenkosten und Anschlussfinanzierung — mit kostenlosen Rechnern.',
    intro:
      'Von der Frage „Wie viel Haus kann ich mir leisten?" über Eigenkapital, Zinsbindung und Tilgung bis zu Förderprogrammen und Kaufnebenkosten: Diese Ratgeber führen durch die komplette Finanzierungsseite des Immobilienkaufs — nüchtern gerechnet statt schöngeredet.',
    tools: [
      { href: '/budgetrechner', label: 'Budgetrechner' },
      { href: '/tilgungsrechner', label: 'Tilgungsrechner' },
      { href: '/grunderwerbsteuer-rechner', label: 'Kaufnebenkosten-Rechner' },
      { href: '/notarkosten-rechner', label: 'Notarkosten-Rechner' },
    ],
  },
  {
    slug: 'checklisten',
    tag: 'Checkliste',
    name: 'Checklisten',
    titel: 'Hauskauf-Checklisten: Schritt für Schritt',
    beschreibung:
      'Checklisten für jede Phase des Immobilienkaufs: Besichtigung, Unterlagen, Exposé-Prüfung, Notartermin und Übergabe — konkret zum Abhaken statt vager Tipps.',
    intro:
      'Beim Immobilienkauf entscheidet Systematik: Wer die richtigen Punkte in der richtigen Reihenfolge prüft, übersieht weniger und verhandelt besser. Hier finden Sie alle Checklisten-Ratgeber — von der ersten Exposé-Sichtung bis zur Schlüsselübergabe.',
    tools: [{ href: '/grunderwerbsteuer-rechner', label: 'Kaufnebenkosten-Rechner' }],
  },
  {
    slug: 'zustand',
    tag: 'Zustand',
    name: 'Zustand & Sanierung',
    titel: 'Zustand & Sanierung: Ratgeber für Käufer',
    beschreibung:
      'Bausubstanz einschätzen, Sanierungskosten kalkulieren, Mängel erkennen: Ratgeber zu Dach, Heizung, Elektrik, Feuchtigkeit und Sanierungsstau beim Hauskauf.',
    intro:
      'Der Zustand entscheidet über die echten Gesamtkosten einer Immobilie: Ein günstiger Kaufpreis nützt nichts, wenn Dach, Heizung und Elektrik gleich mitbezahlt werden müssen. Diese Ratgeber zeigen, wie Sie Substanz einschätzen, Sanierungskosten realistisch beziffern und Kaschierversuche erkennen.',
    tools: [{ href: '/instandhaltungsruecklage-rechner', label: 'Instandhaltungsrücklage-Rechner' }],
  },
  {
    slug: 'standort',
    tag: 'Standort',
    name: 'Standort & Lage',
    titel: 'Standort & Lage bewerten beim Hauskauf',
    beschreibung:
      'Lage systematisch prüfen: Infrastruktur, Bodenrichtwert, Hochwasserrisiko und Mikrolage — die Ratgeber für die Standort-Seite der Kaufentscheidung.',
    intro:
      'Die Lage ist der einzige Faktor, den Sie nach dem Kauf nicht mehr ändern können. Diese Ratgeber zeigen, wie Sie Infrastruktur, Mikrolage und Risiken systematisch bewerten — mit Datenquellen statt Bauchgefühl.',
    tools: [{ href: '/kaufnebenkosten-index', label: 'Kaufnebenkosten je Bundesland' }],
  },
  {
    slug: 'energie',
    tag: 'Energie',
    name: 'Energie',
    titel: 'Energie & Heizung beim Immobilienkauf',
    beschreibung:
      'Energieausweis lesen, Heizungsarten vergleichen, Förderung nutzen: Ratgeber zur Energie-Seite des Hauskaufs — fachlich geprüft von einem Energie-Ingenieur.',
    intro:
      'Energieklasse und Heizung gehören zu den größten Kostenhebeln einer Immobilie — beim Kaufpreis, bei den laufenden Kosten und bei der Sanierungspflicht. Diese Ratgeber werden fachlich von Ahmad El Chouli (Projektingenieur Energiemanagement) geprüft.',
    tools: [],
  },
  {
    slug: 'besichtigung',
    tag: 'Besichtigung',
    name: 'Besichtigung',
    titel: 'Besichtigung: vorbereiten und prüfen',
    beschreibung:
      'Besichtigung vorbereiten, die richtigen Fragen stellen, Warnsignale vor Ort erkennen — und den zweiten Termin als echte Inspektion nutzen.',
    intro:
      'Die Besichtigung ist Ihre wichtigste Informationsquelle vor dem Kauf — wenn Sie vorbereitet hingehen. Diese Ratgeber liefern Fragenkataloge, Prüfpunkte und die Checkliste für den entscheidenden zweiten Termin.',
    tools: [],
  },
]

export function kategorieForSlug(slug: string): Kategorie | undefined {
  return KATEGORIEN.find((k) => k.slug === slug)
}

// Erste Hub-Kategorie eines Artikels (für Breadcrumbs) — Reihenfolge = KATEGORIEN
export function kategorieForTags(tags: string[]): Kategorie | undefined {
  return KATEGORIEN.find((k) => tags.includes(k.tag))
}
