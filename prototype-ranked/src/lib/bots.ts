import type { RewardItem } from '../types';
import { seeded } from './random';
import { DAY, HOUR, MINUTE, weekEnd, weekId, weekStart } from './time';
import { rankFromRP } from './rank';

/**
 * Simulated rivals for the prototype leaderboard. Everything is derived from
 * the clock with a seeded PRNG, so the board is stable across reloads but keeps
 * moving: each bot plays a few sessions inside a daily window, and every
 * finished session bumps its weekly RP in one chunk.
 */

export interface Player {
  id: string;
  name: string;
  avatar: string;
  hue: number;
  frame: string;
  title: string;
  weeklyRP: number;
  totalRP: number;
  streak: number;
  isYou?: boolean;
}

interface Bot {
  id: string;
  name: string;
  avatar: string;
  hue: number;
  activity: number;
  base0: number;
  title: string;
  streak: number;
}

const NAMES = [
  'Līga_M', 'KristapsK', 'annaaa', 'Jānis07', 'EvaStar', 'dāvis.dev', 'PaulaB', 'Rūdolfs', 'Sanija', 'arturs_lv',
  'Katrīna', 'Emīls', 'megija.k', 'Ralfs', 'Keita', 'TomsTheGreat', 'Laura', 'Markuss', 'Alise', 'nikss',
  'Estere', 'GustavsG', 'Beāte', 'Linda', 'Oskars', 'Viktorija', 'Edgars', 'Samanta', 'KārlisZ', 'Anete',
  'Ivo', 'Madara', 'Elīza', 'Dans', 'Zane',
];

export const AVATARS = ['🦊', '🐼', '🐸', '🦉', '🐯', '🐙', '🦄', '🐺', '🐧', '🦁', '🐨', '🐝', '🦋', '🐲', '🐳', '🦖', '🐱', '🐶', '🐰', '🐻', '🦝', '🐵', '🦜', '🐢', '🦈', '🐬', '🦩', '🐞'];

const BOT_TITLES = ['title-rookie', 'title-curious', 'title-bookworm', 'title-scholar', 'title-owl', 'title-flash', 'title-combo', 'title-quizwiz', 'title-goldmind'];
const LEAGUE_FRAMES = ['frame-bronze', 'frame-silver', 'frame-gold', 'frame-platinum', 'frame-diamond'];

/** Bots' all-time RP grows week by week from this Monday onwards. */
const EPOCH = new Date(2026, 7, 31).getTime();

export const BOTS: Bot[] = (() => {
  const r = seeded('bots-v1');
  return NAMES.map((name, i) => ({
    id: `bot-${i}`,
    name,
    avatar: AVATARS[(i * 7) % AVATARS.length],
    hue: Math.floor(r() * 360),
    activity: 0.25 + 1.65 * Math.pow(r(), 1.6),
    base0: Math.round(9000 * Math.pow(r(), 1.7)),
    title: BOT_TITLES[Math.floor(r() * BOT_TITLES.length)],
    streak: 1 + Math.floor(Math.pow(r(), 2) * 120),
  }));
})();

/** Share (0–1) of a bot's weekly target earned `hours` into the week. */
function weeklyFraction(botId: string, wk: string, hours: number): number {
  const r = seeded(botId, wk, 'schedule');
  let total = 0;
  let acc = 0;
  for (let d = 0; d < 7; d++) {
    const plays = r() > 0.22;
    const weight = 0.4 + r();
    const start = 7 + r() * 14;
    const sessions = 1 + Math.floor(r() * 4);
    const gap = 0.3 + r() * 1.2;
    if (!plays) continue;
    total += weight;
    const done = Math.max(0, Math.min(sessions, Math.floor((hours - (d * 24 + start)) / gap) + 1));
    acc += weight * (done / sessions);
  }
  return total > 0 ? acc / total : 0;
}

function botWeekly(bot: Bot, t: number): number {
  const wk = weekId(t);
  const target = bot.activity * (900 + 900 * seeded(bot.id, wk, 'target')());
  return Math.round(target * weeklyFraction(bot.id, wk, (t - weekStart(t)) / HOUR));
}

