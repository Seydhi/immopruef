import { useEffect, useState, useCallback } from 'react'
import type { OrderResult, Analysis } from './lib/types'
import { pollAnalysis, getAnalysisByToken } from './lib/api'
import Header from './components/Header'
import Landing from './components/Landing'
import LoadingView from './components/LoadingView'
import ResultsView from './components/ResultsView'
import AnalysisResultView from './components/AnalysisResult'
import Toast from './components/Toast'
import Impressum from './components/legal/Impressum'
import Datenschutz from './components/legal/Datenschutz'
import AGB from './components/legal/AGB'
import BlogIndex from './components/blog/BlogIndex'
import BlogLayout from './components/blog/BlogLayout'
import { Suspense } from 'react'
import { BLOG_POSTS, POST_COMPONENTS } from './components/blog/posts'

type AppView =
  | { type: 'landing' }
  | { type: 'loading'; sessionId: string }
  | { type: 'results'; order: OrderResult }
  | { type: 'permalink'; analysis: Analysis }
  | { type: 'error'; message: string }
  | { type: 'impressum' }
  | { type: 'datenschutz' }
  | { type: 'agb' }
  | { type: 'blog' }
  | { type: 'blog-post'; slug: string }

export default function App() {
  const [view, setView] = useState<AppView>({ type: 'landing' })
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | 'neutral' } | null>(null)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)

  const startPolling = useCallback(async (sessionId: string) => {
    setView({ type: 'loading', sessionId })
    setLoadingError(null)
    setTimedOut(false)
    setProgress(null)

    const maxAttempts = 120 // 10 minutes (120 × 5s)
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const result = await pollAnalysis(sessionId)
        if (result.order_status === 'completed' || result.order_status === 'failed') {
          setView({ type: 'results', order: result })
          return
        }
        // Track progress for multi-URL orders
        if (result.analyses?.length > 0) {
          const done = result.analyses.filter((a: { status: string }) => a.status === 'completed' || a.status === 'failed').length
          setProgress({ completed: done, total: result.analyses.length })
        }
        if (result.order_status === 'pending') {
          await new Promise((r) => setTimeout(r, 5000))
          continue
        }
        // processing
        await new Promise((r) => setTimeout(r, 5000))
      } catch {
        await new Promise((r) => setTimeout(r, 5000))
      }
    }
    setTimedOut(true)
  }, [])

  useEffect(() => {
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    const resultToken = params.get('result')
    const paymentCancelled = params.get('payment')

    // Legal pages routing
    if (path === '/impressum') { setView({ type: 'impressum' }); return }
    if (path === '/datenschutz') { setView({ type: 'datenschutz' }); return }
    if (path === '/agb') { setView({ type: 'agb' }); return }

    // Blog routing
    if (path === '/blog' || path === '/blog/') { setView({ type: 'blog' }); return }
    const blogMatch = path.match(/^\/blog\/(.+)$/)
    if (blogMatch) { setView({ type: 'blog-post', slug: blogMatch[1] }); return }

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
            progress={progress}
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

        {(view.type === 'impressum' || view.type === 'datenschutz' || view.type === 'agb') && (
          <div>
            <button
              onClick={() => { window.history.pushState({}, '', '/'); setView({ type: 'landing' }) }}
              className="text-green text-sm font-medium hover:text-green-mid transition-colors mb-6 flex items-center gap-1"
            >
              ← Zurück zur Startseite
            </button>
            {view.type === 'impressum' && <Impressum />}
            {view.type === 'datenschutz' && <Datenschutz />}
            {view.type === 'agb' && <AGB />}
          </div>
        )}

        {/* Blog */}
        {view.type === 'blog' && (
          <BlogIndex onNavigate={(slug) => {
            window.history.pushState({}, '', `/blog/${slug}`)
            setView({ type: 'blog-post', slug })
            window.scrollTo(0, 0)
          }} />
        )}

        {view.type === 'blog-post' && (() => {
          const meta = BLOG_POSTS.find(p => p.slug === view.slug)
          const PostComponent = POST_COMPONENTS[view.slug]
          if (!meta || !PostComponent) {
            return (
              <div className="text-center py-16">
                <div className="text-ink-mid text-sm mb-4">Artikel nicht gefunden.</div>
                <a href="/blog" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/blog'); setView({ type: 'blog' }); window.scrollTo(0, 0) }} className="text-green text-sm font-medium">← Alle Artikel</a>
              </div>
            )
          }
          return (
            <Suspense fallback={<div className="text-center py-16 text-ink-light text-sm">Artikel wird geladen...</div>}>
              <BlogLayout meta={meta}>
                <PostComponent />
              </BlogLayout>
            </Suspense>
          )
        })()}
      </main>

      <footer className="text-center text-[11px] text-ink-light py-6 border-t border-ink/10 mt-10 mx-6">
        <p className="mb-2">KI-Analyse auf Basis öffentlich verfügbarer Daten · Keine Gewähr für Vollständigkeit oder Richtigkeit</p>
        <div className="flex items-center justify-center gap-3">
          <a href="/blog" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/blog'); setView({ type: 'blog' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Blog</a>
          <span className="text-ink/20">·</span>
          <a href="/impressum" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/impressum'); setView({ type: 'impressum' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Impressum</a>
          <span className="text-ink/20">·</span>
          <a href="/datenschutz" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/datenschutz'); setView({ type: 'datenschutz' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Datenschutz</a>
          <span className="text-ink/20">·</span>
          <a href="/agb" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/agb'); setView({ type: 'agb' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">AGB</a>
        </div>
      </footer>
    </div>
  )
}
