import { useState, useMemo } from 'react'
import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { GREST, NOTAR_SATZ, GRUNDBUCH_SATZ, eur, pct } from '../lib/kaufnebenkosten'
import { REGIO, nkQuote, GUENSTIGSTER, TEUERSTER, MAKLER_DEFAULT } from '../lib/regional'
import { FaqSection, type FaqItem } from './calcUi'

// Kennzahlen für Kurzantwort, FAQ und Ländertabelle: alles aus dem Kanon
// (kaufnebenkosten.ts / regional.ts) abgeleitet, nichts hart kodiert.
const MODELL = 400000
const OHNE_MIN = nkQuote(GUENSTIGSTER.satz, false)
const OHNE_MAX = nkQuote(TEUERSTER.satz, false)
const MIT_MIN = nkQuote(GUENSTIGSTER.satz, true)
const MIT_MAX = nkQuote(TEUERSTER.satz, true)

export default function Rechner() {
  const [preis, setPreis] = useState(400000)
  const [land, setLand] = useState('Nordrhein-Westfalen')
  const [maklerSatz, setMaklerSatz] = useState(3.57)
  const [provisionsfrei, setProvisionsfrei] = useState(false)
  const [inventar, setInventar] = useState(0)

  const grestSatz = useMemo(() => GREST.find((g) => g.land === land)?.satz ?? 5.0, [land])

  const r = useMemo(() => {
    const p = Number.isFinite(preis) && preis > 0 ? preis : 0
    // Bewegliches Inventar (Küche, Möbel …) mindert nur die GrESt-Bemessungsgrundlage;
    // Notar/Grundbuch (Geschäftswert = Gesamtpreis) und Makler bleiben auf dem vollen Preis.
    const inv = Math.min(Number.isFinite(inventar) && inventar > 0 ? inventar : 0, p)
    const grestBasis = p - inv
    const grest = grestBasis * (grestSatz / 100)
    const notar = p * (NOTAR_SATZ / 100)
    const grundbuch = p * (GRUNDBUCH_SATZ / 100)
    const makler = provisionsfrei ? 0 : p * (maklerSatz / 100)
    const neben = grest + notar + grundbuch + makler
    return {
      inv, grestBasis, grest, notar, grundbuch, makler, neben,
      nebenProzent: p > 0 ? (neben / p) * 100 : 0,
      gesamt: p + neben,
    }
  }, [preis, inventar, grestSatz, maklerSatz, provisionsfrei])

  // Eine Quelle für sichtbaren FAQ-Abschnitt und FAQPage-JSON-LD (Text = Schema).
  const faqs: FaqItem[] = [
    {
      question: 'Wie hoch sind die Kaufnebenkosten beim Immobilienkauf?',
      answer:
        `Die Kaufnebenkosten liegen je nach Bundesland bei ${pct(OHNE_MIN)} bis ${pct(OHNE_MAX)} des Kaufpreises ohne Makler und bei ${pct(MIT_MIN)} bis ${pct(MIT_MAX)} mit Maklerprovision. Sie bestehen aus Grunderwerbsteuer (${pct(GUENSTIGSTER.satz)} bis ${pct(TEUERSTER.satz)}), Notar (rund ${pct(NOTAR_SATZ)}), Grundbuch (rund ${pct(GRUNDBUCH_SATZ)}) und gegebenenfalls dem Käuferanteil der Maklerprovision (oft ${pct(MAKLER_DEFAULT)}).`,
    },
    {
      question: 'Wie viel Grunderwerbsteuer zahle ich?',
      answer:
        'Die Grunderwerbsteuer hängt vom Bundesland ab und reicht 2026 von 3,5 % in Bayern bis 6,5 % in Brandenburg, Nordrhein-Westfalen, dem Saarland und Schleswig-Holstein.',
    },
    {
      question: 'Werden die Kaufnebenkosten von der Bank mitfinanziert?',
      answer:
        'In der Regel nicht. Banken finanzieren die Nebenkosten meist nicht mit, sodass Sie diese aus Eigenkapital aufbringen müssen.',
    },
    {
      question: 'Kann ich die Grunderwerbsteuer legal senken?',
      answer:
        'Ja: Mitverkauftes bewegliches Inventar wie Einbauküche, Möbel oder Sauna unterliegt nicht der Grunderwerbsteuer, wenn sein Zeitwert im Kaufvertrag getrennt ausgewiesen ist. Als Faustregel akzeptieren Finanzämter Inventaranteile bis etwa 15 % des Kaufpreises, sofern die Werte realistisch und belegbar sind.',
    },
  ]

  useSEO({
    title: 'Kaufnebenkosten-Rechner 2026: Grunderwerbsteuer & Notar',
    description:
      'Kostenloser Kaufnebenkosten-Rechner: Grunderwerbsteuer (3,5–6,5 %), Notar, Grundbuch und Makler sofort berechnen — mit Gesamtkosten auf einen Blick.',
    canonical: 'https://immopruef.de/grunderwerbsteuer-rechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImmoPrüf Kaufnebenkosten-Rechner',
        url: 'https://immopruef.de/grunderwerbsteuer-rechner',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage: 'de-DE',
        description:
          'Berechnet Grunderwerbsteuer, Notar-, Grundbuch- und Maklerkosten sowie die Gesamtkosten beim Immobilienkauf je Bundesland.',
      },
      faqSchema(faqs),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Kaufnebenkosten-Rechner', url: 'https://immopruef.de/grunderwerbsteuer-rechner' },
      ]),
    ],
  })

  const Row = ({ label, sub, value, strong = false }: { label: string; sub?: string; value: string; strong?: boolean }) => (
    <div className={`flex items-baseline justify-between gap-4 py-2.5 ${strong ? '' : 'border-b border-ink/8'}`}>
      <div>
        <div className={`text-sm ${strong ? 'font-semibold text-ink' : 'text-ink-mid'}`}>{label}</div>
        {sub && <div className="text-[11px] text-ink-light">{sub}</div>}
      </div>
      <div className={`text-right tabular-nums ${strong ? 'font-display text-lg font-semibold text-green' : 'text-sm font-medium text-ink'}`}>
        {value}
      </div>
    </div>
  )

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Kaufnebenkosten-Rechner 2026
        </h1>
        <p className="text-ink text-[15px] leading-relaxed mb-3">
          <strong className="font-semibold">Wie hoch sind die Kaufnebenkosten?</strong> Beim Immobilienkauf in
          Deutschland fallen ohne Makler je nach Bundesland {pct(OHNE_MIN)} bis {pct(OHNE_MAX)} des Kaufpreises an, mit
          Maklerprovision {pct(MIT_MIN)} bis {pct(MIT_MAX)}. Die Posten: Grunderwerbsteuer ({pct(GUENSTIGSTER.satz)} bis{' '}
          {pct(TEUERSTER.satz)}), Notar (ca. {pct(NOTAR_SATZ)}), Grundbuch (ca. {pct(GRUNDBUCH_SATZ)}) und gegebenenfalls
          Makler (oft {pct(MAKLER_DEFAULT)}). Bei {eur(MODELL)} Kaufpreis sind das {eur((MODELL * OHNE_MIN) / 100)} bis{' '}
          {eur((MODELL * MIT_MAX) / 100)}.
        </p>
        <p className="text-ink-mid text-sm leading-relaxed">
          Berechnen Sie Grunderwerbsteuer, Notar, Grundbuch und Maklerprovision für Ihr Bundesland — und sehen Sie die
          Gesamtkosten Ihres Immobilienkaufs auf einen Blick. Kostenlos, ohne Anmeldung.
        </p>
      </header>

      {/* Eingabe */}
      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm">
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Kaufpreis der Immobilie</label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={1000}
                value={Number.isFinite(preis) ? preis : ''}
                onChange={(e) => setPreis(Math.max(0, Math.round(Number(e.target.value))))}
                className="w-full border border-ink/20 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors tabular-nums"
                placeholder="400000"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light text-sm">€</span>
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Bundesland</label>
            <select
              value={land}
              onChange={(e) => setLand(e.target.value)}
              className="w-full border border-ink/20 rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors"
            >
              {GREST.map((g) => (
                <option key={g.land} value={g.land}>
                  {g.land} — {pct(g.satz)} Grunderwerbsteuer
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">
              davon bewegliches Inventar <span className="font-normal text-ink-light">(optional)</span>
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                step={500}
                value={Number.isFinite(inventar) ? inventar : ''}
                onChange={(e) => setInventar(Math.max(0, Math.round(Number(e.target.value))))}
                className="w-full border border-ink/20 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors tabular-nums"
                placeholder="0"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light text-sm">€</span>
            </div>
            <p className="text-[11px] text-ink-light mt-1">
              Einbauküche, Möbel, Sauna & Co. mindern die Grunderwerbsteuer, wenn sie im Kaufvertrag getrennt
              ausgewiesen sind (Zeitwert!) — Details im{' '}
              <a href="/blog/grunderwerbsteuer-sparen-inventar" className="text-green hover:text-green-mid underline">Inventar-Ratgeber</a>.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[13px] font-medium text-ink-mid">Maklerprovision (Käuferanteil)</label>
              <label className="flex items-center gap-1.5 text-[12px] text-ink-mid cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={provisionsfrei}
                  onChange={(e) => setProvisionsfrei(e.target.checked)}
                  className="w-3.5 h-3.5 accent-green cursor-pointer"
                />
                provisionsfrei
              </label>
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                max={10}
                step={0.01}
                disabled={provisionsfrei}
                value={maklerSatz}
                onChange={(e) => setMaklerSatz(Math.max(0, Number(e.target.value)))}
                className="w-full border border-ink/20 rounded-lg pl-3.5 pr-8 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors tabular-nums disabled:opacity-50"
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light text-sm">%</span>
            </div>
            <p className="text-[11px] text-ink-light mt-1">
              Üblich sind 2,98–3,57 % inkl. MwSt. (seit Dez. 2020 max. die Hälfte der Gesamtprovision).
            </p>
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="mt-5 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1">Ihre Kaufnebenkosten</div>
        <Row
          label="Grunderwerbsteuer"
          sub={r.inv > 0 ? `${pct(grestSatz)} · ${land} · auf ${eur(r.grestBasis)} (ohne Inventar)` : `${pct(grestSatz)} · ${land}`}
          value={eur(r.grest)}
        />
        <Row label="Notarkosten" sub={`ca. ${pct(NOTAR_SATZ)}`} value={eur(r.notar)} />
        <Row label="Grundbuchkosten" sub={`ca. ${pct(GRUNDBUCH_SATZ)}`} value={eur(r.grundbuch)} />
        <Row
          label="Maklerprovision"
          sub={provisionsfrei ? 'provisionsfrei' : `${pct(maklerSatz)} Käuferanteil`}
          value={eur(r.makler)}
        />
        <div className="mt-2 pt-2 border-t-2 border-gold/30">
          <Row
            label="Kaufnebenkosten gesamt"
            sub={`≈ ${pct(r.nebenProzent)} des Kaufpreises`}
            value={eur(r.neben)}
            strong
          />
        </div>
        <div className="mt-3 bg-green/5 rounded-lg px-4 py-3 flex items-baseline justify-between gap-4">
          <div className="text-sm font-semibold text-green">Gesamtkosten (Kaufpreis + Nebenkosten)</div>
          <div className="font-display text-xl font-semibold text-green tabular-nums">{eur(r.gesamt)}</div>
        </div>
        <p className="text-[11px] text-ink-light mt-3 leading-snug">
          Notar- und Grundbuchkosten sind hier mit {pct(NOTAR_SATZ)} bzw. {pct(GRUNDBUCH_SATZ)} pauschal geschätzt —
          exakt nach GNotKG-Tabelle (inkl. Grundschuld) berechnet sie der{' '}
          <a href="/notarkosten-rechner" className="text-green hover:text-green-mid underline">Notarkosten-Rechner</a>.
          Hinzu kommen ggf. Kosten für Finanzierung, Umzug, Sanierung und Rücklagen. Keine Rechts- oder Steuerberatung.
        </p>
      </div>

      {/* Ländertabelle: statisch aus dem Kanon gerendert */}
      <section className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink mb-2">
          Grunderwerbsteuer 2026: Sätze aller 16 Bundesländer
        </h2>
        <p className="text-sm text-ink-mid leading-relaxed mb-3">
          Die Grunderwerbsteuer ist der größte Posten der Kaufnebenkosten. Der Satz reicht von {pct(GUENSTIGSTER.satz)}{' '}
          in {GUENSTIGSTER.land} bis {pct(TEUERSTER.satz)} in {REGIO.filter((x) => x.satz === TEUERSTER.satz).length}{' '}
          Bundesländern. Die Tabelle zeigt Satz und Steuerbetrag für einen Kaufpreis von {eur(MODELL)} sowie die
          Nebenkosten ohne Makler (Steuer, Notar, Grundbuch).
        </p>
        <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm overflow-x-auto">
          <table className="w-full text-sm tabular-nums">
            <caption className="sr-only">Grunderwerbsteuersätze der 16 Bundesländer, Stand 2026</caption>
            <thead>
              <tr className="text-[11px] text-ink-light text-left border-b border-ink/10">
                <th scope="col" className="font-medium py-1.5 pr-2">Bundesland</th>
                <th scope="col" className="font-medium py-1.5 px-2 text-right">Steuersatz</th>
                <th scope="col" className="font-medium py-1.5 px-2 text-right">Steuer bei {eur(MODELL)}</th>
                <th scope="col" className="font-medium py-1.5 pl-2 text-right">Nebenkosten ohne Makler</th>
              </tr>
            </thead>
            <tbody>
              {REGIO.map((x) => (
                <tr key={x.slug} className="border-b border-ink/5">
                  <th scope="row" className="py-1.5 pr-2 text-left font-normal">
                    <a href={`/kaufnebenkosten-${x.slug}`} className="text-green hover:text-green-mid underline">{x.land}</a>
                  </th>
                  <td className="py-1.5 px-2 text-right font-medium text-ink">{pct(x.satz)}</td>
                  <td className="py-1.5 px-2 text-right text-ink-mid">{eur((MODELL * x.satz) / 100)}</td>
                  <td className="py-1.5 pl-2 text-right text-ink-mid">{eur((MODELL * nkQuote(x.satz, false)) / 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[12px] text-ink-light leading-relaxed mt-3">
          Stand 2026. Rechtsgrundlagen: Der bundesgesetzliche Steuersatz beträgt 3,5 % (
          <a href="https://www.gesetze-im-internet.de/grestg_1983/__11.html" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">§ 11 GrEStG</a>
          ); die Länder dürfen ihn selbst bestimmen (
          <a href="https://www.gesetze-im-internet.de/gg/art_105.html" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">Art. 105 Abs. 2a GG</a>
          ). Notar- und Grundbuchgebühren richten sich bundesweit nach dem{' '}
          <a href="https://www.gesetze-im-internet.de/gnotkg/" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">GNotKG</a>
          . Den Ländervergleich mit Maklerprovision finden Sie im{' '}
          <a href="/kaufnebenkosten-index" className="text-green hover:text-green-mid underline">Kaufnebenkosten-Vergleich je Bundesland</a>.
        </p>
      </section>

      {/* Querverweise + CTA */}
      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Mehr zum größten Posten lesen Sie im Ratgeber{' '}
          <a href="/blog/grunderwerbsteuer-2026-bundeslaender" className="text-green hover:text-green-mid underline">
            Grunderwerbsteuer 2026 nach Bundesland
          </a>{' '}
          und im Überblick zu den{' '}
          <a href="/blog/kaufnebenkosten-immobilienkauf" className="text-green hover:text-green-mid underline">
            gesamten Kaufnebenkosten
          </a>
          . Wie viel Eigenkapital Sie dafür einplanen sollten, zeigt{' '}
          <a href="/blog/eigenkapital-immobilienkauf" className="text-green hover:text-green-mid underline">
            Eigenkapital beim Immobilienkauf
          </a>
          .
        </p>
      </div>

      <FaqSection title="Häufige Fragen zu den Kaufnebenkosten" items={faqs} />

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Konkretes Objekt im Blick?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf erstellt aus dem Exposé-Link eine strukturierte Ersteinschätzung — inklusive vollständiger
          Kaufnebenkosten, Preisbewertung, Standort- und Risikoanalyse.
        </p>
        <a
          href="/"
          className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors"
        >
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
