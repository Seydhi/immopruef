import { useEffect, useState, useCallback, useRef } from 'react'
import type { OrderResult, Analysis } from './lib/types'
import { pollAnalysis, getAnalysisByToken } from './lib/api'
import Header from './components/Header'
import Landing from './components/Landing'
import LoadingView from './components/LoadingView'
import ResultsView from './components/ResultsView'
import AnalysisResultView from './components/AnalysisResult'
import Toast from './components/Toast'
import ErrorBoundary from './components/ErrorBoundary'
import Impressum from './components/legal/Impressum'
import Datenschutz from './components/legal/Datenschutz'
import AGB from './components/legal/AGB'
import Widerruf from './components/legal/Widerruf'
import Barrierefreiheit from './components/legal/Barrierefreiheit'
import BlogIndex from './components/blog/BlogIndex'
import BlogLayout from './components/blog/BlogLayout'
import BlogKategorie from './components/blog/BlogKategorie'
import BeispielAnalyse from './components/BeispielAnalyse'
import KiTransparenz from './components/KiTransparenz'
import { kategorieForSlug } from './components/blog/kategorien'
import Rechner from './components/Rechner'
import Budgetrechner from './components/Budgetrechner'
import Tilgungsrechner from './components/Tilgungsrechner'
import NotarkostenRechner from './components/NotarkostenRechner'
import MietenOderKaufen from './components/MietenOderKaufen'
import MietrenditeRechner from './components/MietrenditeRechner'
import InstandhaltungRechner from './components/InstandhaltungRechner'
import WohnflaechenRechner from './components/WohnflaechenRechner'
import RechnerHub from './components/RechnerHub'
import RegionalKaufnebenkosten from './components/RegionalKaufnebenkosten'
import BodenrichtwertLand from './components/BodenrichtwertLand'
import KaufnebenkostenIndex from './components/KaufnebenkostenIndex'
import ExposePruefenLassen from './components/ExposePruefenLassen'
import UeberUns from './components/UeberUns'
import { regioForSlug } from './lib/regional'
import { Suspense } from 'react'
import { BLOG_POSTS, POST_COMPONENTS } from './components/blog/posts'

type AppView =
  | { type: 'landing' }
  | { type: 'loading'; sessionId: string }
  | { type: 'results'; order: OrderResult; sessionId: string }
  | { type: 'permalink-loading' }
  | { type: 'permalink'; analysis: Analysis }
  | { type: 'error'; message: string }
  | { type: 'impressum' }
  | { type: 'datenschutz' }
  | { type: 'agb' }
  | { type: 'widerruf' }
  | { type: 'ki-transparenz' }
  | { type: 'barrierefreiheit' }
  | { type: 'beispiel-analyse'; variant: 'standard' | 'premium' }
  | { type: 'rechner' }
  | { type: 'budgetrechner' }
  | { type: 'tilgungsrechner' }
  | { type: 'notarkosten' }
  | { type: 'mieten-oder-kaufen' }
  | { type: 'mietrendite' }
  | { type: 'instandhaltung' }
  | { type: 'wohnflaechen' }
  | { type: 'rechner-hub' }
  | { type: 'kaufnebenkosten-index' }
  | { type: 'expose-pruefen-lassen' }
  | { type: 'regional'; slug: string }
  | { type: 'bodenrichtwert'; slug: string }
  | { type: 'ueber-uns' }
  | { type: 'blog' }
  | { type: 'blog-kategorie'; slug: string }
  | { type: 'blog-post'; slug: string }

