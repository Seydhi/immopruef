import { Component, type ReactNode } from 'react'

// Fängt Render-Fehler in Child-Komponenten ab und zeigt einen sauberen Fallback-UI
// statt die ganze App zu crashen (weißer Screen). Kritisch für zahlende Kunden
// die ihren Report nicht sehen könnten wenn eine einzelne Komponente fehlschlägt.

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
  context?: string  // für Logging (z.B. 'analysis-result', 'premium-report')
}

interface State {
  hasError: boolean
  error: Error | null
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string | null }) {
    console.error(`[ErrorBoundary:${this.props.context || 'unknown'}]`, error, errorInfo)
    // TODO: send to analytics/sentry once integrated
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="max-w-[600px] mx-auto my-8 bg-white border border-red-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-3">⚠️</div>
          <h2 className="font-display text-xl font-medium text-ink mb-2">
            Etwas ist schiefgelaufen
          </h2>
          <p className="text-sm text-ink-mid leading-relaxed mb-4">
            Die Anzeige konnte nicht geladen werden. Ihre Analyse ist aber gespeichert —
            Sie erhalten sie per E-Mail. Bei anhaltenden Problemen kontaktieren Sie
            bitte <a href="mailto:info@immopruef.com" className="text-green underline">info@immopruef.com</a>.
          </p>
          {this.state.error?.message && (
            <details className="text-left text-xs text-ink-light bg-cream-dark rounded p-3 mt-3">
              <summary className="cursor-pointer">Technische Details</summary>
              <code className="block mt-2 whitespace-pre-wrap">{this.state.error.message}</code>
            </details>
          )}
          <div className="flex gap-2 justify-center mt-4">
            <button
              onClick={this.handleReset}
              className="bg-green text-cream text-sm font-medium px-4 py-2 rounded-lg hover:bg-green-mid transition-colors"
            >
              Erneut versuchen
            </button>
            <a
              href="/"
              className="bg-cream-dark border border-ink/15 text-ink-mid text-sm font-medium px-4 py-2 rounded-lg hover:bg-cream transition-colors"
            >
              Zur Startseite
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
