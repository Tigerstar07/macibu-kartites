import { useMemo } from 'react';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AnswerLog, CardProgress, Deck, Lang, QType, Rarity, RewardItem } from '../types';
import { BUILTIN_DECKS } from '../data/decks';
import { gradeAnswer, newProgress, sm2 } from '../lib/sm2';
import { TIME_LIMIT, gradeFor, sessionRP, type Grade, type RPBreakdown } from '../lib/rp';
import { rankIndexFromRP, rankRPFactor, roadFor } from '../lib/rank';
import { DAY, dayKey, daysBetween, weekId } from '../lib/time';
import { questDef, rollDailyQuests, type QuestKind, type QuestState } from '../lib/quests';
import { ACHIEVEMENTS, achievementDef } from '../lib/achievements';
import { BOOST_PRICE, DEFAULT_EQUIPPED, DEFAULT_OWNED, DUPE_COINS, SHOP_CHESTS, cosmetic, migrateCosmetics, rollChest } from '../lib/cosmetics';
import { finalWeeklyPlace, placeFor, weeklyRewards } from '../lib/bots';
import { uid } from '../lib/random';
import { setSoundEnabled } from '../lib/sound';

// ── Types ────────────────────────────────────────────────────────────────

export interface Profile {
  name: string;
  avatar: string;
  hue: number;
  createdAt: number;
  role: 'user' | 'admin';
}

export interface Settings {
  lang: Lang;
  sound: boolean;
  reducedMotion: boolean;
  sessionLength: number;
  autoAdvance: boolean;
  darkMode: boolean;
}

export interface Stats {
  totalRP: number;
  weekId: string;
  weeklyRP: number;
  sessions: number;
  answered: number;
  correct: number;
  bestCombo: number;
  fastestMs: number | null;
  streak: number;
  bestStreak: number;
  lastActiveDay: string | null;
  /** day → answers given */
  activity: Record<string, number>;
  /** day → RP earned */
  rpByDay: Record<string, number>;
  decksStudied: string[];
  todayDecks: { day: string; ids: string[] };
  timeMs: number;
  bestWeeklyPlace: number | null;
  /** Highest rank index whose reward-road prize was paid out. */
  roadClaimed: number;
  lastDeckId: string | null;
}

export type ChestSource = 'road' | 'quest' | 'weekly' | 'shop' | 'achievement' | 'welcome' | 'dev' | 'chest';

export interface Chest {
  id: string;
  rarity: Rarity;
  source: ChestSource;
}

export type GameEvent =
  | { id: string; type: 'achievement'; achievementId: string }
  | { id: string; type: 'quest'; questId: string }
  | { id: string; type: 'weekly'; place: number; rp: number; rewards: RewardItem[] }
  | { id: string; type: 'reward'; items: RewardItem[]; lv: string; en: string };

export interface Ceremony {
  from: number;
  to: number;
  items: RewardItem[];
}

export interface SessionInput {
  deckId: string;
  answers: AnswerLog[];
  completed: boolean;
  bestCombo: number;
  boosted: boolean;
  durationMs: number;
}

export interface SessionOutcome {
  breakdown: RPBreakdown;
  rankMultiplier: number;
  rpBefore: number;
  rpAfter: number;
  rankBefore: number;
  rankAfter: number;
  weeklyBefore: number;
  weeklyAfter: number;
  placeBefore: number;
  placeAfter: number;
  streak: number;
  streakUp: boolean;
  accuracy: number;
  correct: number;
  total: number;
  avgMs: number;
  bestCombo: number;
  fastestMs: number | null;
  grade: Grade;
  promotions: { rankIndex: number; items: RewardItem[] }[];
  achievements: string[];
  completed: boolean;
  boosted: boolean;
}

interface QuestBook {
  day: string;
  items: QuestState[];
  bonusClaimed: boolean;
}

interface Wallet {
  coins: number;
  owned: string[];
  chests: Chest[];
  boosts: number;
}

interface AchievementCtx {
  perfect?: boolean;
  hour?: number;
  weeklyPlace?: number;
  completed?: boolean;
}

