import type { Rarity, RewardItem } from '../types';

export type CosmeticKind = 'theme' | 'frame' | 'title';
export type CosmeticSource = 'default' | 'road' | 'shop' | 'achievement' | 'chest' | 'weekly';

export interface Cosmetic {
  id: string;
  kind: CosmeticKind;
  lv: string;
  en: string;
  rarity: Rarity;
  source: CosmeticSource;
  price?: number;
  /** theme: card background */
  bg?: string;
  /** theme accent / frame base colour */
  accent?: string;
  /** frame ring gradient */
  ring?: string;
  animated?: boolean;
}

export const COSMETICS: Cosmetic[] = [
  // ── Card themes ─────────────────────────────────────────────
  { id: 'theme-cosmos', kind: 'theme', lv: 'Kosmoss', en: 'Cosmos', rarity: 'common', source: 'default', bg: 'linear-gradient(150deg,#262262 0%,#17144d 55%,#201552 100%)', accent: '#a78bfa' },
  { id: 'theme-ocean', kind: 'theme', lv: 'Okeāns', en: 'Ocean', rarity: 'rare', source: 'road', bg: 'linear-gradient(150deg,#0c4a6e 0%,#082f49 55%,#0a2540 100%)', accent: '#38bdf8' },
  { id: 'theme-sunset', kind: 'theme', lv: 'Saulriets', en: 'Sunset', rarity: 'rare', source: 'road', bg: 'linear-gradient(150deg,#6b1d4e 0%,#45113f 50%,#5a1f1a 100%)', accent: '#fb923c' },
  { id: 'theme-forest', kind: 'theme', lv: 'Mežs', en: 'Forest', rarity: 'rare', source: 'shop', price: 350, bg: 'linear-gradient(150deg,#0f4a37 0%,#0a3026 55%,#16301a 100%)', accent: '#4ade80' },
  { id: 'theme-neon', kind: 'theme', lv: 'Neons', en: 'Neon', rarity: 'epic', source: 'shop', price: 600, bg: 'linear-gradient(150deg,#3b0764 0%,#1e0a3c 50%,#0c1a4a 100%)', accent: '#f0abfc' },
  { id: 'theme-sakura', kind: 'theme', lv: 'Sakura', en: 'Sakura', rarity: 'epic', source: 'chest', bg: 'linear-gradient(150deg,#5b2140 0%,#3a1530 55%,#2a1838 100%)', accent: '#f9a8d4' },
  { id: 'theme-gold', kind: 'theme', lv: 'Zelta', en: 'Golden', rarity: 'epic', source: 'road', bg: 'linear-gradient(150deg,#5a4108 0%,#3a2905 55%,#4a3306 100%)', accent: '#fcd34d' },
  { id: 'theme-aurora', kind: 'theme', lv: 'Aurora', en: 'Aurora', rarity: 'legendary', source: 'road', bg: 'linear-gradient(130deg,#0f3b4a,#2a1b5e,#123d33,#3b1a52,#0f3b4a)', accent: '#5eead4', animated: true },
  { id: 'theme-diamond', kind: 'theme', lv: 'Dimanta', en: 'Diamond', rarity: 'legendary', source: 'road', bg: 'linear-gradient(130deg,#1e2a6b,#3a2a8a,#1a4a7a,#2a1f6b,#1e2a6b)', accent: '#c7d2fe', animated: true },

  // ── Avatar frames ───────────────────────────────────────────
  { id: 'frame-none', kind: 'frame', lv: 'Bez rāmja', en: 'No frame', rarity: 'common', source: 'default', ring: 'linear-gradient(#ffffff22,#ffffff10)' },
  { id: 'frame-bronze', kind: 'frame', lv: 'Bronzas loks', en: 'Bronze ring', rarity: 'common', source: 'default', ring: 'conic-gradient(from 0deg,#ffc896,#9a4d1c,#ffc896,#7a3c14,#ffc896)', accent: '#d9803f' },
  { id: 'frame-silver', kind: 'frame', lv: 'Sudraba loks', en: 'Silver ring', rarity: 'rare', source: 'road', ring: 'conic-gradient(from 0deg,#ffffff,#8a95ab,#ffffff,#6b768c,#ffffff)', accent: '#b4bfd4' },
  { id: 'frame-gold', kind: 'frame', lv: 'Zelta lauri', en: 'Golden laurels', rarity: 'epic', source: 'road', ring: 'conic-gradient(from 0deg,#fff3b0,#d49a0a,#fff3b0,#a86f00,#fff3b0)', accent: '#f5b52e' },
  { id: 'frame-platinum', kind: 'frame', lv: 'Platīna aura', en: 'Platinum aura', rarity: 'epic', source: 'road', ring: 'conic-gradient(from 0deg,#d4fff6,#14b8a6,#d4fff6,#0e7490,#d4fff6)', accent: '#2dd4bf' },
  { id: 'frame-diamond', kind: 'frame', lv: 'Dimanta kronis', en: 'Diamond crown', rarity: 'legendary', source: 'road', ring: 'conic-gradient(from 0deg,#eef2ff,#818cf8,#f0abfc,#67e8f9,#eef2ff)', accent: '#8b9dff', animated: true },
  { id: 'frame-flame', kind: 'frame', lv: 'Liesma', en: 'Flame', rarity: 'epic', source: 'achievement', ring: 'conic-gradient(from 0deg,#fde047,#f97316,#ef4444,#f97316,#fde047)', accent: '#f97316', animated: true },
  { id: 'frame-bolt', kind: 'frame', lv: 'Zibens', en: 'Lightning', rarity: 'rare', source: 'achievement', ring: 'conic-gradient(from 0deg,#fef08a,#38bdf8,#fef08a,#38bdf8,#fef08a)', accent: '#38bdf8' },
  { id: 'frame-sakura', kind: 'frame', lv: 'Sakuras zieds', en: 'Sakura bloom', rarity: 'epic', source: 'chest', ring: 'conic-gradient(from 0deg,#fce7f3,#f472b6,#fce7f3,#db2777,#fce7f3)', accent: '#f472b6' },
  { id: 'frame-rainbow', kind: 'frame', lv: 'Varavīksne', en: 'Rainbow', rarity: 'legendary', source: 'shop', price: 900, ring: 'conic-gradient(#f87171,#fbbf24,#4ade80,#22d3ee,#a78bfa,#f472b6,#f87171)', accent: '#a78bfa', animated: true },

  // ── Titles ──────────────────────────────────────────────────
  { id: 'title-rookie', kind: 'title', lv: 'Iesācējs', en: 'Rookie', rarity: 'common', source: 'default' },
  { id: 'title-curious', kind: 'title', lv: 'Zinātkārais', en: 'The Curious', rarity: 'rare', source: 'road' },
  { id: 'title-goldmind', kind: 'title', lv: 'Zelta prāts', en: 'Golden Mind', rarity: 'epic', source: 'road' },
  { id: 'title-strategist', kind: 'title', lv: 'Platīna stratēģis', en: 'Platinum Strategist', rarity: 'epic', source: 'road' },
  { id: 'title-legend', kind: 'title', lv: 'Dimanta leģenda', en: 'Diamond Legend', rarity: 'legendary', source: 'road' },
  { id: 'title-flawless', kind: 'title', lv: 'Nevainojamais', en: 'Flawless', rarity: 'rare', source: 'achievement' },
  { id: 'title-flash', kind: 'title', lv: 'Zibens prāts', en: 'Lightning Mind', rarity: 'rare', source: 'achievement' },
  { id: 'title-combo', kind: 'title', lv: 'Combo karalis', en: 'Combo King', rarity: 'epic', source: 'achievement' },
  { id: 'title-author', kind: 'title', lv: 'Kartīšu meistars', en: 'Card Crafter', rarity: 'common', source: 'achievement' },
  { id: 'title-owl', kind: 'title', lv: 'Nakts pūce', en: 'Night Owl', rarity: 'common', source: 'achievement' },
  { id: 'title-scholar', kind: 'title', lv: 'Zinātnieks', en: 'Scholar', rarity: 'epic', source: 'achievement' },
  { id: 'title-champion', kind: 'title', lv: 'Nedēļas čempions', en: 'Weekly Champion', rarity: 'legendary', source: 'weekly' },
  { id: 'title-bookworm', kind: 'title', lv: 'Grāmatu tārps', en: 'Bookworm', rarity: 'common', source: 'shop', price: 250 },
  { id: 'title-quizwiz', kind: 'title', lv: 'Viktorīnu burvis', en: 'Quiz Wizard', rarity: 'rare', source: 'chest' },
];

