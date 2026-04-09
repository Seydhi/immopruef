const SUPPORTED_DOMAINS = [
  'immobilienscout24.de',
  'immowelt.de',
  'immonet.de',
  'kleinanzeigen.de',
]

export function isValidPropertyUrl(input: string): boolean {
  try {
    const url = new URL(input)
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
