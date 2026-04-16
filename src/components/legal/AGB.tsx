import { useSEO } from '../../lib/useSEO'

export default function AGB() {
  useSEO({
    title: 'AGB — Allgemeine Geschäftsbedingungen',
    description: 'Allgemeine Geschäftsbedingungen für die Nutzung von ImmoPrüf — Vertragsbedingungen, Widerrufsrecht und Haftung.',
    canonical: 'https://immopruef.de/agb',
    type: 'website',
  })
  return (
    <div className="max-w-[680px] mx-auto">
      <h1 className="text-2xl font-heading font-bold text-ink mb-8">Allgemeine Geschäftsbedingungen</h1>

      <div className="space-y-6 text-sm text-ink-mid leading-relaxed">

        {/* §1 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 1 Geltungsbereich</h2>
          <p>
            (1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen
            Seydhan Cakmak, [Adresse] (nachfolgend "Anbieter") und dem Kunden über die
            Nutzung der auf immopruef.de angebotenen Dienstleistungen.
          </p>
          <p className="mt-2">
            (2) Abweichende Bedingungen des Kunden werden nicht anerkannt, es sei denn,
            der Anbieter stimmt ihrer Geltung ausdrücklich schriftlich zu.
          </p>
        </section>

        {/* §2 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 2 Leistungsbeschreibung</h2>
          <p>
            (1) Der Anbieter bietet KI-gestützte Immobilienanalysen an. Der Kunde gibt eine oder
            mehrere URLs zu Immobilieninseraten ein und erhält nach Bezahlung eine automatisierte
            Analyse der Immobilie(n).
          </p>
          <p className="mt-2">
            (2) Die Analyse umfasst je nach gewähltem Paket:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li><strong>Quick-Check (1/2/3 Immobilien):</strong> Preisbewertung, Gesamtkosten-Rechner, Energie-Analyse, Modernisierungs-Check, Standortanalyse, Risikobewertung, Finanzierungs-Check, Verhandlungstipps, Makleranschreiben</li>
            <li><strong>Kaufentscheidungs-Report (Premium):</strong> Alle Quick-Check-Inhalte plus professionelle Wertermittlung, Standort-Dossier, 30-Jahres-Vermögensvergleich, Vor-Kauf-Checkliste und steuerliche Analyse</li>
          </ul>
          <p className="mt-2">
            (3) Die Analyse basiert auf öffentlich verfügbaren Daten und KI-gestützter Auswertung.
            Sie stellt <strong>keine</strong> Rechts-, Steuer- oder Finanzberatung dar und ersetzt
            <strong> nicht</strong> die Beauftragung eines Sachverständigen oder Gutachters.
          </p>
          <p className="mt-2">
            (4) Der Anbieter übernimmt keine Gewähr für die Vollständigkeit, Richtigkeit und
            Aktualität der in der Analyse enthaltenen Informationen.
          </p>
        </section>

        {/* §3 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 3 Vertragsschluss</h2>
          <p>
            (1) Die Darstellung der Leistungen auf der Website stellt kein bindendes Angebot dar.
          </p>
          <p className="mt-2">
            (2) Der Kunde gibt durch Klick auf den Bestell-Button und Abschluss der Zahlung
            ein verbindliches Angebot ab. Der Vertrag kommt mit Bestätigung der Zahlung zustande.
          </p>
        </section>

        {/* §4 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 4 Preise und Zahlung</h2>
          <p>
            (1) Es gelten die zum Zeitpunkt der Bestellung angegebenen Preise.
            Alle Preise sind Endpreise. Gemäß § 19 UStG wird keine Umsatzsteuer ausgewiesen
            (Kleinunternehmerregelung).
          </p>
          <p className="mt-2">
            (2) Die Zahlung erfolgt über den Zahlungsdienstleister Stripe. Es stehen die
            dort angebotenen Zahlungsmethoden zur Verfügung (z.B. Kreditkarte, Klarna, Apple Pay).
          </p>
          <p className="mt-2">
            (3) Der Zugang zur Analyse wird nach erfolgreicher Zahlung automatisch freigeschaltet.
          </p>
        </section>

        {/* §5 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 5 Widerrufsrecht</h2>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-3">
            <p className="font-semibold text-ink text-sm mb-2">Widerrufsbelehrung</p>
            <p>
              <strong>Widerrufsrecht:</strong> Sie haben das Recht, binnen 14 Tagen ohne Angabe
              von Gründen diesen Vertrag zu widerrufen. Die Widerrufsfrist beträgt 14 Tage ab
              dem Tag des Vertragsschlusses.
            </p>
            <p className="mt-2">
              Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (Seydhan Cakmak, E-Mail:
              info@immopruef.com) mittels einer eindeutigen Erklärung (z.B. per E-Mail)
              über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
            </p>
            <p className="mt-2">
              Zur Wahrung der Widerrufsfrist reicht es aus, dass Sie die Mitteilung über die
              Ausübung des Widerrufsrechts vor Ablauf der Widerrufsfrist absenden.
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="font-semibold text-ink text-sm mb-2">Folgen des Widerrufs</p>
            <p>
              Wenn Sie diesen Vertrag widerrufen, haben wir Ihnen alle Zahlungen, die wir von
              Ihnen erhalten haben, unverzüglich und spätestens binnen 14 Tagen ab dem Tag
              zurückzuzahlen, an dem die Mitteilung über Ihren Widerruf bei uns eingegangen ist.
              Für diese Rückzahlung verwenden wir dasselbe Zahlungsmittel, das Sie bei der
              ursprünglichen Transaktion eingesetzt haben.
            </p>
          </div>

          <p className="mt-3">
            <strong>Vorzeitiges Erlöschen des Widerrufsrechts:</strong> Das Widerrufsrecht
            erlischt bei einem Vertrag über die Lieferung von digitalen Inhalten, die nicht auf
            einem körperlichen Datenträger geliefert werden, wenn der Unternehmer mit der
            Ausführung des Vertrags begonnen hat, nachdem der Verbraucher ausdrücklich zugestimmt
            hat, dass der Unternehmer mit der Ausführung des Vertrags vor Ablauf der Widerrufsfrist
            beginnt, und der Verbraucher seine Kenntnis davon bestätigt hat, dass er durch seine
            Zustimmung mit Beginn der Ausführung des Vertrags sein Widerrufsrecht verliert
            (§ 356 Abs. 5 BGB).
          </p>

          <p className="mt-2">
            <strong>Hinweis:</strong> Mit dem Klick auf "Kostenpflichtig bestellen" und der
            Durchführung der Zahlung stimmen Sie zu, dass die Analyse sofort erstellt wird.
            Sie bestätigen, dass Sie damit Ihr Widerrufsrecht verlieren, sobald die Analyse
            vollständig erstellt und übermittelt wurde.
          </p>
        </section>

        {/* §6 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 6 Verfügbarkeit und Haftung</h2>
          <p>
            (1) Der Anbieter bemüht sich um eine hohe Verfügbarkeit der Dienstleistung,
            übernimmt jedoch keine Garantie für eine ununterbrochene Verfügbarkeit.
          </p>
          <p className="mt-2">
            (2) Sollte eine Analyse aufgrund technischer Probleme nicht erstellt werden können,
            wird dem Kunden die Möglichkeit gegeben, die Analyse kostenlos erneut zu starten.
            Sollte auch dies nicht möglich sein, wird der Kaufpreis erstattet.
          </p>
          <p className="mt-2">
            (3) Die Haftung des Anbieters ist auf Vorsatz und grobe Fahrlässigkeit beschränkt.
            Dies gilt nicht für Schäden aus der Verletzung des Lebens, des Körpers oder der
            Gesundheit.
          </p>
          <p className="mt-2">
            (4) Der Anbieter haftet insbesondere nicht für Kaufentscheidungen, die auf Grundlage
            der Analyse getroffen werden. Die Analyse dient ausschließlich als Informationsgrundlage.
          </p>
        </section>

        {/* §7 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 7 Analyse-Links und Gültigkeit</h2>
          <p>
            (1) Nach Erstellung der Analyse erhält der Kunde einen persönlichen Link per E-Mail.
          </p>
          <p className="mt-2">
            (2) Der Link zur Analyse ist ab Erstellung 180 Tage gültig. Nach Ablauf dieser Frist
            werden die Analyse-Daten automatisch gelöscht.
          </p>
          <p className="mt-2">
            (3) Der Kunde ist selbst dafür verantwortlich, die Analyse-Ergebnisse innerhalb der
            Gültigkeitsdauer zu sichern.
          </p>
        </section>

        {/* §8 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 8 Datenschutz</h2>
          <p>
            Die Verarbeitung personenbezogener Daten erfolgt gemäß unserer{' '}
            <a href="/datenschutz" className="text-green hover:text-green-mid">Datenschutzerklärung</a>.
          </p>
        </section>

        {/* §9 */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">§ 9 Schlussbestimmungen</h2>
          <p>
            (1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
            UN-Kaufrechts.
          </p>
          <p className="mt-2">
            (2) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit
            der übrigen Bestimmungen unberührt.
          </p>
        </section>

        <p className="text-xs text-ink-light pt-4 border-t border-ink/10">
          Stand: April 2026
        </p>
      </div>
    </div>
  )
}
