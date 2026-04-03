import { Game, InjuryReport } from './types';
import gamesFixture from '../fixtures/games-tonight.json';
import standingsFixture from '../fixtures/standings.json';
import recentResultsFixture from '../fixtures/recent-results.json';

const ESPN = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba';

// ——— Module-level ESPN cache ———
// Persists across requests in the same Node.js process, preventing redundant network calls.
const _cache = new Map<string, { data: unknown; expires: number }>();

async function espnFetch<T>(
  key: string,
  url: string,
  ttlMs: number,
  timeoutMs = 4000,
): Promise<T | null> {
  const hit = _cache.get(key);
  if (hit && Date.now() < hit.expires) return hit.data as T;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) return null;
    const data = (await res.json()) as T;
    _cache.set(key, { data, expires: Date.now() + ttlMs });
    return data;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

// ESPN uses non-standard abbreviations for some teams — normalize to BDL/standard
const ESPN_ABBR_MAP: Record<string, string> = {
  GS: 'GSW',
  NO: 'NOP',
  SA: 'SAS',
  NY: 'NYK',
  UTAH: 'UTA',
  WSH: 'WAS',
  BKN: 'BKN',
  PHO: 'PHX',
};

function normalizeAbbr(abbr: string): string {
  return ESPN_ABBR_MAP[abbr] ?? abbr;
}

// ESPN injuries endpoint has team name (not abbreviation) at the top-level entry
const TEAM_NAME_TO_ABBR: Record<string, string> = {
  'Atlanta Hawks': 'ATL', 'Boston Celtics': 'BOS', 'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA', 'Chicago Bulls': 'CHI', 'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL', 'Denver Nuggets': 'DEN', 'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW', 'Houston Rockets': 'HOU', 'Indiana Pacers': 'IND',
  'Los Angeles Clippers': 'LAC', 'Los Angeles Lakers': 'LAL', 'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA', 'Milwaukee Bucks': 'MIL', 'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP', 'New York Knicks': 'NYK', 'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL', 'Philadelphia 76ers': 'PHI', 'Phoenix Suns': 'PHX',
  'Portland Trail Blazers': 'POR', 'Sacramento Kings': 'SAC', 'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR', 'Utah Jazz': 'UTA', 'Washington Wizards': 'WAS',
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TeamInfo = any;

export async function getTonightsGames(): Promise<Game[]> {
  // Try ESPN scoreboard first (60-second cache)
  const data = await espnFetch<{ events?: unknown[] }>('scoreboard', `${ESPN}/scoreboard`, 60_000);
  if (data?.events && data.events.length > 0) {
    const parsed = parseESPNGames(data.events);
    if (parsed.length > 0) return parsed;
  }

  // Try BDL
  try {
    const today = new Date().toISOString().split('T')[0];
    const key = process.env.BALLDONTLIE_API_KEY;
    const res = await fetch(
      `https://api.balldontlie.io/v1/games?dates[]=${today}&per_page=100`,
      { headers: key ? { Authorization: key } : {} },
    );
    if (res.ok) {
      const bdl = await res.json();
      if (bdl.data?.length > 0) return parseBDLGames(bdl.data);
    }
  } catch { /* fall through */ }

  return gamesFixture as Game[];
}

export async function getStandings() {
  // 5-minute cache
  const data = await espnFetch<unknown>('standings', `${ESPN}/standings`, 300_000);
  if (data) {
    const parsed = parseESPNStandings(data);
    if (parsed.west.length > 0 && parsed.east.length > 0) return parsed;
  }
  return standingsFixture;
}

export async function getInjuries(): Promise<InjuryReport[]> {
  // 5-minute cache
  const data = await espnFetch<{ injuries?: unknown[] }>('injuries', `${ESPN}/injuries`, 300_000);
  if (!data?.injuries) return [];

  const injuries: InjuryReport[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const teamEntry of (data.injuries as any[])) {
    const teamAbbr = TEAM_NAME_TO_ABBR[teamEntry.displayName as string] || '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const item of (teamEntry.injuries as any[] || [])) {
      const status: string = item.status || 'Unknown';
      if (['Out', 'Questionable', 'Doubtful', 'Day-To-Day', 'GTD'].includes(status)) {
        const injuryDesc = item.shortComment
          ? item.shortComment.split(',')[0].replace(/\([^)]+\)\s*/, '').trim()
          : 'injury';
        injuries.push({
          player: item.athlete?.displayName || 'Unknown',
          team: teamAbbr,
          status,
          injury: injuryDesc.slice(0, 80),
        });
      }
    }
  }
  return injuries;
}

