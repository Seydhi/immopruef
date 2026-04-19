import type { Package } from '../lib/types'
import { PACKAGE_CONFIG } from '../lib/types'

interface PricingToggleProps {
  selected: Package
  onChange: (pkg: Package) => void
}

const QUICK_PACKAGES: Package[] = ['single', 'double', 'triple']

export default function PricingToggle({ selected, onChange }: PricingToggleProps) {
  const isPremiumSelected = selected === 'premium'

  return (
    <div className="space-y-3 mb-5">
      {/* Quick-Check Pakete */}
      <div>
        <div className="text-[10px] text-ink-light font-medium tracking-wider uppercase mb-2">Quick-Check</div>
        <div className="flex gap-2">
          {QUICK_PACKAGES.map((pkg) => {
            const config = PACKAGE_CONFIG[pkg]
            const isActive = selected === pkg
            return (
              <button
                key={pkg}
                onClick={() => onChange(pkg)}
                className={`relative flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-green text-cream border-green'
                    : 'bg-white text-ink-mid border-ink/12 hover:border-ink/25'
                }`}
              >
                <div>{config.label}</div>
                <div className={`text-xs mt-0.5 ${isActive ? 'text-cream/70' : 'text-ink-light'}`}>
                  {config.price}
                </div>
                {config.saving && (
                  <span className="absolute -top-2 -right-2 bg-gold text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full">
                    -{config.saving}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-ink/10" />
        <span className="text-[10px] text-ink-light tracking-wider uppercase">oder</span>
        <div className="flex-1 border-t border-ink/10" />
      </div>

      {/* Premium Report */}
      <button
        onClick={() => onChange('premium')}
        className={`relative w-full rounded-xl border-2 p-4 text-left transition-all ${
          isPremiumSelected
            ? 'border-gold bg-gradient-to-r from-amber-50 to-orange-50 shadow-sm'
            : 'border-ink/10 bg-white hover:border-gold/40'
        }`}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base">📋</span>
              <span className={`font-display text-base font-medium ${isPremiumSelected ? 'text-amber-900' : 'text-ink'}`}>
                Kaufentscheidungs-Report
              </span>
              <span className="bg-gold text-white text-[9px] font-bold px-2 py-0.5 rounded-full tracking-wider uppercase">
                Premium
              </span>
            </div>
            <div className={`text-xs mt-1 ${isPremiumSelected ? 'text-amber-700' : 'text-ink-light'}`}>
              Immobilienbewertung · Standort-Dossier · Finanzierungsplan · Checkliste · PDF-Export
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className={`font-display text-xl font-medium ${isPremiumSelected ? 'text-amber-900' : 'text-ink'}`}>
              79,00 €
            </div>
            <div className={`text-[10px] leading-tight ${isPremiumSelected ? 'text-amber-600' : 'text-ink-light'}`}>
              Ersteinschätzung<br />inkl. PDF-Export
            </div>
          </div>
        </div>

        {/* Premium Features List */}
        {isPremiumSelected && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-3 pt-3 border-t border-amber-200">
            {[
              'Indikative Wert-Einschätzung',
              'Vergleichs- & Sachwertverfahren',
              'Vollständiges Standort-Dossier',
              'Hochwasser- & Lärmkarten',
              '5 Finanzierungsszenarien',
              '30-Jahres-Vermögensvergleich',
              'Sanierungsfahrplan mit Kosten',
              'Fördermittel-Übersicht',
              'Vor-Kauf-Checkliste',
              'PDF zum Ausdrucken',
            ].map((feat, i) => (
              <div key={i} className="flex items-center gap-1.5 text-[11px] text-amber-800">
                <span className="text-amber-500">✓</span>
                {feat}
              </div>
            ))}
          </div>
        )}
      </button>
    </div>
  )
}
