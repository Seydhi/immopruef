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

interface JahrZeile { jahr: number; kaufen: number; mieten: number }

export default function MietenOderKaufen() {
  const [kaufpreis, setKaufpreis] = useState(400000)
  const [eigenkapital, setEigenkapital] = useState(80000)
  const [nkProzent, setNkProzent] = useState(11)
  const [zins, setZins] = useState(3.8)
  const [tilgung, setTilgung] = useState(2.0)
  const [kaltmiete, setKaltmiete] = useState(1300)
  const [jahre, setJahre] = useState(15)
  const [wertsteigerung, setWertsteigerung] = useState(2.0)
  const [mietsteigerung, setMietsteigerung] = useState(2.0)
  const [anlagerendite, setAnlagerendite] = useState(5.0)
  const [instandProzent, setInstandProzent] = useState(1.0)

  const r = useMemo(() => {
    const n = Math.max(1, Math.round(jahre))
    const nebenkosten = kaufpreis * nkProzent / 100
    const darlehen = Math.max(0, kaufpreis + nebenkosten - eigenkapital)
    const monatsrate = darlehen * (zins + tilgung) / 100 / 12
    const zinsMonat = zins / 100 / 12
    const instandJahr = kaufpreis * instandProzent / 100

    let restschuld = darlehen
    let invest = eigenkapital // Mieter legt dasselbe Eigenkapital an
    let mieteJahr = kaltmiete * 12
    const verlauf: JahrZeile[] = []
    let breakEven = 0

    for (let y = 1; y <= n; y++) {
      // 12 Monate Annuität simulieren
      let ratePaid = 0
      for (let m = 0; m < 12; m++) {
        if (restschuld <= 0.005) break
        const z = restschuld * zinsMonat
        let t = monatsrate - z
        if (t > restschuld) t = restschuld
        restschuld -= t
        ratePaid += z + t
      }
      const ownerOut = ratePaid + instandJahr
      const renterOut = mieteJahr
      const diff = ownerOut - renterOut // positiv => Mieter spart und legt an
      invest = invest * (1 + anlagerendite / 100) + diff

      const immowert = kaufpreis * Math.pow(1 + wertsteigerung / 100, y)
      const vermoegenKaufen = immowert - restschuld
      const vermoegenMieten = invest
      verlauf.push({ jahr: y, kaufen: vermoegenKaufen, mieten: vermoegenMieten })
      if (breakEven === 0 && vermoegenKaufen >= vermoegenMieten) breakEven = y

      mieteJahr = mieteJahr * (1 + mietsteigerung / 100)
    }

    const last = verlauf[verlauf.length - 1]
    const endKaufen = last.kaufen
    const endMieten = last.mieten
    const vorteil = endKaufen - endMieten
    return { n, nebenkosten, darlehen, monatsrate, endKaufen, endMieten, vorteil, breakEven, verlauf }
  }, [kaufpreis, eigenkapital, nkProzent, zins, tilgung, kaltmiete, jahre, wertsteigerung, mietsteigerung, anlagerendite, instandProzent])

  const kaufenVorn = r.vorteil >= 0

  useSEO({
    title: 'Mieten oder Kaufen Rechner: Vermögensvergleich über die Zeit',
    description:
      'Kostenloser Mieten-oder-Kaufen-Rechner: Vergleicht das Vermögen nach Jahren, wenn Sie kaufen (Immobilienwert minus Restschuld) oder mieten und die Differenz anlegen. Alle Annahmen frei einstellbar.',
    canonical: 'https://immopruef.de/mieten-oder-kaufen-rechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImmoPrüf Mieten-oder-Kaufen-Rechner',
        url: 'https://immopruef.de/mieten-oder-kaufen-rechner',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage: 'de-DE',
        description:
          'Vergleicht über einen wählbaren Zeitraum das aufgebaute Vermögen beim Kauf (Immobilienwert abzüglich Restschuld) mit dem Mieten plus Anlage der eingesparten Differenz. Wertsteigerung, Mietsteigerung, Anlagerendite und laufende Kosten sind frei einstellbare Annahmen.',
      },
      faqSchema([
        {
          question: 'Lohnt sich Kaufen oder Mieten mehr?',
          answer:
            'Das hängt vom Zeitraum und von Annahmen ab: Je länger die Haltedauer, je höher die unterstellte Wertsteigerung der Immobilie und je niedriger die Anlagerendite am Kapitalmarkt, desto eher lohnt sich der Kauf. Der Rechner stellt beide Vermögenspfade gegenüber und zeigt das Break-even-Jahr, ab dem Kaufen vorne liegt.',
        },
        {
          question: 'Wie funktioniert der Mieten-oder-Kaufen-Vergleich?',
          answer:
            'Beim Kauf wächst das Vermögen über die Tilgung und die mögliche Wertsteigerung der Immobilie (abzüglich Restschuld). Beim Mieten wird das gleiche Eigenkapital am Kapitalmarkt angelegt und zusätzlich die monatliche Differenz investiert, wenn Mieten günstiger ist als die Eigentümer-Belastung. Am Ende werden beide Endvermögen verglichen.',
        },
        {
          question: 'Sind die Ergebnisse eine verlässliche Prognose?',
          answer:
            'Nein. Wertsteigerung, Mietsteigerung und Anlagerendite sind Annahmen über die Zukunft, die niemand sicher kennt. Der Rechner ist ein Modell zum Durchspielen von Szenarien — keine Anlage- oder Finanzberatung. Verändern Sie die Annahmen, um zu sehen, wie empfindlich das Ergebnis reagiert.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Mieten oder Kaufen Rechner', url: 'https://immopruef.de/mieten-oder-kaufen-rechner' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Mieten oder Kaufen? Der Vermögens-Vergleich
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Der Rechner stellt zwei Wege gegenüber: kaufen (Vermögen = Immobilienwert minus Restschuld) oder mieten und
          die eingesparte Differenz anlegen. Alle Annahmen sind frei einstellbar — so sehen Sie, ab welchem Jahr sich
          der Kauf rechnet. Kostenlos, ohne Anmeldung.
        </p>
      </header>

      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Kaufpreis" value={kaufpreis} onChange={setKaufpreis} suffix="€" step={5000} />
          <Field label="Vergleichbare Kaltmiete / Monat" value={kaltmiete} onChange={setKaltmiete} suffix="€" step={50}
            sub="Miete für eine gleichwertige Wohnung" />
          <Field label="Eigenkapital" value={eigenkapital} onChange={setEigenkapital} suffix="€" step={1000} />
          <Field label="Kaufnebenkosten" value={nkProzent} onChange={setNkProzent} suffix="%" step={0.5} max={20}
            sub="GrESt + Notar + Grundbuch (+ Makler)" />
          <Field label="Sollzins (p. a.)" value={zins} onChange={setZins} suffix="%" step={0.1} max={15} />
          <Field label="Anfängliche Tilgung (p. a.)" value={tilgung} onChange={setTilgung} suffix="%" step={0.5} max={15} />
          <Field label="Betrachtungszeitraum" value={jahre} onChange={setJahre} suffix="Jahre" step={1} min={1} max={50} />
          <Field label="Instandhaltung / Jahr" value={instandProzent} onChange={setInstandProzent} suffix="%" step={0.1} max={5}
            sub="vom Kaufpreis, für Eigentümer" />
        </div>

        <div className="mt-4 pt-4 border-t border-ink/10">
          <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-3">Annahmen über die Zukunft (frei wählbar)</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Wertsteigerung Immobilie" value={wertsteigerung} onChange={setWertsteigerung} suffix="% p.a." step={0.5} min={-5} max={15} />
            <Field label="Mietsteigerung" value={mietsteigerung} onChange={setMietsteigerung} suffix="% p.a." step={0.5} min={0} max={15} />
            <Field label="Anlagerendite (Mieter)" value={anlagerendite} onChange={setAnlagerendite} suffix="% p.a." step={0.5} min={0} max={15}
              sub="Rendite auf angelegtes Kapital" />
          </div>
        </div>
      </div>

      <div className="mt-5 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-3">Vermögen nach {r.n} Jahren</div>
        <div className="grid grid-cols-2 gap-3">
          <div className={`rounded-lg px-4 py-3 ${kaufenVorn ? 'bg-green/8 border border-green/30' : 'bg-cream border border-ink/10'}`}>
            <div className="text-[12px] text-ink-mid mb-0.5">Kaufen</div>
            <div className="font-display text-lg font-semibold text-ink tabular-nums">{eur(r.endKaufen)}</div>
            <div className="text-[11px] text-ink-light mt-0.5">Immobilienwert − Restschuld</div>
          </div>
          <div className={`rounded-lg px-4 py-3 ${!kaufenVorn ? 'bg-green/8 border border-green/30' : 'bg-cream border border-ink/10'}`}>
            <div className="text-[12px] text-ink-mid mb-0.5">Mieten + anlegen</div>
            <div className="font-display text-lg font-semibold text-ink tabular-nums">{eur(r.endMieten)}</div>
            <div className="text-[11px] text-ink-light mt-0.5">angelegtes Kapital</div>
          </div>
        </div>
        <div className="mt-3 bg-green/5 rounded-lg px-4 py-3 flex items-baseline justify-between gap-4">
          <div className="text-sm font-semibold text-green">
            {kaufenVorn ? 'Vorteil Kaufen' : 'Vorteil Mieten'} nach {r.n} Jahren
          </div>
          <div className="font-display text-xl font-semibold text-green tabular-nums">{eur(Math.abs(r.vorteil))}</div>
        </div>
        <p className="text-[12px] text-ink-mid mt-3 leading-snug">
          {r.breakEven > 0
            ? `Ab dem ${r.breakEven}. Jahr liegt der Kauf bei diesen Annahmen vorne.`
            : 'In diesem Zeitraum liegt das Mieten-plus-Anlegen bei diesen Annahmen vorne — der Kauf erreicht das Break-even erst später (oder gar nicht).'}
        </p>
        <p className="text-[11px] text-ink-light mt-2 leading-snug">
          Modell auf Basis Ihrer Annahmen — <strong>keine Prognose</strong> und keine Anlage- oder Finanzberatung. Nicht
          berücksichtigt: Steuern, Kaufnebenkosten beim späteren Verkauf, Umzugs-/Mieterhöhungsrisiken sowie der Wert von
          Flexibilität bzw. selbstgenutztem Wohnen. Verändern Sie die Annahmen, um die Bandbreite zu sehen.
        </p>
      </div>

      <div className="mt-5 bg-white border border-ink/15 rounded-xl p-5 shadow-sm overflow-x-auto">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-3">Vermögensverlauf</div>
        <table className="w-full text-sm tabular-nums">
          <thead>
            <tr className="text-[11px] text-ink-light text-left border-b border-ink/10">
              <th className="font-medium py-1.5 pr-2">Jahr</th>
              <th className="font-medium py-1.5 px-2 text-right">Vermögen Kaufen</th>
              <th className="font-medium py-1.5 pl-2 text-right">Vermögen Mieten</th>
            </tr>
          </thead>
          <tbody>
            {r.verlauf.map((z) => (
              <tr key={z.jahr} className={`border-b border-ink/5 ${r.breakEven === z.jahr ? 'bg-green/5' : ''}`}>
                <td className="py-1.5 pr-2 text-ink-mid">{z.jahr}</td>
                <td className="py-1.5 px-2 text-right text-ink">{eur(z.kaufen)}</td>
                <td className="py-1.5 pl-2 text-right text-ink">{eur(z.mieten)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Die grundsätzliche Abwägung vertieft der Ratgeber{' '}
          <a href="/blog/kaufen-oder-mieten-2026" className="text-green hover:text-green-mid underline">Kaufen oder mieten 2026</a>.
          Ob ein konkreter Angebotspreis fair ist, zeigt{' '}
          <a href="/blog/kaufpreisfaktor-mietrendite" className="text-green hover:text-green-mid underline">Kaufpreisfaktor &amp; Mietrendite</a>.
          Was insgesamt zum Budget passt, berechnet der{' '}
          <a href="/budgetrechner" className="text-green hover:text-green-mid underline">Budgetrechner</a>, die genaue
          Monatsrate der{' '}
          <a href="/tilgungsrechner" className="text-green hover:text-green-mid underline">Tilgungsrechner</a>.
        </p>
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Kaufen kann sich lohnen — aber passt das Objekt?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link, ob Preis, Lage und Zustand stimmen — damit aus „kaufen lohnt sich" auch
          das richtige Objekt wird.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
