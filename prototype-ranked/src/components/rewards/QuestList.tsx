import type { CSSProperties } from 'react';
import { CircleCheck, Flame, Layers, Repeat, Sparkles, Target, Zap } from 'lucide-react';
import { useGame } from '../../store/useGame';
import { questDef, type QuestKind } from '../../lib/quests';
import { useLang, useT } from '../../lib/i18n';
import { burst, centerOf, flyCoins, visibleEl } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { cn } from '../../lib/cn';
import { ProgressBar } from '../ui/Meters';
import { Button } from '../ui/Button';
import { CoinIcon, RPIcon } from '../ui/Icons';
import { ChestIcon } from './ChestIcon';

const KIND_ICON: Record<QuestKind, React.ReactNode> = {
  correct: <Target className="size-5" />,
  combo: <Flame className="size-5" />,
  fast: <Zap className="size-5" />,
  sessions: <Repeat className="size-5" />,
  decks: <Layers className="size-5" />,
  rp: <RPIcon size={20} />,
  perfect: <Sparkles className="size-5" />,
};

const KIND_COLOR: Record<QuestKind, string> = {
  correct: '#34d399',
  combo: '#fb923c',
  fast: '#67e8f9',
  sessions: '#a78bfa',
  decks: '#f472b6',
  rp: '#c4b5fd',
  perfect: '#fde68a',
};

export function QuestList() {
  const t = useT();
  const lang = useLang();
  const quests = useGame((s) => s.quests);
  const claim = useGame((s) => s.claimQuest);
  const allClaimed = quests.items.every((q) => q.claimed);

  const onClaim = (id: string, el: HTMLElement) => {
    const coins = claim(id);
    if (!coins) return;
    const c = centerOf(el);
    burst(c.x, c.y, { colors: ['#fbbf24', '#fde68a', '#ffffff'], count: 14, spread: 90 });
    flyCoins(c, visibleEl('[data-coin-target]'), 9, (i) => {
      if (i % 2 === 0) sfx.coin();
    });
  };

  return (
    <div className="space-y-2.5">
      {quests.items.map((q) => {
        const def = questDef(q.id);
        const done = q.progress >= def.target;
        const color = KIND_COLOR[def.kind];
        return (
          <div
            key={q.id}
            className={cn(
              'relative flex items-center gap-4 rounded-xl border-2 p-3 pr-3.5 transition-colors duration-200',
              q.claimed ? 'border-ink/25 bg-paper-2' : done ? 'border-ink bg-good-soft shadow-hard-sm' : 'border-ink bg-card',
            )}
          >
            <div
              className={cn('tint grid size-11 shrink-0 place-items-center rounded-lg [&_svg]:stroke-[2.4]', q.claimed && 'opacity-45 grayscale')}
              style={{ '--c': color } as CSSProperties}
            >
              {KIND_ICON[def.kind]}
            </div>
            <div className={cn('min-w-0 flex-1', q.claimed && 'opacity-55')}>
              <div className={cn('font-bold leading-snug', q.claimed && 'line-through decoration-ink/40 decoration-2')}>{def[lang]}</div>
              <div className="mt-2 flex items-center gap-3">
                <ProgressBar value={q.progress / def.target} height={7} className="flex-1" fill={done ? 'var(--color-good)' : color} />
                <span className="w-14 text-right font-mono text-xs font-bold tabular text-muted">
                  {q.progress}/{def.target}
                </span>
              </div>
            </div>
            {q.claimed ? (
              <CircleCheck className="size-8 shrink-0 fill-good text-ink" strokeWidth={2.2} aria-label={t('Saņemts', 'Claimed')} />
            ) : done ? (
              <Button variant="gold" size="sm" shine onClick={(e) => onClaim(q.id, e.currentTarget)} icon={<CoinIcon size={16} />} silent>
                +{def.reward}
              </Button>
            ) : (
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink bg-gold-soft px-2.5 py-0.5 font-mono text-sm font-bold text-ink">
                <CoinIcon size={15} />
                {def.reward}
              </div>
            )}
          </div>
        );
      })}
      <div
        className={cn(
          'flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-sm font-bold',
          quests.bonusClaimed ? 'border-ink bg-good-soft text-ink' : 'border-dashed border-ink/40 bg-paper text-muted',
        )}
      >
        <ChestIcon rarity="rare" size={30} glow={!quests.bonusClaimed} />
        <span className="flex-1">
          {quests.bonusClaimed
            ? t('Bonusa lāde saņemta — atver to sākumlapā!', 'Bonus chest earned — open it on the home screen!')
            : allClaimed
              ? t('Bonusa lāde gaida!', 'Bonus chest waiting!')
              : t('Saņem visas 3 balvas → Reta lāde', 'Claim all 3 rewards → Rare chest')}
        </span>
      </div>
    </div>
  );
}
