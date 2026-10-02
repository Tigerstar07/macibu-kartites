import type { CSSProperties } from 'react';
import { Tag } from 'lucide-react';
import type { RewardItem } from '../../types';
import { RARITY_META, cosmetic, type Cosmetic } from '../../lib/cosmetics';
import { fmtNum } from '../../lib/format';
import { useLang, useT } from '../../lib/i18n';
import { cn } from '../../lib/cn';
import { ChestIcon } from '../rewards/ChestIcon';
import { Avatar } from './Avatar';
import { BoostIcon, CoinIcon } from './Icons';

/** Visual swatch for a theme, frame or title. */
export function CosmeticPreview({ item, size = 44 }: { item: Cosmetic; size?: number }) {
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
  return (
    <div
      className="tint grid shrink-0 place-items-center rounded-lg shadow-hard-sm"
      style={{ width: size, height: size, '--c': RARITY_META[item.rarity].color } as CSSProperties}
    >
      <Tag style={{ width: size * 0.48, height: size * 0.48 }} strokeWidth={2.4} />
    </div>
  );
}

export function useRewardLabel() {
  const t = useT();
  const lang = useLang();
  return (item: RewardItem): { label: string; sub: string; color: string } => {
    switch (item.kind) {
      case 'coins':
        return { label: `+${fmtNum(item.amount, lang)}`, sub: t('monētas', 'coins'), color: '#fbbf24' };
      case 'boost':
        return { label: `×${item.amount}`, sub: t('RP pastiprinājums', 'RP boost'), color: '#22d3ee' };
      case 'chest':
        return { label: t('Lāde', 'Chest'), sub: RARITY_META[item.rarity][lang], color: RARITY_META[item.rarity].color };
      case 'cosmetic': {
        const c = cosmetic(item.id);
        if (!c) return { label: item.id, sub: '', color: '#fff' };
        const kind = c.kind === 'theme' ? t('Kartīšu tēma', 'Card theme') : c.kind === 'frame' ? t('Avatara rāmis', 'Avatar frame') : t('Tituls', 'Title');
        return { label: c[lang], sub: kind, color: RARITY_META[c.rarity].color };
      }
    }
  };
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
export function RewardCard({ item, className }: { item: RewardItem; className?: string }) {
  const label = useRewardLabel()(item);
  return (
    <div className={cn('relative flex w-36 flex-col overflow-hidden rounded-2xl border-2 border-ink bg-card text-center shadow-hard', className)}>
      <div className="halftone relative grid h-24 place-items-center border-b-2 border-ink" style={{ backgroundColor: label.color }}>
        <div className="sunburst absolute inset-0 opacity-60 [--ray:rgba(255,255,255,0.45)]" />
        <div className="relative drop-shadow-[2px_2px_0_var(--color-ink)]">
          <RewardIcon item={item} size={50} />
        </div>
      </div>
      <div className="px-3 pb-4 pt-3">
        <div className="font-display text-[15px] font-extrabold leading-tight tracking-[-0.02em]">{label.label}</div>
        <div className="mt-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-muted">{label.sub}</div>
      </div>
    </div>
  );
}
