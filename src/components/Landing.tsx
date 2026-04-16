import { useRef, useState } from 'react'
import type { Package, AnalysisOptions } from '../lib/types'
import { PACKAGE_CONFIG } from '../lib/types'
import { isValidPropertyUrl } from '../lib/validation'
import { startCheckout } from '../lib/api'
import { useSEO, organizationSchema, webSiteSchema, productSchema, faqSchema } from '../lib/useSEO'
import PricingToggle from './PricingToggle'
import UrlInputGroup from './UrlInputGroup'
import HeroSection from './landing/HeroSection'
import FeatureGrid from './landing/FeatureGrid'
import AnalysisPreview from './landing/AnalysisPreview'
import FAQ, { FAQS } from './landing/FAQ'

export default function Landing() {
  useSEO({
    title: 'KI-gestützte Immobilienanalyse für Käufer in Deutschland',
    description: 'Soll ich diese Immobilie kaufen? Preisbewertung, Standortanalyse, Energie-Check, Finanzierung und Risiken in einem Report. Ab 19 € pro Analyse — Premium-Report ab 79 €.',
    canonical: 'https://immopruef.de/',
    type: 'website',
    jsonLd: [
      organizationSchema(),
      webSiteSchema(),
      productSchema(),
      faqSchema(FAQS.map(f => ({ question: f.q, answer: f.a }))),
    ],
  })
  const formRef = useRef<HTMLDivElement>(null)
  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const [pkg, setPkg] = useState<Package>('single')
  const [urls, setUrls] = useState<string[]>([''])
  const [errors, setErrors] = useState<string[]>([])
  const [options, setOptions] = useState<AnalysisOptions>({
    makleranschreiben: true,
    verhandlungstipps: true,
    risiken: true,
  })
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
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

  const validateEmail = (value: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  }

  const validate = (): boolean => {
    const newErrors: string[] = []
    let valid = true

    // Validate email
    const trimmedEmail = email.trim()
    if (!trimmedEmail) {
      setEmailError('Bitte eine E-Mail-Adresse eingeben.')
      valid = false
    } else if (!validateEmail(trimmedEmail)) {
      setEmailError('Bitte eine gültige E-Mail-Adresse eingeben.')
      valid = false
    } else {
      setEmailError('')
    }

    // Validate URLs
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
      const checkoutUrl = await startCheckout(urls.slice(0, urlCount), options, pkg, email.trim())
      window.location.href = checkoutUrl
    } catch {
      setGlobalError('Verbindungsfehler. Bitte erneut versuchen.')
      setLoading(false)
    }
  }

  const allFilled = urls.slice(0, urlCount).every((u) => u.trim().length > 0) && email.trim().length > 0

  const ctaLabel =
    pkg === 'premium'
      ? `Premium-Report erstellen (${config.price})`
      : pkg === 'single'
      ? `Analysieren (${config.price})`
      : `${config.urls} Analysen starten (${config.price})`

  return (
    <>
      {/* Analyse-Formular ganz oben */}
      <div className="text-center mb-6 mt-2">
        <h1 className="font-display text-2xl font-medium text-green leading-tight mb-1">
          Analyse starten
        </h1>
        <p className="text-ink-light text-sm">
          Günstiger als ein Gutachter (500–2.500 €)
        </p>
      </div>

      <div ref={formRef} className="bg-white border border-ink/20 rounded-xl p-6 shadow-sm">
        <PricingToggle selected={pkg} onChange={handlePackageChange} />

        <div className="mb-4">
          <label className="block text-[13px] font-medium text-ink-mid mb-1.5">
            E-Mail-Adresse <span className="text-ink-light font-normal">— Ihre Analyse wird an diese Adresse gesendet</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setEmailError('') }}
            placeholder="ihre@email.de"
            className={`w-full border rounded-lg px-3.5 py-2.5 text-sm bg-cream placeholder:text-ink-light/50 focus:outline-none focus:ring-2 focus:ring-green/30 focus:border-green transition-colors ${
              emailError ? 'border-red-400 bg-red-50/50' : 'border-ink/20'
            }`}
          />
          {emailError && (
            <p className="text-red-600 text-[11px] mt-1">{emailError}</p>
          )}
        </div>

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

      <HeroSection onCta={scrollToForm} />

      <FeatureGrid />

      <AnalysisPreview />

      <FAQ />
    </>
  )
}
