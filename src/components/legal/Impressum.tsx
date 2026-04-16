import { useSEO } from '../../lib/useSEO'

export default function Impressum() {
  useSEO({
    title: 'Impressum',
    description: 'Impressum von ImmoPrüf — Anbieter, Kontaktdaten und rechtliche Angaben gemäß § 5 DDG.',
    canonical: 'https://immopruef.de/impressum',
    type: 'website',
  })
  return (
    <div className="max-w-[680px] mx-auto">
      <h1 className="text-2xl font-heading font-bold text-ink mb-8">Impressum</h1>

      <div className="space-y-6 text-sm text-ink-mid leading-relaxed">
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Angaben gemäß § 5 DDG</h2>
          <p>
            Neuralpfad UG (haftungsbeschränkt)<br />
            Auf dem Paß 10<br />
            27711 Osterholz-Scharmbeck<br />
            Deutschland
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Vertreten durch</h2>
          <p>
            Geschäftsführer: Seydhan Cakmak
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Kontakt</h2>
          <p>
            E-Mail: <a href="mailto:info@immopruef.com" className="text-green hover:text-green-mid transition-colors">info@immopruef.com</a>
          </p>
          <p className="mt-1 text-xs text-ink-light">
            Telefonische Erreichbarkeit auf Anfrage per E-Mail.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Handelsregister</h2>
          <p>
            Eingetragen im Handelsregister.<br />
            Registergericht: [Amtsgericht wird nachgetragen]<br />
            Registernummer: [HRB-Nummer wird nachgetragen]
          </p>
          <p className="mt-1 text-xs text-ink-light">
            <em>Hinweis: Die HRB-Nummer und das zuständige Registergericht sind zeitnah zu ergänzen,
            sobald die Eintragung vorliegt bzw. bekannt ist.</em>
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Umsatzsteuer-Identifikationsnummer</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:<br />
            [USt-IdNr. wird nachgetragen, falls erteilt]
          </p>
          <p className="mt-2">
            Sofern keine USt-IdNr. vorliegt: Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen
            (Kleinunternehmerregelung).
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
          <p>
            Seydhan Cakmak<br />
            Auf dem Paß 10<br />
            27711 Osterholz-Scharmbeck
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
            Unsere E-Mail-Adresse finden Sie oben im Impressum.
          </p>
          <p className="mt-2">
            <strong>Verbraucherstreitbeilegung / Universalschlichtungsstelle:</strong>{' '}
            Wir sind nicht bereit und nicht verpflichtet, an einem Streitbeilegungsverfahren
            vor einer Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG).
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Berufshaftpflicht / Aufsichtsbehörde</h2>
          <p>
            Die Leistungen von ImmoPrüf (automatisierte Immobilien-Informationsauswertung)
            stellen keine erlaubnispflichtige Tätigkeit nach § 34c GewO, dem RDG oder dem StBerG
            dar und unterliegen keiner besonderen Aufsichtsbehörde.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Urheberrecht</h2>
          <p>
            Die durch uns erstellten Inhalte, Analyse-Reports, Texte und Grafiken unterliegen
            dem deutschen Urheberrecht. Vervielfältigung, Bearbeitung, Verbreitung und jede Art
            der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen
            Zustimmung des jeweiligen Autors bzw. Erstellers.
          </p>
          <p className="mt-2">
            Downloads und Kopien der von uns erstellten Analyse-Reports sind nur für den
            privaten, nicht kommerziellen Gebrauch des zahlenden Kunden gestattet.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Haftung für Inhalte</h2>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs.1 DDG für eigene Inhalte auf diesen
            Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir
            als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige
            Tätigkeit hinweisen.
          </p>
          <p className="mt-2">
            Die durch die KI-gestützte Analyse bereitgestellten Informationen stellen keine
            Rechts-, Steuer- oder Finanzberatung dar und ersetzen nicht die Beauftragung eines
            Sachverständigen, Gutachters oder Rechtsanwalts. Ausführliche Hinweise zur Haftung
            finden Sie in unseren{' '}
            <a href="/agb" className="text-green hover:text-green-mid">AGB</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Haftung für Links</h2>
          <p>
            Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir
            keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
            Anbieter oder Betreiber der Seiten verantwortlich. Eine permanente inhaltliche
            Kontrolle der verlinkten Seiten ist ohne konkrete Anhaltspunkte einer Rechtsverletzung
            nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Links
            umgehend entfernen.
          </p>
        </section>

        <p className="text-xs text-ink-light pt-4 border-t border-ink/10">
          Stand: April 2026
        </p>
      </div>
    </div>
  )
}
