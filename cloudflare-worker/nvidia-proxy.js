/**
 * NexusAI — NVIDIA NIM CORS Proxy
 * Deploy this to Cloudflare Workers (free, 100k requests/day)
 * This worker forwards browser requests to NVIDIA's API, adding CORS headers.
 */

const NVIDIA_BASE = 'https://integrate.api.nvidia.com'

export default {
  async fetch(request) {

    // ── CORS preflight ──────────────────────────────────────────────
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(),
      })
    }

    // ── Only allow POST (chat completions) and GET (models list) ────
    if (!['GET', 'POST'].includes(request.method)) {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders() })
    }

    // ── Build the NVIDIA target URL ─────────────────────────────────
    const url        = new URL(request.url)
    const targetUrl  = `${NVIDIA_BASE}${url.pathname}${url.search}`

    // ── Forward the request ─────────────────────────────────────────
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      )
    }

    let nvResponse
    try {
      nvResponse = await fetch(targetUrl, {
        method:  request.method,
        headers: {
          'Authorization': authHeader,
          'Content-Type':  request.headers.get('Content-Type') || 'application/json',
          'Accept':        request.headers.get('Accept') || 'application/json',
        },
        body: request.method === 'POST' ? request.body : undefined,
      })
    } catch (err) {
      return new Response(
        JSON.stringify({ error: `Failed to reach NVIDIA: ${err.message}` }),
        { status: 502, headers: { ...corsHeaders(), 'Content-Type': 'application/json' } }
      )
    }

    // ── Return NVIDIA's response with CORS headers added ────────────
    const body        = await nvResponse.arrayBuffer()
    const contentType = nvResponse.headers.get('Content-Type') || 'application/json'

    return new Response(body, {
      status:  nvResponse.status,
      headers: { ...corsHeaders(), 'Content-Type': contentType },
    })
  },
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin':  '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type, Accept',
    'Access-Control-Max-Age':       '86400',
  }
}
