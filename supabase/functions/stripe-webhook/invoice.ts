// Rechnungs-PDF für ImmoPrüf (Pflichtangaben nach § 14 Abs. 4 UStG).
// Aussehen: Standard-Layout in den Markenfarben. Ist INVOICE_LETTERHEAD_URL gesetzt
// (z. B. ein aus Canva exportiertes A4-PDF ohne Dynamik), wird dessen erste Seite als
// Hintergrund verwendet und nur die Rechnungsdaten darübergelegt.
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from 'npm:pdf-lib@1.17.1'

export const SELLER = {
  brand: 'ImmoPrüf',
  name: 'Seydhan Cakmak',
  trade: 'Cakmak Digital · Einzelunternehmen',
  street: 'Auf dem Paß 10',
  city: '27711 Osterholz-Scharmbeck',
  country: 'Deutschland',
  email: 'info@immopruef.de',
  phone: '+49 174 8831396',
  web: 'immopruef.de',
  vatId: 'DE462617089',
}

export const PACKAGE_NAMES: Record<string, string> = {
  single: 'ImmoPrüf Quick-Check — KI-gestützte Immobilienanalyse (1 Objekt)',
  double: 'ImmoPrüf Vergleich — KI-gestützte Immobilienanalysen (2 Objekte)',
  triple: 'ImmoPrüf Bestpreis — KI-gestützte Immobilienanalysen (3 Objekte)',
  premium: 'ImmoPrüf Premium-Kaufentscheidungs-Report (1 Objekt)',
}

export function splitGross(grossCents: number, vatRate: number): { net: number; vat: number } {
  const net = Math.round(grossCents / (1 + vatRate / 100))
  return { net, vat: grossCents - net }
}

export interface InvoiceData {
  number: string
  issuedAt: Date
  /** Nur setzen, wenn es vom Rechnungsdatum abweicht (nachträgliche Rechnung) */
  serviceDate?: Date
  customerName?: string | null
  customerEmail?: string | null
  customerAddress?: string[] | null
  description: string
  grossCents: number
  netCents: number
  vatCents: number
  vatRate: number
  orderRef: string
}

const GREEN = rgb(0x1a / 255, 0x3c / 255, 0x2a / 255)
const GOLD = rgb(0xc9 / 255, 0xa8 / 255, 0x4c / 255)
const CREAM = rgb(0xf7 / 255, 0xf5 / 255, 0xf0 / 255)
const INK = rgb(0.13, 0.13, 0.13)
const MID = rgb(0.38, 0.38, 0.38)
const LINE = rgb(0.86, 0.84, 0.8)

const eur = (cents: number) => (cents / 100).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'
const deDate = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Berlin' })

// Standardschriften kennen nur WinAnsi: alles andere ersetzen, statt beim Zeichnen abzustürzen
// (Kundennamen können beliebige Zeichen enthalten).
function safe(text: string, font: PDFFont): string {
  let out = ''
  for (const ch of text.replace(/[\r\n\t]+/g, ' ')) {
    try { font.encodeText(ch); out += ch } catch { out += '?' }
  }
  return out
}

function wrap(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) { lines.push(line); line = word } else line = test
  }
  if (line) lines.push(line)
  return lines
}

