import { useState, useMemo } from 'react'
import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { GREST, grestSatzFor, NOTAR_SATZ, GRUNDBUCH_SATZ, MAKLER_DEFAULT, eur, pct } from '../lib/kaufnebenkosten'

export default function Budgetrechner() {
  const [netto, setNetto] = useState(4000)
  const [eigenkapital, setEigenkapital] = useState(80000)
  const [zins, setZins] = useState(3.8)
  const [tilgung, setTilgung] = useState(2.0)
  const [rateAnteil, setRateAnteil] = useState(35)
  const [land, setLand] = useState('Nordrhein-Westfalen')
  const [mitMakler, setMitMakler] = useState(true)

  const r = useMemo(() => {
    const grest = grestSatzFor(land)
    const nkQuote = (grest + NOTAR_SATZ + GRUNDBUCH_SATZ + (mitMakler ? MAKLER_DEFAULT : 0)) / 100
    const maxRate = Math.max(0, netto) * (rateAnteil / 100)
    const monatsfaktor = (zins + tilgung) / 100 / 12 // Rate = Darlehen × monatsfaktor
    const maxDarlehen = monatsfaktor > 0 ? maxRate / monatsfaktor : 0
    const maxKaufpreis = (maxDarlehen + Math.max(0, eigenkapital)) / (1 + nkQuote)
    const nebenkosten = maxKaufpreis * nkQuote
    const ekAmKaufpreis = Math.max(0, eigenkapital) - nebenkosten
    const ekQuote = maxKaufpreis > 0 ? (ekAmKaufpreis / maxKaufpreis) * 100 : 0
    return { grest, nkQuote, maxRate, maxDarlehen, maxKaufpreis, nebenkosten, ekAmKaufpreis, ekQuote }
  }, [netto, eigenkapital, zins, tilgung, rateAnteil, land, mitMakler])

  useSEO({
    title: 'Budgetrechner Immobilie: Wie viel Haus kann ich mir leisten?',
    description:
      'Kostenloser Budgetrechner: Aus Nettoeinkommen, Eigenkapital, Zins und Tilgung berechnen Sie sofort die maximale Monatsrate, Darlehenssumme und den leistbaren Kaufpreis.',
    canonical: 'https://immopruef.de/budgetrechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImmoPrüf Budgetrechner',
        url: 'https://immopruef.de/budgetrechner',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage: 'de-DE',
        description:
          'Berechnet aus Nettoeinkommen, Eigenkapital, Zins und Tilgung die maximale Monatsrate, Darlehenssumme und den leistbaren Immobilien-Kaufpreis inklusive Kaufnebenkosten.',
      },
      faqSchema([
        {
          question: 'Wie viel Haus kann ich mir bei meinem Einkommen leisten?',
          answer:
            'Als Faustregel sollte die monatliche Rate rund 35 % des Nettohaushaltseinkommens nicht überschreiten. Aus dieser maximalen Rate, dem Zins und der Tilgung ergibt sich die mögliche Darlehenssumme; zusammen mit dem Eigenkapital und abzüglich der Kaufnebenkosten folgt daraus der leistbare Kaufpreis.',
        },
        {
          question: 'Werden die Kaufnebenkosten ins Budget eingerechnet?',
          answer:
            'Ja. Die Kaufnebenkosten von rund 10 bis 12 % des Kaufpreises müssen in der Regel aus Eigenkapital bezahlt werden, weil Banken sie meist nicht mitfinanzieren. Der Rechner zieht sie deshalb vom Eigenkapital ab.',
        },
        {
          question: 'Wie viel Eigenkapital sollte ich einplanen?',
          answer:
            'Empfohlen werden mindestens 20 % des Kaufpreises plus die Kaufnebenkosten. Je mehr Eigenkapital, desto niedriger Zins und Rate. Eine Notreserve von etwa drei Nettomonatsgehältern sollten Sie nicht in die Finanzierung stecken.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Budgetrechner', url: 'https://immopruef.de/budgetrechner' },
      ]),
    ],
  })

  const Field = ({
    label, value, onChange, suffix, min = 0, max, step = 1, sub,
  }: {
    label: string; value: number; onChange: (n: number) => void; suffix: string
    min?: number; max?: number; step?: number; sub?: string
  }) => (
    <div>
      <label className="block text-[13px] font-medium text-ink-mid mb-1.5">{label}</label>
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : ''}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value)))}
          className="w-full border border-ink/20 rounded-lg pl-3.5 pr-9 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors tabular-nums"
        />
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-light text-sm">{suffix}</span>
      </div>
      {sub && <p className="text-[11px] text-ink-light mt-1">{sub}</p>}
    </div>
  )

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
          Budgetrechner: Wie viel Immobilie kann ich mir leisten?
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Aus Nettoeinkommen, Eigenkapital, Zins und Tilgung berechnen Sie sofort Ihre mögliche Monatsrate, die
          Darlehenssumme und den leistbaren Kaufpreis — inklusive Kaufnebenkosten. Kostenlos, ohne Anmeldung.
        </p>
      </header>

      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nettohaushaltseinkommen / Monat" value={netto} onChange={setNetto} suffix="€" step={100} />
          <Field label="Eigenkapital" value={eigenkapital} onChange={setEigenkapital} suffix="€" step={1000}
            sub="inkl. Mittel für die Kaufnebenkosten" />
          <Field label="Sollzins (p. a.)" value={zins} onChange={setZins} suffix="%" step={0.1} max={10}
            sub="aktuell grob 3,5–4,0 % (10 J. Bindung)" />
          <Field label="Anfängliche Tilgung (p. a.)" value={tilgung} onChange={setTilgung} suffix="%" step={0.5} max={10}
            sub="empfohlen mind. 2 %" />
          <Field label="Maximaler Anteil der Rate am Netto" value={rateAnteil} onChange={setRateAnteil} suffix="%" step={1} max={60}
            sub="Faustregel: höchstens 35 %" />
          <div>
            <label className="block text-[13px] font-medium text-ink-mid mb-1.5">Bundesland</label>
            <select
              value={land}
              onChange={(e) => setLand(e.target.value)}
              className="w-full border border-ink/20 rounded-lg px-3 py-2.5 text-sm bg-cream focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors"
            >
              {GREST.map((g) => (
                <option key={g.land} value={g.land}>{g.land} — {pct(g.satz)} GrESt</option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-[12px] text-ink-mid cursor-pointer select-none mt-2">
              <input type="checkbox" checked={mitMakler} onChange={(e) => setMitMakler(e.target.checked)} className="w-3.5 h-3.5 accent-green cursor-pointer" />
              mit Maklerprovision ({pct(MAKLER_DEFAULT)})
            </label>
          </div>
        </div>
      </div>

      <div className="mt-5 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1">Ihr Budget</div>
        <Row label="Maximale Monatsrate" sub={`${pct(rateAnteil)} von ${eur(netto)}`} value={eur(r.maxRate)} />
        <Row label="Mögliche Darlehenssumme" sub={`bei ${pct(zins)} Zins + ${pct(tilgung)} Tilgung`} value={eur(r.maxDarlehen)} />
        <Row label="Kaufnebenkosten" sub={`≈ ${pct(r.nkQuote * 100)} (${land}${mitMakler ? ', inkl. Makler' : ', ohne Makler'})`} value={eur(r.nebenkosten)} />
        <Row label="Eigenkapital in den Kaufpreis" sub={r.ekAmKaufpreis > 0 ? `entspricht ${pct(r.ekQuote)} des Kaufpreises` : 'Eigenkapital deckt nur die Nebenkosten'} value={eur(Math.max(0, r.ekAmKaufpreis))} />
        <div className="mt-3 bg-green/5 rounded-lg px-4 py-3 flex items-baseline justify-between gap-4">
          <div className="text-sm font-semibold text-green">Leistbarer Kaufpreis (Immobilie)</div>
          <div className="font-display text-xl font-semibold text-green tabular-nums">{eur(r.maxKaufpreis)}</div>
        </div>

        {r.ekAmKaufpreis < 0 && (
          <p className="text-[12px] text-amber-700 mt-3 leading-snug">
            ⚠️ Ihr Eigenkapital reicht rechnerisch nicht einmal für die Kaufnebenkosten. Banken finanzieren diese
            selten mit — eine solche Vollfinanzierung ist teurer und nur bei sehr guter Bonität realistisch.
          </p>
        )}
        {r.ekAmKaufpreis >= 0 && r.ekQuote < 20 && r.maxKaufpreis > 0 && (
          <p className="text-[12px] text-ink-light mt-3 leading-snug">
            Hinweis: Mit unter 20 % Eigenkapital steigt der Zins meist spürbar. Wer mehr einbringt, senkt Rate und
            Gesamtkosten deutlich.
          </p>
        )}
        <p className="text-[11px] text-ink-light mt-3 leading-snug">
          Modellrechnung auf Basis Ihrer Annahmen — keine Finanzierungszusage und keine Finanzberatung. Eine Notreserve
          von etwa drei Nettomonatsgehältern sollte nicht in die Finanzierung fließen. Banken akzeptieren Belastungsquoten
          meist bis rund 40 %.
        </p>
      </div>

      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Wie sich Zins und Tilgung auf die Rate auswirken, erklärt{' '}
          <a href="/blog/annuitaetendarlehen-erklaert" className="text-green hover:text-green-mid underline">Annuitätendarlehen einfach erklärt</a>;
          wie viel Eigenkapital sinnvoll ist, lesen Sie in{' '}
          <a href="/blog/eigenkapital-immobilienkauf" className="text-green hover:text-green-mid underline">Eigenkapital beim Immobilienkauf</a>.
          Die genauen Nebenkosten ermitteln Sie mit dem{' '}
          <a href="/grunderwerbsteuer-rechner" className="text-green hover:text-green-mid underline">Kaufnebenkosten-Rechner</a>.
        </p>
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Passendes Objekt im Budget gefunden?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link Preis, Kosten, Standort und Risiken — inklusive drei Finanzierungs-Szenarien
          mit Stresstest.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
