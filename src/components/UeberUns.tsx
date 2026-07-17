import { useState } from 'react'
import { useSEO, breadcrumbSchema } from '../lib/useSEO'

export default function UeberUns() {
  const [photoOk, setPhotoOk] = useState(true)
  const [ahmadPhotoOk, setAhmadPhotoOk] = useState(true)

  useSEO({
    title: 'Über ImmoPrüf: Wer wir sind und wie wir arbeiten',
    description:
      'ImmoPrüf hilft privaten Käufern, Immobilienangebote vor dem Kauf strukturiert einzuordnen. Wie unsere Analysen entstehen und wie wir Ratgeber prüfen.',
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
          email: 'info@immopruef.de',
          areaServed: 'DE',
        },
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Seydhan Cakmak',
        jobTitle: 'Gründer & Geschäftsführer',
        worksFor: { '@type': 'Organization', name: 'ImmoPrüf', url: 'https://immopruef.de' },
        url: 'https://immopruef.de/ueber-uns',
        image: 'https://immopruef.de/team/seydhan-cakmak.jpg',
        description: 'Gründer von ImmoPrüf, Wirtschaftsinformatiker und Immobilien-Enthusiast.',
        knowsAbout: ['Immobilienkauf', 'Immobilienanalyse', 'Immobilienfinanzierung', 'Wirtschaftsinformatik'],
        sameAs: ['https://www.linkedin.com/in/seydhan-cakmak'],
      },
      {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Ahmad El Chouli',
        jobTitle: 'Projektingenieur für Energiemanagement',
        worksFor: { '@type': 'Organization', name: 'Lixcon GmbH & Co. KG' },
        alumniOf: { '@type': 'CollegeOrUniversity', name: 'Hochschule Bremerhaven' },
        url: 'https://immopruef.de/ueber-uns',
        image: 'https://immopruef.de/team/ahmad-el-chouli.jpg',
        description: 'Projektingenieur für Energiemanagement und fachlicher Berater von ImmoPrüf für Energie- und Gebäudethemen.',
        knowsAbout: ['Energiemanagement', 'Energieeffizienz', 'Gebäudeenergie', 'Heiztechnik', 'Energieausweis'],
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

          <div className="bg-white border border-ink/10 rounded-xl p-5 mb-4 flex items-start gap-4 sm:gap-5">
            <div className="shrink-0 w-20 h-20 rounded-full overflow-hidden bg-green/10 text-green flex items-center justify-center font-display text-2xl font-semibold">
              {photoOk ? (
                <img
                  src="/team/seydhan-cakmak.jpg"
                  alt="Seydhan Cakmak, Gründer von ImmoPrüf"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover"
                  loading="eager"
                  decoding="async"
                  onError={() => setPhotoOk(false)}
                />
              ) : (
                <span aria-hidden="true">SC</span>
              )}
            </div>
            <div>
              <div className="font-semibold text-ink">Seydhan Cakmak</div>
              <div className="text-[12px] text-ink-light mb-1.5">Gründer &amp; Geschäftsführer · verantwortlich für die Inhalte</div>
              <p className="text-[13px] text-ink-mid leading-relaxed">
                Seydhan hat Wirtschaftsinformatik studiert und verbindet einen daten- und technikgetriebenen Blick mit
                einer großen Leidenschaft für Immobilien. Aus dieser Kombination ist ImmoPrüf entstanden — mit dem Ziel,
                Kaufinteressenten dieselbe strukturierte, datenbasierte Einordnung an die Hand zu geben, die sonst Profis
                vorbehalten ist.
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                <a href="mailto:info@immopruef.de" className="text-green hover:text-green-mid underline text-[12px]">info@immopruef.de</a>
                <a href="https://www.linkedin.com/in/seydhan-cakmak" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline text-[12px]">LinkedIn-Profil</a>
              </div>
            </div>
          </div>

          <div className="bg-white border border-ink/10 rounded-xl p-5 mb-4 flex items-start gap-4 sm:gap-5">
            <div className="shrink-0 w-20 h-20 rounded-full overflow-hidden bg-green/10 text-green flex items-center justify-center font-display text-2xl font-semibold">
              {ahmadPhotoOk ? (
                <img
                  src="/team/ahmad-el-chouli.jpg"
                  alt="Ahmad El Chouli, fachlicher Berater Energie bei ImmoPrüf"
                  width={80}
                  height={80}
                  className="w-20 h-20 object-cover"
                  loading="eager"
                  decoding="async"
                  onError={() => setAhmadPhotoOk(false)}
                />
              ) : (
                <span aria-hidden="true">AE</span>
              )}
            </div>
            <div>
              <div className="font-semibold text-ink">Ahmad El Chouli</div>
              <div className="text-[12px] text-ink-light mb-1.5">Fachlicher Berater · Energie &amp; Gebäudetechnik</div>
              <p className="text-[13px] text-ink-mid leading-relaxed">
                Ahmad ist Projektingenieur für Energiemanagement (Lixcon GmbH &amp; Co. KG) und Absolvent der Hochschule
                Bremerhaven. Als fachlicher Berater bringt er die energetische Perspektive in ImmoPrüf ein — von
                Energieausweis über Heizung bis zu Sanierung und Förderung.
              </p>
            </div>
          </div>

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
            <a href="mailto:info@immopruef.de" className="text-green hover:text-green-mid underline">info@immopruef.de</a>.
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