export function getRecentResults() {
  return recentResultsFixture;
}

// ESPN numeric team IDs mapped from normalized abbreviations
const ABBR_TO_ESPN_ID: Record<string, number> = {
  ATL: 1, BOS: 2, BKN: 17, CHA: 30, CHI: 4, CLE: 5,
  DAL: 6, DEN: 7, DET: 8, GSW: 9, HOU: 10, IND: 11,
  LAC: 12, LAL: 13, MEM: 29, MIA: 14, MIL: 15, MIN: 16,
  NOP: 3, NYK: 18, OKC: 25, ORL: 19, PHI: 20, PHX: 21,
  POR: 22, SAC: 23, SAS: 24, TOR: 28, UTA: 26, WAS: 27,
};

// Live player-name → ESPN numeric ID cache (populated when rosters are fetched)
const _livePlayerIds = new Map<string, string>();

export function getLivePlayerId(name: string): string | null {
  if (!name) return null;
  const key = name.toLowerCase().replace(/['']/g, "'").trim();
  return _livePlayerIds.get(key) ?? null;
}

// Fetch current roster for a team (1-hour cache — rosters don't change mid-game)
export async function getTeamRoster(abbr: string): Promise<string[]> {
  const espnId = ABBR_TO_ESPN_ID[abbr];
  if (!espnId) return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await espnFetch<any>(`roster_${espnId}`, `${ESPN}/teams/${espnId}/roster`, 3_600_000, 5000);
  if (!data) return [];
  // ESPN roster athletes may be flat or grouped by position group [{items:[...]}]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const athletes: any[] = Array.isArray(data.athletes)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? data.athletes.flatMap((g: any) => Array.isArray(g.items) ? g.items : [g])
    : [];
  // Cache player IDs from live ESPN data — more reliable than hardcoded table
  for (const a of athletes) {
    const name: string = a.displayName || a.fullName || '';
    const id: string = String(a.id || a.uid?.split(':').pop() || '');
    if (name && id) {
      _livePlayerIds.set(name.toLowerCase().replace(/['']/g, "'").trim(), id);
    }
  }
  return athletes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((a: any) => a.displayName || a.fullName || '')
    .filter(Boolean)
    .slice(0, 13);
}

