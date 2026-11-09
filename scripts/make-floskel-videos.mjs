// Serie „Maklersprache übersetzt": ein Kurzvideo pro Exposé-Floskel.
// Inhalte stammen aus dem Ratgeber /blog/maklersprache-glossar. Bild für Bild gerendert,
// braucht ffmpeg im PATH.
//
//   node scripts/make-floskel-videos.mjs --format=reel --outdir=pfad [--only=3]
//   --format=reel  9:16, 1080×1920 (Reel, TikTok, Shorts) · --format=feed  4:5, 1080×1350
import puppeteer from 'puppeteer'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { mkdirSync } from 'node:fs'

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, '').split('=')))
const FORMAT = args.format === 'feed' ? 'feed' : 'reel'
const OUTDIR = args.outdir || '.'
const ONLY = args.only ? Number(args.only) : null
const FPS = 30
const W = 540
const H = FORMAT === 'feed' ? 675 : 960
const SAFE_TOP = FORMAT === 'feed' ? 22 : 104
const SAFE_BOTTOM = FORMAT === 'feed' ? 22 : 200
const DURATION = 14.8

// „meaning" bewusst vorsichtig: Die Einblendung lautet „Das heißt oft", nicht „immer".
export const EPISODES = [
  { nr: 1, slug: 'gepflegt', quote: '„gepflegt"', meaning: 'Sauber und bewohnbar. Technisch ist oft nichts erneuert.', tip: 'Nachfragen: Wann wurden Heizung, Fenster und Elektrik zuletzt erneuert?' },
  { nr: 2, slug: 'verkehrsguenstig', quote: '„verkehrsgünstig gelegen"', meaning: 'Häufig: direkt an der Hauptstraße oder an der Bahntrasse.', tip: 'Zu verschiedenen Tageszeiten hinfahren und den Lärm selbst hören.' },
  { nr: 3, slug: 'potenzial', quote: '„mit viel Potenzial"', meaning: 'Im jetzigen Zustand unattraktiv. Das Potenzial hebt der Käufer, mit eigenem Geld.', tip: 'Sanierungskosten vor dem Angebot durchrechnen, nicht danach.' },
  { nr: 4, slug: 'vb', quote: '„349.000 € VB"', meaning: 'Verhandlungsbasis: ein Startpunkt, kein Endpreis.', tip: 'Vergleichspreise prüfen und mit Zahlen verhandeln, nicht mit Gefühl.' },
  { nr: 5, slug: 'gemuetlich', quote: '„gemütliche Wohnung"', meaning: 'Klein.', tip: 'Quadratmeter je Raum im Grundriss nachrechnen.' },
]

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

