import { beforeEach, expect, it } from 'vitest';
import { BUILTIN_DECKS } from '../data/decks';
import { rankIndexFromRP, rankIsInRange } from '../lib/rank';
import { answerRP } from '../lib/rp';
import type { AnswerLog } from '../types';
import { selectGameAccount } from './account';
import { useGame } from './useGame';

beforeEach(async () => {
  localStorage.clear();
  await selectGameAccount({ id: 42, created_at: '2026-10-28T12:00:00Z', display_name: 'Tests', role: 'user' });
});

function play(total: number, weekly: number, correct: number, wrong: number, recover = false) {
  useGame.setState({ stats: { ...useGame.getState().stats, totalRP: total, weeklyRP: weekly } });
  const deck = BUILTIN_DECKS.find((item) => rankIsInRange(rankIndexFromRP(total), item.rankRange))!;
  const answers: AnswerLog[] = [];
  const penaltyApplied = { total: 0, weekly: 0 };
  for (let index = 0; index < correct + wrong; index++) {
    const isCorrect = index < correct;
    if (!isCorrect) {
      const applied = useGame.getState().deductRankedRP(deck.id, 20);
      penaltyApplied.total += applied.total;
      penaltyApplied.weekly += applied.weekly;
    }
    answers.push({ cardKey: `card-${index}`, correct: isCorrect, ms: 2000, rp: answerRP({ correct: isCorrect, relearn: false }), type: 'mc', relearn: false, timeout: false, combo: 0 });
  }
  if (recover) {
    for (const answer of answers.filter((item) => !item.correct)) {
      answers.push({ ...answer, correct: true, relearn: true, rp: answerRP({ correct: true, relearn: true, priorPenalty: -answer.rp }) });
    }
  }
  useGame.getState().finishSession({ deckId: deck.id, ranked: true, penaltyApplied, answers, completed: true, bestCombo: correct, boosted: false, durationMs: 10000 });
  return useGame.getState().stats;
}

it('ieraksta pilnu nepareizās atbildes sodu', () => {
  expect(answerRP({ correct: false, relearn: false })).toBe(-20);
});

it('jaunam kontam piecas pareizas un piecas nepareizas atbildes dod nulli RP', () => {
  expect(play(0, 0, 5, 5).totalRP).toBe(0);
});

it('neskaita sodu divreiz un atsevišķi ievēro nedēļas bilanci', () => {
  const stats = play(200, 80, 5, 5);
  expect(stats.totalRP).toBe(200);
  expect(stats.weeklyRP).toBe(80);
});

it('atkārtota pareiza atbilde atgūst desmit punktus arī jaunam kontam', () => {
  expect(play(0, 0, 5, 5, true).totalRP).toBe(50);
});

it('kopējā un nedēļas bilance nekļūst negatīva', () => {
  const stats = play(50, 30, 1, 5);
  expect(stats.totalRP).toBe(0);
  expect(stats.weeklyRP).toBe(0);
});
