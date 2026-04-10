import { useState } from 'react'
import type { Analysis } from '../lib/types'
import AnalysisResult from './AnalysisResult'
import { retryAnalysis } from '../lib/api'

interface ResultsViewProps {
  analyses: Analysis[]
  onBack?: () => void
  onRetryComplete?: (updated: Analysis) => void
}

export default function ResultsView({ analyses, onBack, onRetryComplete }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState(0)
  const [retrying, setRetrying] = useState<string | null>(null)

  const handleRetry = async (analysisId: string) => {
    setRetrying(analysisId)
    try {
      const updated = await retryAnalysis(analysisId)
      if (updated && onRetryComplete) onRetryComplete(updated)
      else window.location.reload()
    } catch {
      // Reload to check if it worked
      window.location.reload()
    } finally {
      setRetrying(null)
    }
  }

  const FailedView = ({ analysis, inline }: { analysis: Analysis; inline?: boolean }) => (
    <div className={`${inline ? '' : 'text-center py-16'}`}>
      <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-800 text-sm inline-block">
        <p className="font-medium mb-2">Analyse konnte nicht erstellt werden</p>
        <p className="text-xs text-red-600 mb-3">Keine Sorge — Ihre Zahlung ist erfasst. Sie können die Analyse kostenlos erneut starten.</p>
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
      return <FailedView analysis={a} />
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
        <FailedView analysis={current} inline />
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
