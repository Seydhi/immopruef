// Supabase Edge Function: retry-analysis
// Resets a failed analysis back to pending so it gets re-processed
// No additional payment required — uses the existing paid order

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405)
  }

  try {
    const { analysis_id } = await req.json()
    if (!analysis_id) {
      return jsonResponse({ error: 'analysis_id required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify the analysis exists and is failed
    const { data: analysis, error: fetchErr } = await supabase
      .from('analyses')
      .select('*, orders!inner(status)')
      .eq('id', analysis_id)
      .single()

    if (fetchErr || !analysis) {
      return jsonResponse({ error: 'Analysis not found' }, 404)
    }

    if (analysis.status !== 'failed') {
      return jsonResponse({ error: 'Analysis is not in failed state' }, 400)
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

    return jsonResponse({ success: true, message: 'Analysis queued for retry' })
  } catch (err) {
    console.error('Retry error:', err)
    return jsonResponse({ error: 'Internal error' }, 500)
  }
})
