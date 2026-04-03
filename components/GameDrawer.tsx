'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GameWithContext, KeyMatchup, StakesData } from '@/lib/types';
import { GameDetailResponse } from '@/app/api/game-detail/route';
import { getTeamColors, getTeamLogoUrl } from '@/lib/teams';
import { espnHeadshotUrl, getWatchLink } from '@/lib/players';
import StorylineTag from './StorylineTag';

interface Props {
  game: GameWithContext | null;
  isOpen: boolean;
  onClose: () => void;
  selectedTeam: string;
}

function TeamHero({
  abbr, fullName, record, streak, logo, align,
}: {
  abbr: string; fullName: string; record: string; streak: string; logo?: string; align: 'left' | 'right';
}) {
  const colors = getTeamColors(abbr);
  const right = align === 'right';
  const isWinStreak = streak?.startsWith('W');
  return (
    <div className={`flex flex-col ${right ? 'items-end' : 'items-start'} gap-2`}>
      {logo ? (
        <Image
          src={logo}
          alt={abbr}
          width={52}
          height={52}
          className="object-contain"
          unoptimized
        />
      ) : (
        <div className="h-1.5 w-12 rounded-full" style={{ backgroundColor: colors.primary }} />
      )}
      <span className="font-black text-4xl tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>{abbr}</span>
      <span className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>{fullName}</span>
      <div className={`flex items-center gap-2 ${right ? 'flex-row-reverse' : 'flex-row'}`}>
        {record && <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>{record}</span>}
        {streak && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{
              color: isWinStreak ? '#34d399' : '#f87171',
              backgroundColor: isWinStreak ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
            }}
          >
            {streak}
          </span>
        )}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
      {children}
    </p>
  );
}

function StatBox({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div
      className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg"
      style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
    >
      <span className="font-bold text-lg leading-none" style={{ color: 'var(--text-primary)' }}>{value ?? '—'}</span>
      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
    </div>
  );
}

