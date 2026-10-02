import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { animate } from 'animejs';
import { ArrowUp, CheckCheck, Clock, Flame, House, RotateCcw, Target, Trophy, Zap } from 'lucide-react';
import type { Deck } from '../../types';
import { useGame, type SessionOutcome } from '../../store/useGame';
import { questDef, type QuestState } from '../../lib/quests';
import { rankAt, rankName, rankProgress } from '../../lib/rank';
import { achievementDef } from '../../lib/achievements';
import { RARITY_META } from '../../lib/cosmetics';
import type { Grade } from '../../lib/rp';
import { centerOf, confettiCannons, prefersReducedMotion, ring } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { fmtPct, fmtSec, plural } from '../../lib/format';
import { useLang, useNumFmt, useT } from '../../lib/i18n';
import { cn } from '../../lib/cn';
import { Counter, ProgressBar, Ring } from '../ui/Meters';
import { Button } from '../ui/Button';
import { ACH_ICONS, RPIcon } from '../ui/Icons';
import { SplitTitle } from '../ui/SplitTitle';
import { RankEmblem } from '../rank/RankEmblem';

const GRADE: Record<Grade, { fill: string; ring: string; lv: string; en: string }> = {
  S: { fill: 'linear-gradient(135deg,#fef3c7,#fbbf24 30%,#f472b6 65%,#8b5cf6)', ring: '#f472b6', lv: 'Leģendāri!', en: 'Legendary!' },
  A: { fill: 'linear-gradient(135deg,#d1fae5,#34d399)', ring: '#34d399', lv: 'Izcili!', en: 'Excellent!' },
  B: { fill: 'linear-gradient(135deg,#e0f2fe,#38bdf8)', ring: '#38bdf8', lv: 'Labi padarīts!', en: 'Nicely done!' },
  C: { fill: 'linear-gradient(135deg,#fef3c7,#f59e0b)', ring: '#f59e0b', lv: 'Var vēl labāk', en: 'Room to grow' },
  D: { fill: 'linear-gradient(135deg,#ffe4e6,#fb7185)', ring: '#fb7185', lv: 'Mēģini vēlreiz', en: 'Try again' },
};

