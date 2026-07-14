import { useState, useMemo } from 'react'
import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { eur } from '../lib/kaufnebenkosten'
import { Field, Row } from './calcUi'

export default function InstandhaltungRechner() {
  const [wohnflaeche, setWohnflaeche] = useState(75)
  const [baujahr, setBaujahr] = useState(1990)
  const [baukostenQm, setBaukostenQm] = useState(2500)
  const [aktuell, setAktuell] = useState(0)

  const r = useMemo(() => {
    // Faustregel je nach Gebäudealter (€/m²/Monat)
    const faktor = baujahr <= 1990 ? 2.0 : baujahr < 2010 ? 1.5 : 1.0
    const faustregelMonat = faktor * Math.max(0, wohnflaeche)
    // Petersche Formel: über ~80 Jahre fällt das 1,5-fache der Herstellungskosten an
    const petersJahr = (Math.max(0, baukostenQm) * 1.5 / 80) * Math.max(0, wohnflaeche)
    const petersMonat = petersJahr / 12
    // Ampel anhand der Faustregel
    let ampel: 'gut' | 'knapp' | 'niedrig' | null = null
    if (aktuell > 0) {
      if (aktuell >= faustregelMonat) ampel = 'gut'
      else if (aktuell >= faustregelMonat * 0.6) ampel = 'knapp'
      else ampel = 'niedrig'
    }
    return { faktor, faustregelMonat, petersMonat, ampel }
  }, [wohnflaeche, baujahr, baukostenQm, aktuell])

  const ampelText = {
    gut: { t: 'Die Rücklage wirkt ausreichend.', c: 'text-green' },
    knapp: { t: 'Die Rücklage ist eher knapp bemessen.', c: 'text-amber-700' },
    niedrig: { t: 'Die Rücklage erscheint zu niedrig — Risiko einer Sonderumlage.', c: 'text-red-600' },
  }

  useSEO({
    title: 'Instandhaltungsrücklage-Rechner: Wie viel ist genug?',
    description:
      'Kostenloser Rechner für die Instandhaltungsrücklage: empfohlene Zuführung nach Faustregel und Peterscher Formel — mit Ampel, ob Ihre Rücklage reicht.',
    canonical: 'https://immopruef.de/instandhaltungsruecklage-rechner',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ImmoPrüf Instandhaltungsrücklage-Rechner',
        url: 'https://immopruef.de/instandhaltungsruecklage-rechner',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
        inLanguage: 'de-DE',
        description: 'Schätzt die empfohlene monatliche Instandhaltungsrücklage einer Eigentumswohnung nach Faustregel und Peterscher Formel und bewertet, ob die aktuelle Zuführung ausreicht.',
      },
      faqSchema([
        {
          question: 'Wie hoch sollte die Instandhaltungsrücklage pro Monat sein?',
          answer: 'Als Faustregel gelten etwa 1 €/m²/Monat bei jungen Gebäuden, 1,50 € bei mittlerem Alter und rund 2 €/m²/Monat bei Altbauten. Für eine 75-m²-Wohnung im Bestand sind das grob 110 bis 150 € pro Monat. Genauer rechnet die Petersche Formel auf Basis der Herstellungskosten.',
        },
        {
          question: 'Was ist die Petersche Formel?',
          answer: 'Die Petersche Formel geht davon aus, dass über die Lebensdauer von rund 80 Jahren etwa das 1,5-fache der Herstellungskosten für Instandhaltung anfällt. Jährliche Rücklage = Herstellungskosten je m² × 1,5 ÷ 80 × Wohnfläche. Sie liefert eine fundiertere Schätzung als die einfache Faustregel.',
        },
        {
          question: 'Warum ist eine zu niedrige Rücklage beim Wohnungskauf ein Risiko?',
          answer: 'Reicht die Instandhaltungsrücklage der Eigentümergemeinschaft nicht für anstehende Sanierungen (Dach, Fassade, Heizung, Aufzug), drohen Sonderumlagen, die schnell mehrere tausend Euro betragen können. Prüfen Sie vor dem Kauf die Höhe der Rücklage und die letzten Protokolle der Eigentümerversammlung.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Instandhaltungsrücklage-Rechner', url: 'https://immopruef.de/instandhaltungsruecklage-rechner' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Instandhaltungsrücklage richtig einschätzen
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Wie hoch sollte die Instandhaltungsrücklage einer Eigentumswohnung sein? Der Rechner liefert die empfohlene
          monatliche Rücklage nach Faustregel und Peterscher Formel — und zeigt per Ampel, ob die aktuelle Zuführung
          reicht. Kostenlos, ohne Anmeldung.
        </p>
      </header>

      <div className="bg-white border border-ink/15 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Wohnfläche" value={wohnflaeche} onChange={setWohnflaeche} suffix="m²" step={1} />
          <Field label="Baujahr" value={baujahr} onChange={setBaujahr} suffix="" step={1} min={1850} max={2030} />
          <Field label="Herstellungskosten" value={baukostenQm} onChange={setBaukostenQm} suffix="€/m²" step={100}
            sub="für die Petersche Formel (grob 2.000–3.500)" />
          <Field label="Aktuelle Rücklage / Monat" value={aktuell} onChange={setAktuell} suffix="€" step={10}
            sub="optional — für die Ampel" />
        </div>
      </div>

      <div className="mt-5 bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-1">Empfohlene Rücklage / Monat</div>
        <Row label="Nach Faustregel" sub={`${r.faktor.toLocaleString('de-DE', { minimumFractionDigits: 1 })} €/m² (Baujahr ${baujahr})`} value={eur(r.faustregelMonat)} />
        <Row label="Nach Peterscher Formel" sub={`${eur(baukostenQm)}/m² × 1,5 ÷ 80`} value={eur(r.petersMonat)} strong />
        {r.ampel && (
          <p className={`text-[13px] font-medium mt-3 ${ampelText[r.ampel].c}`}>
            Aktuell {eur(aktuell)}/Monat: {ampelText[r.ampel].t}
          </p>
        )}
        <p className="text-[11px] text-ink-light mt-3 leading-snug">
          Grobe Orientierung, keine verbindliche Berechnung. Die tatsächlich nötige Rücklage hängt von Zustand,
          Ausstattung und anstehenden Maßnahmen ab. Prüfen Sie vor dem Kauf die echte Rücklagenhöhe der
          Eigentümergemeinschaft und die letzten Protokolle.
        </p>
      </div>

      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Wie Hausgeld, Rücklage und Sonderumlage zusammenhängen, erklärt{' '}
          <a href="/blog/hausgeld-ruecklagen-sonderumlage" className="text-green hover:text-green-mid underline">Hausgeld, Rücklagen &amp; Sonderumlage</a>;
          worauf Sie in der{' '}
          <a href="/blog/teilungserklaerung-pruefen" className="text-green hover:text-green-mid underline">Teilungserklärung</a>{' '}
          achten sollten, lesen Sie im jeweiligen Ratgeber.
        </p>
      </div>

      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Eigentumswohnung im Blick?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link auch Hinweise auf eine zu niedrige Rücklage und mögliche Folgekosten.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