export interface GameState extends Wallet {
  profile: Profile | null;
  settings: Settings;
  userDecks: Deck[];
  progress: Record<string, CardProgress>;
  stats: Stats;
  equipped: { theme: string; frame: string; title: string; nametag: string };
  /** Chests opened in a row without a cosmetic: feeds the pity guarantee. */
  chestPity: number;
  achievements: Record<string, number>;
  quests: QuestBook;
  // transient UI state (not persisted)
  events: GameEvent[];
  openChestId: string | null;
  ceremony: Ceremony | null;

  setProfile: (p: Omit<Profile, 'createdAt' | 'role'>) => void;
  setRole: (role: Profile['role']) => void;
  updateSettings: (s: Partial<Settings>) => void;
  saveDeck: (deck: Deck) => void;
  deleteDeck: (id: string) => void;
  recordAnswer: (a: { cardKey: string; correct: boolean; ms: number; type: QType; relearn: boolean; timeout: boolean; combo: number }) => void;
  finishSession: (input: SessionInput) => SessionOutcome;
  unlockAchievements: (ctx: AchievementCtx) => string[];
  claimQuest: (id: string) => number;
  openChest: (id: string) => RewardItem[];
  setOpenChest: (id: string | null) => void;
  setCeremony: (c: Ceremony | null) => void;
  buyCosmetic: (id: string) => boolean;
  buyBoost: () => boolean;
  buyChest: (rarity?: Rarity) => boolean;
  equip: (id: string) => void;
  dismissEvent: (id: string) => void;
  tick: () => void;
  devAddRP: (n: number) => void;
  devAddChest: (rarity: Rarity) => void;
  resetAll: () => void;
}

// ── Helpers ──────────────────────────────────────────────────────────────

const freshStats = (now = Date.now()): Stats => ({
  totalRP: 0,
  weekId: weekId(now),
  weeklyRP: 0,
  sessions: 0,
  answered: 0,
  correct: 0,
  bestCombo: 0,
  fastestMs: null,
  streak: 0,
  bestStreak: 0,
  lastActiveDay: null,
  activity: {},
  rpByDay: {},
  decksStudied: [],
  todayDecks: { day: dayKey(now), ids: [] },
  timeMs: 0,
  bestWeeklyPlace: null,
  roadClaimed: 0,
  lastDeckId: null,
});

const freshGame = () => {
  const today = dayKey();
  return {
    profile: null,
    userDecks: [] as Deck[],
    progress: {} as Record<string, CardProgress>,
    stats: freshStats(),
    coins: 0,
    boosts: 0,
    owned: [...DEFAULT_OWNED],
    equipped: { ...DEFAULT_EQUIPPED },
    chests: [] as Chest[],
    chestPity: 0,
    achievements: {} as Record<string, number>,
    quests: { day: today, items: rollDailyQuests(today), bonusClaimed: false },
  };
};

const walletOf = (s: Wallet): Wallet => ({ coins: s.coins, owned: s.owned, chests: s.chests, boosts: s.boosts });

/** Pay out reward items. Duplicate cosmetics turn into coins. */
function grantItems(w: Wallet, items: RewardItem[], source: ChestSource): { wallet: Wallet; applied: RewardItem[] } {
  let { coins, boosts } = w;
  const owned = w.owned.slice();
  const chests = w.chests.slice();
  const applied: RewardItem[] = [];
  for (const it of items) {
    if (it.kind === 'coins') {
      coins += it.amount;
      applied.push(it);
    } else if (it.kind === 'boost') {
      boosts += it.amount;
      applied.push(it);
    } else if (it.kind === 'chest') {
      chests.push({ id: uid('c'), rarity: it.rarity, source });
      applied.push(it);
    } else if (owned.includes(it.id)) {
      const amount = DUPE_COINS[cosmetic(it.id)?.rarity ?? 'common'];
      coins += amount;
      applied.push({ kind: 'coins', amount, dupeOf: it.id });
    } else {
      owned.push(it.id);
      applied.push(it);
    }
  }
  return { wallet: { coins, owned, chests, boosts }, applied };
}

function applyPromotions(wallet: Wallet, from: number, to: number, roadClaimed: number) {
  const promotions: { rankIndex: number; items: RewardItem[] }[] = [];
  let w = wallet;
  let claimed = roadClaimed;
  for (let i = from + 1; i <= to; i++) {
    let items: RewardItem[] = [];
    if (i > claimed) {
      const r = grantItems(w, roadFor(i), 'road');
      w = r.wallet;
      items = r.applied;
      claimed = i;
    }
    promotions.push({ rankIndex: i, items });
  }
  return { wallet: w, promotions, roadClaimed: claimed };
}

