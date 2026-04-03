'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LeaguePulseItem, StorylineTagType } from '@/lib/types';
import { TAG_CONFIG } from './StorylineTag';
import { NBA_TEAMS } from '@/lib/teams';
import { LeaguePulseIcon } from '@/lib/icons';

function getConferenceLabel(teams: string[]): string | null {
  if (!teams.length) return null;
  const confs = teams.map(abbr => NBA_TEAMS.find(t => t.abbreviation === abbr)?.conference).filter(Boolean);
  if (!confs.length) return null;
  const allEast = confs.every(c => c === 'East');
  const allWest = confs.every(c => c === 'West');
  if (allEast) return 'East';
  if (allWest) return 'West';
  return 'League';
}

interface Props {
  items: LeaguePulseItem[];
}

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1];

const cardVariants = {
  hidden: { opacity: 0, x: 24 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, delay: i * 0.06, ease: EASE_OUT },
  }),
};

function PulseCard({ item, index }: { item: LeaguePulseItem; index: number }) {
  const tagConfig = TAG_CONFIG[item.tag as StorylineTagType];
  const conf = getConferenceLabel(item.teams_involved);
  const confColor = conf === 'East' ? '#1a56c4' : conf === 'West' ? '#e55320' : '#6b7280';

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className="flex-shrink-0 rounded-xl p-4 flex flex-col"
      style={{
        width: 268,
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border)',
        scrollSnapAlign: 'start',
      }}
    >
      {/* Top row: tag + conference */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {tagConfig ? (
          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-medium ${tagConfig.colorClass} ${tagConfig.bgClass} ${tagConfig.borderClass}`}>
            <tagConfig.Icon size={10} color="currentColor" />
            {tagConfig.label}
          </div>
        ) : <div />}
        {conf && (
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
            style={{ color: confColor, backgroundColor: confColor + '15' }}
          >
            {conf}
          </span>
        )}
      </div>

      <p className="text-sm font-semibold leading-snug mb-2 flex-1" style={{ color: 'var(--text-primary)' }}>{item.headline}</p>
      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{item.summary}</p>

      {(item.teams_involved.length > 0 || item.players_involved.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {item.teams_involved.map(t => (
            <span key={t} className="text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}>{t}</span>
          ))}
          {item.players_involved.map(p => (
            <span key={p} className="text-[10px] px-1.5 py-0.5 rounded" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--bg-subtle)' }}>{p.split(' ').pop()}</span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default function LeaguePulse({ items }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  };

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', updateScrollState);
    return () => {
      el?.removeEventListener('scroll', updateScrollState);
      window.removeEventListener('resize', updateScrollState);
    };
  }, [items]);

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'right' ? 300 : -300, behavior: 'smooth' });
  };

  if (!items || items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <LeaguePulseIcon size={14} color="#f97316" />
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>League Pulse</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
            aria-label="Scroll left"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
              <polyline points="8,2 4,6 8,10" />
            </svg>
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-all disabled:opacity-20"
            style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)' }}
            aria-label="Scroll right"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--text-secondary)' }}>
              <polyline points="4,2 8,6 4,10" />
            </svg>
          </button>
        </div>
      </div>
      <div className="-mx-4 sm:-mx-6 lg:-mx-8">
        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 px-4 sm:px-6 lg:px-8"
          style={{ scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}
        >
          {items.map((item, i) => <PulseCard key={i} item={item} index={i} />)}
          <div className="flex-none w-4 sm:w-6 lg:w-8" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
