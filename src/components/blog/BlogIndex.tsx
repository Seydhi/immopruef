import type { BlogMeta } from './BlogLayout'
import { germanDateToIso } from './BlogLayout'
import { BLOG_POSTS } from './posts'
import { KATEGORIEN } from './kategorien'
import { useSEO, breadcrumbSchema } from '../../lib/useSEO'

interface BlogIndexProps {
  onNavigate: (slug: string) => void
}

// Markenkonforme Themen-Farbwelten für die generierten Cover.
// Ein Foto-Pool von 23 Unsplash-Bildern auf 102 Artikel erzeugte massive
// Dubletten im Raster — generierte Cover sind pro Slug einzigartig und laden ohne externe Requests.
const TAG_ART: Record<string, { bg: string; fg: string; deco: string; pill: string; pillFg: string }> = {
  Kaufratgeber: { bg: '#e8f0ec', fg: '#2d4a3e', deco: '#c3d8cc', pill: '#2d4a3e14', pillFg: '#2d4a3e' },
  Finanzierung: { bg: '#f6ecd4', fg: '#7a5f14', deco: '#e4cf94', pill: '#8a6d1b1a', pillFg: '#7a5f14' },
  Energie: { bg: '#e1f5ee', fg: '#0f6e56', deco: '#aee2cd', pill: '#0f6e5614', pillFg: '#0f6e56' },
  Standort: { bg: '#e9eff2', fg: '#3d5a6b', deco: '#bfd2dc', pill: '#3d5a6b14', pillFg: '#3d5a6b' },
  Recht: { bg: '#efeaf4', fg: '#4a3a5a', deco: '#d4c6e0', pill: '#4a3a5a14', pillFg: '#4a3a5a' },
  Zustand: { bg: '#f6e9e5', fg: '#8a4a3a', deco: '#e4bfb2', pill: '#8a4a3a14', pillFg: '#8a4a3a' },
  Checkliste: { bg: '#eef2e4', fg: '#4a5a2d', deco: '#cfdaae', pill: '#4a5a2d14', pillFg: '#4a5a2d' },
}
const DEFAULT_ART = TAG_ART.Kaufratgeber

// Stroke-Motive (24×24-Raster) je Themenwelt
const TAG_MOTIF: Record<string, string> = {
  Kaufratgeber: 'M3 11.5 L12 4 L21 11.5 M5.5 9.8 V20 H18.5 V9.8 M10 20 V14 H14 V20',
  Finanzierung: 'M3 17 L9 11 L13 14.5 L21 6.5 M16.5 6.5 H21 V11',
  Energie: 'M13 2.5 L5.5 13 H11 L9.5 21.5 L18.5 10.5 H13 Z',
  Standort: 'M12 21 C12 21 5.5 14.5 5.5 9.5 A6.5 6.5 0 1 1 18.5 9.5 C18.5 14.5 12 21 12 21 Z M12 12 m-2.4 0 a2.4 2.4 0 1 0 4.8 0 a2.4 2.4 0 1 0 -4.8 0',
  Recht: 'M12 3 V21 M5 7 H19 M7.5 7 L4.5 13 A3.4 3.4 0 0 0 10.5 13 L7.5 7 M16.5 7 L13.5 13 A3.4 3.4 0 0 0 19.5 13 L16.5 7',
  Zustand: 'M14.8 6.2 A5 5 0 0 0 8.3 12.7 L3 18 V21 H6 L11.3 15.7 A5 5 0 0 0 17.8 9.2 L14.6 12.4 L11.6 9.4 Z',
  Checkliste: 'M4.5 4.5 H19.5 V19.5 H4.5 Z M8 12.5 L11 15.5 L16.5 9',
}

function hashSlug(slug: string): number {
  let h = 7
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0
  return Math.abs(h)
}

function CoverArt({ post }: { post: BlogMeta }) {
  const tag = post.tags[0] || 'Kaufratgeber'
  const art = TAG_ART[tag] || DEFAULT_ART
  const motif = TAG_MOTIF[tag] || TAG_MOTIF.Kaufratgeber
  const h = hashSlug(post.slug)

  // Hash-gesteuerte Komposition: jede Karte bekommt eine eigene Anordnung
  const cx1 = 40 + (h % 140)
  const cy1 = 20 + ((h >> 3) % 110)
  const r1 = 46 + ((h >> 5) % 44)
  const cx2 = 230 + ((h >> 7) % 140)
  const cy2 = 30 + ((h >> 9) % 90)
  const r2 = 30 + ((h >> 11) % 36)
  const bigX = 235 + ((h >> 4) % 70)
  const bigRot = -14 + ((h >> 6) % 29)
  const smallX = 32 + ((h >> 8) % 40)
  const smallY = 42 + ((h >> 10) % 36)
  const flip = (h >> 2) % 2 === 0

  return (
    <svg
      viewBox="0 0 400 144"
      className="w-full h-full"
      role="img"
      aria-label={`Themengrafik: ${tag}`}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="144" fill={art.bg} />
      <circle cx={cx1} cy={cy1} r={r1} fill={art.deco} opacity="0.45" />
      <circle cx={cx2} cy={cy2} r={r2} fill={art.deco} opacity="0.6" />
      <g
        transform={`translate(${flip ? smallX : bigX} ${flip ? 90 : 84}) rotate(${bigRot}) scale(3.4)`}
        opacity="0.16"
      >
        <path d={motif} fill="none" stroke={art.fg} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" transform="translate(-12 -12)" />
      </g>
      <g transform={`translate(${flip ? bigX : smallX} ${flip ? 52 : smallY}) scale(1.6)`}>
        <path d={motif} fill="none" stroke={art.fg} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" transform="translate(-12 -12)" />
      </g>
      <rect x="0" y="140" width="400" height="4" fill={art.fg} opacity="0.25" />
    </svg>
  )
}

