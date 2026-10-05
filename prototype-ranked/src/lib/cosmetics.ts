import type { Rarity, RewardItem } from '../types';

export type CosmeticKind = 'theme' | 'frame' | 'title' | 'nametag';
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
  /** frame ring gradient (static fallback; animated frames restyle it in CSS) */
  ring?: string;
  animated?: boolean;
  /** frame / nametag: effect key, styled in index.css (`fx-*` for frames, `nt-*` for name tags) */
  fx?: string;
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
  // League tiers: honest metal with a slow glint of light, nothing loud.
  { id: 'frame-none', kind: 'frame', lv: 'Bez rāmja', en: 'No frame', rarity: 'common', source: 'default', ring: 'linear-gradient(#ffffff22,#ffffff10)' },
  { id: 'frame-bronze', kind: 'frame', lv: 'Bronzas loks', en: 'Bronze ring', rarity: 'common', source: 'default', fx: 'metal', ring: 'conic-gradient(from 0deg,#ffc896,#9a4d1c,#ffc896,#7a3c14,#ffc896)', accent: '#d9803f' },
  { id: 'frame-silver', kind: 'frame', lv: 'Sudraba loks', en: 'Silver ring', rarity: 'rare', source: 'road', fx: 'metal', ring: 'conic-gradient(from 0deg,#ffffff,#8a95ab,#ffffff,#6b768c,#ffffff)', accent: '#b4bfd4' },
  { id: 'frame-gold', kind: 'frame', lv: 'Zelta lauri', en: 'Golden laurels', rarity: 'epic', source: 'road', fx: 'metal', ring: 'conic-gradient(from 0deg,#fff3b0,#d49a0a,#fff3b0,#a86f00,#fff3b0)', accent: '#f5b52e' },
  { id: 'frame-platinum', kind: 'frame', lv: 'Platīna aura', en: 'Platinum aura', rarity: 'epic', source: 'road', fx: 'breathe', ring: 'conic-gradient(from 0deg,#d4fff6,#14b8a6,#d4fff6,#0e7490,#d4fff6)', accent: '#2dd4bf' },
  { id: 'frame-diamond', kind: 'frame', lv: 'Dimanta kronis', en: 'Diamond crown', rarity: 'legendary', source: 'road', fx: 'prism', ring: 'conic-gradient(from 0deg,#eef2ff,#818cf8,#f0abfc,#67e8f9,#eef2ff)', accent: '#8b9dff', animated: true },
  // Earned and found frames: each one moves differently, and all of them react to hover.
  { id: 'frame-storm', kind: 'frame', lv: 'Vētra', en: 'Storm', rarity: 'rare', source: 'achievement', fx: 'storm', ring: 'conic-gradient(from 0deg,#1e293b 0 55%,#38bdf8 80%,#fff 100%)', accent: '#38bdf8', animated: true },
  { id: 'frame-neon', kind: 'frame', lv: 'Neona caurule', en: 'Neon tube', rarity: 'rare', source: 'shop', price: 450, fx: 'neon', ring: 'linear-gradient(#22d3ee,#22d3ee)', accent: '#22d3ee', animated: true },
  { id: 'frame-ember', kind: 'frame', lv: 'Žarijas', en: 'Embers', rarity: 'epic', source: 'achievement', fx: 'ember', ring: 'conic-gradient(from 0deg,#7c1d1d,#ef4444,#fb923c,#fde047,#fb923c,#ef4444,#7c1d1d)', accent: '#f97316', animated: true },
  { id: 'frame-orbit', kind: 'frame', lv: 'Orbīta', en: 'Orbit', rarity: 'epic', source: 'chest', fx: 'orbit', ring: 'conic-gradient(from 0deg,#c4b5fd,#6d28d9,#c4b5fd)', accent: '#a78bfa', animated: true },
  { id: 'frame-glitch', kind: 'frame', lv: 'Glitch', en: 'Glitch', rarity: 'epic', source: 'shop', price: 700, fx: 'glitch', ring: 'conic-gradient(from 0deg,#22d3ee,#e879f9,#0f172a,#22d3ee)', accent: '#e879f9', animated: true },
  { id: 'frame-aurora', kind: 'frame', lv: 'Polārblāzma', en: 'Aurora', rarity: 'legendary', source: 'chest', fx: 'aurora', ring: 'conic-gradient(from 0deg,#5eead4,#818cf8,#e879f9,#5eead4)', accent: '#5eead4', animated: true },
  { id: 'frame-void', kind: 'frame', lv: 'Tukšums', en: 'Void', rarity: 'legendary', source: 'chest', fx: 'void', ring: 'conic-gradient(from 0deg,#0b0615 0 35%,#7c3aed 60%,#f0abfc 75%,#0b0615 85%)', accent: '#a855f7', animated: true },

  // ── Name tags (the player's name itself, restyled) ──────────
  { id: 'tag-plain', kind: 'nametag', lv: 'Parasts', en: 'Plain', rarity: 'common', source: 'default' },
  { id: 'tag-chrome', kind: 'nametag', lv: 'Hroms', en: 'Chrome', rarity: 'rare', source: 'chest', fx: 'chrome' },
  { id: 'tag-frost', kind: 'nametag', lv: 'Sarma', en: 'Frost', rarity: 'rare', source: 'shop', price: 350, fx: 'frost' },
  { id: 'tag-neon', kind: 'nametag', lv: 'Neons', en: 'Neon', rarity: 'epic', source: 'shop', price: 650, fx: 'neon' },
  { id: 'tag-glitch', kind: 'nametag', lv: 'Glitch', en: 'Glitch', rarity: 'epic', source: 'chest', fx: 'glitch' },
  { id: 'tag-ember', kind: 'nametag', lv: 'Žarija', en: 'Ember', rarity: 'epic', source: 'achievement', fx: 'ember' },
  { id: 'tag-gilded', kind: 'nametag', lv: 'Apzeltīts', en: 'Gilded', rarity: 'epic', source: 'road', fx: 'gilded' },
  { id: 'tag-aurora', kind: 'nametag', lv: 'Polārblāzma', en: 'Aurora', rarity: 'legendary', source: 'chest', fx: 'aurora' },
  { id: 'tag-royal', kind: 'nametag', lv: 'Karalisks', en: 'Royal', rarity: 'legendary', source: 'weekly', fx: 'royal' },

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
  { id: 'title-deepfocus', kind: 'title', lv: 'Dziļā koncentrācija', en: 'Deep Focus', rarity: 'rare', source: 'shop', price: 300 },
  { id: 'title-clutch', kind: 'title', lv: 'Pēdējā sekunde', en: 'Last Second', rarity: 'rare', source: 'chest' },
  { id: 'title-unbroken', kind: 'title', lv: 'Nesalaužamais', en: 'Unbroken', rarity: 'epic', source: 'chest' },
];

