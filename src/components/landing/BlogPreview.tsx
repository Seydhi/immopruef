import { BLOG_POSTS } from '../blog/posts'

// Zeigt die 6 neuesten Blog-Posts als Vorschau-Karten am Ende der Landing.
// Wichtig für SEO: Crawler entdecken über prominente Links auf der Startseite
// die wichtigsten Blog-URLs schneller als nur über die Sitemap.

export default function BlogPreview() {
  const posts = BLOG_POSTS.slice(0, 6)

  return (
    <section className="max-w-[820px] mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
        <div>
          <div className="text-[10px] text-ink-light tracking-[0.2em] uppercase mb-1.5">Blog</div>
          <h2 className="font-display text-2xl sm:text-3xl font-medium text-ink leading-tight">
            Aktuelle Ratgeber zum Immobilienkauf
          </h2>
        </div>
        <a
          href="/blog"
          className="text-sm text-green hover:text-green-mid font-medium inline-flex items-center gap-1 group"
        >
          Alle 36 Artikel ansehen
          <span className="transition-transform group-hover:translate-x-0.5">→</span>
        </a>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((p) => (
          <a
            key={p.slug}
            href={`/blog/${p.slug}`}
            className="group bg-white border border-ink/10 rounded-xl overflow-hidden hover:border-green/30 hover:shadow-md transition-all flex flex-col"
          >
            {/* Thumbnail */}
            {p.image && (
              <div className="h-32 overflow-hidden bg-cream">
                <img
                  src={p.image}
                  alt={p.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4 flex flex-col flex-1">
              <div className="flex gap-1.5 mb-2">
                {p.tags.slice(0, 2).map((tag) => (
                  <span
                    key={tag}
                    className="bg-green/8 text-green text-[9px] font-medium px-2 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="font-display text-[15px] font-semibold text-ink group-hover:text-green transition-colors mb-2 leading-snug">
                {p.title}
              </h3>
              <p className="text-xs text-ink-mid leading-relaxed mb-3 flex-1">
                {p.description.length > 120
                  ? p.description.slice(0, 120) + '…'
                  : p.description}
              </p>
              <div className="flex items-center gap-2 text-[10px] text-ink-light mt-auto pt-2 border-t border-ink/8">
                <time>{p.date}</time>
                <span className="text-ink/20">·</span>
                <span>{p.readTime} Lesezeit</span>
              </div>
            </div>
          </a>
        ))}
      </div>

      {/* CTA Footer */}
      <div className="mt-8 text-center">
        <a
          href="/blog"
          className="inline-flex items-center gap-2 bg-cream-dark hover:bg-cream-dark/70 border border-ink/15 text-ink text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          Alle Ratgeber durchsuchen
          <span>→</span>
        </a>
      </div>
    </section>
  )
}
