// Geteilte Kaufnebenkosten-Logik für Rechner & Budgetrechner.
// Grunderwerbsteuersätze je Bundesland (Stand 2026).

export interface Bundesland {
  land: string
  satz: number // Grunderwerbsteuer in Prozent
}

export const GREST: Bundesland[] = [
  { land: 'Baden-Württemberg', satz: 5.0 },
  { land: 'Bayern', satz: 3.5 },
  { land: 'Berlin', satz: 6.0 },
  { land: 'Brandenburg', satz: 6.5 },
  { land: 'Bremen', satz: 5.5 },
  { land: 'Hamburg', satz: 5.5 },
  { land: 'Hessen', satz: 6.0 },
  { land: 'Mecklenburg-Vorpommern', satz: 6.0 },
  { land: 'Niedersachsen', satz: 5.0 },
  { land: 'Nordrhein-Westfalen', satz: 6.5 },
  { land: 'Rheinland-Pfalz', satz: 5.0 },
  { land: 'Saarland', satz: 6.5 },
  { land: 'Sachsen', satz: 5.5 },
  { land: 'Sachsen-Anhalt', satz: 5.0 },
  { land: 'Schleswig-Holstein', satz: 6.5 },
  { land: 'Thüringen', satz: 5.0 },
]

export const NOTAR_SATZ = 1.5
export const GRUNDBUCH_SATZ = 0.5
export const MAKLER_DEFAULT = 3.57

export function grestSatzFor(land: string): number {
  return GREST.find((g) => g.land === land)?.satz ?? 5.0
}

export const eur = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })

export const pct = (n: number) =>
  (Number.isFinite(n) ? n : 0).toLocaleString('de-DE', { minimumFractionDigits: 1, maximumFractionDigits: 2 }) + ' %'
