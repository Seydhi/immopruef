import { useState, useMemo } from 'react'
import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { GREST, NOTAR_SATZ, GRUNDBUCH_SATZ, eur, pct } from '../lib/kaufnebenkosten'
import { Row } from './calcUi'

export default function Rechner() {
  const [preis, setPreis] = useState(400000)
  const [land, setLand] = useState('Nordrhein-Westfalen')
  const [maklerSatz, setMaklerSatz] = useState(3.57)
  const [provisionsfrei, setProvisionsfrei] = useState(false)

  const grestSatz = useMemo(() => GREST.find((g) => g.land === land)?.satz ?? 5.0, [land])

  const r = useMemo(() => {
    const p = Number.isFinite(preis) && preis > 0 ? preis : 0
    const grest = p * (grestSatz / 100)
    const notar = p * (NOTAR_SATZ / 100)
    const grundbuch = p * (GRUNDBUCH_SATZ / 100)
    const makler = provisionsfrei ? 0 : p * (maklerSatz / 100)
    const neben = grest + notar + grundbuch + makler
    return {
      grest, notar, grundbuch, makler, neben,
      nebenProzent: p > 0 ? (neben / p) * 100 : 0,
      gesamt: p + neben,
    }
  }, [preis, grestSatz, maklerSatz, provisionsfrei])

  useSEO({
    title: 'Kaufnebenkosten-Rechner 2026: Grunderwerbsteuer, Notar & Makler',
    description:
      'Kostenloser Kaufnebenkosten-Rechner: Grunderwerbsteuer (3,5–6,5 % je Bundesland), Notar, Grundbuch und Maklerprovision sofort berechnen — mit Gesamtkosten auf einen Blick.',
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
      faqSchema([
        {
          question: 'Wie hoch sind die Kaufnebenkosten beim Immobilienkauf?',
          answer:
            'Die Kaufnebenkosten liegen je nach Bundesland und Maklerprovision typischerweise bei 10 bis 12 % des Kaufpreises: Grunderwerbsteuer 3,5 bis 6,5 %, Notar rund 1,5 %, Grundbuch rund 0,5 % und Maklerprovision für den Käufer bis 3,57 %.',
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
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Kaufnebenkosten-Rechner', url: 'https://immopruef.de/grunderwerbsteuer-rechner' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Kaufnebenkosten-Rechner 2026
        </h1>
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
        <Row label="Grunderwerbsteuer" sub={`${pct(grestSatz)} · ${land}`} value={eur(r.grest)} />
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
          Richtwerte für die Notar- und Grundbuchkosten (im GNotKG geregelt); die tatsächlichen Gebühren können je nach
          Aufwand leicht abweichen. Hinzu kommen ggf. Kosten für Finanzierung, Umzug, Sanierung und Rücklagen. Keine
          Rechts- oder Steuerberatung.
        </p>
      </div>

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
