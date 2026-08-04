// AiImage — Bild-Wrapper mit KI-Kennzeichnung nach Art. 50 KI-VO.
//
// Ist `ai` true, wird das Bild dreifach gekennzeichnet:
//   1. SICHTBAR AUF DEM BILD: Badge-Overlay „KI-generiertes Bild"
//   2. Alternativtext: Hinweis wird an den alt-Text angehängt (Screenreader)
//   3. Maschinenlesbar: data-ai-generated="true" am <figure>
//
// Ist `ai` false/undefined (Regelfall: lizenzierte Stockfotos), wird NICHTS
// gekennzeichnet — ein KI-Label auf einem echten Foto wäre eine Falschangabe.

interface AiImageProps {
  src: string
  alt: string
  ai?: boolean
  className?: string
  wrapperClassName?: string
  wrapperStyle?: React.CSSProperties
  srcSet?: string
  sizes?: string
  width?: number
  height?: number
  loading?: 'eager' | 'lazy'
  fetchPriority?: 'high' | 'low' | 'auto'
  /** 'sm' für Kartenraster, 'md' für den Artikel-Header */
  badgeSize?: 'sm' | 'md'
}

export default function AiImage({
  src, alt, ai = false, className, wrapperClassName, wrapperStyle,
  srcSet, sizes, width, height, loading = 'lazy', fetchPriority, badgeSize = 'md',
}: AiImageProps) {
  // Screenreader sollen die Kennzeichnung genauso erhalten wie sehende Nutzer.
  const altText = ai ? `${alt} (KI-generiertes Bild)` : alt

  return (
    <figure
      className={`relative m-0 ${wrapperClassName ?? ''}`}
      style={wrapperStyle}
      data-ai-generated={ai ? 'true' : undefined}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        alt={altText}
        width={width}
        height={height}
        className={className}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
      />
      {ai && (
        <figcaption
          className={`absolute left-2 bottom-2 z-10 inline-flex items-center gap-1.5 rounded-md
            bg-ink/85 text-cream font-medium tracking-wide backdrop-blur-[2px]
            ring-1 ring-white/25 shadow-sm pointer-events-none
            ${badgeSize === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-[11px]'}`}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={badgeSize === 'sm' ? 'w-2.5 h-2.5' : 'w-3 h-3'}
          >
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4" />
            <circle cx="12" cy="12" r="3.4" />
          </svg>
          KI-generiertes Bild
        </figcaption>
      )}
    </figure>
  )
}
