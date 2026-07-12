import { useState, useMemo } from 'react'
import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { eur, pct } from '../lib/kaufnebenkosten'
import { Field, Row } from './calcUi'

// ─── GNotKG-Gebührenlogik ───
// Anlage 2 zu § 34 Abs. 3 GNotKG — einfache (1,0) Wertgebühr je Geschäftswert.
// Über 1.000.000 €: je angefangene 50.000 € + 165 € (§ 34 Abs. 3 GNotKG).
const GEBUEHR_TABELLE: [number, number][] = [
  [500, 15], [1000, 19], [1500, 23], [2000, 27], [3000, 33], [4000, 39], [5000, 45],
  [6000, 51], [7000, 57], [8000, 63], [9000, 69], [10000, 75],
  [13000, 83], [16000, 91], [19000, 99], [22000, 107], [25000, 115],
  [30000, 125], [35000, 135], [40000, 145], [45000, 155], [50000, 165],
  [65000, 192], [80000, 219], [95000, 246], [110000, 273], [125000, 300],
  [140000, 327], [155000, 354], [170000, 381], [185000, 408], [200000, 435],
  [230000, 485], [260000, 535], [290000, 585], [320000, 635], [350000, 685],
  [380000, 735], [410000, 785], [440000, 835], [470000, 885], [500000, 935],
  [550000, 1015], [600000, 1095], [650000, 1175], [700000, 1255], [750000, 1335],
  [800000, 1415], [850000, 1495], [900000, 1575], [950000, 1655], [1000000, 1735],
]

function einfacheGebuehr(wert: number): number {
  if (!Number.isFinite(wert) || wert <= 0) return 0
  for (const [grenze, gebuehr] of GEBUEHR_TABELLE) {
    if (wert <= grenze) return gebuehr
  }
  const schritte = Math.ceil((wert - 1_000_000) / 50_000)
  return 1735 + schritte * 165
}

const USt = 0.19
const AUSLAGEN = 20 // Post-/Dokumentenpauschale (netto), Richtwert nach KV 32005

