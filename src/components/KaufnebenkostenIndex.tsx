import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { eur, pct } from '../lib/kaufnebenkosten'
import { REGIO, nkQuote, GUENSTIGSTER, TEUERSTER, NOTAR_SATZ, GRUNDBUCH_SATZ, MAKLER_DEFAULT } from '../lib/regional'

const MODELL = 400000

export default function KaufnebenkostenIndex() {
  // Sortiert nach Gesamt-Nebenkosten (= nach GrESt-Satz) aufsteigend
  const ranked = [...REGIO]
    .map((r) => ({
      ...r,
      grest: (MODELL * r.satz) / 100,
      totalMit: (MODELL * nkQuote(r.satz, true)) / 100,
      totalOhne: (MODELL * nkQuote(r.satz, false)) / 100,
      rang: REGIO.filter((x) => x.satz < r.satz).length + 1,
    }))
    .sort((a, b) => a.satz - b.satz || a.land.localeCompare(b.land))

  const diffMax = (MODELL * (TEUERSTER.satz - GUENSTIGSTER.satz)) / 100

  useSEO({
    title: 'Kaufnebenkosten je Bundesland 2026: Der große Vergleich',
    description: `Kaufnebenkosten aller 16 Bundesländer im Vergleich (Stand 2026): Bei 400.000 € Kaufpreis liegen zwischen dem günstigsten (${GUENSTIGSTER.land}) und teuersten Bundesland bis zu ${eur(diffMax).replace(/\s?€/, '')} € Unterschied — allein bei der Grunderwerbsteuer.`,
    canonical: 'https://immopruef.de/kaufnebenkosten-index',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Dataset',
        name: 'Kaufnebenkosten je Bundesland 2026',
        description: 'Grunderwerbsteuersätze und gesamte Kaufnebenkosten (Notar, Grundbuch, Maklerprovision) je Bundesland in Deutschland, Stand 2026, berechnet für einen Modell-Kaufpreis von 400.000 €.',
        creator: { '@type': 'Organization', name: 'ImmoPrüf', url: 'https://immopruef.de' },
        url: 'https://immopruef.de/kaufnebenkosten-index',
        inLanguage: 'de-DE',
        spatialCoverage: 'Deutschland',
        license: 'https://immopruef.de/impressum',
      },
      faqSchema([
        {
          question: 'In welchem Bundesland sind die Kaufnebenkosten am niedrigsten?',
          answer: `Am niedrigsten sind die Kaufnebenkosten in ${GUENSTIGSTER.land}, weil dort mit ${pct(GUENSTIGSTER.satz)} der niedrigste Grunderwerbsteuersatz Deutschlands gilt. Am höchsten ist die Steuer mit ${pct(TEUERSTER.satz)} unter anderem in ${TEUERSTER.land}. Bei 400.000 € Kaufpreis macht das allein bei der Grunderwerbsteuer ${eur(diffMax)} Unterschied aus.`,
        },
        {
          question: 'Wie hoch sind die Kaufnebenkosten in Deutschland insgesamt?',
          answer: 'Die Kaufnebenkosten liegen je nach Bundesland und Maklerbeteiligung bei rund 6 bis über 15 Prozent des Kaufpreises. Sie bestehen aus Grunderwerbsteuer (3,5 bis 6,5 Prozent), Notar (ca. 1,5 Prozent), Grundbuch (ca. 0,5 Prozent) und gegebenenfalls Maklerprovision (oft 3,57 Prozent für den Käufer).',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Kaufnebenkosten je Bundesland', url: 'https://immopruef.de/kaufnebenkosten-index' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Kaufnebenkosten je Bundesland 2026: der große Vergleich
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Wo Immobilienkäufer am meisten und am wenigsten zahlen: Bei einem Kaufpreis von {eur(MODELL)} liegen zwischen
          dem günstigsten Bundesland <strong className="text-ink">{GUENSTIGSTER.land}</strong> ({pct(GUENSTIGSTER.satz)})
          und dem teuersten ({pct(TEUERSTER.satz)}) allein bei der Grunderwerbsteuer{' '}
          <strong className="text-ink">{eur(diffMax)}</strong> Unterschied. Stand 2026.
        </p>
      </header>

      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-[11px] text-ink-light text-left border-b border-ink/10">
              <th className="font-medium py-1.5 pr-2">#</th>
              <th className="font-medium py-1.5 px-2">Bundesland</th>
              <th className="font-medium py-1.5 px-2 text-right">GrESt</th>
              <th className="font-medium py-1.5 pl-2 text-right">Nebenkosten (400.000 €)</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((r) => (
              <tr key={r.slug} className="border-b border-ink/5">
                <td className="py-1.5 pr-2 text-ink-light">{r.rang}</td>
                <td className="py-1.5 px-2">
                  <a href={`/kaufnebenkosten-${r.slug}`} className="text-green hover:text-green-mid underline">{r.land}</a>
                </td>
                <td className="py-1.5 px-2 text-right text-ink-mid">{pct(r.satz)}</td>
                <td className="py-1.5 pl-2 text-right font-medium text-ink">{eur(r.totalMit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-5 bg-cream border border-ink/10 rounded-xl p-5">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-2">Methodik</div>
        <p className="text-[13px] text-ink-mid leading-relaxed">
          Modell-Kaufpreis {eur(MODELL)}. Kaufnebenkosten = Grunderwerbsteuer (Landessatz, Stand 2026) + Notar
          (ca. {pct(NOTAR_SATZ)}) + Grundbuch (ca. {pct(GRUNDBUCH_SATZ)}) + Maklerprovision Käuferanteil ({pct(MAKLER_DEFAULT)}).
          Notar- und Grundbuchkosten sind bundeseinheitlich im GNotKG geregelt; die Grunderwerbsteuer legt jedes
          Bundesland selbst fest. Werte gerundet. Daten frei nutzbar mit Quellenangabe „ImmoPrüf (immopruef.de)".
        </p>
      </div>

      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Den genauen Betrag für Ihren Kaufpreis berechnet der{' '}
          <a href="/grunderwerbsteuer-rechner" className="text-green hover:text-green-mid underline">Kaufnebenkosten-Rechner</a>;
          Hintergründe liefern die Ratgeber{' '}
          <a href="/blog/grunderwerbsteuer-2026-bundeslaender" className="text-green hover:text-green-mid underline">Grunderwerbsteuer 2026</a>{' '}
          und{' '}
          <a href="/blog/kaufnebenkosten-immobilienkauf" className="text-green hover:text-green-mid underline">Kaufnebenkosten beim Immobilienkauf</a>.
        </p>
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Konkretes Objekt im Blick?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf rechnet die Kaufnebenkosten für das richtige Bundesland direkt in die Analyse Ihres Exposés ein.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
