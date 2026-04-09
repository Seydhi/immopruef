import { useEffect, useState } from 'react'

const STATUS_MESSAGES = [
  'Immobilie wird analysiert…',
  'Marktdaten werden recherchiert…',
  'Standort wird bewertet…',
  'Ergebnisse werden aufbereitet…',
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
        <div className="text-ink-mid text-sm mb-4">
          Zahlung wird verarbeitet. Sie erhalten eine E-Mail sobald die Analyse fertig ist.
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-green text-sm font-medium hover:text-green-mid transition-colors"
          >
            Erneut versuchen
          </button>
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
      <div className="flex items-center justify-center gap-3 bg-green-light border border-green/20 rounded-lg px-5 py-4 inline-flex">
        <div className="w-4 h-4 border-2 border-green/25 border-t-green rounded-full animate-spin shrink-0" />
        <div className="text-sm text-green font-medium">{STATUS_MESSAGES[msgIndex]}</div>
      </div>
    </div>
  )
}
