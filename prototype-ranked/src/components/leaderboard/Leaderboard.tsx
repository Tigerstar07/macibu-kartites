import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { createLayout } from 'animejs';
import { Crown, Flame } from 'lucide-react';
import type { Board, Player } from '../../lib/bots';
import { rankIndexFromRP } from '../../lib/rank';
import { useNumFmt, useT } from '../../lib/i18n';
import { cn } from '../../lib/cn';
import { Avatar } from '../ui/Avatar';
import { NameTag, TitleText } from '../ui/NameTag';
import { Counter } from '../ui/Meters';
import { RankEmblem } from '../rank/RankEmblem';

const PODIUM: Record<number, { h: number; c1: string; c2: string }> = {
  1: { h: 136, c1: '#fde68a', c2: '#d97706' },
  2: { h: 104, c1: '#f1f5f9', c2: '#64748b' },
  3: { h: 80, c1: '#fdba74', c2: '#9a3412' },
};

export function Podium({ players, board }: { players: Player[]; board: Board }) {
  const t = useT();
  const fmt = useNumFmt();
  const top = players.slice(0, 3);
  const order = [top[1], top[0], top[2]].filter(Boolean);

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6">
      {order.map((p) => {
        const place = players.indexOf(p) + 1;
        const s = PODIUM[place];
        return (
          <motion.div key={p.id} layout transition={{ type: 'spring', stiffness: 300, damping: 28 }} className="flex w-28 flex-col items-center sm:w-40">
            <div className="relative">
              {place === 1 && <Crown className="absolute -top-8 left-1/2 size-8 -translate-x-1/2 animate-bob fill-amber-300/60 text-amber-300" />}
              <Avatar avatar={p.avatar} hue={p.hue} frame={p.frame} size={place === 1 ? 86 : 66} />
            </div>
            <div className="mt-2 max-w-full truncate text-center font-bold">
              <NameTag name={p.name} tag={p.nametag} />
              {p.isYou && <span className="font-extrabold text-brand dark:text-violet-300"> · {t('tu', 'you')}</span>}
            </div>
            <div className="font-display text-sm font-bold tabular" style={{ color: s.c1 }}>
              {fmt(board === 'weekly' ? p.weeklyRP : p.totalRP)} RP
            </div>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: s.h }}
              transition={{ delay: 0.15 * (3 - place), type: 'spring', stiffness: 150, damping: 17 }}
              className="relative mt-3 w-full overflow-hidden rounded-t-2xl"
              style={{ background: `linear-gradient(180deg, ${s.c1}, ${s.c2})`, boxShadow: `0 0 40px -12px ${s.c1}` }}
            >
              <div className="absolute inset-x-0 top-0 h-1/2 bg-white/25" />
              <div className="absolute inset-0 grid place-items-center font-display text-5xl font-black text-black/25">{place}</div>
            </motion.div>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Leaderboard rows. Reordering is animated with anime.js `createLayout` (FLIP):
 * record the old positions, let React commit the new order, then animate.
 */
export function LeaderboardList({ players, board, flashYou }: { players: Player[]; board: Board; flashYou?: boolean }) {
  const t = useT();
  const fmt = useNumFmt();
  const listRef = useRef<HTMLOListElement>(null);
  const layout = useRef<ReturnType<typeof createLayout> | null>(null);
  const pending = useRef(false);
  const [shown, setShown] = useState(players);

  useEffect(() => {
    if (!listRef.current) return;
    layout.current = createLayout(listRef.current, { children: 'li', duration: 800, ease: 'inOut(3)' });
    return () => {
      layout.current?.revert();
      layout.current = null;
    };
  }, []);

  useEffect(() => {
    if (players === shown) return;
    layout.current?.record();
    pending.current = true;
    setShown(players);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]);

  useLayoutEffect(() => {
    if (!pending.current) return;
    pending.current = false;
    layout.current?.animate();
  }, [shown]);

  return (
    <ol ref={listRef} className="space-y-2">
      {shown.map((p, i) => {
        const place = i + 1;
        return (
          <li
            key={p.id}
            data-layout-id={p.id}
            className={cn(
              'flex items-center gap-3 rounded-2xl border-2 px-3 py-2.5 transition-[background-color,box-shadow] duration-700 sm:gap-4 sm:px-4',
              p.isYou
                ? cn(
                    'border-brand bg-brand-soft/25 shadow-hard-sm',
                    flashYou && 'shadow-[0_0_48px_-6px_rgba(167,139,250,1)]',
                  )
                : place <= 3
                  ? 'border-gold/40 bg-gold-soft/30 shadow-hard-sm'
                  : 'border-ink/15 bg-card',
            )}
          >
            <span
              className={cn(
                'w-8 shrink-0 text-center font-display font-bold tabular',
                place === 1 ? 'text-amber-500 dark:text-amber-300' : place === 2 ? 'text-slate-600 dark:text-slate-200' : place === 3 ? 'text-orange-500 dark:text-orange-300' : 'text-ink',
              )}
            >
              {place}
            </span>
            <Avatar avatar={p.avatar} hue={p.hue} frame={p.frame} size={40} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate font-bold">
                  <NameTag name={p.name} tag={p.nametag} />
                </span>
                {p.isYou && <span className="shrink-0 rounded-md bg-brand px-1.5 text-[11px] font-extrabold text-white">{t('TU', 'YOU')}</span>}
              </div>
              <div className="truncate text-xs">
                <TitleText id={p.title} className="text-muted" />
              </div>
            </div>
            <span className="hidden items-center gap-1 text-sm font-semibold text-orange-300 sm:flex" title={t('Dienu sērija', 'Day streak')}>
              <Flame className="size-4" />
              {p.streak}
            </span>
            <RankEmblem rankIndex={rankIndexFromRP(p.totalRP)} size={32} idle={false} glow={false} />
            <span className="w-20 shrink-0 text-right font-display font-bold sm:w-24">
              <Counter value={board === 'weekly' ? p.weeklyRP : p.totalRP} format={fmt} duration={700} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}
