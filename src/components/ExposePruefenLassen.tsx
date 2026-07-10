import { useSEO, breadcrumbSchema, faqSchema } from '../lib/useSEO'

// Landingpage für das Ziel-Keyword „Exposé prüfen lassen" (transaktionale Suchintention).
// SEO-Analyse 07/2026: schwächste SERP im Themenfeld (nur lokale Gutachter) bei
// exakter Produktbeschreibung — deshalb eigene LP statt Blogartikel.

const PRUEF_PUNKTE = [
  { titel: 'Preisplausibilität', detail: 'Angebotspreis gegen regionale Vergleichswerte, €/m²-Einordnung, Kaufpreisfaktor' },
  { titel: 'Kaufnebenkosten', detail: 'Grunderwerbsteuer, Notar, Grundbuch, Provision — auf den Euro gerechnet' },
  { titel: 'Warnsignale & Lücken', detail: 'Fehlende Pflichtangaben, Maklersprache-Floskeln, widersprüchliche Angaben' },
  { titel: 'Zustand & Folgekosten', detail: 'Baujahr-Risiken, Modernisierungsstau, Sanierungskosten-Schätzung' },
  { titel: 'Energie & GEG', detail: 'Effizienzklasse, Heizung, mögliche Sanierungspflichten und Förderungen' },
  { titel: 'Standort', detail: 'Lage, Infrastruktur, Demografie und Preisentwicklung des Viertels' },
  { titel: 'Finanzierung', detail: 'Drei Szenarien mit Monatsrate, Restschuld und Stresstest' },
  { titel: 'Verhandlung', detail: 'Konkrete Verhandlungsansätze + fertiges Makleranschreiben' },
]

const FAQ_ITEMS = [
  {
    question: 'Was kostet es, ein Exposé prüfen zu lassen?',
    answer: 'Bei ImmoPrüf kostet die vollständige Exposé-Prüfung 19 € (Quick-Check) oder 79 € (Premium-Report mit Wertermittlung nach drei Verfahren und Standort-Dossier). Zum Vergleich: Ein Kurzgutachten vom Sachverständigen kostet üblicherweise 500–1.000 €, eine Kaufberatung mit Ortstermin oft mehr.',
  },
  {
    question: 'Wie schnell bekomme ich das Ergebnis?',
    answer: 'In der Regel innerhalb weniger Minuten nach der Bestellung. Sie erhalten den vollständigen Report direkt im Browser und zusätzlich als Link per E-Mail — auch abends und am Wochenende, wenn Besichtigungstermine anstehen.',
  },
  {
    question: 'Was wird beim Exposé-Check geprüft?',
    answer: 'Preisplausibilität mit regionalen Vergleichswerten, vollständige Kaufnebenkosten, fehlende Pflichtangaben und Warnsignale, Zustand und Folgekosten, Energie und GEG-Pflichten, Standortqualität, drei Finanzierungsszenarien mit Stresstest sowie Verhandlungsansätze mit fertigem Makleranschreiben.',
  },
  {
    question: 'Geht das auch ohne Link — z. B. mit einem PDF vom Makler?',
    answer: 'Ja. Sie können entweder den Link zum Inserat (ImmoScout24, Immowelt, Immonet, Kleinanzeigen) einfügen oder ein Exposé-PDF bzw. bis zu 8 Fotos hochladen — zum gleichen Preis. Das ist ideal für Objekte, die nicht öffentlich inseriert sind.',
  },
  {
    question: 'Ersetzt die Prüfung einen Gutachter?',
    answer: 'Nein, und das sagen wir bewusst deutlich: Eine Ersteinschätzung aus dem Exposé ersetzt kein Verkehrswertgutachten und keine Vor-Ort-Begehung. Sie klärt die Frage davor: Lohnt es sich, in dieses Objekt Zeit, Besichtigung und gegebenenfalls Gutachterkosten zu investieren? Werte, die nicht im Exposé stehen, kennzeichnen wir als Schätzwerte.',
  },
  {
    question: 'Arbeitet ImmoPrüf unabhängig?',
    answer: 'Ja — das ist der Kern des Modells. Sie bezahlen uns, deshalb arbeiten wir nur für Sie: Wir verkaufen keine Kontaktdaten an Makler, vermitteln keine Finanzierungen und erhalten keine Provision vom Verkäufer. Kostenlose Bewertungsportale finanzieren sich dagegen meist über Makler-Leads oder Finanzierungsvermittlung.',
  },
  {
    question: 'Wie zuverlässig ist eine KI-gestützte Prüfung?',
    answer: 'Alle Finanzberechnungen (Nebenkosten, Raten, Restschulden) werden deterministisch nachgerechnet, nicht von der KI geschätzt. Marktdaten werden per Web-Recherche mit Quellenangabe belegt. Werte ohne Beleg im Exposé sind ausdrücklich als „regionaler Schätzwert" markiert — im Gegensatz zu einer losen ChatGPT-Anfrage, bei der Sie jede Zahl selbst verifizieren müssten.',
  },
]

