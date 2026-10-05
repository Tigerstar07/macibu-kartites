import type { CSSProperties } from 'react';
import { Tag } from 'lucide-react';
import type { Rarity, RewardItem } from '../../types';
import { RARITY_META, cosmetic, type Cosmetic } from '../../lib/cosmetics';
import { fmtNum } from '../../lib/format';
import { useLang, useT } from '../../lib/i18n';
import { cn } from '../../lib/cn';
import { useGame } from '../../store/useGame';
import { ChestIcon } from '../rewards/ChestIcon';
import { Avatar } from './Avatar';
import { BoostIcon, CoinIcon } from './Icons';
import { NameTag } from './NameTag';

/** Visual swatch for a theme, frame, name tag or title. */
export function CosmeticPreview({ item, size = 44 }: { item: Cosmetic; size?: number }) {
  const name = useGame((s) => s.profile?.name);
  if (item.kind === 'theme') {
    return (
      <div
        className={cn('relative shrink-0 overflow-hidden rounded-lg border-2 border-ink shadow-hard-sm', item.animated && 'theme-animated')}
        style={{ width: size * 0.78, height: size, background: item.bg }}
      >
        <div className="absolute inset-x-1.5 top-2 h-1 rounded-full" style={{ background: item.accent }} />
        <div className="absolute inset-x-1.5 top-4 h-1 w-1/2 rounded-full bg-white/50" />
        <div className="absolute inset-x-1.5 bottom-1.5 grid grid-cols-2 gap-0.5">
          <span className="h-1.5 rounded-[3px] bg-white/30" />
          <span className="h-1.5 rounded-[3px] bg-white/30" />
        </div>
      </div>
    );
  }
  if (item.kind === 'frame') return <Avatar avatar="🙂" hue={250} frame={item.id} size={size} />;
  if (item.kind === 'nametag') {
    // Always on a dark chip so every effect (neon, glitch, chrome…) reads the same on both themes.
    const wide = size >= 40;
    return (
      <div
        className="grid shrink-0 place-items-center overflow-hidden rounded-lg border-2 border-ink bg-ink-950 px-2 shadow-hard-sm"
        style={{ height: size, minWidth: size * (wide ? 2 : 1.3), maxWidth: size * 2.6, fontSize: size * (wide ? 0.3 : 0.38) }}
      >
        <NameTag name={wide && name ? name : 'Aa'} tag={item.id} className="truncate font-display font-extrabold text-white" />
      </div>
    );
  }
  return (
    <div
      className="tint grid shrink-0 place-items-center rounded-lg shadow-hard-sm"
      style={{ width: size, height: size, '--c': RARITY_META[item.rarity].color } as CSSProperties}
    >
      <Tag style={{ width: size * 0.48, height: size * 0.48 }} strokeWidth={2.4} />
    </div>
  );
}

const KIND_LABEL: Record<Cosmetic['kind'], [string, string]> = {
  theme: ['Kartīšu tēma', 'Card theme'],
  frame: ['Avatara rāmis', 'Avatar frame'],
  nametag: ['Vārda stils', 'Name tag'],
  title: ['Tituls', 'Title'],
};

export function useRewardLabel() {
  const t = useT();
  const lang = useLang();
  return (item: RewardItem): { label: string; sub: string; color: string } => {
    switch (item.kind) {
      case 'coins':
        return {
          label: `+${fmtNum(item.amount, lang)}`,
          sub: item.dupeOf ? t('dublikāts → monētas', 'duplicate → coins') : t('monētas', 'coins'),
          color: '#fbbf24',
        };
      case 'boost':
        return { label: `×${item.amount}`, sub: t('RP pastiprinājums', 'RP boost'), color: '#22d3ee' };
      case 'chest':
        return { label: t('Lāde', 'Chest'), sub: RARITY_META[item.rarity][lang], color: RARITY_META[item.rarity].color };
      case 'cosmetic': {
        const c = cosmetic(item.id);
        if (!c) return { label: item.id, sub: '', color: '#fff' };
        return { label: c[lang], sub: t(...KIND_LABEL[c.kind]), color: RARITY_META[c.rarity].color };
      }
    }
  };
}

