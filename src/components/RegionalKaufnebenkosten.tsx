import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { eur, pct } from '../lib/kaufnebenkosten'
import {
  REGIO, regioForSlug, nkQuote, GUENSTIGSTER, TEUERSTER,
  NOTAR_SATZ, GRUNDBUCH_SATZ, MAKLER_DEFAULT,
} from '../lib/regional'

const PREISE = [300000, 500000, 750000]

export default function RegionalKaufnebenkosten({ slug }: { slug: string }) {
  const regio = regioForSlug(slug)

  // Routing garantiert ein gültiges Bundesland; Fallback nur zur Sicherheit.
  if (!regio) {
    return (
      <div className="max-w-[680px] mx-auto text-center py-16">
        <p className="text-ink-mid text-sm mb-4">Bundesland nicht gefunden.</p>
        <a href="/kaufnebenkosten-index" className="text-green text-sm font-medium">← Kaufnebenkosten-Übersicht</a>
      </div>
    )
  }

  const { land, satz } = regio
  const quoteOhne = nkQuote(satz, false)
  const quoteMit = nkQuote(satz, true)
  const grest400 = (400000 * satz) / 100
  const guenstigsterGrest400 = (400000 * GUENSTIGSTER.satz) / 100
  const diffZuGuenstigstem = grest400 - guenstigsterGrest400
  const guenstigerAls = REGIO.filter((r) => r.satz < satz).length
  const teurerAls = REGIO.filter((r) => r.satz > satz).length

  const istGuenstigster = satz === GUENSTIGSTER.satz
  const istTeuerster = satz === TEUERSTER.satz
  const einordnung = istGuenstigster
    ? `${land} hat mit ${pct(satz)} den niedrigsten Grunderwerbsteuersatz in ganz Deutschland.`
    : istTeuerster
      ? `${land} gehört mit ${pct(satz)} zu den Bundesländern mit dem höchsten Grunderwerbsteuersatz.`
      : `Mit ${pct(satz)} liegt ${land} im Mittelfeld — günstiger als ${teurerAls} und teurer als ${guenstigerAls} der 16 Bundesländer.`

  const andere = REGIO.filter((r) => r.slug !== slug)

  useSEO({
    title: `Kaufnebenkosten in ${land} 2026: Grunderwerbsteuer & Gesamtkosten`,
    description: `Kaufnebenkosten in ${land}: Grunderwerbsteuer ${pct(satz)}, dazu Notar, Grundbuch und Makler — rund ${pct(quoteMit)} des Kaufpreises. Mit Rechenbeispielen für 300.000 bis 750.000 €.`,
    canonical: `https://immopruef.de/kaufnebenkosten-${slug}`,
    type: 'website',
    jsonLd: [
      faqSchema([
        {
          question: `Wie hoch ist die Grunderwerbsteuer in ${land} 2026?`,
          answer: `In ${land} beträgt die Grunderwerbsteuer ${pct(satz)} des Kaufpreises (Stand 2026). Bei einem Kaufpreis von 400.000 € sind das ${eur(grest400)}. Maßgeblich ist immer das Bundesland, in dem die Immobilie liegt, nicht der Wohnsitz des Käufers.`,
        },
        {
          question: `Wie hoch sind die gesamten Kaufnebenkosten in ${land}?`,
          answer: `Die Kaufnebenkosten in ${land} liegen bei rund ${pct(quoteOhne)} des Kaufpreises ohne Makler und ${pct(quoteMit)} mit Maklerprovision. Sie setzen sich zusammen aus Grunderwerbsteuer (${pct(satz)}), Notar (ca. ${pct(NOTAR_SATZ)}), Grundbuch (ca. ${pct(GRUNDBUCH_SATZ)}) und gegebenenfalls Maklerprovision (oft ${pct(MAKLER_DEFAULT)} für den Käufer).`,
        },
        {
          question: 'Muss ich die Kaufnebenkosten aus Eigenkapital bezahlen?',
          answer: 'Ja, in der Regel. Banken finanzieren die Kaufnebenkosten meist nicht mit, weil ihnen kein verwertbarer Sachwert gegenübersteht. Käufer sollten die Nebenkosten daher zusätzlich zum Eigenkapital für den Kaufpreis aus eigenen Mitteln aufbringen können.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Kaufnebenkosten je Bundesland', url: 'https://immopruef.de/kaufnebenkosten-index' },
        { name: land, url: `https://immopruef.de/kaufnebenkosten-${slug}` },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Kaufnebenkosten in {land} 2026
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          {einordnung} Zusammen mit Notar, Grundbuch und einer möglichen Maklerprovision kommen Sie beim Immobilienkauf
          in {land} auf rund <strong className="text-ink">{pct(quoteMit)}</strong> des Kaufpreises an Nebenkosten.
        </p>
      </header>

      <div className="bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-2">Die Posten in {land}</div>
        <Row label="Grunderwerbsteuer" sub={`Satz in ${land}`} value={pct(satz)} />
        <Row label="Notarkosten" sub="bundeseinheitlich (GNotKG)" value={`ca. ${pct(NOTAR_SATZ)}`} />
        <Row label="Grundbuchkosten" sub="bundeseinheitlich (GNotKG)" value={`ca. ${pct(GRUNDBUCH_SATZ)}`} />
        <Row label="Maklerprovision (Käuferanteil)" sub="falls Makler beteiligt, oft geteilt" value={`bis ${pct(MAKLER_DEFAULT)}`} />
        <div className="mt-3 bg-green/5 rounded-lg px-4 py-3 flex items-baseline justify-between gap-4">
          <div className="text-sm font-semibold text-green">Summe (mit Makler)</div>
          <div className="font-display text-xl font-semibold text-green tabular-nums">≈ {pct(quoteMit)}</div>
        </div>
        {regio.histNote && (
          <p className="text-[12px] text-ink-mid mt-3 leading-snug"><strong className="text-ink">Hinweis:</strong> {regio.histNote}</p>
        )}
      </div>

      <h2 className="font-display text-xl font-medium text-green mt-8 mb-3">Rechenbeispiele für {land}</h2>
      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm overflow-x-auto">
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-[11px] text-ink-light text-left border-b border-ink/10">
              <th className="font-medium py-1.5 pr-2">Kaufpreis</th>
              <th className="font-medium py-1.5 px-2 text-right">Grunderwerbsteuer</th>
              <th className="font-medium py-1.5 px-2 text-right">Nebenkosten ohne Makler</th>
              <th className="font-medium py-1.5 pl-2 text-right">mit Makler</th>
            </tr>
          </thead>
          <tbody>
            {PREISE.map((p) => (
              <tr key={p} className="border-b border-ink/5">
                <td className="py-1.5 pr-2 text-ink-mid">{eur(p)}</td>
                <td className="py-1.5 px-2 text-right text-ink-mid">{eur((p * satz) / 100)}</td>
                <td className="py-1.5 px-2 text-right text-ink-mid">{eur((p * quoteOhne) / 100)}</td>
                <td className="py-1.5 pl-2 text-right font-medium text-ink">{eur((p * quoteMit) / 100)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] text-ink-light mt-3 leading-snug">
          Notar ca. {pct(NOTAR_SATZ)}, Grundbuch ca. {pct(GRUNDBUCH_SATZ)}, Maklerprovision (Käuferanteil) {pct(MAKLER_DEFAULT)}.
          Werte gerundet — den genauen Betrag für Ihren Kaufpreis liefert der{' '}
          <a href="/grunderwerbsteuer-rechner" className="text-green hover:text-green-mid underline">Kaufnebenkosten-Rechner</a>.
        </p>
      </div>

      {!istGuenstigster && (
        <div className="mt-5 bg-cream border border-ink/10 rounded-xl p-5">
          <p className="text-sm text-ink-mid leading-relaxed">
            <strong className="text-ink">Im Vergleich:</strong> Allein bei der Grunderwerbsteuer zahlen Käufer in {land}{' '}
            bei einem Kaufpreis von 400.000 € rund <strong className="text-ink">{eur(diffZuGuenstigstem)}</strong> mehr als
            im günstigsten Bundesland {GUENSTIGSTER.land} ({pct(GUENSTIGSTER.satz)}). Wo Ihr Bundesland insgesamt steht,
            zeigt der{' '}
            <a href="/kaufnebenkosten-index" className="text-green hover:text-green-mid underline">Kaufnebenkosten-Vergleich aller Bundesländer</a>.
          </p>
        </div>
      )}

      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Wie sich die Nebenkosten genau zusammensetzen, erklärt der Ratgeber{' '}
          <a href="/blog/kaufnebenkosten-immobilienkauf" className="text-green hover:text-green-mid underline">Kaufnebenkosten beim Immobilienkauf</a>,
          die Details zur Steuer{' '}
          <a href="/blog/grunderwerbsteuer-2026-bundeslaender" className="text-green hover:text-green-mid underline">Grunderwerbsteuer 2026 nach Bundesland</a>.
          Wie viel insgesamt zum Budget passt, berechnet der{' '}
          <a href="/budgetrechner" className="text-green hover:text-green-mid underline">Budgetrechner</a>.
          Den amtlichen Bodenwert Ihrer Lage finden Sie über{' '}
          <a href={`/bodenrichtwert-${slug}`} className="text-green hover:text-green-mid underline">Bodenrichtwert in {land} abfragen</a>.
        </p>
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Objekt in {land} im Blick?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link Preis, Lage, Kosten und Risiken — inklusive der Kaufnebenkosten für {land}.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>

      <section className="mt-10 pt-6 border-t border-ink/10">
        <h2 className="font-display text-base font-medium text-ink mb-3">Kaufnebenkosten in anderen Bundesländern</h2>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {andere.map((r) => (
            <a key={r.slug} href={`/kaufnebenkosten-${r.slug}`} className="text-[13px] text-green hover:text-green-mid underline">
              {r.land} ({pct(r.satz)})
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

function Row({ label, sub, value }: { label: string; sub?: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-2.5 border-b border-ink/8">
      <div>
        <div className="text-sm text-ink-mid">{label}</div>
        {sub && <div className="text-[11px] text-ink-light">{sub}</div>}
      </div>
      <div className="text-right tabular-nums text-sm font-medium text-ink">{value}</div>
    </div>
  )
}
