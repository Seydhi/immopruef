import { STAND_ISO } from '../lib/quellen'
import { useSEO, breadcrumbSchema, faqSchema } from '../lib/useSEO'
import { FaqSection, type FaqItem } from './calcUi'

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

// Frage → Rechner: dieselbe Zuordnung, nach der Käufer (und KI-Assistenten) suchen.
const FRAGEN: { frage: string; href: string; tool: string; ergebnis: string }[] = [
  { frage: 'Wie viel Immobilie kann ich mir leisten?', href: '/budgetrechner', tool: 'Budgetrechner', ergebnis: 'Maximaler Kaufpreis aus Nettoeinkommen, Eigenkapital, Zins und Tilgung' },
  { frage: 'Was kostet der Kauf zusätzlich zum Kaufpreis?', href: '/grunderwerbsteuer-rechner', tool: 'Kaufnebenkosten-Rechner', ergebnis: 'Grunderwerbsteuer des Bundeslands, Notar, Grundbuch und Makler in Euro' },
  { frage: 'Wie hoch sind Notar- und Grundbuchkosten genau?', href: '/notarkosten-rechner', tool: 'Notarkosten-Rechner', ergebnis: 'Einzelgebühren nach GNotKG für Kaufvertrag und Grundschuld, inklusive Umsatzsteuer' },
  { frage: 'Wie hoch ist meine Rate und was bleibt nach der Zinsbindung?', href: '/tilgungsrechner', tool: 'Tilgungsrechner', ergebnis: 'Monatsrate, Restschuld, Gesamtzinsen und Tilgungsplan' },
  { frage: 'Ist Kaufen langfristig besser als Mieten?', href: '/mieten-oder-kaufen-rechner', tool: 'Mieten-oder-Kaufen-Rechner', ergebnis: 'Vermögensvergleich beider Wege und das Break-even-Jahr' },
  { frage: 'Lohnt sich die Wohnung als Kapitalanlage?', href: '/mietrendite-rechner', tool: 'Mietrendite-Rechner', ergebnis: 'Brutto- und Nettomietrendite sowie Kaufpreisfaktor' },
  { frage: 'Wie viel sollte ich für Reparaturen zurücklegen?', href: '/instandhaltungsruecklage-rechner', tool: 'Instandhaltungsrücklage-Rechner', ergebnis: 'Monatliche Rücklage nach Faustregel und Peterscher Formel' },
  { frage: 'Stimmt die Wohnfläche im Exposé?', href: '/wohnflaechen-rechner', tool: 'Wohnflächenrechner', ergebnis: 'Anrechenbare Fläche nach WoFlV und der echte Quadratmeterpreis' },
  { frage: 'In welchem Bundesland sind die Nebenkosten am höchsten?', href: '/kaufnebenkosten-index', tool: 'Kaufnebenkosten je Bundesland', ergebnis: 'Vergleich aller 16 Bundesländer in einer Tabelle' },
]

const faqs: FaqItem[] = [
  {
    question: 'Sind die Immobilien-Rechner von ImmoPrüf kostenlos?',
    answer: 'Ja. Alle neun Rechner sind kostenlos und ohne Anmeldung nutzbar. Die Berechnung läuft direkt im Browser, das Ergebnis erscheint sofort.',
  },
  {
    question: 'Mit welchem Rechner sollte ich beim Immobilienkauf anfangen?',
    answer: 'Sinnvoll ist die Reihenfolge Budget, Nebenkosten, Finanzierung: Der Budgetrechner zeigt den leistbaren Kaufpreis, der Kaufnebenkosten-Rechner die zusätzlichen Kosten von 5,5 bis rund 12 Prozent des Kaufpreises, der Tilgungsrechner die Monatsrate und die Restschuld am Ende der Zinsbindung.',
  },
  {
    question: 'Wie genau sind die Ergebnisse der Rechner?',
    answer: 'Grunderwerbsteuer und Notargebühren folgen gesetzlichen Vorgaben: den Steuersätzen der Bundesländer (3,5 bis 6,5 Prozent) und der Gebührentabelle des GNotKG. Zins, Maklerprovision, Miete oder Wertentwicklung sind Ihre eigenen Annahmen. Die Ergebnisse sind eine Orientierung und ersetzen weder ein Bankangebot noch die Kostenrechnung des Notars.',
  },
  {
    question: 'Was ist der Unterschied zwischen den Rechnern und einer ImmoPrüf-Analyse?',
    answer: 'Die Rechner rechnen mit Zahlen, die Sie selbst eingeben. Die ImmoPrüf-Analyse prüft ein konkretes Objekt: Aus dem Exposé-Link oder PDF entsteht eine Ersteinschätzung zu Preis, Standort, Kaufnebenkosten, Risiken und Finanzierung. Sie kostet ab 19 Euro, der Premium-Report 79 Euro.',
  },
]

