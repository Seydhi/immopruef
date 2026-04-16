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
            Seydhan Cakmak<br />
            [Straße + Hausnummer]<br />
            [PLZ + Stadt]<br />
            E-Mail: <a href="mailto:info@immopruef.com" className="text-green hover:text-green-mid">info@immopruef.com</a>
          </p>
        </section>

        {/* 2. Überblick */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">2. Überblick der Verarbeitungen</h2>
          <p>
            Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung unserer
            Dienstleistung (KI-gestützte Immobilienanalyse) erforderlich ist. Die Verarbeitung
            erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung) und
            Art. 6 Abs. 1 lit. f DSGVO (berechtigte Interessen).
          </p>
        </section>

        {/* 3. Erhobene Daten */}
        <section>
          <h2 className="text-base font-heading font-semibold text-ink mb-2">3. Welche Daten wir erheben</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>E-Mail-Adresse</strong> — zur Zustellung Ihrer Analyse-Ergebnisse</li>
            <li><strong>Immobilien-URLs</strong> — die Sie zur Analyse eingeben</li>
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
            Datenschutzrichtlinie:{' '}
            <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid">
              vercel.com/legal/privacy-policy
            </a>
          </p>

          <h3 className="font-semibold text-ink mt-3 mb-1">Supabase (Datenbank und Backend)</h3>
          <p>
            Analyse-Ergebnisse und Bestelldaten werden bei Supabase Inc., 970 Toa Payoh North #07-04,
            Singapore 318992 gespeichert. Die Datenbank befindet sich in der EU (Frankfurt).
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
            Zur Erstellung der Immobilienanalyse nutzen wir KI-Dienste (Anthropic Claude / OpenAI).
            Dabei werden die von Ihnen eingegebenen Immobilien-URLs an den jeweiligen Dienst übermittelt.
            Es werden keine personenbezogenen Daten (E-Mail, Name) an die KI-Dienste weitergegeben.
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
            an Resend übermittelt.
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

        <p className="text-xs text-ink-light pt-4 border-t border-ink/10">
          Stand: April 2026
        </p>
      </div>
    </div>
  )
}
