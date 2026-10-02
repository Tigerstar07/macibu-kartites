import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { animate, createScope } from 'animejs';
import { ArrowRight, CalendarClock, Check, Flame, GraduationCap, Layers, Play, Trophy, Zap } from 'lucide-react';
import { effectiveStreak, useAllDecks, useGame } from '../store/useGame';
import { useNow, useYouPlayer } from '../store/hooks';
import { deckCounts, isPlayable } from '../lib/questions';
import { ROAD, rankAt, rankFromRP, rankName, rankProgress } from '../lib/rank';
import { botPlayers, placeFor, sortPlayers } from '../lib/bots';
import { plural } from '../lib/format';
import { greetingKey, weekEnd } from '../lib/time';
import { useLang, useNumFmt, useT } from '../lib/i18n';
import { prefersReducedMotion } from '../lib/fx';
import { sfx } from '../lib/sound';
import { cn } from '../lib/cn';
import { RankEmblem } from '../components/rank/RankEmblem';
import { ChestIcon } from '../components/rewards/ChestIcon';
import { QuestList } from '../components/rewards/QuestList';
import { DeckCard } from '../components/decks/DeckCard';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/Meters';
import { Panel } from '../components/ui/Panel';
import { RewardChip } from '../components/ui/Reward';
import { SplitTitle } from '../components/ui/SplitTitle';
import { CountdownText } from '../components/ui/CountdownText';

const FLOAT_ROT = [-8, 7, -4];

/** Place badges: gold, silver, bronze. */
const MEDAL = ['', 'bg-gold text-ink', 'bg-[oklch(0.9_0.01_260)] text-ink', 'bg-[oklch(0.78_0.12_55)] text-ink'];

const INK_LINK =
  'inline-flex items-center gap-1 text-sm font-bold text-ink underline decoration-brand decoration-2 underline-offset-4 transition-colors hover:decoration-ink';

const PILL = 'rounded-full border-2 border-ink bg-card px-3 py-1 font-mono text-[11px] font-semibold text-ink';

/** Colour-block KPI tile. */
function StatTile({
  className,
  iconCls,
  icon,
  value,
  label,
}: {
  className: string;
  iconCls?: string;
  icon: ReactNode;
  value: ReactNode;
  label: string;
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-tile border-2 border-ink p-4 shadow-hard @md:p-5', className)}>
      <div className="halftone pointer-events-none absolute inset-0 opacity-70 dark:opacity-20" />
      <div className={cn('relative grid size-10 place-items-center rounded-full border-2 border-ink bg-card text-ink', iconCls)}>{icon}</div>
      <div className="relative mt-4 font-display text-[1.9rem] font-extrabold leading-none tracking-[-0.04em] tabular @md:text-[2.4rem]">{value}</div>
      <div className="relative mt-1.5 text-xs font-bold text-ink/75 dark:text-muted @md:text-sm">{label}</div>
    </div>
  );
}

function RankCard() {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const totalRP = useGame((s) => s.stats.totalRP);
  const rank = rankFromRP(totalRP);
  const L = rank.league;
  const nextStep = ROAD.find((s) => s.rankIndex > rank.index);

  return (
    <div className="relative flex flex-col overflow-hidden rounded-card border-2 border-ink bg-card shadow-hard @4xl:row-span-2">
      <div className="halftone relative h-32 shrink-0 overflow-hidden border-b-2 border-ink" style={{ backgroundColor: L.c2 }}>
        <div className="sunburst absolute -inset-1/2 animate-spin-slower [--ray:rgba(255,255,255,0.35)]" />
      </div>
      <div className="relative -mt-24 flex flex-1 flex-col px-6 pb-6 text-center">
        <div className="mx-auto w-fit animate-float">
          <RankEmblem rankIndex={rank.index} size={140} />
        </div>
        <div className="eyebrow mt-3 text-[11px] text-muted">{t('Tavs rangs', 'Your rank')}</div>
        <div className="mt-0.5 font-display text-[2rem] font-extrabold leading-tight tracking-[-0.04em]">{rankName(rank, lang)}</div>
        <ProgressBar className="mt-4" value={rankProgress(totalRP)} height={10} fill={L.c2} />
        <div className="mt-2 flex justify-between font-mono text-xs font-semibold">
          <span className="tabular">{fmt(totalRP)} RP</span>
          <span className="text-muted">
            {rank.nextRP !== null ? t(`vēl ${fmt(rank.nextRP - totalRP)} RP`, `${fmt(rank.nextRP - totalRP)} RP to go`) : t('Augstākais rangs!', 'Top rank!')}
          </span>
        </div>
        {nextStep && (
          <div className="mt-5 rounded-xl border-2 border-dashed border-ink/40 bg-paper p-3 text-left">
            <div className="text-xs font-bold text-muted">
              {t('Nākamā balva', 'Next reward')} · <span className="text-ink">{rankName(rankAt(nextStep.rankIndex), lang)}</span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {nextStep.items.map((it, i) => (
                <RewardChip key={i} item={it} className="py-1.5" />
              ))}
            </div>
          </div>
        )}
        <Link to="/rank" className={cn(INK_LINK, 'mx-auto mt-auto pt-5')}>
          {t('Rangu ceļš un balvas', 'Rank road & rewards')} <ArrowRight className="size-4" />
        </Link>
      </div>
    </div>
  );
}

