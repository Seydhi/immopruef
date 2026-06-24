// Supabase Edge Function: retry-analysis
// Resets a failed analysis back to pending so it gets re-processed
// No additional payment required — uses the existing paid order

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// CORS restricted to known origins (was '*'). Server-to-server calls (kickAnalyze)
// are unaffected — CORS is browser-only.
const ALLOWED_ORIGINS = new Set([
  'https://immopruef.de',
  'https://www.immopruef.de',
  'http://localhost:5173',
  'http://localhost:4173',
])

function corsHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://immopruef.de'
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Vary': 'Origin',
  }
}

function jsonResponse(body: unknown, status = 200, origin: string | null = null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

// Fire-and-forget server-side kick so the retried analysis is processed even if
// the customer's tab is closed. analyze claims it atomically and self-chains.
function fireAndForget(promise: Promise<unknown>) {
  try {
    const er = (globalThis as { EdgeRuntime?: { waitUntil?: (p: Promise<unknown>) => void } }).EdgeRuntime
    if (er?.waitUntil) er.waitUntil(promise)
  } catch { /* waitUntil unavailable — promise still runs best-effort */ }
}

function kickAnalyze(sessionId: string) {
  const base = Deno.env.get('SUPABASE_URL')
  const key = Deno.env.get('SB_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!base || !key) return
  const p = fetch(`${base}/functions/v1/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
    body: JSON.stringify({ session_id: sessionId }),
  }).catch((e) => console.warn('kickAnalyze failed:', e instanceof Error ? e.message : String(e)))
  fireAndForget(p)
}

serve(async (req) => {
  const origin = req.headers.get('origin')

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405, origin)
  }

  try {
    const { analysis_id } = await req.json()
    if (!analysis_id) {
      return jsonResponse({ error: 'analysis_id required' }, 400, origin)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      (Deno.env.get('SB_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'))!
    )

    // Verify the analysis exists and is failed
    const { data: analysis, error: fetchErr } = await supabase
      .from('analyses')
      .select('*, orders!inner(status, stripe_session_id)')
      .eq('id', analysis_id)
      .single()

    if (fetchErr || !analysis) {
      return jsonResponse({ error: 'Analysis not found' }, 404, origin)
    }

    if (analysis.status !== 'failed') {
      return jsonResponse({ error: 'Analysis is not in failed state' }, 400, origin)
    }

    // Reset analysis to pending
    await supabase
      .from('analyses')
      .update({ status: 'pending', result: null })
      .eq('id', analysis_id)

    // Reset order to paid (so analyze function picks it up)
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', analysis.order_id)

    console.log(`Analysis ${analysis_id} reset for retry`)

    // Trigger processing server-side (browser-independent).
    const sessionId = (analysis.orders as { stripe_session_id?: string } | null)?.stripe_session_id
    if (sessionId) kickAnalyze(sessionId)

    return jsonResponse({ success: true, message: 'Analysis queued for retry' }, 200, origin)
  } catch (err) {
    console.error('Retry error:', err)
    return jsonResponse({ error: 'Internal error' }, 500, origin)
  }
})
