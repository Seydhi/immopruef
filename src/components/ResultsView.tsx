import { useState } from 'react'
import type { Analysis } from '../lib/types'
import AnalysisResult from './AnalysisResult'
import { retryAnalysis } from '../lib/api'

interface ResultsViewProps {
  analyses: Analysis[]
  /** Stripe-Session der Bestellung — weist den Neustart einer fehlgeschlagenen Analyse aus */
  sessionId?: string
  onBack?: () => void
  /** Neustart wurde eingereiht → der Aufrufer fragt den Status wieder ab */
  onRetryStarted?: () => void
}

const RETRY_FAILED_TEXT =
  'Der Neustart hat gerade nicht geklappt. Bitte versuchen Sie es in ein paar Minuten erneut oder schreiben Sie uns an info@immopruef.de — wir kümmern uns darum.'

// Fehlgeschlagene Analysen tragen im result-Feld statt des Reports einen Fehlergrund.
function failureInfo(analysis: Analysis): { title: string; detail: string | null; unavailable: boolean } {
  const r = analysis.result as unknown as { error?: unknown; hinweis?: unknown } | null
  const error = typeof r?.error === 'string' ? r.error : ''
  const hinweis = typeof r?.hinweis === 'string' ? r.hinweis.trim() : ''
  if (error === 'listing_unavailable') {
    return {
      title: 'Das Inserat war nicht abrufbar',
      detail: hinweis || 'Das Inserat ist vermutlich deaktiviert oder gelöscht worden.',
      unavailable: true,
    }
  }
  // Klartext-Meldungen (z. B. nicht unterstütztes Portal) anzeigen, interne Codes nicht
  const detail = error && error !== 'analysis_failed' && /\s/.test(error) ? error : null
  return { title: 'Analyse konnte nicht erstellt werden', detail, unavailable: false }
}

export default function ResultsView({ analyses, sessionId, onBack, onRetryStarted }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [retrying, setRetrying] = useState<string | null>(null)
  const [retryError, setRetryError] = useState<string | null>(null)

  const handleRetry = async (analysisId: string) => {
    setRetrying(analysisId)
    setRetryError(null)
    try {
      const queued = sessionId ? await retryAnalysis(analysisId, sessionId) : false
      if (queued && onRetryStarted) {
        onRetryStarted() // zurück zum Ladebildschirm, das Ergebnis kommt über die Statusabfrage
        return
      }
      setRetryError(RETRY_FAILED_TEXT)
    } catch {
      setRetryError(RETRY_FAILED_TEXT)
    } finally {
      setRetrying(null)
    }
  }

  const renderFailed = (analysis: Analysis, inline?: boolean) => {
    const info = failureInfo(analysis)
    return (
    <div className={`${inline ? '' : 'text-center py-16'}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-800 text-sm inline-block max-w-md">
        <p className="font-medium mb-2">{info.title}</p>
        {info.detail && <p className="text-xs text-red-700 mb-2">{info.detail}</p>}
        <p className="text-xs text-red-600 mb-3">
          {info.unavailable
            ? 'Ihre Zahlung ist erfasst. Ist das Inserat wieder online, können Sie die Analyse kostenlos neu starten — oder schreiben Sie uns an info@immopruef.de, dann finden wir eine Lösung.'
            : 'Keine Sorge — Ihre Zahlung ist erfasst. Sie können die Analyse kostenlos erneut starten.'}
        </p>
        {retryError && <p role="alert" className="text-xs text-red-800 font-medium mb-3">{retryError}</p>}
        <button
          onClick={() => handleRetry(analysis.id)}
          disabled={retrying === analysis.id}
          className="bg-green text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-green-mid transition-colors disabled:opacity-50"
        >
          {retrying === analysis.id ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Wird erneut analysiert…
            </span>
          ) : (
            'Kostenlos erneut analysieren'
          )}
        </button>
      </div>
    </div>
    )
  }

  if (analyses.length === 0) {
    return (
      <div className="text-center py-16 text-ink-mid text-sm">
        Keine Ergebnisse vorhanden.
      </div>
    )
  }

  // Single analysis — no tabs
  if (analyses.length === 1) {
    const a = analyses[0]
    if (a.status === 'failed' || !a.result) {
      return renderFailed(a)
    }
    return <AnalysisResult result={a.result} options={a.options} url={a.url} onBack={onBack} />
  }

  // Multi analysis — tabs
  const current = analyses[activeTab]

  return (
    <div>
      <button
        onClick={onBack || (() => { window.location.href = '/' })}
        className="mb-4 text-sm text-green hover:text-green-mid transition-colors flex items-center gap-1"
      >
        ← Neue Analyse starten
      </button>

      {/* Tab bar */}
      <div className="flex gap-1 mb-5 border-b border-ink/10">
        {analyses.map((a, i) => (
          <button
            key={i}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              i === activeTab
                ? 'border-green text-green'
                : 'border-transparent text-ink-light hover:text-ink-mid'
            }`}
          >
            Immobilie {i + 1}
            {a.status === 'failed' && ' ✕'}
            {a.status === 'processing' && ' …'}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {current.status === 'failed' || !current.result ? (
        renderFailed(current, true)
      ) : (
        <AnalysisResult
          result={current.result}
          options={current.options}
          url={current.url}
          showBackButton={false}
        />
      )}
    </div>
  )
}
