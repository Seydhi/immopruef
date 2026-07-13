import { useSEO, faqSchema, breadcrumbSchema } from '../lib/useSEO'
import { pct } from '../lib/kaufnebenkosten'
import { BODEN, bodenForSlug, BORIS_D } from '../lib/bodenrichtwert'

export default function BodenrichtwertLand({ slug }: { slug: string }) {
  const b = bodenForSlug(slug)

  // Routing garantiert ein gültiges Bundesland; Fallback nur zur Sicherheit.
  if (!b) {
    return (
      <div className="max-w-[680px] mx-auto text-center py-16">
        <p className="text-ink-mid text-sm mb-4">Bundesland nicht gefunden.</p>
        <a href="/blog/bodenrichtwert-verstehen-abfragen" className="text-green text-sm font-medium">← Bodenrichtwert erklärt</a>
      </div>
    )
  }

  const { land, satz, portalName, portalUrl, note } = b
  const andere = BODEN.filter((x) => x.slug !== slug)

  useSEO({
    title: `Bodenrichtwert in ${land} abfragen 2026: kostenlos über BORIS`,
    description: `Bodenrichtwert in ${land} kostenlos online abfragen: über ${portalName} oder das bundesweite BORIS-D. So finden Sie den Bodenwert je m² für Ihre Adresse — plus was der Wert aussagt und wo seine Grenzen liegen.`,
    canonical: `https://immopruef.de/bodenrichtwert-${slug}`,
    type: 'website',
    jsonLd: [
      faqSchema([
        {
          question: `Wie frage ich den Bodenrichtwert in ${land} ab?`,
          answer: `Kostenlos online: In ${land} über ${portalName}${portalUrl ? '' : ' des zuständigen Gutachterausschusses'} oder über das bundesweite Portal BORIS-D. Sie geben Adresse oder Flurstück ein und lesen den Bodenrichtwert je Quadratmeter für die jeweilige Bodenrichtwertzone von der Karte ab. Eine Anmeldung ist in der Regel nicht nötig.`,
        },
        {
          question: 'Was ist der Bodenrichtwert und wer legt ihn fest?',
          answer: 'Der Bodenrichtwert ist der durchschnittliche Lagewert des Bodens je Quadratmeter innerhalb einer Bodenrichtwertzone. Ihn ermitteln die unabhängigen Gutachterausschüsse für Grundstückswerte aus der amtlichen Kaufpreissammlung — also aus tatsächlich beurkundeten Kaufpreisen (§ 196 BauGB). Fortgeschrieben wird er mindestens alle zwei Jahre, vielerorts jährlich zum Jahreswechsel.',
        },
        {
          question: 'Ist der Bodenrichtwert dasselbe wie der Grundstückswert?',
          answer: 'Nein. Der Bodenrichtwert ist ein Durchschnitts- und Orientierungswert für die Zone, nicht der Verkehrswert Ihres konkreten Grundstücks. Zuschnitt, Größe, Erschließung, Ausnutzbarkeit und Lage im Detail führen zu Zu- oder Abschlägen. Er eignet sich als Plausibilitätscheck des Bodenanteils, ersetzt aber kein Wertgutachten.',
        },
        {
          question: 'Kostet die Bodenrichtwert-Abfrage etwas?',
          answer: 'Die Online-Einsichtnahme über die BORIS-Portale ist kostenlos. Kosten fallen nur für amtliche Auskünfte oder Bescheinigungen an, etwa wenn Sie eine offizielle Bodenrichtwertauskunft für die Bank oder das Finanzamt schriftlich benötigen.',
        },
      ]),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Bodenrichtwert', url: 'https://immopruef.de/blog/bodenrichtwert-verstehen-abfragen' },
        { name: land, url: `https://immopruef.de/bodenrichtwert-${slug}` },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          Bodenrichtwert in {land} abfragen
        </h1>
        <p className="text-ink-mid text-sm leading-relaxed">
          Der Bodenrichtwert zeigt den durchschnittlichen Bodenwert je Quadratmeter für eine Lage — in {land} kostenlos
          online abrufbar. Hier erfahren Sie, wo Sie ihn abfragen, wie Sie vorgehen und was der Wert für Ihre
          Kaufentscheidung wirklich aussagt.
        </p>
      </header>

      {/* Portal-Karte */}
      <div className="bg-white border border-gold/40 rounded-xl p-5 shadow-sm">
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-2">
          Bodenrichtwert in {land} abrufen
        </div>
        {portalUrl ? (
          <p className="text-sm text-ink-mid leading-relaxed mb-3">
            Nutzen Sie das offizielle Landesportal{' '}
            <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline font-medium">
              {portalName}
            </a>{' '}
            des zuständigen Gutachterausschusses. Alternativ funktioniert das bundesweite Portal{' '}
            <a href={BORIS_D} target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline font-medium">
              BORIS-D
            </a>
            , das die Daten fast aller Länder bündelt.
          </p>
        ) : (
          <p className="text-sm text-ink-mid leading-relaxed mb-3">
            Am einfachsten über das bundesweite Portal{' '}
            <a href={BORIS_D} target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline font-medium">
              BORIS-D
            </a>
            , das die Bodenrichtwerte fast aller Länder bündelt — es deckt {portalName} des zuständigen
            Gutachterausschusses in {land} mit ab.
          </p>
        )}
        <div className="bg-green/5 rounded-lg px-4 py-3 text-[13px] text-ink-mid">
          <strong className="text-ink">Kostenlos &amp; ohne Anmeldung.</strong> Adresse oder Flurstück eingeben, Zone auf
          der Karte anklicken, Bodenrichtwert je m² ablesen.
        </div>
        {note && (
          <p className="text-[12px] text-ink-mid mt-3 leading-snug"><strong className="text-ink">Hinweis:</strong> {note}</p>
        )}
      </div>

      {/* Schritt-für-Schritt */}
      <h2 className="font-display text-xl font-medium text-green mt-8 mb-3">So fragen Sie den Bodenrichtwert in {land} ab</h2>
      <ol className="space-y-2.5 text-sm text-ink-mid leading-relaxed list-decimal pl-5">
        <li>Portal öffnen ({portalUrl ? `${portalName} oder BORIS-D` : 'BORIS-D'}) — kostenlos, keine Registrierung nötig.</li>
        <li>Adresse, Ort oder Flurstücksnummer des Grundstücks in {land} eingeben.</li>
        <li>In der Karte die passende Bodenrichtwertzone anklicken.</li>
        <li>Bodenrichtwert je m² sowie den Stichtag und die zugrunde gelegte Nutzung (z. B. Wohnbaufläche) ablesen.</li>
        <li>Bodenwert überschlagen: Grundstücksfläche in m² × Bodenrichtwert = ungefährer Bodenwert.</li>
      </ol>

      {/* Was er aussagt / Grenzen */}
      <div className="mt-6 bg-cream border border-ink/10 rounded-xl p-5">
        <h2 className="font-display text-base font-medium text-ink mb-2">Was der Bodenrichtwert aussagt — und was nicht</h2>
        <p className="text-sm text-ink-mid leading-relaxed">
          Der Bodenrichtwert ist ein <strong className="text-ink">Durchschnittswert je Zone</strong>, ermittelt von den
          Gutachterausschüssen aus tatsächlich beurkundeten Kaufpreisen. Er ist damit ein belastbarer Anker, um den
          Bodenanteil eines Angebots zu plausibilisieren — aber kein Verkehrswert Ihres konkreten Grundstücks. Zuschnitt,
          Größe, Ausnutzbarkeit und Erschließung führen zu Zu- oder Abschlägen. Für den Gebäudewert sagt er ohnehin
          nichts aus. Die Systematik erklärt der Ratgeber{' '}
          <a href="/blog/bodenrichtwert-verstehen-abfragen" className="text-green hover:text-green-mid underline">
            Bodenrichtwert verstehen und abfragen
          </a>
          .
        </p>
      </div>

      {/* GrESt-Kontext */}
      <div className="mt-6 text-sm text-ink-mid leading-relaxed">
        <p>
          Für die Gesamtkalkulation zählt neben dem Bodenwert vor allem die{' '}
          <strong className="text-ink">Grunderwerbsteuer in {land} ({pct(satz)})</strong>. Was beim Kauf in {land}{' '}
          insgesamt an Nebenkosten anfällt, zeigt die Seite{' '}
          <a href={`/kaufnebenkosten-${slug}`} className="text-green hover:text-green-mid underline">
            Kaufnebenkosten in {land}
          </a>
          . Ob der Quadratmeterpreis eines Angebots fair ist, ordnet der{' '}
          <a href="/blog/quadratmeterpreis-bewerten" className="text-green hover:text-green-mid underline">
            Quadratmeterpreis-Ratgeber
          </a>{' '}
          ein.
        </p>
      </div>

      {/* CTA */}
      <div className="mt-8 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Konkretes Grundstück oder Haus in {land}?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link oder PDF Preis, Lage und Risiken — und ordnet den aufgerufenen Preis mit
          regionalen Vergleichswerten ein, statt mit Bauchgefühl.
        </p>
        <a href="/" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Jetzt Analyse starten
        </a>
      </div>

      {/* Andere Länder */}
      <section className="mt-10 pt-6 border-t border-ink/10">
        <h2 className="font-display text-base font-medium text-ink mb-3">Bodenrichtwert in anderen Bundesländern</h2>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {andere.map((x) => (
            <a key={x.slug} href={`/bodenrichtwert-${x.slug}`} className="text-[13px] text-green hover:text-green-mid underline">
              {x.land}
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
