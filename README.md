# Courtside Context

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4.1--mini-412991?style=for-the-badge&logo=openai&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![ESPN API](https://img.shields.io/badge/ESPN_API-FF0000?style=for-the-badge&logo=espn&logoColor=white)

## Live Deployed Link
[courtside-context.vercel.app](https://courtside-context.vercel.app)

---

## About

After examining FOX's various industry verticals, I honed in specifically on how sports live event recommendations can be optimized to reduce engagement churn between prime events through AI. Deloitte's 2026 Digital Media Trends report found that streaming churn remains stuck at roughly 40% year over year, and that deepening fan engagement is the primary lever for platforms to unlock growth beyond traditional pricing power (Deloitte, 2026). Across sports media, the challenge isn't just subscription cancellation but engagement drop-off between marquee broadcasts. Fans tune in for a primetime game and don't return until the next one. 

To solve this, I built a personalized NBA second-screen dashboard that recommends games a user typically wouldn't watch by surfacing the storylines, rivalries, and playoff implications relevant to their favorite team. I chose the NBA because the late regular season is when storylines carry the most weight. Seedings are still up in the air, and casual fans have the hardest time figuring out which games actually matter. The product is sport-agnostic and maps directly to FOX's portfolio, from college football Saturdays to NFL Sundays to MLB postseason. It also aligns with FOX's digital expansion into sports betting through its FairPlay Sports Media partnership, where narrative context that surfaces why a game matters is a natural funnel into betting engagement.
I built Courtside Context with Next.js 14 and Tailwind CSS, deployed to Vercel. Live game data, standings, and injury reports pull from ESPN's public APIs, with an in-process memory cache and optional Upstash Redis layer to minimize redundant fetches. The AI layer uses OpenAI's gpt-4.1-mini to generate storyline tag classifications and narrative context briefs. I scaffolded the project using Claude Code, guided by patterns from dashboard products I've shipped previously. A key architecture decision was batching all games into a single AI call per session, keeping cost under $0.02 per user while returning structured JSON for the entire night's slate.

I made a deliberate build vs. buy decision on the AI layer. A custom recommendation model would be the right move at scale for ranking and personalization. But for validating the core product hypothesis, the API route was smarter. Traditional recommendation systems can flag that a team is on a win streak. They can't synthesize that a trade from four months ago created a revenge narrative, or that a player's injury return reshapes a matchup. That narrative synthesis is what transforms a schedule into a viewing guide.
The primary constraint was time. I scoped the MVP with no backend database, no user accounts, and serverless infrastructure that scales to zero. The tradeoff is latency: the serial dependency between ESPN data fetches and AI generation creates a 4-8 second context load. The page shell renders immediately with game cards while AI content fills in behind a skeleton state. At scale, I'd pre-compute context on a schedule and serve from cache, reducing latency to under 200ms. I validated quality by cross-referencing generated storyline tags against real standings data and confirming the briefs surfaced context that casual fans wouldn't already know.

---

## Features

- **Team-personalized dashboard** — pick your team, get a view tailored to your matchup
- **Live score polling** — updates every 15s during games, 60s between games
- **AI context cards** — GPT-generated headlines, storylines, and stakes for every game
- **League Pulse** — top headlines across the whole league, refreshed each session
- **League Stories** — categorized news (trades, injuries, milestones) with tap-to-expand detail panels
- **Your Night** — your team's game highlighted with win/loss scenarios
- **Game Drawer** — player cards with live photos, key stats, and head-to-head matchup breakdown
- **Watch Now links** — deep links to broadcast streams for live games

## Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 14 App Router | SSR + API routes in one repo |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS + CSS variables | Dark-mode-first design system |
| Animation | Framer Motion | Spring physics, gesture variants |
| AI | OpenAI `gpt-4.1-mini` | JSON-mode structured output |
| Data | ESPN Site API (unofficial) | Scores, standings, injuries, rosters |
| Cache | Module-level in-process Map | Survives warm serverless instances |
| Deployment | Vercel Fluid Compute | Auto-scales, 300s function timeout |

## Getting Started

```bash
npm install
cp .env.local.example .env.local   # add your OPENAI_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI context generation |
| `UPSTASH_REDIS_REST_URL` | No | Persistent cache across cold starts |
| `UPSTASH_REDIS_REST_TOKEN` | No | Paired with above |
| `BALLDONTLIE_API_KEY` | No | Fallback game data source |

## Project Structure

```
app/
  page.tsx              # Dashboard — score polling, context orchestration
  api/
    games/              # Initial game list with standings
    scores/             # Live score polling endpoint
    context/            # AI-generated game context (20min cache)
    league/             # AI-generated league pulse + stories
    game-detail/        # AI-generated per-game deep dive
components/
  GameCard.tsx          # Game tile with scores, tags, context brief
  GameDrawer.tsx        # Slide-in detail panel with player cards
  LeaguePulse.tsx       # Top league headlines bar
  LeagueStories.tsx     # Categorized stories with expandable detail panel
  TeamSelect.tsx        # Onboarding team picker
  YourNight.tsx         # Your team's highlighted game section
lib/
  data.ts               # ESPN API fetching, caching, normalization
  teams.ts              # Team colors + logo URLs
  types.ts              # Shared TypeScript interfaces
```

## Storyline Tags

| Tag | Meaning |
|-----|---------|
| Rivalry Renewed | Historic or heated matchup |
| Playoff War | Both teams fighting for seeding |
| Upset Alert | Big underdog has a real shot |
| Revenge Game | Team facing someone they have a score to settle with |
| Star Showdown | Two elite players going head to head |
| Seeding Shakeup | Result could move teams up/down in standings |
| On a Heater | Team/player on a dominant recent run |
| On the Ropes | Team in a concerning skid |
| History Tonight | A milestone or historic moment on the line |
