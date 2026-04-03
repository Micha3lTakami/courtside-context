'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';
import GameCard from '@/components/GameCard';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import YourNight from '@/components/YourNight';
import LeaguePulse from '@/components/LeaguePulse';
import GameDrawer from '@/components/GameDrawer';
import LeagueStories from '@/components/LeagueStories';
import Footer from '@/components/Footer';
import TeamSelect from '@/components/TeamSelect';
import { GameWithContext, ViewingPlan, LeaguePulseItem, LeagueStoryItem } from '@/lib/types';

const EASE_SPRING: [number, number, number, number] = [0.16, 1, 0.3, 1];
const LS_KEY = 'courtside_team';

export default function Home() {
  const [phase, setPhase] = useState<'select' | 'dashboard'>('select');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [games, setGames] = useState<GameWithContext[]>([]);
  const [gamesLoading, setGamesLoading] = useState(true);
  const [contextLoading, setContextLoading] = useState(false);
  const [viewingPlan, setViewingPlan] = useState<ViewingPlan | null>(null);
  const [leaguePulse, setLeaguePulse] = useState<LeaguePulseItem[]>([]);
  const [leagueStories, setLeagueStories] = useState<LeagueStoryItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openGameId, setOpenGameId] = useState<string | null>(null);
  const contextController = useRef<AbortController | null>(null);
  const leagueController = useRef<AbortController | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // On mount: restore saved team or show team select
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (saved !== null) {
      setSelectedTeam(saved);
      setPhase('dashboard');
    }
  }, []);

  // Phase 1: fetch basic game data immediately (runs regardless of phase)
  useEffect(() => {
    async function loadGames() {
      setGamesLoading(true);
      try {
        const res = await fetch('/api/games');
        if (res.ok) {
          const data = await res.json();
          setGames(data.games || []);
        }
      } catch { /* show empty state */ }
      finally { setGamesLoading(false); }
    }
    loadGames();
  }, []);

  // Score polling — self-rescheduling setTimeout avoids stale-closure bug with setInterval.
  // Polls every 15s when any game is live, 5min otherwise.
  useEffect(() => {
    if (gamesLoading) return;
    let cancelled = false;

    const refresh = async () => {
      if (cancelled) return;
      try {
        const res = await fetch('/api/scores');
        if (!res.ok || cancelled) return;
        const { scores } = await res.json();
        if (cancelled) return;
        setGames(prev =>
          prev.map(game => {
            const upd = scores.find((s: { id: string }) => s.id === game.id);
            if (!upd) return game;
            return { ...game, status: upd.status, home_team_score: upd.home_team_score, visitor_team_score: upd.visitor_team_score, time: upd.time, broadcast: upd.broadcast ?? game.broadcast };
          })
        );
        const hasLive = scores.some((s: { status: string }) => s.status === 'in_progress');
        if (!cancelled) intervalRef.current = setTimeout(refresh, hasLive ? 15_000 : 60_000) as unknown as ReturnType<typeof setInterval>;
      } catch {
        if (!cancelled) intervalRef.current = setTimeout(refresh, 30_000) as unknown as ReturnType<typeof setInterval>;
      }
    };

    refresh(); // immediate first call
    return () => {
      cancelled = true;
      if (intervalRef.current) clearTimeout(intervalRef.current as unknown as ReturnType<typeof setTimeout>);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesLoading]);

  // Phase 2: fetch AI context + league — only after team is confirmed
  const fetchContext = useCallback(async (team: string) => {
    if (contextController.current) contextController.current.abort();
    const controller = new AbortController();
    contextController.current = controller;
    setContextLoading(true);
    setError(null);

    const contextPromise = fetch(
      `/api/context${team ? `?team=${encodeURIComponent(team)}` : ''}`,
      { signal: controller.signal }
    )
      .then(async res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (controller.signal.aborted) return;
        if (data.games?.length > 0) {
          // Merge AI context fields, but preserve live score/status/time from current state
          // (context is cached 20min — scores may have advanced significantly since then)
          setGames(prev => data.games.map((ctxGame: import('@/lib/types').GameWithContext) => {
            const live = prev.find(g => g.id === ctxGame.id);
            if (!live) return ctxGame;
            return {
              ...ctxGame,
              status: live.status,
              home_team_score: live.home_team_score,
              visitor_team_score: live.visitor_team_score,
              time: live.time,
              broadcast: live.broadcast ?? ctxGame.broadcast,
            };
          }));
        }
        setViewingPlan(data.viewing_plan || null);
        if (data.error) setError(data.error);
      })
      .catch(err => {
        if ((err as Error).name === 'AbortError') return;
        setError('Context unavailable — games shown without analysis');
      })
      .finally(() => {
        if (!controller.signal.aborted) setContextLoading(false);
      });

    if (leagueController.current) leagueController.current.abort();
    const leagueCtrl = new AbortController();
    leagueController.current = leagueCtrl;
    fetch('/api/league', { signal: leagueCtrl.signal })
      .then(async res => {
        if (!res.ok || leagueCtrl.signal.aborted) return;
        const data = await res.json();
        if (leagueCtrl.signal.aborted) return;
        setLeaguePulse(data.league_pulse || []);
        setLeagueStories(data.league_stories || []);
      })
      .catch(() => {});

    await contextPromise;
  }, []);

  // Trigger context fetch whenever team changes (on dashboard only)
  useEffect(() => {
    if (phase === 'select') return;
    fetchContext(selectedTeam);
  }, [selectedTeam, phase, fetchContext]);

  // Team confirmed from TeamSelect
  const handleTeamConfirm = (team: string) => {
    setSelectedTeam(team);
    localStorage.setItem(LS_KEY, team);
    setPhase('dashboard');
  };

  // Team changed via header dropdown
  const handleTeamChange = (team: string) => {
    setSelectedTeam(team);
    localStorage.setItem(LS_KEY, team);
  };

  const openGame = games.find(g => g.id === openGameId) || null;

  return (
    <AnimatePresence mode="wait">
      {phase === 'select' ? (
        <TeamSelect key="select" onConfirm={handleTeamConfirm} />
      ) : (
        <motion.div
          key="dashboard"
          className="flex flex-col min-h-screen"
          style={{ backgroundColor: 'var(--bg)' }}
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_SPRING }}
        >
          <Header selectedTeam={selectedTeam} onTeamChange={handleTeamChange} />

          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">

            <AnimatePresence>
              {leaguePulse.length > 0 && (
                <motion.div
                  key="league-pulse"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_SPRING }}
                >
                  <LeaguePulse items={leaguePulse} />
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {selectedTeam && viewingPlan && (
                <motion.div
                  key="your-night"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_SPRING }}
                >
                  <YourNight plan={viewingPlan} team={selectedTeam} className="mb-8" />
                </motion.div>
              )}
            </AnimatePresence>

            {error && !gamesLoading && games.length > 0 && (
              <div className="mb-6 flex items-center gap-2 text-sm rounded-lg px-4 py-3"
                style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                <span>{error}</span>
              </div>
            )}

            {gamesLoading ? (
              <LoadingSkeleton />
            ) : games.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-400 text-base font-medium mb-2">No games tonight</p>
                <p className="text-gray-600 text-sm">Check back tomorrow</p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between">
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {games.length} game{games.length !== 1 ? 's' : ''} tonight
                    {selectedTeam && <span className="ml-1" style={{ color: '#34d399' }}>· {selectedTeam}</span>}
                  </p>
                  {contextLoading && (
                    <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <div
                        className="w-3 h-3 rounded-full animate-spin"
                        style={{ border: '1.5px solid var(--border-strong)', borderTopColor: 'var(--accent-bright)' }}
                      />
                      Loading analysis...
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {games.map((game, i) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      index={i}
                      contextLoading={contextLoading}
                      onOpen={() => setOpenGameId(game.id)}
                    />
                  ))}
                </div>
              </>
            )}

            <AnimatePresence>
              {leagueStories.length > 0 && (
                <motion.div
                  key="league-stories"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <LeagueStories stories={leagueStories} />
                </motion.div>
              )}
            </AnimatePresence>

          </main>

          <Footer />

          <GameDrawer
            game={openGame}
            isOpen={!!openGameId}
            onClose={() => setOpenGameId(null)}
            selectedTeam={selectedTeam}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
