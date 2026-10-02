import { useEffect, useMemo, useState } from 'react';
import type { Player } from '../lib/bots';
import { effectiveStreak, useGame } from './useGame';

/** Re-render on an interval with the current timestamp. */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const iv = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(iv);
  }, [intervalMs]);
  return now;
}

/** The local player shaped like a leaderboard row. */
export function useYouPlayer(): Player | null {
  const profile = useGame((s) => s.profile);
  const stats = useGame((s) => s.stats);
  const equipped = useGame((s) => s.equipped);
  return useMemo(
    () =>
      profile
        ? {
            id: 'you',
            name: profile.name,
            avatar: profile.avatar,
            hue: profile.hue,
            frame: equipped.frame,
            title: equipped.title,
            weeklyRP: stats.weeklyRP,
            totalRP: stats.totalRP,
            streak: effectiveStreak(stats),
            isYou: true,
          }
        : null,
    [profile, stats, equipped],
  );
}
