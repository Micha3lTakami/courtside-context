'use client';

import React from 'react';
import { StorylineTagType } from '@/lib/types';
import {
  RivalryRenewedIcon,
  PlayoffWarIcon,
  UpsetAlertIcon,
  RevengeGameIcon,
  StarShowdownIcon,
  SeedingShakeupIcon,
  OnAHeaterIcon,
  OnTheRopesIcon,
  YourTeamImpactIcon,
  HistoryTonightIcon,
} from '@/lib/icons';

interface TagConfig {
  label: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  Icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
}

const TAG_CONFIG: Record<StorylineTagType, TagConfig> = {
  rivalry_renewed: {
    label: 'Rivalry Renewed',
    colorClass: 'text-red-400',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/30',
    Icon: RivalryRenewedIcon,
  },
  playoff_war: {
    label: 'Playoff War',
    colorClass: 'text-orange-400',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/30',
    Icon: PlayoffWarIcon,
  },
  upset_alert: {
    label: 'Upset Alert',
    colorClass: 'text-yellow-400',
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/30',
    Icon: UpsetAlertIcon,
  },
  revenge_game: {
    label: 'Revenge Game',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500/10',
    borderClass: 'border-purple-500/30',
    Icon: RevengeGameIcon,
  },
  star_showdown: {
    label: 'Star Showdown',
    colorClass: 'text-amber-300',
    bgClass: 'bg-amber-400/10',
    borderClass: 'border-amber-400/30',
    Icon: StarShowdownIcon,
  },
  seeding_shakeup: {
    label: 'Seeding Shakeup',
    colorClass: 'text-blue-400',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/30',
    Icon: SeedingShakeupIcon,
  },
  on_a_heater: {
    label: 'On a Heater',
    colorClass: 'text-orange-300',
    bgClass: 'bg-orange-400/10',
    borderClass: 'border-orange-400/30',
    Icon: OnAHeaterIcon,
  },
  on_the_ropes: {
    label: 'On the Ropes',
    colorClass: 'text-slate-300',
    bgClass: 'bg-slate-400/10',
    borderClass: 'border-slate-400/30',
    Icon: OnTheRopesIcon,
  },
  your_team_impact: {
    label: 'Your Team Impact',
    colorClass: 'text-emerald-400',
    bgClass: 'bg-emerald-500/10',
    borderClass: 'border-emerald-500/30',
    Icon: YourTeamImpactIcon,
  },
  history_tonight: {
    label: 'History Tonight',
    colorClass: 'text-yellow-500',
    bgClass: 'bg-yellow-600/10',
    borderClass: 'border-yellow-600/30',
    Icon: HistoryTonightIcon,
  },
};

interface StorylineTagProps {
  tag: StorylineTagType;
}

export default function StorylineTag({ tag }: StorylineTagProps) {
  const config = TAG_CONFIG[tag];
  if (!config) return null;

  const { label, colorClass, bgClass, borderClass, Icon } = config;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1
        rounded-full border text-xs font-medium
        transition-all duration-200 hover:brightness-125
        ${colorClass} ${bgClass} ${borderClass}
      `}
    >
      <Icon size={12} color="currentColor" />
      {label}
    </span>
  );
}

export { TAG_CONFIG };
