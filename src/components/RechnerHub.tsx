import { useSEO, breadcrumbSchema } from '../lib/useSEO'

interface Tool { href: string; name: string; desc: string }

const TOOLS: Tool[] = [
  { href: '/grunderwerbsteuer-rechner', name: 'Kaufnebenkosten- & Grunderwerbsteuer-Rechner', desc: 'Grunderwerbsteuer je Bundesland, Notar, Grundbuch und Maklerprovision für Ihren Kaufpreis.' },
  { href: '/notarkosten-rechner', name: 'Notarkosten-Rechner (GNotKG)', desc: 'Notar- und Grundbuchkosten exakt nach GNotKG-Gebührentabelle — Kaufvertrag, Grundschuld und USt einzeln aufgeschlüsselt.' },
  { href: '/budgetrechner', name: 'Budgetrechner', desc: 'Wie viel Immobilie kann ich mir leisten? Aus Einkommen, Eigenkapital, Zins und Tilgung.' },
  { href: '/tilgungsrechner', name: 'Tilgungsrechner', desc: 'Monatsrate, Restschuld nach Zinsbindung, Gesamtzinsen und Tilgungsplan — inkl. Sondertilgung.' },
  { href: '/mieten-oder-kaufen-rechner', name: 'Mieten-oder-Kaufen-Rechner', desc: 'Vermögensvergleich über die Zeit mit Break-even-Jahr — kaufen oder mieten und anlegen?' },
  { href: '/mietrendite-rechner', name: 'Mietrendite- & Kaufpreisfaktor-Rechner', desc: 'Brutto- und Nettomietrendite, Kaufpreisfaktor und Quadratmeterpreis für die Kapitalanlage.' },
  { href: '/instandhaltungsruecklage-rechner', name: 'Instandhaltungsrücklage-Rechner', desc: 'Empfohlene Rücklage je Monat nach Faustregel und Peterscher Formel — mit Ampel.' },
  { href: '/wohnflaechen-rechner', name: 'Wohnflächenrechner (WoFlV)', desc: 'Anrechenbare Wohnfläche und echter Quadratmeterpreis — deckt zu großzügige Angaben auf.' },
  { href: '/kaufnebenkosten-index', name: 'Kaufnebenkosten je Bundesland', desc: 'Vergleich der Kaufnebenkosten aller 16 Bundesländer — wo Käufer am meisten zahlen.' },
]

export default function RechnerHub() {
  useSEO({
    title: 'Immobilien-Rechner: alle kostenlosen Tools im Überblick',
    description:
      'Alle kostenlosen Immobilien-Rechner: Kaufnebenkosten, Budget, Tilgung, Notarkosten, Mietrendite, Rücklage und Wohnfläche — ohne Anmeldung nutzbar.',
    canonical: 'https://immopruef.de/rechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        name: 'Immobilien-Rechner von ImmoPrüf',
        itemListElement: TOOLS.map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          url: `https://immopruef.de${t.href}`,
        })),
      },
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Rechner', url: 'https://immopruef.de/rechner' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Immobilien-Rechner: alle Tools auf einen Blick
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Alle kostenlosen Rechner von ImmoPrüf rund um den Immobilienkauf — von den Kaufnebenkosten über die
          Finanzierung bis zur Mietrendite. Ohne Anmeldung, sofort nutzbar.
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TOOLS.map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="group bg-white border border-ink/10 rounded-xl p-4 hover:border-green/30 hover:shadow-sm transition-all"
          >
            <div className="font-display text-base font-medium text-green group-hover:text-green-mid mb-1">{t.name}</div>
            <p className="text-[13px] text-ink-mid leading-relaxed">{t.desc}</p>
          </a>
        ))}
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Konkretes Objekt gefunden?</h2>
        <p className="text-cream/70 text-sm mb-4">
          Die Rechner geben Orientierung — ImmoPrüf prüft aus dem Exposé-Link Preis, Lage, Kosten und Risiken des
          konkreten Objekts.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
