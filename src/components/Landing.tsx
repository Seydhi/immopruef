import { useState } from 'react'
import type { Package, AnalysisOptions } from '../lib/types'
import { PACKAGE_CONFIG } from '../lib/types'
import { isValidPropertyUrl } from '../lib/validation'
import { startCheckout } from '../lib/api'
import PricingToggle from './PricingToggle'
import UrlInputGroup from './UrlInputGroup'

export default function Landing() {
  const [pkg, setPkg] = useState<Package>('single')
  const [urls, setUrls] = useState<string[]>([''])
  const [errors, setErrors] = useState<string[]>([])
  const [options, setOptions] = useState<AnalysisOptions>({
    makleranschreiben: true,
    verhandlungstipps: true,
    risiken: true,
  })
  const [loading, setLoading] = useState(false)
  const [globalError, setGlobalError] = useState('')

  const config = PACKAGE_CONFIG[pkg]
  const urlCount = config.urls

  const handlePackageChange = (newPkg: Package) => {
    setPkg(newPkg)
    const newCount = PACKAGE_CONFIG[newPkg].urls
    setUrls((prev) => {
      const updated = [...prev]
      while (updated.length < newCount) updated.push('')
      return updated.slice(0, newCount)
    })
    setErrors([])
  }

  const toggleOption = (key: keyof AnalysisOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const validate = (): boolean => {
    const newErrors: string[] = []
    let valid = true
    for (let i = 0; i < urlCount; i++) {
      const url = urls[i]?.trim() || ''
      if (!url) {
        newErrors[i] = 'Bitte einen Link eingeben.'
        valid = false
      } else if (!isValidPropertyUrl(url)) {
        newErrors[i] = 'Bitte einen Link von einer unterstützten Plattform eingeben.'
        valid = false
      } else {
        newErrors[i] = ''
      }
    }
    setErrors(newErrors)
    return valid
  }

  const handleSubmit = async () => {
    setGlobalError('')
    if (!validate()) return

    setLoading(true)
    try {
      const checkoutUrl = await startCheckout(urls.slice(0, urlCount), options, pkg)
      window.location.href = checkoutUrl
    } catch {
      setGlobalError('Verbindungsfehler. Bitte erneut versuchen.')
      setLoading(false)
    }
  }

  const allFilled = urls.slice(0, urlCount).every((u) => u.trim().length > 0)

  const ctaLabel =
    pkg === 'single'
      ? `Analysieren (${config.price})`
      : `${config.urls} Analysen starten (${config.price})`

  return (
    <>
      <div className="text-center mb-8">
        <h1 className="font-display text-3xl font-medium text-green leading-tight mb-2">
          Professionelle Immobilienanalyse
        </h1>
        <p className="text-ink-mid text-sm font-light">
          Standortbewertung, Marktdaten & Makleranschreiben – in Sekunden
        </p>
      </div>

      <div className="bg-white border border-ink/20 rounded-xl p-6 shadow-sm">
        <PricingToggle selected={pkg} onChange={handlePackageChange} />

        <UrlInputGroup
          urls={urls}
          onChange={setUrls}
          errors={errors}
          count={urlCount}
        />

        <div className="flex gap-4 mt-4 flex-wrap">
          {(['makleranschreiben', 'verhandlungstipps', 'risiken'] as const).map((key) => (
            <label key={key} className="flex items-center gap-1.5 text-[13px] text-ink-mid cursor-pointer select-none">
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggleOption(key)}
                className="w-4 h-4 accent-green cursor-pointer"
              />
              {key === 'makleranschreiben' && 'Makleranschreiben'}
              {key === 'verhandlungstipps' && 'Verhandlungstipps'}
              {key === 'risiken' && 'Risikohinweise'}
            </label>
          ))}
        </div>

        {globalError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800 text-[13px]">
            {globalError}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!allFilled || loading}
          className="mt-5 w-full bg-green text-cream py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors hover:bg-green-mid active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-cream/30 border-t-cream rounded-full animate-spin" />
              Weiterleitung zur Bezahlung…
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              {ctaLabel}
            </>
          )}
        </button>
      </div>
    </>
  )
}