export default function NotarkostenRechner() {
  const [preis, setPreis] = useState(400000)
  const [finanziert, setFinanziert] = useState(true)
  const [darlehen, setDarlehen] = useState(320000)

  const r = useMemo(() => {
    const kp = Number.isFinite(preis) && preis > 0 ? preis : 0
    const gs = finanziert && Number.isFinite(darlehen) && darlehen > 0 ? darlehen : 0
    const gKauf = einfacheGebuehr(kp)
    const gGrund = einfacheGebuehr(gs)

    // Notar (Beurkundung & Vollzug), zzgl. 19 % USt
    const kaufvertrag = 2.0 * gKauf
    const vollzug = 0.5 * gKauf
    const betreuung = 0.5 * gKauf
    const grundschuldBeurk = 1.0 * gGrund
    const notarNetto = kaufvertrag + vollzug + betreuung + grundschuldBeurk + AUSLAGEN
    const ust = notarNetto * USt
    const notarBrutto = notarNetto + ust

    // Grundbuchamt (Gericht) — keine USt
    const vormerkung = 0.5 * gKauf
    const umschreibung = 1.0 * gKauf
    const grundschuldEintrag = 1.0 * gGrund
    const grundbuch = vormerkung + umschreibung + grundschuldEintrag

    const gesamt = notarBrutto + grundbuch
    return {
      kaufvertrag, vollzug, betreuung, grundschuldBeurk, notarNetto, ust, notarBrutto,
      vormerkung, umschreibung, grundschuldEintrag, grundbuch,
      gesamt, prozent: kp > 0 ? (gesamt / kp) * 100 : 0,
    }
  }, [preis, finanziert, darlehen])

  useSEO({
    title: 'Notarkosten-Rechner 2026: Notar- & Grundbuchkosten nach GNotKG',
    description:
      'Kostenloser Notarkosten-Rechner: berechnet Notar- und Grundbuchkosten beim Hauskauf exakt nach der GNotKG-Gebührentabelle — Kaufvertrag, Grundschuld, Umsatzsteuer und Grundbuchamt einzeln aufgeschlüsselt.',
    canonical: 'https://immopruef.de/notarkosten-rechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImmoPrüf Notarkosten-Rechner',
        url: 'https://immopruef.de/notarkosten-rechner',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage: 'de-DE',
        description:
          'Berechnet Notar- und Grundbuchkosten beim Immobilienkauf nach der GNotKG-Gebührentabelle, inklusive Grundschuldbestellung und 19 % Umsatzsteuer.',
      },
      faqSchema([
        {
          question: 'Wie hoch sind die Notarkosten beim Hauskauf?',
          answer:
            'Als grobe Faustregel liegen Notar- und Grundbuchkosten zusammen bei rund 1,5 % des Kaufpreises. Die Gebühren sind bundesweit einheitlich im GNotKG geregelt und richten sich nach dem Geschäftswert (Kaufpreis bzw. Darlehen), nicht nach dem Aufwand. Bei 400.000 € Kaufpreis mit Finanzierung sind es typischerweise rund 5.000 bis 6.000 €.',
        },
        {
          question: 'Wer zahlt die Notarkosten — Käufer oder Verkäufer?',
          answer:
            'In der Regel trägt der Käufer die gesamten Notar- und Grundbuchkosten; so steht es üblicherweise im Kaufvertrag. Nur einzelne Posten, die allein den Verkäufer betreffen — etwa die Löschung einer alten Grundschuld —, zahlt der Verkäufer.',
        },
        {
          question: 'Sind Notarkosten verhandelbar oder bei jedem Notar gleich?',
          answer:
            'Notargebühren sind gesetzlich im GNotKG festgelegt und bundesweit identisch — jeder Notar muss dieselben Gebühren berechnen. Einen günstigeren Notar gibt es nicht. Beeinflussbar sind nur der Geschäftswert und die Frage, ob und in welcher Höhe eine Grundschuld eingetragen wird.',
        },
        {
          question: 'Warum erhöht eine Finanzierung die Notarkosten?',
          answer:
            'Weil für die Grundschuld zwei zusätzliche Gebühren anfallen: die notarielle Beurkundung der Grundschuldbestellung (1,0-Gebühr) und deren Eintragung ins Grundbuch (1,0-Gebühr), jeweils auf den Grundschuldbetrag. Wer weniger fremdfinanziert, spart hier spürbar.',
        },
        {
          question: 'Sind die Notarkosten von der Bank mitfinanzierbar?',
          answer:
            'Meist nicht. Wie die übrigen Kaufnebenkosten müssen Sie die Notar- und Grundbuchkosten in der Regel aus Eigenkapital aufbringen. Planen Sie sie daher von Anfang an in Ihr Budget ein.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Notarkosten-Rechner', url: 'https://immopruef.de/notarkosten-rechner' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Notarkosten-Rechner 2026
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Berechnen Sie Notar- und Grundbuchkosten beim Immobilienkauf — exakt nach der GNotKG-Gebührentabelle statt mit
          Pauschalen. Kaufvertrag, Grundschuld, Umsatzsteuer und Grundbuchamt einzeln aufgeschlüsselt. Kostenlos, ohne
          Anmeldung.
        </p>
      </header>

      {/* Eingabe */}
      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm">
        <div className="space-y-4">
          <Field
            label="Kaufpreis der Immobilie"
            value={preis}
            onChange={(n) => setPreis(Math.round(n))}
            suffix="€"
            step={1000}
            sub="Geschäftswert für Kaufvertrag, Vormerkung und Eigentumsumschreibung."
          />

          <div>
            <label className="flex items-center gap-2 text-[13px] font-medium text-ink-mid cursor-pointer select-none mb-2">
              <input
                type="checkbox"
                checked={finanziert}
                onChange={(e) => setFinanziert(e.target.checked)}
                className="w-3.5 h-3.5 accent-green cursor-pointer"
              />
              Kauf wird über eine Grundschuld finanziert
            </label>
            {finanziert && (
              <Field
                label="Darlehensbetrag (Grundschuld)"
                value={darlehen}
                onChange={(n) => setDarlehen(Math.round(n))}
                suffix="€"
                step={1000}
                sub="Geschäftswert für Grundschuldbestellung und -eintragung. Oft rund 80 % des Kaufpreises."
              />
            )}
          </div>
        </div>
      </div>

      {/* Ergebnis */}
      <div className="mt-5 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1">
          Notarkosten (inkl. 19 % USt)
        </div>
        <Row label="Kaufvertrag beurkunden" sub="2,0-Gebühr · Kaufpreis" value={eur(r.kaufvertrag)} />
        <Row label="Vollzug" sub="0,5-Gebühr · Kaufpreis" value={eur(r.vollzug)} />
        <Row label="Betreuung / Treuhand" sub="0,5-Gebühr · Kaufpreis" value={eur(r.betreuung)} />
        {finanziert && (
          <Row label="Grundschuld beurkunden" sub="1,0-Gebühr · Darlehensbetrag" value={eur(r.grundschuldBeurk)} />
        )}
        <Row label="Auslagen (Post/Dokumente)" sub="pauschal" value={eur(AUSLAGEN)} />
        <Row label="19 % Umsatzsteuer" sub="auf die Notargebühren" value={eur(r.ust)} />
        <div className="mt-1 pt-1 border-t border-ink/10">
          <Row label="Notarkosten gesamt" value={eur(r.notarBrutto)} strong />
        </div>

        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1 mt-5">
          Grundbuchkosten (Gericht, ohne USt)
        </div>
        <Row label="Auflassungsvormerkung eintragen" sub="0,5-Gebühr · Kaufpreis" value={eur(r.vormerkung)} />
        <Row label="Eigentumsumschreibung" sub="1,0-Gebühr · Kaufpreis" value={eur(r.umschreibung)} />
        {finanziert && (
          <Row label="Grundschuld eintragen" sub="1,0-Gebühr · Darlehensbetrag" value={eur(r.grundschuldEintrag)} />
        )}
        <div className="mt-1 pt-1 border-t border-ink/10">
          <Row label="Grundbuchkosten gesamt" value={eur(r.grundbuch)} strong />
        </div>

        <div className="mt-4 bg-green/5 rounded-lg px-4 py-3 flex items-baseline justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-green">Notar- &amp; Grundbuchkosten gesamt</div>
            <div className="text-[11px] text-ink-light">≈ {pct(r.prozent)} des Kaufpreises</div>
          </div>
          <div className="font-display text-xl font-semibold text-green tabular-nums">{eur(r.gesamt)}</div>
        </div>

        <p className="text-[11px] text-ink-light mt-3 leading-snug">
          Angesetzt sind die üblichen Positionen eines finanzierten Kaufs (Beurkundung 2,0, Vollzug 0,5, Betreuung 0,5,
          Grundschuld 1,0). Im Einzelfall können Positionen entfallen oder hinzukommen; die Gebühren selbst sind im GNotKG
          bundeseinheitlich festgelegt. Richtwert ohne Gewähr — keine Rechts- oder Steuerberatung.
        </p>
      </div>

      {/* Querverweise */}
      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Die Notarkosten sind nur ein Teil der Kaufnebenkosten. Den vollen Überblick inklusive Grunderwerbsteuer und
          Maklerprovision gibt der{' '}
          <a href="/grunderwerbsteuer-rechner" className="text-green hover:text-green-mid underline">
            Kaufnebenkosten-Rechner
          </a>
          . Hintergründe erklären die Ratgeber{' '}
          <a href="/blog/notarkosten-grundbuchkosten-immobilienkauf" className="text-green hover:text-green-mid underline">
            Notar- und Grundbuchkosten
          </a>{' '}
          und{' '}
          <a href="/blog/notartermin-ablauf-hauskauf" className="text-green hover:text-green-mid underline">
            Notartermin: Ablauf beim Hauskauf
          </a>
          .
        </p>
      </div>

      {/* FAQ */}
      <div className="mt-8">
        <h2 className="font-display text-xl font-semibold text-ink mb-3">Häufige Fragen zu den Notarkosten</h2>
        <div className="space-y-3">
          {[
            ['Wer zahlt die Notarkosten — Käufer oder Verkäufer?', 'In der Regel trägt der Käufer die gesamten Notar- und Grundbuchkosten; so steht es üblicherweise im Kaufvertrag. Nur einzelne Posten, die allein den Verkäufer betreffen — etwa die Löschung einer alten Grundschuld —, zahlt der Verkäufer.'],
            ['Sind Notarkosten verhandelbar oder bei jedem Notar gleich?', 'Notargebühren sind gesetzlich im GNotKG festgelegt und bundesweit identisch — jeder Notar muss dieselben Gebühren berechnen. Einen günstigeren Notar gibt es nicht. Beeinflussbar sind nur der Geschäftswert und die Frage, ob eine Grundschuld eingetragen wird.'],
            ['Warum erhöht eine Finanzierung die Notarkosten?', 'Weil für die Grundschuld zwei zusätzliche Gebühren anfallen: die Beurkundung der Grundschuldbestellung und deren Eintragung ins Grundbuch, jeweils als 1,0-Gebühr auf den Grundschuldbetrag. Wer weniger fremdfinanziert, spart hier spürbar.'],
            ['Sind die Notarkosten von der Bank mitfinanzierbar?', 'Meist nicht. Wie die übrigen Kaufnebenkosten müssen Sie die Notar- und Grundbuchkosten in der Regel aus Eigenkapital aufbringen — planen Sie sie von Anfang an ein.'],
          ].map(([q, a]) => (
            <details key={q} className="group bg-white border border-ink/10 rounded-lg px-4 py-3">
              <summary className="cursor-pointer list-none flex items-center justify-between gap-3 text-sm font-medium text-ink">
                {q}
                <span className="text-green transition-transform group-open:rotate-45 text-lg leading-none">+</span>
              </summary>
              <p className="text-[13px] text-ink-mid leading-relaxed mt-2">{a}</p>
            </details>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Konkretes Objekt im Blick?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf erstellt aus dem Exposé-Link oder PDF eine strukturierte Ersteinschätzung — inklusive vollständiger
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
