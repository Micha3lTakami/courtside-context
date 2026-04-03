'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { GameWithContext } from '@/lib/types';
import { getTeamColors } from '@/lib/teams';
import { getWatchLink } from '@/lib/players';
import StorylineTag from './StorylineTag';

interface GameCardProps {
  game: GameWithContext;
  index: number;
  contextLoading?: boolean;
  onOpen: () => void;
}

function WatchBadge({ score }: { score: number }) {
  if (!score || score < 5) return null;

  let color: string, bg: string, border: string, label: string, dot: boolean;
  if (score >= 9) {
    color = '#ff6b4a'; bg = 'rgba(255,107,74,0.14)'; border = 'rgba(255,107,74,0.45)'; label = 'Must Watch'; dot = true;
  } else if (score >= 7) {
    color = '#f5c842'; bg = 'rgba(245,200,66,0.12)'; border = 'rgba(245,200,66,0.4)'; label = 'Watch'; dot = false;
  } else {
    color = '#5b9ef5'; bg = 'rgba(91,158,245,0.1)'; border = 'rgba(91,158,245,0.35)'; label = 'Worth It'; dot = false;
  }

  return (
    <motion.div
      initial={{ scale: 0.75, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 18 }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 flex-shrink-0"
      style={{ backgroundColor: bg, border: `1px solid ${border}` }}
    >
      {dot && <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: color }} />}
      <span className="text-xs font-bold tracking-wide uppercase leading-none" style={{ color }}>{label}</span>
    </motion.div>
  );
}

function StreakPill({ streak }: { streak: string }) {
  if (!streak) return null;
  const win = streak.startsWith('W');
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded font-semibold"
      style={{
        color: win ? '#34d399' : '#f87171',
        backgroundColor: win ? 'rgba(52,211,153,0.1)' : 'rgba(248,113,113,0.1)',
      }}
    >
      {streak}
    </span>
  );
}

function TeamColumn({
  abbr, name, record, streak, logo, align,
}: {
  abbr: string; name: string; record: string; streak: string; logo?: string; align: 'left' | 'right';
}) {
  const colors = getTeamColors(abbr);
  const right = align === 'right';

  return (
    <div className={`flex flex-col ${right ? 'items-end' : 'items-start'} gap-1.5 min-w-0`}>
      <div className={`flex items-center gap-2 ${right ? 'flex-row-reverse' : 'flex-row'}`}>
        {logo ? (
          <Image
            src={logo}
            alt={abbr}
            width={36}
            height={36}
            className="object-contain flex-shrink-0"
            unoptimized
          />
        ) : (
          <div className="w-9 h-9 rounded-full flex-shrink-0" style={{ backgroundColor: colors.primary + '33' }}>
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <span className="text-xs font-bold" style={{ color: colors.primary }}>{abbr.slice(0, 2)}</span>
            </div>
          </div>
        )}
        <span className="font-black text-2xl tracking-tight leading-none" style={{ color: 'var(--text-primary)' }}>{abbr}</span>
      </div>

      <span className="text-xs truncate max-w-[90px]" style={{ color: 'var(--text-muted)' }}>{name}</span>

      {record && (
        <div className={`flex items-center gap-1.5 ${right ? 'flex-row-reverse' : 'flex-row'}`}>
          <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-secondary)' }}>{record}</span>
          <StreakPill streak={streak} />
        </div>
      )}
    </div>
  );
}

