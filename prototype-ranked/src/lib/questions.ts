import type { Card, CardProgress, Deck, QType, Question } from '../types';
import { shuffle } from './random';

export const cardKey = (deckId: string, cardId: string) => `${deckId}::${cardId}`;

const norm = (s: string) => s.trim().toLowerCase();
const isNumeric = (s: string) => /^[-+]?\d[\d\s.,]*$/.test(s.trim());

/** Pick plausible wrong options: hand-written ones first, then look-alike answers from the deck. */
function distractors(card: Card, deck: Deck, rnd: () => number, count: number, field: 'answer' | 'question'): string[] {
  const target = field === 'answer' ? card.answer : card.question;
  const out: string[] = [];
  const seen = new Set([norm(target)]);
  const add = (s: string) => {
    const n = norm(s);
    if (!n || seen.has(n)) return;
    seen.add(n);
    out.push(s.trim());
  };

  if (field === 'answer' && card.wrong?.length) {
    for (const w of shuffle(card.wrong, rnd)) {
      if (out.length >= count) break;
      add(w);
    }
  }

  if (out.length < count) {
    const tNum = isNumeric(target);
    const pool = deck.cards
      .filter((c) => c.id !== card.id)
      .map((c) => (field === 'answer' ? c.answer : c.question))
      .map((s) => ({
        s,
        score:
          (isNumeric(s) === tNum ? 0 : 4) +
          Math.abs(s.length - target.length) / Math.max(target.length, 4) +
          rnd() * 0.9,
      }))
      .sort((a, b) => a.score - b.score);
    for (const { s } of pool) {
      if (out.length >= count) break;
      add(s);
    }
  }

  if (out.length < count && isNumeric(target)) {
    const n = Number(target.replace(/\s/g, '').replace(',', '.'));
    const step = Math.max(1, Math.round(Math.abs(n) * 0.1));
    for (let k = 1; out.length < count && k < 12; k++) add(String(n + (k % 2 ? k : -k) * step));
  }
  return out;
}

export function isPlayable(deck: Deck): boolean {
  if (deck.cards.length === 0) return false;
  return deck.cards.length >= 4 || deck.cards.every((c) => (c.wrong?.filter(Boolean).length ?? 0) >= 2);
}

function pickType(deck: Deck, card: Card, rnd: () => number): QType {
  const r = rnd();
  if (deck.reversible && card.question.length <= 60 && r < 0.18) return 'reverse';
  if (r < 0.4) return 'tf';
  return 'mc';
}

let qid = 0;

export function buildQuestion(deck: Deck, card: Card, type: QType, rnd: () => number = Math.random, relearn = false): Question {
  const base = {
    id: `q${++qid}`,
    cardKey: cardKey(deck.id, card.id),
    deckId: deck.id,
    answer: card.answer,
    explanation: card.explanation,
    relearn,
  };

  if (type === 'tf') {
    const [fake] = distractors(card, deck, rnd, 1, 'answer');
    const truthful = !fake || rnd() < 0.5;
    return {
      ...base,
      type,
      prompt: card.question,
      ask: deck.ask,
      statement: truthful ? card.answer : fake,
      options: ['true', 'false'],
      correctIndex: truthful ? 0 : 1,
    };
  }

  if (type === 'reverse') {
    const opts = shuffle([card.question, ...distractors(card, deck, rnd, 3, 'question')], rnd);
    return {
      ...base,
      type,
      prompt: card.answer,
      ask: deck.reverseAsk,
      answer: card.question,
      options: opts,
      correctIndex: opts.indexOf(card.question),
    };
  }

  const opts = shuffle([card.answer, ...distractors(card, deck, rnd, 3, 'answer')], rnd);
  return {
    ...base,
    type: 'mc',
    prompt: card.question,
    ask: deck.ask,
    options: opts,
    correctIndex: opts.indexOf(card.answer),
  };
}

/** Due cards first (most overdue first), then new cards, then practice-ahead. */
export function buildSession(
  deck: Deck,
  progress: Record<string, CardProgress>,
  size: number,
  now = Date.now(),
  rnd: () => number = Math.random,
): Question[] {
  const rows = deck.cards.map((c) => ({ c, p: progress[cardKey(deck.id, c.id)] }));
  const due = rows.filter((x) => x.p && x.p.due <= now).sort((a, b) => a.p!.due - b.p!.due);
  const fresh = shuffle(
    rows.filter((x) => !x.p),
    rnd,
  );
  const ahead = rows.filter((x) => x.p && x.p.due > now).sort((a, b) => a.p!.due - b.p!.due);
  const picked = shuffle([...due, ...fresh, ...ahead].slice(0, Math.min(size, deck.cards.length)), rnd);
  return picked.map((x, i) => buildQuestion(deck, x.c, i === 0 ? 'mc' : pickType(deck, x.c, rnd), rnd));
}

export function deckCounts(deck: Deck, progress: Record<string, CardProgress>, now = Date.now()) {
  let due = 0;
  let fresh = 0;
  let mastered = 0;
  let score = 0;
  for (const c of deck.cards) {
    const p = progress[cardKey(deck.id, c.id)];
    if (!p) {
      fresh++;
      continue;
    }
    if (p.due <= now) due++;
    if (p.reps >= 2 && p.interval >= 21) {
      mastered++;
      score += 1;
    } else score += p.reps >= 2 ? 0.6 : 0.25;
  }
  return { due, fresh, mastered, total: deck.cards.length, mastery: deck.cards.length ? score / deck.cards.length : 0 };
}