// Artikel-Karte — auch von den Kategorie-Hubs (BlogKategorie) genutzt.
// onNavigate optional: ohne Handler navigiert der Link normal (prerenderte Seite).
export function PostCard({ post, postIndex, onNavigate }: { post: BlogMeta; postIndex: number; onNavigate?: (slug: string) => void }) {
  return (
    <a
      href={`/blog/${post.slug}`}
      onClick={onNavigate ? (e) => { e.preventDefault(); onNavigate(post.slug) } : undefined}
      className="text-left bg-white border border-ink/10 rounded-xl overflow-hidden hover:border-green/30 hover:shadow-md transition-all group flex flex-col no-underline"
    >
      {/* Kuratiertes Foto (einzigartig je Artikel); SVG-Cover als Fallback */}
      <div className="h-36 border-b border-ink/8 overflow-hidden">
        <div className="w-full h-full group-hover:scale-105 transition-transform duration-300">
          {post.image ? (
            <img
              /* Pexels-CDN skaliert serverseitig: kleine Karten-Variante statt 1200px (~73 KB → ~15 KB) */
              src={post.image.replace('h=627', 'h=314').replace('w=1200', 'w=600')}
              alt={post.title}
              width={400}
              height={144}
              className="w-full h-full object-cover"
              loading={postIndex < 6 ? 'eager' : 'lazy'}
              decoding="async"
            />
          ) : (
            <CoverArt post={post} />
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex gap-1.5 mb-2 flex-wrap">
          {post.tags.map((tag) => {
            const art = TAG_ART[tag] || DEFAULT_ART
            return (
              <span
                key={tag}
                className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: art.pill, color: art.pillFg }}
              >
                {tag}
              </span>
            )
          })}
        </div>
        <h2 className="font-display text-[15px] font-semibold text-ink group-hover:text-green transition-colors mb-2 leading-snug">
          {post.title}
        </h2>
        <p className="text-xs text-ink-mid leading-relaxed mb-3 flex-1">{post.description}</p>
        <div className="flex items-center gap-2 text-[10px] text-ink-light mt-auto pt-2 border-t border-ink/8">
          <time dateTime={germanDateToIso(post.date).slice(0, 10)}>{post.date}</time>
          <span className="text-ink/20">·</span>
          <span>{post.readTime}</span>
        </div>
      </div>
    </a>
  )
}

export default function BlogIndex({ onNavigate }: BlogIndexProps) {
  const postCount = BLOG_POSTS.length
  useSEO({
    title: 'Blog: Ratgeber & Tipps zum Immobilienkauf',
    description: `${postCount} Ratgeber rund um Exposé-Prüfung, Preisbewertung, Energieausweis, Standortanalyse und Finanzierung. Fundiertes Wissen für Käufer in Deutschland.`,
    canonical: 'https://immopruef.de/blog',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'ImmoPrüf Blog — Ratgeber zum Immobilienkauf',
        url: 'https://immopruef.de/blog',
        description: `Blog-Übersicht mit ${postCount} Ratgebern zum Immobilienkauf in Deutschland`,
        inLanguage: 'de-DE',
        isPartOf: { '@type': 'WebSite', name: 'ImmoPrüf', url: 'https://immopruef.de' },
      },
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Blog', url: 'https://immopruef.de/blog' },
      ]),
    ],
  })

  return (
    <div>
      <div className="mb-6 text-center">
        <h1 className="font-display text-3xl font-semibold text-green mb-2">Blog</h1>
        <p className="text-ink-mid text-sm">Ratgeber, Tipps und Wissen rund um den Immobilienkauf</p>
      </div>

      {/* Themen-Hubs: crawlbare Kategorie-Einstiege */}
      <nav aria-label="Themen" className="mb-8 flex flex-wrap justify-center gap-2">
        {KATEGORIEN.map((k) => {
          const art = TAG_ART[k.tag] || DEFAULT_ART
          const count = BLOG_POSTS.filter((p) => p.tags.includes(k.tag)).length
          return (
            <a
              key={k.slug}
              href={`/blog/thema/${k.slug}`}
              className="text-[12px] font-medium px-3 py-1.5 rounded-full border transition-all hover:shadow-sm"
              style={{ backgroundColor: art.pill, color: art.pillFg, borderColor: `${art.deco}` }}
            >
              {k.name} <span className="opacity-60">({count})</span>
            </a>
          )
        })}
      </nav>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BLOG_POSTS.map((post: BlogMeta, postIndex: number) => (
          <PostCard key={post.slug} post={post} postIndex={postIndex} onNavigate={onNavigate} />
        ))}
      </div>
    </div>
  )
}
