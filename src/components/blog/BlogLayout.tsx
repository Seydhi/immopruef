import type { ReactNode } from 'react'
import { BLOG_POSTS } from './posts'
import { useSEO, articleSchema, breadcrumbSchema, faqSchema } from '../../lib/useSEO'

export interface BlogMeta {
  slug: string
  title: string
  description: string
  date: string
  readTime: string
  tags: string[]
  image?: string
  faq?: { question: string; answer: string }[]
}

interface BlogLayoutProps {
  meta: BlogMeta
  children: ReactNode
}

// Konvertiert "11. April 2026" zu ISO 8601 für Schema.org
export function germanDateToIso(date: string): string {
  const months: Record<string, string> = {
    Januar: '01', Februar: '02', März: '03', April: '04', Mai: '05', Juni: '06',
    Juli: '07', August: '08', September: '09', Oktober: '10', November: '11', Dezember: '12',
  }
  const m = date.match(/(\d+)\.\s*([A-Za-zäöüÄÖÜ]+)\s*(\d{4})/)
  if (!m || !months[m[2]]) {
    // Wichtig: Fallback auf "today" macht Schema.org-Daten inkonsistent.
    // Bessere Lösung: Loggen damit Fehler sichtbar werden, festes Fallback-Datum nutzen.
    console.warn(`[BlogLayout] Unparseable date "${date}" — using fallback 2026-01-01`)
    return '2026-01-01T08:00:00+02:00'
  }
  const day = m[1].padStart(2, '0')
  const month = months[m[2]]
  const year = m[3]
  return `${year}-${month}-${day}T08:00:00+02:00`
}

// Rechner-Empfehlungen: zentrale Zuordnung statt 102 Einzel-Edits.
// Interne Links Blog→Rechner sind die wichtigste Autoritäts-Leitung der Seite
// (Audit-Befund: Rechner waren aus Artikeln praktisch unverlinkt).
const RECHNER_SUGGEST: { href: string; label: string; desc: string; match: string[] }[] = [
  { href: '/grunderwerbsteuer-rechner', label: 'Kaufnebenkosten- & Grunderwerbsteuer-Rechner', desc: 'Grunderwerbsteuer, Notar, Grundbuch und Maklerprovision für Ihren Kaufpreis berechnen.', match: ['kaufnebenkosten', 'grunderwerbsteuer', 'maklerprovision', 'nebenkosten', 'provision'] },
  { href: '/notarkosten-rechner', label: 'Notarkosten-Rechner (GNotKG)', desc: 'Notar- und Grundbuchkosten exakt nach GNotKG-Gebührentabelle — inkl. Grundschuld und Umsatzsteuer.', match: ['notarkosten', 'notartermin', 'notar', 'grundbuch', 'grundschuld', 'beurkundung', 'auflassung', 'kaufvertrag'] },
  { href: '/budgetrechner', label: 'Budgetrechner', desc: 'Wie viel Immobilie Einkommen und Eigenkapital tragen — mit Nebenkosten und Puffer.', match: ['eigenkapital', 'budget', 'leisten', 'bonitaet', 'schufa', 'einkommen'] },
  { href: '/tilgungsrechner', label: 'Tilgungsrechner', desc: 'Monatsrate, Restschuld nach Zinsbindung und Gesamtzinsen Ihres Darlehens.', match: ['tilgung', 'annuitaet', 'zinsbindung', 'darlehen', 'baufinanzierung', 'sondertilgung', 'zinsen', 'kredit', 'finanzierung'] },
  { href: '/mieten-oder-kaufen-rechner', label: 'Mieten-oder-Kaufen-Rechner', desc: 'Vermögensvergleich zwischen Kauf und Mieten mit Break-even-Jahr.', match: ['mieten', 'kaufen-oder', 'miete'] },
  { href: '/mietrendite-rechner', label: 'Mietrendite-Rechner', desc: 'Brutto-/Nettomietrendite und Kaufpreisfaktor eines Angebots einordnen.', match: ['mietrendite', 'kapitalanlage', 'vermietung', 'kaufpreisfaktor', 'rendite', 'vermieten'] },
  { href: '/instandhaltungsruecklage-rechner', label: 'Instandhaltungsrücklagen-Rechner', desc: 'Angemessene Rücklage nach Baujahr, Fläche und Zustand kalkulieren.', match: ['ruecklage', 'instandhaltung', 'hausgeld', 'sanierungsstau', 'sanierung', 'modernisierung', 'sonderumlage'] },
  { href: '/wohnflaechen-rechner', label: 'Wohnflächen-Rechner', desc: 'Wohnfläche nach WoFlV korrekt anrechnen — Balkon, Dachschräge, Keller.', match: ['wohnflaeche', 'quadratmeterpreis', 'grundriss', 'flaeche'] },
]

