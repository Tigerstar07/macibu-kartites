import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Gift, Play, Radio } from 'lucide-react';
import { useGame } from '../store/useGame';
import { useNow, useYouPlayer } from '../store/hooks';
import { PRIZE_TIERS, botPlayers, recentActivity, sortPlayers, weeklyRewards, type Board } from '../lib/bots';
import { weekEnd } from '../lib/time';
import { useLang, useNumFmt, useT } from '../lib/i18n';
import { sfx } from '../lib/sound';
import { LeaderboardList, Podium } from '../components/leaderboard/Leaderboard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { Counter } from '../components/ui/Meters';
import { Panel } from '../components/ui/Panel';
import { RewardChip } from '../components/ui/Reward';
import { SplitTitle } from '../components/ui/SplitTitle';
import { Tabs } from '../components/ui/Tabs';
import { CountdownText } from '../components/ui/CountdownText';

/** Weekly RP the player had the last time the board was shown — lets us replay the climb. */
let seenWeeklyRP = useGame.getState().stats.weeklyRP;

export default function LeaderboardPage() {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const navigate = useNavigate();
  const [board, setBoard] = useState<Board>('weekly');
  const now = useNow(4000);
  const you = useYouPlayer();
  const realRP = you?.weeklyRP ?? 0;
  const [shownRP, setShownRP] = useState(() => Math.min(seenWeeklyRP, realRP));
  const [flash, setFlash] = useState(false);

  // If you earned RP since your last visit, start at the old spot and climb.
  useEffect(() => {
    if (shownRP >= realRP) {
      if (shownRP > realRP) setShownRP(realRP);
      seenWeeklyRP = realRP;
      return;
    }
    const timer = setTimeout(() => {
      setShownRP(realRP);
      seenWeeklyRP = realRP;
      setFlash(true);
      sfx.combo(2);
    }, 900);
    return () => clearTimeout(timer);
  }, [realRP, shownRP]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(false), 1800);
    return () => clearTimeout(timer);
  }, [flash]);

  const bots = useMemo(() => botPlayers(now), [now]);
  const me = useMemo(() => (you ? { ...you, weeklyRP: shownRP } : null), [you, shownRP]);
  const players = useMemo(() => sortPlayers(me ? [...bots, me] : bots, board), [bots, me, board]);
  const activity = useMemo(() => recentActivity(now, 120, 6), [now]);

  const idx = players.findIndex((p) => p.isYou);
  const key = board === 'weekly' ? 'weeklyRP' : 'totalRP';
  const ahead = idx > 0 ? players[idx - 1] : null;
  const gap = ahead && me ? ahead[key] - me[key] + 1 : 0;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SplitTitle text={t('Līderu tabula', 'Leaderboard')} className="font-display text-4xl font-extrabold" />
          <p className="mt-1 text-muted">
            {board === 'weekly'
              ? t('Nedēļas RP — tabula sākas no nulles katru pirmdienu.', 'Weekly RP — the board resets every Monday.')
              : t('Visu laiku RP — tavs kopējais rangs.', 'All-time RP — your overall rank.')}
          </p>
        </div>
        <Tabs
          value={board}
          onChange={setBoard}
          layoutId="board-tabs"
          options={[
            { value: 'weekly', label: t('Nedēļa', 'This week') },
            { value: 'total', label: t('Visu laiku', 'All time') },
          ]}
        />
      </header>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_320px]">
        <aside className="space-y-5 lg:order-last">
          {me && (
            <div className="relative overflow-hidden rounded-[28px] glass p-5">
              <div className="pointer-events-none absolute -right-12 -top-12 size-40 rounded-full bg-violet-500/30 blur-3xl" />
              <div className="relative flex items-center gap-3">
                <Avatar avatar={me.avatar} hue={me.hue} frame={me.frame} size={48} />
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-[0.25em] text-muted">{t('Tava vieta', 'Your place')}</div>
                  <div className="flex items-end gap-1.5">
                    <span className="font-display text-4xl font-extrabold">
                      #<Counter value={idx + 1} format={fmt} duration={900} />
                    </span>
                    <span className="pb-1 text-muted">/ {players.length}</span>
                  </div>
                </div>
              </div>
              <div className="relative mt-2 font-semibold tabular">{fmt(me[key])} RP</div>
              <p className="relative mt-2 text-sm text-muted">
                {ahead
                  ? t(`Līdz ${idx}. vietai trūkst ${fmt(gap)} RP — viena laba sesija!`, `${fmt(gap)} RP to reach #${idx} — one good session!`)
                  : t('Tu esi 1. vietā! Noturi to līdz svētdienai.', "You're #1! Hold it until Sunday.")}
              </p>
              <Button className="relative mt-4 w-full" variant="primary" shine icon={<Play className="size-4 fill-current" />} onClick={() => navigate('/decks')}>
                {t('Spēlēt un kāpt', 'Play & climb')}
              </Button>
            </div>
          )}

          {board === 'weekly' && (
            <Panel
              title={t('Nedēļas balvas', 'Weekly prizes')}
              icon={<Gift className="size-5 text-amber-300" />}
              extra={
                <span className="text-xs text-muted">
                  <CountdownText to={weekEnd()} />
                </span>
              }
            >
              <div className="space-y-2.5">
                {PRIZE_TIERS.map((p) => (
                  <div key={p.place} className="rounded-2xl bg-white/4 p-3">
                    <div className="text-sm font-bold">{p[lang]}</div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {weeklyRewards(p.place).map((it, i) => (
                        <RewardChip key={i} item={it} className="px-2 py-1" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          <Panel
            title={t('Tiešraide', 'Live')}
            icon={
              <span className="relative grid size-5 place-items-center">
                <span className="absolute size-3 animate-ping rounded-full bg-rose-500/70" />
                <Radio className="relative size-5 text-rose-400" />
              </span>
            }
          >
            {activity.length === 0 ? (
              <p className="text-sm text-muted">{t('Pēdējās 2 stundās neviens nav spēlējis. Tava iespēja!', 'Nobody played in the last 2 hours. Your chance!')}</p>
            ) : (
              <ul className="space-y-2">
                <AnimatePresence initial={false}>
                  {activity.map((a) => {
                    const mins = Math.max(1, Math.round((now - a.at) / 60000));
                    return (
                      <motion.li
                        key={a.id}
                        layout
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-3 rounded-2xl bg-white/4 px-3 py-2"
                      >
                        <Avatar avatar={a.player.avatar} hue={a.player.hue} frame={a.player.frame} size={32} />
                        <div className="min-w-0 flex-1 leading-tight">
                          <div className="truncate text-sm font-semibold">{a.player.name}</div>
                          <div className="text-xs text-dim">{t(`pirms ${mins} min.`, `${mins} min ago`)}</div>
                        </div>
                        <span className="font-display text-sm font-bold text-emerald-300">+{fmt(a.gain)}</span>
                      </motion.li>
                    );
                  })}
                </AnimatePresence>
              </ul>
            )}
          </Panel>
        </aside>

        <div className="min-w-0">
          <div className="rounded-[28px] glass px-4 pb-0 pt-10 sm:px-8">
            <Podium players={players} board={board} />
          </div>
          <div className="mt-5">
            <LeaderboardList players={players} board={board} flashYou={flash} />
          </div>
        </div>
      </div>
    </div>
  );
}
