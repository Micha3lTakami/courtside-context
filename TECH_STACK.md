# Courtside Context — Tech Stack & Latency Analysis

## Stack Overview

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 14 App Router | Server components + API routes in one repo; zero-config Vercel deployment |
| UI | React + Tailwind CSS | Fast iteration; Tailwind avoids CSS file sprawl |
| Animation | Framer Motion | Spring physics, `AnimatePresence`, `whileHover` — production-grade motion with minimal code |
| AI | OpenAI `gpt-4.1-mini` | Faster and cheaper than gpt-4o-mini with equivalent JSON output quality |
| Live Data | ESPN public APIs (no key) | Free, real-time scoreboard/standings/injuries; undocumented but stable |
| Cache (persistent) | Upstash Redis (REST) | Survives serverless cold starts; shared across all function instances |
| Cache (in-process) | Module-level `Map` | Zero-latency hits within a warm function instance; falls back to Redis |
| Deployment | Vercel (serverless) | Auto-scaling, preview deploys, edge CDN for static assets |
| Images | ESPN CDN (`a.espncdn.com`) | Player headshots and team logos served directly; `unoptimized` to skip Next.js proxy |

---

## Why It's Slow Right Now

### 1. Cold-Start Latency (~800ms–2s)
Vercel serverless functions spin up fresh Node.js processes. The first request after inactivity pays the full cold-start cost: module loading, SDK initialization, and no in-memory cache. Every subsequent request on a warm instance is much faster.

**Root cause:** Serverless is stateless by design. The in-memory ESPN cache (`_cache` Map in `lib/data.ts`) resets on every cold start.

### 2. Serial AI + Data Dependency (~4–8s)
The context route must complete ESPN fetches *before* the OpenAI call, because game data is required to build the prompt. This creates a forced sequential chain:

```
ESPN scoreboard (~300ms)  ─┐
ESPN standings  (~300ms)  ─┼─ await Promise.all → OpenAI gpt-4o-mini (~3–6s)
ESPN injuries   (~300ms)  ─┘
```

Total per request: **~4–7 seconds**. With Vercel's default 10s function timeout, any slowness in ESPN or OpenAI pushes it over the edge (fixed by adding `export const maxDuration = 60`).

### 3. OpenAI Token Generation (~3–6s)
`gpt-4o-mini` generates output at roughly 150–200 tokens/sec. For 6 games × ~300 tokens each = ~1800 output tokens → **~9–12 seconds**. We're now set to `max_tokens: 2400` with a 60s timeout.

`gpt-4o-mini` is the fastest cheap model for JSON generation. Switching to `gpt-4o` would be smarter but ~5× more expensive per token.

### 4. Stale Cache Overwrites Live Scores
Context is cached for 20 minutes. When it loads, it was originally overwriting `status`/`time`/`score` fields with 20-minute-old values. **Fixed** by merging context into `prev` state instead of replacing it entirely.

### 5. Score Polling Drift (Stale Closure Bug)
The original `setInterval`-based score polling captured `games` in a closure at mount time. If no games were live at mount (context hadn't loaded yet), the interval was set to 5 minutes and never rescheduled. **Fixed** with self-rescheduling `setTimeout` that reads fresh data each cycle. No-live interval capped at 60s (was 5min) so games transitioning to live are detected within 1 minute.

### 6. League Fetch Aborted on Team Change
`/api/league` shared the same `AbortController` as `/api/context`. Switching teams aborted context (correct) but also killed the in-flight league request. **Fixed** by giving `/api/league` its own independent `AbortController` ref — context can be re-fetched without nuking the league data.

---

## How to Fix Latency Post-MVP

### Tier 1 — Low effort, high impact

**1. Background AI generation (cron job)**
Instead of generating context on first request, run a scheduled job every 20 minutes that pre-populates the Redis cache. Users always hit a warm cache.

```
Vercel Cron → /api/refresh-context (every 20 min)
  → writes to Redis
User request → cache hit → <100ms response
```

**2. Edge runtime for score polling**
Move `/api/scores` to the Edge runtime (`export const runtime = 'edge'`). Eliminates cold starts for the most-polled endpoint. Edge functions start in ~0ms vs ~800ms for Node.js serverless.

**3. Streaming AI responses**
Use OpenAI streaming (`stream: true`) and stream the JSON to the client as it's generated. Users see content appear progressively instead of waiting for the full response. Perceived performance improves dramatically even if total time is the same.

### Tier 2 — Medium effort, large impact

**4. Background data fetching with SWR / React Query**
Replace the manual `useEffect` fetching with SWR. Benefits: automatic deduplication, background revalidation, optimistic updates, built-in loading states. Score polling becomes `useSWR('/api/scores', fetcher, { refreshInterval: 15000 })`.

**5. Database-backed game context (Postgres/Supabase)**
Store AI-generated context in a proper database. Allow partial reads — show standings and game cards instantly while AI content loads per-game in parallel. Currently everything is one big API call.

```
/api/games     → ESPN scoreboard only (~200ms, no AI)
/api/context/[gameId] → AI context per game, parallelized
```

**6. Pre-fetch rosters + context at build time for today's games**
Use Next.js `generateStaticParams` or ISR (Incremental Static Regeneration) with a short revalidation window. The page serves pre-rendered HTML with context baked in — no loading states at all for initial render.

### Tier 3 — Significant effort, production-grade

**7. WebSocket / SSE for live scores**
Replace polling with Server-Sent Events. The server pushes score updates when they change rather than clients polling every 15s. Reduces API calls by ~80% and eliminates the "15s behind" window.

```
Client subscribes to /api/scores/stream
Server checks ESPN every 5s, pushes changes via SSE
```

**8. ESPN data pipeline (no more direct client fetch)**
Set up a background worker that polls ESPN every 5–10s and writes to Redis. API routes read from Redis instead of calling ESPN directly. Benefits:
- Eliminates ESPN fetch latency from the critical path entirely (~300ms saved per route)
- No risk of ESPN rate-limiting your function IPs
- Data freshness decoupled from request latency

**9. Dedicated AI microservice**
Move OpenAI calls to a long-running service (e.g., Railway, Fly.io) instead of Vercel serverless. Eliminates cold starts for AI calls entirely and allows persistent connection pooling to OpenAI.

---

## Current Performance Budget

| Operation | Time | Blocks UI? |
|-----------|------|-----------|
| Initial page paint | ~100ms | — |
| `/api/games` (basic card data) | ~400ms | Yes (shows skeleton) |
| Score polling (first) | ~300ms | No (background) |
| `/api/context` total | 4–8s | No (shows empty state) |
| `/api/league` total | 3–6s | No (section hidden until ready) |
| `/api/game-detail` (on click) | 3–5s | No (drawer shows skeleton) |

---

## Why These Trade-offs Were Made for MVP

- **Serverless + no DB** → Zero infrastructure to manage, instant Vercel deployment, scales to zero when not in use
- **OpenAI on-demand** → No pre-computation infrastructure, no cron jobs to maintain, always uses current game data
- **ESPN public APIs** → No API key, no cost, no rate limit registration — just works
- **Single Redis cache** → One external dependency vs. a full database setup
- **Module-level in-memory cache** → Free performance win within warm function instances without additional infrastructure

The MVP prioritized **shipping speed and zero ops overhead** over latency. The fixes above represent a natural progression from "works" to "fast" as the product grows.
