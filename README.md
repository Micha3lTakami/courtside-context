# Courtside Context

![Next.js](https://img.shields.io/badge/Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI_GPT--4.1--mini-412991?style=for-the-badge&logo=openai&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)
![ESPN API](https://img.shields.io/badge/ESPN_API-FF0000?style=for-the-badge&logo=espn&logoColor=white)

> **Live:** [courtside-context.vercel.app](https://courtside-context.vercel.app)

---

## About

<!-- INSERT YOUR 500-WORD WRITE-UP HERE -->

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
