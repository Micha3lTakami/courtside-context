import { NBATeam } from './types';

export const NBA_TEAMS: NBATeam[] = [
  { id: 1, name: 'Hawks', full_name: 'Atlanta Hawks', abbreviation: 'ATL', city: 'Atlanta', primaryColor: '#E03A3E', secondaryColor: '#C1D32F', conference: 'East', division: 'Southeast' },
  { id: 2, name: 'Celtics', full_name: 'Boston Celtics', abbreviation: 'BOS', city: 'Boston', primaryColor: '#007A33', secondaryColor: '#BA9653', conference: 'East', division: 'Atlantic' },
  { id: 3, name: 'Nets', full_name: 'Brooklyn Nets', abbreviation: 'BKN', city: 'Brooklyn', primaryColor: '#000000', secondaryColor: '#FFFFFF', conference: 'East', division: 'Atlantic' },
  { id: 4, name: 'Hornets', full_name: 'Charlotte Hornets', abbreviation: 'CHA', city: 'Charlotte', primaryColor: '#1D1160', secondaryColor: '#00788C', conference: 'East', division: 'Southeast' },
  { id: 5, name: 'Bulls', full_name: 'Chicago Bulls', abbreviation: 'CHI', city: 'Chicago', primaryColor: '#CE1141', secondaryColor: '#000000', conference: 'East', division: 'Central' },
  { id: 6, name: 'Cavaliers', full_name: 'Cleveland Cavaliers', abbreviation: 'CLE', city: 'Cleveland', primaryColor: '#860038', secondaryColor: '#FDBB30', conference: 'East', division: 'Central' },
  { id: 7, name: 'Mavericks', full_name: 'Dallas Mavericks', abbreviation: 'DAL', city: 'Dallas', primaryColor: '#00538C', secondaryColor: '#002B5E', conference: 'West', division: 'Southwest' },
  { id: 8, name: 'Nuggets', full_name: 'Denver Nuggets', abbreviation: 'DEN', city: 'Denver', primaryColor: '#0E2240', secondaryColor: '#FEC524', conference: 'West', division: 'Northwest' },
  { id: 9, name: 'Pistons', full_name: 'Detroit Pistons', abbreviation: 'DET', city: 'Detroit', primaryColor: '#C8102E', secondaryColor: '#1D42BA', conference: 'East', division: 'Central' },
  { id: 10, name: 'Warriors', full_name: 'Golden State Warriors', abbreviation: 'GSW', city: 'Golden State', primaryColor: '#1D428A', secondaryColor: '#FFC72C', conference: 'West', division: 'Pacific' },
  { id: 11, name: 'Rockets', full_name: 'Houston Rockets', abbreviation: 'HOU', city: 'Houston', primaryColor: '#CE1141', secondaryColor: '#000000', conference: 'West', division: 'Southwest' },
  { id: 12, name: 'Pacers', full_name: 'Indiana Pacers', abbreviation: 'IND', city: 'Indiana', primaryColor: '#002D62', secondaryColor: '#FDBB30', conference: 'East', division: 'Central' },
  { id: 13, name: 'Clippers', full_name: 'Los Angeles Clippers', abbreviation: 'LAC', city: 'Los Angeles', primaryColor: '#C8102E', secondaryColor: '#1D428A', conference: 'West', division: 'Pacific' },
  { id: 14, name: 'Lakers', full_name: 'Los Angeles Lakers', abbreviation: 'LAL', city: 'Los Angeles', primaryColor: '#552583', secondaryColor: '#FDB927', conference: 'West', division: 'Pacific' },
  { id: 15, name: 'Grizzlies', full_name: 'Memphis Grizzlies', abbreviation: 'MEM', city: 'Memphis', primaryColor: '#5D76A9', secondaryColor: '#12173F', conference: 'West', division: 'Southwest' },
  { id: 16, name: 'Heat', full_name: 'Miami Heat', abbreviation: 'MIA', city: 'Miami', primaryColor: '#98002E', secondaryColor: '#F9A01B', conference: 'East', division: 'Southeast' },
  { id: 17, name: 'Bucks', full_name: 'Milwaukee Bucks', abbreviation: 'MIL', city: 'Milwaukee', primaryColor: '#00471B', secondaryColor: '#EEE1C6', conference: 'East', division: 'Central' },
  { id: 18, name: 'Timberwolves', full_name: 'Minnesota Timberwolves', abbreviation: 'MIN', city: 'Minnesota', primaryColor: '#0C2340', secondaryColor: '#236192', conference: 'West', division: 'Northwest' },
  { id: 19, name: 'Pelicans', full_name: 'New Orleans Pelicans', abbreviation: 'NOP', city: 'New Orleans', primaryColor: '#0C2340', secondaryColor: '#C8102E', conference: 'West', division: 'Southwest' },
  { id: 20, name: 'Knicks', full_name: 'New York Knicks', abbreviation: 'NYK', city: 'New York', primaryColor: '#006BB6', secondaryColor: '#F58426', conference: 'East', division: 'Atlantic' },
  { id: 21, name: 'Thunder', full_name: 'Oklahoma City Thunder', abbreviation: 'OKC', city: 'Oklahoma City', primaryColor: '#007AC1', secondaryColor: '#EF3B24', conference: 'West', division: 'Northwest' },
  { id: 22, name: 'Magic', full_name: 'Orlando Magic', abbreviation: 'ORL', city: 'Orlando', primaryColor: '#0077C0', secondaryColor: '#C4CED4', conference: 'East', division: 'Southeast' },
  { id: 23, name: '76ers', full_name: 'Philadelphia 76ers', abbreviation: 'PHI', city: 'Philadelphia', primaryColor: '#006BB6', secondaryColor: '#ED174C', conference: 'East', division: 'Atlantic' },
  { id: 24, name: 'Suns', full_name: 'Phoenix Suns', abbreviation: 'PHX', city: 'Phoenix', primaryColor: '#1D1160', secondaryColor: '#E56020', conference: 'West', division: 'Pacific' },
  { id: 25, name: 'Trail Blazers', full_name: 'Portland Trail Blazers', abbreviation: 'POR', city: 'Portland', primaryColor: '#E03A3E', secondaryColor: '#000000', conference: 'West', division: 'Northwest' },
  { id: 26, name: 'Kings', full_name: 'Sacramento Kings', abbreviation: 'SAC', city: 'Sacramento', primaryColor: '#5A2D81', secondaryColor: '#63727A', conference: 'West', division: 'Pacific' },
  { id: 27, name: 'Spurs', full_name: 'San Antonio Spurs', abbreviation: 'SAS', city: 'San Antonio', primaryColor: '#C4CED4', secondaryColor: '#000000', conference: 'West', division: 'Southwest' },
  { id: 28, name: 'Raptors', full_name: 'Toronto Raptors', abbreviation: 'TOR', city: 'Toronto', primaryColor: '#CE1141', secondaryColor: '#000000', conference: 'East', division: 'Atlantic' },
  { id: 29, name: 'Jazz', full_name: 'Utah Jazz', abbreviation: 'UTA', city: 'Utah', primaryColor: '#002B5C', secondaryColor: '#00471B', conference: 'West', division: 'Northwest' },
  { id: 30, name: 'Wizards', full_name: 'Washington Wizards', abbreviation: 'WAS', city: 'Washington', primaryColor: '#002B5C', secondaryColor: '#E31837', conference: 'East', division: 'Southeast' },
];

export const TEAM_SELECTOR_OPTIONS = [
  { value: '', label: 'No team — League-wide fan' },
  ...NBA_TEAMS.map(t => ({ value: t.abbreviation, label: t.full_name }))
];

export function getTeamByAbbr(abbr: string): NBATeam | undefined {
  return NBA_TEAMS.find(t => t.abbreviation === abbr);
}

export function getTeamColors(abbr: string): { primary: string; secondary: string } {
  const team = getTeamByAbbr(abbr);
  return {
    primary: team?.primaryColor || '#6b7280',
    secondary: team?.secondaryColor || '#374151',
  };
}

// ESPN CDN uses different abbreviations for a few teams
const ESPN_LOGO_ABBR: Record<string, string> = {
  GSW: 'gs', NOP: 'no', SAS: 'sa', NYK: 'ny', UTA: 'utah', WAS: 'wsh',
};

export function getTeamLogoUrl(abbr: string): string {
  const espn = ESPN_LOGO_ABBR[abbr] || abbr.toLowerCase();
  return `https://a.espncdn.com/i/teamlogos/nba/500/${espn}.png`;
}
