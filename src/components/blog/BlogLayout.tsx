import type { ReactNode } from 'react'

export interface BlogMeta {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  tags: string[]
}

interface BlogLayoutProps {
  meta: BlogMeta
  children: ReactNode
}

export default function BlogLayout({ meta, children }: BlogLayoutProps) {
  return (
    <article className="max-w-[680px] mx-auto">
      <a
        href="/blog"
        className="text-green text-sm font-medium hover:text-green-mid transition-colors mb-6 inline-flex items-center gap-1"
      >
        ← Alle Artikel
      </a>

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">
          {meta.title}
        </h1>
        <div className="flex items-center gap-3 text-xs text-ink-light">
          <time>{meta.date}</time>
          <span className="text-ink/20">·</span>
          <span>{meta.readTime} Lesezeit</span>
        </div>
        <div className="flex gap-2 mt-3">
          {meta.tags.map((tag) => (
            <span key={tag} className="bg-green/8 text-green text-[10px] font-medium px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </header>

      <div className="prose-immo">
        {children}
      </div>

      {/* CTA */}
      <div className="mt-12 bg-green text-cream rounded-xl p-6 text-center">
        <h3 className="font-display text-xl font-medium mb-2">Immobilie gefunden?</h3>
        <p className="text-cream/70 text-sm mb-4">Lassen Sie Ihr Wunschobjekt in 2 Minuten analysieren.</p>
        <a
          href="/"
          className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors"
        >
          Jetzt Analyse starten
        </a>
      </div>
    </article>
  )
}