function PlayerCard({
  name, team, playerId, stats, align,
}: {
  name: string; team: string; playerId: string | null;
  stats: KeyMatchup['player_a_stats']; align: 'left' | 'right';
}) {
  const colors = getTeamColors(team);
  const right = align === 'right';
  const fmtFg = (v: number | null) => v ? `${(v * 100).toFixed(1)}%` : null;

  const statItems = [
    stats.ppg !== null ? { label: 'PPG', value: String(stats.ppg) } : null,
    stats.rpg !== null ? { label: 'RPG', value: String(stats.rpg) } : null,
    stats.apg !== null ? { label: 'APG', value: String(stats.apg) } : null,
    stats.fg_pct !== null ? { label: 'FG%', value: fmtFg(stats.fg_pct) } : null,
    stats.signature_stat_label ? { label: stats.signature_stat_label, value: stats.signature_stat_value, highlight: true } : null,
  ].filter(Boolean) as { label: string; value: string | null; highlight?: boolean }[];

  return (
    <div
      className="rounded-xl flex-1 min-w-0"
      style={{ border: '1px solid var(--border)', overflow: 'hidden' }}
    >
      {/* Photo area */}
      <div
        className="relative flex items-end overflow-hidden"
        style={{
          height: 148,
          backgroundColor: colors.primary + '18',
        }}
      >
        {/* Team logo watermark — always left */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getTeamLogoUrl(team)}
          alt=""
          aria-hidden="true"
          className="absolute top-1/2 -translate-y-1/2 left-2 pointer-events-none select-none"
          style={{ width: 90, height: 90, opacity: 0.13, objectFit: 'contain' }}
        />
        {/* Team color bar — always left edge */}
        <div
          className="absolute top-0 bottom-0 left-0 w-1"
          style={{ backgroundColor: colors.primary }}
        />
        {/* Player photo — always pinned right */}
        {playerId ? (
          <div className="absolute bottom-0 right-0 flex items-end" style={{ width: 120 }}>
            <Image
              src={espnHeadshotUrl(playerId)}
              alt={name}
              width={120}
              height={140}
              className="object-contain object-bottom"
              style={{ display: 'block' }}
              unoptimized
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl"
              style={{ backgroundColor: colors.primary + '30', color: colors.primary }}
            >
              {name.split(' ').map(p => p[0]).join('').slice(0, 2)}
            </div>
          </div>
        )}
        {/* Name overlay — sits above photo */}
        <div
          className={`absolute bottom-0 left-0 right-0 px-3 py-2 ${playerId ? 'pointer-events-none' : ''}`}
          style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}
        >
          <p className="text-xs font-bold leading-tight text-white truncate">{name}</p>
          <p className="text-[10px]" style={{ color: colors.primary }}>{team}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="p-3" style={{ backgroundColor: 'var(--bg-subtle)' }}>
        {statItems.length === 0 ? (
          <p className="text-xs text-center py-1" style={{ color: 'var(--text-muted)' }}>Stats unavailable</p>
        ) : (
          <div className="flex gap-1.5 flex-wrap">
            {statItems.map(item => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg flex-1 min-w-[44px]"
                style={{
                  backgroundColor: item.highlight ? colors.primary + '30' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${item.highlight ? colors.primary + '70' : 'rgba(255,255,255,0.1)'}`,
                }}
              >
                <span
                  className="font-bold text-sm leading-none"
                  style={{ color: '#ffffff' }}
                >
                  {item.value ?? '—'}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-wide" style={{ color: item.highlight ? 'rgba(255,255,255,0.72)' : '#9da5c8' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PlayerMatchupSection({ matchup }: { matchup: KeyMatchup }) {
  return (
    <div>
      <SectionLabel>Key Matchup</SectionLabel>
      <div className="flex gap-2 items-stretch mb-3">
        <PlayerCard
          name={matchup.player_a}
          team={matchup.player_a_team}
          playerId={matchup.player_a_id ?? null}
          stats={matchup.player_a_stats}
          align="left"
        />
        <div className="flex flex-col items-center justify-center flex-shrink-0 gap-1 px-1">
          <div className="w-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>vs</span>
          <div className="w-px flex-1" style={{ backgroundColor: 'var(--border)' }} />
        </div>
        <PlayerCard
          name={matchup.player_b}
          team={matchup.player_b_team}
          playerId={matchup.player_b_id ?? null}
          stats={matchup.player_b_stats}
          align="right"
        />
      </div>
      {matchup.matchup_narrative && (
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{matchup.matchup_narrative}</p>
      )}
    </div>
  );
}

function StakesSection({ stakes, homeAbbr, awayAbbr }: { stakes: StakesData; homeAbbr: string; awayAbbr: string }) {
  return (
    <div>
      <SectionLabel>Why This Matters</SectionLabel>
      <div className="space-y-3">
        {stakes.home_win_scenario && (
          <div className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
            <span className="text-xs font-bold text-emerald-400 mt-0.5 flex-shrink-0">{homeAbbr} W</span>
            <span className="text-sm text-gray-300 leading-snug">{stakes.home_win_scenario}</span>
          </div>
        )}
        {stakes.away_win_scenario && (
          <div className="flex gap-3 items-start rounded-lg px-3 py-2.5" style={{ backgroundColor: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <span className="text-xs font-bold text-red-400 mt-0.5 flex-shrink-0">{awayAbbr} W</span>
            <span className="text-sm text-gray-300 leading-snug">{stakes.away_win_scenario}</span>
          </div>
        )}
        {stakes.playoff_context && (
          <p className="text-sm leading-relaxed px-1" style={{ color: 'var(--text-secondary)' }}>{stakes.playoff_context}</p>
        )}
        {stakes.season_series && (
          <div className="flex items-center gap-2 px-1">
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Season series:</span>
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stakes.season_series}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-3 w-24 rounded mb-3" style={{ backgroundColor: 'var(--bg-subtle)' }} />
        <div className="space-y-2">
          <div className="h-10 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }} />
          <div className="h-10 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }} />
          <div className="h-4 w-3/4 rounded mt-2" style={{ backgroundColor: 'var(--bg-subtle)' }} />
        </div>
      </div>
      <div>
        <div className="h-3 w-28 rounded mb-3" style={{ backgroundColor: 'var(--bg-subtle)' }} />
        <div className="space-y-3">
          <div className="h-20 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }} />
          <div className="h-20 rounded-xl" style={{ backgroundColor: 'var(--bg-subtle)' }} />
          <div className="h-12 rounded" style={{ backgroundColor: 'var(--bg-subtle)' }} />
        </div>
      </div>
      <div>
        <div className="h-3 w-32 rounded mb-3" style={{ backgroundColor: 'var(--bg-subtle)' }} />
        <div className="h-16 rounded-lg" style={{ backgroundColor: 'var(--bg-subtle)' }} />
      </div>
    </div>
  );
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const sectionVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.07, ease: EASE_OUT },
  }),
};

export default function GameDrawer({ game, isOpen, onClose, selectedTeam }: Props) {
  const [detail, setDetail] = useState<GameDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchDetail = useCallback(async (g: GameWithContext) => {
    setDetailLoading(true);
    setDetail(null);
    try {
      const params = new URLSearchParams({
        gameId: g.id,
        home: g.home_team.abbreviation,
        away: g.visitor_team.abbreviation,
        ...(selectedTeam ? { team: selectedTeam } : {}),
      });
      const res = await fetch(`/api/game-detail?${params}`);
      if (res.ok) setDetail(await res.json());
    } catch { /* show nothing */ }
    finally { setDetailLoading(false); }
  }, [selectedTeam]);

  useEffect(() => {
    if (isOpen && game) fetchDetail(game);
    if (!isOpen) { setDetail(null); setDetailLoading(false); }
  }, [isOpen, game, fetchDetail]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const homeColors = game ? getTeamColors(game.home_team.abbreviation) : { primary: '#666' };
  const awayColors = game ? getTeamColors(game.visitor_team.abbreviation) : { primary: '#666' };

  return (
    <>
      {/* Backdrop — Framer fade */}
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm ${isOpen ? '' : 'pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer: spring slide via CSS classes, spring timing via transition override */}
      <div
        className={`
          fixed z-50 overflow-y-auto
          inset-x-0 bottom-0 rounded-t-2xl max-h-[90vh]
          md:inset-y-0 md:right-0 md:left-auto md:w-[520px] md:rounded-none md:max-h-none
          ${isOpen
            ? 'translate-y-0 md:translate-x-0'
            : 'translate-y-full md:translate-x-full'
          }
        `}
        style={{
          backgroundColor: 'var(--bg-card)',
          borderLeft: '1px solid var(--border)',
          transition: 'transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Mobile drag handle */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: 'var(--border-strong)' }} />
        </div>

        {game && (
          <>
            {/* Hero Header */}
            <motion.div
              className="relative px-6 pt-6 pb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.3, delay: isOpen ? 0.12 : 0 }}
              style={{ background: `linear-gradient(135deg, ${awayColors.primary}15 0%, transparent 50%, ${homeColors.primary}15 100%)` }}
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="12" y2="12" /><line x1="12" y1="2" x2="2" y2="12" />
                </svg>
              </button>

              <div className="flex items-center justify-between mb-4 pr-10">
                <TeamHero
                  abbr={game.visitor_team.abbreviation}
                  fullName={game.visitor_team.full_name}
                  record={game.visitor_team_record}
                  streak={game.visitor_team_streak}
                  logo={game.visitor_team.logo}
                  align="left"
                />
                <div className="flex flex-col items-center gap-1 px-2">
                  {game.status === 'final' ? (
                    <>
                      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Final</span>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black font-mono tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>{game.visitor_team_score}</span>
                        <span className="text-lg" style={{ color: 'var(--text-muted)' }}>–</span>
                        <span className="text-3xl font-black font-mono tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>{game.home_team_score}</span>
                      </div>
                    </>
                  ) : game.status === 'in_progress' ? (
                    <>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#f87171' }} />
                        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#f87171' }}>Live</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-black font-mono tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>{game.visitor_team_score}</span>
                        <span className="text-lg" style={{ color: 'var(--text-muted)' }}>–</span>
                        <span className="text-3xl font-black font-mono tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>{game.home_team_score}</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{game.time}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-sm" style={{ color: 'var(--text-muted)' }}>@</span>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{game.time}</span>
                    </>
                  )}
                </div>
                <TeamHero
                  abbr={game.home_team.abbreviation}
                  fullName={game.home_team.full_name}
                  record={game.home_team_record}
                  streak={game.home_team_streak}
                  logo={game.home_team.logo}
                  align="right"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {game.storyline_tags.map(tag => <StorylineTag key={tag} tag={tag} />)}
                {(() => {
                  const wl = getWatchLink(game.broadcast);
                  if (!wl) return null;
                  return (
                    <a
                      href={wl.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide transition-all hover:opacity-90"
                      style={{
                        backgroundColor: game.status === 'in_progress' ? 'rgba(248,113,113,0.15)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${game.status === 'in_progress' ? 'rgba(248,113,113,0.35)' : 'rgba(255,255,255,0.12)'}`,
                        color: game.status === 'in_progress' ? '#f87171' : 'rgba(240,242,255,0.6)',
                      }}
                    >
                      {game.status === 'in_progress' && (
                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#f87171' }} />
                      )}
                      <svg width="9" height="9" viewBox="0 0 12 12" fill="currentColor">
                        <path d="M2 2l8 4-8 4V2z" />
                      </svg>
                      {game.status === 'in_progress' ? `Watch Live · ${wl.name}` : `Watch on ${wl.name}`}
                    </a>
                  );
                })()}
              </div>
            </motion.div>

            {/* Content */}
            <div className="px-6 pb-8 space-y-8" style={{ borderTop: '1px solid var(--border)' }}>

              {/* The Story / Recap */}
              {(game.game_recap || game.context_brief) && (
                <motion.div
                  custom={0}
                  variants={sectionVariants}
                  initial="hidden"
                  animate={isOpen ? 'visible' : 'hidden'}
                  className="pt-6"
                >
                  <SectionLabel>
                    {game.status === 'final' ? 'Recap' : game.status === 'in_progress' ? 'Live Take' : 'Preview'}
                  </SectionLabel>
                  {game.game_recap && (
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{game.game_recap}</p>
                  )}
                  {game.context_brief && game.status !== 'scheduled' && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                      <span className="text-xs font-semibold uppercase tracking-wide mr-2" style={{ color: 'var(--text-muted)' }}>Pre-game:</span>
                      {game.context_brief}
                    </p>
                  )}
                  {game.context_brief && game.status === 'scheduled' && (
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{game.context_brief}</p>
                  )}
                </motion.div>
              )}

              {/* Detail: skeleton ↔ content crossfade */}
              <AnimatePresence mode="wait">
                {detailLoading ? (
                  <motion.div
                    key="skeleton"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <DetailSkeleton />
                  </motion.div>
                ) : detail ? (
                  <motion.div
                    key="detail"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="space-y-8"
                  >
                    {detail.stakes && (
                      <motion.div custom={1} variants={sectionVariants} initial="hidden" animate="visible">
                        <StakesSection
                          stakes={detail.stakes}
                          homeAbbr={game.home_team.abbreviation}
                          awayAbbr={game.visitor_team.abbreviation}
                        />
                      </motion.div>
                    )}

                    {detail.key_matchup && (
                      <motion.div custom={2} variants={sectionVariants} initial="hidden" animate="visible">
                        <PlayerMatchupSection matchup={detail.key_matchup} />
                      </motion.div>
                    )}

                    {detail.last_meeting && (detail.last_meeting.recap || detail.last_meeting.score) && (
                      <motion.div custom={3} variants={sectionVariants} initial="hidden" animate="visible">
                        <SectionLabel>Last Time They Played</SectionLabel>
                        {detail.last_meeting.score && (
                          <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
                            {detail.last_meeting.date && `${detail.last_meeting.date} · `}{detail.last_meeting.score}
                          </p>
                        )}
                        {detail.last_meeting.recap && (
                          <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{detail.last_meeting.recap}</p>
                        )}
                      </motion.div>
                    )}
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Your Team Impact */}
              {selectedTeam && game.your_team_note && (
                game.home_team.abbreviation !== selectedTeam && game.visitor_team.abbreviation !== selectedTeam
              ) && (
                <motion.div custom={4} variants={sectionVariants} initial="hidden" animate={isOpen ? 'visible' : 'hidden'}>
                  <SectionLabel>Your Team Impact</SectionLabel>
                  <div className="space-y-2">
                    {detail?.your_team_win_scenario && (
                      <div className="flex gap-3 items-start rounded-lg px-3 py-2.5"
                        style={{ backgroundColor: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.15)' }}>
                        <span className="text-xs font-bold text-emerald-400 mt-0.5 flex-shrink-0">{game.home_team.abbreviation} W →</span>
                        <span className="text-sm text-gray-300">{detail.your_team_win_scenario}</span>
                      </div>
                    )}
                    {detail?.your_team_loss_scenario && (
                      <div className="flex gap-3 items-start rounded-lg px-3 py-2.5"
                        style={{ backgroundColor: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)' }}>
                        <span className="text-xs font-bold text-red-400 mt-0.5 flex-shrink-0">{game.visitor_team.abbreviation} W →</span>
                        <span className="text-sm text-gray-300">{detail.your_team_loss_scenario}</span>
                      </div>
                    )}
                    <p className="text-sm leading-relaxed px-1" style={{ color: 'var(--text-secondary)' }}>{game.your_team_note}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
