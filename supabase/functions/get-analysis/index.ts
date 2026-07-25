// Liefert genau eine Analyse über ihren nicht erratbaren Ergebnis-Token.
// Der direkte öffentliche Tabellenzugriff bleibt gesperrt.

import { createClient } from 'npm:@supabase/supabase-js@2'

const ALLOWED_ORIGINS = new Set([
  'https://immopruef.de',
  'https://www.immopruef.de',
  'http://localhost:5173',
  'http://localhost:4173',
])

function corsHeaders(origin: string | null): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://immopruef.de',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-client-info, apikey',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  }
}

function jsonResponse(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(origin), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin')
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders(origin) })
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405, origin)

  try {
    const { token } = await req.json()
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{12,64}$/.test(token)) {
      return jsonResponse({ error: 'Ungültiger Ergebnis-Link' }, 400, origin)
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SB_SERVICE_ROLE_KEY')!
    )
    const { data, error } = await supabase
      .from('analyses')
      .select('id, token, url, options, status, result, created_at')
      .eq('token', token)
      .single()

    if (error || !data) return jsonResponse({ error: 'Analyse nicht gefunden' }, 404, origin)
    return jsonResponse({ analysis: data }, 200, origin)
  } catch (error) {
    console.error('get-analysis failed:', error)
    return jsonResponse({ error: 'Interner Fehler' }, 500, origin)
  }
})
