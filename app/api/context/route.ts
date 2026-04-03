import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getTonightsGames, getStandings, getInjuries } from '@/lib/data';
import { AIContextResponse, GameWithContext, StorylineTagType } from '@/lib/types';
import { cacheGet, cacheSet } from '@/lib/cache';

// Raise Vercel function timeout — default 10s is not enough for ESPN fetches + OpenAI
export const maxDuration = 60;

const CACHE_TTL_S = 20 * 60;

// ——— Valid tags ———
const VALID_TAGS: StorylineTagType[] = [
  'rivalry_renewed','playoff_war','upset_alert','revenge_game',
  'star_showdown','seeding_shakeup','on_a_heater','on_the_ropes',
  'your_team_impact','history_tonight',
];

function gb(tw: number, tl: number, lw: number, ll: number) {
  return ((lw - tw) + (tl - ll)) / 2;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function emptyGame(g: any): GameWithContext {
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
    home_team_record: g.home_team_record || '',
    home_team_streak: g.home_team_streak || '',
    visitor_team_record: g.visitor_team_record || '',
    visitor_team_streak: g.visitor_team_streak || '',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const selectedTeam = searchParams.get('team') || '';
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `${today}:${selectedTeam}`;

  const hit = await cacheGet<{ games: GameWithContext[]; viewing_plan: unknown }>(cacheKey);
  // Only serve cache if it actually contains context (prevents stale empty-context responses)
  if (hit?.games?.some(g => g.context_brief || g.storyline_tags?.length > 0)) {
    return NextResponse.json(hit);
  }

  try {
    const [games, standings, injuries] = await Promise.all([
      getTonightsGames(),
      getStandings(),
      getInjuries(),
    ]);

    if (!games || games.length === 0) return NextResponse.json({ games: [], viewing_plan: null, league_pulse: [] });

    // ——— Standings enrichment ———
    const wl = standings.west[0];
    const el = standings.east[0];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const enrichStandings = (list: any[], leader: any, conf: string) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      list.map((t: any) => {
        const gamesBack = gb(t.wins, t.losses, leader.wins, leader.losses);
        const rank6 = list[5];
        const rank8 = list[7];
        return {
          rank: t.rank,
          conf,
          team: t.team,
          abbr: t.abbreviation,
          record: `${t.wins}-${t.losses}`,
          streak: t.streak,
          last10: t.last10,
          gb_from_1: gamesBack === 0 ? 'LEADER' : `${gamesBack} back of 1-seed`,
          gb_from_playoffs: rank6 ? (() => { const d = gb(t.wins, t.losses, rank6.wins, rank6.losses); return d <= 0 ? `${Math.abs(d)} ahead of play-in cutoff` : `${d} back of playoff spot`; })() : null,
          gb_from_playin: rank8 ? (() => { const d = gb(t.wins, t.losses, rank8.wins, rank8.losses); return d <= 0 ? `${Math.abs(d)} ahead of play-in line` : `${d} back of play-in`; })() : null,
          playoff_status: t.rank <= 6 ? 'IN PLAYOFFS' : t.rank <= 10 ? 'PLAY-IN' : 'ELIMINATED FROM PLAYOFFS',
        };
      });

    const westEnriched = enrichStandings(standings.west, wl, 'West');
    const eastEnriched = enrichStandings(standings.east, el, 'East');
    const allStandings = [...westEnriched, ...eastEnriched];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const standingByAbbr = Object.fromEntries(allStandings.map((s: any) => [s.abbr, s]));

    // ——— Per-team context from standings ———
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teamContext: Record<string, any> = {};
    games.forEach(g => {
      [g.home_team.abbreviation, g.visitor_team.abbreviation].forEach(abbr => {
        teamContext[abbr] = { standing: standingByAbbr[abbr] || null };
      });
    });

    // ——— Per-team injury lookup (for embedding into each game) ———
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const injuriesByTeam: Record<string, { player: string; status: string; injury: string }[]> = {};
    for (const inj of injuries) {
      if (!injuriesByTeam[inj.team]) injuriesByTeam[inj.team] = [];
      injuriesByTeam[inj.team].push({ player: inj.player, status: inj.status, injury: inj.injury });
    }

    // ——— Games data for prompt: injury list embedded per game ———
    const gamesForPrompt = games.map(g => {
      const hCtx = teamContext[g.home_team.abbreviation] || {};
      const aCtx = teamContext[g.visitor_team.abbreviation] || {};
      const hInj = injuriesByTeam[g.home_team.abbreviation] || [];
      const aInj = injuriesByTeam[g.visitor_team.abbreviation] || [];
      const outHome = hInj.filter(i => i.status === 'Out' || i.status === 'Doubtful')
        .map(i => `${i.player} (${i.status})`);
      const outAway = aInj.filter(i => i.status === 'Out' || i.status === 'Doubtful')
        .map(i => `${i.player} (${i.status})`);
      const limitedHome = hInj.filter(i => i.status === 'Questionable' || i.status === 'Day-To-Day' || i.status === 'GTD')
        .map(i => `${i.player} (${i.status})`);
      const limitedAway = aInj.filter(i => i.status === 'Questionable' || i.status === 'Day-To-Day' || i.status === 'GTD')
        .map(i => `${i.player} (${i.status})`);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flatStanding = (st: any) => st ? `${st.record} rank:${st.rank} ${st.streak} L10:${st.last10} ${st.playoff_status}` : '';
      return {
        game_id: g.id,
        status: g.status,
        score: g.status !== 'scheduled' ? `${g.visitor_team_score}-${g.home_team_score}` : null,
        time: g.time,
        home: {
          abbr: g.home_team.abbreviation,
          standing: flatStanding(hCtx.standing),
          OUT: outHome,
          LIMITED: limitedHome,
        },
        away: {
          abbr: g.visitor_team.abbreviation,
          standing: flatStanding(aCtx.standing),
          OUT: outAway,
          LIMITED: limitedAway,
        },
      };
    });

    // ——— Prompt ———
    const systemPrompt = `You are a hardcore NBA analyst. Be specific, opinionated, casual. No clichés.

RULES:
1. OUT[] players are not playing — never mention them as active.
2. Use your training knowledge for current-season stats and rosters. Standings data overrides anything you know about records.
3. For "final" games: write game_recap (2-3 sentences: who won, margin, key performers). For "in_progress": 1-sentence live take. For "scheduled": null.

Respond ONLY with valid JSON.`;

    const userPrompt = `Today: ${today}. User's team: ${selectedTeam || 'None'}

West: ${westEnriched.map((t: { rank: number; abbr: string; record: string; streak: string; last10: string; playoff_status: string }) => `${t.rank}.${t.abbr} ${t.record} ${t.streak} L10:${t.last10}`).join(' | ')}
East: ${eastEnriched.map((t: { rank: number; abbr: string; record: string; streak: string; last10: string; playoff_status: string }) => `${t.rank}.${t.abbr} ${t.record} ${t.streak} L10:${t.last10}`).join(' | ')}

Games:
${JSON.stringify(gamesForPrompt)}

Return exactly this JSON structure:
{
  "games": [
    {
      "game_id": "string",
      "home_team": "ABBR",
      "away_team": "ABBR",
      "must_watch_score": 7,
      "headline": "Under 12 words, punchy, specific",
      "storyline_tags": ["tag1"],
      "context_brief": "2-3 sentences preview. Reference specific players, standings, injuries. No clichés. Always populate even for live/final games (keep as pre-game preview).",
      "game_recap": "For final: 2-3 sentences on who won, margin, key performers. For in_progress: 1 sentence live take. For scheduled: null.",
      "your_team_note": "One sentence. null if no connection.",
      "your_team_win_scenario": null,
      "your_team_loss_scenario": null
    }
  ],
  "viewing_plan": ${selectedTeam ? `{
    "your_game": { "matchup": "TEAM vs TEAM", "time": "HH:MM PM ET", "headline": "One sentence why tonight matters" },
    "watch_before": { "matchup": "TEAM vs TEAM", "time": "HH:MM PM ET", "reason": "Why this matters to your team" },
    "watch_after": { "matchup": "TEAM vs TEAM", "time": "HH:MM PM ET", "reason": "Why worth staying up" },
    "sleeper_pick": { "matchup": "TEAM vs TEAM", "time": "HH:MM PM ET", "reason": "Pure entertainment value" }
  }` : 'null'}
}

Valid tags: rivalry_renewed, playoff_war, upset_alert, revenge_game, star_showdown, seeding_shakeup, on_a_heater, on_the_ropes, your_team_impact, history_tonight`;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ games: games.map(emptyGame), viewing_plan: null, league_pulse: [] });
    }

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 2400,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';
    let aiData: AIContextResponse;
    try {
      aiData = JSON.parse(responseText.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim());
    } catch {
      return NextResponse.json({ games: games.map(emptyGame), viewing_plan: null, league_pulse: [] });
    }

    // ——— Merge AI with game data ———
    const gamesWithContext: GameWithContext[] = games.map(game => {
      const ctx = aiData.games.find(cg => cg.game_id === game.id);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const h = standingByAbbr[game.home_team.abbreviation] as any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const a = standingByAbbr[game.visitor_team.abbreviation] as any;
      return {
        ...game,
        storyline_tags: ctx ? ctx.storyline_tags.filter(t => VALID_TAGS.includes(t as StorylineTagType)) as StorylineTagType[] : [],
        must_watch_score: ctx?.must_watch_score ?? 0,
        headline: ctx?.headline || '',
        context_brief: ctx?.context_brief || '',
        game_recap: ctx?.game_recap || null,
        stakes: ctx?.stakes || null,
        key_matchup: ctx?.key_matchup || null,
        last_meeting: ctx?.last_meeting || null,
        your_team_note: ctx?.your_team_note || null,
        your_team_win_scenario: ctx?.your_team_win_scenario || null,
        your_team_loss_scenario: ctx?.your_team_loss_scenario || null,
        home_team_record: h?.record || '',
        home_team_streak: h?.streak || '',
        visitor_team_record: a?.record || '',
        visitor_team_streak: a?.streak || '',
      };
    });

    gamesWithContext.sort((a, b) => {
      if (b.must_watch_score !== a.must_watch_score) return b.must_watch_score - a.must_watch_score;
      return b.storyline_tags.length - a.storyline_tags.length;
    });

    const response = {
      games: gamesWithContext,
      viewing_plan: aiData.viewing_plan || null,
    };

    await cacheSet(cacheKey, response, CACHE_TTL_S);
    return NextResponse.json(response);

  } catch (error) {
    console.error('/api/context error:', error);
    return NextResponse.json({ games: [], viewing_plan: null, league_pulse: [] }, { status: 500 });
  }
}
