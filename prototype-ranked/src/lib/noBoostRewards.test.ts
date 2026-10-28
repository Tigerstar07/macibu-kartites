import { describe, expect, it } from 'vitest';
import type { Rarity } from '../types';
import { COSMETICS, rollChest } from './cosmetics';
import { ALL_RANKS, roadFor } from './rank';

const rarities: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

describe('Rewards without ranked boosts', () => {
  it.each(rarities)('%s chests award coins and cosmetics without boosts', (rarity) => {
    for (const roll of [0, 0.2, 0.5, 0.999]) {
      const result = rollChest(rarity, [], 0, () => roll);
      expect(result.items.some((item) => item.kind === 'boost')).toBe(false);
      expect(result.items[0]).toMatchObject({ kind: 'coins' });
      expect(result.items.every((item) => item.kind === 'coins' || item.kind === 'cosmetic')).toBe(true);
    }
  });

  it.each(rarities)('%s completed collections receive coins without boosts', (rarity) => {
    const result = rollChest(rarity, COSMETICS.map((item) => item.id), 5, () => 0.999);
    expect(result.items).toHaveLength(2);
    expect(result.items.every((item) => item.kind === 'coins')).toBe(true);
    expect(result.gotCosmetic).toBe(false);
  });

  it('still awards a cosmetic when the pity guarantee is reached', () => {
    const result = rollChest('common', [], 5, () => 0.999);
    expect(result.gotCosmetic).toBe(true);
    expect(result.items.some((item) => item.kind === 'cosmetic')).toBe(true);
  });

  it('rank road claims award no boosts at any rank', () => {
    const rewards = ALL_RANKS.flatMap((rank) => roadFor(rank.index));
    expect(rewards.some((item) => item.kind === 'boost')).toBe(false);
    expect(roadFor(5)).toEqual([{ kind: 'cosmetic', id: 'theme-sunset' }]);
    expect(roadFor(11)).toEqual([{ kind: 'cosmetic', id: 'theme-aurora' }]);
  });
});
