'use client';

import React, { useEffect, useState } from 'react';
import TeamSelector from './TeamSelector';

interface HeaderProps {
  selectedTeam: string;
  onTeamChange: (team: string) => void;
}

function BasketballLogo() {
  return (
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ backgroundColor: '#003998' }}
    >
      <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="12" stroke="white" strokeWidth="1.5" />
        <path d="M2 14h24" stroke="white" strokeWidth="1.5" />
        <path d="M14 2v24" stroke="white" strokeWidth="1.5" />
        <path d="M6 5.5c3 2 5 5 5 8.5s-2 6.5-5 8.5" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M22 5.5c-3 2-5 5-5 8.5s2 6.5 5 8.5" stroke="white" strokeWidth="1.5" fill="none" />
      </svg>
    </div>
  );
}

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Header({ selectedTeam, onTeamChange }: HeaderProps) {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const initial = saved || 'dark';
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  };

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{ backgroundColor: 'var(--header-bg)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo + Name */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <BasketballLogo />
            <div>
              <h1 className="font-semibold text-lg leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Courtside Context
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{today}</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-secondary)',
              }}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </button>

            <span className="text-xs font-medium hidden sm:block" style={{ color: 'var(--text-muted)' }}>Your team:</span>
            <TeamSelector value={selectedTeam} onChange={onTeamChange} />
          </div>
        </div>
      </div>
    </header>
  );
}
