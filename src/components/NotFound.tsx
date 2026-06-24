import { useSEO } from '../lib/useSEO'

interface NotFoundProps {
  // optionaler Kontext, z.B. nicht gefundener Blog-Artikel
  message?: string
}

// 404-Ansicht — wird für unbekannte Routen und nicht gefundene Blog-Artikel
// gerendert. Setzt noindex, damit Google diese dünnen/leeren Seiten nicht
// als Soft-404 indexiert.
export default function NotFound({ message }: NotFoundProps) {
  useSEO({
    title: 'Seite nicht gefunden',
    description: 'Die aufgerufene Seite existiert nicht oder wurde verschoben.',
    canonical: 'https://immopruef.de/404',
    noindex: true,
  })

  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <div className="font-display text-5xl font-semibold text-green mb-3">404</div>
      <h1 className="text-xl font-medium text-ink mb-2">Seite nicht gefunden</h1>
      <p className="text-ink-mid text-sm mb-6">
        {message || 'Die aufgerufene Seite existiert nicht oder wurde verschoben.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
        <a href="/" className="bg-green text-cream font-medium px-5 py-2.5 rounded-lg hover:bg-green-mid transition-colors">
          Zur Startseite
        </a>
        <a href="/blog" className="text-green hover:text-green-mid font-medium">Ratgeber</a>
        <span className="text-ink/20">·</span>
        <a href="/rechner" className="text-green hover:text-green-mid font-medium">Rechner</a>
      </div>
    </div>
  )
}
