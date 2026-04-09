import { useState } from 'react'
import type { Analysis } from '../lib/types'
import AnalysisResult from './AnalysisResult'

interface ResultsViewProps {
  analyses: Analysis[]
  onBack?: () => void
}

export default function ResultsView({ analyses, onBack }: ResultsViewProps) {
  const [activeTab, setActiveTab] = useState(0)

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
      return (
        <div className="text-center py-16">
          <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-800 text-sm inline-block">
            Analyse konnte nicht erstellt werden. Bitte erneut versuchen.
          </div>
        </div>
      )
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
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-800 text-sm">
          Analyse für {current.url} konnte nicht erstellt werden.
        </div>
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
