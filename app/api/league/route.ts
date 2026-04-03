import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getStandings, getInjuries, getTonightsGames } from '@/lib/data';
import { StorylineTagType, LeagueStoryItem } from '@/lib/types';
import { cacheGet, cacheSet } from '@/lib/cache';

export const maxDuration = 60;

const CACHE_TTL_S = 20 * 60;

const VALID_TAGS: StorylineTagType[] = [
  'rivalry_renewed','playoff_war','upset_alert','revenge_game',
  'star_showdown','seeding_shakeup','on_a_heater','on_the_ropes',
  'your_team_impact','history_tonight',
];
const VALID_CATEGORIES = ['transaction', 'injury', 'milestone', 'performance', 'controversy'];
const VALID_IMPACTS = ['high', 'medium', 'low'];

export async function GET() {
  const today = new Date().toISOString().split('T')[0];
  const cacheKey = `league:${today}`;

  const hit = await cacheGet<{ league_pulse: unknown[]; league_stories: unknown[] }>(cacheKey);
  if (hit && Array.isArray(hit.league_pulse) && hit.league_pulse.length > 0) return NextResponse.json(hit);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ league_pulse: [], league_stories: [] });

  try {
    const [standings, injuries, games] = await Promise.all([
      getStandings(),
      getInjuries(),
      getTonightsGames(),
    ]);

    // Compact standings summary
    const westLines = standings.west.slice(0, 10).map((t, i) =>
      `${i + 1}. ${t.abbreviation} ${t.wins}-${t.losses} | ${t.streak} | L10:${t.last10}`
    ).join('\n');
    const eastLines = standings.east.slice(0, 10).map((t, i) =>
      `${i + 1}. ${t.abbreviation} ${t.wins}-${t.losses} | ${t.streak} | L10:${t.last10}`
    ).join('\n');

    // Top injuries
    const keyInjuries = injuries
      .filter(i => i.status === 'Out' || i.status === 'Doubtful')
      .slice(0, 12)
      .map(i => `${i.player} (${i.team}, ${i.status}: ${i.injury})`)
      .join('; ');

    // Tonight's games (just matchups)
    const gameMatchups = games.map(g => `${g.visitor_team.abbreviation} @ ${g.home_team.abbreviation}`).join(', ');

    // Dynamic team storylines derived from live standings (replaces stale fixture)
    const allTeams = [...standings.west, ...standings.east];
    const notableLines = allTeams
      .filter(t => t.streak && t.last10 && t.last10 !== '?')
      .map(t => {
        const streakNum = parseInt(t.streak.slice(1)) || 0;
        const streakType = t.streak[0]; // 'W' or 'L'
        const [w10str] = (t.last10 || '0-0').split('-');
        const w10 = parseInt(w10str) || 0;
        const parts: string[] = [`${t.abbreviation}: ${t.wins}-${t.losses}`];
        if (streakNum >= 4) parts.push(`on ${t.streak} ${streakType === 'W' ? 'win' : 'loss'} streak`);
        if (w10 >= 8) parts.push(`scorching (${t.last10} L10)`);
        else if (w10 <= 2) parts.push(`struggling (${t.last10} L10)`);
        if (t.rank <= 3) parts.push(`${t.rank === 1 ? '#1 seed' : `#${t.rank} seed`}`);
        return parts.join(', ');
      })
      .slice(0, 10)
      .join('\n');

    const systemPrompt = `You are an NBA analyst covering league-wide narratives. Be punchy, specific, and opinionated. No clichés. Respond ONLY with valid JSON.`;

    const userPrompt = `Today: ${today}
Tonight's games: ${gameMatchups}

WEST standings (top 10):
${westLines}

EAST standings (top 10):
${eastLines}

Key injuries/absences: ${keyInjuries || 'None reported'}

Recent team storylines:
${notableLines || 'None'}

Return this JSON:
{
  "league_pulse": [
    {
      "headline": "Under 8 words, punchy",
      "summary": "1 sentence with specific players/numbers.",
      "tag": "valid_tag",
      "teams_involved": ["ABBR"],
      "players_involved": ["Full Name"]
    }
  ],
  "league_stories": [
    {
      "headline": "Under 10 words, punchy, factual",
      "summary": "2 sentences with specific details — player names, teams, numbers.",
      "detail": "3-4 sentences of deeper analysis: context, historical comparison, what it means for the rest of the season.",
      "category": "transaction|injury|milestone|performance|controversy",
      "teams_involved": ["ABBR"],
      "players_involved": ["Full Name"],
      "impact": "high|medium|low"
    }
  ]
}

Generate 4-5 league_pulse items and 4-5 league_stories. Only use information from the data provided above — do not invent transactions or milestones you are not confident about.
Valid tags: rivalry_renewed, playoff_war, upset_alert, revenge_game, star_showdown, seeding_shakeup, on_a_heater, on_the_ropes, your_team_impact, history_tonight`;

    const client = new OpenAI({ apiKey });
    const completion = await client.chat.completions.create({
      model: 'gpt-4.1-mini',
      max_tokens: 1200,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
    });

    const responseText = completion.choices[0]?.message?.content || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let parsed: any;
    try {
      parsed = JSON.parse(responseText.replace(/^```json?\n?/m, '').replace(/\n?```$/m, '').trim());
    } catch {
      return NextResponse.json({ league_pulse: [], league_stories: [] });
    }

    const response = {
      league_pulse: (parsed.league_pulse || []).map((item: { tag: string }) => ({
        ...item,
        tag: VALID_TAGS.includes(item.tag as StorylineTagType) ? item.tag : 'playoff_war',
      })),
      league_stories: (parsed.league_stories || []).map((s: LeagueStoryItem) => ({
        ...s,
        category: VALID_CATEGORIES.includes(s.category) ? s.category : 'performance',
        impact: VALID_IMPACTS.includes(s.impact) ? s.impact : 'medium',
      })),
    };

    await cacheSet(cacheKey, response, CACHE_TTL_S);
    return NextResponse.json(response);

  } catch (error) {
    console.error('/api/league error:', error);
    return NextResponse.json({ league_pulse: [], league_stories: [] });
  }
}
