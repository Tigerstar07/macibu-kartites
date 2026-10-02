export type Lang = 'lv' | 'en';
export type QType = 'mc' | 'reverse' | 'tf';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type CategoryId = 'geo' | 'lang' | 'sci' | 'it' | 'hist' | 'math' | 'other';
export type DeckIcon =
  | 'globe'
  | 'flask'
  | 'languages'
  | 'code'
  | 'landmark'
  | 'calculator'
  | 'orbit'
  | 'book'
  | 'brain'
  | 'music'
  | 'palette'
  | 'leaf';

export interface Card {
  id: string;
  question: string;
  answer: string;
  /** Hand-written wrong options. When missing, other cards' answers are used. */
  wrong?: string[];
  explanation?: string;
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  language: Lang;
  tags: string[];
  icon: DeckIcon;
  hue: number;
  /** Allow "reverse" questions (answer shown, pick the question). */
  reversible: boolean;
  /** Label shown above short prompts, in the deck's own language. */
  ask?: string;
  reverseAsk?: string;
  cards: Card[];
  author: string;
  builtin?: boolean;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface CardProgress {
  ef: number;
  interval: number;
  reps: number;
  due: number;
  lapses: number;
  seen: number;
  correct: number;
  last: number;
}

export interface Question {
  id: string;
  cardKey: string;
  deckId: string;
  type: QType;
  prompt: string;
  ask?: string;
  /** True/false: the proposed answer the player judges. */
  statement?: string;
  options: string[];
  correctIndex: number;
  answer: string;
  explanation?: string;
  relearn?: boolean;
}

export type RewardItem =
  | { kind: 'coins'; amount: number }
  | { kind: 'chest'; rarity: Rarity }
  | { kind: 'cosmetic'; id: string }
  | { kind: 'boost'; amount: number };

export interface AnswerLog {
  cardKey: string;
  correct: boolean;
  ms: number;
  rp: number;
  type: QType;
  relearn: boolean;
  timeout: boolean;
  combo: number;
}
