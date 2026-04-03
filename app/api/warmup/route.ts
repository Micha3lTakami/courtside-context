import { NextRequest, NextResponse } from 'next/server';

// Hits /api/context and /api/league in parallel to pre-populate their caches.
// Call this once daily around 6 PM ET before games start.
// Protect with a secret token so it can't be abused publicly.
//
// Usage: GET /api/warmup?secret=YOUR_WARMUP_SECRET

export async function GET(request: NextRequest) {
  const secret = process.env.WARMUP_SECRET;
  if (secret && request.nextUrl.searchParams.get('secret') !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const base = request.nextUrl.origin;

  const start = Date.now();
  const [contextResult, leagueResult] = await Promise.allSettled([
    fetch(`${base}/api/context`).then(r => r.ok ? 'ok' : `http ${r.status}`),
    fetch(`${base}/api/league`).then(r => r.ok ? 'ok' : `http ${r.status}`),
  ]);

  return NextResponse.json({
    warmed: true,
    elapsed_ms: Date.now() - start,
    context: contextResult.status === 'fulfilled' ? contextResult.value : contextResult.reason?.message,
    league: leagueResult.status === 'fulfilled' ? leagueResult.value : leagueResult.reason?.message,
  });
}