const VERGLEICH = [
  { methode: 'Selbst prüfen', kosten: '0 €', dauer: 'Mehrere Stunden', staerke: 'Kostenlos, Lerneffekt', grenze: 'Vergleichswerte und Vollständigkeit schwer einzuschätzen' },
  { methode: 'ChatGPT & Co.', kosten: '0–23 €/Monat', dauer: 'Minuten', staerke: 'Schnell, flexibel', grenze: 'Rechenfehler und erfundene Marktwerte möglich — jede Zahl muss selbst geprüft werden' },
  { methode: 'ImmoPrüf', kosten: '19–79 € einmalig', dauer: 'Wenige Minuten', staerke: 'Käuferseitig, nachgerechnete Finanzen, Quellenangaben, Schätzwerte markiert', grenze: 'Keine Vor-Ort-Begehung — ersetzt kein Gutachten' },
  { methode: 'Gutachter / Kaufberatung', kosten: 'ca. 500–1.800 €', dauer: 'Tage bis Wochen', staerke: 'Vor-Ort-Prüfung, gerichtsfest (Vollgutachten)', grenze: 'Teuer und langsam — für die Vorauswahl mehrerer Objekte unpraktisch' },
]

export default function ExposePruefenLassen() {
  useSEO({
    title: 'Exposé prüfen lassen: unabhängiger Check in Minuten',
    description:
      'Immobilien-Exposé prüfen lassen ab 19 €: Preisplausibilität, Kaufnebenkosten, Warnsignale, Finanzierung — käuferseitig, ohne Makler-Leads. Link oder PDF hochladen, Ergebnis in Minuten.',
    canonical: 'https://immopruef.de/expose-pruefen-lassen',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: 'Exposé-Prüfung für Immobilienkäufer',
        serviceType: 'Immobilien-Exposé-Analyse',
        provider: { '@type': 'Organization', name: 'ImmoPrüf', url: 'https://immopruef.de' },
        areaServed: 'DE',
        description:
          'Unabhängige Prüfung von Immobilien-Exposés für Kaufinteressenten: Preisplausibilität, Kaufnebenkosten, Risiken, Energie, Standort und Finanzierungsszenarien — aus Portal-Link oder PDF-Upload.',
        offers: [
          { '@type': 'Offer', name: 'Quick-Check', price: '19.00', priceCurrency: 'EUR', url: 'https://immopruef.de/expose-pruefen-lassen' },
          { '@type': 'Offer', name: 'Premium Kaufentscheidungs-Report', price: '79.00', priceCurrency: 'EUR', url: 'https://immopruef.de/expose-pruefen-lassen' },
        ],
      },
      faqSchema(FAQ_ITEMS),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Exposé prüfen lassen', url: 'https://immopruef.de/expose-pruefen-lassen' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Exposé prüfen lassen — unabhängiger Check, bevor Sie besichtigen
        </h1>
        {/* AEO-Definitionsabsatz: direkte 50-Wörter-Antwort für Featured Snippets / AI Overviews */}
        <p className="text-ink-mid text-[15px] leading-relaxed">
          Wer ein Immobilien-Exposé prüfen lassen will, bekommt bei ImmoPrüf in wenigen Minuten eine
          strukturierte Ersteinschätzung: Preisplausibilität mit regionalen Vergleichswerten, vollständige
          Kaufnebenkosten, Warnsignale, Energie- und Standortanalyse sowie drei Finanzierungsszenarien —
          ab 19 €, käuferseitig und ohne Weitergabe Ihrer Daten an Makler.
        </p>
      </header>

      {/* Trust-Leiste */}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-ink-mid mb-8">
        {['Käuferseitig — Sie bezahlen uns, nicht der Verkäufer', 'Ergebnis in Minuten statt Wochen', 'Link ODER PDF/Fotos hochladen'].map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green shrink-0"><polyline points="20 6 9 17 4 12"/></svg>
            {t}
          </span>
        ))}
      </div>

      {/* CTA oben */}
      <div className="bg-green text-cream rounded-xl p-6 mb-10">
        <div className="sm:flex items-center justify-between gap-4">
          <div className="mb-4 sm:mb-0">
            <div className="font-display text-lg font-medium mb-1">Exposé jetzt prüfen lassen</div>
            <p className="text-cream/75 text-[13px] leading-relaxed">
              Link zum Inserat einfügen oder Exposé-PDF hochladen — Report ab 19 €, in wenigen Minuten per E-Mail.
            </p>
          </div>
          <a
            href="/#analyse-form"
            className="inline-block bg-cream text-green px-6 py-3 rounded-lg font-medium text-sm hover:bg-white transition-colors shrink-0"
          >
            Analyse starten →
          </a>
        </div>
      </div>

      {/* Was geprüft wird */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-medium text-green mb-4">Was beim Exposé-Check geprüft wird</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRUEF_PUNKTE.map((p) => (
            <div key={p.titel} className="bg-white border border-ink/10 rounded-xl p-4">
              <div className="font-medium text-sm text-ink mb-1">{p.titel}</div>
              <p className="text-[12.5px] text-ink-mid leading-relaxed">{p.detail}</p>
            </div>
          ))}
        </div>
        <p className="text-xs text-ink-light mt-3 leading-relaxed">
          Alle Finanzwerte werden deterministisch nachgerechnet; Marktwerte tragen Quellenangaben; was nicht
          im Exposé steht, ist ausdrücklich als „regionaler Schätzwert" markiert.
        </p>
      </section>

      {/* So funktioniert's */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-medium text-green mb-4">So funktioniert es</h2>
        <ol className="space-y-3">
          {[
            ['Exposé übergeben', 'Link von ImmoScout24, Immowelt, Immonet oder Kleinanzeigen einfügen — oder das Makler-PDF bzw. bis zu 8 Fotos hochladen (gleicher Preis).'],
            ['Analyse läuft', 'Preis, Kosten, Risiken, Energie, Standort und Finanzierung werden geprüft; Marktdaten per Web-Recherche belegt.'],
            ['Report erhalten', 'Vollständiger Report in wenigen Minuten — im Browser und als Link per E-Mail, beim Premium-Report inklusive PDF-Export.'],
          ].map(([titel, text], i) => (
            <li key={titel} className="flex gap-3 bg-white border border-ink/10 rounded-xl p-4">
              <span className="bg-green text-cream font-display font-semibold w-7 h-7 rounded-full flex items-center justify-center text-sm shrink-0">{i + 1}</span>
              <div>
                <div className="font-medium text-sm text-ink mb-0.5">{titel}</div>
                <p className="text-[12.5px] text-ink-mid leading-relaxed">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Vergleichstabelle — zitierfähig für AI Overviews */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-medium text-green mb-4">
          Exposé prüfen: alle Wege im Vergleich
        </h2>
        <div className="bg-white border border-ink/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[12.5px] min-w-[560px]">
              <thead>
                <tr className="bg-green/5 text-green">
                  <th className="px-3 py-2.5 text-left font-medium tracking-wider uppercase text-[10px]">Methode</th>
                  <th className="px-3 py-2.5 text-left font-medium tracking-wider uppercase text-[10px]">Kosten</th>
                  <th className="px-3 py-2.5 text-left font-medium tracking-wider uppercase text-[10px]">Dauer</th>
                  <th className="px-3 py-2.5 text-left font-medium tracking-wider uppercase text-[10px]">Stärke</th>
                  <th className="px-3 py-2.5 text-left font-medium tracking-wider uppercase text-[10px]">Grenze</th>
                </tr>
              </thead>
              <tbody>
                {VERGLEICH.map((v, i) => (
                  <tr key={v.methode} className={`border-t border-ink/8 align-top ${v.methode === 'ImmoPrüf' ? 'bg-green/4' : i % 2 === 1 ? 'bg-cream/40' : ''}`}>
                    <td className={`px-3 py-2.5 whitespace-nowrap ${v.methode === 'ImmoPrüf' ? 'font-semibold text-green' : 'font-medium'}`}>{v.methode}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{v.kosten}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap">{v.dauer}</td>
                    <td className="px-3 py-2.5 [overflow-wrap:anywhere]">{v.staerke}</td>
                    <td className="px-3 py-2.5 text-ink-mid [overflow-wrap:anywhere]">{v.grenze}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-ink-light mt-2 leading-relaxed">
          Gutachter-Preisspanne: marktübliche Kurzgutachten und Kaufberatungen, Stand Juli 2026. Für die
          finale Kaufentscheidung bei Auffälligkeiten empfehlen wir ausdrücklich einen Sachverständigen
          vor Ort — der Exposé-Check klärt, ob sich dieser Schritt lohnt.
        </p>
      </section>

      {/* Ehrlichkeits-Block / Abgrenzung */}
      <section className="mb-10 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <h2 className="font-display text-lg font-medium text-amber-900 mb-2">Was der Exposé-Check nicht ist</h2>
        <p className="text-[13px] text-amber-900/90 leading-relaxed">
          Keine Vor-Ort-Begehung, kein Verkehrswertgutachten, keine Rechts- oder Steuerberatung. Die Analyse
          beantwortet die Frage <em>davor</em>: Ist dieses Angebot eine Besichtigung wert — und mit welchen
          Fragen, Kosten und Verhandlungsargumenten gehen Sie hinein? Genau dafür ist sie in Minuten da,
          statt in Wochen.
        </p>
      </section>

      {/* Preise */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-medium text-green mb-4">Preise</h2>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="bg-white border border-ink/10 rounded-xl p-5">
            <div className="font-display text-lg font-medium text-ink mb-1">Quick-Check</div>
            <div className="font-display text-3xl font-semibold text-green mb-2">19 €</div>
            <p className="text-[12.5px] text-ink-mid leading-relaxed mb-3">
              Vollständige Analyse mit allen 8 Prüfbereichen, Verhandlungstipps und Makleranschreiben.
              Auch als 2er- (29 €) und 3er-Paket (34 €) zum Vergleichen mehrerer Objekte.
            </p>
            <a href="/#analyse-form" className="text-green text-sm font-medium hover:text-green-mid transition-colors">Jetzt starten →</a>
          </div>
          <div className="bg-white border-2 border-green/30 rounded-xl p-5 ring-1 ring-green/10">
            <div className="font-display text-lg font-medium text-ink mb-1">Premium Kaufentscheidungs-Report</div>
            <div className="font-display text-3xl font-semibold text-green mb-2">79 €</div>
            <p className="text-[12.5px] text-ink-mid leading-relaxed mb-3">
              Zusätzlich: indikative Wertermittlung nach drei Verfahren, Standort-Dossier (Hochwasser, Lärm,
              B-Plan), 30-Jahres-Vermögensvergleich, Vor-Kauf-Checkliste, PDF-Export.
            </p>
            <a href="/#analyse-form" className="text-green text-sm font-medium hover:text-green-mid transition-colors">Jetzt starten →</a>
          </div>
        </div>
      </section>

      {/* FAQ — sichtbar UND als Schema */}
      <section className="mb-10">
        <h2 className="font-display text-2xl font-medium text-green mb-4">Häufige Fragen</h2>
        <div className="space-y-4">
          {FAQ_ITEMS.map((f) => (
            <div key={f.question} className="bg-white border border-ink/10 rounded-xl p-5">
              <h3 className="font-medium text-sm text-ink mb-2">{f.question}</h3>
              <p className="text-[13px] text-ink-mid leading-relaxed">{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Weiterführend: selbst prüfen */}
      <section className="mb-6">
        <h2 className="font-display text-lg font-medium text-green mb-3">Lieber erst selbst prüfen?</h2>
        <p className="text-[13px] text-ink-mid leading-relaxed mb-3">
          In unseren Ratgebern zeigen wir, worauf Sie im Exposé achten sollten — und mit den kostenlosen
          Rechnern überschlagen Sie Nebenkosten und Finanzierung selbst:
        </p>
        <ul className="text-sm space-y-1.5">
          <li><a href="/blog/expose-pruefen" className="text-green underline decoration-green/30 hover:decoration-green transition-colors">Exposé prüfen: Warnsignale & Red Flags erkennen</a></li>
          <li><a href="/blog/was-im-expose-fehlt" className="text-green underline decoration-green/30 hover:decoration-green transition-colors">Was im Exposé fehlt: 10 Angaben, die Sie einfordern sollten</a></li>
          <li><a href="/blog/warnsignale-expose" className="text-green underline decoration-green/30 hover:decoration-green transition-colors">Warnsignale im Exposé richtig deuten</a></li>
          <li><a href="/rechner" className="text-green underline decoration-green/30 hover:decoration-green transition-colors">Alle kostenlosen Immobilien-Rechner</a></li>
        </ul>
      </section>
    </div>
  )
}
