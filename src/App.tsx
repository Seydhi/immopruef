import { useEffect, useState, useCallback } from 'react'
import type { OrderResult, Analysis } from './lib/types'
import { pollAnalysis, getAnalysisByToken } from './lib/api'
import Header from './components/Header'
import Landing from './components/Landing'
import LoadingView from './components/LoadingView'
import ResultsView from './components/ResultsView'
import AnalysisResultView from './components/AnalysisResult'
import Toast from './components/Toast'

type AppView =
  | { type: 'landing' }
  | { type: 'loading'; sessionId: string }
  | { type: 'results'; order: OrderResult }
  | { type: 'permalink'; analysis: Analysis }
  | { type: 'error'; message: string }

export default function App() {
  const [view, setView] = useState<AppView>({ type: 'landing' })
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | 'neutral' } | null>(null)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  const startPolling = useCallback(async (sessionId: string) => {
    setView({ type: 'loading', sessionId })
    setLoadingError(null)
    setTimedOut(false)

    const maxAttempts = 60
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await pollAnalysis(sessionId)
        if (result.order_status === 'completed' || result.order_status === 'failed') {
          setView({ type: 'results', order: result })
          return
        }
        if (result.order_status === 'pending') {
          // Payment not confirmed yet — webhook may be delayed
          await new Promise((r) => setTimeout(r, 5000))
          continue
        }
        // processing — Claude is analyzing, wait longer
        await new Promise((r) => setTimeout(r, 5000))
      } catch {
        // Network error, retry
        await new Promise((r) => setTimeout(r, 5000))
      }
    }
    // Timed out
    setTimedOut(true)
  }, [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const resultToken = params.get('result')
    const paymentCancelled = params.get('payment')

    // Clean URL
    if (sessionId || resultToken || paymentCancelled) {
      window.history.replaceState({}, '', window.location.pathname)
    }

    if (sessionId) {
      startPolling(sessionId)
    } else if (resultToken) {
      getAnalysisByToken(resultToken).then((analysis) => {
        if (analysis) {
          setView({ type: 'permalink', analysis })
        } else {
          setView({ type: 'error', message: 'Analyse nicht gefunden.' })
        }
      }).catch(() => {
        setView({ type: 'error', message: 'Verbindungsfehler.' })
      })
    } else if (paymentCancelled === 'cancelled') {
      setToast({ message: 'Zahlung abgebrochen.', variant: 'neutral' })
    }
  }, [startPolling])

  const handleBack = () => {
    setView({ type: 'landing' })
    setLoadingError(null)
    setTimedOut(false)
  }

  const handleRetry = () => {
    if (view.type === 'loading') {
      startPolling(view.sessionId)
    }
  }

  return (
    <div className="min-h-screen bg-cream font-body text-ink text-[15px] leading-relaxed">
      <Header />

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}

      <main className="max-w-[820px] mx-auto px-6 py-10">
        {view.type === 'landing' && <Landing />}

        {view.type === 'loading' && (
          <LoadingView
            error={loadingError}
            onRetry={handleRetry}
            timedOut={timedOut}
          />
        )}

        {view.type === 'results' && (
          <ResultsView analyses={view.order.analyses} onBack={handleBack} />
        )}

        {view.type === 'permalink' && view.analysis.result && (
          <div>
            <AnalysisResultView
              result={view.analysis.result}
              options={view.analysis.options}
              url={view.analysis.url}
            />
          </div>
        )}

        {view.type === 'error' && (
          <div className="text-center py-16">
            <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-800 text-sm inline-block mb-4">
              {view.message}
            </div>
            <div>
              <a href="/" className="text-green text-sm font-medium hover:text-green-mid transition-colors">
                Zur Startseite
              </a>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-[11px] text-ink-light py-6 border-t border-ink/10 mt-10 mx-6">
        KI-Analyse auf Basis öffentlich verfügbarer Daten · Keine Gewähr für Vollständigkeit oder Richtigkeit
      </footer>
    </div>
  )
}
