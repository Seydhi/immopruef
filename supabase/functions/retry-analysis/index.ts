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
    const body = await req.json().catch(() => null)
    const analysis_id = body?.analysis_id
    const session_id = body?.session_id
    if (typeof analysis_id !== 'string' || !analysis_id) {
      return jsonResponse({ error: 'analysis_id required' }, 400)
    }
    // Die Stripe-Session weist den Aufrufer als Inhaber der Bestellung aus. Ohne sie könnte
    // jeder, der eine Analyse-ID kennt, kostenpflichtige Neuberechnungen auslösen.
    if (typeof session_id !== 'string' || !session_id) {
      return jsonResponse({ error: 'session_id required' }, 400)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SB_SERVICE_ROLE_KEY')!
    )

    // Verify the analysis exists and is failed
    const { data: analysis, error: fetchErr } = await supabase
      .from('analyses')
      .select('id, status, order_id, orders!inner(status, stripe_session_id)')
      .eq('id', analysis_id)
      .single()

    if (fetchErr || !analysis) {
      return jsonResponse({ error: 'Analysis not found' }, 404)
    }

    const orderRel = analysis.orders as unknown
    const order = (Array.isArray(orderRel) ? orderRel[0] : orderRel) as { stripe_session_id?: string } | null
    if (!order?.stripe_session_id || order.stripe_session_id !== session_id) {
      // bewusst dieselbe Antwort wie "nicht gefunden"
      return jsonResponse({ error: 'Analysis not found' }, 404)
    }

    if (analysis.status !== 'failed') {
      return jsonResponse({ error: 'Analysis is not in failed state' }, 400)
    }

    // Reset analysis to pending — inkl. Batch-Zuordnung und Startzeit, sonst hängt der neue
    // Lauf am alten Batch. Nur wenn sie noch "failed" ist (Doppelklick / parallele Anfrage).
    const { data: resetRows, error: resetErr } = await supabase
      .from('analyses')
      .update({ status: 'pending', result: null, batch_id: null, processing_started_at: null })
      .eq('id', analysis_id)
      .eq('status', 'failed')
      .select('id')
    if (resetErr) {
      console.error('Retry reset failed:', resetErr.message)
      return jsonResponse({ error: 'Internal error' }, 500)
    }
    if (!resetRows || resetRows.length === 0) {
      return jsonResponse({ success: true, message: 'Analysis already queued' })
    }

    // Reset order to paid (so analyze function picks it up)
    const { error: orderErr } = await supabase
      .from('orders')
      .update({ status: 'paid' })
      .eq('id', analysis.order_id)
    if (orderErr) {
      console.error('Retry order reset failed:', orderErr.message)
      return jsonResponse({ error: 'Internal error' }, 500)
    }

    console.log(`Analysis ${analysis_id} reset for retry`)

    return jsonResponse({ success: true, message: 'Analysis queued for retry' })
  } catch (err) {
    console.error('Retry error:', err)
    return jsonResponse({ error: 'Internal error' }, 500)
  }
})
