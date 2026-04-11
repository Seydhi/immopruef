import type { BlogMeta } from '../BlogLayout'

// Blog posts registry — newest first
export const BLOG_POSTS: BlogMeta[] = [
  {
    slug: 'hauskauf-checkliste-2026',
    title: 'Hauskauf-Checkliste 2026: Was Sie vor dem Kauf prüfen müssen',
    description: 'Die vollständige Checkliste für Ihren Immobilienkauf — von der Besichtigung bis zum Notar.',
    date: '11. April 2026',
    readTime: '8 Min',
    tags: ['Checkliste', 'Kaufratgeber'],
  },
  {
    slug: 'kaufnebenkosten-berechnen',
    title: 'Kaufnebenkosten berechnen: So viel kostet der Hauskauf wirklich',
    description: 'Grunderwerbsteuer, Notar, Makler — alle versteckten Kosten beim Immobilienkauf auf einen Blick.',
    date: '10. April 2026',
    readTime: '6 Min',
    tags: ['Finanzierung'],
  },
  {
    slug: 'energieausweis-verstehen',
    title: 'Energieausweis lesen und verstehen: Was die Klassen A bis H bedeuten',
    description: 'Was verrät der Energieausweis über Ihre Wunschimmobilie? Heizkosten, Sanierungsbedarf und Fördermittel erklärt.',
    date: '9. April 2026',
    readTime: '7 Min',
    tags: ['Energie'],
  },
  {
    slug: 'immobilie-richtig-bewerten',
    title: 'Immobilie bewerten: 3 Verfahren die Gutachter nutzen',
    description: 'Vergleichswert, Sachwert, Ertragswert — so ermitteln Profis den wahren Wert einer Immobilie.',
    date: '8. April 2026',
    readTime: '9 Min',
    tags: ['Kaufratgeber'],
  },
  {
    slug: 'standortanalyse-immobilien',
    title: 'Standortanalyse für Immobilien: Diese 8 Faktoren entscheiden',
    description: 'ÖPNV, Schulen, Lärm, Demografie — welche Standortfaktoren den Immobilienwert wirklich beeinflussen.',
    date: '7. April 2026',
    readTime: '7 Min',
    tags: ['Standort'],
  },
  {
    slug: 'makler-anschreiben-tipps',
    title: 'Makler anschreiben: So fallen Sie positiv auf',
    description: 'Das perfekte Anschreiben an den Makler — mit Mustervorlage und den 10 Fragen die Sie stellen sollten.',
    date: '6. April 2026',
    readTime: '5 Min',
    tags: ['Kaufratgeber'],
  },
]

// Map slug → lazy component (filled as posts are written)
export const POST_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  // 'hauskauf-checkliste-2026': lazy(() => import('./hauskauf-checkliste-2026')),
}