// Pfad → statische Ansicht. null = kein eigener Pfad (Startseite bzw. Ansichten,
// die über Query-Parameter gesteuert werden: ?session_id=… / ?result=…).
function resolveRoute(rawPath: string): AppView | null {
  // Trailing Slash normalisieren ("/rechner/" → "/rechner"), sonst fällt das
  // Routing bei Directory-URLs (statisches Hosting) auf die Landing zurück.
  const path = rawPath.replace(/\/+$/, '') || '/'

  if (path === '/impressum') return { type: 'impressum' }
  if (path === '/datenschutz') return { type: 'datenschutz' }
  if (path === '/agb') return { type: 'agb' }
  if (path === '/widerruf') return { type: 'widerruf' }
  if (path === '/ki-transparenz') return { type: 'ki-transparenz' }
  if (path === '/barrierefreiheit') return { type: 'barrierefreiheit' }
  if (path === '/beispiel-analyse') return { type: 'beispiel-analyse', variant: 'standard' }
  if (path === '/beispiel-premium-report') return { type: 'beispiel-analyse', variant: 'premium' }
  if (path === '/grunderwerbsteuer-rechner') return { type: 'rechner' }
  if (path === '/budgetrechner') return { type: 'budgetrechner' }
  if (path === '/tilgungsrechner') return { type: 'tilgungsrechner' }
  if (path === '/notarkosten-rechner') return { type: 'notarkosten' }
  if (path === '/mieten-oder-kaufen-rechner') return { type: 'mieten-oder-kaufen' }
  if (path === '/mietrendite-rechner') return { type: 'mietrendite' }
  if (path === '/instandhaltungsruecklage-rechner') return { type: 'instandhaltung' }
  if (path === '/wohnflaechen-rechner') return { type: 'wohnflaechen' }
  if (path === '/rechner') return { type: 'rechner-hub' }
  if (path === '/kaufnebenkosten-index') return { type: 'kaufnebenkosten-index' }
  if (path === '/expose-pruefen-lassen') return { type: 'expose-pruefen-lassen' }
  const regioMatch = path.match(/^\/kaufnebenkosten-([a-z-]+)$/)
  if (regioMatch && regioForSlug(regioMatch[1])) return { type: 'regional', slug: regioMatch[1] }
  const bodenMatch = path.match(/^\/bodenrichtwert-([a-z-]+)$/)
  if (bodenMatch && regioForSlug(bodenMatch[1])) return { type: 'bodenrichtwert', slug: bodenMatch[1] }
  if (path === '/ueber-uns') return { type: 'ueber-uns' }

  // Blog routing — Kategorie-Hubs VOR dem Artikel-Catch-all matchen
  if (path === '/blog') return { type: 'blog' }
  const themaMatch = path.match(/^\/blog\/thema\/([a-z-]+)$/)
  if (themaMatch && kategorieForSlug(themaMatch[1])) return { type: 'blog-kategorie', slug: themaMatch[1] }
  const blogMatch = path.match(/^\/blog\/(.+)$/)
  if (blogMatch) return { type: 'blog-post', slug: blogMatch[1] }

  return null
}

// ─── Laufende Bestellung merken ───
// Die Analyse wird serverseitig erst abgeholt (und die Ergebnis-Mail erst verschickt),
// wenn ein Browser den Status abfragt. Schließt der Kunde den Tab oder lädt neu, darf
// die Bestellung deshalb nicht "verloren" gehen: session_id bleibt in der URL UND wird
// für ein paar Stunden lokal gemerkt, damit ein späterer Besuch die Abfrage fortsetzt.
const SESSION_KEY = 'immopruef:session'
const SESSION_MAX_AGE_MS = 6 * 60 * 60 * 1000
const SESSION_ID_RE = /^[A-Za-z0-9_-]{8,255}$/

function readSession(): { id: string; ts: number } | null {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const v = JSON.parse(raw) as { id?: unknown; ts?: unknown }
    if (typeof v?.id !== 'string' || !SESSION_ID_RE.test(v.id) || typeof v.ts !== 'number') return null
    if (Date.now() - v.ts > SESSION_MAX_AGE_MS) {
      window.localStorage.removeItem(SESSION_KEY)
      return null
    }
    return { id: v.id, ts: v.ts }
  } catch {
    return null // privates Fenster / Storage gesperrt
  }
}

