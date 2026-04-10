import { useEffect, useState } from 'react'

const STATUS_MESSAGES = [
  'Zahlung wird bestätigt…',
  'Immobilie wird analysiert…',
  'Marktdaten werden recherchiert…',
  'Bodenrichtwerte werden abgeglichen…',
  'Standort wird bewertet…',
  'Energieanalyse wird erstellt…',
  'Finanzierung wird durchgerechnet…',
  'Risikobewertung läuft…',
  'Ergebnisse werden aufbereitet…',
  'Fast fertig — noch wenige Sekunden…',
]

interface LoadingViewProps {
  error?: string | null
  onRetry?: () => void
  timedOut?: boolean
}

export default function LoadingView({ error, onRetry, timedOut }: LoadingViewProps) {
  const [msgIndex, setMsgIndex] = useState(0)

  useEffect(() => {
    if (error || timedOut) return
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % STATUS_MESSAGES.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [error, timedOut])

  if (timedOut) {
    return (
      <div className="text-center py-16">
        <div className="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 inline-block mb-4">
          <div className="text-amber-800 text-sm font-medium mb-1">Die Analyse dauert etwas länger als erwartet</div>
          <div className="text-amber-700 text-xs">Keine Sorge — Ihre Zahlung wurde erfasst. Bitte versuchen Sie es in ein paar Minuten erneut.</div>
        </div>
        {onRetry && (
          <div>
            <button
              onClick={onRetry}
              className="bg-green text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-green-mid transition-colors"
            >
              Ergebnis laden
            </button>
          </div>
        )}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 border border-red-200 rounded-lg px-5 py-4 text-red-800 text-sm inline-block mb-4">
          {error}
        </div>
        {onRetry && (
          <div>
            <button
              onClick={onRetry}
              className="text-green text-sm font-medium hover:text-green-mid transition-colors"
            >
              Erneut versuchen
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="text-center py-16">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center justify-center gap-3 bg-green-light border border-green/20 rounded-lg px-5 py-4 inline-flex">
          <div className="w-4 h-4 border-2 border-green/25 border-t-green rounded-full animate-spin shrink-0" />
          <div className="text-sm text-green font-medium">{STATUS_MESSAGES[msgIndex]}</div>
        </div>
        <p className="text-ink-light text-xs">Die Analyse dauert ca. 1–2 Minuten pro Immobilie. Bitte haben Sie einen Moment Geduld.</p>
      </div>
    </div>
  )
}
