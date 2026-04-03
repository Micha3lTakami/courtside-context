export type StorylineTagType =
  | 'rivalry_renewed' | 'playoff_war' | 'upset_alert' | 'revenge_game'
  | 'star_showdown' | 'seeding_shakeup' | 'on_a_heater' | 'on_the_ropes'
  | 'your_team_impact' | 'history_tonight';

export interface TeamInfo {
  id: number;
  name: string;
  full_name: string;
  abbreviation: string;
  city: string;
  conference: string;
  division: string;
  logo?: string;
  color?: string;
}

export interface Game {
  id: string;
  date: string;
  status: string;
  time: string;
  home_team: TeamInfo;
  visitor_team: TeamInfo;
  home_team_score: number;
  visitor_team_score: number;
  broadcast: string | null;
}

export interface StakesData {
  home_win_scenario: string | null;
  away_win_scenario: string | null;
  playoff_context: string | null;
  season_series: string | null;
}

export interface PlayerStats {
  ppg: number | null;
  apg: number | null;
  rpg: number | null;
  fg_pct: number | null;
  signature_stat_label: string | null;
  signature_stat_value: string | null;
}

export interface KeyMatchup {
  player_a: string;
  player_a_team: string;
  player_a_id: string | null;
  player_a_stats: PlayerStats;
  player_b: string;
  player_b_team: string;
  player_b_id: string | null;
  player_b_stats: PlayerStats;
  matchup_narrative: string;
}

export interface LastMeeting {
  date: string | null;
  score: string | null;
  recap: string | null;
}

export interface ViewingPlanItem {
  matchup: string;
  time: string;
  reason?: string;
  headline?: string;
}

export interface ViewingPlan {
  your_game: ViewingPlanItem;
  watch_before: ViewingPlanItem | null;
  watch_after: ViewingPlanItem | null;
  sleeper_pick: ViewingPlanItem | null;
}

export interface LeaguePulseItem {
  headline: string;
  summary: string;
  tag: StorylineTagType;
  teams_involved: string[];
  players_involved: string[];
}

export interface InjuryReport {
  player: string;
  team: string;
  status: string;
  injury: string;
}

export interface GameWithContext extends Game {
  storyline_tags: StorylineTagType[];
  must_watch_score: number;
  headline: string;
  context_brief: string;
  game_recap: string | null;
  stakes: StakesData | null;
  key_matchup: KeyMatchup | null;
  last_meeting: LastMeeting | null;
  your_team_note: string | null;
  your_team_win_scenario: string | null;
  your_team_loss_scenario: string | null;
  home_team_record: string;
  home_team_streak: string;
  visitor_team_record: string;
  visitor_team_streak: string;
}

export interface ClaudeGameResponse {
  game_id: string;
  home_team: string;
  away_team: string;
  must_watch_score: number;
  headline: string;
  storyline_tags: StorylineTagType[];
  context_brief: string;
  game_recap: string | null;
  stakes: StakesData | null;
  key_matchup: KeyMatchup | null;
  last_meeting: LastMeeting | null;
  your_team_note: string | null;
  your_team_win_scenario: string | null;
  your_team_loss_scenario: string | null;
}

export interface LeagueStoryItem {
  headline: string;
  summary: string;
  detail?: string;
  category: 'transaction' | 'injury' | 'milestone' | 'performance' | 'controversy';
  teams_involved: string[];
  players_involved: string[];
  impact: 'high' | 'medium' | 'low';
}

export interface AIContextResponse {
  games: ClaudeGameResponse[];
  viewing_plan: ViewingPlan | null;
  league_pulse: LeaguePulseItem[];
  league_stories: LeagueStoryItem[];
}

export interface NBATeam {
  id: number;
  name: string;
  full_name: string;
  abbreviation: string;
  city: string;
  primaryColor: string;
  secondaryColor: string;
  conference: 'East' | 'West';
  division: string;
}
