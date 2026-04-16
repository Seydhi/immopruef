import { useSEO } from '../../lib/useSEO'

export default function Datenschutz() {
  useSEO({
    title: 'Datenschutzerklärung',
    description: 'Datenschutzerklärung von ImmoPrüf — wie wir Ihre Daten verarbeiten, gemäß DSGVO und BDSG.',
    canonical: 'https://immopruef.de/datenschutz',
    type: 'website',
  })
  return (
    <div className="max-w-[680px] mx-auto">
      <h1 className="text-2xl font-heading font-bold text-ink mb-8">Datenschutzerklärung</h1>

      <div className="space-y-6 text-sm text-ink-mid leading-relaxed">

        {/* 1. Verantwortlicher */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">1. Verantwortlicher</h2>
          <p>
            Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) und
            anderer nationaler Datenschutzgesetze der Mitgliedstaaten sowie sonstiger
            datenschutzrechtlicher Bestimmungen ist:
          </p>
          <p className="mt-2">
            Neuralpfad UG (haftungsbeschränkt)<br />
            vertreten durch den Geschäftsführer Seydhan Cakmak<br />
            Auf dem Paß 10<br />
            27711 Osterholz-Scharmbeck<br />
            Deutschland<br />
            E-Mail: <a href="mailto:info@immopruef.com" className="text-green hover:text-green-mid">info@immopruef.com</a>
          </p>
          <p className="mt-3 text-xs text-ink-light">
            Ein Datenschutzbeauftragter ist nach § 38 BDSG aufgrund der Unternehmensgröße
            (weniger als 20 Personen, die ständig mit der automatisierten Verarbeitung
            personenbezogener Daten beschäftigt sind) nicht bestellt. Bei
            datenschutzrechtlichen Anfragen wenden Sie sich bitte direkt an den
            oben genannten Verantwortlichen.
          </p>
        </section>

        {/* 2. Überblick */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">2. Überblick der Verarbeitungen und Rechtsgrundlagen</h2>
          <p>
            Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung
            unserer Dienstleistung (KI-gestützte Immobilienanalyse) erforderlich ist. Die
            Verarbeitung erfolgt auf folgenden Rechtsgrundlagen:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-2">
            <li>
              <strong>Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung)</strong> — für die
              Durchführung des Analyse-Vertrags: Bestellabwicklung, Zahlungsabwicklung,
              Erstellung und Zustellung der Analyse, Bereitstellung des Analyse-Permalinks.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. c DSGVO (rechtliche Verpflichtung)</strong> —
              für die Aufbewahrung von Rechnungs- und Zahlungsdaten gemäß handels- und
              steuerrechtlicher Pflichten (§ 147 AO, § 257 HGB).
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen)</strong> — für
              technisch notwendige Server-Logs zur Sicherstellung der Funktionsfähigkeit
              und Sicherheit der Website.
            </li>
            <li>
              <strong>Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</strong> — für die
              Datenübermittlung in Drittländer (USA, siehe Abschnitt 12), sofern diese
              nicht bereits über die Vertragsdurchführung gedeckt ist.
            </li>
          </ul>
        </section>

        {/* 3. Erhobene Daten */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">3. Welche Daten wir erheben</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>E-Mail-Adresse</strong> — zur Zustellung Ihrer Analyse-Ergebnisse</li>
            <li>
              <strong>Immobilien-URLs und extrahierte Inhalte</strong> — die Sie zur
              Analyse eingeben. Diese URLs können Informationen enthalten, die einen
              Personenbezug herstellen (z.B. die Objektadresse oder Angaben zum
              Verkäufer). Wir verarbeiten diese Daten ausschließlich zur Erstellung
              der von Ihnen angefragten Analyse und speichern sie zusammen mit dem
              Analyse-Ergebnis.
            </li>
            <li><strong>Zahlungsdaten</strong> — werden ausschließlich von Stripe verarbeitet (siehe Punkt 5)</li>
            <li><strong>Technische Daten</strong> — IP-Adresse, Browser-Typ, Zeitpunkt des Zugriffs (Server-Logs)</li>
          </ul>
        </section>

        {/* 4. Hosting */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">4. Hosting und Infrastruktur</h2>

          <h3 className="font-semibold text-ink mt-3 mb-1">Vercel (Website-Hosting)</h3>
          <p>
            Unsere Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA gehostet.
            Vercel verarbeitet technische Zugriffsdaten (IP-Adresse, Browser-Typ) zur Auslieferung der Website.
            Die Verarbeitung erfolgt in unserem Auftrag auf Grundlage eines Auftragsverarbeitungs-
            vertrags nach Art. 28 DSGVO. Vercel Inc. ist unter dem EU-US Data Privacy Framework
            zertifiziert (vgl. Abschnitt 12 zum Drittlandtransfer).
          </p>
          <p className="mt-1">
            Datenschutzrichtlinie:{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid">
              vercel.com/legal/privacy-policy
            </a>
          </p>

          <h3 className="font-semibold text-ink mt-3 mb-1">Supabase (Datenbank und Backend)</h3>
          <p>
            Analyse-Ergebnisse und Bestelldaten werden bei Supabase Inc., 970 Toa Payoh North #07-04,
            Singapore 318992 gespeichert. Die Datenbank befindet sich in der EU (Frankfurt).
            Die Verarbeitung erfolgt in unserem Auftrag auf Grundlage eines Auftragsverarbeitungs-
            vertrags nach Art. 28 DSGVO. Soweit ein Zugriff durch Mitarbeiter der
            US-Muttergesellschaft erfolgen kann, stützt sich die Datenübermittlung auf das
            EU-US Data Privacy Framework bzw. EU-Standardvertragsklauseln (vgl. Abschnitt 12).
          </p>
          <p className="mt-1">
            Datenschutzrichtlinie:{' '}
            <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid">
              supabase.com/privacy
            </a>
          </p>
        </section>

        {/* 5. Stripe */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">5. Zahlungsabwicklung (Stripe)</h2>
          <p>
            Die Zahlungsabwicklung erfolgt über Stripe Payments Europe, Ltd., 1 Grand Canal Street Lower,
            Grand Canal Dock, Dublin, D02 H210, Irland. Bei der Bezahlung werden Ihre Zahlungsdaten
            (Kreditkartennummer, Ablaufdatum, CVC) direkt an Stripe übermittelt. Wir haben keinen
            Zugriff auf Ihre vollständigen Zahlungsdaten.
          </p>
          <p className="mt-2">
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung).
            Datenschutzrichtlinie:{' '}
            <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid">
              stripe.com/de/privacy
            </a>
          </p>
        </section>

        {/* 6. KI-Verarbeitung */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">6. KI-gestützte Analyse</h2>
          <p>
            Zur Erstellung der Immobilienanalyse nutzen wir KI-Dienste der Anthropic PBC,
            548 Market Street, PMB 90375, San Francisco, CA 94104, USA (Claude), sowie
            ggf. der OpenAI, L.L.C., 3180 18th Street, San Francisco, CA 94110, USA.
            Dabei werden die von Ihnen eingegebenen Immobilien-URLs und daraus extrahierte
            Inhalte an den jeweiligen Dienst übermittelt. Direkte Kundendaten (E-Mail, Name)
            werden nicht an die KI-Dienste weitergegeben.
          </p>
          <p className="mt-2">
            Die Verarbeitung erfolgt in unserem Auftrag auf Grundlage eines Auftragsverarbeitungs-
            vertrags nach Art. 28 DSGVO. Beide Anbieter sind unter dem EU-US Data Privacy
            Framework zertifiziert bzw. stützen sich auf EU-Standardvertragsklauseln
            (vgl. Abschnitt 12).
          </p>
          <p className="mt-2">
            Anthropic: <a href="https://www.anthropic.com/privacy" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid">anthropic.com/privacy</a><br />
            OpenAI: <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid">openai.com/policies/privacy-policy</a>
          </p>
        </section>

        {/* 7. E-Mail */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">7. E-Mail-Versand (Resend)</h2>
          <p>
            Für den Versand von Bestätigungs- und Ergebnis-E-Mails nutzen wir Resend Inc.,
            2261 Market Street #5039, San Francisco, CA 94114, USA. Dabei wird Ihre E-Mail-Adresse
            sowie der Inhalt der versendeten E-Mail an Resend übermittelt. Die Verarbeitung
            erfolgt in unserem Auftrag auf Grundlage eines Auftragsverarbeitungsvertrags
            nach Art. 28 DSGVO. Resend Inc. ist unter dem EU-US Data Privacy Framework
            zertifiziert (vgl. Abschnitt 12).
          </p>
          <p className="mt-1">
            Datenschutzrichtlinie:{' '}
            <a href="https://resend.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid">
              resend.com/legal/privacy-policy
            </a>
          </p>
        </section>

        {/* 8. Cookies */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">8. Cookies</h2>
          <p>
            Diese Website verwendet <strong>keine Tracking-Cookies</strong> und keine
            Analyse-Tools (kein Google Analytics, kein Facebook Pixel). Es werden nur technisch
            notwendige Cookies gesetzt, die für die Funktionalität der Website erforderlich sind
            (z.B. Stripe Checkout).
          </p>
        </section>

        {/* 9. Speicherdauer */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">9. Speicherdauer</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Analyse-Ergebnisse:</strong> 180 Tage nach Erstellung, danach automatische Löschung</li>
            <li><strong>E-Mail-Adressen:</strong> werden zusammen mit der Analyse gelöscht</li>
            <li><strong>Zahlungsdaten:</strong> gemäß handels- und steuerrechtlicher Aufbewahrungspflichten (10 Jahre bei Stripe)</li>
            <li><strong>Server-Logs:</strong> maximal 30 Tage</li>
          </ul>
        </section>

        {/* 10. Rechte */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">10. Ihre Rechte</h2>
          <p>Sie haben jederzeit das Recht auf:</p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Auskunft</strong> über Ihre gespeicherten Daten (Art. 15 DSGVO)</li>
            <li><strong>Berichtigung</strong> unrichtiger Daten (Art. 16 DSGVO)</li>
            <li><strong>Löschung</strong> Ihrer Daten (Art. 17 DSGVO)</li>
            <li><strong>Einschränkung</strong> der Verarbeitung (Art. 18 DSGVO)</li>
            <li><strong>Datenübertragbarkeit</strong> (Art. 20 DSGVO)</li>
            <li><strong>Widerspruch</strong> gegen die Verarbeitung (Art. 21 DSGVO)</li>
          </ul>
          <p className="mt-2">
            Zur Ausübung Ihrer Rechte kontaktieren Sie uns unter{' '}
            <a href="mailto:info@immopruef.com" className="text-green hover:text-green-mid">info@immopruef.com</a>.
          </p>
        </section>

        {/* 11. Beschwerderecht */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">11. Beschwerderecht</h2>
          <p>
            Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren.
            Zuständig ist die Aufsichtsbehörde des Bundeslandes, in dem Sie wohnen oder
            in dem der Verstoß stattgefunden hat.
          </p>
        </section>

        {/* 12. Drittlandtransfer */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">12. Datenübermittlung in Drittländer (USA)</h2>
          <p>
            Einige der von uns eingesetzten Dienstleister haben ihren Sitz in den USA.
            Damit können personenbezogene Daten in die USA übermittelt und dort verarbeitet
            werden. Betroffen sind insbesondere:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li><strong>Vercel Inc.</strong> (Website-Hosting, technische Zugriffsdaten)</li>
            <li><strong>Anthropic PBC / OpenAI L.L.C.</strong> (KI-gestützte Analyse der Immobilien-URLs)</li>
            <li><strong>Resend Inc.</strong> (E-Mail-Versand)</li>
            <li><strong>Supabase Inc.</strong> (mögliche Zugriffe durch US-Muttergesellschaft, Daten liegen in der EU)</li>
          </ul>
          <p className="mt-3">
            <strong>Rechtsgrundlage der Übermittlung:</strong> Die genannten Anbieter sind
            unter dem <a href="https://www.dataprivacyframework.gov/list" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid">EU-US Data Privacy Framework (DPF)</a>{' '}
            zertifiziert. Für diese Anbieter hat die EU-Kommission mit Durchführungsbeschluss
            vom 10. Juli 2023 ein angemessenes Datenschutzniveau festgestellt
            (Art. 45 DSGVO). Ergänzend oder alternativ werden EU-Standardvertragsklauseln
            (Art. 46 Abs. 2 lit. c DSGVO) verwendet.
          </p>
          <p className="mt-3">
            <strong>Hinweis auf Restrisiko:</strong> Trotz dieser Schutzmechanismen können
            US-Behörden unter bestimmten Voraussetzungen (z.B. FISA 702, CLOUD Act) Zugriff
            auf personenbezogene Daten erhalten. Ein mit der EU vergleichbares Rechtsschutzniveau
            kann in diesen Fällen nicht in jedem Einzelfall garantiert werden. Durch die
            Nutzung unserer Dienste willigen Sie — sofern eine Einwilligung erforderlich ist —
            gemäß Art. 49 Abs. 1 lit. a DSGVO in diesen Transfer ein. Sie können diese
            Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.
          </p>
        </section>

        {/* 13. Automatisierte Verarbeitung */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">13. Automatisierte Verarbeitung</h2>
          <p>
            Die von uns bereitgestellte Analyse wird automatisiert mittels KI-Modellen
            erstellt. Sie stellt eine automatisierte Auswertung öffentlich verfügbarer
            Daten dar und dient ausschließlich als Informationsgrundlage für Ihre eigene
            Kaufentscheidung.
          </p>
          <p className="mt-2">
            Eine automatisierte Entscheidung im Sinne des Art. 22 DSGVO, die Ihnen gegenüber
            rechtliche Wirkung entfaltet oder Sie in ähnlicher Weise erheblich beeinträchtigt,
            findet nicht statt — die Analyse ist eine von Ihnen aktiv bestellte
            Informationsleistung und trifft keine Entscheidung über oder gegen Sie.
          </p>
          <p className="mt-2">
            Die Logik der Analyse basiert auf:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-1">
            <li>Textanalyse des Inserats durch KI-Modelle (Claude / OpenAI)</li>
            <li>Preisvergleich mit Marktdaten</li>
            <li>Regelbasierter Auswertung von Energieausweis-, Modernisierungs- und Standortindikatoren</li>
          </ul>
          <p className="mt-2">
            Die Analyse ersetzt keine fachkundige Beratung oder Begutachtung durch einen
            Sachverständigen, Gutachter, Rechtsanwalt, Steuerberater oder Finanzberater.
          </p>
          <p className="mt-2">
            Bei Fragen oder Anmerkungen zu Ihrer Analyse wenden Sie sich gerne an{' '}
            <a href="mailto:info@immopruef.com" className="text-green hover:text-green-mid">info@immopruef.com</a>.
          </p>
        </section>

        {/* 14. SSL/TLS-Verschlüsselung */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">14. SSL/TLS-Verschlüsselung</h2>
          <p>
            Diese Website nutzt aus Sicherheitsgründen und zum Schutz der Übertragung
            vertraulicher Inhalte eine SSL/TLS-Verschlüsselung. Eine verschlüsselte
            Verbindung erkennen Sie daran, dass die Adresszeile des Browsers „https://"
            anzeigt und ein Schloss-Symbol sichtbar ist. Bei aktivierter Verschlüsselung
            können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.
          </p>
        </section>

        <p className="text-xs text-ink-light pt-4 border-t border-ink/10">
          Stand: April 2026
        </p>
      </div>
    </div>
  )
}
