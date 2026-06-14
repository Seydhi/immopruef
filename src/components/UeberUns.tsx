import { useSEO, breadcrumbSchema } from '../lib/useSEO'

export default function UeberUns() {
  useSEO({
    title: 'Über ImmoPrüf: Wer wir sind und wie wir arbeiten',
    description:
      'ImmoPrüf hilft privaten Käufern, Immobilienangebote vor dem Kauf strukturiert einzuordnen. Erfahren Sie, wie unsere Analysen entstehen und wie wir unsere Ratgeber prüfen.',
    canonical: 'https://immopruef.de/ueber-uns',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: 'Über ImmoPrüf',
        url: 'https://immopruef.de/ueber-uns',
        inLanguage: 'de-DE',
        mainEntity: {
          '@type': 'Organization',
          name: 'ImmoPrüf',
          url: 'https://immopruef.de',
          logo: 'https://immopruef.de/logo.png',
          foundingDate: '2026',
          founder: { '@type': 'Person', name: 'Seydhan Cakmak' },
          legalName: 'Neuralpfad UG (haftungsbeschränkt)',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Auf dem Paß 10',
            postalCode: '27711',
            addressLocality: 'Osterholz-Scharmbeck',
            addressCountry: 'DE',
          },
          email: 'info@immopruef.com',
          areaServed: 'DE',
        },
      },
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Über uns', url: 'https://immopruef.de/ueber-uns' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Über ImmoPrüf
        </h1>
        <p className="text-ink-mid text-base leading-relaxed">
          Wir helfen privaten Käuferinnen und Käufern, ein Immobilienangebot vor Besichtigung und Kauf strukturiert
          einzuordnen — sachlich, nachvollziehbar und ohne Verkaufsprosa.
        </p>
      </header>

      <div className="space-y-8 text-sm text-ink-mid leading-relaxed">
        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">Warum es ImmoPrüf gibt</h2>
          <p>
            Ein Immobilienkauf ist für die meisten Menschen die größte Einzelentscheidung ihres Lebens — getroffen wird
            sie aber oft unter Zeitdruck und mit unvollständigen Informationen. Exposés sind auf Verkauf optimiert,
            wichtige Prüfpunkte stehen im Kleingedruckten oder fehlen ganz. ImmoPrüf bündelt die entscheidenden Fragen an
            einer Stelle: Ist der Preis plausibel? Welche Kosten kommen wirklich auf mich zu? Welche Risiken sollte ich
            vor der Besichtigung klären?
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">Wie unsere Analysen entstehen</h2>
          <p className="mb-3">
            Aus dem Link zu einem Exposé erstellen wir eine strukturierte Ersteinschätzung. Dabei legen wir Wert auf
            Ehrlichkeit statt Schein-Genauigkeit:
          </p>
          <ul className="space-y-2 list-none">
            {[
              ['Transparente Datenherkunft', 'Angaben aus dem Exposé werden klar von recherchierten Marktwerten und von Schätzungen getrennt. Werte, die nicht im Angebot stehen, kennzeichnen wir ausdrücklich als Schätzwert.'],
              ['Nachvollziehbare Berechnungen', 'Kaufnebenkosten, Finanzierungsszenarien und Kennzahlen werden nach festen Regeln berechnet — nicht geraten.'],
              ['Klare Grenzen', 'Eine ImmoPrüf-Analyse ist eine Ersteinschätzung zur Orientierung. Sie ersetzt kein Verkehrswertgutachten und keine Rechts-, Steuer- oder Finanzberatung.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-2.5">
                <span className="text-green mt-0.5 shrink-0">✓</span>
                <span><strong className="text-ink">{t}.</strong> {d}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">Unsere Ratgeber: recherchiert und faktengeprüft</h2>
          <p>
            Unsere Ratgeber-Artikel beantworten konkrete Fragen rund um den Immobilienkauf — von der Grunderwerbsteuer
            über die Finanzierung bis zu Vertrag und Übergabe. Jeder Artikel wird vor der Veröffentlichung einer
            Faktenprüfung unterzogen: zentrale Zahlen, Förderprogramme und Gesetzesbezüge gleichen wir mit aktuellen,
            öffentlich zugänglichen Quellen ab. Stellt sich heraus, dass sich eine Rechtslage ändert, kennzeichnen wir
            den Stand entsprechend. Unser Ziel ist, dass Sie sich auf die Angaben verlassen können.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">Wer dahintersteht</h2>
          <p>
            ImmoPrüf ist ein Angebot der <strong className="text-ink">Neuralpfad UG (haftungsbeschränkt)</strong> mit Sitz
            in 27711 Osterholz-Scharmbeck, vertreten durch den Geschäftsführer Seydhan Cakmak. Wir sind ein kleines,
            unabhängiges Team — wir verkaufen keine Immobilien und erhalten keine Provisionen von Maklern oder
            Verkäufern. Dadurch ist unsere Einschätzung allein dem Käufer verpflichtet.
          </p>
          <p className="mt-2 text-[12px] text-ink-light">
            Die vollständigen rechtlichen Angaben finden Sie im{' '}
            <a href="/impressum" className="text-green hover:text-green-mid underline">Impressum</a>; wie wir mit Ihren
            Daten umgehen, steht in der{' '}
            <a href="/datenschutz" className="text-green hover:text-green-mid underline">Datenschutzerklärung</a>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">Kontakt</h2>
          <p>
            Fragen, Anregungen oder ein Problem mit einer Analyse? Schreiben Sie uns an{' '}
            <a href="mailto:info@immopruef.com" className="text-green hover:text-green-mid underline">info@immopruef.com</a>.
          </p>
        </section>
      </div>

      <div className="mt-10 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Bereit für die nächste Immobilie?</h2>
        <p className="text-cream/70 text-sm mb-4">
          Fügen Sie den Exposé-Link ein und erhalten Sie in wenigen Minuten eine strukturierte Ersteinschätzung.
        </p>
        <a
          href="/"
          className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors"
        >
          Analyse starten
        </a>
      </div>
    </div>
  )
}
