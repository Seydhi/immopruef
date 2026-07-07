import type { AnalysisOptions, OrderResult, Analysis, Package } from './types'
import * as mockApi from './mock-api'
import { supabase, getSupabaseFunctionUrl } from './supabase'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

function getHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ANON_KEY}`,
  }
}

// ─── Start Checkout ───
// Creates a Stripe Checkout session via Edge Function, returns redirect URL
export interface CheckoutConsents {
  agbAccepted: boolean
  widerrufWaived: boolean
  timestamp: string
}

export async function startCheckout(
  urls: string[],
  options: AnalysisOptions,
  pkg: Package,
  email: string,
  consents: CheckoutConsents,
  files: string[] = []
): Promise<string> {
  if (USE_MOCKS) return mockApi.startCheckout(urls, options, pkg)

  const res = await fetch(getSupabaseFunctionUrl('create-checkout'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ urls, files, options, package: pkg, email, consents }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Verbindungsfehler' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.url
}

// ─── Exposé-Upload (PDF/Fotos) ───
// Lädt Dateien in den privaten Bucket "exposes" (Ordner uploads/) und gibt die
// Storage-Pfade zurück, die create-checkout als `files` entgegennimmt.
export const UPLOAD_MAX_BYTES = 20 * 1024 * 1024 // Bucket-Limit: 20 MB pro Datei
export const UPLOAD_MAX_IMAGES = 8
export const UPLOAD_TYPES: Record<string, string> = {
  'application/pdf': 'pdf',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

function randomFileId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export async function uploadExposeFiles(files: File[]): Promise<string[]> {
  if (!supabase) throw new Error('Supabase not configured')

  const paths: string[] = []
  for (const file of files) {
    const ext = UPLOAD_TYPES[file.type]
    if (!ext) throw new Error(`Dateityp nicht unterstützt: ${file.name}`)
    if (file.size > UPLOAD_MAX_BYTES) throw new Error(`Datei zu groß (max. 20 MB): ${file.name}`)

    const path = `uploads/${randomFileId()}.${ext}`
    const { error } = await supabase.storage
      .from('exposes')
      .upload(path, file, { contentType: file.type })
    if (error) throw new Error(`Upload fehlgeschlagen: ${file.name}`)
    paths.push(path)
  }
  return paths
}

// ─── Poll Analysis ───
// Polls the analyze Edge Function until results are ready
export async function pollAnalysis(sessionId: string): Promise<OrderResult> {
  if (USE_MOCKS) return mockApi.pollAnalysis(sessionId)

  const res = await fetch(getSupabaseFunctionUrl('analyze'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ session_id: sessionId }),
  })

  // 402 = payment pending, treat as pending
  if (res.status === 402) {
    return { order_status: 'pending', analyses: [] }
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`)
  }

  return await res.json()
}

// ─── Retry Failed Analysis ───
// Resets a failed analysis to pending and re-triggers processing (no extra payment)
export async function retryAnalysis(analysisId: string): Promise<Analysis | null> {
  if (USE_MOCKS) return null

  const res = await fetch(getSupabaseFunctionUrl('retry-analysis'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ analysis_id: analysisId }),
  })

  if (!res.ok) return null
  return await res.json()
}

// ─── Get Analysis by Token ───
// Direct Supabase query for permalink access (RLS allows public read)
export async function getAnalysisByToken(token: string): Promise<Analysis | null> {
  if (USE_MOCKS) return mockApi.getAnalysisByToken(token)

  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .from('analyses')
    .select('*')
    .eq('token', token)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    token: data.token,
    url: data.url,
    options: data.options as AnalysisOptions,
    status: data.status,
    result: data.result,
    created_at: data.created_at,
  }
}
