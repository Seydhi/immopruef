// Supabase Edge Function: retry-analysis
// Resets a failed analysis back to pending so it gets re-processed
// No additional payment required — uses the existing paid order

import { createClient } from 'npm:@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const { analysis_id, token } = await req.json()
    if (!analysis_id || typeof token !== 'string' || !/^[A-Za-z0-9_-]{12,64}$/.test(token)) {
      return jsonResponse({ error: 'analysis_id and token required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SB_SERVICE_ROLE_KEY')!
    )

    // Verify the analysis exists and is failed
    const { data: analysis, error: fetchErr } = await supabase
      .from('analyses')
      .select('*, orders!inner(status, stripe_session_id)')
      .eq('id', analysis_id)
      .eq('token', token)
      .single()

    if (fetchErr || !analysis) {
      return jsonResponse({ error: 'Analysis not found' }, 404)
    }

    if (analysis.status !== 'failed') {
      return jsonResponse({ error: 'Analysis is not in failed state' }, 400)
    }

    // Reset analysis to pending
    const { data: updated, error: updateError } = await supabase
      .from('analyses')
      .update({
        status: 'pending',
        result: null,
        batch_id: null,
        processing_started_at: null,
        failed_at: null,
        last_error: null,
      })
      .eq('id', analysis_id)
      .select('id, token, url, options, status, result, created_at')
      .single()

    if (updateError || !updated) {
      console.error('Failed to reset analysis:', updateError)
      return jsonResponse({ error: 'Could not reset analysis' }, 500)
    }

    // Reset order to paid (so analyze function picks it up)
    await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', analysis.order_id)

    console.log(`Analysis ${analysis_id} reset for retry`)

    const orderRelation = analysis.orders as
      | { stripe_session_id?: string }
      | Array<{ stripe_session_id?: string }>
      | null
    const sessionId = Array.isArray(orderRelation)
      ? orderRelation[0]?.stripe_session_id
      : orderRelation?.stripe_session_id
    if (sessionId) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const serviceRoleKey = Deno.env.get('SB_SERVICE_ROLE_KEY')!
      EdgeRuntime.waitUntil(
        fetch(`${supabaseUrl}/functions/v1/analyze`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
            'apikey': serviceRoleKey,
          },
          body: JSON.stringify({ session_id: sessionId, worker_depth: 0 }),
        }).catch((error) => console.error('Retry kickoff failed:', error))
      )
    }

    return jsonResponse(updated)
  } catch (err) {
    console.error('Retry error:', err)
    return jsonResponse({ error: 'Internal error' }, 500)
  }
})
