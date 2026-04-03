'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeagueStoryItem } from '@/lib/types';
import {
  TransactionIcon, InjuryIcon, MilestoneIcon,
  PerformanceIcon, ControversyIcon,
} from '@/lib/icons';

interface Props {
  stories: LeagueStoryItem[];
}

type CategoryKey = LeagueStoryItem['category'];
type ImpactKey = LeagueStoryItem['impact'];

interface CatConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

const CATEGORY_CONFIG: Record<CategoryKey, CatConfig> = {
  transaction: {
    label: 'Transaction',
    color: '#7c6af5',
    bg: 'rgba(124,106,245,0.12)',
    border: 'rgba(124,106,245,0.35)',
    Icon: TransactionIcon,
  },
  injury: {
    label: 'Injury',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.12)',
    border: 'rgba(248,113,113,0.35)',
    Icon: InjuryIcon,
  },
  milestone: {
    label: 'Milestone',
    color: '#f5c842',
    bg: 'rgba(245,200,66,0.12)',
    border: 'rgba(245,200,66,0.35)',
    Icon: MilestoneIcon,
  },
  performance: {
    label: 'Performance',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.12)',
    border: 'rgba(52,211,153,0.35)',
    Icon: PerformanceIcon,
  },
  controversy: {
    label: 'Controversy',
    color: '#fb923c',
    bg: 'rgba(251,146,60,0.12)',
    border: 'rgba(251,146,60,0.35)',
    Icon: ControversyIcon,
  },
};

const IMPACT_CONFIG: Record<ImpactKey, { label: string; color: string; bg: string }> = {
  high:   { label: 'High Impact',   color: '#f87171', bg: 'rgba(248,113,113,0.12)' },
  medium: { label: 'Medium Impact', color: '#f5c842', bg: 'rgba(245,200,66,0.12)' },
  low:    { label: 'Low Impact',    color: '#7a82b0', bg: 'rgba(122,130,176,0.12)' },
};

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.38, delay: i * 0.06, ease: EASE_OUT },
  }),
};

function StoryCard({
  story, index, onOpen,
}: {
  story: LeagueStoryItem; index: number; onOpen: () => void;
}) {
  const cat = CATEGORY_CONFIG[story.category] ?? CATEGORY_CONFIG.performance;
  const impact = IMPACT_CONFIG[story.impact] ?? IMPACT_CONFIG.medium;
  const { Icon } = cat;

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      onClick={onOpen}
      className="rounded-xl p-4 card-neu cursor-pointer group"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        transition: 'border-color 0.15s ease, background-color 0.15s ease',
      }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = cat.border;
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card-hover)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'var(--border)';
        (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-card)';
      }}
    >
      {/* Header row */}
      <div className="flex items-center justify-between mb-3 gap-2">
        <span
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full"
          style={{ color: cat.color, backgroundColor: cat.bg, border: `1px solid ${cat.border}` }}
        >
          <Icon size={10} color="currentColor" />
          {cat.label}
        </span>
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
          style={{ color: impact.color, backgroundColor: impact.bg }}
        >
          {impact.label}
        </span>
      </div>

      <p className="text-sm font-bold leading-snug mb-2" style={{ color: 'var(--text-primary)' }}>
        {story.headline}
      </p>
      <p className="text-xs leading-relaxed mb-3 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
        {story.summary}
      </p>

      <div className="flex items-center justify-between">
        {(story.teams_involved.length > 0 || story.players_involved.length > 0) && (
          <div className="flex flex-wrap gap-1">
            {story.teams_involved.slice(0, 3).map(t => (
              <span key={t} className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)' }}>
                {t}
              </span>
            ))}
            {story.players_involved.slice(0, 2).map(p => (
              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded"
                style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)' }}>
                {p.split(' ').pop()}
              </span>
            ))}
          </div>
        )}
        <span className="text-[10px] flex items-center gap-0.5 ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: 'var(--text-muted)' }}>
          Full story
          <svg width="8" height="8" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="6" x2="10" y2="6" /><polyline points="7,3 10,6 7,9" />
          </svg>
        </span>
      </div>
    </motion.div>
  );
}

function StoryPanel({
  story, isOpen, onClose,
}: {
  story: LeagueStoryItem | null; isOpen: boolean; onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const cat = story ? (CATEGORY_CONFIG[story.category] ?? CATEGORY_CONFIG.performance) : null;
  const impact = story ? (IMPACT_CONFIG[story.impact] ?? IMPACT_CONFIG.medium) : null;

  return (
    <>
      <motion.div
        animate={{ opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm ${isOpen ? '' : 'pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed z-50 overflow-y-auto inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh]
          md:inset-y-0 md:right-0 md:left-auto md:w-[480px] md:rounded-none md:max-h-none
          ${isOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full'}`}
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

        {story && cat && impact && (
          <div className="px-6 py-6 pb-10">
            {/* Close */}
            <div className="flex items-start justify-between mb-5">
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ color: cat.color, backgroundColor: cat.bg, border: `1px solid ${cat.border}` }}
              >
                <cat.Icon size={11} color="currentColor" />
                {cat.label}
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-colors flex-shrink-0"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="12" y2="12" /><line x1="12" y1="2" x2="2" y2="12" />
                </svg>
              </button>
            </div>

            {/* Headline */}
            <h2 className="text-xl font-black leading-snug mb-3" style={{ color: 'var(--text-primary)' }}>
              {story.headline}
            </h2>

            {/* Impact badge */}
            <span
              className="inline-block text-xs font-semibold px-2 py-0.5 rounded mb-5"
              style={{ color: impact.color, backgroundColor: impact.bg }}
            >
              {impact.label}
            </span>

            {/* Summary */}
            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Summary</p>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {story.summary}
              </p>
            </div>

            {/* Detail analysis */}
            {story.detail && (
              <div className="mb-5 rounded-xl p-4" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Deeper Analysis</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {story.detail}
                </p>
              </div>
            )}

            {/* Teams + Players */}
            {(story.teams_involved.length > 0 || story.players_involved.length > 0) && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Involved</p>
                <div className="flex flex-wrap gap-2">
                  {story.teams_involved.map(t => (
                    <span key={t}
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                      {t}
                    </span>
                  ))}
                  {story.players_involved.map(p => (
                    <span key={p}
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function LeagueStories({ stories }: Props) {
  const [openStory, setOpenStory] = useState<LeagueStoryItem | null>(null);

  if (!stories || stories.length === 0) return null;

  return (
    <div className="mt-10 mb-8">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 rounded-full" style={{ backgroundColor: '#003998' }} />
        <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
          League Stories
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stories.map((story, i) => (
          <StoryCard
            key={i}
            story={story}
            index={i}
            onOpen={() => setOpenStory(story)}
          />
        ))}
      </div>

      <AnimatePresence>
        {openStory && (
          <StoryPanel
            key="story-panel"
            story={openStory}
            isOpen={!!openStory}
            onClose={() => setOpenStory(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
