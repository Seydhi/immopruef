import { useSEO, breadcrumbSchema } from '../lib/useSEO'

// KI-Transparenz (/ki-transparenz) — zentrale Offenlegung nach Art. 50 KI-VO
// (Verordnung (EU) 2024/1689), Transparenzpflichten anwendbar seit 2. August 2026.
// Grundsatz dieser Seite: nur benennen, was tatsächlich zutrifft. Inhalte als
// KI-generiert zu kennzeichnen, die es nicht sind (z. B. Stockfotos), wäre selbst
// eine Falschangabe.

export default function KiTransparenz() {
  useSEO({
    title: 'KI-Transparenz: Wo ImmoPrüf KI einsetzt',
    description:
      'Offenlegung nach Art. 50 KI-Verordnung: Welche Inhalte bei ImmoPrüf KI-generiert sind, welche nicht, wer redaktionell verantwortet und wo die Grenzen liegen.',
    canonical: 'https://immopruef.de/ki-transparenz',
    type: 'website',
    jsonLd: [
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'KI-Transparenz', url: 'https://immopruef.de/ki-transparenz' },
      ]),
    ],
  })

  return (
    <div className="max-w-[680px] mx-auto">
      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          KI-Transparenz bei ImmoPrüf
        </h1>
        <p className="text-ink-mid text-base leading-relaxed">
          ImmoPrüf ist ein KI-gestütztes Werkzeug — das steht im Zentrum unseres Angebots und wir
          verstecken es nicht. Diese Seite legt offen, <strong className="text-ink">wo genau</strong> Künstliche
          Intelligenz zum Einsatz kommt, <strong className="text-ink">wo nicht</strong>, wer die Inhalte
          verantwortet und welche Grenzen das hat.
        </p>
      </header>

      <div className="space-y-8 text-sm text-ink-mid leading-relaxed">
        {/* Auf einen Blick */}
        <section>
          <h2 className="font-display text-xl font-medium text-green mb-3">Auf einen Blick</h2>
          <div className="bg-white border border-ink/15 rounded-xl overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-[11px] text-ink-light text-left border-b border-ink/10">
                  <th className="font-medium py-2 px-3">Inhalt</th>
                  <th className="font-medium py-2 px-3">KI-generiert?</th>
                  <th className="font-medium py-2 px-3">Menschliche Kontrolle</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-ink/5">
                  <td className="py-2 px-3">Analyse-Texte (Bewertung, Einordnung, Hinweise)</td>
                  <td className="py-2 px-3 font-medium text-ink">Ja</td>
                  <td className="py-2 px-3">Regeln &amp; Prüfschritte im System, keine Einzelfreigabe</td>
                </tr>
                <tr className="border-b border-ink/5">
                  <td className="py-2 px-3">Zahlen in der Analyse (Nebenkosten, Raten, Szenarien)</td>
                  <td className="py-2 px-3 font-medium text-ink">Nein — im Code gerechnet</td>
                  <td className="py-2 px-3">Deterministische Formeln, nachrechenbar</td>
                </tr>
                <tr className="border-b border-ink/5">
                  <td className="py-2 px-3">Ratgeber-Artikel im Blog</td>
                  <td className="py-2 px-3 font-medium text-ink">KI-gestützt erstellt</td>
                  <td className="py-2 px-3">Redaktionell geprüft, verantwortet von Seydhan Cakmak</td>
                </tr>
                <tr className="border-b border-ink/5">
                  <td className="py-2 px-3">Bilder im Blog</td>
                  <td className="py-2 px-3 font-medium text-ink">Nein — Stockfotos</td>
                  <td className="py-2 px-3">Manuell ausgewählt (Pexels, echte Fotografen)</td>
                </tr>
                <tr>
                  <td className="py-2 px-3">Logo, Grafiken, Diagramme</td>
                  <td className="py-2 px-3 font-medium text-ink">Nein</td>
                  <td className="py-2 px-3">Grafikdesign bzw. aus Daten gezeichnet</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Analyse */}
        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">1. Die Analyse — unser Produkt</h2>
          <p className="mb-3">
            Wenn Sie eine Analyse bestellen, wertet ein KI-System (Sprachmodelle von Anthropic) das
            Exposé beziehungsweise Ihr hochgeladenes PDF aus und formuliert die Einordnung.{' '}
            <strong className="text-ink">Sie interagieren dabei mit einem KI-System, nicht mit einem Menschen.</strong>{' '}
            Jede Analyse ist automatisiert erstellt und wird nicht einzeln von einer Person freigegeben.
          </p>
          <p className="mb-3">Damit das trotzdem belastbar ist, trennen wir konsequent drei Ebenen:</p>
          <ul className="space-y-2 list-none">
            {[
              ['Angaben aus dem Exposé', 'werden übernommen und als solche behandelt — wir erfinden keine Objektdaten.'],
              ['Recherchierte Marktwerte', 'stammen aus einer Web-Recherche und werden mit Quelle ausgewiesen.'],
              ['Schätzwerte', 'sind sichtbar als „regionaler Schätzwert" gekennzeichnet, wenn ein Wert weder im Exposé steht noch belegbar recherchiert werden konnte.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-2.5">
                <span className="text-green mt-0.5 shrink-0" aria-hidden="true">✓</span>
                <span><strong className="text-ink">{t}</strong> {d}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            <strong className="text-ink">Alle Berechnungen laufen außerhalb der KI.</strong> Kaufnebenkosten,
            Grunderwerbsteuer, Annuitäten, Restschulden und Szenarien werden nach festen Formeln im
            Programmcode gerechnet — nicht vom Sprachmodell geschätzt. Das ist der Grund, warum die
            Zahlen reproduzierbar sind und Sie sie mit unseren{' '}
            <a href="/rechner" className="text-green hover:text-green-mid underline">kostenlosen Rechnern</a>{' '}
            selbst nachprüfen können.
          </p>
        </section>

        {/* Blog */}
        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">2. Die Ratgeber-Artikel</h2>
          <p className="mb-3">
            Unsere Ratgeber entstehen <strong className="text-ink">KI-gestützt</strong>: Recherche und
            Textentwurf werden von einem Sprachmodell unterstützt. Vor der Veröffentlichung durchläuft
            jeder Artikel eine <strong className="text-ink">redaktionelle Prüfung</strong> — zentrale Zahlen,
            Gesetzesbezüge und Förderangaben werden gegen öffentlich zugängliche Primärquellen
            abgeglichen (etwa Gesetzestexte auf gesetze-im-internet.de, KfW, BAFA, BORIS-Portale), und
            Aussagen werden auf Konsistenz mit den übrigen Artikeln geprüft.
          </p>
          <p className="mb-3">
            Die redaktionelle Verantwortung trägt namentlich{' '}
            <a href="/ueber-uns" className="text-green hover:text-green-mid underline">Seydhan Cakmak</a>{' '}
            (Neuralpfad UG). Fachlich geprüfte Energie-Themen kennzeichnen wir zusätzlich mit dem Namen
            des prüfenden Ingenieurs. Jeder Artikel trägt sichtbar den Hinweis „KI-gestützt erstellt ·
            redaktionell geprüft" sowie das Datum der letzten inhaltlichen Aktualisierung.
          </p>
          <p>
            Wir kennzeichnen das freiwillig und unabhängig davon, ob eine gesetzliche Pflicht im
            Einzelfall greift — aus unserer Sicht gehört diese Offenheit zu einem Angebot, das
            Kaufinteressenten zu belastbaren Entscheidungen verhelfen will.
          </p>
        </section>

        {/* Bilder */}
        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">3. Bilder — was Sie sehen</h2>
          <div className="bg-green/5 border border-green/15 rounded-xl px-4 py-3 mb-3">
            <p className="text-[13px] text-ink-mid">
              <strong className="text-green">Aktueller Stand:</strong> Auf immopruef.de wird derzeit{' '}
              <strong className="text-ink">kein einziges KI-generiertes Bild</strong> verwendet.
            </p>
          </div>
          <p className="mb-3">
            Die Bilder in unseren Ratgebern sind lizenzierte Stockfotos von echten Fotografinnen und
            Fotografen (Pexels), die wir manuell nach Themenbezug auswählen. Logo, Symbole und
            Diagramme sind Grafikdesign beziehungsweise werden aus den jeweiligen Daten gezeichnet.
            Die Fotos auf unserer Über-uns-Seite zeigen reale Personen.
          </p>
          <p>
            <strong className="text-ink">Unsere Regel für den Fall der Fälle:</strong> Sollten wir künftig
            ein KI-generiertes Bild einsetzen, wird es <strong className="text-ink">direkt im Bild sichtbar
            gekennzeichnet</strong> („KI-generiertes Bild"), zusätzlich im Alternativtext benannt und
            maschinenlesbar ausgezeichnet. Wir setzen keine KI-Bilder ein, die reale Objekte,
            Innenräume oder Personen darstellen könnten — bei einem Immobilien-Ratgeber wäre die
            Verwechslungsgefahr mit einem echten Objekt untragbar.
          </p>
        </section>

        {/* Grenzen */}
        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">4. Grenzen — was KI hier nicht kann</h2>
          <ul className="space-y-2 list-none">
            {[
              ['Niemand war vor Ort.', 'Feuchtigkeit hinter Möbeln, Gerüche, Rissbilder oder Pfusch erkennt nur ein Mensch bei der Besichtigung. Unsere Analyse ersetzt keinen Bausachverständigen — sie sagt Ihnen, wo dessen Einsatz sich lohnt.'],
              ['Keine Wertermittlung im Rechtssinn.', 'Eine Analyse ist kein Verkehrswertgutachten nach ImmoWertV. Für Erbauseinandersetzung, Scheidung oder Gericht brauchen Sie einen öffentlich bestellten Sachverständigen.'],
              ['Keine Rechts-, Steuer- oder Finanzberatung.', 'Wir ordnen allgemein verfügbare Informationen ein. Für verbindliche Auskünfte sind Notar, Steuerberater oder Rechtsanwalt zuständig.'],
              ['Fehler sind möglich.', 'Sprachmodelle können Angaben falsch zuordnen. Deshalb kennzeichnen wir Schätzwerte, verlinken Quellen und rechnen Zahlen im Code. Wenn Ihnen etwas falsch vorkommt, schreiben Sie uns — wir prüfen das.'],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-2.5">
                <span className="text-ink-light mt-0.5 shrink-0" aria-hidden="true">•</span>
                <span><strong className="text-ink">{t}</strong> {d}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Rechtlicher Rahmen */}
        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">5. Rechtlicher Rahmen</h2>
          <p className="mb-3">
            Diese Offenlegung orientiert sich an den Transparenzpflichten des Artikels 50 der{' '}
            <a
              href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=OJ:L_202401689"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green hover:text-green-mid underline"
            >
              KI-Verordnung (EU) 2024/1689
            </a>
            , die seit dem 2. August 2026 anwendbar sind. Kern der Regelung: Menschen sollen erkennen
            können, wann sie mit einem KI-System interagieren und wann Inhalte künstlich erzeugt wurden.
          </p>
          <p>
            Wir gehen hier bewusst weiter, als eine Pflicht im Einzelfall verlangen würde — insbesondere
            bei den Ratgeber-Artikeln, für die aufgrund der redaktionellen Prüfung mit benannter
            verantwortlicher Person eine Ausnahme in Betracht kommt. Diese Seite ist eine
            Selbstauskunft über unsere Arbeitsweise und keine Rechtsberatung.
          </p>
        </section>

        {/* Kontakt */}
        <section>
          <h2 className="font-display text-xl font-medium text-green mb-2">6. Fragen oder Korrekturhinweise?</h2>
          <p>
            Wenn Sie wissen möchten, wie eine bestimmte Angabe zustande gekommen ist, oder Ihnen ein
            Fehler auffällt: Schreiben Sie an{' '}
            <a href="mailto:info@immopruef.de" className="text-green hover:text-green-mid underline">
              info@immopruef.de
            </a>
            . Wir sagen Ihnen, ob ein Wert aus dem Exposé stammt, recherchiert oder geschätzt wurde —
            und korrigieren, was falsch ist.
          </p>
          <p className="mt-3 text-[12px] text-ink-light">
            Weitere Angaben: <a href="/ueber-uns" className="text-green hover:text-green-mid underline">Über uns</a>{' '}
            · <a href="/datenschutz" className="text-green hover:text-green-mid underline">Datenschutz</a>{' '}
            · <a href="/agb" className="text-green hover:text-green-mid underline">AGB</a>{' '}
            · <a href="/impressum" className="text-green hover:text-green-mid underline">Impressum</a>
          </p>
        </section>
      </div>

      <div className="mt-10 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Transparenz ist der Punkt</h2>
        <p className="text-cream/70 text-sm mb-4">
          Wir werden von Käufern bezahlt, nicht von Maklern. Deshalb sagen wir offen, was die Analyse
          kann — und was nicht.
        </p>
        <a
          href="/expose-pruefen-lassen"
          className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors"
        >
          Wie die Analyse funktioniert
        </a>
      </div>
    </div>
  )
}
