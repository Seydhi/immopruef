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
  author?: boolean                    // WebPage-Knoten bekommt den Betreiber als Autor (fachliche Seiten)
}

const SITE_NAME = 'ImmoPrüf'
const SITE_URL = 'https://immopruef.de'
const DEFAULT_IMAGE = 'https://immopruef.de/og-image.png'
// Feste @id-Anker: jede Seite verweist auf dieselbe Organisation/Website,
// damit Suchmaschinen und KI-Systeme alle Seiten einer Entität zuordnen.
export const ORG_ID = `${SITE_URL}/#organization`
export const WEBSITE_ID = `${SITE_URL}/#website`
export const FOUNDER_ID = `${SITE_URL}/ueber-uns#seydhan-cakmak`

const typesOf = (o: object): string[] => {
  const t = (o as { '@type'?: string | string[] })['@type']
  return Array.isArray(t) ? t : t ? [t] : []
}

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
    // Marken-Suffix nur anhängen, wenn der Titel dadurch nicht über ~60 Zeichen
    // rutscht — sonst schneidet Google ihn ohnehin ab und frisst dabei Keywords.
    const withSuffix = `${meta.title} | ${SITE_NAME}`
    const fullTitle = meta.title.includes(SITE_NAME) || withSuffix.length > 60 ? meta.title : withSuffix
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

    // Aktualisierungsdatum auch für Nicht-Artikel-Seiten (Rechner, Länderseiten)
    const ogUpd = document.querySelector('meta[property="og:updated_time"]')
    if (meta.modifiedTime) setMetaProp('og:updated_time', meta.modifiedTime)
    else if (ogUpd) ogUpd.remove()

    // KI-Transparenz (Art. 50 KI-VO): maschinenlesbarer Hinweis, dass Inhalte
    // KI-gestützt entstehen. Bei Artikeln zusätzlich der redaktionelle Status.
    setMeta('ai-generated', meta.type === 'article' ? 'ai-assisted, human-reviewed' : 'ai-assisted')
    setMeta('ai-disclosure', `${SITE_URL}/ki-transparenz`)

    // Twitter Card
    setMeta('twitter:card', 'summary_large_image', 'name')
    setMeta('twitter:title', fullTitle, 'name')
    setMeta('twitter:description', meta.description, 'name')
    setMeta('twitter:image', meta.image || DEFAULT_IMAGE, 'name')

    // JSON-LD Strukturierte Daten
    // Erst ALLE bestehenden useSEO-managed Scripts löschen (von vorheriger Seite)
    document.querySelectorAll('script[data-useseo="1"]').forEach(el => el.remove())
    {
      const items: object[] = meta.jsonLd ? (Array.isArray(meta.jsonLd) ? [...meta.jsonLd] : [meta.jsonLd]) : []
      const present = new Set(items.flatMap(typesOf))
      // Seitenknoten: verbindet jede URL mit Website + Organisation und trägt das Änderungsdatum.
      const hasPage = ['WebPage', 'AboutPage', 'CollectionPage', 'ContactPage', 'BlogPosting', 'Article'].some((t) => present.has(t))
      if (!hasPage) {
        items.push({
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          '@id': `${canonical}#webpage`,
          url: canonical,
          name: fullTitle,
          description: meta.description,
          inLanguage: 'de-DE',
          isPartOf: { '@id': WEBSITE_ID },
          publisher: { '@id': ORG_ID },
          author: meta.author ? { '@id': FOUNDER_ID } : undefined,
          datePublished: meta.publishedTime,
          dateModified: meta.modifiedTime,
        })
      }
      if (!present.has('Organization')) items.push(organizationSchema())
      if (!present.has('WebSite')) items.push(webSiteSchema())
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
  }, [meta.title, meta.description, meta.canonical, meta.image, meta.type, meta.publishedTime, meta.modifiedTime, meta.tags, meta.jsonLd, meta.author])
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
  reviewedBy?: object
  author?: object
  quellen?: { label: string; url: string }[]
}): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    ...(opts.quellen?.length
      ? { citation: opts.quellen.map((q) => ({ '@type': 'CreativeWork', name: q.label, url: q.url })) }
      : {}),
    headline: opts.title,
    description: opts.description,
    image: opts.image || DEFAULT_IMAGE,
    url: opts.url,
    datePublished: opts.datePublished,
    dateModified: opts.dateModified || opts.datePublished,
    // E-E-A-T: benannte Person als Autor (Blog übergibt Seydhan Cakmak),
    // Organisation nur als Fallback für Seiten ohne persönlichen Autor.
    author: opts.author || { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      '@id': ORG_ID,
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@type': 'WebPage', '@id': opts.url },
    // Schema.org accepts both array and CSV — array is preferred per spec
    keywords: opts.tags && opts.tags.length > 0 ? opts.tags : undefined,
    // Fachlicher Reviewer (nur wo wahrheitsgemäß geprüft, z. B. Energie-Artikel)
    reviewedBy: opts.reviewedBy,
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
    '@id': ORG_ID,
    name: SITE_NAME,
    alternateName: ['ImmoPruef', 'immopruef.de'],
    legalName: 'Seydhan Cakmak, handelnd unter Cakmak Digital',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'ImmoPrüf ist ein Online-Tool für private Immobilienkäufer in Deutschland: Aus einem Exposé-Link oder PDF entsteht eine KI-gestützte Ersteinschätzung zu Preis, Kaufnebenkosten, Standort, Risiken und Finanzierung. Dazu kostenlose Immobilien-Rechner und Ratgeber.',
    foundingDate: '2026',
    areaServed: { '@type': 'Country', name: 'Deutschland' },
    knowsAbout: ['Immobilienkauf', 'Exposé-Prüfung', 'Kaufnebenkosten', 'Grunderwerbsteuer', 'Baufinanzierung', 'Bodenrichtwert'],
    founder: {
      '@type': 'Person',
      '@id': FOUNDER_ID,
      name: 'Seydhan Cakmak',
      url: `${SITE_URL}/ueber-uns`,
      sameAs: ['https://www.linkedin.com/in/seydhan-cakmak'],
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Auf dem Paß 10',
      postalCode: '27711',
      addressLocality: 'Osterholz-Scharmbeck',
      addressCountry: 'DE',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'info@immopruef.de',
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
    '@id': WEBSITE_ID,
    name: SITE_NAME,
    alternateName: 'immopruef.de',
    url: SITE_URL,
    inLanguage: 'de-DE',
    publisher: { '@id': ORG_ID },
  }
}

