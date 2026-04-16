import { useSEO } from '../../lib/useSEO'

export default function Barrierefreiheit() {
  useSEO({
    title: 'Erklärung zur Barrierefreiheit',
    description: 'Erklärung zur Barrierefreiheit von ImmoPrüf — unsere Selbstverpflichtung, aktueller Stand und Feedback-Möglichkeiten.',
    canonical: 'https://immopruef.de/barrierefreiheit',
    type: 'website',
  })
  return (
    <div className="max-w-[680px] mx-auto">
      <h1 className="text-2xl font-heading font-bold text-ink mb-8">Erklärung zur Barrierefreiheit</h1>

      <div className="space-y-6 text-sm text-ink-mid leading-relaxed">

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">1. Geltungsbereich</h2>
          <p>
            Diese Erklärung gilt für die Website{' '}
            <a href="https://immopruef.de" className="text-green hover:text-green-mid">immopruef.de</a>
            {' '}einschließlich aller Unterseiten, Analyse-Permalinks und Blog-Inhalte. Anbieter
            ist die Neuralpfad UG (haftungsbeschränkt) — vollständige Angaben siehe{' '}
            <a href="/impressum" className="text-green hover:text-green-mid">Impressum</a>.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">2. Rechtliche Einordnung</h2>
          <p>
            Das Barrierefreiheitsstärkungsgesetz (BFSG) ist am 28. Juni 2025 in Kraft getreten
            und setzt die EU-Richtlinie 2019/882 in deutsches Recht um. Es verpflichtet
            bestimmte Anbieter digitaler Produkte und Dienstleistungen zu barrierefreier
            Gestaltung.
          </p>
          <p className="mt-2">
            <strong>Kleinstunternehmen-Ausnahme:</strong> Nach § 3 Abs. 3 BFSG gelten die
            Anforderungen an Dienstleistungen nicht für Kleinstunternehmen im Sinne der
            Empfehlung 2003/361/EG der Europäischen Kommission (weniger als 10 Beschäftigte
            und Jahresumsatz oder Jahresbilanzsumme bis 2 Mio. Euro). Die Neuralpfad UG
            (haftungsbeschränkt) erfüllt diese Voraussetzungen und ist damit von den
            materiellen BFSG-Pflichten ausgenommen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">3. Freiwillige Selbstverpflichtung</h2>
          <p>
            Unabhängig von der gesetzlichen Ausnahme verstehen wir Barrierefreiheit als
            Qualitätsmerkmal unseres Angebots und bemühen uns, ImmoPrüf so zugänglich wie
            möglich zu gestalten. Grundlage unserer Bemühungen sind die Web Content
            Accessibility Guidelines (WCAG) 2.1, Konformitätsstufe AA.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">4. Aktueller Stand der Barrierefreiheit</h2>
          <p>Bereits umgesetzt:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Semantisches HTML mit klarer Dokumentstruktur (Überschriften-Hierarchie,
              <code className="text-[12px] bg-ink/5 px-1 rounded mx-0.5">main</code>,
              <code className="text-[12px] bg-ink/5 px-1 rounded mx-0.5">nav</code>,
              <code className="text-[12px] bg-ink/5 px-1 rounded mx-0.5">footer</code>)</li>
            <li>Responsive Design für Desktop, Tablet und Smartphone</li>
            <li>Tastatur-Navigation für alle interaktiven Elemente (Tab, Enter, Escape)</li>
            <li>Sichtbare Fokus-Indikatoren für Tastatur-Nutzer</li>
            <li>Verzicht auf ausschließlich farbliche Informationsvermittlung</li>
            <li>Formularfelder mit beschreibenden Labels und Fehler-Hinweisen</li>
            <li>Textgröße relativ skalierbar (rem-basiert)</li>
            <li>Keine automatisch abspielenden Medien</li>
            <li>Konsistente Navigation über alle Seiten</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">5. Bekannte Einschränkungen</h2>
          <p>
            Wir möchten transparent über derzeit bestehende Einschränkungen informieren:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Die Anwendung setzt für die volle Funktionalität aktiviertes JavaScript
              voraus. Ohne JavaScript sind Analyse-Funktionen nicht nutzbar.</li>
            <li>Eine vollständige Prüfung mit Screenreader-Technologien (NVDA, VoiceOver,
              TalkBack) steht noch aus. Einzelne Elemente sind möglicherweise nicht
              optimal ausgezeichnet.</li>
            <li>Skip-Links zur schnellen Navigation zum Hauptinhalt sind bislang nicht
              implementiert.</li>
            <li>Einige dekorative Icons verwenden noch keine expliziten
              <code className="text-[12px] bg-ink/5 px-1 rounded mx-0.5">aria-hidden</code>-Attribute.</li>
            <li>Die Farbkontraste wurden für die Hauptinhalte geprüft, aber noch nicht
              flächendeckend mit automatischen Tools validiert.</li>
          </ul>
          <p className="mt-2">
            Wir arbeiten kontinuierlich an der Behebung dieser Einschränkungen.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">6. Feedback und Kontakt</h2>
          <p>
            Sind Ihnen Barrieren bei der Nutzung unserer Website aufgefallen oder benötigen
            Sie Inhalte in einem barrierefreien Format? Dann kontaktieren Sie uns — wir sind
            für jedes Feedback dankbar und bemühen uns um eine zeitnahe Lösung.
          </p>
          <p className="mt-2">
            <strong>Ansprechpartner:</strong><br />
            Neuralpfad UG (haftungsbeschränkt)<br />
            Seydhan Cakmak<br />
            E-Mail: <a href="mailto:info@immopruef.com?subject=Barrierefreiheit" className="text-green hover:text-green-mid transition-colors">info@immopruef.com</a>
          </p>
          <p className="mt-2">
            Wir bemühen uns, auf Ihr Feedback innerhalb von <strong>6 Wochen</strong> zu
            antworten.
          </p>
        </section>

        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">7. Schlichtungsverfahren</h2>
          <p>
            Da die Neuralpfad UG (haftungsbeschränkt) als Kleinstunternehmen nicht unter die
            materiellen Pflichten des BFSG fällt, ist ein formelles Schlichtungsverfahren
            nach § 16 BFSG nicht vorgesehen. Wir werden Beschwerden dennoch ernst nehmen und
            prüfen. Darüber hinaus verweisen wir auf die Möglichkeit, sich bei der
            zuständigen Marktüberwachungsbehörde zu beschweren.
          </p>
        </section>

        <p className="text-xs text-ink-light pt-4 border-t border-ink/10">
          Stand: April 2026 · Diese Erklärung wird regelmäßig überprüft und aktualisiert.
        </p>
      </div>
    </div>
  )
}
