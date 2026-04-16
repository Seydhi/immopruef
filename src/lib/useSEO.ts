import { useEffect } from 'react'

export interface SEOMeta {
  title: string
  description: string
  canonical?: string                  // z.B. "https://immopruef.de/blog/expose-pruefen"
  image?: string                      // absolute URL für OG/Twitter
  type?: 'website' | 'article'        // OG type
  publishedTime?: string              // ISO 8601 für Article
  modifiedTime?: string               // ISO 8601 für Article
  tags?: string[]                     // Article tags
  jsonLd?: object | object[]          // Schema.org JSON-LD
}

const SITE_NAME = 'ImmoPrüf'
const SITE_URL = 'https://immopruef.de'
const DEFAULT_IMAGE = 'https://immopruef.de/og-image.png'

/**
 * useSEO — setzt <title>, <meta>, <link rel="canonical"> und JSON-LD
 * dynamisch beim Mount + Cleanup beim Unmount.
 *
 * Funktioniert auch ohne SSR — Client-side updates lassen Google die richtigen
 * Werte sehen (JS-Rendering). Für Social-Sharing-Crawler braucht es zusätzlich
 * Pre-Rendering (siehe Phase 3).
 */
export function useSEO(meta: SEOMeta): void {
  useEffect(() => {
    const fullTitle = meta.title.includes(SITE_NAME) ? meta.title : `${meta.title} | ${SITE_NAME}`
    document.title = fullTitle

    // Standard meta description
    setMeta('description', meta.description)

    // Canonical URL
    const canonical = meta.canonical || `${SITE_URL}${window.location.pathname}`
    setLink('canonical', canonical)

    // Open Graph
    setMetaProp('og:title', fullTitle)
    setMetaProp('og:description', meta.description)
    setMetaProp('og:url', canonical)
    setMetaProp('og:type', meta.type || 'website')
    setMetaProp('og:image', meta.image || DEFAULT_IMAGE)
    setMetaProp('og:site_name', SITE_NAME)
    setMetaProp('og:locale', 'de_DE')

    // Article-spezifische OG-Tags
    if (meta.type === 'article') {
      if (meta.publishedTime) setMetaProp('article:published_time', meta.publishedTime)
      if (meta.modifiedTime) setMetaProp('article:modified_time', meta.modifiedTime)
      if (meta.tags) {
        // Erst alte article:tag entfernen
        document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove())
        meta.tags.forEach(tag => {
          const m = document.createElement('meta')
          m.setAttribute('property', 'article:tag')
          m.setAttribute('content', tag)
          document.head.appendChild(m)
        })
      }
    }

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image', 'name')
    setMeta('twitter:title', fullTitle, 'name')
    setMeta('twitter:description', meta.description, 'name')
    setMeta('twitter:image', meta.image || DEFAULT_IMAGE, 'name')

    // JSON-LD Strukturierte Daten
    // Erst ALLE bestehenden useSEO-managed Scripts löschen (von vorheriger Seite)
    document.querySelectorAll('script[data-useseo="1"]').forEach(el => el.remove())
    if (meta.jsonLd) {
      const items = Array.isArray(meta.jsonLd) ? meta.jsonLd : [meta.jsonLd]
      items.forEach((data) => {
        const script = document.createElement('script')
        script.type = 'application/ld+json'
        script.setAttribute('data-useseo', '1')
        script.text = JSON.stringify(data)
        document.head.appendChild(script)
      })
    }

    // Cleanup beim Unmount: alle useSEO-managed Scripts entfernen
    return () => {
      document.querySelectorAll('script[data-useseo="1"]').forEach(el => el.remove())
      // Article-tags zurücksetzen für nächste Seite
      if (meta.type === 'article') {
        document.querySelectorAll('meta[property="article:tag"]').forEach(el => el.remove())
      }
    }
  }, [meta.title, meta.description, meta.canonical, meta.image, meta.type, meta.publishedTime, meta.modifiedTime, meta.tags, meta.jsonLd])
}

// ─── Helpers ───

function setMeta(name: string, content: string, attr: 'name' | 'property' = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setMetaProp(prop: string, content: string) {
  setMeta(prop, content, 'property')
}

function setLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// ─── JSON-LD Schema-Builder ───

export function articleSchema(opts: {
  title: string
  description: string
  url: string
  image?: string
  datePublished?: string
  dateModified?: string
  tags?: string[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    image: opts.image || DEFAULT_IMAGE,
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    // Schema.org accepts both array and CSV — array is preferred per spec
    keywords: opts.tags && opts.tags.length > 0 ? opts.tags : undefined,
    inLanguage: 'de-DE',
  }
}

export function breadcrumbSchema(items: { name: string; url: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

export function organizationSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'KI-gestützte Immobilienanalyse für Käufer in Deutschland — Preisbewertung, Standortanalyse, Finanzierungs-Check und mehr.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@immopruef.com',
      contactType: 'customer support',
      areaServed: 'DE',
      availableLanguage: ['de'],
    },
  }
}

export function webSiteSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: 'de-DE',
    publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
  }
}

export function productSchema(): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'ImmoPrüf KI-Immobilienanalyse',
    description: 'KI-gestützte Analyse einer Immobilie aus dem Exposé — Preisbewertung, Standort, Finanzierung, Risiken in einem Report.',
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: [
      { '@type': 'Offer', name: '1 Analyse', price: '19.00', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: SITE_URL },
      { '@type': 'Offer', name: '2 Analysen', price: '29.00', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: SITE_URL },
      { '@type': 'Offer', name: '3 Analysen', price: '34.00', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: SITE_URL },
      { '@type': 'Offer', name: 'Premium-Report', price: '79.00', priceCurrency: 'EUR', availability: 'https://schema.org/InStock', url: SITE_URL },
    ],
  }
}

export function faqSchema(items: { question: string; answer: string }[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  }
}
