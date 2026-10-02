import type { Rarity, RewardItem } from '../types';

export type AchievementIcon =
  | 'footprints'
  | 'trending-up'
  | 'sparkles'
  | 'zap'
  | 'flame'
  | 'crown'
  | 'target'
  | 'brain'
  | 'calendar-check'
  | 'calendar-heart'
  | 'pen-tool'
  | 'compass'
  | 'medal'
  | 'trophy'
  | 'moon'
  | 'sunrise';

export interface AchievementDef {
  id: string;
  icon: AchievementIcon;
  lv: string;
  en: string;
  dlv: string;
  den: string;
  rarity: Rarity;
  reward: RewardItem[];
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first', icon: 'footprints', lv: 'Pirmais solis', en: 'First Step', dlv: 'Pabeidz pirmo sesiju', den: 'Complete your first session', rarity: 'common', reward: [{ kind: 'coins', amount: 50 }] },
  { id: 'promoted', icon: 'trending-up', lv: 'Uz augšu!', en: 'Moving Up!', dlv: 'Iegūsti pirmo paaugstinājumu', den: 'Earn your first promotion', rarity: 'common', reward: [{ kind: 'coins', amount: 50 }] },
  { id: 'perfect', icon: 'sparkles', lv: 'Nevainojami', en: 'Flawless', dlv: '100% precizitāte sesijā (vismaz 5 jautājumi)', den: '100% accuracy in a session (5+ questions)', rarity: 'rare', reward: [{ kind: 'cosmetic', id: 'title-flawless' }] },
  { id: 'lightning', icon: 'zap', lv: 'Zibens', en: 'Lightning', dlv: 'Pareiza atbilde ātrāk par 1,5 s', den: 'A correct answer in under 1.5 s', rarity: 'rare', reward: [{ kind: 'cosmetic', id: 'title-flash' }, { kind: 'cosmetic', id: 'frame-bolt' }] },
  { id: 'combo10', icon: 'flame', lv: 'Karstā sērija', en: 'On Fire', dlv: 'Sasniedz 10× combo', den: 'Reach a 10× combo', rarity: 'rare', reward: [{ kind: 'coins', amount: 100 }] },
  { id: 'combo15', icon: 'crown', lv: 'Combo karalis', en: 'Combo King', dlv: 'Sasniedz 15× combo', den: 'Reach a 15× combo', rarity: 'epic', reward: [{ kind: 'cosmetic', id: 'title-combo' }] },
  { id: 'answers100', icon: 'target', lv: 'Simtnieks', en: 'Centurion', dlv: 'Atbildi uz 100 jautājumiem', den: 'Answer 100 questions', rarity: 'common', reward: [{ kind: 'coins', amount: 150 }] },
  { id: 'correct250', icon: 'brain', lv: 'Zinātnieks', en: 'Scholar', dlv: '250 pareizas atbildes', den: '250 correct answers', rarity: 'epic', reward: [{ kind: 'cosmetic', id: 'title-scholar' }] },
  { id: 'streak3', icon: 'calendar-check', lv: 'Ieradums', en: 'Habit', dlv: '3 dienu sērija', den: 'A 3-day streak', rarity: 'rare', reward: [{ kind: 'cosmetic', id: 'frame-flame' }] },
  { id: 'streak7', icon: 'calendar-heart', lv: 'Nedēļas karotājs', en: 'Week Warrior', dlv: '7 dienu sērija', den: 'A 7-day streak', rarity: 'epic', reward: [{ kind: 'chest', rarity: 'epic' }] },
  { id: 'author', icon: 'pen-tool', lv: 'Kartīšu meistars', en: 'Card Crafter', dlv: 'Izveido savu kartīšu kopu', den: 'Create your own deck', rarity: 'common', reward: [{ kind: 'cosmetic', id: 'title-author' }] },
  { id: 'explorer', icon: 'compass', lv: 'Pētnieks', en: 'Explorer', dlv: 'Mācies 3 dažādas kopas', den: 'Study 3 different decks', rarity: 'common', reward: [{ kind: 'coins', amount: 100 }] },
  { id: 'gold', icon: 'medal', lv: 'Zelta līga', en: 'Golden League', dlv: 'Sasniedz Zelta līgu', den: 'Reach the Gold league', rarity: 'epic', reward: [{ kind: 'chest', rarity: 'rare' }] },
  { id: 'top10', icon: 'trophy', lv: 'Top 10', en: 'Top 10', dlv: 'Iekļūsti nedēļas tabulas top 10', den: 'Reach the weekly top 10', rarity: 'rare', reward: [{ kind: 'coins', amount: 150 }] },
  { id: 'owl', icon: 'moon', lv: 'Nakts pūce', en: 'Night Owl', dlv: 'Pabeidz sesiju pēc 22:00', den: 'Finish a session after 22:00', rarity: 'common', reward: [{ kind: 'cosmetic', id: 'title-owl' }] },
  { id: 'early', icon: 'sunrise', lv: 'Agrais putns', en: 'Early Bird', dlv: 'Pabeidz sesiju pirms 8:00', den: 'Finish a session before 8:00', rarity: 'common', reward: [{ kind: 'coins', amount: 60 }] },
];

const BY_ID = new Map(ACHIEVEMENTS.map((a) => [a.id, a]));
export const achievementDef = (id: string) => BY_ID.get(id)!;
