import type { AnalysisOptions, OrderResult, Analysis, Package } from './types'
import * as mockApi from './mock-api'
import { supabase, getSupabaseFunctionUrl } from './supabase'

const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true'

// ─── Start Checkout ───
// Creates a Stripe Checkout session via Edge Function, returns redirect URL
export async function startCheckout(
  urls: string[],
  options: AnalysisOptions,
  pkg: Package,
  email?: string
): Promise<string> {
  if (USE_MOCKS) return mockApi.startCheckout(urls, options, pkg)

  const res = await fetch(getSupabaseFunctionUrl('create-checkout'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ urls, options, package: pkg, email }),
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
    headers: { 'Content-Type': 'application/json' },
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
