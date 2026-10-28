import { describe, expect, it } from 'vitest';
import { BUILTIN_DECKS } from '../data/decks';
import { chooseRankedDeck } from './rank';

describe('Ranked nejaušās kopas izvēle', () => {
  const bronze = BUILTIN_DECKS.find((deck) => deck.rankRange?.[0] === 0)!;

  it('neizvēlas personīgo kopu pat tad, ja tā ir pirmā sarakstā', () => {
    const personal = { ...bronze, id: 'personal', builtin: false };
    expect(chooseRankedDeck([personal, bronze], 0, () => 0)?.id).toBe(bronze.id);
  });

  it('izlaiž kopu, kurai nav spēlējamu kartīšu', () => {
    const empty = { ...bronze, id: 'empty', cards: [] };
    expect(chooseRankedDeck([empty, bronze], 0, () => 0)?.id).toBe(bronze.id);
  });

  it('izvēlas tikai pašreizējam rangam pieejamu kopu', () => {
    const locked = { ...bronze, id: 'locked', rankRange: [3, 5] as const };
    expect(chooseRankedDeck([locked, bronze], 0, () => 0)?.id).toBe(bronze.id);
    expect(chooseRankedDeck([locked], 0, () => 0)).toBeUndefined();
  });

  it('var izvēlēties pēdējo derīgo kopu', () => {
    const second = { ...bronze, id: 'second' };
    expect(chooseRankedDeck([bronze, second], 0, () => 0.999)?.id).toBe('second');
  });
});
