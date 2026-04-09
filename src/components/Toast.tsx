import { useEffect, useState } from 'react'

type ToastVariant = 'success' | 'error' | 'neutral'

interface ToastProps {
  message: string
  variant: ToastVariant
  onDismiss: () => void
  duration?: number
}

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'bg-green-light border-green/20 text-green',
  error: 'bg-red-50 border-red-200 text-red-800',
  neutral: 'bg-cream-dark border-ink/10 text-ink-mid',
}

export default function Toast({ message, variant, onDismiss, duration = 5000 }: ToastProps) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 300)
    }, duration)
    return () => clearTimeout(timer)
  }, [duration, onDismiss])

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-lg border text-sm font-medium shadow-md transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      } ${VARIANT_STYLES[variant]}`}
    >
      {message}
    </div>
  )
}