function rememberSession(id: string) {
  try {
    if (readSession()?.id === id) return // Zeitstempel nicht bei jedem Besuch verlängern
    window.localStorage.setItem(SESSION_KEY, JSON.stringify({ id, ts: Date.now() }))
  } catch {
    // Storage nicht verfügbar — dann bleibt nur die URL
  }
}

function forgetSession() {
  try {
    window.localStorage.removeItem(SESSION_KEY)
  } catch {
    // Storage nicht verfügbar
  }
}

// Abfrage-Takt: erst zügig, dann gemächlicher; insgesamt lange genug für Premium-Reports
// und automatische Server-Retries.
const POLL_FAST_MS = 6 * 60 * 1000
const POLL_MAX_MS = 45 * 60 * 1000
const POLL_FAILURES_BEFORE_ERROR = 12
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

// Erste Ansicht direkt aus der URL — kein Aufblitzen der Startseite auf Unterseiten.
function initialView(): AppView {
  const route = resolveRoute(window.location.pathname)
  if (route) return route
  const params = new URLSearchParams(window.location.search)
  const sessionId = params.get('session_id')
  if (sessionId && SESSION_ID_RE.test(sessionId)) return { type: 'loading', sessionId }
  if (params.get('result')) return { type: 'permalink-loading' }
  return { type: 'landing' }
}

