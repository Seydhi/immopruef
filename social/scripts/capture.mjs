// Nimmt hochaufgelöste Ganzseiten-Screenshots (Handy-Ansicht) der Live-Seite und des
// Demo-Exposés auf und speichert die Positionen wichtiger Elemente, damit Remotion
// exakt dorthin zoomen, scrollen und tippen kann.
//   node scripts/capture.mjs [--base=https://immopruef.de]
import puppeteer from 'puppeteer'
import { writeFileSync, mkdirSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const OUT = join(HERE, '..', 'public', 'shots')
mkdirSync(OUT, { recursive: true })
const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const BASE = args.base || 'https://immopruef.de'
const W = 430
const DPR = 3

// Ziele: Seite, Name, Elemente (per CSS-Selektor oder Überschriften-Text)
const TARGETS = [
  {
    name: 'expose',
    url: pathToFileURL(join(HERE, '..', 'public', 'expose', 'reihenhaus.html')).href,
    marks: { css: '[data-mark]' },
  },
  {
    name: 'home',
    url: BASE + '/',
    marks: { headings: ['Immobilien', 'Analyse starten', 'Was Sie bekommen'], buttons: ['Angebotslink einfügen', 'Link zum Inserat', 'PDF / Fotos hochladen'], inputs: ['input[type=url]', 'input[type=email]'] },
    maxHeight: 2600,
  },
  {
    name: 'analyse',
    url: BASE + '/beispiel-analyse',
    marks: {
      headings: ['Wo liegt der Preis?', 'Was kostet es insgesamt?', 'Zustand & Energie', 'Risiken & Fallstricke', 'Was jetzt tun?', 'Vorlage: Makleranschreiben'],
    },
  },
  {
    name: 'index',
    url: BASE + '/kaufnebenkosten-index',
    marks: { headings: [] },
    maxHeight: 3200,
  },
]

const browser = await puppeteer.launch({ headless: true })
const meta = {}
for (const t of TARGETS) {
  const page = await browser.newPage()
  await page.setViewport({ width: W, height: 932, deviceScaleFactor: DPR, isMobile: true, hasTouch: true })
  await page.goto(t.url, { waitUntil: 'networkidle0', timeout: 90000 })
  // Cookie-/Consent-Banner und schwebende Elemente ausblenden
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('*')) {
      const s = getComputedStyle(el)
      if ((s.position === 'fixed' || s.position === 'sticky') && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
        const r = el.getBoundingClientRect()
        if (r.top > 200) el.style.display = 'none' // Banner unten
        else el.style.position = 'relative' // Kopfzeile bleibt oben im Bild
      }
    }
  })
  await page.evaluate(async () => {
    // Lazy-Bilder laden
    for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)) }
    window.scrollTo(0, 0)
  })
  await new Promise((r) => setTimeout(r, 800))
  const marks = await page.evaluate((m) => {
    const box = (el) => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top + window.scrollY, w: r.width, h: r.height } }
    const out = {}
    if (m.css) for (const el of document.querySelectorAll(m.css)) out[el.dataset.mark] = box(el)
    for (const text of m.headings || []) {
      const el = [...document.querySelectorAll('h1,h2,h3')].find((h) => h.textContent.replace(/\s+/g, ' ').trim().startsWith(text))
      if (el) out[text] = box(el)
    }
    for (const sel of m.inputs || []) { const el = document.querySelector(sel); if (el) out['input:' + sel] = box(el) }
    for (const text of m.buttons || []) {
      const el = [...document.querySelectorAll('a,button')].find((b) => b.textContent.trim().startsWith(text))
      if (el) out['btn:' + text] = box(el)
    }
    return out
  }, t.marks)
  const fullH = await page.evaluate(() => document.documentElement.scrollHeight)
  const h = Math.min(fullH, t.maxHeight || fullH)
  // In Kacheln speichern: sehr hohe Bilder (über ~16.000 px) kann der Browser beim Rendern nicht dekodieren
  const TILE = 2000
  const tiles = []
  for (let y = 0, i = 0; y < h; y += TILE, i++) {
    const th = Math.min(TILE, h - y)
    await page.screenshot({ path: join(OUT, `${t.name}-${i}.png`), clip: { x: 0, y, width: W, height: th }, captureBeyondViewport: true })
    tiles.push({ file: `shots/${t.name}-${i}.png`, y, h: th })
  }
  meta[t.name] = { width: W, height: h, dpr: DPR, marks, tiles }
  console.log(t.name, h, Object.keys(marks).join(' | '))
  await page.close()
}
await browser.close()
writeFileSync(join(HERE, '..', 'src', 'shots.json'), JSON.stringify(meta, null, 1))
