import { BLOG_POSTS } from './posts'
import { KATEGORIEN, kategorieForSlug } from './kategorien'
import { PostCard } from './BlogIndex'
import { useSEO, breadcrumbSchema } from '../../lib/useSEO'

// Kategorie-Hub (/blog/thema/<slug>): indexierbare Themen-Einstiegsseite.
// Listet alle Artikel eines Tags, verlinkt passende Rechner und die anderen Hubs.

export default function BlogKategorie({ slug }: { slug: string }) {
  const kat = kategorieForSlug(slug)

  // Routing validiert den Slug; Fallback nur zur Sicherheit.
  if (!kat) {
    return (
      <div className="text-center py-16">
        <p className="text-ink-mid text-sm mb-4">Thema nicht gefunden.</p>
        <a href="/blog" className="text-green text-sm font-medium">← Alle Artikel</a>
      </div>
    )
  }

  const posts = BLOG_POSTS.filter((p) => p.tags.includes(kat.tag))
  const url = `https://immopruef.de/blog/thema/${kat.slug}`
  const andere = KATEGORIEN.filter((k) => k.slug !== kat.slug)

  useSEO({
    title: kat.titel,
    description: kat.beschreibung,
    canonical: url,
    type: 'website',
    jsonLd: [
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: kat.titel,
        url,
        description: kat.beschreibung,
        inLanguage: 'de-DE',
        isPartOf: { '@type': 'WebSite', name: 'ImmoPrüf', url: 'https://immopruef.de' },
        mainEntity: {
          '@type': 'ItemList',
          numberOfItems: posts.length,
          itemListElement: posts.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            name: p.title,
            url: `https://immopruef.de/blog/${p.slug}`,
          })),
        },
      },
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Ratgeber', url: 'https://immopruef.de/blog' },
        { name: kat.name, url },
      ]),
    ],
  })

  return (
    <div>
      {/* Sichtbare Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-ink-light">
        <a href="/" className="hover:text-green">Startseite</a>
        <span className="mx-1.5 text-ink/25">/</span>
        <a href="/blog" className="hover:text-green">Ratgeber</a>
        <span className="mx-1.5 text-ink/25">/</span>
        <span className="text-ink-mid">{kat.name}</span>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-ink leading-tight mb-3">{kat.titel}</h1>
        <p className="text-ink-mid text-sm leading-relaxed max-w-[640px]">{kat.intro}</p>
        <p className="text-[12px] text-ink-light mt-2">{posts.length} Ratgeber in diesem Thema</p>
      </header>

      {kat.tools.length > 0 && (
        <div className="mb-8 bg-green/5 border border-green/15 rounded-xl px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px]">
          <span className="font-medium text-green">Passende kostenlose Tools:</span>
          {kat.tools.map((t) => (
            <a key={t.href} href={t.href} className="text-green hover:text-green-mid underline">{t.label}</a>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} postIndex={i} />
        ))}
      </div>

      {/* CTA */}
      <div className="mt-10 bg-green text-cream rounded-xl p-6 text-center">
        <h2 className="font-display text-xl font-medium mb-2">Konkretes Objekt im Blick?</h2>
        <p className="text-cream/70 text-sm mb-4">
          ImmoPrüf prüft aus dem Exposé-Link oder PDF Preis, Kosten, Risiken und Standort — strukturiert statt Bauchgefühl.
        </p>
        <a href="/expose-pruefen-lassen" className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors">
          Exposé prüfen lassen
        </a>
      </div>

      {/* Andere Themen */}
      <section className="mt-10 pt-6 border-t border-ink/10">
        <h2 className="font-display text-base font-medium text-ink mb-3">Weitere Themen</h2>
        <div className="flex flex-wrap gap-x-3 gap-y-1.5">
          {andere.map((k) => (
            <a key={k.slug} href={`/blog/thema/${k.slug}`} className="text-[13px] text-green hover:text-green-mid underline">
              {k.name}
            </a>
          ))}
          <a href="/blog" className="text-[13px] text-ink-mid hover:text-green underline">Alle Artikel</a>
        </div>
      </section>
    </div>
  )
}
