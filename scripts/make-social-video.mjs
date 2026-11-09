// Erzeugt ein Social-Media-Video aus der echten Website: Exposé eingeben/hochladen →
// Analyse → Ergebnis (Beispiel-Analyse mit fiktiven Daten). Bild für Bild aufgenommen,
// dadurch ruckelfrei und reproduzierbar. Braucht ffmpeg im PATH.
//
//   node scripts/make-social-video.mjs --format=reel --out=video.mp4 --pdf=Expose.pdf
//   --format=reel  9:16, 1080×1920 (Instagram Reel, TikTok, YouTube Short)
//   --format=feed  4:5,  1080×1350 (Facebook-/Instagram-Feed)
import puppeteer from 'puppeteer'
import { spawn } from 'node:child_process'
import { once } from 'node:events'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const FORMAT = args.format === 'feed' ? 'feed' : 'reel'
const OUT = args.out || `immopruef-${FORMAT}.mp4`
const BASE = args.base || 'https://immopruef.de'
const PDF = args.pdf || null
const FPS = 30
const W = 540
const H = FORMAT === 'feed' ? 675 : 960
// Bereich, den die App-Oberfläche von Reels/TikTok verdeckt (oben Kopfzeile, unten Buttons)
const SAFE_TOP = FORMAT === 'feed' ? 16 : 100
const SAFE_BOTTOM = FORMAT === 'feed' ? 14 : 196

const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">'

// ── ffmpeg: JPEG-Frames über stdin, stumme Tonspur für maximale Plattform-Kompatibilität
const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
  '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
  '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', OUT,
], { stdio: ['pipe', 'inherit', 'inherit'] })

const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

// ── Overlay: Untertitel, Tipp-Markierung, Hinweis-Badge. Wird pro Frame gesetzt.
const ov = { caption: '', alpha: 0, tap: null, badge: '' }
let frames = 0

function applyOverlay(o, safeTop, safeBottom) {
  let root = document.getElementById('__ov')
  if (!root) {
    document.documentElement.style.scrollBehavior = 'auto'
    root = document.createElement('div')
    root.id = '__ov'
    root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647;font-family:"DM Sans",system-ui,sans-serif'
    root.innerHTML =
      '<div id="__cap" style="position:absolute;left:50%;transform:translateX(-50%);max-width:88%;background:#1a3c2a;color:#f7f5f0;' +
      'font-size:21px;font-weight:700;line-height:1.25;padding:11px 18px;border-radius:14px;text-align:center;' +
      'box-shadow:0 6px 24px rgba(0,0,0,.28);border:1.5px solid rgba(201,168,76,.9);white-space:pre-line"></div>' +
      '<div id="__tap" style="position:absolute;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;' +
      'background:rgba(201,168,76,.35);border:3px solid #c9a84c"></div>' +
      '<div id="__badge" style="position:absolute;left:14px;background:rgba(26,60,42,.92);color:#f7f5f0;font-size:12px;' +
      'font-weight:500;padding:5px 10px;border-radius:8px"></div>'
    document.body.appendChild(root)
  }
  const cap = root.querySelector('#__cap')
  cap.textContent = o.caption
  cap.style.top = safeTop + 'px'
  cap.style.opacity = o.caption ? o.alpha : 0
  const tap = root.querySelector('#__tap')
  if (o.tap) {
    tap.style.display = 'block'
    tap.style.left = o.tap.x + 'px'
    tap.style.top = o.tap.y + 'px'
    tap.style.transform = `scale(${0.5 + o.tap.p * 0.9})`
    tap.style.opacity = 1 - o.tap.p * 0.85
  } else tap.style.display = 'none'
  const badge = root.querySelector('#__badge')
  badge.textContent = o.badge
  badge.style.bottom = safeBottom + 'px'
  badge.style.display = o.badge ? 'block' : 'none'
}

async function frame({ overlay = true } = {}) {
  if (overlay) {
    ov.alpha = Math.min(1, ov.alpha + 0.18)
    await page.evaluate(applyOverlay, ov, SAFE_TOP, SAFE_BOTTOM)
  }
  const buf = await page.screenshot({ type: 'jpeg', quality: 92, optimizeForSpeed: true })
  if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain')
  frames++
}

const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const setCaption = (text) => { if (text !== ov.caption) { ov.caption = text; ov.alpha = 0 } }
const scrollY = () => page.evaluate(() => window.scrollY)