export function SessionResults({
  outcome,
  deck,
  questsBefore,
  onReplay,
}: {
  outcome: SessionOutcome;
  deck: Deck;
  questsBefore: QuestState[];
  onReplay: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const navigate = useNavigate();
  const setCeremony = useGame((s) => s.setCeremony);
  const quests = useGame((s) => s.quests);
  const gradeRef = useRef<HTMLDivElement>(null);
  const g = GRADE[outcome.grade];
  const b = outcome.breakdown;
  const promoted = outcome.rankAfter > outcome.rankBefore;
  const rank = rankAt(outcome.rankAfter);
  const delta = outcome.placeBefore - outcome.placeAfter;

  const rows = [
    { key: 'answers', label: t('Pareizās atbildes', 'Correct answers'), value: b.answers },
    { key: 'completion', label: t('Sesija pabeigta', 'Session complete'), value: b.completion },
    { key: 'accuracy', label: t(`Precizitātes bonuss (+${Math.round(b.accuracyPct * 100)}%)`, `Accuracy bonus (+${Math.round(b.accuracyPct * 100)}%)`), value: b.accuracy },
    { key: 'daily', label: t('Dienas pirmā sesija', 'First session today'), value: b.daily },
    {
      key: 'streak',
      label: t(`Sērijas bonuss (${outcome.streak} d., +${Math.round(b.streakPct * 100)}%)`, `Streak bonus (${outcome.streak}d, +${Math.round(b.streakPct * 100)}%)`),
      value: b.streak,
    },
  ].filter((r) => r.key === 'answers' || r.value > 0);

  const ROWS_AT = 0.9;
  const TOTAL_AT = ROWS_AT + rows.length * 0.18 + 0.15;
  const RANK_AT = TOTAL_AT + 0.9;

  const ceremonyShownRef = useRef(false);

  useEffect(() => {
    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        sfx.slam();
        const el = gradeRef.current;
        if (!el) return;
        if (prefersReducedMotion()) el.style.opacity = '1';
        else animate(el, { scale: [3.2, 1], rotate: [-24, 0], opacity: [0, 1], duration: 560, ease: 'out(4)' });
        timers.push(
          window.setTimeout(() => {
            const c = centerOf(el);
            ring(c.x, c.y, g.ring, 280, 700);
          }, 260),
        );
        if (outcome.grade === 'S' || outcome.grade === 'A') confettiCannons([g.ring, '#ffffff', '#fde68a', '#a78bfa']);
      }, 380),
    );
    if (promoted) {
      timers.push(
        window.setTimeout(() => {
          ceremonyShownRef.current = true;
          setCeremony({ from: outcome.rankBefore, to: outcome.rankAfter, items: outcome.promotions.flatMap((p) => p.items) });
        }, (RANK_AT + 1.5) * 1000),
      );
    }
    return () => {
      timers.forEach(clearTimeout);
      if (promoted && !ceremonyShownRef.current) {
        setCeremony({ from: outcome.rankBefore, to: outcome.rankAfter, items: outcome.promotions.flatMap((p) => p.items) });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appear = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { delay, type: 'spring' as const, stiffness: 260, damping: 26 },
  });

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/85 backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-10 sm:px-6">
        <div className="text-center">
          <div className="text-sm font-bold uppercase tracking-[0.3em] text-violet-300">{deck.title}</div>
          <SplitTitle
            as="h1"
            text={outcome.completed ? t('Sesija pabeigta!', 'Session complete!') : t('Sesija pārtraukta', 'Session ended early')}
            className="mt-2 font-display text-4xl font-extrabold sm:text-5xl"
          />
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-[340px_1fr]">
          {/* Grade & accuracy */}
          <motion.section {...appear(0.15)} className="flex flex-col items-center rounded-[28px] glass p-6 text-center">
            <div className="relative grid size-40 place-items-center">
              <div className="absolute inset-3 rounded-full opacity-60 blur-2xl" style={{ background: g.ring }} />
              <div
                ref={gradeRef}
                className="relative font-display text-[112px] font-black leading-none opacity-0"
                style={{ background: g.fill, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent', filter: 'drop-shadow(0 6px 0 rgba(0,0,0,0.35))' }}
              >
                {outcome.grade}
              </div>
            </div>
            <div className="mt-1 font-display text-xl font-bold">{t(g.lv, g.en)}</div>

            <div className="mt-6 flex items-center gap-5">
              <Ring value={outcome.accuracy} size={92} stroke={9} color={outcome.accuracy >= 0.75 ? '#34d399' : outcome.accuracy >= 0.5 ? '#fbbf24' : '#fb7185'} delay={0.5}>
                <span className="font-display text-lg font-bold">{fmtPct(outcome.accuracy, lang)}</span>
              </Ring>
              <div className="space-y-2 text-left text-[15px]">
                <div className="flex items-center gap-2">
                  <Target className="size-4 text-emerald-300" />
                  <span className="text-muted">{t('Pareizi', 'Correct')}</span>
                  <b className="tabular">
                    {outcome.correct}/{outcome.total}
                  </b>
                </div>
                <div className="flex items-center gap-2">
                  <Flame className="size-4 text-orange-300" />
                  <span className="text-muted">{t('Labākais combo', 'Best combo')}</span>
                  <b className="tabular">×{outcome.bestCombo}</b>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="size-4 text-sky-300" />
                  <span className="text-muted">{t('Vid. laiks', 'Avg. time')}</span>
                  <b className="tabular">{fmtSec(outcome.avgMs, lang)}</b>
                </div>
                {outcome.fastestMs !== null && (
                  <div className="flex items-center gap-2">
                    <Zap className="size-4 text-cyan-300" />
                    <span className="text-muted">{t('Ātrākā', 'Fastest')}</span>
                    <b className="tabular">{fmtSec(outcome.fastestMs, lang)}</b>
                  </div>
                )}
              </div>
            </div>

            {outcome.streakUp && (
              <div className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-300/30 bg-orange-400/10 px-4 py-3 font-bold text-orange-200">
                <Flame className="size-5 animate-flicker fill-orange-400/50" />
                {t(
                  `Sērija: ${outcome.streak} ${plural(outcome.streak, 'lv', 'diena', 'dienas', '', '')}!`,
                  `Streak: ${outcome.streak} ${plural(outcome.streak, 'en', '', '', 'day', 'days')}!`,
                )}
              </div>
            )}
          </motion.section>

          <div className="grid gap-5">
            {/* RP breakdown */}
            <motion.section {...appear(0.3)} className="rounded-[28px] glass p-6">
              <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                <RPIcon size={22} /> {t('Nopelnītie RP', 'RP earned')}
              </h2>
              <div className="mt-3">
                {rows.map((r, i) => (
                  <motion.div
                    key={r.key}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: ROWS_AT + i * 0.18 }}
                    className="flex items-center justify-between gap-4 border-b border-white/6 py-2.5 text-[15px]"
                  >
                    <span className="text-muted">{r.label}</span>
                    <span className="font-display font-bold text-amber-200">
                      +<Counter value={r.value} from={0} delay={(ROWS_AT + i * 0.18) * 1000} duration={500} format={fmt} />
                    </span>
                  </motion.div>
                ))}
              </div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: TOTAL_AT }}
                className="mt-4 flex items-end justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{t('Kopā', 'Total')}</span>
                  {outcome.boosted && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 px-2 py-0.5 text-xs font-bold text-amber-300 ring-1 ring-amber-400/40">
                      <Zap className="size-3 fill-amber-300" />
                      2× RP
                    </span>
                  )}
                </div>
                <span className="flex items-center gap-2">
                  <span className="font-display text-5xl font-extrabold text-gradient">
                    +<Counter value={b.total} from={0} delay={TOTAL_AT * 1000} duration={1000} format={fmt} onTick={sfx.count} />
                  </span>
                  <span className="pb-1.5 font-bold text-muted">RP</span>
                </span>
              </motion.div>
            </motion.section>

            {/* Rank progress */}
            <motion.section {...appear(RANK_AT - 0.3)} className="relative overflow-hidden rounded-[28px] glass p-6">
              <div className="absolute -right-10 -top-10 size-48 rounded-full opacity-30 blur-3xl" style={{ background: rank.league.c2 }} />
              <div className="relative flex items-center gap-5">
                <RankEmblem rankIndex={rank.index} size={86} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-2xl font-bold" style={{ color: rank.league.c1 }}>
                      {rankName(rank, lang)}
                    </span>
                    {promoted && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: RANK_AT + 1.2, type: 'spring', stiffness: 400, damping: 12 }}
                        className="rounded-lg bg-amber-400 px-2 py-0.5 text-xs font-extrabold uppercase tracking-wider text-amber-950"
                      >
                        {t('Paaugstināts!', 'Promoted!')}
                      </motion.span>
                    )}
                  </div>
                  <ProgressBar
                    className="mt-3"
                    height={12}
                    from={promoted ? 0 : rankProgress(outcome.rpBefore)}
                    value={rankProgress(outcome.rpAfter)}
                    delay={RANK_AT}
                    duration={1.3}
                    fill={`linear-gradient(90deg,${rank.league.c3},${rank.league.c2},${rank.league.c1})`}
                    glow={rank.league.glow}
                  />
                  <div className="mt-2 flex justify-between text-sm text-muted">
                    <span className="tabular">{fmt(outcome.rpAfter)} RP</span>
                    <span>
                      {rank.nextRP !== null
                        ? t(`līdz nākamajam: ${fmt(rank.nextRP - outcome.rpAfter)} RP`, `${fmt(rank.nextRP - outcome.rpAfter)} RP to next`)
                        : t('Augstākais rangs!', 'Top rank!')}
                    </span>
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="grid gap-5 md:grid-cols-2">
              {/* Weekly leaderboard delta */}
              <motion.section {...appear(RANK_AT + 0.2)} className="rounded-[28px] glass p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <Trophy className="size-5 text-amber-300" /> {t('Nedēļas tabula', 'Weekly board')}
                </h2>
                <div className="mt-4 flex items-end gap-3">
                  <span className="font-display text-5xl font-extrabold">
                    #<Counter value={outcome.placeAfter} from={outcome.placeBefore} delay={(RANK_AT + 0.5) * 1000} duration={1200} format={fmt} />
                  </span>
                  {delta > 0 && (
                    <motion.span
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: RANK_AT + 1.6 }}
                      className="mb-2 flex items-center gap-1 rounded-lg bg-emerald-400/15 px-2 py-1 text-sm font-bold text-emerald-300"
                    >
                      <ArrowUp className="size-4" />
                      {delta}
                    </motion.span>
                  )}
                </div>
                <p className="mt-2 text-[15px] text-muted">
                  {delta > 0
                    ? t(
                        `Tu apsteidzi ${delta} ${plural(delta, 'lv', 'spēlētāju', 'spēlētājus', '', '')}!`,
                        `You overtook ${delta} ${plural(delta, 'en', '', '', 'player', 'players')}!`,
                      )
                    : t('Turpini — nākamā vieta ir pavisam tuvu!', 'Keep going — the next spot is close!')}
                </p>
                <button type="button" onClick={() => navigate('/leaderboard')} className="mt-3 text-sm font-semibold text-violet-300 hover:text-violet-200">
                  {t('Skatīt tabulu →', 'View board →')}
                </button>
              </motion.section>

              {/* Daily quests */}
              <motion.section {...appear(RANK_AT + 0.35)} className="rounded-[28px] glass p-6">
                <h2 className="flex items-center gap-2 font-display text-lg font-bold">
                  <CheckCheck className="size-5 text-emerald-300" /> {t('Dienas uzdevumi', 'Daily quests')}
                </h2>
                <div className="mt-3 space-y-3">
                  {quests.items.map((q) => {
                    const def = questDef(q.id);
                    const before = questsBefore.find((x) => x.id === q.id)?.progress ?? 0;
                    const doneNow = before < def.target && q.progress >= def.target;
                    return (
                      <div key={q.id}>
                        <div className="flex items-center justify-between gap-2 text-sm">
                          <span className={cn('truncate', q.progress >= def.target ? 'text-emerald-200' : 'text-muted')}>{def[lang]}</span>
                          {doneNow ? (
                            <motion.span
                              initial={{ scale: 0, rotate: -20 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: RANK_AT + 1.4, type: 'spring', stiffness: 400, damping: 12 }}
                              className="shrink-0 rounded-md bg-emerald-400 px-1.5 text-[11px] font-extrabold uppercase text-emerald-950"
                            >
                              {t('Izpildīts', 'Done')}
                            </motion.span>
                          ) : (
                            <span className="shrink-0 tabular text-dim">
                              {q.progress}/{def.target}
                            </span>
                          )}
                        </div>
                        <ProgressBar
                          className="mt-1.5"
                          height={7}
                          from={before / def.target}
                          value={q.progress / def.target}
                          delay={RANK_AT + 0.6}
                          fill={q.progress >= def.target ? 'linear-gradient(90deg,#34d399,#a3e635)' : undefined}
                          glow={null}
                        />
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            </div>

            {outcome.achievements.length > 0 && (
              <motion.section {...appear(RANK_AT + 0.5)} className="flex flex-wrap gap-3 rounded-[28px] glass p-5">
                {outcome.achievements.map((id) => {
                  const a = achievementDef(id);
                  const Icon = ACH_ICONS[a.icon];
                  const color = RARITY_META[a.rarity].color;
                  return (
                    <div key={id} className="flex items-center gap-2.5 rounded-2xl border px-3 py-2" style={{ borderColor: `${color}55`, background: `${color}14` }}>
                      <Icon className="size-5" style={{ color }} />
                      <span className="font-semibold">{a[lang]}</span>
                    </div>
                  );
                })}
              </motion.section>
            )}
          </div>
        </div>

        <motion.div {...appear(RANK_AT + 0.6)} className="mt-9 flex flex-wrap justify-center gap-3">
          <Button variant="primary" size="xl" shine icon={<RotateCcw className="size-5" />} onClick={onReplay}>
            {t('Spēlēt vēlreiz', 'Play again')}
          </Button>
          <Button variant="secondary" size="xl" icon={<House className="size-5" />} onClick={() => navigate('/')}>
            {t('Uz sākumu', 'Home')}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
