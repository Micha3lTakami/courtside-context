'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { NBA_TEAMS } from '@/lib/teams';
import { getTeamLogoUrl } from '@/lib/teams';

interface Props {
  onConfirm: (abbr: string) => void;
}

const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function TeamSelect({ onConfirm }: Props) {
  const [picked, setPicked] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [hoveredTeam, setHoveredTeam] = useState('');

  const selectedTeam = NBA_TEAMS.find(t => t.abbreviation === picked);
  const teamColor = selectedTeam?.primaryColor ?? '#1a56c4';
  const teamSecondary = selectedTeam?.secondaryColor ?? '#002b5e';

  const handleConfirm = () => {
    if (confirming) return;
    setConfirming(true);
    // Small delay so the button animation plays before transition
    setTimeout(() => onConfirm(picked), 380);
  };

  const handleSkip = () => {
    if (confirming) return;
    setConfirming(true);
    setTimeout(() => onConfirm(''), 380);
  };

  return (
    <motion.div
      className="min-h-screen flex flex-col items-center relative overflow-hidden"
      style={{ backgroundColor: '#0c0f1e' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: confirming ? 0 : 1, scale: confirming ? 0.97 : 1, filter: confirming ? 'blur(6px)' : 'blur(0px)' }}
      exit={{ opacity: 0, scale: 0.97, filter: 'blur(6px)' }}
      transition={{ duration: confirming ? 0.38 : 0.4, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Static blue radial at top */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 90% 45% at 50% -5%, rgba(26,86,196,0.18) 0%, transparent 65%)',
        }}
      />

      {/* Dynamic team-color glow */}
      <AnimatePresence>
        {picked && (
          <motion.div
            key={picked}
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background: `radial-gradient(ellipse 70% 40% at 50% -5%, ${teamColor}22 0%, transparent 65%)`,
            }}
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 flex flex-col items-center">

        {/* Brand mark */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="mb-8 sm:mb-10 flex items-center gap-2"
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#003998' }}>
            <svg width="16" height="16" viewBox="0 0 28 28" fill="none">
              <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="1.5" />
              <path d="M2 14h24" stroke="white" strokeWidth="1.5" />
              <path d="M14 2v24" stroke="white" strokeWidth="1.5" />
              <path d="M6 5.5c3 2 5 5 5 8.5s-2 6.5-5 8.5" stroke="white" strokeWidth="1.5" fill="none" />
              <path d="M22 5.5c-3 2-5 5-5 8.5s2 6.5 5 8.5" stroke="white" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight" style={{ color: 'rgba(240,242,255,0.35)' }}>
            Courtside Context
          </span>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12, ease: EASE_SPRING }}
          className="text-center mb-2"
        >
          <h1
            className="text-4xl sm:text-5xl font-black tracking-tight leading-tight"
            style={{ color: '#f0f2ff' }}
          >
            Who are you rooting for?
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm sm:text-base mb-8 sm:mb-10 text-center"
          style={{ color: 'rgba(240,242,255,0.35)' }}
        >
          We'll build your perfect viewing night around your team.
        </motion.p>

        {/* Team grid */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: EASE_SPRING }}
          className="grid grid-cols-5 sm:grid-cols-6 gap-2 sm:gap-2.5 w-full"
        >
          {NBA_TEAMS.map((team, i) => {
            const isSelected = picked === team.abbreviation;
            const isHovered = hoveredTeam === team.abbreviation;
            const active = isSelected || isHovered;

            // Gradient glow: primary color tight, secondary color diffuses outward
            const glowShadow = active
              ? [
                  `0 0 0 1.5px ${team.primaryColor}${isHovered ? 'cc' : '70'}`,
                  `0 0 16px 3px ${team.primaryColor}${isHovered ? '75' : '40'}`,
                  `0 0 50px 14px ${team.secondaryColor}${isHovered ? '40' : '18'}`,
                  isHovered ? `inset 0 0 18px 0 ${team.primaryColor}15` : '',
                ].filter(Boolean).join(', ')
              : 'none';

            return (
              <motion.button
                key={team.abbreviation}
                onClick={() => setPicked(team.abbreviation)}
                onHoverStart={() => setHoveredTeam(team.abbreviation)}
                onHoverEnd={() => setHoveredTeam('')}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.28, delay: 0.28 + i * 0.016, ease: EASE_SPRING }}
                whileHover={{
                  scale: 1.1,
                  y: -4,
                  x: [0, -3, 3, -2, 2, -1, 0],
                  transition: {
                    scale: { duration: 0.14, ease: 'easeOut' },
                    y: { duration: 0.14, ease: 'easeOut' },
                    x: { duration: 0.38, ease: 'easeOut', times: [0, 0.15, 0.3, 0.5, 0.65, 0.82, 1] },
                  },
                }}
                whileTap={{ scale: 0.94, transition: { duration: 0.1 } }}
                className="relative flex flex-col items-center justify-center gap-1 sm:gap-1.5 rounded-xl cursor-pointer overflow-hidden"
                style={{
                  aspectRatio: '1',
                  padding: '8px 4px',
                  border: `1.5px solid ${active ? team.primaryColor : 'rgba(255,255,255,0.07)'}`,
                  backgroundColor: isSelected
                    ? `${team.primaryColor}1a`
                    : isHovered
                    ? `${team.primaryColor}12`
                    : 'rgba(255,255,255,0.025)',
                  boxShadow: glowShadow,
                  transition: 'border-color 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                {/* Gradient background bloom on hover */}
                {isHovered && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      background: `radial-gradient(ellipse at 50% 120%, ${team.secondaryColor}28 0%, transparent 65%), radial-gradient(ellipse at 50% -20%, ${team.primaryColor}30 0%, transparent 60%)`,
                    }}
                  />
                )}

                {/* Selection shimmer */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.35, 0] }}
                    transition={{ duration: 0.45 }}
                    style={{
                      background: `radial-gradient(circle at 50% 30%, ${team.primaryColor}50, transparent 70%)`,
                    }}
                  />
                )}

                <Image
                  src={getTeamLogoUrl(team.abbreviation)}
                  alt={team.name}
                  width={34}
                  height={34}
                  className="object-contain flex-shrink-0 sm:w-9 sm:h-9"
                  style={{
                    opacity: active ? 1 : 0.65,
                    transition: 'opacity 0.15s ease, filter 0.15s ease',
                    filter: active ? `drop-shadow(0 0 6px ${team.primaryColor}90)` : 'grayscale(20%)',
                  }}
                  unoptimized
                />
                <span
                  className="text-[9px] sm:text-[10px] font-bold tracking-wide leading-none"
                  style={{
                    color: active ? team.primaryColor : 'rgba(240,242,255,0.35)',
                    transition: 'color 0.15s ease',
                  }}
                >
                  {team.abbreviation}
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* CTA section */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.52, ease: EASE_SPRING }}
          className="flex flex-col items-center gap-4 mt-8 sm:mt-10"
        >
          {/* Selected team badge */}
          <AnimatePresence mode="wait">
            {picked && (
              <motion.div
                key={picked}
                initial={{ opacity: 0, y: 6, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -4, scale: 0.94 }}
                transition={{ duration: 0.22, ease: EASE_SPRING }}
                className="flex items-center gap-2 rounded-full px-4 py-1.5"
                style={{
                  backgroundColor: `${teamColor}15`,
                  border: `1px solid ${teamColor}40`,
                }}
              >
                <Image
                  src={getTeamLogoUrl(picked)}
                  alt={selectedTeam?.name ?? ''}
                  width={18}
                  height={18}
                  className="object-contain"
                  unoptimized
                />
                <span className="text-xs font-semibold" style={{ color: teamColor }}>
                  {selectedTeam?.full_name}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue button */}
          <motion.button
            onClick={handleConfirm}
            disabled={!picked || confirming}
            whileTap={picked ? { scale: 0.95 } : {}}
            animate={
              picked
                ? {
                    boxShadow: [
                      `0 0 22px 0px ${teamColor}28`,
                      `0 0 38px 8px ${teamColor}48`,
                      `0 0 22px 0px ${teamColor}28`,
                    ],
                  }
                : { boxShadow: '0 0 0 0px transparent' }
            }
            transition={picked ? { duration: 2.4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
            className="relative rounded-full font-bold text-sm px-12 py-3.5 overflow-hidden"
            style={{
              backgroundColor: picked ? teamColor : 'rgba(255,255,255,0.05)',
              color: picked ? '#fff' : 'rgba(240,242,255,0.2)',
              cursor: picked ? 'pointer' : 'not-allowed',
              border: picked ? 'none' : '1px solid rgba(255,255,255,0.07)',
              transition: 'background-color 0.3s ease, color 0.3s ease',
              minWidth: '220px',
            }}
          >
            {/* Shimmer overlay on button */}
            {picked && (
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{
                  backgroundPosition: ['200% center', '-200% center'],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                style={{
                  background: `linear-gradient(105deg, transparent 40%, ${teamSecondary}30 50%, transparent 60%)`,
                  backgroundSize: '200% 100%',
                }}
              />
            )}
            <span className="relative">
              {confirming
                ? 'Loading…'
                : picked
                ? "Let's Go →"
                : 'Pick a team to continue'}
            </span>
          </motion.button>

          <button
            onClick={handleSkip}
            className="text-xs transition-colors duration-200"
            style={{ color: 'rgba(240,242,255,0.22)' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'rgba(240,242,255,0.5)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'rgba(240,242,255,0.22)')}
          >
            Skip — Browse all games
          </button>
        </motion.div>

      </div>
    </motion.div>
  );
}
