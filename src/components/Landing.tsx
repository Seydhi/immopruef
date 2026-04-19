import { useRef, useState } from 'react'
import type { Package } from '../lib/types'
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
import BlogPreview from './landing/BlogPreview'

export default function Landing() {
  useSEO({
    title: 'Immobilienangebote strukturiert einordnen — ImmoPrüf',
    description: 'Strukturierte Ersteinschätzung zu Angebotspreis, Standort, möglichen Risiken und offenen Prüfpunkten vor Besichtigung und Kauf. Ab 19 € pro Analyse — Premium-Report ab 79 €.',
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
  const options = {
    makleranschreiben: true,
    verhandlungstipps: true,
    risiken: true,
  } as const
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [agbAccepted, setAgbAccepted] = useState(false)
  const [widerrufAccepted, setWiderrufAccepted] = useState(false)
  const [consentError, setConsentError] = useState('')
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

    // Validate consents
    if (!agbAccepted || !widerrufAccepted) {
      setConsentError('Bitte bestätigen Sie beide Zustimmungen, um fortzufahren.')
      valid = false
    } else {
      setConsentError('')
    }

    return valid
  }

  const handleSubmit = async () => {
    setGlobalError('')
    if (!validate()) return

    setLoading(true)
    try {
      const checkoutUrl = await startCheckout(urls.slice(0, urlCount), options, pkg, email.trim(), {
        agbAccepted,
        widerrufWaived: widerrufAccepted,
        timestamp: new Date().toISOString(),
      })
      window.location.href = checkoutUrl
    } catch {
      setGlobalError('Verbindungsfehler. Bitte erneut versuchen.')
      setLoading(false)
    }
  }

  const allFilled =
    urls.slice(0, urlCount).every((u) => u.trim().length > 0) &&
    email.trim().length > 0 &&
    agbAccepted &&
    widerrufAccepted

  const ctaLabel =
    pkg === 'premium'
      ? `Kostenpflichtig bestellen — Premium-Report (${config.price})`
      : pkg === 'single'
      ? `Kostenpflichtig bestellen (${config.price})`
      : `Kostenpflichtig bestellen — ${config.urls} Analysen (${config.price})`

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

      <div ref={formRef} id="analyse-form" className="bg-white border border-ink/20 rounded-xl p-6 shadow-sm">
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

        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-ink-light">
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Makleranschreiben
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Verhandlungstipps
          </span>
          <span className="inline-flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
            Risikohinweise
          </span>
          <span className="text-ink-light/70">— immer enthalten</span>
        </div>

        {globalError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-red-800 text-[13px]">
            {globalError}
          </div>
        )}

        {/* Legal consents — Pflicht vor Checkout */}
        <div className="mt-5 space-y-2.5 text-[12px] text-ink-mid leading-snug">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={agbAccepted}
              onChange={(e) => { setAgbAccepted(e.target.checked); setConsentError('') }}
              className="w-4 h-4 accent-green cursor-pointer mt-0.5 shrink-0"
              aria-describedby="agb-label"
            />
            <span id="agb-label">
              Ich habe die{' '}
              <a href="/agb" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">AGB</a>
              {' '}und die{' '}
              <a href="/agb" target="_blank" rel="noopener noreferrer" className="text-green hover:text-green-mid underline">Widerrufsbelehrung</a>
              {' '}gelesen und akzeptiere sie.
            </span>
          </label>
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={widerrufAccepted}
              onChange={(e) => { setWiderrufAccepted(e.target.checked); setConsentError('') }}
              className="w-4 h-4 accent-green cursor-pointer mt-0.5 shrink-0"
              aria-describedby="widerruf-label"
            />
            <span id="widerruf-label">
              Ich stimme ausdrücklich zu, dass die Analyse unmittelbar nach der Zahlung
              erstellt wird, und bestätige meine Kenntnis, dass ich damit mein
              Widerrufsrecht verliere (§ 356 Abs. 5 BGB).
            </span>
          </label>
          {consentError && (
            <p className="text-red-600 text-[11px] pl-6">{consentError}</p>
          )}
        </div>

        <button
          onClick={handleSubmit}
          disabled={!allFilled || loading}
          className="mt-4 w-full bg-green text-cream py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors hover:bg-green-mid active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
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

        <p className="text-[11px] text-ink-light text-center mt-2">
          Mit Ihrer Bestellung erklären Sie sich mit unserer{' '}
          <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink-mid">Datenschutzerklärung</a>
          {' '}einverstanden.
        </p>
      </div>

      <HeroSection onCta={scrollToForm} />

      <FeatureGrid />

      <AnalysisPreview />

      <FAQ />

      <BlogPreview />
    </>
  )
}