async function hold(sec, drift = 0) {
  const n = Math.round(sec * FPS)
  const y0 = await scrollY()
  for (let i = 0; i < n; i++) {
    if (drift) await page.evaluate((y) => window.scrollTo(0, y), y0 + (drift * i) / FPS)
    await frame()
  }
}

async function scrollTo(y, sec) {
  const n = Math.max(2, Math.round(sec * FPS))
  const y0 = await scrollY()
  for (let i = 1; i <= n; i++) {
    await page.evaluate((v) => window.scrollTo(0, v), y0 + (y - y0) * ease(i / n))
    await frame()
  }
}

// Position eines Elements im Fenster; scrollt es vorher auf die gewünschte Höhe
async function bring(selector, index, atFraction, sec = 0.7) {
  const top = await page.evaluate((s, i) => {
    const el = document.querySelectorAll(s)[i]
    const r = el.getBoundingClientRect()
    return r.top + window.scrollY + r.height / 2
  }, selector, index)
  await scrollTo(Math.max(0, top - H * atFraction), sec)
  return page.evaluate((s, i) => {
    const r = document.querySelectorAll(s)[i].getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }, selector, index)
}

async function tap(pos, action) {
  const n = 9
  for (let i = 0; i < n; i++) {
    ov.tap = { x: pos.x, y: pos.y, p: i / (n - 1) }
    if (i === 3 && action) await action()
    await frame()
  }
  ov.tap = null
}

// Vollbild-Karte (Intro, Ladebild, Abspann); Animation über die CSS-Variable --t (0..1)
async function card(html, sec) {
  await page.goto('about:blank') // laufende Anfragen der vorigen Seite beenden
  await page.setContent(
    `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${FONTS}<style>
      html,body{margin:0;height:100%;background:#1a3c2a;color:#f7f5f0;font-family:'DM Sans',system-ui,sans-serif}
      .wrap{height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 44px;box-sizing:border-box}
      .a{--p:clamp(0,calc((var(--t) - var(--d,0)) * 7),1);opacity:var(--p);transform:translateY(calc((1 - var(--p)) * 22px))}
      .gold{color:#c9a84c}.serif{font-family:'Playfair Display',serif}
      .bar{width:78%;height:8px;border-radius:8px;background:rgba(247,245,240,.18);overflow:hidden;margin-top:26px}
      .bar i{display:block;height:100%;width:calc(var(--t) * 100%);background:#c9a84c}
    </style></head><body><div class="wrap">${html}</div></body></html>`,
    { waitUntil: 'load' },
  )
  await page.evaluate(() => document.fonts.ready)
  const n = Math.round(sec * FPS)
  for (let i = 0; i < n; i++) {
    await page.evaluate((t) => document.documentElement.style.setProperty('--t', t), i / (n - 1))
    await frame({ overlay: false })
  }
}

const go = async (path) => {
  await page.goto(BASE + path, { waitUntil: 'networkidle2' })
  await page.evaluate(() => document.fonts.ready)
}

// ════════════════ 1 · Aufhänger ════════════════
await card(
  `<div class="a gold" style="--d:.02;font-size:22px;font-weight:700;letter-spacing:.3px">Traumimmobilie gefunden?</div>
   <div class="a serif" style="--d:.14;font-size:47px;font-weight:600;line-height:1.12;margin-top:14px">Was verschweigt<br>das Exposé?</div>
   <div class="a" style="--d:.36;font-size:21px;margin-top:22px;opacity:.9">Der Check in wenigen Minuten</div>`,
  2.6,
)

// ════════════════ 2 · Eingabe auf der echten Startseite ════════════════
await go('/')
ov.caption = ''; ov.alpha = 0
const F = '#analyse-form'
await page.evaluate((y) => window.scrollTo(0, y), 380)
setCaption('1 · Exposé-Link einfügen')
const urlPos = await bring(`${F} input[type=url]`, 0, 0.5, 0.8)
await tap(urlPos, () => page.click(`${F} input[type=url]`))
for (const ch of 'https://www.immowelt.de/expose/3fz8k2m') {
  await page.keyboard.type(ch)
  await frame()
}
await hold(0.7)

setCaption('… oder PDF und Fotos hochladen')
const tabPos = await page.evaluate((s) => {
  const r = document.querySelectorAll(s)[1].getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}, `${F} [role=tab]`)
