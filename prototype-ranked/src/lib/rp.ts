import type { QType } from '../types';

/** Time allowed per question type. */
export const TIME_LIMIT: Record<QType, number> = { mc: 20_000, reverse: 20_000, tf: 12_000 };

export const WRONG_ANSWER_RP_PENALTY = 20;
export const ABANDON_RP_PENALTY = 20;

export interface AnswerRPInput {
  correct: boolean;
  relearn: boolean;
  priorPenalty?: number;
}

export function answerRP({ correct, relearn, priorPenalty = WRONG_ANSWER_RP_PENALTY }: AnswerRPInput): number {
  if (!correct) return 0;
  return relearn ? Math.max(0, Math.min(10, priorPenalty - 10)) : 20;
}

export interface RPBreakdown {
  answers: number;
  completion: number;
  accuracy: number;
  accuracyPct: number;
  penalty: number;
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
  penaltyRP: number;
  accuracy: number;
  completed: boolean;
  answered: number;
  streakDays: number;
  firstToday: boolean;
}): RPBreakdown {
  return {
    answers: opts.answerRP,
    completion: 0,
    accuracy: 0,
    accuracyPct: 0,
    penalty: opts.penaltyRP,
    daily: 0,
    streak: 0,
    streakPct: 0,
    total: opts.answerRP - opts.penaltyRP,
  };
}

export type Grade = 'S' | 'A' | 'B' | 'C' | 'D';

export function gradeFor(accuracy: number, avgMs: number): Grade {
  if (accuracy >= 0.95 && avgMs < 6000) return 'S';
  if (accuracy >= 0.9) return 'A';
  if (accuracy >= 0.75) return 'B';
  if (accuracy >= 0.5) return 'C';
  return 'D';
}