const BY_ID = new Map(COSMETICS.map((c) => [c.id, c]));
export const cosmetic = (id: string) => BY_ID.get(id);

export const DEFAULT_OWNED = ['theme-cosmos', 'frame-none', 'frame-bronze', 'title-rookie', 'tag-plain'];
export const DEFAULT_EQUIPPED = { theme: 'theme-cosmos', frame: 'frame-bronze', title: 'title-rookie', nametag: 'tag-plain' };

/**
 * Cosmetics that were retired for looking cheap (flat colour cycles, clip-art
 * flowers, rainbow spinners) and the better item that replaces each one, so
 * nobody loses what they already earned.
 */
const LEGACY_IDS: Record<string, string> = {
  'frame-flame': 'frame-ember',
  'frame-bolt': 'frame-storm',
  'frame-sakura': 'frame-orbit',
  'frame-rainbow': 'frame-aurora',
  'title-bookworm': 'title-deepfocus',
  'title-quizwiz': 'title-clutch',
};

/** Repair saved ownership/equipment: remap retired ids, drop unknown ones, restore defaults. */
export function migrateCosmetics(
  owned: string[] | undefined,
  equipped: Partial<Record<CosmeticKind, string>> | undefined,
): { owned: string[]; equipped: Record<CosmeticKind, string> } {
  const remap = (id: string) => LEGACY_IDS[id] ?? id;
  const ownedSet = new Set<string>(DEFAULT_OWNED);
  for (const id of owned ?? []) {
    const next = remap(id);
    if (BY_ID.has(next)) ownedSet.add(next);
  }
  const eq = { ...DEFAULT_EQUIPPED } as Record<CosmeticKind, string>;
  for (const kind of Object.keys(eq) as CosmeticKind[]) {
    const id = remap(equipped?.[kind] ?? eq[kind]);
    if (BY_ID.get(id)?.kind === kind && ownedSet.has(id)) eq[kind] = id;
  }
  return { owned: [...ownedSet], equipped: eq };
}

export const RARITY_ORDER: Rarity[] = ['common', 'rare', 'epic', 'legendary'];
export const rarityRank = (r: Rarity) => RARITY_ORDER.indexOf(r);

export const RARITY_META: Record<Rarity, { lv: string; en: string; color: string; glow: string }> = {
  common: { lv: 'Parasta', en: 'Common', color: '#a3b1c6', glow: 'rgba(163,177,198,0.45)' },
  rare: { lv: 'Reta', en: 'Rare', color: '#38bdf8', glow: 'rgba(56,189,248,0.5)' },
  epic: { lv: 'Episka', en: 'Epic', color: '#c084fc', glow: 'rgba(192,132,252,0.55)' },
  legendary: { lv: 'Leģendāra', en: 'Legendary', color: '#fbbf24', glow: 'rgba(251,191,36,0.6)' },
};

export const BOOST_PRICE = 150;
export const SHOP_CHESTS: { rarity: Rarity; price: number }[] = [
  { rarity: 'rare', price: 300 },
  { rarity: 'epic', price: 800 },
];
export const SHOP_CHEST = SHOP_CHESTS[0];