// ——— Parsers ———

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseESPNGames(events: any[]): Game[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return events.flatMap((event: any) => {
    try {
      const comp = event.competitions?.[0];
      if (!comp) return [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const home = comp.competitors?.find((c: any) => c.homeAway === 'home');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const away = comp.competitors?.find((c: any) => c.homeAway === 'away');
      if (!home || !away) return [];

      const statusName = comp.status?.type?.name || 'STATUS_SCHEDULED';
      const rawDetail = comp.status?.type?.shortDetail || '';
      // Keep full shortDetail for in-progress/halftime; strip prefix for scheduled times
      const statusDetail = rawDetail.includes(' - ') ? rawDetail.split(' - ')[1] : rawDetail;

      let status = 'scheduled';
      if (statusName === 'STATUS_IN_PROGRESS' || statusName === 'STATUS_HALFTIME') status = 'in_progress';
      else if (statusName === 'STATUS_FINAL' || statusName === 'STATUS_FINAL_OT' || statusName === 'STATUS_FINAL_2OT') status = 'final';

      // For halftime, override display string to something friendly
      const displayTime = statusName === 'STATUS_HALFTIME' ? 'Half' : (statusDetail || 'TBD');

      // Extract national broadcast network
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const broadcasts: any[] = comp.broadcasts || comp.geoBroadcasts || [];
      let broadcast: string | null = null;
      for (const b of broadcasts) {
        const name: string = b?.media?.shortName || b?.media?.callLetters || b?.names?.[0] || '';
        if (name) { broadcast = name; break; }
      }

      const makeTeam = (c: TeamInfo): TeamInfo => ({
        id: parseInt(c.team?.id || '0'),
        name: c.team?.shortDisplayName || c.team?.name || '',
        full_name: c.team?.displayName || '',
        abbreviation: normalizeAbbr(c.team?.abbreviation || ''),
        city: c.team?.location || '',
        conference: '',
        division: '',
        logo: c.team?.logo || '',
        color: c.team?.color ? `#${c.team.color}` : '',
      });

      return [{
        id: String(event.id),
        date: event.date?.split('T')[0] || new Date().toISOString().split('T')[0],
        status,
        time: displayTime,
        home_team: makeTeam(home),
        visitor_team: makeTeam(away),
        home_team_score: parseInt(home.score || '0') || 0,
        visitor_team_score: parseInt(away.score || '0') || 0,
        broadcast,
      }];
    } catch {
      return [];
    }
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseBDLGames(games: any[]): Game[] {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return games.map((g: any) => ({
    id: String(g.id),
    date: g.date,
    status: g.status === 'scheduled' ? 'scheduled' : g.status,
    time: g.status === 'scheduled' ? formatGameTime(g.time) : g.status,
    home_team: {
      id: g.home_team.id,
      name: g.home_team.name,
      full_name: g.home_team.full_name,
      abbreviation: g.home_team.abbreviation,
      city: g.home_team.city,
      conference: g.home_team.conference,
      division: g.home_team.division,
    },
    visitor_team: {
      id: g.visitor_team.id,
      name: g.visitor_team.name,
      full_name: g.visitor_team.full_name,
      abbreviation: g.visitor_team.abbreviation,
      city: g.visitor_team.city,
      conference: g.visitor_team.conference,
      division: g.visitor_team.division,
    },
    home_team_score: g.home_team_score || 0,
    visitor_team_score: g.visitor_team_score || 0,
    broadcast: null,
  }));
}

// Live scores fetch with a short 10-second cache (separate key so it doesn't pollute the 60s context cache)
export async function getLiveScores(): Promise<Game[]> {
  const data = await espnFetch<{ events?: unknown[] }>('scoreboard_live', `${ESPN}/scoreboard`, 10_000);
  if (data?.events && data.events.length > 0) {
    const parsed = parseESPNGames(data.events);
    if (parsed.length > 0) return parsed;
  }
  return getTonightsGames(); // fallback to normal fetch
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseESPNStandings(data: any): { west: any[]; east: any[] } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: { west: any[]; east: any[] } = { west: [], east: [] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const conf of (data.children || [])) {
    const isWest = (conf.name || '').toLowerCase().includes('west');
    const entries = conf.standings?.entries || [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teams = entries.map((entry: any) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const stats = entry.stats || [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getStat = (name: string) => stats.find((s: any) => s.name === name)?.value ?? 0;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const getDisplay = (abbr: string) => stats.find((s: any) => s.abbreviation === abbr || s.name === abbr)?.displayValue || '';
      const wins = getStat('wins');
      const losses = getStat('losses');
      return {
        rank: 0,
        team: entry.team?.displayName || '',
        abbreviation: normalizeAbbr(entry.team?.abbreviation || ''),
        wins,
        losses,
        pct: wins + losses > 0 ? wins / (wins + losses) : 0,
        gb: getDisplay('gamesBehind') || '-',
        streak: getDisplay('streak') || '',
        last10: getDisplay('L10') || getDisplay('Last Ten Games') || '?',
      };
    })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .sort((a: any, b: any) => b.pct - a.pct)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((t: any, i: number) => ({ ...t, rank: i + 1 }));

    if (isWest) result.west = teams;
    else result.east = teams;
  }
  return result;
}

function formatGameTime(timeStr: string): string {
  if (!timeStr) return 'TBD';
  try {
    const d = new Date(timeStr);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric', minute: '2-digit',
      timeZoneName: 'short', timeZone: 'America/New_York',
    });
  } catch { return timeStr; }
}