const BY_ID = new Map(COSMETICS.map((c) => [c.id, c]));
export const cosmetic = (id: string) => BY_ID.get(id);

export const DEFAULT_OWNED = ['theme-cosmos', 'frame-none', 'frame-bronze', 'title-rookie'];
export const DEFAULT_EQUIPPED = { theme: 'theme-cosmos', frame: 'frame-bronze', title: 'title-rookie' };

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

export const RARITY_META: Record<Rarity, { lv: string; en: string; color: string; glow: string }> = {
  common: { lv: 'Parasta', en: 'Common', color: '#a3b1c6', glow: 'rgba(163,177,198,0.45)' },
  rare: { lv: 'Reta', en: 'Rare', color: '#38bdf8', glow: 'rgba(56,189,248,0.5)' },
  epic: { lv: 'Episka', en: 'Epic', color: '#c084fc', glow: 'rgba(192,132,252,0.55)' },
  legendary: { lv: 'Leģendāra', en: 'Legendary', color: '#fbbf24', glow: 'rgba(251,191,36,0.6)' },
};

export const BOOST_PRICE = 150;
export const SHOP_CHEST: { rarity: Rarity; price: number } = { rarity: 'rare', price: 300 };

const COIN_RANGE: Record<Rarity, [number, number]> = {
  common: [40, 90],
  rare: [110, 200],
  epic: [220, 380],
  legendary: [480, 800],
};

/** Roll a chest's contents: always coins, then a cosmetic (chance by rarity) or RP boosts. */
export function rollChest(rarity: Rarity, owned: string[], rnd: () => number = Math.random): RewardItem[] {
  const [lo, hi] = COIN_RANGE[rarity];
  const items: RewardItem[] = [{ kind: 'coins', amount: Math.round((lo + (hi - lo) * rnd()) / 5) * 5 }];
  const cosmeticChance = { common: 0.3, rare: 0.55, epic: 0.85, legendary: 1 }[rarity];
  const maxRarity = Math.max(1, RARITY_ORDER.indexOf(rarity));
  const pool = COSMETICS.filter(
    (c) =>
      (c.source === 'chest' || c.source === 'shop') &&
      !owned.includes(c.id) &&
      RARITY_ORDER.indexOf(c.rarity) <= maxRarity,
  );
  if (pool.length && rnd() < cosmeticChance) {
    items.push({ kind: 'cosmetic', id: pool[Math.floor(rnd() * pool.length)].id });
  }
  if (rarity !== 'common') {
    items.push({ kind: 'boost', amount: rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : 1 });
  }
  return items;
}
