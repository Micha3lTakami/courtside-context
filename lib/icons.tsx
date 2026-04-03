import React from 'react';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

// Rivalry Renewed: Two arrows colliding
export function RivalryRenewedIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 7l4-4 4 4" />
      <path d="M7 3v9" />
      <path d="M17 13l-4 4-4-4" />
      <path d="M13 17V8" />
      <line x1="9" y1="10" x2="11" y2="10" />
    </svg>
  );
}

// Playoff War: Shield with crosshair
export function PlayoffWarIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 2L4 5v6c0 3.5 2.5 6.2 6 7 3.5-.8 6-3.5 6-7V5L10 2z" />
      <line x1="10" y1="7" x2="10" y2="13" />
      <line x1="7" y1="10" x2="13" y2="10" />
      <circle cx="10" cy="10" r="1.5" />
    </svg>
  );
}

// Upset Alert: Exclamation in triangle
export function UpsetAlertIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 3L2 17h16L10 3z" />
      <line x1="10" y1="9" x2="10" y2="13" />
      <circle cx="10" cy="15.5" r="0.5" fill={color} />
    </svg>
  );
}

// Revenge Game: Theater mask (one half)
export function RevengeGameIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 4c0 0 2-1 6-1s6 1 6 1v8c0 2.5-2 4-6 4s-6-1.5-6-4V4z" />
      <path d="M7 9c0 0 .5 1 1.5 1S10 9 10 9" />
      <path d="M7 7c-.5 0-1-.3-1-.8" />
      <path d="M13 7c.5 0 1-.3 1-.8" />
      <path d="M10 9c0 0 .5-1.5 1.5-1.5s1.5.5 1.5.5" />
    </svg>
  );
}

// Star Showdown: Star with burst lines
export function StarShowdownIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polygon points="10,3 11.8,8.2 17.5,8.2 12.8,11.4 14.6,16.5 10,13.3 5.4,16.5 7.2,11.4 2.5,8.2 8.2,8.2" />
      <line x1="10" y1="1" x2="10" y2="2" />
      <line x1="17" y1="5" x2="16.3" y2="5.7" />
      <line x1="19" y1="10" x2="18" y2="10" />
      <line x1="3" y1="5" x2="3.7" y2="5.7" />
      <line x1="1" y1="10" x2="2" y2="10" />
    </svg>
  );
}

// Seeding Shakeup: Bracket arrow shifting
export function SeedingShakeupIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="4" y1="5" x2="9" y2="5" />
      <line x1="9" y1="5" x2="9" y2="10" />
      <line x1="9" y1="10" x2="14" y2="10" />
      <line x1="14" y1="10" x2="14" y2="15" />
      <polyline points="11,7 14,10 11,13" />
      <line x1="4" y1="15" x2="7" y2="15" />
    </svg>
  );
}

// On a Heater: Flame
export function OnAHeaterIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M10 2c0 0-5 5-5 10a5 5 0 0010 0c0-3-2-5-2-5s0 3-2 3c-1 0-2-1-2-2s1-2 1-6z" />
      <path d="M10 14c0 0-2-1-2-3" />
    </svg>
  );
}

// On the Ropes: Chain link breaking
export function OnTheRopesIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="7" width="5" height="3" rx="1.5" />
      <rect x="12" y="10" width="5" height="3" rx="1.5" />
      <line x1="8" y1="8.5" x2="9.5" y2="8.5" />
      <line x1="10.5" y1="11.5" x2="12" y2="11.5" />
      <line x1="9.5" y1="8.5" x2="10" y2="10" />
      <line x1="10" y1="10" x2="10.5" y2="11.5" />
      <line x1="9.8" y1="9" x2="10.2" y2="10.8" strokeDasharray="1 1" />
    </svg>
  );
}

// Your Team Impact: Bullseye / target
export function YourTeamImpactIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="10" cy="10" r="8" />
      <circle cx="10" cy="10" r="5" />
      <circle cx="10" cy="10" r="2" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="10" y1="16" x2="10" y2="18" />
      <line x1="2" y1="10" x2="4" y2="10" />
      <line x1="16" y1="10" x2="18" y2="10" />
    </svg>
  );
}

// Story: Transaction (trade arrows)
export function TransactionIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 6h12l-3-3" />
      <path d="M17 14H5l3 3" />
    </svg>
  );
}

// Story: Injury (medical cross)
export function InjuryIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <line x1="10" y1="6" x2="10" y2="14" />
      <line x1="6" y1="10" x2="14" y2="10" />
    </svg>
  );
}

// Story: Milestone (trophy)
export function MilestoneIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 3h8v7a4 4 0 0 1-8 0V3z" />
      <path d="M6 5H3a2 2 0 0 0 0 4h3" />
      <path d="M14 5h3a2 2 0 0 1 0 4h-3" />
      <line x1="10" y1="14" x2="10" y2="17" />
      <line x1="7" y1="17" x2="13" y2="17" />
    </svg>
  );
}

// Story: Performance (lightning bolt)
export function PerformanceIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="12,2 7,11 11,11 8,18 13,9 9,9" />
    </svg>
  );
}

// Story: Controversy (speech bubble with !)
export function ControversyIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 3h12a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H7l-4 3V4a1 1 0 0 1 1-1z" />
      <line x1="10" y1="6" x2="10" y2="9" />
      <circle cx="10" cy="11" r="0.5" fill={color} />
    </svg>
  );
}

// League Pulse: EKG / heartbeat line
export function LeaguePulseIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="1,10 5,10 7,4 9,16 11,7 13,13 15,10 19,10" />
    </svg>
  );
}

// Your Night: Moon with a star
export function YourNightIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M17 13A7 7 0 1 1 7 3a5 5 0 0 0 10 10z" />
      <line x1="15" y1="4" x2="15" y2="6" />
      <line x1="14" y1="5" x2="16" y2="5" />
    </svg>
  );
}

// History Tonight: Milestone flag / trophy
export function HistoryTonightIcon({ size = 16, color = 'currentColor', className = '' }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M7 2h8l-2 4 2 4H7V2z" />
      <line x1="7" y1="2" x2="7" y2="18" />
      <line x1="4" y1="18" x2="10" y2="18" />
    </svg>
  );
}
