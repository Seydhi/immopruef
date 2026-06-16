import { useState, useMemo } from 'react'
import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { eur, pct } from '../lib/kaufnebenkosten'
import { Field, Row } from './calcUi'

export default function MietrenditeRechner() {
  const [kaufpreis, setKaufpreis] = useState(350000)
  const [wohnflaeche, setWohnflaeche] = useState(75)
  const [kaltmiete, setKaltmiete] = useState(1100)
  const [nkProzent, setNkProzent] = useState(11)
  const [bewirtProzent, setBewirtProzent] = useState(20)

  const r = useMemo(() => {
    const jahreskaltmiete = kaltmiete * 12
    const brutto = kaufpreis > 0 ? (jahreskaltmiete / kaufpreis) * 100 : 0
    const faktor = jahreskaltmiete > 0 ? kaufpreis / jahreskaltmiete : 0
    const gesamtinvest = kaufpreis * (1 + nkProzent / 100)
    const nettoMiete = jahreskaltmiete * (1 - bewirtProzent / 100)
    const netto = gesamtinvest > 0 ? (nettoMiete / gesamtinvest) * 100 : 0
    const qmPreis = wohnflaeche > 0 ? kaufpreis / wohnflaeche : 0
    let einordnung: string
    if (faktor < 20) einordnung = 'günstig — typisch für strukturschwächere Regionen mit höherem Risiko'
    else if (faktor < 25) einordnung = 'solide und ausgewogen'
    else if (faktor < 30) einordnung = 'teuer — typisch für gefragte Großstadtlagen'
    else einordnung = 'sehr teuer — der Kauf ist primär eine Wette auf Wertsteigerung'
    return { jahreskaltmiete, brutto, faktor, gesamtinvest, netto, qmPreis, einordnung }
  }, [kaufpreis, wohnflaeche, kaltmiete, nkProzent, bewirtProzent])

  useSEO({
    title: 'Mietrendite- & Kaufpreisfaktor-Rechner: Lohnt sich die Immobilie?',
    description:
      'Kostenloser Rechner für Mietrendite und Kaufpreisfaktor: Aus Kaufpreis, Wohnfläche und Kaltmiete sofort Bruttomietrendite, Nettomietrendite, Kaufpreisfaktor und Quadratmeterpreis berechnen — mit Einordnung von günstig bis teuer.',
    canonical: 'https://immopruef.de/mietrendite-rechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImmoPrüf Mietrendite-Rechner',
        url: 'https://immopruef.de/mietrendite-rechner',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage: 'de-DE',
        description: 'Berechnet Bruttomietrendite, Nettomietrendite, Kaufpreisfaktor und Quadratmeterpreis einer Immobilie als Kapitalanlage und ordnet das Ergebnis ein.',
      },
      faqSchema([
        {
          question: 'Wie berechne ich die Bruttomietrendite?',
          answer: 'Die Bruttomietrendite ergibt sich aus Jahreskaltmiete geteilt durch Kaufpreis mal 100. Beispiel: 13.200 € Jahreskaltmiete geteilt durch 350.000 € Kaufpreis ergeben rund 3,8 %. Sie eignet sich für den schnellen Vergleich, lässt aber Kaufnebenkosten und Bewirtschaftungskosten außen vor.',
        },
        {
          question: 'Was sagt der Kaufpreisfaktor aus?',
          answer: 'Der Kaufpreisfaktor ist Kaufpreis geteilt durch Jahreskaltmiete und zeigt, wie viele Jahresmieten der Kaufpreis entspricht. Als grobe Orientierung gilt: unter 20 günstig, 20 bis 25 solide, 25 bis 30 teuer, über 30 sehr teuer. In gefragten Großstädten liegt der Faktor oft bei 25 bis 35.',
        },
        {
          question: 'Warum ist die Nettomietrendite niedriger als die Bruttomietrendite?',
          answer: 'Die Nettomietrendite berücksichtigt die Kaufnebenkosten und die nicht umlagefähigen Bewirtschaftungskosten (oft 20 bis 25 % der Kaltmiete). Sie liegt dadurch typischerweise 1 bis 1,5 Prozentpunkte unter der Bruttomietrendite und ist die aussagekräftigere Kennzahl.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Mietrendite-Rechner', url: 'https://immopruef.de/mietrendite-rechner' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Mietrendite &amp; Kaufpreisfaktor berechnen
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Aus Kaufpreis, Wohnfläche und Kaltmiete berechnen Sie sofort Brutto- und Nettomietrendite, Kaufpreisfaktor und
          Quadratmeterpreis — mit Einordnung, ob das Angebot günstig oder teuer ist. Kostenlos, ohne Anmeldung.
        </p>
      </header>

      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Kaufpreis" value={kaufpreis} onChange={setKaufpreis} suffix="€" step={5000} />
          <Field label="Wohnfläche" value={wohnflaeche} onChange={setWohnflaeche} suffix="m²" step={1} />
          <Field label="Kaltmiete / Monat" value={kaltmiete} onChange={setKaltmiete} suffix="€" step={50}
            sub="ortsübliche Miete, nicht Wunschmiete" />
          <Field label="Kaufnebenkosten" value={nkProzent} onChange={setNkProzent} suffix="%" step={0.5} max={20}
            sub="GrESt + Notar + Grundbuch (+ Makler)" />
          <Field label="Bewirtschaftungskosten" value={bewirtProzent} onChange={setBewirtProzent} suffix="%" step={1} max={50}
            sub="nicht umlagefähig, Anteil der Kaltmiete" />
        </div>
      </div>

      <div className="mt-5 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1">Ergebnis</div>
        <div className="bg-green/5 rounded-lg px-4 py-3 flex items-baseline justify-between gap-4 mb-2">
          <div className="text-sm font-semibold text-green">Kaufpreisfaktor</div>
          <div className="font-display text-xl font-semibold text-green tabular-nums">
            {r.faktor.toLocaleString('de-DE', { maximumFractionDigits: 1 })}
          </div>
        </div>
        <Row label="Bruttomietrendite" sub={`${eur(r.jahreskaltmiete)} Jahreskaltmiete`} value={pct(r.brutto)} />
        <Row label="Nettomietrendite" sub={`nach NK & ${pct(bewirtProzent)} Bewirtschaftung`} value={pct(r.netto)} />
        <Row label="Quadratmeterpreis" sub={`${eur(kaufpreis)} / ${wohnflaeche} m²`} value={eur(r.qmPreis)} />
        <Row label="Gesamtinvestition" sub="Kaufpreis inkl. Kaufnebenkosten" value={eur(r.gesamtinvest)} strong />
        <p className="text-[12px] text-ink-mid mt-3 leading-snug">
          <strong className="text-ink">Einordnung:</strong> Ein Kaufpreisfaktor von{' '}
          {r.faktor.toLocaleString('de-DE', { maximumFractionDigits: 1 })} gilt als {r.einordnung}.
        </p>
        <p className="text-[11px] text-ink-light mt-2 leading-snug">
          Grobe Orientierung, keine Anlageberatung. Die Werte schwanken regional stark; Leerstand, Sanierungsstau und
          Mietausfallrisiko sind nicht berücksichtigt. Setzen Sie eine realistische ortsübliche Miete an, keine Wunschmiete.
        </p>
      </div>

      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Wie Sie Kaufpreisfaktor und Mietrendite richtig deuten, erklärt{' '}
          <a href="/blog/kaufpreisfaktor-mietrendite" className="text-green hover:text-green-mid underline">Kaufpreisfaktor &amp; Mietrendite</a>;
          worauf es bei der Kapitalanlage ankommt, zeigt{' '}
          <a href="/blog/wohnung-kaufen-vermieten-kapitalanlage" className="text-green hover:text-green-mid underline">Wohnung kaufen und vermieten</a>.
          Ob der Preis insgesamt fair ist, prüft der{' '}
          <a href="/grunderwerbsteuer-rechner" className="text-green hover:text-green-mid underline">Kaufnebenkosten-Rechner</a>.
        </p>
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Kapitalanlage im Blick?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link, ob Preis, Lage und Zustand zur erwarteten Rendite passen.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
