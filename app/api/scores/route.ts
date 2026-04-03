import { NextResponse } from 'next/server';
import { getLiveScores } from '@/lib/data';

// Lightweight endpoint for score polling — uses a 10-second ESPN cache for near real-time scores
export async function GET() {
  const games = await getLiveScores();
  const scores = games.map(g => ({
    id: g.id,
    status: g.status,
    home_team_score: g.home_team_score,
    visitor_team_score: g.visitor_team_score,
    time: g.time,
    broadcast: g.broadcast ?? null,
  }));
  return NextResponse.json({ scores });
}
