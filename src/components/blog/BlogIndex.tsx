import type { BlogMeta } from './BlogLayout'
import { BLOG_POSTS } from './posts'
import { useSEO, breadcrumbSchema } from '../../lib/useSEO'

interface BlogIndexProps {
  onNavigate: (slug: string) => void
}

export default function BlogIndex({ onNavigate }: BlogIndexProps) {
  useSEO({
    title: 'Blog: Ratgeber & Tipps zum Immobilienkauf',
    description: '36 Ratgeber rund um Exposé-Prüfung, Preisbewertung, Energieausweis, Standortanalyse und Finanzierung. Fundiertes Wissen für Käufer in Deutschland.',
    canonical: 'https://immopruef.de/blog',
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'ImmoPrüf Blog — Ratgeber zum Immobilienkauf',
        url: 'https://immopruef.de/blog',
        description: 'Blog-Übersicht mit 36 Ratgebern zum Immobilienkauf in Deutschland',
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
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-semibold text-green mb-2">Blog</h1>
        <p className="text-ink-mid text-sm">Ratgeber, Tipps und Wissen rund um den Immobilienkauf</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {BLOG_POSTS.map((post: BlogMeta) => (
          <button
            key={post.slug}
            onClick={() => onNavigate(post.slug)}
            className="text-left bg-white border border-ink/10 rounded-xl overflow-hidden hover:border-green/30 hover:shadow-md transition-all group flex flex-col"
          >
            {/* Thumbnail */}
            <div className="h-36 bg-gradient-to-br from-green/10 to-green/5 flex items-center justify-center border-b border-ink/8 overflow-hidden">
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={144}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <span className="text-4xl">{post.tags[0] === 'Kaufratgeber' ? '🏠' : post.tags[0] === 'Finanzierung' ? '💰' : post.tags[0] === 'Energie' ? '⚡' : post.tags[0] === 'Standort' ? '📍' : post.tags[0] === 'Recht' ? '⚖️' : post.tags[0] === 'Checkliste' ? '✅' : '📋'}</span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex gap-1.5 mb-2">
                {post.tags.map((tag) => (
                  <span key={tag} className="bg-green/8 text-green text-[9px] font-medium px-2 py-0.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-display text-[15px] font-semibold text-ink group-hover:text-green transition-colors mb-2 leading-snug">
                {post.title}
              </h2>
              <p className="text-xs text-ink-mid leading-relaxed mb-3 flex-1">{post.description}</p>
              <div className="flex items-center gap-2 text-[10px] text-ink-light mt-auto pt-2 border-t border-ink/8">
                <time>{post.date}</time>
                <span className="text-ink/20">·</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
