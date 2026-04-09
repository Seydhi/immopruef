import type { Package } from '../lib/types'
import { PACKAGE_CONFIG } from '../lib/types'

interface PricingToggleProps {
  selected: Package
  onChange: (pkg: Package) => void
}

const PACKAGES: Package[] = ['single', 'double', 'triple']
const LABELS: Record<Package, string> = {
  single: '1 Analyse',
  double: '2 Analysen',
  triple: '3 Analysen',
}

export default function PricingToggle({ selected, onChange }: PricingToggleProps) {
  return (
    <div className="flex gap-2 mb-5">
      {PACKAGES.map((pkg) => {
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
            <div>{LABELS[pkg]}</div>
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
  )
}