export default function RechnerHub() {
  useSEO({
    title: 'Immobilien-Rechner: alle kostenlosen Tools im Überblick',
    description:
      'Alle kostenlosen Immobilien-Rechner: Kaufnebenkosten, Budget, Tilgung, Notarkosten, Mietrendite, Rücklage und Wohnfläche — ohne Anmeldung nutzbar.',
    canonical: 'https://immopruef.de/rechner',
    type: 'website',
    modifiedTime: STAND_ISO,
    author: true,
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
      faqSchema(faqs),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Immobilien-Rechner: alle Tools auf einen Blick
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          ImmoPrüf bietet neun kostenlose Rechner für den Immobilienkauf in Deutschland: Budget, Kaufnebenkosten
          und Grunderwerbsteuer, Notarkosten, Tilgung, Mieten oder Kaufen, Mietrendite, Instandhaltungsrücklage,
          Wohnfläche und einen Bundesländer-Vergleich. Alle sind ohne Anmeldung nutzbar und rechnen sofort im
          Browser.
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

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink mb-3">Welcher Rechner beantwortet welche Frage?</h2>
        <div className="overflow-x-auto bg-white border border-ink/10 rounded-xl">
          <table className="w-full text-[13px] text-left">
            <thead>
              <tr className="border-b border-ink/10 text-ink">
                <th scope="col" className="px-4 py-2.5 font-medium">Ihre Frage</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Rechner</th>
                <th scope="col" className="px-4 py-2.5 font-medium">Ergebnis</th>
              </tr>
            </thead>
            <tbody>
              {FRAGEN.map((r) => (
                <tr key={r.href} className="border-b border-ink/5 last:border-0 align-top">
                  <td className="px-4 py-2.5 text-ink">{r.frage}</td>
                  <td className="px-4 py-2.5"><a href={r.href} className="text-green hover:text-green-mid underline">{r.tool}</a></td>
                  <td className="px-4 py-2.5 text-ink-mid">{r.ergebnis}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold text-ink mb-3">In welcher Reihenfolge rechnen Käufer am besten?</h2>
        <ol className="list-decimal pl-5 space-y-2 text-sm text-ink-mid leading-relaxed">
          <li><strong className="text-ink">Budget klären:</strong> Der <a href="/budgetrechner" className="text-green underline">Budgetrechner</a> leitet aus Einkommen und Eigenkapital den Kaufpreis ab, den Sie dauerhaft tragen können.</li>
          <li><strong className="text-ink">Nebenkosten einplanen:</strong> Zum Kaufpreis kommen 5,5 bis rund 12 Prozent Kaufnebenkosten. Die Grunderwerbsteuer liegt je nach Bundesland zwischen 3,5 und 6,5 Prozent, Notar und Grundbuch kosten zusammen rund 2 Prozent.</li>
          <li><strong className="text-ink">Finanzierung durchrechnen:</strong> Der <a href="/tilgungsrechner" className="text-green underline">Tilgungsrechner</a> zeigt Monatsrate, Gesamtzinsen und die Restschuld am Ende der Zinsbindung.</li>
          <li><strong className="text-ink">Objekt prüfen:</strong> Wohnfläche, Rücklage und bei Kapitalanlagen die Mietrendite zeigen, ob der Angebotspreis zum Objekt passt.</li>
        </ol>
      </section>

      <FaqSection title="Häufige Fragen zu den Immobilien-Rechnern" items={faqs} />

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
