import { useState, useMemo } from 'react'
import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { eur } from '../lib/kaufnebenkosten'
import { Field, Row } from './calcUi'

export default function WohnflaechenRechner() {
  const [voll, setVoll] = useState(60)
  const [schraege, setSchraege] = useState(10)
  const [balkon, setBalkon] = useState(8)
  const [balkonFaktor, setBalkonFaktor] = useState(25)
  const [kaufpreis, setKaufpreis] = useState(350000)
  const [beworben, setBeworben] = useState(0)

  const r = useMemo(() => {
    const anrechenbar = Math.max(0, voll) + Math.max(0, schraege) * 0.5 + Math.max(0, balkon) * (balkonFaktor / 100)
    const qmPreis = anrechenbar > 0 ? kaufpreis / anrechenbar : 0
    const hatBeworben = beworben > 0
    const qmPreisBeworben = hatBeworben ? kaufpreis / beworben : 0
    const diffFlaeche = hatBeworben ? beworben - anrechenbar : 0
    return { anrechenbar, qmPreis, hatBeworben, qmPreisBeworben, diffFlaeche }
  }, [voll, schraege, balkon, balkonFaktor, kaufpreis, beworben])

  useSEO({
    title: 'Wohnflächenrechner (WoFlV) & Quadratmeterpreis berechnen',
    description:
      'Kostenloser Wohnflächenrechner nach WoFlV: anrechenbare Fläche aus Dachschrägen und Balkon berechnen und den echten Quadratmeterpreis ermitteln.',
    canonical: 'https://immopruef.de/wohnflaechen-rechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImmoPrüf Wohnflächenrechner',
        url: 'https://immopruef.de/wohnflaechen-rechner',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage: 'de-DE',
        description: 'Berechnet die anrechenbare Wohnfläche nach Wohnflächenverordnung (WoFlV) und den Quadratmeterpreis und deckt Abweichungen zur im Exposé beworbenen Fläche auf.',
      },
      faqSchema([
        {
          question: 'Wie wird die Wohnfläche nach der Wohnflächenverordnung berechnet?',
          answer: 'Räume ab 2 m Höhe zählen voll (100 %), Flächen zwischen 1 und 2 m Höhe (etwa unter Dachschrägen) nur zur Hälfte (50 %), unter 1 m gar nicht. Balkone, Terrassen und Loggien werden in der Regel zu 25 %, maximal 50 % angerechnet. Keller, Waschküchen und Heizungsräume zählen nicht zur Wohnfläche.',
        },
        {
          question: 'Warum weicht die beworbene Wohnfläche oft von der echten ab?',
          answer: 'Im Exposé wird die Fläche manchmal großzügig gerechnet — etwa Balkone voll statt zu 25 % oder Dachschrägen-Flächen voll statt zur Hälfte. Da der Quadratmeterpreis auf die Fläche bezogen wird, lässt eine zu hoch angesetzte Wohnfläche den Preis pro m² künstlich niedrig erscheinen.',
        },
        {
          question: 'Wie wirkt sich eine falsche Wohnfläche auf den Quadratmeterpreis aus?',
          answer: 'Der Quadratmeterpreis ist Kaufpreis geteilt durch Wohnfläche. Sind statt beworbener 80 m² real nur 72 m² anrechenbar, steigt der m²-Preis bei gleichem Kaufpreis spürbar. Rechnen Sie immer mit der anrechenbaren Fläche nach WoFlV, um Angebote fair zu vergleichen.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Wohnflächenrechner', url: 'https://immopruef.de/wohnflaechen-rechner' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Wohnflächenrechner &amp; Quadratmeterpreis
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Berechnen Sie die anrechenbare Wohnfläche nach Wohnflächenverordnung (WoFlV) und den echten Quadratmeterpreis —
          und vergleichen Sie mit der im Exposé beworbenen Fläche. So erkennen Sie zu großzügig gerechnete Angaben.
          Kostenlos, ohne Anmeldung.
        </p>
      </header>

      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Vollflächen (Raumhöhe ab 2 m)" value={voll} onChange={setVoll} suffix="m²" step={1}
            sub="zählen zu 100 %" />
          <Field label="Flächen unter Dachschräge (1–2 m)" value={schraege} onChange={setSchraege} suffix="m²" step={1}
            sub="zählen zu 50 %" />
          <Field label="Balkon / Terrasse / Loggia" value={balkon} onChange={setBalkon} suffix="m²" step={1} />
          <Field label="Anrechnung Balkon/Terrasse" value={balkonFaktor} onChange={setBalkonFaktor} suffix="%" step={5} max={50}
            sub="i. d. R. 25 %, max. 50 %" />
          <Field label="Kaufpreis" value={kaufpreis} onChange={setKaufpreis} suffix="€" step={5000} />
          <Field label="Beworbene Wohnfläche" value={beworben} onChange={setBeworben} suffix="m²" step={1}
            sub="optional — laut Exposé" />
        </div>
      </div>

      <div className="mt-5 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1">Ergebnis</div>
        <div className="bg-green/5 rounded-lg px-4 py-3 flex items-baseline justify-between gap-4 mb-2">
          <div className="text-sm font-semibold text-green">Anrechenbare Wohnfläche (WoFlV)</div>
          <div className="font-display text-xl font-semibold text-green tabular-nums">
            {r.anrechenbar.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m²
          </div>
        </div>
        <Row label="Quadratmeterpreis (anrechenbar)" sub={`${eur(kaufpreis)} / ${r.anrechenbar.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m²`} value={eur(r.qmPreis)} strong />
        {r.hatBeworben && (
          <>
            <Row label="m²-Preis auf beworbene Fläche" sub={`${eur(kaufpreis)} / ${beworben} m²`} value={eur(r.qmPreisBeworben)} />
            <p className={`text-[12px] mt-3 leading-snug ${Math.abs(r.diffFlaeche) >= 1 ? 'text-amber-700' : 'text-ink-mid'}`}>
              {r.diffFlaeche > 0.5
                ? `Die beworbene Fläche liegt ${r.diffFlaeche.toLocaleString('de-DE', { maximumFractionDigits: 1 })} m² über der nach WoFlV anrechenbaren — der echte Quadratmeterpreis ist entsprechend höher.`
                : r.diffFlaeche < -0.5
                  ? `Die anrechenbare Fläche liegt über der beworbenen — hier wurde eher konservativ gerechnet.`
                  : 'Beworbene und anrechenbare Fläche stimmen weitgehend überein.'}
            </p>
          </>
        )}
        <p className="text-[11px] text-ink-light mt-3 leading-snug">
          Orientierung nach WoFlV — die genaue Anrechnung (besonders der Balkon-Faktor) kann vertraglich abweichen.
          Maßgeblich ist im Zweifel eine fachgerechte Aufmessung.
        </p>
      </div>

      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Wie Sie die Wohnfläche im Exposé einordnen, erklärt{' '}
          <a href="/blog/wohnflaeche-richtig-einordnen" className="text-green hover:text-green-mid underline">Wohnfläche richtig einordnen</a>;
          was der{' '}
          <a href="/blog/quadratmeterpreis-bewerten" className="text-green hover:text-green-mid underline">Quadratmeterpreis</a>{' '}
          wirklich aussagt, lesen Sie im jeweiligen Ratgeber.
        </p>
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Stimmen die Angaben im Exposé?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link Preis, Fläche und Plausibilität — und macht zu schöne Angaben sichtbar.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