export function productSchema(): object {
  // Digitales Produkt → keine physische Lieferung, kein Widerruf nach Erbringung
  const shippingDetails = {
    '@type': 'OfferShippingDetails',
    shippingRate: { '@type': 'MonetaryAmount', value: '0', currency: 'EUR' },
    shippingDestination: { '@type': 'DefinedRegion', addressCountry: 'DE' },
    deliveryTime: {
      '@type': 'ShippingDeliveryTime',
      handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'HUR' },
      transitTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 0, unitCode: 'HUR' },
    },
  }

  const returnPolicy = {
    '@type': 'MerchantReturnPolicy',
    applicableCountry: 'DE',
    returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
  }

  const makeOffer = (name: string, price: string) => ({
    '@type': 'Offer',
    name,
    price,
    priceCurrency: 'EUR',
    availability: 'https://schema.org/InStock',
    url: SITE_URL,
    shippingDetails,
    hasMerchantReturnPolicy: returnPolicy,
  })

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'ImmoPrüf KI-Immobilienanalyse',
    description: 'KI-gestützte Analyse einer Immobilie aus dem Exposé — Preisbewertung, Standort, Finanzierung, Risiken in einem Report.',
    image: DEFAULT_IMAGE,
    brand: { '@type': 'Brand', name: SITE_NAME },
    offers: [
      makeOffer('1 Analyse', '19.00'),
      makeOffer('2 Analysen', '29.00'),
      makeOffer('3 Analysen', '34.00'),
      makeOffer('Premium-Report', '79.00'),
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