const html = (ep) => `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,500&family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  html,body{margin:0;height:100%;background:#1a3c2a;color:#f7f5f0;font-family:'DM Sans',system-ui,sans-serif;overflow:hidden}
  .abs{position:absolute;left:34px;right:34px}
  .label{font-size:15px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#c9a84c}
  #head{display:flex;justify-content:space-between;align-items:baseline}
  #head b{font-size:17px;letter-spacing:1.4px;text-transform:uppercase;color:#f7f5f0}
  #head span{font-size:15px;color:#c9a84c;font-weight:700;letter-spacing:1px}
  #rule{height:2px;background:rgba(201,168,76,.55);margin-top:10px}
  #card{background:#f7f5f0;color:#1f2a24;border-radius:14px;padding:22px 24px 26px;box-shadow:0 14px 40px rgba(0,0,0,.35);transform-origin:50% 50%}
  #card .label{color:#8a6d1b;margin-bottom:10px}
  #quote{font-family:'Playfair Display',serif;font-style:italic;font-weight:500;font-size:45px;line-height:1.16}
  #quote i{font-style:inherit;color:transparent}
  #mean .t{font-size:35px;font-weight:700;line-height:1.22;margin-top:10px}
  #tip .t{font-size:26px;font-weight:500;line-height:1.32;margin-top:8px;color:#f7f5f0}
  #tip{border-left:3px solid #c9a84c;padding-left:16px;left:34px}
  #outro{inset:0;left:0;right:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 40px}
  .serif{font-family:'Playfair Display',serif;font-weight:600}
  .gold{color:#c9a84c}
</style></head><body>
  <div id="stack">
    <div id="head" class="abs"><b>Maklersprache übersetzt</b><span>Folge ${ep.nr}</span></div>
    <div id="rule" class="abs"></div>
    <div id="card" class="abs"><div class="label">Im Exposé steht</div><div id="quote"><span id="typed"></span><i id="rest"></i></div></div>
    <div id="mean" class="abs"><div class="label">Das heißt oft</div><div class="t">${esc(ep.meaning)}</div></div>
    <div id="tip" class="abs"><div class="label">Vor dem Kauf</div><div class="t">${esc(ep.tip)}</div></div>
  </div>
  <div id="outro" class="abs">
    <div class="serif" style="font-size:52px">Immo<span class="gold">Prüf</span></div>
    <div style="font-size:24px;font-weight:700;margin-top:16px">Exposé prüfen lassen</div>
    <div class="gold" style="font-size:21px;font-weight:700;margin-top:8px">ab 19 € · immopruef.de</div>
    <div style="font-size:15px;opacity:.8;margin-top:24px;line-height:1.5">Alle 50 Floskeln im Ratgeber.<br>Für Käufer. Keine Makler-Leads.</div>
  </div>
<script>
  const QUOTE = ${JSON.stringify(ep.quote)}, SAFE_TOP = ${SAFE_TOP}, SAFE_BOTTOM = ${SAFE_BOTTOM}, H = ${H}
  const $ = (id) => document.getElementById(id)
  const clamp = (v) => Math.max(0, Math.min(1, v))
  const ease = (t) => 1 - Math.pow(1 - clamp(t), 3)
  const prog = (s, from, dur) => ease((s - from) / dur)
  window.__tick = (s) => {
    // Zeitachse: 0 Zitat tippt · 3.4 Übersetzung · 8.0 Hinweis · 12.0 Abspann
    const n = Math.round(clamp((s - 0.5) / 1.2) * QUOTE.length)
    $('typed').textContent = QUOTE.slice(0, n); $('rest').textContent = QUOTE.slice(n)
    const head = $('head'), rule = $('rule'), card = $('card'), mean = $('mean'), tip = $('tip')
    head.style.top = SAFE_TOP + 8 + 'px'
    rule.style.top = SAFE_TOP + 8 + head.offsetHeight + 'px'
    const top0 = SAFE_TOP + 8 + head.offsetHeight + 34
    const usableBottom = H - SAFE_BOTTOM
    const blockH = card.offsetHeight + 30 + mean.offsetHeight + 26 + tip.offsetHeight
    // Endposition: gesamter Block mittig im sichtbaren Bereich, aber nie über der Kopfzeile
    const yTop = Math.max(top0, top0 + (usableBottom - top0 - blockH) / 2)
    const yCenter = top0 + (usableBottom - top0 - card.offsetHeight) / 2
    const move = prog(s, 3.2, 0.6)
    const cardY = yCenter + (yTop - yCenter) * move
    const intro = prog(s, 0, 0.45)
    card.style.top = cardY + 'px'
    card.style.opacity = intro
    card.style.transform = 'rotate(' + (-1.4 * (1 - move * 0.5)) + 'deg) scale(' + (0.94 + 0.06 * intro) + ')'
    head.style.opacity = rule.style.opacity = prog(s, 0, 0.4)
    const pm = prog(s, 3.6, 0.5), pt = prog(s, 8.0, 0.5)
    mean.style.top = cardY + card.offsetHeight + 30 + (1 - pm) * 18 + 'px'
    mean.style.opacity = pm * (1 - 0.35 * pt)
    tip.style.top = yTop + card.offsetHeight + 30 + mean.offsetHeight + 26 + (1 - pt) * 18 + 'px'
    tip.style.opacity = pt
    const out = prog(s, 12.0, 0.35)
    $('stack').style.opacity = 1 - out
    $('outro').style.opacity = prog(s, 12.2, 0.45)
    $('outro').style.transform = 'translateY(' + (1 - prog(s, 12.2, 0.45)) * 16 + 'px)'
  }
  window.__tick(0)
</script></body></html>`

mkdirSync(OUTDIR, { recursive: true })
const browser = await puppeteer.launch({ headless: true })
const page = await browser.newPage()
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2, isMobile: true })

for (const ep of EPISODES) {
  if (ONLY && ep.nr !== ONLY) continue
  const out = `${OUTDIR}/maklersprache-${ep.nr}-${ep.slug}-${FORMAT === 'feed' ? '4x5' : '9x16'}.mp4`
  const ff = spawn('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=44100',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS),
    '-c:a', 'aac', '-b:a', '96k', '-shortest', '-movflags', '+faststart', out,
  ], { stdio: ['pipe', 'inherit', 'inherit'] })
  await page.goto('about:blank')
  await page.setContent(html(ep), { waitUntil: 'load' })
  await page.evaluate(() => document.fonts.ready)
  const total = Math.round(DURATION * FPS)
  for (let i = 0; i < total; i++) {
    await page.evaluate((s) => window.__tick(s), i / FPS)
    const buf = await page.screenshot({ type: 'jpeg', quality: 93, optimizeForSpeed: true })
    if (!ff.stdin.write(buf)) await once(ff.stdin, 'drain')
  }
  ff.stdin.end()
  await once(ff, 'close')
  console.log(`${out}: ${DURATION} s`)
}
await browser.close()