export async function renderInvoicePdf(inv: InvoiceData, letterhead?: Uint8Array | null): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  doc.setTitle(`Rechnung ${inv.number}`)
  doc.setAuthor(`${SELLER.brand} — ${SELLER.name}`)
  doc.setCreator(SELLER.brand)
  const page: PDFPage = doc.addPage([595.28, 841.89])
  const { width, height } = page.getSize()
  const reg = await doc.embedFont(StandardFonts.Helvetica)
  const bold = await doc.embedFont(StandardFonts.HelveticaBold)
  const L = 56
  const R = width - 56

  const T = (s: string, x: number, y: number, o: { f?: PDFFont; size?: number; color?: ReturnType<typeof rgb>; right?: boolean } = {}) => {
    const f = o.f ?? reg, size = o.size ?? 10
    const t = safe(s, f)
    page.drawText(t, { x: o.right ? x - f.widthOfTextAtSize(t, size) : x, y, font: f, size, color: o.color ?? INK })
  }

  let hasLetterhead = false
  if (letterhead) {
    try {
      const [bg] = await doc.embedPdf(letterhead, [0])
      page.drawPage(bg, { x: 0, y: 0, width, height })
      hasLetterhead = true
    } catch (e) {
      console.warn('Briefpapier nicht nutzbar — Standard-Layout:', e)
    }
  }

  if (!hasLetterhead) {
    page.drawRectangle({ x: 0, y: height - 92, width, height: 92, color: GREEN })
    const immo = 'Immo'
    page.drawText(immo, { x: L, y: height - 56, font: bold, size: 24, color: CREAM })
    page.drawText(safe('Prüf', bold), { x: L + bold.widthOfTextAtSize(immo, 24), y: height - 56, font: bold, size: 24, color: GOLD })
    T('KI-gestützte Immobilienanalyse', L, height - 74, { size: 9, color: CREAM })
  }

  // Absenderzeile + Empfänger
  let y = height - 132
  T(`${SELLER.name} · ${SELLER.trade.split(' · ')[0]} · ${SELLER.street} · ${SELLER.city}`, L, y, { size: 7.5, color: MID })
  y -= 18
  const recipient = [inv.customerName, ...(inv.customerAddress ?? [])].filter(Boolean) as string[]
  if (!recipient.length && inv.customerEmail) recipient.push(inv.customerEmail)
  for (const l of recipient.slice(0, 5)) { T(l, L, y); y -= 14 }

  // Rechnungsdaten rechts
  const metaX = R - 170
  let my = height - 150
  for (const [k, v] of [
    ['Rechnungsnummer', inv.number],
    ['Rechnungsdatum', deDate(inv.issuedAt)],
    ['Leistungsdatum', deDate(inv.serviceDate ?? inv.issuedAt)],
    ['Bestellreferenz', inv.orderRef],
  ]) {
    T(k, metaX, my, { size: 8.5, color: MID })
    T(v, R, my, { size: 8.5, right: true, f: k === 'Rechnungsnummer' ? bold : reg })
    my -= 14
  }

  // Titel
  y = Math.min(y, my) - 34
  T('Rechnung', L, y, { f: bold, size: 20, color: GREEN })
  y -= 20
  T('Vielen Dank für Ihre Bestellung. Wir berechnen Ihnen die folgende Leistung:', L, y, { color: MID })

  // Tabelle
  y -= 28
  page.drawRectangle({ x: L, y: y - 6, width: R - L, height: 22, color: CREAM })
  T('Pos.', L + 8, y, { f: bold, size: 9 })
  T('Beschreibung', L + 42, y, { f: bold, size: 9 })
  T('Menge', R - 150, y, { f: bold, size: 9, right: true })
  T('Betrag (netto)', R - 8, y, { f: bold, size: 9, right: true })
  y -= 26
  T('1', L + 8, y)
  T('1', R - 150, y, { right: true })
  T(eur(inv.netCents), R - 8, y, { right: true })
  for (const l of wrap(inv.description, reg, 10, R - 150 - 40 - (L + 42))) { T(l, L + 42, y); y -= 14 }
  y -= 8
  page.drawLine({ start: { x: L, y }, end: { x: R, y }, thickness: 0.7, color: LINE })

  // Summen
  y -= 20
  const sumX = R - 210
  T('Nettobetrag', sumX, y); T(eur(inv.netCents), R - 8, y, { right: true })
  y -= 16
  T(`Umsatzsteuer ${String(inv.vatRate).replace('.', ',')} %`, sumX, y); T(eur(inv.vatCents), R - 8, y, { right: true })
  y -= 10
  page.drawLine({ start: { x: sumX, y }, end: { x: R, y }, thickness: 0.7, color: LINE })
  y -= 18
  T('Gesamtbetrag', sumX, y, { f: bold, size: 12, color: GREEN })
  T(eur(inv.grossCents), R - 8, y, { f: bold, size: 12, color: GREEN, right: true })

  // Zahlungshinweis
  y -= 40
  T('Der Betrag wurde bereits online bezahlt. Es ist keine weitere Zahlung erforderlich.', L, y)
  y -= 14
  if (!inv.serviceDate || deDate(inv.serviceDate) === deDate(inv.issuedAt)) T('Das Leistungsdatum entspricht dem Rechnungsdatum.', L, y, { color: MID, size: 9 })

  // Fußzeile mit Pflichtangaben (auch auf Briefpapier, weil rechtlich erforderlich)
  const fy = 74
  page.drawLine({ start: { x: L, y: fy + 16 }, end: { x: R, y: fy + 16 }, thickness: 0.7, color: LINE })
  const colX = [L, L + (R - L) * 0.45, L + (R - L) * 0.78]
  const footer: string[][] = [
    [SELLER.name, SELLER.trade, `${SELLER.street}, ${SELLER.city}`],
    [`E-Mail: ${SELLER.email}`, `Telefon: ${SELLER.phone}`, `Web: ${SELLER.web}`],
    [`USt-IdNr.: ${SELLER.vatId}`],
  ]
  footer.forEach((lines, i) => lines.forEach((l, j) => T(l, colX[i], fy - j * 11, { size: 7.5, color: MID })))

  return await doc.save()
}

export function toBase64(bytes: Uint8Array): string {
  const parts: string[] = []
  for (let i = 0; i < bytes.length; i += 32768) parts.push(String.fromCharCode(...bytes.subarray(i, i + 32768)))
  return btoa(parts.join(''))
}
