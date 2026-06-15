import { useState, useMemo } from 'react'
import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { eur } from '../lib/kaufnebenkosten'

// ─── Modul-Level-Helfer (kein Remount/Fokusverlust beim Tippen) ───
function Field({
  label, value, onChange, suffix, min = 0, max, step = 1, sub,
}: {
  label: string; value: number; onChange: (n: number) => void; suffix: string
  min?: number; max?: number; step?: number; sub?: string
}) {
  return (
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
}

function Row({ label, sub, value, strong = false }: { label: string; sub?: string; value: string; strong?: boolean }) {
  return (
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
}

function laufzeitText(monate: number): string {
  const j = Math.floor(monate / 12)
  const m = monate % 12
  if (m === 0) return `${j} Jahre`
  return `${j} Jahre, ${m} Monat${m === 1 ? '' : 'e'}`
}

interface JahrZeile { jahr: number; rest: number; zins: number; tilgung: number }

export default function Tilgungsrechner() {
  const [darlehen, setDarlehen] = useState(350000)
  const [zins, setZins] = useState(3.8)
  const [tilgung, setTilgung] = useState(2.0)
  const [zinsbindung, setZinsbindung] = useState(10)
  const [sondertilgung, setSondertilgung] = useState(0)

  const r = useMemo(() => {
    const monatsrate = darlehen * (zins + tilgung) / 100 / 12
    const zinsMonat = zins / 100 / 12
    const bindungMonate = Math.round(zinsbindung * 12)
    const MAX_MONATE = 50 * 12

    let rest = darlehen
    let zinsenGesamt = 0
    let zinsenInBindung = 0
    let restNachBindung = 0
    let monate = 0
    let jahrZins = 0
    let jahrTilgung = 0
    let tilgtNie = false
    const jahre: JahrZeile[] = []

    if (monatsrate <= rest * zinsMonat) {
      // Rate deckt nicht einmal die Zinsen -> wird nie getilgt
      tilgtNie = true
    } else {
      for (let m = 1; m <= MAX_MONATE && rest > 0.005; m++) {
        const zAnteil = rest * zinsMonat
        let tAnteil = monatsrate - zAnteil
        if (tAnteil > rest) tAnteil = rest
        rest -= tAnteil
        zinsenGesamt += zAnteil
        jahrZins += zAnteil
        jahrTilgung += tAnteil
        if (m <= bindungMonate) zinsenInBindung += zAnteil
        monate = m

        if (m % 12 === 0) {
          if (sondertilgung > 0 && rest > 0) {
            const st = Math.min(sondertilgung, rest)
            rest -= st
            jahrTilgung += st
          }
          jahre.push({ jahr: m / 12, rest, zins: jahrZins, tilgung: jahrTilgung })
          jahrZins = 0
          jahrTilgung = 0
        }
        if (m === bindungMonate) restNachBindung = rest
      }
      // angebrochenes letztes Jahr
      if (monate % 12 !== 0) {
        jahre.push({ jahr: Math.ceil(monate / 12), rest, zins: jahrZins, tilgung: jahrTilgung })
      }
      // Falls vor Bindungsende abbezahlt
      if (monate < bindungMonate) restNachBindung = 0
    }

    const getilgtInBindung = darlehen - restNachBindung
    return { monatsrate, restNachBindung, zinsenInBindung, getilgtInBindung, monate, zinsenGesamt, jahre, tilgtNie, bindungMonate }
  }, [darlehen, zins, tilgung, zinsbindung, sondertilgung])

  // Tilgungsplan-Anzeige: bis Zinsbindungsende (max. 15 Zeilen) bzw. bis abbezahlt
  const planZeilen = r.jahre.filter((z) => z.jahr <= zinsbindung).slice(0, 15)

  useSEO({
    title: 'Tilgungsrechner: Monatsrate, Restschuld & Tilgungsplan berechnen',
    description:
      'Kostenloser Tilgungsrechner für die Baufinanzierung: Berechnen Sie aus Darlehen, Sollzins und Tilgung sofort Monatsrate, Restschuld nach der Zinsbindung, Gesamtzinsen und den vollständigen Tilgungsplan — inklusive Sondertilgung.',
    canonical: 'https://immopruef.de/tilgungsrechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImmoPrüf Tilgungsrechner',
        url: 'https://immopruef.de/tilgungsrechner',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage: 'de-DE',
        description:
          'Berechnet für ein Annuitätendarlehen die monatliche Rate, die Restschuld am Ende der Zinsbindung, die Gesamtzinsen, die Laufzeit bis zur vollständigen Tilgung und den jährlichen Tilgungsplan, optional mit Sondertilgung.',
      },
      faqSchema([
        {
          question: 'Wie wird die monatliche Rate beim Annuitätendarlehen berechnet?',
          answer:
            'Die Monatsrate ergibt sich aus Darlehenssumme mal Summe aus Sollzins und anfänglicher Tilgung, geteilt durch zwölf. Beispiel: 350.000 € bei 3,8 % Zins und 2 % Tilgung ergeben rund 1.692 € im Monat. Die Rate bleibt während der Zinsbindung gleich; im Zeitverlauf sinkt der Zinsanteil und der Tilgungsanteil steigt.',
        },
        {
          question: 'Was ist die Restschuld nach der Zinsbindung?',
          answer:
            'Die Restschuld ist der Darlehensbetrag, der nach Ablauf der Zinsbindung (zum Beispiel 10 oder 15 Jahre) noch offen ist und über eine Anschlussfinanzierung weiterfinanziert werden muss. Je höher die anfängliche Tilgung und je länger die Zinsbindung, desto niedriger die Restschuld.',
        },
        {
          question: 'Wie viel spart eine höhere Tilgung oder eine Sondertilgung?',
          answer:
            'Eine höhere anfängliche Tilgung verkürzt die Laufzeit und senkt die Gesamtzinsen deutlich, erhöht aber die Monatsrate. Sondertilgungen reduzieren die Restschuld direkt und sparen die darauf entfallenden Zinsen — wie viel pro Jahr möglich ist, regelt der Darlehensvertrag (oft bis 5 % der Summe pro Jahr).',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Tilgungsrechner', url: 'https://immopruef.de/tilgungsrechner' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Tilgungsrechner: Rate, Restschuld &amp; Tilgungsplan
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Berechnen Sie für Ihr Annuitätendarlehen sofort die monatliche Rate, die Restschuld am Ende der Zinsbindung,
          die Gesamtzinsen und den vollständigen Tilgungsplan — optional mit Sondertilgung. Kostenlos, ohne Anmeldung.
        </p>
      </header>

      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Darlehenssumme" value={darlehen} onChange={setDarlehen} suffix="€" step={5000} />
          <Field label="Sollzins (p. a.)" value={zins} onChange={setZins} suffix="%" step={0.1} max={15}
            sub="aktuell grob 3,5–4,0 % (10 J. Bindung)" />
          <Field label="Anfängliche Tilgung (p. a.)" value={tilgung} onChange={setTilgung} suffix="%" step={0.5} max={15}
            sub="empfohlen mind. 2 %" />
          <Field label="Zinsbindung" value={zinsbindung} onChange={setZinsbindung} suffix="Jahre" step={1} min={1} max={40} />
          <Field label="Sondertilgung pro Jahr" value={sondertilgung} onChange={setSondertilgung} suffix="€" step={1000}
            sub="optional — laut Vertrag oft bis 5 % p. a." />
        </div>
      </div>

      <div className="mt-5 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1">Ergebnis</div>
        <div className="bg-green/5 rounded-lg px-4 py-3 flex items-baseline justify-between gap-4 mb-2">
          <div className="text-sm font-semibold text-green">Monatliche Rate</div>
          <div className="font-display text-xl font-semibold text-green tabular-nums">{eur(r.monatsrate)}</div>
        </div>
        {r.tilgtNie ? (
          <p className="text-[12px] text-amber-700 mt-2 leading-snug">
            ⚠️ Bei dieser Kombination deckt die Rate nicht einmal die Zinsen — das Darlehen würde so nie getilgt.
            Erhöhen Sie die anfängliche Tilgung.
          </p>
        ) : (
          <>
            <Row label={`Restschuld nach ${zinsbindung} Jahren`} sub="Ende der Zinsbindung — danach Anschlussfinanzierung" value={eur(r.restNachBindung)} />
            <Row label="Zinsen während der Zinsbindung" sub={`gezahlt in ${zinsbindung} Jahren`} value={eur(r.zinsenInBindung)} />
            <Row label="Getilgt während der Zinsbindung" sub={sondertilgung > 0 ? 'inkl. Sondertilgungen' : 'reguläre Tilgung'} value={eur(r.getilgtInBindung)} />
            <Row label="Schuldenfrei nach" sub="bei gleichbleibendem Zins" value={laufzeitText(r.monate)} />
            <Row label="Gesamtzinsen bis zur Volltilgung" sub="über die gesamte Laufzeit" value={eur(r.zinsenGesamt)} strong />
          </>
        )}
        <p className="text-[11px] text-ink-light mt-3 leading-snug">
          Modellrechnung mit gleichbleibendem Sollzins — keine Finanzierungszusage und keine Finanzberatung. Nach der
          Zinsbindung gilt der dann aktuelle Marktzins (Zinsänderungsrisiko). Sondertilgungen sind nur im vertraglich
          vereinbarten Rahmen möglich.
        </p>
      </div>

      {!r.tilgtNie && planZeilen.length > 0 && (
        <div className="mt-5 bg-white border border-ink/15 rounded-xl p-5 shadow-sm overflow-x-auto">
          <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-3">Tilgungsplan (jährlich)</div>
          <table className="w-full text-sm tabular-nums">
            <thead>
              <tr className="text-[11px] text-ink-light text-left border-b border-ink/10">
                <th className="font-medium py-1.5 pr-2">Jahr</th>
                <th className="font-medium py-1.5 px-2 text-right">Zinsen</th>
                <th className="font-medium py-1.5 px-2 text-right">Tilgung</th>
                <th className="font-medium py-1.5 pl-2 text-right">Restschuld</th>
              </tr>
            </thead>
            <tbody>
              {planZeilen.map((z) => (
                <tr key={z.jahr} className="border-b border-ink/5">
                  <td className="py-1.5 pr-2 text-ink-mid">{z.jahr}</td>
                  <td className="py-1.5 px-2 text-right text-ink-mid">{eur(z.zins)}</td>
                  <td className="py-1.5 px-2 text-right text-ink-mid">{eur(z.tilgung)}</td>
                  <td className="py-1.5 pl-2 text-right font-medium text-ink">{eur(z.rest)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-ink-light mt-3 leading-snug">
            Zeigt die Jahre bis zum Ende der Zinsbindung. Innerhalb der Rate sinkt der Zinsanteil von Jahr zu Jahr,
            während der Tilgungsanteil steigt.
          </p>
        </div>
      )}

      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Wie das Annuitätendarlehen funktioniert, erklärt{' '}
          <a href="/blog/annuitaetendarlehen-erklaert" className="text-green hover:text-green-mid underline">Annuitätendarlehen einfach erklärt</a>.
          Ob sich eine{' '}
          <a href="/blog/sondertilgung-sinnvoll" className="text-green hover:text-green-mid underline">Sondertilgung lohnt</a>{' '}
          und welche{' '}
          <a href="/blog/zinsbindung-10-oder-15-jahre" className="text-green hover:text-green-mid underline">Zinsbindung sinnvoll ist</a>,
          lesen Sie in den jeweiligen Ratgebern. Wie viel Immobilie insgesamt zum Budget passt, zeigt der{' '}
          <a href="/budgetrechner" className="text-green hover:text-green-mid underline">Budgetrechner</a>.
        </p>
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Rate steht — passt das Objekt dazu?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link Preis, Kosten, Standort und Risiken — inklusive Finanzierungs-Szenarien
          mit Stresstest für steigende Zinsen.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