export default function GameCard({ game, index, contextLoading, onOpen }: GameCardProps) {
  const score = game.must_watch_score;
  const isHot = score >= 9;
  const isWarm = score >= 7 && score < 9;
  const hasContext = !!game.context_brief || game.storyline_tags.length > 0;

  return (
    <motion.article
      className="relative rounded-2xl border transition-colors duration-200 cursor-pointer group card-neu"
      style={{
        backgroundColor: 'var(--bg-card)',
        borderColor: isHot
          ? 'rgba(255,107,74,0.4)'
          : isWarm
          ? 'rgba(245,200,66,0.25)'
          : 'var(--border)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card-hover)')}
      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--bg-card)')}
      onClick={onOpen}
    >
      <div className="p-5">
        {/* Top row: watch badge + tags */}
        <div className="flex items-center justify-between mb-4 gap-2 min-w-0">
          <WatchBadge score={score} />
          <div className="flex flex-wrap gap-1.5 justify-end">
            {game.storyline_tags.slice(0, 1).map(tag => <StorylineTag key={tag} tag={tag} />)}
            {contextLoading && game.storyline_tags.length === 0 && (
              <div className="h-6 w-20 rounded-full bg-white/5 animate-pulse" />
            )}
          </div>
        </div>

        {/* Matchup */}
        <div className="flex items-center justify-between mb-4">
          <TeamColumn
            abbr={game.visitor_team.abbreviation}
            name={game.visitor_team.name}
            record={game.visitor_team_record}
            streak={game.visitor_team_streak}
            logo={game.visitor_team.logo}
            align="left"
          />
          <div className="flex flex-col items-center gap-1 px-2 flex-shrink-0">
            {game.status === 'final' ? (
              <>
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: 'var(--text-muted)' }}>Final</span>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black font-mono tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>{game.visitor_team_score}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>–</span>
                  <span className="text-xl font-black font-mono tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>{game.home_team_score}</span>
                </div>
              </>
            ) : game.status === 'in_progress' ? (
              <>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#f87171' }} />
                  <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#f87171' }}>Live</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black font-mono tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>{game.visitor_team_score}</span>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>–</span>
                  <span className="text-xl font-black font-mono tabular-nums leading-none" style={{ color: 'var(--text-primary)' }}>{game.home_team_score}</span>
                </div>
                <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{game.time}</span>
              </>
            ) : (
              <>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>@</span>
                <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{game.time}</span>
              </>
            )}
          </div>
          <TeamColumn
            abbr={game.home_team.abbreviation}
            name={game.home_team.name}
            record={game.home_team_record}
            streak={game.home_team_streak}
            logo={game.home_team.logo}
            align="right"
          />
        </div>

        {/* Headline */}
        {game.headline ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="text-sm font-semibold leading-snug mb-2"
            style={{ color: 'var(--text-secondary)' }}
          >
            {game.headline}
          </motion.p>
        ) : contextLoading ? (
          <div className="h-4 bg-white/5 rounded animate-pulse mb-2 w-4/5" />
        ) : null}

        {/* Write-up: game_recap (post-game) or context_brief (preview/live) */}
        {(game.game_recap || game.context_brief) ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.05, ease: 'easeOut' }}
            className="text-xs leading-relaxed mb-3 line-clamp-2"
            style={{ color: 'var(--text-muted)' }}
          >
            {game.game_recap || game.context_brief}
          </motion.p>
        ) : contextLoading ? (
          <div className="space-y-1 mb-3">
            <div className="h-3 bg-white/5 rounded animate-pulse w-full" />
            <div className="h-3 bg-white/5 rounded animate-pulse w-3/4" />
          </div>
        ) : null}


        {/* No context state */}
        {!hasContext && !contextLoading && (
          <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>Context unavailable</p>
        )}

        {/* Bottom row: Full breakdown + Watch Now */}
        <div className="flex items-center justify-between mt-2">
          <div
            className="flex items-center gap-1 text-xs transition-colors group-hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <span>Full breakdown</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="6" x2="10" y2="6" /><polyline points="7,3 10,6 7,9" />
            </svg>
          </div>

          {/* Watch Now button */}
          {(() => {
            const watchLink = getWatchLink(game.broadcast);
            if (!watchLink) return null;
            return (
              <a
                href={watchLink.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all hover:opacity-90"
                style={{
                  backgroundColor: game.status === 'in_progress' ? 'rgba(248,113,113,0.12)' : 'var(--bg-subtle)',
                  border: `1px solid ${game.status === 'in_progress' ? 'rgba(248,113,113,0.3)' : 'var(--border)'}`,
                  color: game.status === 'in_progress' ? '#f87171' : 'var(--text-secondary)',
                }}
              >
                {game.status === 'in_progress' && (
                  <div className="w-1 h-1 rounded-full animate-pulse" style={{ backgroundColor: '#f87171' }} />
                )}
                <svg width="8" height="8" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M2 2l8 4-8 4V2z" />
                </svg>
                {game.status === 'in_progress' ? 'Watch Live' : `Watch · ${watchLink.name}`}
              </a>
            );
          })()}
        </div>
      </div>
    </motion.article>
  );
}