/** What a duplicate cosmetic pays out instead, by its rarity. */
export const DUPE_COINS: Record<Rarity, number> = { common: 40, rare: 90, epic: 180, legendary: 360 };

// ── Chest odds ───────────────────────────────────────────────────────────

const COIN_RANGE: Record<Rarity, [number, number]> = {
  common: [40, 90],
  rare: [110, 200],
  epic: [220, 380],
  legendary: [480, 800],
};

interface ChestTable {
  /** Base chance that the chest holds a cosmetic at all. */
  chance: number;
  /** Relative weights of the cosmetic's rarity. */
  weights: Partial<Record<Rarity, number>>;
  /** Chance of a second, bonus cosmetic. */
  bonus: number;
}

/** Published drop table, so the odds shown to players are the odds the code rolls. */
export const CHEST_TABLE: Record<Rarity, ChestTable> = {
  common: { chance: 0.25, weights: { common: 75, rare: 25 }, bonus: 0 },
  rare: { chance: 0.5, weights: { common: 30, rare: 55, epic: 15 }, bonus: 0 },
  epic: { chance: 0.8, weights: { rare: 30, epic: 55, legendary: 15 }, bonus: 0.1 },
  legendary: { chance: 1, weights: { epic: 45, legendary: 55 }, bonus: 0.25 },
};

/** Each chest without a cosmetic adds this much to the next chest's chance… */
export const PITY_STEP = 0.12;
/** …and the chest after this many empty ones is guaranteed to hold one. */
export const PITY_MAX = 5;

export function cosmeticChance(rarity: Rarity, pity: number): number {
  if (pity >= PITY_MAX) return 1;
  return Math.min(1, CHEST_TABLE[rarity].chance + pity * PITY_STEP);
}

/** Normalised rarity odds (0–1) for a chest tier, for display. */
export function rarityOdds(rarity: Rarity): { rarity: Rarity; p: number }[] {
  const w = CHEST_TABLE[rarity].weights;
  const total = RARITY_ORDER.reduce((s, r) => s + (w[r] ?? 0), 0);
  return RARITY_ORDER.filter((r) => w[r]).map((r) => ({ rarity: r, p: (w[r] ?? 0) / total }));
}

function pickCosmetic(rarity: Rarity, owned: string[], taken: string[], rnd: () => number): string | null {
  const pool = COSMETICS.filter((c) => (c.source === 'chest' || c.source === 'shop') && !owned.includes(c.id) && !taken.includes(c.id));
  if (!pool.length) return null;
  const weights = CHEST_TABLE[rarity].weights;
  // Only roll rarities that still have something left to win.
  const live = RARITY_ORDER.filter((r) => (weights[r] ?? 0) > 0 && pool.some((c) => c.rarity === r));
  let target: Rarity;
  if (live.length) {
    const total = live.reduce((s, r) => s + (weights[r] ?? 0), 0);
    let roll = rnd() * total;
    target = live[live.length - 1];
    for (const r of live) {
      roll -= weights[r] ?? 0;
      if (roll < 0) {
        target = r;
        break;
      }
    }
  } else {
    // This tier's targets are all owned: fall back to the closest rarity left.
    const mid = rarityRank(rarity);
    target = pool.reduce((best, c) => (Math.abs(rarityRank(c.rarity) - mid) < Math.abs(rarityRank(best.rarity) - mid) ? c : best)).rarity;
  }
  const options = pool.filter((c) => c.rarity === target);
  return options[Math.floor(rnd() * options.length)].id;
}

export interface ChestRoll {
  items: RewardItem[];
  /** Whether a cosmetic dropped: resets the pity counter when true. */
  gotCosmetic: boolean;
}

/**
 * Roll a chest: always coins, then maybe a cosmetic (rarity weighted, with a
 * pity safety net), a rare chance of a bonus cosmetic, and RP boosts on
 * better chests. Items come back ordered so the best one is revealed last.
 */
export function rollChest(rarity: Rarity, owned: string[], pity = 0, rnd: () => number = Math.random): ChestRoll {
  const [lo, hi] = COIN_RANGE[rarity];
  const items: RewardItem[] = [{ kind: 'coins', amount: Math.round((lo + (hi - lo) * rnd()) / 5) * 5 }];
  if (rarity !== 'common') {
    items.push({ kind: 'boost', amount: rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : 1 });
  }
  const drops: string[] = [];
  if (rnd() < cosmeticChance(rarity, pity)) {
    const id = pickCosmetic(rarity, owned, drops, rnd);
    if (id) drops.push(id);
    else items.push({ kind: 'coins', amount: hi }); // collection complete: pay out coins instead
    if (id && rnd() < CHEST_TABLE[rarity].bonus) {
      const extra = pickCosmetic(rarity, owned, drops, rnd);
      if (extra) drops.push(extra);
    }
  }
  drops.sort((a, b) => rarityRank(cosmetic(a)!.rarity) - rarityRank(cosmetic(b)!.rarity));
  for (const id of drops) items.push({ kind: 'cosmetic', id });
  return { items, gotCosmetic: drops.length > 0 };
}
