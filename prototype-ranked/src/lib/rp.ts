import type { QType } from '../types';

/** Time allowed per question type. */
export const TIME_LIMIT: Record<QType, number> = { mc: 20_000, reverse: 20_000, tf: 12_000 };

export const COMBO_STEPS = [
  { at: 3, mult: 1.2 },
  { at: 5, mult: 1.5 },
  { at: 8, mult: 2 },
  { at: 12, mult: 2.5 },
];

export function comboMultiplier(combo: number): number {
  let m = 1;
  for (const s of COMBO_STEPS) if (combo >= s.at) m = s.mult;
  return m;
}

export type SpeedTier = 'lightning' | 'fast' | 'ok' | null;

export function speedTier(ms: number): SpeedTier {
  if (ms < 3000) return 'lightning';
  if (ms < 6000) return 'fast';
  if (ms < 10000) return 'ok';
  return null;
}

export const SPEED_BONUS: Record<Exclude<SpeedTier, null>, number> = { lightning: 5, fast: 3, ok: 1 };

export interface AnswerRPInput {
  correct: boolean;
  ms: number;
  type: QType;
  /** Combo count including this answer. */
  combo: number;
  relearn: boolean;
  boosted: boolean;
}

export function answerRP({ correct, ms, type, combo, relearn, boosted }: AnswerRPInput): number {
  if (!correct) return 0;
  const base = type === 'tf' ? 6 : 10;
  const tier = speedTier(ms);
  const speed = tier ? SPEED_BONUS[tier] : 0;
  let rp = (base + speed) * comboMultiplier(combo);
  if (relearn) rp *= 0.5;
  if (boosted) rp *= 1.5;
  return Math.round(rp);
}

export interface RPBreakdown {
  answers: number;
  completion: number;
  accuracy: number;
  accuracyPct: number;
  daily: number;
  streak: number;
  streakPct: number;
  total: number;
}

export function accuracyBonusPct(acc: number): number {
  if (acc >= 1) return 0.5;
  if (acc >= 0.9) return 0.3;
  if (acc >= 0.75) return 0.15;
  return 0;
}

export function sessionRP(opts: {
  answerRP: number;
  accuracy: number;
  completed: boolean;
  answered: number;
  streakDays: number;
  firstToday: boolean;
}): RPBreakdown {
  const eligible = opts.answered >= 3;
  const completion = opts.completed && eligible ? 20 : 0;
  const accuracyPct = opts.completed && eligible ? accuracyBonusPct(opts.accuracy) : 0;
  const accuracy = Math.round(opts.answerRP * accuracyPct);
  const daily = opts.firstToday && eligible ? 25 : 0;
  const subtotal = opts.answerRP + completion + accuracy + daily;
  const streakPct = eligible ? Math.min(opts.streakDays * 0.05, 0.5) : 0;
  const streak = Math.round(subtotal * streakPct);
  return { answers: opts.answerRP, completion, accuracy, accuracyPct, daily, streak, streakPct, total: subtotal + streak };
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export function gradeFor(accuracy: number, avgMs: number): Grade {
  if (accuracy >= 0.95 && avgMs < 6000) return 'S';
  if (accuracy >= 0.9) return 'A';
  if (accuracy >= 0.75) return 'B';
  if (accuracy >= 0.5) return 'C';
  return 'D';
}