function bumpQuests(q: QuestBook, kind: QuestKind, value: number, mode: 'add' | 'max') {
  const completed: string[] = [];
  const items = q.items.map((it) => {
    const def = questDef(it.id);
    if (!def || def.kind !== kind || it.claimed) return it;
    const before = it.progress;
    const progress = Math.min(def.target, mode === 'add' ? before + value : Math.max(before, value));
    if (before < def.target && progress >= def.target) completed.push(it.id);
    return progress === before ? it : { ...it, progress };
  });
  return { quests: { ...q, items }, completed };
}

// ── Store ────────────────────────────────────────────────────────────────

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      ...freshGame(),
      settings: {
        lang: 'lv',
        sound: true,
        reducedMotion: false,
        sessionLength: 10,
        autoAdvance: true,
        darkMode: typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? true : false,
      },
      events: [],
      openChestId: null,
      ceremony: null,

      setProfile: (p) =>
        set((st) => ({
          profile: { ...p, role: st.profile?.role ?? 'user', createdAt: st.profile?.createdAt ?? Date.now() },
          // First sign-up gets a welcome chest waiting on the home screen.
          chests: st.profile ? st.chests : [...st.chests, { id: uid('c'), rarity: 'rare', source: 'welcome' }],
        })),

      setRole: (role) => set((st) => (st.profile ? { profile: { ...st.profile, role } } : {})),

      updateSettings: (s) => {
        if (s.sound !== undefined) setSoundEnabled(s.sound);
        set((st) => ({ settings: { ...st.settings, ...s } }));
      },

      saveDeck: (deck) => {
        const cardIds = new Set(deck.cards.map((c) => c.id));
        set((st) => ({
          userDecks: st.userDecks.some((d) => d.id === deck.id)
            ? st.userDecks.map((d) => (d.id === deck.id ? deck : d))
            : [...st.userDecks, deck],
          progress: Object.fromEntries(
            Object.entries(st.progress).filter(([k]) => {
              if (!k.startsWith(`${deck.id}::`)) return true;
              const cardId = k.slice(deck.id.length + 2);
              return cardIds.has(cardId);
            }),
          ),
        }));
        get().unlockAchievements({});
      },

      deleteDeck: (id) =>
        set((st) => ({
          userDecks: st.userDecks.filter((d) => d.id !== id),
          progress: Object.fromEntries(Object.entries(st.progress).filter(([k]) => !k.startsWith(`${id}::`))),
          stats: {
            ...st.stats,
            lastDeckId: st.stats.lastDeckId === id ? null : st.stats.lastDeckId,
            decksStudied: st.stats.decksStudied.filter((d) => d !== id),
            todayDecks: {
              ...st.stats.todayDecks,
              ids: st.stats.todayDecks.ids.filter((d) => d !== id),
            },
          },
        })),

      recordAnswer: (a) => {
        const st = get();
        const now = Date.now();
        const today = dayKey(now);
        const progress = { ...st.progress };
        if (!a.relearn) {
          const q = gradeAnswer(a.correct, a.ms, TIME_LIMIT[a.type], a.type, a.timeout);
          progress[a.cardKey] = sm2(progress[a.cardKey] ?? newProgress(), q, now);
        } else if (a.correct) {
          const prevP = progress[a.cardKey];
          if (prevP) {
            progress[a.cardKey] = {
              ...prevP,
              due: Math.max(prevP.due, now + 12 * 3600000),
              correct: prevP.correct + 1,
              seen: prevP.seen + 1,
              last: now,
            };
          }
        }
        const stats: Stats = {
          ...st.stats,
          answered: st.stats.answered + 1,
          correct: st.stats.correct + (a.correct ? 1 : 0),
          activity: { ...st.stats.activity, [today]: (st.stats.activity[today] ?? 0) + 1 },
          bestCombo: Math.max(st.stats.bestCombo, a.combo),
        };
        if (a.correct && (stats.fastestMs === null || a.ms < stats.fastestMs)) stats.fastestMs = Math.round(a.ms);

        let quests = st.quests;
        const events = [...st.events];
        const bump = (kind: QuestKind, value: number, mode: 'add' | 'max') => {
          const r = bumpQuests(quests, kind, value, mode);
          quests = r.quests;
          for (const id of r.completed) events.push({ id: uid('e'), type: 'quest', questId: id });
        };
        if (a.correct) bump('correct', 1, 'add');
        if (a.correct && a.ms < 3000) bump('fast', 1, 'add');
        bump('combo', a.combo, 'max');

        set({ progress, stats, quests, events });
        get().unlockAchievements({});
      },

      finishSession: (input) => {
        get().tick();
        const st = get();
        const now = Date.now();
        const today = dayKey(now);
        const answered = input.answers.length;
        const rankedDeck = BUILTIN_DECKS.find((deck) => deck.id === input.deckId);
        const eligibleForRP = !!rankedDeck;
        const playerRankIndex = rankIndexFromRP(st.stats.totalRP);
        const rankMultiplier = rankedDeck
          ? rankRPFactor(rankedDeck.rankIndex ?? playerRankIndex, playerRankIndex)
          : 1;
        const scored = input.answers.filter((a) => !a.relearn);
        const correct = scored.filter((a) => a.correct).length;
        const accuracy = scored.length ? correct / scored.length : 0;
        const answerRPSum = eligibleForRP ? input.answers.reduce((s, a) => s + a.rp, 0) : 0;
        const avgMs = scored.length ? scored.reduce((s, a) => s + Math.min(a.ms, TIME_LIMIT[a.type]), 0) / scored.length : 0;
        const correctMs = input.answers.filter((a) => a.correct).map((a) => a.ms);
        const fastestMs = correctMs.length ? Math.min(...correctMs) : null;
        const perfect = input.completed && scored.length >= 5 && accuracy === 1;

        // Streak: a day counts once at least three questions were answered.
        const prev = st.stats;
        const firstToday = prev.lastActiveDay !== today;
        let { streak, bestStreak, lastActiveDay } = prev;
        let streakUp = false;
        if (answered >= 3 && prev.lastActiveDay !== today) {
          const gap = prev.lastActiveDay ? daysBetween(prev.lastActiveDay, today) : 99;
          if (gap > 0) {
            streak = gap === 1 ? prev.streak + 1 : 1;
            bestStreak = Math.max(bestStreak, streak);
            lastActiveDay = today;
            streakUp = true;
          }
        }
        const liveStreak = lastActiveDay && daysBetween(lastActiveDay, today) >= 0 && daysBetween(lastActiveDay, today) <= 1 ? streak : 0;

        const baseBreakdown = sessionRP({
          answerRP: answerRPSum,
          accuracy,
          completed: eligibleForRP && input.completed,
          answered: eligibleForRP ? answered : 0,
          streakDays: eligibleForRP ? liveStreak : 0,
          firstToday: eligibleForRP && firstToday,
        });
        const breakdown = eligibleForRP
          ? {
              ...baseBreakdown,
              answers: Math.round(baseBreakdown.answers * rankMultiplier),
              completion: Math.round(baseBreakdown.completion * rankMultiplier),
              accuracy: Math.round(baseBreakdown.accuracy * rankMultiplier),
              daily: Math.round(baseBreakdown.daily * rankMultiplier),
              streak: Math.round(baseBreakdown.streak * rankMultiplier),
              total:
                Math.round(baseBreakdown.answers * rankMultiplier) +
                Math.round(baseBreakdown.completion * rankMultiplier) +
                Math.round(baseBreakdown.accuracy * rankMultiplier) +
                Math.round(baseBreakdown.daily * rankMultiplier) +
                Math.round(baseBreakdown.streak * rankMultiplier),
            }
          : baseBreakdown;

        const rpBefore = prev.totalRP;
        const rpAfter = rpBefore + breakdown.total;
        const weeklyBefore = prev.weeklyRP;
        const weeklyAfter = weeklyBefore + breakdown.total;
        const placeBefore = placeFor(weeklyBefore, 'weekly', now);
        const placeAfter = placeFor(weeklyAfter, 'weekly', now);
        const rankBefore = rankIndexFromRP(rpBefore);
        const rankAfter = rankIndexFromRP(rpAfter);

        const promo = applyPromotions(
          { ...walletOf(st), boosts: eligibleForRP && input.boosted && (input.completed || answered >= 3) ? Math.max(0, st.boosts - 1) : st.boosts },
          rankBefore,
          rankAfter,
          prev.roadClaimed,
        );

        const studied = answered > 0;
        const todayIds = prev.todayDecks.day === today ? prev.todayDecks.ids : [];
        const stats: Stats = {
          ...prev,
          totalRP: rpAfter,
          weeklyRP: weeklyAfter,
          sessions: prev.sessions + (input.completed ? 1 : 0),
          streak,
          bestStreak,
          lastActiveDay,
          rpByDay: { ...prev.rpByDay, [today]: (prev.rpByDay[today] ?? 0) + breakdown.total },
          decksStudied:
            studied && !prev.decksStudied.includes(input.deckId) ? [...prev.decksStudied, input.deckId] : prev.decksStudied,
          todayDecks: {
            day: today,
            ids: studied && !todayIds.includes(input.deckId) ? [...todayIds, input.deckId] : todayIds,
          },
          timeMs: prev.timeMs + input.durationMs,
          bestCombo: Math.max(prev.bestCombo, input.bestCombo),
          bestWeeklyPlace: weeklyAfter > 0 ? Math.min(prev.bestWeeklyPlace ?? Infinity, placeAfter) : prev.bestWeeklyPlace,
          roadClaimed: promo.roadClaimed,
          lastDeckId: input.deckId,
        };

        let quests = st.quests;
        const events = [...st.events];
        const bump = (kind: QuestKind, value: number, mode: 'add' | 'max') => {
          const r = bumpQuests(quests, kind, value, mode);
          quests = r.quests;
          for (const id of r.completed) events.push({ id: uid('e'), type: 'quest', questId: id });
        };
        if (input.completed) bump('sessions', 1, 'add');
        if (breakdown.total > 0) bump('rp', breakdown.total, 'add');
        if (perfect) bump('perfect', 1, 'add');
        bump('decks', stats.todayDecks.ids.length, 'max');

        set({ stats, quests, events, ...promo.wallet });
        const achievements = get().unlockAchievements({
          perfect,
          hour: new Date(now).getHours(),
          weeklyPlace: placeAfter,
          completed: input.completed,
        });

        return {
          breakdown,
          rankMultiplier,
          rpBefore,
          rpAfter,
          rankBefore,
          rankAfter,
          weeklyBefore,
          weeklyAfter,
          placeBefore,
          placeAfter,
          streak: liveStreak,
          streakUp,
          accuracy,
          correct,
          total: scored.length,
          avgMs,
          bestCombo: input.bestCombo,
          fastestMs,
          grade: gradeFor(accuracy, avgMs),
          promotions: promo.promotions,
          achievements,
          completed: input.completed,
          boosted: input.boosted,
        };
      },

      unlockAchievements: (ctx) => {
        const st = get();
        const s = st.stats;
        const rank = rankIndexFromRP(s.totalRP);
        const liveStreak = effectiveStreak(s);
        const checks: Record<string, boolean> = {
          first: s.sessions >= 1,
          promoted: rank >= 1,
          perfect: !!ctx.perfect,
          lightning: s.fastestMs !== null && s.fastestMs < 1500,
          combo10: s.bestCombo >= 10,
          combo15: s.bestCombo >= 15,
          answers100: s.answered >= 100,
          correct250: s.correct >= 250,
          streak3: liveStreak >= 3,
          streak7: liveStreak >= 7,
          author: st.userDecks.length > 0,
          explorer: s.decksStudied.length >= 3,
          gold: rank >= 6,
          top10: ctx.weeklyPlace !== undefined && ctx.weeklyPlace <= 10 && s.weeklyRP > 0,
          owl: !!ctx.completed && ctx.hour !== undefined && (ctx.hour >= 22 || ctx.hour < 5),
          early: !!ctx.completed && ctx.hour !== undefined && ctx.hour >= 5 && ctx.hour < 8,
        };
        const fresh = ACHIEVEMENTS.filter((a) => !st.achievements[a.id] && checks[a.id]).map((a) => a.id);
        if (!fresh.length) return [];
        const now = Date.now();
        let wallet = walletOf(st);
        const achievements = { ...st.achievements };
        const events = [...st.events];
        for (const id of fresh) {
          achievements[id] = now;
          wallet = grantItems(wallet, achievementDef(id).reward, 'achievement').wallet;
          events.push({ id: uid('e'), type: 'achievement', achievementId: id });
        }
        set({ achievements, events, ...wallet });
        return fresh;
      },

      claimQuest: (id) => {
        const st = get();
        const q = st.quests.items.find((x) => x.id === id);
        if (!q || q.claimed) return 0;
        const def = questDef(id);
        if (!def || q.progress < def.target) return 0;
        const items = st.quests.items.map((x) => (x.id === id ? { ...x, claimed: true } : x));
        let chests = st.chests;
        let bonusClaimed = st.quests.bonusClaimed;
        const events = [...st.events];
        if (!bonusClaimed && items.every((x) => x.claimed)) {
          chests = [...chests, { id: uid('c'), rarity: 'rare', source: 'quest' }];
          bonusClaimed = true;
          events.push({
            id: uid('e'),
            type: 'reward',
            items: [{ kind: 'chest', rarity: 'rare' }],
            lv: 'Visi dienas uzdevumi izpildīti!',
            en: 'All daily quests complete!',
          });
        }
        set({ coins: st.coins + def.reward, quests: { ...st.quests, items, bonusClaimed }, chests, events });
        return def.reward;
      },

      openChest: (id) => {
        const st = get();
        const chest = st.chests.find((c) => c.id === id);
        if (!chest) return [];
        const roll = rollChest(chest.rarity, st.owned, st.chestPity);
        const r = grantItems({ ...walletOf(st), chests: st.chests.filter((c) => c.id !== id) }, roll.items, 'chest');
        set({ ...r.wallet, chestPity: roll.gotCosmetic ? 0 : st.chestPity + 1 });
        return r.applied;
      },

      setOpenChest: (id) => set({ openChestId: id }),
      setCeremony: (c) => set({ ceremony: c }),

      buyCosmetic: (id) => {
        const st = get();
        const item = cosmetic(id);
        if (!item?.price || st.owned.includes(id) || st.coins < item.price) return false;
        set({ coins: st.coins - item.price, owned: [...st.owned, id] });
        return true;
      },

      buyBoost: () => {
        const st = get();
        if (st.coins < BOOST_PRICE) return false;
        set({ coins: st.coins - BOOST_PRICE, boosts: st.boosts + 1 });
        return true;
      },

      buyChest: (rarity = 'rare') => {
        const st = get();
        const offer = SHOP_CHESTS.find((o) => o.rarity === rarity);
        if (!offer || st.coins < offer.price) return false;
        set({
          coins: st.coins - offer.price,
          chests: [...st.chests, { id: uid('c'), rarity: offer.rarity, source: 'shop' }],
        });
        return true;
      },

      equip: (id) => {
        const st = get();
        const item = cosmetic(id);
        if (!item || !st.owned.includes(id)) return;
        set({ equipped: { ...st.equipped, [item.kind]: id } });
      },

      dismissEvent: (id) => set((st) => ({ events: st.events.filter((e) => e.id !== id) })),

      /** Daily/weekly rollover: new quests each day, weekly board payout on Monday. */
      tick: () => {
        const st = get();
        const now = Date.now();
        const today = dayKey(now);
        const wk = weekId(now);
        const patch: Partial<GameState> = {};
        if (st.stats.weekId !== wk) {
          if (st.stats.weeklyRP > 0) {
            const prevWeekTime = (() => {
              if (!st.stats.weekId) return now - 7 * DAY;
              const [y, m, d] = st.stats.weekId.split('-').map(Number);
              return y && m && d ? new Date(y, m - 1, d, 12, 0, 0).getTime() : now - 7 * DAY;
            })();
            const place = finalWeeklyPlace(st.stats.weeklyRP, prevWeekTime);
            const r = grantItems(walletOf(st), weeklyRewards(place), 'weekly');
            Object.assign(patch, r.wallet);
            patch.events = [...st.events, { id: uid('e'), type: 'weekly', place, rp: st.stats.weeklyRP, rewards: r.applied }];
          }
          patch.stats = { ...st.stats, weekId: wk, weeklyRP: 0 };
        }
        // Streak maintenance: if lastActiveDay is more than 1 day in the past, reset stored streak
        if (st.stats.lastActiveDay && daysBetween(st.stats.lastActiveDay, today) > 1 && st.stats.streak > 0) {
          patch.stats = { ...(patch.stats ?? st.stats), streak: 0 };
        }
        if (st.quests.day !== today) patch.quests = { day: today, items: rollDailyQuests(today), bonusClaimed: false };
        if (Object.keys(patch).length) set(patch);
      },

      devAddRP: (n) => {
        get().tick();
        const st = get();
        const before = rankIndexFromRP(st.stats.totalRP);
        const after = rankIndexFromRP(st.stats.totalRP + n);
        const promo = applyPromotions(walletOf(st), before, after, st.stats.roadClaimed);
        set({
          ...promo.wallet,
          stats: {
            ...st.stats,
            totalRP: st.stats.totalRP + n,
            weeklyRP: st.stats.weeklyRP + n,
            roadClaimed: promo.roadClaimed,
          },
          ceremony: after > before ? { from: before, to: after, items: promo.promotions.flatMap((p) => p.items) } : st.ceremony,
        });
        get().unlockAchievements({ weeklyPlace: placeFor(st.stats.weeklyRP + n, 'weekly') });
      },

      devAddChest: (rarity) =>
        set((st) => ({ chests: [...st.chests, { id: uid('c'), rarity, source: 'dev' }] })),

      resetAll: () => set({ ...freshGame(), events: [], openChestId: null, ceremony: null }),
    }),
    {
      name: 'rrv-ranked-v1',
      version: 1,
      storage: createJSONStorage(() => ({
        getItem: (k: string) => {
          try {
            return localStorage.getItem(k);
          } catch {
            return null;
          }
        },
        setItem: (k: string, v: string) => {
          try {
            localStorage.setItem(k, v);
          } catch (e) {
            console.warn('[Storage] Quota exceeded or storage blocked', e);
          }
        },
        removeItem: (k: string) => {
          try {
            localStorage.removeItem(k);
          } catch {}
        },
      })),
      merge: (persistedState, currentState) => {
        const p = (persistedState ?? {}) as Partial<GameState>;
        const pStats = p.stats ?? ({} as Partial<Stats>);
        const fresh = freshGame();
        const migrated = migrateCosmetics(p.owned, p.equipped);
        return {
          ...currentState,
          ...p,
          profile: p.profile ? { ...p.profile, role: p.profile.role ?? 'user' } : null,
          settings: { ...currentState.settings, ...(p.settings ?? {}) },
          equipped: migrated.equipped,
          owned: migrated.owned,
          chestPity: typeof p.chestPity === 'number' ? p.chestPity : 0,
          quests: { ...currentState.quests, ...(p.quests ?? {}) },
          stats: {
            ...currentState.stats,
            ...pStats,
            todayDecks: pStats.todayDecks ?? fresh.stats.todayDecks,
            activity: pStats.activity ?? {},
            rpByDay: pStats.rpByDay ?? {},
            decksStudied: pStats.decksStudied ?? [],
          },
        };
      },
      partialize: (s) => ({
        profile: s.profile,
        settings: s.settings,
        userDecks: s.userDecks,
        progress: s.progress,
        stats: s.stats,
        coins: s.coins,
        boosts: s.boosts,
        owned: s.owned,
        equipped: s.equipped,
        chests: s.chests,
        chestPity: s.chestPity,
        achievements: s.achievements,
        quests: s.quests,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setSoundEnabled(state.settings.sound);
          if (state.settings.darkMode === undefined) {
            state.settings.darkMode =
              typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? true : false;
          }
        }
      },
    },
  ),
);

// ── Selectors ────────────────────────────────────────────────────────────

export function useAllDecks(): Deck[] {
  const user = useGame((s) => s.userDecks);
  return useMemo(() => [...BUILTIN_DECKS, ...user], [user]);
}

export function useDeck(id: string | undefined): Deck | undefined {
  const decks = useAllDecks();
  return useMemo(() => decks.find((d) => d.id === id), [decks, id]);
}

/** Streak as shown to the player: it survives until the end of the day after the last session. */
export function effectiveStreak(stats: Stats, now = Date.now()): number {
  if (!stats.lastActiveDay) return 0;
  const gap = daysBetween(stats.lastActiveDay, dayKey(now));
  return gap >= 0 && gap <= 1 ? stats.streak : 0;
}

export const playedToday = (stats: Stats, now = Date.now()) => stats.lastActiveDay === dayKey(now);
