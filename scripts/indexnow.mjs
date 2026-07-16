#!/usr/bin/env node
// INDEXNOW — meldet URLs aktiv an Bing & Co. (ChatGPT-Suche/Copilot ziehen aus
// dem Bing-Index). Nutzung NACH einem Deploy:
//   node scripts/indexnow.mjs                  → alle Sitemap-URLs melden
//   node scripts/indexnow.mjs /blog/foo /bar   → nur diese Pfade melden
// Der Key liegt als public/<key>.txt im Web-Root (IndexNow-Verifikation).

import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const HOST = 'immopruef.de'
const KEY = '2ca64d4678daff1ba61ff2a4c46c949d'

function sitemapUrls() {
  const xml = readFileSync(resolve(__dirname, '..', 'public', 'sitemap.xml'), 'utf8')
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
}

const args = process.argv.slice(2)
const urlList = args.length
  ? args.map((p) => (p.startsWith('http') ? p : `https://${HOST}${p.startsWith('/') ? p : `/${p}`}`))
  : sitemapUrls()

// IndexNow akzeptiert bis 10.000 URLs pro POST — eine Sitemap-Ladung passt locker.
const body = JSON.stringify({
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList,
})

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body,
})

// 200 = verarbeitet, 202 = angenommen (Key-Prüfung folgt asynchron)
console.log(`IndexNow: ${urlList.length} URLs gemeldet → HTTP ${res.status} ${res.statusText}`)
if (!(res.status === 200 || res.status === 202)) {
  console.error(await res.text())
  process.exit(1)
}
