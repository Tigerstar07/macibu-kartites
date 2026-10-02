import { seeded } from './random';

export type QuestKind = 'correct' | 'sessions' | 'combo' | 'rp' | 'perfect' | 'fast' | 'decks';

export interface QuestDef {
  id: string;
  kind: QuestKind;
  target: number;
  reward: number;
  tier: 0 | 1 | 2;
  lv: string;
  en: string;
}

export const QUESTS: QuestDef[] = [
  { id: 'correct15', kind: 'correct', target: 15, reward: 50, tier: 0, lv: 'Atbildi pareizi 15 reizes', en: 'Answer 15 questions correctly' },
  { id: 'combo5', kind: 'combo', target: 5, reward: 40, tier: 0, lv: 'Sasniedz 5× combo', en: 'Reach a 5× combo' },
  { id: 'fast5', kind: 'fast', target: 5, reward: 50, tier: 0, lv: '5 pareizas atbildes ātrāk par 3 s', en: '5 correct answers in under 3 s' },
  { id: 'sessions2', kind: 'sessions', target: 2, reward: 60, tier: 1, lv: 'Pabeidz 2 sesijas', en: 'Complete 2 sessions' },
  { id: 'decks2', kind: 'decks', target: 2, reward: 60, tier: 1, lv: 'Mācies 2 dažādas kopas', en: 'Study 2 different decks' },
  { id: 'rp300', kind: 'rp', target: 300, reward: 80, tier: 1, lv: 'Nopelni 300 RP', en: 'Earn 300 RP' },
  { id: 'perfect', kind: 'perfect', target: 1, reward: 100, tier: 2, lv: 'Nevainojama sesija (100%)', en: 'A flawless session (100%)' },
  { id: 'combo8', kind: 'combo', target: 8, reward: 80, tier: 2, lv: 'Sasniedz 8× combo', en: 'Reach an 8× combo' },
  { id: 'rp600', kind: 'rp', target: 600, reward: 120, tier: 2, lv: 'Nopelni 600 RP', en: 'Earn 600 RP' },
];

export interface QuestState {
  id: string;
  progress: number;
  claimed: boolean;
}

const BY_ID = new Map(QUESTS.map((q) => [q.id, q]));
export const questDef = (id: string) => BY_ID.get(id)!;

/** Three quests per day — one easy, one medium, one hard — identical for the whole day. */
export function rollDailyQuests(day: string): QuestState[] {
  const rnd = seeded('quests', day);
  const kinds = new Set<QuestKind>();
  return ([0, 1, 2] as const).map((tier) => {
    const eligible = QUESTS.filter((q) => q.tier === tier && !kinds.has(q.kind));
    const pool = eligible.length ? eligible : QUESTS.filter((q) => q.tier === tier);
    const pick = pool[Math.floor(rnd() * pool.length)];
    kinds.add(pick.kind);
    return { id: pick.id, progress: 0, claimed: false };
  });
}

export const isQuestDone = (q: QuestState) => q.progress >= questDef(q.id).target;
