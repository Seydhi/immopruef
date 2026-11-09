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
            Seydhan Cakmak<br />
            Cakmak Digital · Einzelunternehmen<br />
            Auf dem Paß 10<br />
            27711 Osterholz-Scharmbeck<br />
            Deutschland
          </p>
        </section>


        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Kontakt</h2>
          <p>
            E-Mail: <a href="mailto:info@immopruef.de" className="text-green hover:text-green-mid transition-colors">info@immopruef.de</a>
          </p>
          <p className="mt-1 text-xs text-ink-light">
            Telefon: <a href="tel:+491748831396" className="text-green hover:text-green-mid transition-colors">+49 174 8831396</a>
          </p>
        </section>


        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">Umsatzsteuer-Identifikationsnummer</h2>
          <p>
            Umsatzsteuer-Identifikationsnummer gemäß § 27 a UStG:<br />
            DE462617089
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
            Die frühere EU-Plattform zur Online-Streitbeilegung (OS-Plattform) wurde zum 20. Juli 2025 eingestellt; eine Beschwerdeeinreichung über diese Plattform ist nicht mehr möglich.
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
          Stand: November 2026
        </p>
      </div>
    </div>
  )
}
