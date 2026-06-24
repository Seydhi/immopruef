import type { AnalysisOptions, OrderResult, Analysis, Package } from './types'
import * as mockApi from './mock-api'
import { supabase, getSupabaseFunctionUrl } from './supabase'

// Mock-Modus: nur wenn explizit aktiviert UND NICHT auf dem Produktions-Host.
// Schutz gegen die Konfig-Falle "VITE_USE_MOCKS=false vergessen" — sonst würde
// die Live-Seite Fake-Analysen zeigen und keine echten Zahlungen abwickeln.
const MOCK_FLAG = import.meta.env.VITE_USE_MOCKS === 'true'
const IS_PROD_HOST = typeof window !== 'undefined'
  && /(^|\.)immopruef\.(de|com)$/.test(window.location.hostname)
const USE_MOCKS = MOCK_FLAG && !IS_PROD_HOST
if (MOCK_FLAG && IS_PROD_HOST) {
  console.error('[ImmoPrüf] VITE_USE_MOCKS=true wird auf dem Produktions-Host ignoriert — echte API/Zahlungen aktiv. Bitte VITE_USE_MOCKS=false setzen.')
}
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
  consents: CheckoutConsents
): Promise<string> {
  if (USE_MOCKS) return mockApi.startCheckout(urls, options, pkg)

  const res = await fetch(getSupabaseFunctionUrl('create-checkout'), {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ urls, options, package: pkg, email, consents }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Verbindungsfehler' }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }

  const data = await res.json()
  return data.url
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
// Permalink access via security-definer RPC. Direct table reads are no longer
// allowed for anon (RLS policy removed in migration 006) — the RPC returns
// strictly the single row addressed by the exact token, closing the
// full-table-read hole that `using (true)` had opened.
export async function getAnalysisByToken(token: string): Promise<Analysis | null> {
  if (USE_MOCKS) return mockApi.getAnalysisByToken(token)

  if (!supabase) throw new Error('Supabase not configured')

  const { data, error } = await supabase
    .rpc('get_analysis_by_token', { p_token: token })

  if (error || !data || data.length === 0) return null
  const row = data[0]

  return {
    id: row.id,
    token: row.token,
    url: row.url,
    options: row.options as AnalysisOptions,
    status: row.status,
    result: row.result,
    created_at: row.created_at,
  }
}