export default function App() {
  const [view, setView] = useState<AppView>(initialView)
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' | 'neutral' } | null>(null)
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const [progress, setProgress] = useState<{ completed: number; total: number } | null>(null)
  // Bestellung, deren Status gerade abgefragt wird. order = fertiges Ergebnis, das noch
  // nicht angezeigt wurde, weil der Nutzer inzwischen eine andere Seite offen hat.
  const [job, setJob] = useState<{ sessionId: string; order: OrderResult | null } | null>(null)

  const viewRef = useRef<AppView>(view)
  useEffect(() => { viewRef.current = view }, [view])
  const pollRun = useRef(0)

  const startPolling = useCallback(async (sessionId: string, mode: 'foreground' | 'background' = 'foreground') => {
    // Jeder Start entwertet ältere Läufe (Doppel-Start, Zurück-Button, neuer Versuch).
    const run = ++pollRun.current
    const alive = () => pollRun.current === run
    // Die Ansicht wird nur umgeschaltet, solange der Nutzer wirklich auf dem Ladebildschirm
    // DIESER Bestellung ist — wer inzwischen weitergeklickt hat, bekommt einen Hinweis-Balken.
    const inForeground = () => {
      const v = viewRef.current
      return v.type === 'loading' && v.sessionId === sessionId
    }

    rememberSession(sessionId)
    setLoadingError(null)
    setTimedOut(false)
    setProgress(null)
    setJob({ sessionId, order: null })
    if (mode === 'foreground') {
      const next: AppView = { type: 'loading', sessionId }
      viewRef.current = next
      setView(next)
    }

    const startedAt = Date.now()
    let failures = 0
    while (Date.now() - startedAt < POLL_MAX_MS) {
      try {
        const result = await pollAnalysis(sessionId)
        if (!alive()) return
        failures = 0
        if (result.order_status === 'completed' || result.order_status === 'failed') {
          if (inForeground()) {
            forgetSession()
            setJob(null)
            setView({ type: 'results', order: result, sessionId })
          } else {
            setJob({ sessionId, order: result })
          }
          return
        }
        // Track progress for multi-URL orders
        if (result.analyses?.length > 0) {
          const done = result.analyses.filter((a: { status: string }) => a.status === 'completed' || a.status === 'failed').length
          setProgress({ completed: done, total: result.analyses.length })
        }
      } catch (err) {
        if (!alive()) return
        if ((err as { status?: number })?.status === 404) {
          // Unbekannte Bestellung (falscher/abgeschnittener Link) — nicht endlos weiterfragen.
          forgetSession()
          setJob(null)
          if (inForeground()) {
            setView({ type: 'error', message: 'Zu diesem Link haben wir keine Bestellung gefunden. Bitte öffnen Sie den Link vollständig oder schreiben Sie uns an info@immopruef.de.' })
          }
          return
        }
        failures++
        console.warn('[startPolling] poll failed, retrying:', err)
        if (failures >= POLL_FAILURES_BEFORE_ERROR) {
          if (inForeground()) {
            setLoadingError('Die Verbindung zum Server ist gerade gestört. Ihre Zahlung ist erfasst — bitte prüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.')
          } else {
            setJob(null) // gemerkt bleibt die Bestellung trotzdem: der nächste Besuch fragt weiter
          }
          return
        }
      }
      await sleep(Date.now() - startedAt < POLL_FAST_MS ? 5000 : 10000)
      if (!alive()) return
    }
    if (inForeground()) setTimedOut(true)
    else setJob(null)
  }, [])

  const loadPermalink = useCallback((token: string) => {
    const next: AppView = { type: 'permalink-loading' }
    viewRef.current = next
    setView(next)
    const stillWaiting = () => viewRef.current.type === 'permalink-loading'
    getAnalysisByToken(token).then((analysis) => {
      if (!stillWaiting()) return
      if (analysis?.result && analysis.status === 'completed') {
        setView({ type: 'permalink', analysis })
      } else if (analysis) {
        setView({ type: 'error', message: 'Diese Analyse ist (noch) nicht verfügbar. Bitte versuchen Sie es in ein paar Minuten erneut oder schreiben Sie uns an info@immopruef.de.' })
      } else {
        setView({ type: 'error', message: 'Analyse nicht gefunden.' })
      }
    }).catch(() => {
      if (stillWaiting()) setView({ type: 'error', message: 'Verbindungsfehler.' })
    })
  }, [])

  useEffect(() => {
    // Ansicht aus der Adresszeile ableiten: beim ersten Laden und bei Zurück/Vor im Browser.
    const sync = (initial: boolean) => {
      const route = resolveRoute(window.location.pathname)
      if (route) {
        if (!initial) setView(route) // beim ersten Laden steht sie schon im Startzustand
        return
      }

      const params = new URLSearchParams(window.location.search)
      if (initial && params.has('payment')) {
        if (params.get('payment') === 'cancelled') setToast({ message: 'Zahlung abgebrochen.', variant: 'neutral' })
        // Nur diesen Parameter entfernen. session_id / result bleiben in der URL, damit
        // Neuladen, Lesezeichen und der Link aus der Ergebnis-Mail funktionieren.
        params.delete('payment')
        const qs = params.toString()
        window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : ''))
      }

      const sessionId = params.get('session_id')
      const resultToken = params.get('result')
      if (sessionId && SESSION_ID_RE.test(sessionId)) {
        const v = viewRef.current
        if (!initial && (v.type === 'loading' || v.type === 'results') && v.sessionId === sessionId) return
        startPolling(sessionId)
      } else if (resultToken) {
        loadPermalink(resultToken)
      } else {
        if (!initial) setView({ type: 'landing' })
        // Startseite ohne Parameter: eine noch offene Bestellung im Hintergrund weiter
        // abfragen (holt das Ergebnis serverseitig ab und löst die Ergebnis-Mail aus).
        const remembered = initial ? readSession() : null
        if (remembered) startPolling(remembered.id, 'background')
      }
    }

    sync(true)
    const onPop = () => sync(false)
    window.addEventListener('popstate', onPop)
    const run = pollRun
    return () => {
      window.removeEventListener('popstate', onPop)
      run.current++ // laufende Abfrage beenden (StrictMode-Doppelstart, Unmount)
    }
  }, [startPolling, loadPermalink])

  const handleBack = () => {
    pollRun.current++
    forgetSession()
    setJob(null)
    window.history.pushState({}, '', '/')
    window.scrollTo(0, 0)
    setView({ type: 'landing' })
    setLoadingError(null)
    setTimedOut(false)
  }

  const handleRetry = () => {
    if (view.type === 'loading') {
      startPolling(view.sessionId)
    }
  }

  // Hinweis-Balken → Status bzw. Ergebnis der gemerkten Bestellung öffnen
  const openJob = () => {
    if (!job) return
    const { sessionId, order } = job
    window.history.pushState({}, '', `/?session_id=${encodeURIComponent(sessionId)}`)
    window.scrollTo(0, 0)
    if (order) {
      forgetSession()
      setJob(null)
      setView({ type: 'results', order, sessionId })
    } else {
      setView({ type: 'loading', sessionId }) // die Abfrage läuft bereits weiter
    }
  }

  const showJobBanner = !!job && !((view.type === 'loading' || view.type === 'results') && view.sessionId === job.sessionId)

  return (
    <div className="min-h-screen bg-cream font-body text-ink text-[15px] leading-relaxed overflow-x-hidden">
      <Header />

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}

      <main className="max-w-[820px] mx-auto px-6 py-10">
        {showJobBanner && job && (
          <div role="status" className="no-print mb-6 flex flex-wrap items-center justify-between gap-3 bg-green-light border border-green/20 rounded-lg px-4 py-3 text-sm text-green">
            <span className="font-medium">
              {job.order ? 'Ihre Analyse ist fertig.' : 'Ihre Analyse wird gerade erstellt …'}
            </span>
            <button
              onClick={openJob}
              className="bg-green text-white text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-green-mid transition-colors"
            >
              {job.order ? 'Ergebnis ansehen' : 'Zum Status'}
            </button>
          </div>
        )}

        {view.type === 'landing' && <Landing />}

        {view.type === 'loading' && (
          <ErrorBoundary context="loading-view">
            <LoadingView
              error={loadingError}
              onRetry={handleRetry}
              timedOut={timedOut}
              progress={progress}
            />
          </ErrorBoundary>
        )}

        {view.type === 'results' && (
          <ErrorBoundary context="results-view">
            <ResultsView
              analyses={view.order.analyses}
              sessionId={view.sessionId}
              onBack={handleBack}
              onRetryStarted={() => startPolling(view.sessionId)}
            />
          </ErrorBoundary>
        )}

        {view.type === 'permalink-loading' && (
          <div role="status" className="text-center py-16 text-ink-light text-sm">Analyse wird geladen …</div>
        )}

        {view.type === 'permalink' && view.analysis.result && (
          <ErrorBoundary context="permalink-analysis">
            <div>
              <AnalysisResultView
                result={view.analysis.result}
                options={view.analysis.options}
                url={view.analysis.url}
              />
            </div>
          </ErrorBoundary>
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

        {(view.type === 'impressum' || view.type === 'datenschutz' || view.type === 'agb' || view.type === 'widerruf' || view.type === 'ki-transparenz' || view.type === 'barrierefreiheit' || view.type === 'beispiel-analyse') && (
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
            {view.type === 'widerruf' && <Widerruf />}
            {view.type === 'ki-transparenz' && <KiTransparenz />}
            {view.type === 'barrierefreiheit' && <Barrierefreiheit />}
            {view.type === 'beispiel-analyse' && (
              <ErrorBoundary context={`beispiel:${view.variant}`}>
                <BeispielAnalyse variant={view.variant} />
              </ErrorBoundary>
            )}
          </div>
        )}

        {(view.type === 'rechner' || view.type === 'budgetrechner' || view.type === 'tilgungsrechner' || view.type === 'notarkosten' || view.type === 'mieten-oder-kaufen' || view.type === 'mietrendite' || view.type === 'instandhaltung' || view.type === 'wohnflaechen' || view.type === 'rechner-hub' || view.type === 'kaufnebenkosten-index' || view.type === 'expose-pruefen-lassen' || view.type === 'regional' || view.type === 'bodenrichtwert' || view.type === 'ueber-uns') && (
          <div>
            <button
              onClick={() => { window.history.pushState({}, '', '/'); setView({ type: 'landing' }) }}
              className="text-green text-sm font-medium hover:text-green-mid transition-colors mb-6 flex items-center gap-1"
            >
              ← Zurück zur Startseite
            </button>
            {view.type === 'rechner' && <Rechner />}
            {view.type === 'budgetrechner' && <Budgetrechner />}
            {view.type === 'tilgungsrechner' && <Tilgungsrechner />}
            {view.type === 'notarkosten' && <NotarkostenRechner />}
            {view.type === 'mieten-oder-kaufen' && <MietenOderKaufen />}
            {view.type === 'mietrendite' && <MietrenditeRechner />}
            {view.type === 'instandhaltung' && <InstandhaltungRechner />}
            {view.type === 'wohnflaechen' && <WohnflaechenRechner />}
            {view.type === 'rechner-hub' && <RechnerHub />}
            {view.type === 'kaufnebenkosten-index' && <KaufnebenkostenIndex />}
            {view.type === 'expose-pruefen-lassen' && <ExposePruefenLassen />}
            {view.type === 'regional' && <RegionalKaufnebenkosten slug={view.slug} />}
            {view.type === 'bodenrichtwert' && <BodenrichtwertLand slug={view.slug} />}
            {view.type === 'ueber-uns' && <UeberUns />}
          </div>
        )}

        {/* Blog */}
        {view.type === 'blog-kategorie' && <BlogKategorie slug={view.slug} />}

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
            <ErrorBoundary context={`blog-post:${view.slug}`}>
              <Suspense fallback={<div className="text-center py-16 text-ink-light text-sm">Artikel wird geladen...</div>}>
                <BlogLayout meta={meta}>
                  <PostComponent />
                </BlogLayout>
              </Suspense>
            </ErrorBoundary>
          )
        })()}
      </main>

      <footer className="text-center text-[11px] text-ink-light py-6 border-t border-ink/10 mt-10 mx-6">
        <p className="mb-2">KI-Analyse auf Basis öffentlich verfügbarer Daten · Keine Gewähr für Vollständigkeit oder Richtigkeit</p>
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 max-w-full">
          <a href="/expose-pruefen-lassen" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/expose-pruefen-lassen'); setView({ type: 'expose-pruefen-lassen' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Exposé prüfen lassen</a>
          <span className="text-ink/20">·</span>
          <a href="/blog" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/blog'); setView({ type: 'blog' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Blog</a>
          <span className="text-ink/20">·</span>
          <a href="/rechner" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/rechner'); setView({ type: 'rechner-hub' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Rechner</a>
          <span className="text-ink/20">·</span>
          <a href="/kaufnebenkosten-index" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/kaufnebenkosten-index'); setView({ type: 'kaufnebenkosten-index' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Kaufnebenkosten je Bundesland</a>
          <span className="text-ink/20">·</span>
          <a href="/ueber-uns" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/ueber-uns'); setView({ type: 'ueber-uns' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Über uns</a>
          <span className="text-ink/20">·</span>
          <a href="/ki-transparenz" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/ki-transparenz'); setView({ type: 'ki-transparenz' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">KI-Transparenz</a>
          <span className="text-ink/20">·</span>
          <a href="/impressum" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/impressum'); setView({ type: 'impressum' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Impressum</a>
          <span className="text-ink/20">·</span>
          <a href="/datenschutz" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/datenschutz'); setView({ type: 'datenschutz' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Datenschutz</a>
          <span className="text-ink/20">·</span>
          <a href="/agb" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/agb'); setView({ type: 'agb' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">AGB</a>
          <span className="text-ink/20">·</span>
          <a href="/widerruf" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/widerruf'); setView({ type: 'widerruf' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Widerruf</a>
          <span className="text-ink/20">·</span>
          <a href="/barrierefreiheit" onClick={(e) => { e.preventDefault(); window.history.pushState({}, '', '/barrierefreiheit'); setView({ type: 'barrierefreiheit' }); window.scrollTo(0, 0) }} className="hover:text-green transition-colors">Barrierefreiheit</a>
        </div>
      </footer>
    </div>
  )
}
