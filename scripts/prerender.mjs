#!/usr/bin/env node
// PRERENDER — Statische HTML-Snapshots fuer SEO und Social-Sharing.
// Schritte:
//   1. Startet einen lokalen Server der dist/ ausliefert (Node http only)
//   2. Oeffnet jede pre-renderbare Route mit Puppeteer (echter Browser)
//   3. Wartet bis React den Inhalt + useSEO-Hook gerendert hat
//   4. Speichert das volle HTML als statische .html-Datei in dist/
//   5. Vercel serviert dann diese statischen Dateien fuer Crawler

import { mkdir, writeFile, readFile, stat } from 'node:fs/promises'
import { existsSync, createReadStream } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import puppeteer from 'puppeteer'
import { createServer } from 'node:http'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST = join(ROOT, 'dist')
const PORT = 4173

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
}

// ─── Routen aus posts/index.ts extrahieren ───
async function getBlogSlugs() {
  const indexFile = join(ROOT, 'src/components/blog/posts/index.ts')
  const content = await readFile(indexFile, 'utf-8')
  const slugs = []
  const slugRegex = /slug:\s*'([a-z0-9-]+)'/g
  let m
  while ((m = slugRegex.exec(content)) !== null) {
    slugs.push(m[1])
  }
  return slugs
}

async function getRoutes() {
  const blogSlugs = await getBlogSlugs()
  return [
    '/',
    '/blog',
    '/impressum',
    '/datenschutz',
    '/agb',
    ...blogSlugs.map(s => `/blog/${s}`),
  ]
}

// ─── Lokaler Static-Server mit SPA-Fallback ───
function startServer(distDir, port) {
  const server = createServer(async (req, res) => {
    let urlPath = req.url.split('?')[0].split('#')[0]
    if (urlPath === '/') urlPath = '/index.html'
    let filePath = join(distDir, urlPath)

    try {
      const fileStat = await stat(filePath)
      if (fileStat.isDirectory()) {
        filePath = join(filePath, 'index.html')
      }
      // Existiert die Datei?
      if (!existsSync(filePath)) throw new Error('not-found')
      const ext = extname(filePath).toLowerCase()
      res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
      createReadStream(filePath).pipe(res)
    } catch {
      // SPA-Fallback: index.html ausliefern fuer alle Routen ohne File
      const indexPath = join(distDir, 'index.html')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      createReadStream(indexPath).pipe(res)
    }
  })
  return new Promise((resolve, reject) => {
    server.on('error', reject)
    server.listen(port, () => resolve(server))
  })
}

// ─── HTML rendern ───
async function renderRoute(browser, route) {
  const page = await browser.newPage()
  await page.setUserAgent('ImmoPrueefPrerender/1.0')
  await page.setViewport({ width: 1280, height: 800 })

  try {
    await page.goto(`http://localhost:${PORT}${route}`, {
      waitUntil: 'networkidle0',
      timeout: 30_000,
    })

    // Warte bis useSEO den title gesetzt hat (nicht mehr der Default)
    await page.waitForFunction(
      () => document.title && !document.title.startsWith('ImmoPrüf – KI-gestützte'),
      { timeout: 10_000 }
    ).catch(() => {})

    // Warte ob ein Blog-Artikel geladen wurde (Suspense fallback weg?)
    if (route.startsWith('/blog/')) {
      await page.waitForFunction(
        () => !document.body.innerText.includes('Artikel wird geladen'),
        { timeout: 10_000 }
      ).catch(() => {})
    }

    // Extra Zeit fuer JSON-LD Scripts
    await new Promise(r => setTimeout(r, 500))

    const html = await page.content()
    return html
  } finally {
    await page.close()
  }
}

function getOutputPath(route) {
  if (route === '/') return join(DIST, 'index.html')
  return join(DIST, route, 'index.html')
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('dist/ existiert nicht. Bitte zuerst "npm run build" ausfuehren.')
    process.exit(1)
  }

  console.log('Starte Pre-Rendering...\n')

  // Backup der ursprunglichen index.html
  const indexHtmlOriginal = await readFile(join(DIST, 'index.html'), 'utf-8')
  await writeFile(join(DIST, 'index.spa.html'), indexHtmlOriginal, 'utf-8')

  console.log('Starte lokalen Test-Server auf Port', PORT)
  const server = await startServer(DIST, PORT)

  console.log('Starte Puppeteer (Headless Chrome)')
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const routes = await getRoutes()
  console.log(`Pre-rendere ${routes.length} Routen:\n`)

  let success = 0
  let failed = 0
  const start = Date.now()

  for (const route of routes) {
    const t0 = Date.now()
    try {
      const html = await renderRoute(browser, route)
      const outputPath = getOutputPath(route)
      await mkdir(dirname(outputPath), { recursive: true })
      await writeFile(outputPath, html, 'utf-8')
      const ms = Date.now() - t0
      console.log(`  ok ${route.padEnd(50)} ${ms.toString().padStart(5)}ms . ${(html.length / 1024).toFixed(1)}KB`)
      success++
    } catch (err) {
      console.error(`  FAIL ${route.padEnd(50)} FEHLER: ${err.message}`)
      failed++
    }
  }

  await browser.close()
  server.close()

  const totalMs = Date.now() - start
  console.log(`\nFertig: ${success}/${routes.length} Routen . ${(totalMs / 1000).toFixed(1)}s gesamt`)
  if (failed > 0) {
    console.error(`${failed} Routen fehlgeschlagen`)
    process.exit(1)
  }
}

main().catch(err => {
  console.error('Pre-Rendering crashed:', err)
  process.exit(1)
})
