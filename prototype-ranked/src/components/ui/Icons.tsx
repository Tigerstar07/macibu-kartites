import { useId } from 'react';
import {
  BookOpen,
  Brain,
  Calculator,
  CalendarCheck,
  CalendarHeart,
  Code,
  Compass,
  Crown,
  Flame,
  FlaskConical,
  Footprints,
  Globe,
  Landmark,
  Languages,
  Leaf,
  Medal,
  Moon,
  Music,
  Orbit,
  Palette,
  PenTool,
  Sparkles,
  Sunrise,
  Target,
  TrendingUp,
  Trophy,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { DeckIcon } from '../../types';
import type { AchievementIcon } from '../../lib/achievements';

export const DECK_ICONS: Record<DeckIcon, LucideIcon> = {
  globe: Globe,
  flask: FlaskConical,
  languages: Languages,
  code: Code,
  landmark: Landmark,
  calculator: Calculator,
  orbit: Orbit,
  book: BookOpen,
  brain: Brain,
  music: Music,
  palette: Palette,
  leaf: Leaf,
};

export const ACH_ICONS: Record<AchievementIcon, LucideIcon> = {
  footprints: Footprints,
  'trending-up': TrendingUp,
  sparkles: Sparkles,
  zap: Zap,
  flame: Flame,
  crown: Crown,
  target: Target,
  brain: Brain,
  'calendar-check': CalendarCheck,
  'calendar-heart': CalendarHeart,
  'pen-tool': PenTool,
  compass: Compass,
  medal: Medal,
  trophy: Trophy,
  moon: Moon,
  sunrise: Sunrise,
};

/** RP — a faceted violet→cyan gem. */
export function RPIcon({ size = 18, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#d8b4fe" />
          <stop offset="0.5" stopColor="#8b5cf6" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <path d="M12 1.5 21 6.8v10.4L12 22.5 3 17.2V6.8Z" fill={`url(#${id})`} />
      <path d="M12 1.5 21 6.8 12 12 3 6.8Z" fill="#fff" opacity="0.3" />
      <path d="M12 12v10.5L3 17.2V6.8Z" fill="#000" opacity="0.12" />
      <path d="M12 6.2 16.8 9v6L12 17.8 7.2 15V9Z" fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="1.1" />
    </svg>
  );
}

export function CoinIcon({ size = 18, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#fff7cc" />
          <stop offset="0.35" stopColor="#fcd34d" />
          <stop offset="1" stopColor="#b45309" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill={`url(#${id})`} stroke="#92400e" strokeWidth="0.8" />
      <circle cx="12" cy="12" r="7.2" fill="none" stroke="#fff7cc" strokeOpacity="0.7" strokeWidth="1.1" />
      <path d="m12 7.6 1.3 2.7 2.9.3-2.2 2 .6 2.9L12 14l-2.6 1.5.6-2.9-2.2-2 2.9-.3Z" fill="#fff7cc" />
    </svg>
  );
}

/** RP boost — a lightning bolt in a cyan disc. */
export function BoostIcon({ size = 18, className }: { size?: number; className?: string }) {
  const id = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} className={className} aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#67e8f9" />
          <stop offset="1" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <circle cx="12" cy="12" r="10.5" fill={`url(#${id})`} />
      <path d="M13.2 4.5 7.5 13h4l-1 6.5 6-9h-4.2Z" fill="#fff" />
    </svg>
  );
}
