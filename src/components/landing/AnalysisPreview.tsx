// Vorschau-Sektion: 2 Kacheln (Standard / Premium) — verlinken auf die
// indexierbaren Beispiel-Seiten (/beispiel-analyse, /beispiel-premium-report).
// Früher ein Modal; echte URLs sind teilbar, crawlbar und per Back-Button nutzbar.

export default function AnalysisPreview() {
  return (
    <section className="py-10">
      <h2 className="font-display text-2xl sm:text-3xl font-medium text-green text-center mb-2">
        So sieht Ihre Analyse aus
      </h2>
      <p className="text-ink-light text-sm text-center mb-8">
        Öffnen Sie eine vollständige Beispielanalyse mit Musterdaten
      </p>

      {/* 2-Kachel-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[700px] mx-auto">
        {/* Standard */}
        <a
          href="/beispiel-analyse"
          className="group bg-white border-2 border-ink/10 hover:border-green/40 hover:shadow-md rounded-2xl p-6 text-left transition-all flex flex-col"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl" aria-hidden="true">📋</span>
            <span className="font-display text-xl font-medium text-ink">Standard</span>
            <span className="ml-auto bg-green/10 text-green text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">ab 19 €</span>
          </div>
          <p className="text-sm text-ink-mid leading-relaxed mb-4 flex-1">
            Vollständige Analyse mit Preisbewertung, Energie-Check, Standortanalyse, Finanzierung, Risiken und mehr.
          </p>
          <ul className="space-y-1.5 mb-4 text-xs text-ink-mid">
            <FeatureItem text="6 Bewertungs-Scores" />
            <FeatureItem text="Gesamtkosten-Rechner" />
            <FeatureItem text="Standortanalyse (8 Kategorien)" />
            <FeatureItem text="3 Finanzierungs-Szenarien" />
            <FeatureItem text="Verhandlungstipps + Makleranschreiben" />
          </ul>
          <div className="text-green text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Standard-Beispiel ansehen <span aria-hidden="true">→</span>
          </div>
        </a>

        {/* Premium */}
        <a
          href="/beispiel-premium-report"
          className="group bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-gold/40 hover:border-gold hover:shadow-lg rounded-2xl p-6 text-left transition-all flex flex-col relative overflow-hidden"
        >
          {/* Premium-Glanz */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/20 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl" aria-hidden="true">💎</span>
            <span className="font-display text-xl font-medium text-amber-900">Premium</span>
            <span className="ml-auto bg-gold text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">79 €</span>
          </div>
          <p className="text-sm text-amber-900/80 leading-relaxed mb-4 flex-1">
            Alles aus Standard <strong>plus</strong> 7 Premium-Module: Stärken/Schwächen, Maklerprofil, Mietrendite, Wertermittlung u.v.m.
          </p>
          <ul className="space-y-1.5 mb-4 text-xs text-amber-900/80">
            <FeatureItem text="Stärken & Schwächen narrativ" gold />
            <FeatureItem text="Marktband + Preistrend (5 J.)" gold />
            <FeatureItem text="Maklerprofil mit Bewertungen" gold />
            <FeatureItem text="Mietrendite + Cashflow-Detail" gold />
            <FeatureItem text="Wertermittlung (3 Verfahren)" gold />
          </ul>
          <div className="text-amber-700 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Premium-Beispiel ansehen <span aria-hidden="true">→</span>
          </div>
        </a>
      </div>
    </section>
  )
}

function FeatureItem({ text, gold }: { text: string; gold?: boolean }) {
  return (
    <li className="flex items-start gap-1.5">
      <span className={`shrink-0 mt-0.5 ${gold ? 'text-gold' : 'text-green'}`}>✓</span>
      <span>{text}</span>
    </li>
  )
}