function botTotal(bot: Bot, t: number, weekly: number): number {
  const weeks = Math.max(0, Math.round((weekStart(t) - EPOCH) / (7 * DAY)));
  return bot.base0 + Math.round(weeks * bot.activity * 1100) + weekly;
}

function toPlayer(b: Bot, weeklyRP: number, t: number): Player {
  const totalRP = botTotal(b, t, weeklyRP);
  return {
    id: b.id,
    name: b.name,
    avatar: b.avatar,
    hue: b.hue,
    frame: LEAGUE_FRAMES[rankFromRP(totalRP).leagueIndex],
    title: b.title,
    weeklyRP,
    totalRP,
    streak: b.streak,
  };
}

export const botPlayers = (t: number = Date.now()): Player[] => BOTS.map((b) => toPlayer(b, botWeekly(b, t), t));

export type Board = 'weekly' | 'total';

export function sortPlayers(players: Player[], board: Board): Player[] {
  const key = board === 'weekly' ? 'weeklyRP' : 'totalRP';
  return players.slice().sort((a, b) => b[key] - a[key] || (a.isYou ? -1 : b.isYou ? 1 : a.name.localeCompare(b.name)));
}

/** 1-based place the player would hold with `rp` points (ties go to the player). */
export function placeFor(rp: number, board: Board, t: number = Date.now()): number {
  const key = board === 'weekly' ? 'weeklyRP' : 'totalRP';
  return 1 + botPlayers(t).filter((p) => p[key] > rp).length;
}

/** Final weekly placement once the week containing `t` has ended. */
export const finalWeeklyPlace = (rp: number, t: number) => placeFor(rp, 'weekly', weekEnd(t) - 1);

export interface Activity {
  id: string;
  player: Player;
  gain: number;
  at: number;
}

/** Sessions rivals finished in the last `windowMin` minutes (2-minute resolution). */
export function recentActivity(t: number, windowMin = 120, limit = 6): Activity[] {
  const out: Activity[] = [];
  const currentWeekStart = weekStart(t);
  const minutesIntoWeek = Math.max(0, Math.floor((t - currentWeekStart) / MINUTE));
  const effectiveWindow = Math.min(windowMin, minutesIntoWeek);
  if (effectiveWindow < 2) return [];

  for (const b of BOTS) {
    const nowRP = botWeekly(b, t);
    if (nowRP <= botWeekly(b, t - effectiveWindow * MINUTE)) continue;
    for (let m = 2; m <= effectiveWindow; m += 2) {
      const v = botWeekly(b, t - m * MINUTE);
      if (v < nowRP) {
        const at = t - (m - 1) * MINUTE;
        out.push({ id: `${b.id}-${Math.round(at / MINUTE)}`, player: toPlayer(b, nowRP, t), gain: nowRP - v, at });
        break;
      }
    }
  }
  return out.sort((a, b) => b.at - a.at).slice(0, limit);
}

/** What a final weekly placement pays out. */
export function weeklyRewards(place: number): RewardItem[] {
  if (place === 1)
    return [{ kind: 'coins', amount: 500 }, { kind: 'chest', rarity: 'epic' }, { kind: 'cosmetic', id: 'title-champion' }];
  if (place === 2) return [{ kind: 'coins', amount: 300 }, { kind: 'chest', rarity: 'rare' }];
  if (place === 3) return [{ kind: 'coins', amount: 200 }, { kind: 'chest', rarity: 'rare' }];
  if (place <= 10) return [{ kind: 'coins', amount: 100 }];
  return [{ kind: 'coins', amount: 30 }];
}

export const PRIZE_TIERS = [
  { lv: '1. vieta', en: '1st place', place: 1 },
  { lv: '2. vieta', en: '2nd place', place: 2 },
  { lv: '3. vieta', en: '3rd place', place: 3 },
  { lv: '4.–10. vieta', en: '4th–10th', place: 10 },
];
