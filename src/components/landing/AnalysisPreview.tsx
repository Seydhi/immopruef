import { useState } from 'react'
import { MOCK_ANALYSIS_RESULT } from '../../lib/mock-data'
import { MOCK_PREMIUM_REPORT } from '../../lib/mock-premium'
import AnalysisResult from '../AnalysisResult'

// Vorschau-Sektion: 2 Kacheln (Standard / Premium) — Klick öffnet die echte
// Analyse-UI als Fullscreen-Overlay mit Mock-Daten. So sehen Käufer was sie
// bekommen, bevor sie 19/29/34/79€ ausgeben.

type Variant = 'standard' | 'premium'

export default function AnalysisPreview() {
  const [open, setOpen] = useState<Variant | null>(null)

  return (
    <section className="py-10">
      <h2 className="font-display text-2xl sm:text-3xl font-medium text-green text-center mb-2">
        So sieht Ihre Analyse aus
      </h2>
      <p className="text-ink-light text-sm text-center mb-8">
        Klicken Sie auf eine Variante und sehen Sie die komplette Beispielanalyse
      </p>

      {/* 2-Kachel-Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[700px] mx-auto">
        {/* Standard */}
        <button
          onClick={() => setOpen('standard')}
          className="group bg-white border-2 border-ink/10 hover:border-green/40 hover:shadow-md rounded-2xl p-6 text-left transition-all flex flex-col"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">📋</span>
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
            Standard-Beispiel ansehen <span>→</span>
          </div>
        </button>

        {/* Premium */}
        <button
          onClick={() => setOpen('premium')}
          className="group bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-gold/40 hover:border-gold hover:shadow-lg rounded-2xl p-6 text-left transition-all flex flex-col relative overflow-hidden"
        >
          {/* Premium-Glanz */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gold/20 to-transparent rounded-bl-full pointer-events-none" />

          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">💎</span>
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
            Premium-Beispiel ansehen <span>→</span>
          </div>
        </button>
      </div>

      {/* Modal-Overlay mit Live-Analyse */}
      {open && (
        <PreviewModal
          variant={open}
          onClose={() => setOpen(null)}
        />
      )}
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

function PreviewModal({ variant, onClose }: { variant: Variant; onClose: () => void }) {
  const isPremium = variant === 'premium'
  const result = isPremium
    ? { ...MOCK_ANALYSIS_RESULT, premiumReport: MOCK_PREMIUM_REPORT }
    : MOCK_ANALYSIS_RESULT

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/80 backdrop-blur-sm flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      onClick={onClose}
    >
      <div
        className="bg-cream w-full max-w-[900px] rounded-2xl shadow-2xl my-4 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header mit Close-Button + Hinweis */}
        <div className="sticky top-0 z-10 bg-amber-50 border-b border-amber-200 rounded-t-2xl px-5 py-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-lg">{isPremium ? '💎' : '📋'}</span>
            <span className="font-medium text-amber-900">
              Beispielanalyse — {isPremium ? 'Premium-Report' : 'Standard'}
            </span>
            <span className="bg-amber-200 text-amber-900 text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
              Mock-Daten · keine echte Analyse
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Schließen"
            className="bg-white hover:bg-cream-dark border border-ink/15 rounded-lg w-9 h-9 flex items-center justify-center text-ink-mid hover:text-ink transition-colors shrink-0"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Inhalt */}
        <div className="px-4 sm:px-6 pb-6 pt-4">
          <AnalysisResult
            result={result}
            options={{ makleranschreiben: true, verhandlungstipps: true, risiken: true }}
            url="https://www.immobilienscout24.de/expose/example-mock-id"
            showBackButton={false}
          />
        </div>

        {/* Sticky CTA-Footer */}
        <div className="sticky bottom-0 bg-gradient-to-t from-cream via-cream to-cream/90 backdrop-blur-sm border-t border-ink/10 rounded-b-2xl px-5 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-ink-mid">
              Überzeugt? Starten Sie jetzt mit Ihrer eigenen Immobilie.
            </div>
            <button
              onClick={() => {
                onClose()
                setTimeout(() => {
                  document.querySelector('#analyse-form')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                }, 100)
              }}
              className="bg-green text-cream text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors"
            >
              {isPremium ? 'Premium starten — 79 €' : 'Jetzt analysieren — ab 19 €'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