function normalize(s: string): string {
  return s.toLowerCase().replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
}

function findMatchingRechner(meta: BlogMeta, limit = 2) {
  const haystack = normalize(`${meta.slug} ${meta.title} ${meta.tags.join(' ')}`)
  return RECHNER_SUGGEST
    .map((r) => ({ r, score: r.match.filter((kw) => haystack.includes(kw)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.r)
}

// Findet 3 verwandte Posts mit größter Tag-Überlappung
function findRelatedPosts(currentSlug: string, currentTags: string[], limit = 3): BlogMeta[] {
  return BLOG_POSTS
    .filter((p) => p.slug !== currentSlug)
    .map((p) => ({
      post: p,
      score: p.tags.filter((t) => currentTags.includes(t)).length,
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.post)
}

export default function BlogLayout({ meta, children }: BlogLayoutProps) {
  const related = findRelatedPosts(meta.slug, meta.tags)
  const url = `https://immopruef.de/blog/${meta.slug}`
  const isoDate = germanDateToIso(meta.date)

  // Energie-Artikel werden fachlich von Ahmad El Chouli geprüft (real, eingewilligt)
  const energyReviewer = meta.tags.includes('Energie')
    ? {
        '@type': 'Person',
        name: 'Ahmad El Chouli',
        jobTitle: 'Projektingenieur für Energiemanagement',
        url: 'https://immopruef.de/ueber-uns',
      }
    : undefined

  useSEO({
    title: meta.title,
    description: meta.description,
    canonical: url,
    image: meta.image,
    type: 'article',
    publishedTime: isoDate,
    modifiedTime: isoDate,
    tags: meta.tags,
    jsonLd: [
      articleSchema({
        title: meta.title,
        description: meta.description,
        url,
        image: meta.image,
        datePublished: isoDate,
        dateModified: isoDate,
        tags: meta.tags,
        reviewedBy: energyReviewer,
      }),
      breadcrumbSchema([
        { name: 'Startseite', url: 'https://immopruef.de/' },
        { name: 'Blog', url: 'https://immopruef.de/blog' },
        { name: meta.title, url },
      ]),
      ...(meta.faq && meta.faq.length > 0 ? [faqSchema(meta.faq)] : []),
    ],
  })

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
          <time dateTime={isoDate.slice(0, 10)}>{meta.date}</time>
          <span className="text-ink/20">·</span>
          <span>{meta.readTime} Lesezeit</span>
        </div>
        <div className="mt-2 text-xs text-ink-light">
          Von der{' '}
          <a href="/ueber-uns" className="text-green hover:text-green-mid">ImmoPrüf-Redaktion</a>
          {' '}· recherchiert &amp; faktengeprüft
          {meta.tags.includes('Energie') && (
            <>
              {' '}· fachlich geprüft von{' '}
              <a href="/ueber-uns" className="text-green hover:text-green-mid">Ahmad El Chouli</a>
              {' '}(Projektingenieur Energiemanagement)
            </>
          )}
        </div>
        <div className="flex gap-2 mt-3">
          {meta.tags.map((tag) => (
            <span key={tag} className="bg-green/8 text-green text-[10px] font-medium px-2 py-0.5 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      </header>

      {meta.image && (
        <div className="mb-8 rounded-xl overflow-hidden" style={{ aspectRatio: '16 / 9' }}>
          <img
            src={meta.image}
            srcSet={`${meta.image.replace('h=627', 'h=356').replace('w=1200', 'w=680')} 680w, ${meta.image} 1200w`}
            sizes="(max-width: 720px) 100vw, 680px"
            alt={meta.title}
            width={800}
            height={450}
            className="w-full h-48 sm:h-64 object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="async"
          />
        </div>
      )}

      <div className="prose-immo">
        {children}
      </div>

      {/* Passende kostenlose Rechner — interne Verlinkung Blog→Tools */}
      {findMatchingRechner(meta).length > 0 && (
        <aside className="mt-10 bg-green/4 border border-green/15 rounded-xl p-5">
          <h2 className="font-display text-base font-medium text-green mb-3">
            Passende kostenlose Rechner
          </h2>
          <div className="space-y-3">
            {findMatchingRechner(meta).map((r) => (
              <div key={r.href}>
                <a href={r.href} className="text-sm font-medium text-green underline decoration-green/30 hover:decoration-green transition-colors">
                  {r.label}
                </a>
                <p className="text-xs text-ink-mid mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
        </aside>
      )}

      {/* Häufige Fragen — FAQPage-Schema + GEO/AEO-optimiert */}
      {meta.faq && meta.faq.length > 0 && (
        <section className="mt-12 pt-8 border-t border-ink/10">
          <h2 className="font-display text-xl font-medium text-green mb-4">Häufige Fragen</h2>
          <div className="space-y-4">
            {meta.faq.map((item, i) => (
              <div key={i}>
                <h3 className="font-medium text-ink text-[15px] mb-1">{item.question}</h3>
                <p className="text-ink-mid text-sm leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Verwandte Artikel — automatisch via Tag-Überlappung */}
      {related.length > 0 && (
        <section className="mt-14 pt-8 border-t border-ink/10">
          <h2 className="font-display text-xl font-medium text-green mb-1">Weiterlesen</h2>
          <p className="text-xs text-ink-light mb-5">Verwandte Artikel zu {meta.tags.join(' & ')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {related.map((p) => (
              <a
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group bg-white border border-ink/10 rounded-xl overflow-hidden hover:border-green/30 hover:shadow-sm transition-all flex flex-col"
              >
                {p.image && (
                  <div className="h-24 overflow-hidden bg-cream">
                    <img
                      src={p.image}
                      alt={p.title}
                      width={400}
                      height={96}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                )}
                <div className="p-3 flex flex-col flex-1">
                  <div className="flex gap-1 mb-1.5">
                    {p.tags.slice(0, 2).map((t) => (
                      <span key={t} className="bg-green/8 text-green text-[9px] font-medium px-1.5 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                  <h3 className="font-display text-[13px] font-semibold text-ink group-hover:text-green leading-snug mb-1.5">
                    {p.title}
                  </h3>
                  <div className="text-[10px] text-ink-light mt-auto">{p.readTime} Lesezeit</div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* CTA — Exposé-Themen führen auf die Service-LP (Ziel-Keyword), Rest auf die Startseite */}
      <div className="mt-12 bg-green text-cream rounded-xl p-6 text-center">
        <h3 className="font-display text-xl font-medium mb-2">Immobilie gefunden?</h3>
        <p className="text-cream/70 text-sm mb-4">
          {normalize(meta.slug + meta.title).includes('expose')
            ? 'Lassen Sie das Exposé in wenigen Minuten unabhängig prüfen — Link oder PDF genügt.'
            : 'Lassen Sie Ihr Wunschobjekt in 2 Minuten analysieren.'}
        </p>
        <a
          href={normalize(meta.slug + meta.title).includes('expose') ? '/expose-pruefen-lassen' : '/'}
          className="inline-block bg-cream text-green font-medium text-sm px-6 py-2.5 rounded-lg hover:bg-cream/90 transition-colors"
        >
          {normalize(meta.slug + meta.title).includes('expose') ? 'Exposé prüfen lassen' : 'Jetzt Analyse starten'}
        </a>
      </div>
    </article>
  )
}