await tap(tabPos, () => page.evaluate((s) => document.querySelectorAll(s)[1].click(), `${F} [role=tab]`))
await hold(0.5)
if (PDF) {
  const input = await page.$(`${F} input[type=file]`)
  await input.uploadFile(PDF)
}
await hold(1.5)

setCaption('Einmalig ab 19 € · kein Abo')
const cta = await page.evaluateHandle((s) => [...document.querySelectorAll(`${s} button`)].find((b) => /Kostenpflichtig bestellen/.test(b.textContent)), F)
const ctaTop = await cta.evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
await scrollTo(ctaTop - H * 0.62, 0.8)
await hold(1.1)

// ════════════════ 3 · Analyse läuft ════════════════
await card(
  `<div class="a serif" style="--d:0;font-size:36px;font-weight:600">Analyse läuft …</div>
   <div class="bar"><i></i></div>
   <div style="margin-top:26px;font-size:19px;line-height:1.9;text-align:left">
     <div class="a" style="--d:.08"><span class="gold">✓</span> Exposé wird ausgelesen</div>
     <div class="a" style="--d:.34"><span class="gold">✓</span> Marktdaten werden recherchiert</div>
     <div class="a" style="--d:.6"><span class="gold">✓</span> Kosten werden nachgerechnet</div>
   </div>
   <div class="a" style="--d:.7;font-size:14px;opacity:.7;margin-top:22px">In echt dauert das wenige Minuten</div>`,
  2.4,
)

// ════════════════ 4 · Ergebnis: Beispiel-Analyse ════════════════
await go('/beispiel-analyse')
ov.caption = ''; ov.alpha = 0
ov.badge = 'Beispiel-Analyse · fiktive Daten'
const heads = await page.evaluate(() =>
  Object.fromEntries([...document.querySelectorAll('main h1, main h2, main h3')].map((h) => [h.textContent.trim(), h.getBoundingClientRect().top + window.scrollY])),
)
const at = (title) => {
  const key = Object.keys(heads).find((k) => k.startsWith(title))
  if (!key) throw new Error(`Abschnitt nicht gefunden: ${title}`)
  return heads[key]
}
const lead = SAFE_TOP + 170 // Überschrift startet unter dem Untertitel und bleibt beim Weiterlaufen sichtbar
const stops = [
  ['Mehringdamm', 'Das Ergebnis: Ampel, Scores, Fazit', 2.3, 30],
  ['Wo liegt der Preis?', 'Preis-Check gegen den Markt', 2.1, 0],
  ['Was kostet es insgesamt?', 'Alle Kaufnebenkosten, nachgerechnet', 2.3, 0],
  ['Zustand & Energie', 'Sanierung und Energie:\nWas kommt auf mich zu?', 2.2, 0],
  ['Risiken & Fallstricke', 'Risiken und Warnsignale', 2.2, 0],
  ['Was jetzt tun?', 'Verhandlungstipps mit Zahlen', 2.1, 0],
  ['Vorlage: Makleranschreiben', 'Fertiges Anschreiben an den Makler', 2.2, 0],
]
await page.evaluate((y) => window.scrollTo(0, y), Math.max(0, at('Mehringdamm') - lead - 260))
for (const [title, caption, sec, offset] of stops) {
  setCaption(caption)
  await scrollTo(Math.max(0, at(title) - lead + offset), 0.75)
  await hold(sec, 45)
}
ov.badge = ''

// ════════════════ 5 · Abspann ════════════════
await card(
  `<div class="a serif" style="--d:0;font-size:54px;font-weight:600">Immo<span class="gold">Prüf</span></div>
   <div class="a" style="--d:.12;font-size:25px;font-weight:700;margin-top:18px">Exposé prüfen lassen</div>
   <div class="a gold" style="--d:.22;font-size:22px;font-weight:700;margin-top:10px">ab 19 € · immopruef.de</div>
   <div class="a" style="--d:.34;font-size:16px;opacity:.8;margin-top:26px;line-height:1.5">Für Käufer. Keine Makler-Leads.<br>Keine Werbeanrufe.</div>`,
  3.2,
)

ff.stdin.end()
await once(ff, 'close')
await browser.close()
console.log(`${OUT}: ${frames} Frames, ${(frames / FPS).toFixed(1)} s, ${W * 2}×${H * 2}`)