function MiniBoard() {
  const t = useT();
  const fmt = useNumFmt();
  const now = useNow(5000);
  const you = useYouPlayer();
  const players = useMemo(() => (you ? sortPlayers([...botPlayers(now), you], 'weekly') : []), [now, you]);
  const idx = players.findIndex((p) => p.isYou);
  const shown = players.slice(0, 3).concat(idx >= 3 ? [players[idx]] : []);
  const ahead = idx > 0 ? players[idx - 1] : null;
  if (!you) return null;

  return (
    <div className="flex h-full flex-col">
      <ol className="space-y-2">
        {shown.map((p) => {
          const place = players.indexOf(p) + 1;
          return (
            <li
              key={p.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border-2 px-2.5 py-2',
                p.isYou ? 'border-ink bg-acid dark:bg-brand dark:border-brand-soft/60 dark:text-white shadow-hard-sm' : 'border-ink/15 bg-paper',
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-lg border-2 border-ink font-mono text-[13px] font-bold tabular',
                  place <= 3 ? MEDAL[place] : 'bg-card text-ink',
                )}
              >
                {place}
              </span>
              <Avatar avatar={p.avatar} hue={p.hue} frame={p.frame} size={32} />
              <span className="min-w-0 flex-1 truncate font-bold">
                {p.name}
                {p.isYou && <span className="text-ink/60 dark:text-white/70"> · {t('tu', 'you')}</span>}
              </span>
              <span className="font-mono text-sm font-bold tabular">{fmt(p.weeklyRP)}</span>
            </li>
          );
        })}
      </ol>
      <p className="mt-4 flex items-center gap-2 text-sm font-medium text-muted">
        <span className="grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink bg-gold">
          <Zap className="size-3.5 text-ink" strokeWidth={2.6} />
        </span>
        {ahead
          ? t(`Līdz ${idx}. vietai trūkst ${fmt(ahead.weeklyRP - you.weeklyRP)} RP`, `${fmt(ahead.weeklyRP - you.weeklyRP)} RP to reach #${idx}`)
          : t('Tu esi nedēļas līderis!', "You're leading the week!")}
      </p>
      <Link to="/leaderboard" className={cn(INK_LINK, 'mt-auto pt-4')}>
        {t('Visa tabula', 'Full leaderboard')} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

/** Decorative ticker band (the row is duplicated once for a seamless loop). */
function Ticker({ items }: { items: string[] }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((it, i) => (
        <span key={i} className="flex items-center">
          <span className="eyebrow px-5 text-[13px] text-acid">{it}</span>
          <span className="text-gold">✦</span>
        </span>
      ))}
    </div>
  );
  return (
    <div className="marquee -rotate-1 overflow-hidden rounded-xl border-2 border-ink bg-ink py-3 shadow-hard" aria-hidden="true">
      <div className="marquee-track">
        {row}
        {row}
      </div>
    </div>
  );
}

