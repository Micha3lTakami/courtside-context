import { NextResponse } from 'next/server';
import { getTonightsGames, getStandings } from '@/lib/data';
import { GameWithContext } from '@/lib/types';

export async function GET() {
  const [games, standings] = await Promise.all([getTonightsGames(), getStandings()]);
  if (!games || games.length === 0) return NextResponse.json({ games: [] });

  const byAbbr: Record<string, { record: string; streak: string; rank: number; conf: string }> = {};
  for (const s of standings.west) {
    byAbbr[s.abbreviation] = { record: `${s.wins}-${s.losses}`, streak: s.streak || '', rank: s.rank, conf: 'West' };
  }
  for (const s of standings.east) {
    byAbbr[s.abbreviation] = { record: `${s.wins}-${s.losses}`, streak: s.streak || '', rank: s.rank, conf: 'East' };
  }

  const out: GameWithContext[] = games.map(g => {
    const h = byAbbr[g.home_team.abbreviation] || { record: '', streak: '', rank: 0, conf: '' };
    const a = byAbbr[g.visitor_team.abbreviation] || { record: '', streak: '', rank: 0, conf: '' };
    return {
      ...g,
      storyline_tags: [],
      must_watch_score: 0,
      headline: '',
      context_brief: '',
      game_recap: null,
      stakes: null,
      key_matchup: null,
      last_meeting: null,
      your_team_note: null,
      your_team_win_scenario: null,
      your_team_loss_scenario: null,
      home_team_record: h.record,
      home_team_streak: h.streak,
      visitor_team_record: a.record,
      visitor_team_streak: a.streak,
    };
  });

  return NextResponse.json({ games: out });
}
