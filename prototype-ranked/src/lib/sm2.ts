import type { CardProgress, QType } from '../types';
import { DAY, MINUTE } from './time';

export const newProgress = (): CardProgress => ({
  ef: 2.5,
  interval: 0,
  reps: 0,
  due: 0,
  lapses: 0,
  seen: 0,
  correct: 0,
  last: 0,
});

/**
 * The player never grades themselves: SM-2 quality (0–5) is derived from
 * whether the chosen option was right and how quickly it was picked.
 */
export function gradeAnswer(correct: boolean, ms: number, limitMs: number, type: QType, timeout: boolean): number {
  if (!correct) return timeout ? 0 : 1;
  const f = ms / limitMs;
  const q = f <= 0.3 ? 5 : f <= 0.65 ? 4 : 3;
  // A true/false guess is a coin flip, so it is weaker evidence of recall.
  return type === 'tf' ? Math.min(q, 4) : q;
}

/** Classic SM-2 with a short 10-minute learning step for failed cards. */
export function sm2(p: CardProgress, q: number, now = Date.now()): CardProgress {
  let { ef, interval, reps, lapses } = p;
  let due: number;
  if (q < 3) {
    reps = 0;
    interval = 1;
    lapses += 1;
    due = now + 10 * MINUTE;
  } else {
    reps += 1;
    interval = reps === 1 ? 1 : reps === 2 ? 6 : Math.round(interval * ef);
    due = now + interval * DAY;
  }
  ef = Math.max(1.3, ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));
  return {
    ef: Math.round(ef * 1000) / 1000,
    interval,
    reps,
    lapses,
    due,
    seen: p.seen + 1,
    correct: p.correct + (q >= 3 ? 1 : 0),
    last: now,
  };
}

export type Mastery = 'new' | 'learning' | 'review' | 'mastered';

export function mastery(p: CardProgress | undefined): Mastery {
  if (!p || p.seen === 0) return 'new';
  if (p.reps < 2) return 'learning';
  if (p.interval < 21) return 'review';
  return 'mastered';
}

export const MASTERY_WEIGHT: Record<Mastery, number> = { new: 0, learning: 0.25, review: 0.6, mastered: 1 };
