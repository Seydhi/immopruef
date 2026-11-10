const SUPPORTED_DOMAINS = [
  'immobilienscout24.de',
  'immowelt.de',
  'immonet.de',
  'kleinanzeigen.de',
]

// Aus der Adresszeile kopierte Links kommen oft ohne Schema ("www.immowelt.de/expose/…").
// Die werden ergänzt statt abgelehnt.
export function normalizePropertyUrl(input: string): string {
  const t = input.trim()
  if (!t || /^[a-z][a-z0-9+.-]*:\/\//i.test(t)) return t
  return 'https://' + t.replace(/^\/+/, '')
}

export function isValidPropertyUrl(input: string): boolean {
  try {
    const url = new URL(normalizePropertyUrl(input))
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false
    if (url.username || url.password) return false
    return SUPPORTED_DOMAINS.some(
      (d) => url.hostname === d || url.hostname.endsWith('.' + d)
    )
  } catch {
    return false
  }
}

export const SUPPORTED_PLATFORMS = SUPPORTED_DOMAINS.map((d) =>
  d.replace('.de', '')
).join(', ')
