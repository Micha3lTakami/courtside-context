'use client';

import React from 'react';
import { TEAM_SELECTOR_OPTIONS } from '@/lib/teams';

interface TeamSelectorProps {
  value: string;
  onChange: (team: string) => void;
}

export default function TeamSelector({ value, onChange }: TeamSelectorProps) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          appearance-none bg-white/5 border border-white/10 rounded-lg
          text-white text-sm pl-3 pr-8 py-2
          focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/20
          cursor-pointer hover:bg-white/8 transition-colors duration-150
          min-w-[200px]
        "
      >
        {TEAM_SELECTOR_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#0f0f0f] text-white">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </div>
    </div>
  );
}