/** How rare a reward feels: drives reveal drama (sound, flash, confetti). 0 = coins/boost … 3 = legendary. */
export function rewardTier(item: RewardItem): 0 | 1 | 2 | 3 {
  const rarity: Rarity | null = item.kind === 'cosmetic' ? (cosmetic(item.id)?.rarity ?? 'common') : item.kind === 'chest' ? item.rarity : null;
  if (!rarity) return 0;
  return rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : rarity === 'rare' ? 1 : 0;
}

export function RewardIcon({ item, size = 36 }: { item: RewardItem; size?: number }) {
  if (item.kind === 'coins') return <CoinIcon size={size} />;
  if (item.kind === 'boost') return <BoostIcon size={size} />;
  if (item.kind === 'chest') return <ChestIcon rarity={item.rarity} size={size * 1.15} glow={false} />;
  const c = cosmetic(item.id);
  return c ? <CosmeticPreview item={c} size={size} /> : null;
}

export function RewardChip({ item, className }: { item: RewardItem; className?: string }) {
  const label = useRewardLabel()(item);
  return (
    <div className={cn('tint-surface flex items-center gap-2.5 rounded-xl px-3 py-2', className)} style={{ '--c': label.color } as CSSProperties}>
      <RewardIcon item={item} size={26} />
      <div className="min-w-0 leading-tight">
        <div className="truncate text-sm font-extrabold text-ink">{label.label}</div>
        <div className="truncate text-xs font-medium text-muted">{label.sub}</div>
      </div>
    </div>
  );
}

/** Tall reward card used in ceremonies (flips in): a collectible trading card. */
export function RewardCard({ item, className, isNew }: { item: RewardItem; className?: string; isNew?: boolean }) {
  const label = useRewardLabel()(item);
  const lang = useLang();
  const t = useT();
  const c = item.kind === 'cosmetic' ? cosmetic(item.id) : undefined;
  const rarity: Rarity | null = c ? c.rarity : item.kind === 'chest' ? item.rarity : null;
  // Cosmetics are the payoff, so they are shown big and alive rather than as a tiny icon.
  const iconSize = c ? (c.kind === 'frame' ? 68 : c.kind === 'nametag' ? 46 : 54) : 50;
  const tier = rewardTier(item);
  return (
    <div
      className={cn('relative flex w-40 flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card text-center shadow-hard', className)}
      style={tier >= 2 && rarity ? { boxShadow: `4px 4px 0 0 var(--color-ink), 0 0 ${tier === 3 ? 38 : 24}px ${RARITY_META[rarity].glow}` } : undefined}
    >
      <div className="halftone relative grid h-28 place-items-center border-b-2 border-ink" style={{ backgroundColor: label.color }}>
        <div className="sunburst absolute inset-0 opacity-60 [--ray:rgba(255,255,255,0.45)]" />
        <div className="relative drop-shadow-[2px_2px_0_var(--color-ink)]">
          <RewardIcon item={item} size={iconSize} />
        </div>
        {isNew && (
          <span className="absolute left-2 top-2 -rotate-6 rounded-md border-2 border-ink bg-acid px-1.5 py-0.5 font-mono text-[10px] font-extrabold uppercase tracking-wider text-ink shadow-hard-sm">
            {t('Jauns', 'New')}
          </span>
        )}
      </div>
      <div className="px-3 pb-3.5 pt-3">
        <div className="font-display text-[15px] font-extrabold leading-tight tracking-[-0.02em]">{label.label}</div>
        <div className="mt-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-muted">{label.sub}</div>
        {rarity && (
          <div className="mt-1.5 text-[11px] font-extrabold uppercase tracking-[0.14em]" style={{ color: `color-mix(in oklch, ${RARITY_META[rarity].color} 72%, var(--color-fg))` }}>
            {RARITY_META[rarity][lang]}
          </div>
        )}
      </div>
    </div>
  );
}