export default function HomePage() {
  const t = useT();
  const lang = useLang();
  const navigate = useNavigate();
  const profile = useGame((s) => s.profile);
  const stats = useGame((s) => s.stats);
  const progress = useGame((s) => s.progress);
  const chests = useGame((s) => s.chests);
  const setOpenChest = useGame((s) => s.setOpenChest);
  const decks = useAllDecks();
  const heroRef = useRef<HTMLDivElement>(null);

  const streak = effectiveStreak(stats);
  const rows = useMemo(() => decks.filter(isPlayable).map((d) => ({ d, c: deckCounts(d, progress) })), [decks, progress]);
  const totalDue = rows.reduce((s, r) => s + r.c.due, 0);
  const mastered = rows.reduce((s, r) => s + r.c.mastered, 0);
  const place = useMemo(() => placeFor(stats.weeklyRP, 'weekly'), [stats.weeklyRP]);

  const quick = useMemo(() => {
    const byDue = [...rows].sort((a, b) => b.c.due - a.c.due);
    if ((byDue[0]?.c.due ?? 0) > 0) return byDue[0].d;
    const last = rows.find((r) => r.d.id === stats.lastDeckId);
    if (last && last.c.fresh > 0) return last.d;
    return (rows.find((r) => r.c.fresh > 0) ?? last ?? rows[0])?.d;
  }, [rows, stats.lastDeckId]);

  const continueRows = useMemo(
    () =>
      [...rows]
        .sort((a, b) => b.c.due - a.c.due || Number(b.d.id === stats.lastDeckId) - Number(a.d.id === stats.lastDeckId))
        .slice(0, 4),
    [rows, stats.lastDeckId],
  );

  const midnight = useMemo(() => {
    const d = new Date();
    d.setHours(24, 0, 0, 0);
    return d.getTime();
  }, []);

  useEffect(() => {
    const root = heroRef.current;
    if (!root || prefersReducedMotion()) return;
    const scope = createScope({ root }).add(() => {
      root.querySelectorAll<HTMLElement>('.float-card').forEach((el, i) => {
        animate(el, {
          y: [0, -14 - i * 4],
          rotate: [FLOAT_ROT[i], FLOAT_ROT[i] + (i % 2 ? -4 : 4)],
          duration: 2600 + i * 650,
          delay: i * 250,
          loop: true,
          alternate: true,
          ease: 'inOut(2)',
        });
      });
    });
    return () => scope.revert();
  }, []);

  const greet = {
    morning: t('Labrīt', 'Good morning'),
    day: t('Labdien', 'Good afternoon'),
    evening: t('Labvakar', 'Good evening'),
    night: t('Sveiks, nakts pūce', 'Hey, night owl'),
  }[greetingKey()];

  return (
    <div className="space-y-6">
      {/* ── Bento: hero · rank · KPIs ─────────────────────────────── */}
      <section className="grid gap-5 @4xl:grid-cols-3">
        <div
          ref={heroRef}
          className="@container/hero relative overflow-hidden rounded-card border-2 border-ink bg-brand p-7 text-white shadow-hard sm:p-9 @4xl:col-span-2"
        >
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(oklch(1_0_0/0.2)_1.2px,transparent_1.5px)] [background-size:14px_14px] [mask-image:linear-gradient(120deg,transparent_30%,black_80%)]" />
            <div className="absolute -bottom-28 -right-20 size-72 rounded-full border-2 border-ink bg-acid dark:opacity-20 dark:blur-2xl dark:border-transparent" />
            <div className="absolute -left-10 -top-12 size-28 rounded-full border-2 border-ink bg-candy dark:opacity-20 dark:blur-2xl dark:border-transparent" />
          </div>

          <div className="pointer-events-none absolute right-0 top-0 hidden h-full w-[270px] @2xl/hero:block" aria-hidden="true">
            <div className="float-card absolute right-12 top-9 w-44 rounded-2xl border-2 border-ink bg-card p-4 text-ink shadow-hard">
              <div className="eyebrow text-[10px] text-brand">{t('Ķīmija', 'Chemistry')}</div>
              <div className="mt-1.5 font-display text-[1.7rem] font-extrabold tracking-[-0.04em]">Au = ?</div>
              <div className="mt-3 h-3 overflow-hidden rounded-full border-2 border-ink bg-paper-2">
                <div className="stripes h-full w-2/3 border-r-2 border-ink bg-good" />
              </div>
            </div>
            <div className="float-card absolute right-28 top-44 flex w-44 items-center gap-2.5 rounded-2xl border-2 border-ink bg-good dark:bg-emerald-950/80 dark:border-emerald-500/50 dark:text-emerald-300 p-2.5 pr-3 text-ink shadow-hard">
              <span className="grid size-8 place-items-center rounded-lg border-2 border-ink bg-card">
                <Check className="size-4" strokeWidth={3.2} />
              </span>
              <span className="font-extrabold">{t('Zelts', 'Gold')}</span>
              <span className="ml-auto rounded-md border-2 border-ink bg-gold px-1.5 font-mono text-xs font-bold">+15</span>
            </div>
            <div className="float-card stroke-text absolute bottom-12 right-8 font-display text-[2rem] font-extrabold italic tracking-[-0.04em] text-gold [--stroke:6px] [text-shadow:4px_4px_0_var(--color-ink)]">
              COMBO ×5
            </div>
          </div>

          <div className="relative @2xl/hero:pr-[250px]">
            <span className="eyebrow inline-flex -rotate-2 items-center gap-2 rounded-md border-2 border-ink bg-acid px-2 py-1 text-[11px] text-ink shadow-hard-sm">
              <span className="size-2 rounded-full bg-ink" />
              Ranked
            </span>
            <SplitTitle text={`${greet}, ${profile?.name ?? ''}!`} className="mt-5 font-display text-display-lg font-extrabold" />
            <p className="mt-4 max-w-lg text-[17px] font-medium leading-relaxed text-white/85">
              {totalDue > 0
                ? t(
                    `Tevi gaida ${totalDue} ${plural(totalDue, 'lv', 'kartīte', 'kartītes', '', '')} atkārtošanai. Katra pareiza atbilde nes RP!`,
                    `${totalDue} ${plural(totalDue, 'en', '', '', 'card is', 'cards are')} due for review. Every right answer earns RP!`,
                  )
                : t('Atkārtojamo kartīšu nav — laiks apgūt jaunas un kāpt rangā!', 'Nothing due — time to learn new cards and climb!')}
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                variant="gold"
                size="xl"
                shine
                disabled={!quick}
                icon={<Play className="size-5 fill-current" />}
                onClick={() => quick && navigate(`/play/${quick.id}`)}
              >
                {t('Spēlēt', 'Play')}
              </Button>
              <Button variant="secondary" size="xl" icon={<Layers className="size-5" strokeWidth={2.4} />} onClick={() => navigate('/decks')}>
                {t('Izvēlēties kopu', 'Pick a deck')}
              </Button>
            </div>
            {quick && (
              <p className="mt-6 inline-flex max-w-full items-center gap-2 rounded-full border-2 border-ink bg-card py-1 pl-1 pr-3.5 text-sm font-medium text-muted shadow-hard-sm">
                <span className="grid size-6 place-items-center rounded-full border-2 border-ink bg-acid text-ink">
                  <Play className="size-2.5 fill-current" />
                </span>
                {t('Ātrā spēle:', 'Quick play:')} <span className="truncate font-bold text-ink">{quick.title}</span>
              </p>
            )}
          </div>
        </div>

        <RankCard />

        <div className="grid grid-cols-3 gap-3 @md:gap-5 @4xl:col-span-2">
          <StatTile
            className="bg-streak dark:bg-card dark:border-streak/60 dark:text-orange-400"
            iconCls="dark:bg-streak/15 dark:border-streak/40 dark:text-orange-400"
            icon={<Flame className={cn('size-5 text-ink dark:text-orange-400', streak > 0 && 'animate-flicker fill-gold')} strokeWidth={2.4} />}
            value={streak}
            label={plural(streak, lang, 'dienas sērija', 'dienu sērija', 'day streak', 'day streak')}
          />
          <StatTile
            className="bg-info dark:bg-card dark:border-info/60 dark:text-sky-400"
            iconCls="dark:bg-info/15 dark:border-info/40 dark:text-sky-400"
            icon={<Trophy className="size-5 text-ink dark:text-sky-400" strokeWidth={2.4} />}
            value={`#${place}`}
            label={t('nedēļas tabulā', 'this week')}
          />
          <StatTile
            className="bg-good dark:bg-card dark:border-good/60 dark:text-emerald-400"
            iconCls="dark:bg-good/15 dark:border-good/40 dark:text-emerald-400"
            icon={<GraduationCap className="size-5 text-ink dark:text-emerald-400" strokeWidth={2.4} />}
            value={mastered}
            label={plural(mastered, lang, 'apgūta kartīte', 'apgūtas kartītes', 'card mastered', 'cards mastered')}
          />
        </div>
      </section>

      <Ticker
        items={[
          t('Mācies', 'Learn'),
          t('Uzvari', 'Win'),
          t('Kāp augstāk', 'Climb'),
          'Combo ×5',
          '+15 RP',
          t('Bronza → Dimants', 'Bronze → Diamond'),
          t('Nedēļas tabula', 'Weekly board'),
          t('Zibens atbildes', 'Lightning answers'),
        ]}
      />

      {chests.length > 0 && (
        <motion.button
          type="button"
          onClick={() => {
            sfx.tap();
            setOpenChest(chests[0].id);
          }}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="group relative flex w-full items-center gap-4 overflow-hidden rounded-card border-2 border-ink bg-gold p-4 text-left text-ink shadow-hard transition-[translate,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg active:translate-x-1 active:translate-y-1 active:shadow-none sm:p-5"
        >
          <div className="stripes pointer-events-none absolute inset-0 opacity-60" />
          <div className="relative flex -space-x-6">
            {chests.slice(0, 3).map((c, i) => (
              <div key={c.id} className="animate-bob" style={{ animationDelay: `${i * 0.25}s` }}>
                <ChestIcon rarity={c.rarity} size={64} />
              </div>
            ))}
          </div>
          <div className="relative min-w-0 flex-1">
            <div className="font-display text-xl font-extrabold tracking-[-0.03em]">
              {t(
                `Tev ir ${chests.length} ${plural(chests.length, 'lv', 'neatvērta lāde', 'neatvērtas lādes', '', '')}!`,
                `You have ${chests.length} unopened ${plural(chests.length, 'en', '', '', 'chest', 'chests')}!`,
              )}
            </div>
            <div className="text-sm font-medium text-ink/75">{t('Pieskaries, lai atvērtu un saņemtu balvas', 'Tap to open and collect your loot')}</div>
          </div>
          <span className="relative hidden rounded-xl border-2 border-ink bg-ink px-5 py-2.5 font-bold text-gold sm:block">{t('Atvērt', 'Open')}</span>
        </motion.button>
      )}

      <section className="reveal grid gap-5 @3xl:grid-cols-2 @5xl:grid-cols-3">
        <Panel
          className="@5xl:col-span-2"
          title={t('Dienas uzdevumi', 'Daily quests')}
          icon={<CalendarClock className="size-5" strokeWidth={2.4} />}
          extra={
            <span className={PILL}>
              {t('Jauni pēc', 'New in')} <CountdownText to={midnight} />
            </span>
          }
        >
          <QuestList />
        </Panel>
        <Panel
          className="flex flex-col"
          title={t('Nedēļas tabula', 'Weekly leaderboard')}
          icon={<Trophy className="size-5" strokeWidth={2.4} />}
          extra={
            <span className={PILL}>
              {t('Beidzas pēc', 'Ends in')} <CountdownText to={weekEnd()} />
            </span>
          }
        >
          <MiniBoard />
        </Panel>
      </section>

      <section className="reveal pt-2">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow text-[11px] text-muted">{t('Tavas kopas', 'Your decks')}</div>
            <h2 className="mt-1 font-display text-display-md font-extrabold">{t('Turpini mācīties', 'Keep learning')}</h2>
          </div>
          <Link to="/decks" className={INK_LINK}>
            {t('Visas kopas', 'All decks')} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-6 @xl:grid-cols-2 @5xl:grid-cols-4">
          {continueRows.map((r, i) => (
            <DeckCard key={r.d.id} deck={r.d} counts={r.c} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}
