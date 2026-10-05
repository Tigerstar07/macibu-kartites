import type { Rarity } from '../../types';
import { PITY_MAX, RARITY_META, cosmeticChance, rarityOdds } from '../../lib/cosmetics';
import { useLang, useT } from '../../lib/i18n';
import { cn } from '../../lib/cn';

/** Published drop odds for a chest tier, plus the player's pity progress when known. */
export function ChestOdds({ rarity, pity, className }: { rarity: Rarity; pity?: number; className?: string }) {
  const t = useT();
  const lang = useLang();
  const chance = Math.round(cosmeticChance(rarity, pity ?? 0) * 100);
  const left = pity === undefined ? null : Math.max(1, PITY_MAX - pity + 1);
  return (
    <div className={cn('text-left text-[13px] leading-snug', className)}>
      <div className="font-bold">
        {t('Kosmētikas iespēja', 'Cosmetic chance')}: <span className="tabular">{chance}%</span>
      </div>
      {left !== null && (
        <div className="mt-0.5 text-muted">
          {left === 1
            ? t('Kosmētika šajā lādē ir garantēta!', 'A cosmetic is guaranteed in this chest!')
            : t(`Kosmētika garantēta ne vēlāk kā ${left}. lādē`, `Cosmetic guaranteed within ${left} chests`)}
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
        {rarityOdds(rarity).map(({ rarity: r, p }) => (
          <span key={r} className="inline-flex items-center gap-1.5 text-muted">
            <span className="size-2.5 rounded-[3px] border border-ink" style={{ background: RARITY_META[r].color }} />
            {RARITY_META[r][lang]} <span className="font-bold tabular text-fg">{Math.round(p * 100)}%</span>
          </span>
        ))}
      </div>
    </div>
  );
}
