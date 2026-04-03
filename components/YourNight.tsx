'use client';

import React from 'react';
import { ViewingPlan } from '@/lib/types';
import { getTeamColors } from '@/lib/teams';
import { YourNightIcon } from '@/lib/icons';

interface Props {
  plan: ViewingPlan;
  team: string;
  className?: string;
}

function PlanRow({ time, matchup, reason }: { time: string; matchup: string; reason: string }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex flex-col items-center flex-shrink-0">
        <span className="text-xs font-mono text-gray-500 leading-none">{time}</span>
      </div>
      <div className="flex-1 min-w-0 pb-4 last:pb-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-white text-sm font-medium mb-0.5">{matchup}</p>
        <p className="text-gray-400 text-xs leading-relaxed">{reason}</p>
      </div>
    </div>
  );
}

export default function YourNight({ plan, team, className = '' }: Props) {
  const colors = getTeamColors(team);
  const items = [
    plan.watch_before && { ...plan.watch_before, label: 'Before your game' },
    plan.your_game && { matchup: plan.your_game.matchup, time: plan.your_game.time, reason: plan.your_game.headline || '', label: 'Your game' },
    plan.watch_after && { ...plan.watch_after, label: 'After your game' },
    plan.sleeper_pick && { ...plan.sleeper_pick, label: 'Sleeper pick' },
  ].filter(Boolean) as Array<{ matchup: string; time: string; reason: string; label: string }>;

  if (items.length === 0) return null;

  return (
    <div
      className={`rounded-2xl p-5 ${className}`}
      style={{
        backgroundColor: `${colors.primary}08`,
        border: `1px solid ${colors.primary}25`,
      }}
    >
      <div className="flex items-center gap-2 mb-4">
        <YourNightIcon size={14} color={colors.primary} />
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Night — {team}</span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <PlanRow
            key={i}
            time={item.time}
            matchup={`${item.label}: ${item.matchup}`}
            reason={item.reason}
          />
        ))}
      </div>
    </div>
  );
}
