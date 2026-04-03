import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60;
import OpenAI from 'openai';
import { getStandings, getInjuries, getTeamRoster, getLivePlayerId } from '@/lib/data';
import { StakesData, KeyMatchup, LastMeeting } from '@/lib/types';
import { cacheGet, cacheSet } from '@/lib/cache';
import { getESPNPlayerId } from '@/lib/players';

const CACHE_TTL_S = 30 * 60; // 30 minutes

export interface GameDetailResponse {
  stakes: StakesData | null;
  key_matchup: KeyMatchup | null;
  last_meeting: LastMeeting | null;
  your_team_win_scenario: string | null;
  your_team_loss_scenario: string | null;
}

const NULL_RESPONSE: GameDetailResponse = {
  stakes: null, key_matchup: null, last_meeting: null,
  your_team_win_scenario: null, your_team_loss_scenario: null,
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get('gameId') || '';
  const homeAbbr = searchParams.get('home') || '';
  const awayAbbr = searchParams.get('away') || '';
  const selectedTeam = searchParams.get('team') || '';

  if (!homeAbbr || !awayAbbr) {
    return NextResponse.json({ error: 'Missing team params' }, { status: 400 });
  }

  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `detail:${today}:${gameId}:${selectedTeam}`;
  const hit = await cacheGet<GameDetailResponse>(cacheKey);
  if (hit) return NextResponse.json(hit);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json(NULL_RESPONSE);

  try {
    const [standings, injuries, homeRoster, awayRoster] = await Promise.all([
      getStandings(),
      getInjuries(),
      getTeamRoster(homeAbbr),
      getTeamRoster(awayAbbr),
    ]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allStandings = [...standings.west, ...standings.east] as any[];
    const homeSt = allStandings.find(s => s.abbreviation === homeAbbr);
    const awaySt = allStandings.find(s => s.abbreviation === awayAbbr);

    const relevantInjuries = injuries.filter(i => [homeAbbr, awayAbbr].includes(i.team));
    const homeOut = relevantInjuries.filter(i => i.team === homeAbbr && (i.status === 'Out' || i.status === 'Doubtful')).map(i => i.player);
    const awayOut = relevantInjuries.filter(i => i.team === awayAbbr && (i.status === 'Out' || i.status === 'Doubtful')).map(i => i.player);
    const homeLimited = relevantInjuries.filter(i => i.team === homeAbbr && !['Out','Doubtful'].includes(i.status)).map(i => `${i.player} (${i.status})`);
    const awayLimited = relevantInjuries.filter(i => i.team === awayAbbr && !['Out','Doubtful'].includes(i.status)).map(i => `${i.player} (${i.status})`);

    // Remove injured/out players from roster for cleaner AI context
    const homeAvailable = homeRoster.filter(p => !homeOut.includes(p));
    const awayAvailable = awayRoster.filter(p => !awayOut.includes(p));

    const prompt = `You are a sharp NBA analyst. Deep-dive for: ${awayAbbr} @ ${homeAbbr}.

${homeAbbr}: ${homeSt ? `${homeSt.wins}-${homeSt.losses}, rank ${homeSt.rank}, ${homeSt.streak} streak, L10: ${homeSt.last10}` : 'N/A'}
CURRENT ROSTER: ${homeAvailable.length ? homeAvailable.join(', ') : 'N/A'}
OUT TONIGHT: ${homeOut.length ? homeOut.join(', ') : 'none'}
LIMITED: ${homeLimited.length ? homeLimited.join(', ') : 'none'}

${awayAbbr}: ${awaySt ? `${awaySt.wins}-${awaySt.losses}, rank ${awaySt.rank}, ${awaySt.streak} streak, L10: ${awaySt.last10}` : 'N/A'}
CURRENT ROSTER: ${awayAvailable.length ? awayAvailable.join(', ') : 'N/A'}
OUT TONIGHT: ${awayOut.length ? awayOut.join(', ') : 'none'}
LIMITED: ${awayLimited.length ? awayLimited.join(', ') : 'none'}

USER TEAM: ${selectedTeam || 'None'}

RULES:
- OUT TONIGHT players cannot play — never pick them for key_matchup.
- key_matchup: MUST pick players from CURRENT ROSTER above — these are the actual current players on each team. Do not use players not listed there.
- Pick the two available players whose matchup most decides this game (use your knowledge of their stats/roles).
- STATS: For the signature stat, choose the player's MOST IMPRESSIVE stat: for a scorer use 3P% or TS%, for a playmaker use APG or STL, for a big use BPG or REB.
- ppg is REQUIRED for any NBA regular starter.
- apg: include if the player averages 4+ APG.
- rpg: include if the player averages 6+ RPG.
- fg_pct: decimal 0.0–1.0 (e.g. 0.487 for 48.7%).
- signature_stat_value: format as string, e.g. "2.1 BPG", "38.5%", "1.9 STL".
- If you'd be guessing at a specific stat, use null — ppg is the one exception where you must provide it.
- Season series: only if you have solid data, else null.

Return valid JSON only:
{
  "stakes": {
    "home_win_scenario": "What changes for ${homeAbbr} if they win",
    "away_win_scenario": "What changes for ${awayAbbr} if they win",
    "playoff_context": "Where both teams sit in the race right now",
    "season_series": "H2H record this season, or null"
  },
  "key_matchup": {
    "player_a": "Full Name",
    "player_a_team": "${homeAbbr}",
    "player_a_stats": { "ppg": 0, "apg": null, "rpg": null, "fg_pct": null, "signature_stat_label": "BEST STAT LABEL", "signature_stat_value": "VALUE" },
    "player_b": "Full Name",
    "player_b_team": "${awayAbbr}",
    "player_b_stats": { "ppg": 0, "apg": null, "rpg": null, "fg_pct": null, "signature_stat_label": "BEST STAT LABEL", "signature_stat_value": "VALUE" },
    "matchup_narrative": "2-3 sentences on why this matchup decides the game"
  },
  "last_meeting": {
    "date": "Month DD, YYYY or null",
    "score": "${homeAbbr} XXX, ${awayAbbr} XXX or null",
    "recap": "2-3 sentences or null"
  },
  "your_team_win_scenario": ${selectedTeam ? `"One sentence impact for ${selectedTeam}, or null"` : 'null'},
  "your_team_loss_scenario": ${selectedTeam ? `"One sentence impact for ${selectedTeam}, or null"` : 'null'}
}`;

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 1400,
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let detail: GameDetailResponse;
    try {
      detail = JSON.parse(responseText);
    } catch {
      return NextResponse.json(NULL_RESPONSE);
    }

    // Attach ESPN player IDs — prefer live IDs from roster fetch, fall back to hardcoded table
    if (detail.key_matchup) {
      detail.key_matchup.player_a_id =
        getLivePlayerId(detail.key_matchup.player_a) ?? getESPNPlayerId(detail.key_matchup.player_a);
      detail.key_matchup.player_b_id =
        getLivePlayerId(detail.key_matchup.player_b) ?? getESPNPlayerId(detail.key_matchup.player_b);
    }

    await cacheSet(cacheKey, detail, CACHE_TTL_S);
    return NextResponse.json(detail);

  } catch (err) {
    console.error('/api/game-detail error:', err);
    return NextResponse.json(NULL_RESPONSE, { status: 500 });
  }
}
