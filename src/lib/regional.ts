// Regional-Daten für die "Kaufnebenkosten je Bundesland"-Seiten + den Index.
// Baut auf den zentralen GrESt-Sätzen aus kaufnebenkosten.ts auf (single source of truth).
import { GREST, NOTAR_SATZ, GRUNDBUCH_SATZ, MAKLER_DEFAULT } from './kaufnebenkosten'

export interface Regio {
  land: string
  slug: string
  satz: number
  histNote?: string // nur verifizierte Besonderheiten
}

const SLUGS: Record<string, string> = {
  'Baden-Württemberg': 'baden-wuerttemberg',
  'Bayern': 'bayern',
  'Berlin': 'berlin',
  'Brandenburg': 'brandenburg',
  'Bremen': 'bremen',
  'Hamburg': 'hamburg',
  'Hessen': 'hessen',
  'Mecklenburg-Vorpommern': 'mecklenburg-vorpommern',
  'Niedersachsen': 'niedersachsen',
  'Nordrhein-Westfalen': 'nordrhein-westfalen',
  'Rheinland-Pfalz': 'rheinland-pfalz',
  'Saarland': 'saarland',
  'Sachsen': 'sachsen',
  'Sachsen-Anhalt': 'sachsen-anhalt',
  'Schleswig-Holstein': 'schleswig-holstein',
  'Thüringen': 'thueringen',
}

// Verifizierte historische Besonderheiten (Stand 2026)
const HIST: Record<string, string> = {
  'Bayern': 'Bayern hat mit 3,5 % den bundesweit niedrigsten Satz und hat ihn seit der Länderhoheit 2006 nie erhöht.',
  'Bremen': 'Bremen hat den Satz zum 1. Juli 2025 von 5,0 % auf 5,5 % angehoben.',
  'Thüringen': 'Thüringen hat den Satz zum 1. Januar 2024 von 6,5 % auf 5,0 % gesenkt — eine der wenigen Senkungen bundesweit.',
  'Sachsen': 'Sachsen hat den Satz 2023 von 3,5 % auf 5,5 % angehoben.',
  'Hamburg': 'Hamburg hat den Satz zum 1. Januar 2023 von 4,5 % auf 5,5 % angehoben.',
}

export const REGIO: Regio[] = GREST.map((g) => ({
  land: g.land,
  slug: SLUGS[g.land],
  satz: g.satz,
  histNote: HIST[g.land],
}))

export function regioForSlug(slug: string): Regio | undefined {
  return REGIO.find((r) => r.slug === slug)
}

// Kaufnebenkosten-Quote (in Prozent des Kaufpreises)
export function nkQuote(satz: number, mitMakler: boolean): number {
  return satz + NOTAR_SATZ + GRUNDBUCH_SATZ + (mitMakler ? MAKLER_DEFAULT : 0)
}

export const GUENSTIGSTER = REGIO.reduce((a, b) => (b.satz < a.satz ? b : a))
export const TEUERSTER = REGIO.reduce((a, b) => (b.satz > a.satz ? b : a))

export { NOTAR_SATZ, GRUNDBUCH_SATZ, MAKLER_DEFAULT }
