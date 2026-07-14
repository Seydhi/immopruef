// Daten für die "Bodenrichtwert je Bundesland"-Serie (/bodenrichtwert-<land>).
// Baut auf REGIO (kaufnebenkosten.ts → regional.ts) auf, damit jede Seite auch
// den Grunderwerbsteuer-Kontext des Landes trägt (single source of truth).
import { REGIO } from './regional'

// Offizielles bundesweites Portal — deckt fast alle Regionen ab, kostenlos.
export const BORIS_D = 'https://www.bodenrichtwerte-boris.de/'

export interface BodenLand {
  land: string
  slug: string
  satz: number // Grunderwerbsteuer in %, als Kontext
  portalName: string // Name des Landesportals (Marke)
  portalUrl?: string // direkter Link, nur bei stabiler offizieller Domain
  note?: string // nur verifizierte Besonderheiten
}

// Landesportale: nur klare, stabile offizielle Domains verlinkt.
// Ohne url → Seite verweist auf das bundesweite BORIS-D und nennt die Stelle.
const PORTAL: Record<string, { name: string; url?: string; note?: string }> = {
  'Baden-Württemberg': { name: 'BORIS-BW', url: 'https://www.gutachterausschuesse-bw.de/' },
  'Bayern': { name: 'BORIS-Bayern', url: 'https://www.boris-bayern.de/', note: 'Bayern stellt die Bodenrichtwerte aller Gutachterausschüsse zentral über BORIS-Bayern bereit.' },
  'Berlin': { name: 'BORIS Berlin', url: 'https://www.berlin.de/gutachterausschuss/marktinformationen/bodenrichtwerte/', note: 'In Berlin ermittelt ein zentraler Gutachterausschuss die Bodenrichtwerte für das gesamte Stadtgebiet.' },
  'Brandenburg': { name: 'BORIS Brandenburg', url: 'https://www.boris-brandenburg.de/' },
  'Bremen': { name: 'BORIS Bremen', url: 'https://www.gutachterausschuss.bremen.de/', note: 'Für Bremen und Bremerhaven bestehen jeweils eigene Gutachterausschüsse.' },
  'Hamburg': { name: 'BORIS-HH', url: 'https://geoportal-hamburg.de/boris/', note: 'In Hamburg ist ein zentraler Gutachterausschuss für das gesamte Stadtgebiet zuständig.' },
  'Hessen': { name: 'BORIS Hessen', url: 'https://hvbg.hessen.de/immobilienwerte/boris-hessen' },
  'Mecklenburg-Vorpommern': { name: 'das Bodenrichtwertportal Mecklenburg-Vorpommern' },
  'Niedersachsen': { name: 'BORIS.NI', url: 'https://immobilienmarkt.niedersachsen.de/bodenrichtwerte' },
  'Nordrhein-Westfalen': { name: 'BORISplus.NRW', url: 'https://www.boris.nrw.de/', note: 'BORISplus.NRW bündelt die Bodenrichtwerte aller nordrhein-westfälischen Gutachterausschüsse.' },
  'Rheinland-Pfalz': { name: 'das Bodenrichtwertportal Rheinland-Pfalz' },
  'Saarland': { name: 'das Bodenrichtwertportal des Saarlandes' },
  'Sachsen': { name: 'BORIS.Sachsen', url: 'https://www.boris.sachsen.de/' },
  'Sachsen-Anhalt': { name: 'das Bodenrichtwertportal Sachsen-Anhalt' },
  'Schleswig-Holstein': { name: 'BORIS-SH', url: 'https://www.schleswig-holstein.de/DE/GAA/Bodenrichtwerte/bodenrichtwerte_node.html' },
  'Thüringen': { name: 'BORIS-TH', url: 'https://tlbg.thueringen.de/' },
}

export const BODEN: BodenLand[] = REGIO.map((r) => ({
  land: r.land,
  slug: r.slug,
  satz: r.satz,
  portalName: PORTAL[r.land]?.name ?? 'BORIS',
  portalUrl: PORTAL[r.land]?.url,
  note: PORTAL[r.land]?.note,
}))

export function bodenForSlug(slug: string): BodenLand | undefined {
  return BODEN.find((b) => b.slug === slug)
}
