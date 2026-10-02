import type { Lang, RewardItem } from '../types';

export type LeagueId = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface League {
  id: LeagueId;
  lv: string;
  en: string;
  /** light → mid → dark */
  c1: string;
  c2: string;
  c3: string;
  glow: string;
}

export const LEAGUES: League[] = [
  { id: 'bronze', lv: 'Bronza', en: 'Bronze', c1: '#ffc896', c2: '#d9803f', c3: '#7a3c14', glow: 'rgba(240,150,90,0.55)' },
  { id: 'silver', lv: 'Sudrabs', en: 'Silver', c1: '#ffffff', c2: '#b4bfd4', c3: '#56627a', glow: 'rgba(200,214,240,0.55)' },
  { id: 'gold', lv: 'Zelts', en: 'Gold', c1: '#fff3b0', c2: '#f5b52e', c3: '#8a5200', glow: 'rgba(250,196,60,0.6)' },
  { id: 'platinum', lv: 'Platīns', en: 'Platinum', c1: '#d4fff6', c2: '#2dd4bf', c3: '#0b5e66', glow: 'rgba(60,225,200,0.55)' },
  { id: 'diamond', lv: 'Dimants', en: 'Diamond', c1: '#eef2ff', c2: '#8b9dff', c3: '#4c2fe0', glow: 'rgba(140,150,255,0.7)' },
];

export const DIVISIONS = ['III', 'II', 'I'] as const;
export type Division = (typeof DIVISIONS)[number];

/** RP needed for each of the 15 ranks (Bronze III … Diamond I). */
export const THRESHOLDS = [0, 150, 350, 600, 850, 1150, 1500, 1950, 2450, 3000, 3600, 4300, 5000, 6000, 7200];
export const MAX_RANK = THRESHOLDS.length - 1;

export interface Rank {
  index: number;
  league: League;
  leagueIndex: number;
  division: Division;
  minRP: number;
  nextRP: number | null;
}

export function rankAt(index: number): Rank {
  const i = Math.max(0, Math.min(MAX_RANK, index));
  return {
    index: i,
    league: LEAGUES[Math.floor(i / 3)],
    leagueIndex: Math.floor(i / 3),
    division: DIVISIONS[i % 3],
    minRP: THRESHOLDS[i],
    nextRP: i < MAX_RANK ? THRESHOLDS[i + 1] : null,
  };
}

export function rankIndexFromRP(rp: number): number {
  let i = 0;
  while (i < MAX_RANK && rp >= THRESHOLDS[i + 1]) i++;
  return i;
}

export const rankFromRP = (rp: number) => rankAt(rankIndexFromRP(rp));

export function rankProgress(rp: number): number {
  const r = rankFromRP(rp);
  if (r.nextRP === null) return 1;
  return (rp - r.minRP) / (r.nextRP - r.minRP);
}

export const rankName = (r: Rank, lang: Lang) => `${r.league[lang]} ${r.division}`;

export const ALL_RANKS = THRESHOLDS.map((_, i) => rankAt(i));

export interface RoadStep {
  rankIndex: number;
  items: RewardItem[];
}

/** The ranked reward road — every division reached pays out. */
export const ROAD: RoadStep[] = [
  { rankIndex: 1, items: [{ kind: 'coins', amount: 100 }, { kind: 'chest', rarity: 'common' }] },
  { rankIndex: 2, items: [{ kind: 'cosmetic', id: 'theme-ocean' }] },
  { rankIndex: 3, items: [{ kind: 'cosmetic', id: 'frame-silver' }, { kind: 'cosmetic', id: 'title-curious' }, { kind: 'coins', amount: 150 }] },
  { rankIndex: 4, items: [{ kind: 'chest', rarity: 'rare' }] },
  { rankIndex: 5, items: [{ kind: 'cosmetic', id: 'theme-sunset' }, { kind: 'boost', amount: 1 }] },
  { rankIndex: 6, items: [{ kind: 'cosmetic', id: 'frame-gold' }, { kind: 'cosmetic', id: 'title-goldmind' }, { kind: 'coins', amount: 250 }] },
  { rankIndex: 7, items: [{ kind: 'chest', rarity: 'rare' }, { kind: 'coins', amount: 150 }] },
  { rankIndex: 8, items: [{ kind: 'cosmetic', id: 'theme-gold' }] },
  { rankIndex: 9, items: [{ kind: 'cosmetic', id: 'frame-platinum' }, { kind: 'cosmetic', id: 'title-strategist' }, { kind: 'coins', amount: 350 }] },
  { rankIndex: 10, items: [{ kind: 'chest', rarity: 'epic' }] },
  { rankIndex: 11, items: [{ kind: 'cosmetic', id: 'theme-aurora' }, { kind: 'boost', amount: 2 }] },
  { rankIndex: 12, items: [{ kind: 'cosmetic', id: 'frame-diamond' }, { kind: 'cosmetic', id: 'title-legend' }, { kind: 'coins', amount: 500 }] },
  { rankIndex: 13, items: [{ kind: 'chest', rarity: 'legendary' }] },
  { rankIndex: 14, items: [{ kind: 'cosmetic', id: 'theme-diamond' }, { kind: 'coins', amount: 1000 }] },
];

export const roadFor = (rankIndex: number): RewardItem[] => ROAD.find((s) => s.rankIndex === rankIndex)?.items ?? [];
