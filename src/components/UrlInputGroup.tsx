import { SUPPORTED_PLATFORMS } from '../lib/validation'

interface UrlInputGroupProps {
  urls: string[]
  onChange: (urls: string[]) => void
  errors: string[]
  count: number
}

export default function UrlInputGroup({ urls, onChange, errors, count }: UrlInputGroupProps) {
  const handleChange = (index: number, value: string) => {
    const updated = [...urls]
    updated[index] = value
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, i) => (
        <div key={i}>
          <label className="block text-[11px] font-medium tracking-widest uppercase text-ink-light mb-1.5">
            {count > 1 ? `Immobilie ${i + 1}` : 'Link zum Immobilienangebot einfügen'}
          </label>
          <input
            type="url"
            value={urls[i] || ''}
            onChange={(e) => handleChange(i, e.target.value)}
            placeholder="https://www.immobilienscout24.de/expose/..."
            maxLength={2048}
            className="w-full px-4 py-3 border border-ink/20 rounded-lg bg-cream text-ink text-sm font-body outline-none transition-colors focus:border-green focus:bg-white placeholder:text-ink-light placeholder:font-light"
          />
          {errors[i] && (
            <p className="text-red-600 text-xs mt-1">{errors[i]}</p>
          )}
        </div>
      ))}
      {count === 1 && (
        <p className="text-xs text-ink-mid leading-relaxed">
          Wir erstellen daraus eine strukturierte Ersteinschätzung mit Markthinweisen, Kostenschätzungen und Prüfempfehlungen.
        </p>
      )}
      <p className="text-[11px] text-ink-light">
        Unterstützt: {SUPPORTED_PLATFORMS}
      </p>
    </div>
  )
}
