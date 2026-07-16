import { useSEO, breadcrumbSchema } from '../lib/useSEO'
import { MOCK_ANALYSIS_RESULT } from '../lib/mock-data'
import { MOCK_PREMIUM_REPORT } from '../lib/mock-premium'
import AnalysisResult from './AnalysisResult'

// Beispiel-Analysen als eigene, indexierbare Seiten (statt nur Modal auf der
// Startseite): SEO-Chance („Immobilienanalyse Beispiel") + teilbare URL für
// zögernde Käufer. Inhalt = dieselben Mock-Daten wie die Landing-Vorschau,
// klar als Muster gekennzeichnet.

export default function BeispielAnalyse({ variant }: { variant: 'standard' | 'premium' }) {
  const isPremium = variant === 'premium'
  const result = isPremium
    ? { ...MOCK_ANALYSIS_RESULT, premiumReport: MOCK_PREMIUM_REPORT }
    : MOCK_ANALYSIS_RESULT

  const url = isPremium ? 'https://immopruef.de/beispiel-premium-report' : 'https://immopruef.de/beispiel-analyse'
  const name = isPremium ? 'Premium-Report' : 'Standard-Analyse'

  useSEO({
    title: isPremium
      ? 'Beispiel: Premium-Kaufentscheidungs-Report (Muster)'
      : 'Beispiel: Immobilien-Analyse ansehen (Muster)',
    description: isPremium
      ? 'Vollständiger Premium-Report als Muster: Wertermittlung nach 3 Verfahren, Marktband, Mietrendite, Maklerprofil und Stärken-Schwächen-Analyse — so sieht das 79-€-Ergebnis aus.'
      : 'Vollständige Beispiel-Analyse als Muster: Preisbewertung, Kaufnebenkosten, Standort-Score, Risiken und 3 Finanzierungs-Szenarien — so sieht das Ergebnis ab 19 € aus.',
    canonical: url,
    type: 'website',
    jsonLd: [
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: `Beispiel: ${name}`, url },
      ]),
    ],
  })

  return (
    <div>
      {/* Ehrlichkeits-Banner: Muster, keine echte Analyse */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 sm:px-5 py-3 mb-6 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-sm text-amber-900 min-w-0 flex-wrap">
          <span className="text-lg" aria-hidden="true">{isPremium ? '💎' : '📋'}</span>
          <span className="font-medium">Beispiel-{name}</span>
          <span className="bg-amber-200 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
            Muster · keine echte Analyse
          </span>
        </div>
        <a
          href="/"
          className="bg-green text-cream text-[13px] font-medium px-4 py-2 rounded-lg hover:bg-green-mid transition-colors whitespace-nowrap"
        >
          {isPremium ? 'Eigenen Report starten — 79 €' : 'Eigene Analyse starten — ab 19 €'}
        </a>
      </div>

      <p className="text-[13px] text-ink-mid leading-relaxed mb-6 max-w-[720px]">
        So sieht das Ergebnis einer ImmoPrüf-{name} aus — hier mit fiktiven Beispieldaten für ein
        Einfamilienhaus. Jede echte Analyse entsteht aus Ihrem Exposé-Link oder PDF-Upload; recherchierte
        Marktwerte sind mit Quellen verlinkt, Schätzungen ausdrücklich als solche gekennzeichnet.
        {isPremium
          ? ' Der Premium-Report enthält zusätzlich Wertermittlung nach drei Verfahren, Marktband mit Preistrend, Mietrendite-Detail und Maklerprofil.'
          : ' Den größeren Premium-Report zeigt das Beispiel unter /beispiel-premium-report.'}
      </p>

      <AnalysisResult
        result={result}
        options={{ makleranschreiben: true, verhandlungstipps: true, risiken: true }}
        url="https://www.immobilienscout24.de/expose/example-mock-id"
        showBackButton={false}
      />

      <div className="mt-10 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Überzeugt? Prüfen Sie Ihr eigenes Objekt.</h2>
        <p className="text-cream/70 text-sm mb-4">
          Exposé-Link oder PDF einfügen — die vollständige Analyse kommt in wenigen Minuten per E-Mail.
          {isPremium ? ' Premium-Report: 79 €.' : ' Ab 19 € pro Analyse.'}
        </p>
        <a
          href="/"
          className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors"
        >
          Jetzt Analyse starten
        </a>
      </div>
    </div>
  )
}
