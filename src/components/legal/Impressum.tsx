import { useSEO } from '../../lib/useSEO'

export default function Impressum() {
  useSEO({
    title: 'Impressum',
    description: 'Impressum von ImmoPrüf — Anbieter, Kontaktdaten und rechtliche Angaben gemäß § 5 TMG.',
    canonical: 'https://immopruef.de/impressum',
    type: 'website',
  })
  return (
    <div className="max-w-[680px] mx-auto">
      <h1 className="text-2xl font-heading font-bold text-ink mb-8">Impressum</h1>

      <div className="space-y-6 text-sm text-ink-mid leading-relaxed">
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Angaben gemäß § 5 TMG</h2>
          <p>
            Seydhan Cakmak<br />
            {/* TODO: Adresse eintragen */}
            [Straße + Hausnummer]<br />
            [PLZ + Stadt]<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Kontakt</h2>
          <p>
            E-Mail: <a href="mailto:info@immopruef.com" className="text-green hover:text-green-mid transition-colors">info@immopruef.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Umsatzsteuer-ID</h2>
          <p>
            Gemäß §19 UStG wird keine Umsatzsteuer berechnet (Kleinunternehmerregelung).
          </p>
          <p className="mt-1">
            {/* TODO: Steuernummer eintragen wenn vorhanden */}
            Steuernummer: [wird nachgetragen]
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
          <p>
            Seydhan Cakmak<br />
            [Straße + Hausnummer]<br />
            [PLZ + Stadt]
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">EU-Streitschlichtung</h2>
          <p>
            Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
            <a
              href="https://ec.europa.eu/consumers/odr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green hover:text-green-mid transition-colors"
            >
              ec.europa.eu/consumers/odr
            </a>.
          </p>
          <p className="mt-2">
            Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer
            Verbraucherschlichtungsstelle teilzunehmen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Haftungsausschluss</h2>
          <p>
            Die auf dieser Website bereitgestellten Immobilienanalysen basieren auf öffentlich verfügbaren
            Daten und KI-gestützter Auswertung. Sie stellen keine Rechts-, Steuer- oder Finanzberatung dar
            und ersetzen nicht die Beauftragung eines Sachverständigen, Gutachters oder Rechtsanwalts.
          </p>
          <p className="mt-2">
            Trotz sorgfältiger Recherche übernehmen wir keine Gewähr für die Vollständigkeit,
            Richtigkeit und Aktualität der bereitgestellten Informationen.
          </p>
        </section>
      </div>
    </div>
  )
}
