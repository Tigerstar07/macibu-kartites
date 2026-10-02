import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { animate, stagger } from 'animejs';
import { CalendarCheck, Check, CircleX, Flame, Lock, Play, Repeat, Sparkles, Target, Zap } from 'lucide-react';
import { useGame } from '../store/useGame';
import { DIVISIONS, LEAGUES, ROAD, THRESHOLDS, rankAt, rankFromRP, rankName, rankProgress } from '../lib/rank';
import { COMBO_STEPS } from '../lib/rp';
import { useLang, useNumFmt, useT } from '../lib/i18n';
import { prefersReducedMotion } from '../lib/fx';
import { cn } from '../lib/cn';
import { RankEmblem } from '../components/rank/RankEmblem';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/Meters';
import { Panel } from '../components/ui/Panel';
import { RewardChip } from '../components/ui/Reward';
import { BoostIcon, RPIcon } from '../components/ui/Icons';
import { SplitTitle } from '../components/ui/SplitTitle';

const NODE = 176; // reward-road node width
const GAP = 16;

export default function RankPage() {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const navigate = useNavigate();
  const stats = useGame((s) => s.stats);
  const rank = rankFromRP(stats.totalRP);
  const L = rank.league;
  const ladderRef = useRef<HTMLDivElement>(null);
  const roadRef = useRef<HTMLDivElement>(null);
  const mask = 'radial-gradient(circle, #000 12%, transparent 62%)';

  useEffect(() => {
    const road = roadRef.current;
    const target = road?.querySelector<HTMLElement>(`[data-road="${Math.min(rank.index + 1, ROAD.length)}"]`);
    if (road && target) road.scrollLeft = target.offsetLeft - road.clientWidth / 2 + target.clientWidth / 2;
    const items = ladderRef.current?.querySelectorAll('.ladder-item');
    if (!items || prefersReducedMotion()) return;
    const a = animate(items, { y: [36, 0], opacity: [0, 1], scale: [0.9, 1], delay: stagger(90, { start: 200 }), duration: 750, ease: 'out(4)' });
    return () => {
      a.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fill the road line up to the current rank, plus progress towards the next node.
  const reached = Math.max(0, rank.index - 1);
  const partial = rank.index >= 1 && rank.index < ROAD.length ? rankProgress(stats.totalRP) : 0;
  const lineWidth = rank.index === 0 ? rankProgress(stats.totalRP) * 0 : (reached + partial) * (NODE + GAP);

  const rules = [
    { icon: <Target className="size-5" />, c: '#34d399', title: t('Pareiza atbilde', 'Correct answer'), text: t('10 RP (patiess/aplams: 6 RP). Nepareiza — 0 RP.', '10 RP (true/false: 6 RP). Wrong — 0 RP.') },
    { icon: <Zap className="size-5" />, c: '#67e8f9', title: t('Ātruma bonuss', 'Speed bonus'), text: t('< 3 s: +5 · < 6 s: +3 · < 10 s: +1', '< 3 s: +5 · < 6 s: +3 · < 10 s: +1') },
    {
      icon: <Flame className="size-5" />,
      c: '#fb923c',
      title: t('Combo reizinātājs', 'Combo multiplier'),
      text: COMBO_STEPS.map((s) => `${s.at}× → ×${s.mult}`).join(' · '),
    },
    { icon: <Sparkles className="size-5" />, c: '#fde68a', title: t('Precizitāte', 'Accuracy'), text: t('Pabeigta sesija +20 RP. ≥75%: +15% · ≥90%: +30% · 100%: +50%', 'Finished session +20 RP. ≥75%: +15% · ≥90%: +30% · 100%: +50%') },
    { icon: <CalendarCheck className="size-5" />, c: '#a78bfa', title: t('Regularitāte', 'Consistency'), text: t('Dienas pirmā sesija +25 RP. Sērija: +5% par katru dienu (līdz +50%).', 'First session of the day +25 RP. Streak: +5% per day (up to +50%).') },
    { icon: <Repeat className="size-5" />, c: '#f472b6', title: t('Atkārtojumi', 'Retries'), text: t('Kļūdainās kartītes atgriežas sesijas beigās par ½ RP.', 'Missed cards return at the end for ½ RP.') },
    { icon: <BoostIcon size={20} />, c: '#22d3ee', title: t('RP pastiprinājums', 'RP boost'), text: t('Viena sesija ar ×1,5 RP. Iegūsti lādēs vai veikalā.', 'One session at ×1.5 RP. From chests or the shop.') },
    { icon: <CircleX className="size-5" />, c: '#fb7185', title: t('Bez sodiem', 'No penalties'), text: t('RP netiek atņemti — nedēļas tabula sākas no nulles katru pirmdienu.', 'RP is never taken away — the weekly board resets every Monday.') },
  ];

  return (
    <div>
      <section className="relative overflow-hidden rounded-[32px] glass p-7 sm:p-10">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 25% 40%, ${L.glow}, transparent 55%)` }} />
        <div className="relative grid items-center gap-8 md:grid-cols-[auto_1fr]">
          <div className="relative mx-auto grid size-64 place-items-center">
            <div className="pointer-events-none absolute -inset-[45%]" aria-hidden="true">
              <div
                className="size-full animate-spin-slower"
                style={{ background: `repeating-conic-gradient(from 0deg, ${L.c1}38 0deg 5deg, transparent 5deg 16deg)`, maskImage: mask, WebkitMaskImage: mask }}
              />
            </div>
            <div className="animate-float">
              <RankEmblem rankIndex={rank.index} size={210} />
            </div>
          </div>
          <div>
            <div className="text-sm font-bold uppercase tracking-[0.3em] text-muted">{t('Ranked sezona', 'Ranked season')}</div>
            <SplitTitle text={rankName(rank, lang)} className="mt-1 font-display text-5xl font-extrabold sm:text-6xl" />
            <div className="mt-5 max-w-lg">
              <ProgressBar value={rankProgress(stats.totalRP)} height={14} fill={`linear-gradient(90deg,${L.c3},${L.c2},${L.c1})`} glow={L.glow} />
              <div className="mt-2 flex justify-between text-sm">
                <span className="font-semibold tabular">{fmt(stats.totalRP)} RP</span>
                <span className="text-muted">
                  {rank.nextRP !== null
                    ? t(
                        `līdz ${rankName(rankAt(rank.index + 1), 'lv')}: ${fmt(rank.nextRP - stats.totalRP)} RP`,
                        `${fmt(rank.nextRP - stats.totalRP)} RP to ${rankName(rankAt(rank.index + 1), 'en')}`,
                      )
                    : t('Augstākais rangs sasniegts!', 'Top rank reached!')}
                </span>
              </div>
            </div>
            <Button variant="primary" size="lg" shine className="mt-6" icon={<Play className="size-5 fill-current" />} onClick={() => navigate('/decks')}>
              {t('Pelnīt RP', 'Earn RP')}
            </Button>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl font-bold">{t('Līgas', 'Leagues')}</h2>
        <div ref={ladderRef} className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {LEAGUES.map((lg, li) => {
            const current = li === rank.leagueIndex;
            const past = li < rank.leagueIndex;
            const locked = li > rank.leagueIndex;
            const showIdx = current ? rank.index : past ? li * 3 + 2 : li * 3;
            const min = THRESHOLDS[li * 3];
            const max = li < LEAGUES.length - 1 ? THRESHOLDS[li * 3 + 3] - 1 : null;
            return (
              <div
                key={lg.id}
                className={cn(
                  'ladder-item relative flex flex-col items-center rounded-3xl border p-5 pt-6 text-center',
                  current ? 'border-white/25 bg-white/8' : 'border-white/8 bg-white/3',
                )}
                style={current ? { boxShadow: `0 0 50px -14px ${lg.glow}` } : undefined}
              >
                {current && (
                  <span className="absolute -top-3 rounded-full bg-violet-500 px-3 py-0.5 text-[11px] font-extrabold uppercase tracking-wider">
                    {t('Tu esi šeit', 'You are here')}
                  </span>
                )}
                <RankEmblem rankIndex={showIdx} size={88} locked={locked} idle={current} />
                <div className="mt-3 font-display font-bold" style={{ color: locked ? undefined : lg.c1 }}>
                  {lg[lang]}
                </div>
                <div className="text-xs text-muted tabular">{max !== null ? `${fmt(min)}–${fmt(max)} RP` : `${fmt(min)}+ RP`}</div>
                <div className="mt-3 flex gap-1.5">
                  {DIVISIONS.map((d, di) => (
                    <span
                      key={d}
                      title={`${lg[lang]} ${d}`}
                      className="h-1.5 w-6 rounded-full"
                      style={{ background: rank.index >= li * 3 + di ? lg.c2 : 'rgba(255,255,255,0.12)' }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 className="font-display text-2xl font-bold">{t('Rangu balvu ceļš', 'Rank reward road')}</h2>
          <p className="text-sm text-muted">{t('Katrs jauns ranga līmenis atnes balvu.', 'Every new division pays out.')}</p>
        </div>
        <div ref={roadRef} className="no-scrollbar mt-4 overflow-x-auto pb-4">
          <div className="relative flex min-w-max gap-4 px-1 pt-6">
            <div className="absolute top-[62px] h-1.5 rounded-full bg-white/10" style={{ left: NODE / 2, right: NODE / 2 }} />
            <div
              className="absolute top-[62px] h-1.5 rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-400 to-cyan-300 shadow-[0_0_14px_rgba(167,139,250,0.8)] transition-[width] duration-1000"
              style={{ left: NODE / 2, width: Math.min(lineWidth, (ROAD.length - 1) * (NODE + GAP)) }}
            />
            {ROAD.map((step) => {
              const r = rankAt(step.rankIndex);
              const claimed = stats.roadClaimed >= step.rankIndex;
              const next = step.rankIndex === rank.index + 1;
              return (
                <div key={step.rankIndex} data-road={step.rankIndex} className="relative flex shrink-0 flex-col items-center text-center" style={{ width: NODE }}>
                  <div
                    className={cn(
                      'relative grid size-20 place-items-center rounded-full border-2 bg-ink-850',
                      claimed ? 'border-emerald-400/70' : next ? 'animate-pulse-glow border-violet-300' : 'border-white/10',
                    )}
                    style={next ? { boxShadow: `0 0 34px -4px ${r.league.glow}` } : undefined}
                  >
                    <RankEmblem rankIndex={step.rankIndex} size={54} idle={false} glow={false} locked={!claimed && !next} />
                    {claimed && (
                      <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-emerald-400 text-emerald-950">
                        <Check className="size-4" strokeWidth={3} />
                      </span>
                    )}
                    {!claimed && !next && (
                      <span className="absolute -bottom-1 -right-1 grid size-6 place-items-center rounded-full bg-ink-700 text-dim">
                        <Lock className="size-3.5" />
                      </span>
                    )}
                  </div>
                  <div className="mt-3 text-sm font-bold" style={{ color: r.league.c1 }}>
                    {rankName(r, lang)}
                  </div>
                  <div className="text-xs text-dim tabular">{fmt(r.minRP)} RP</div>
                  <div className={cn('mt-3 flex w-full flex-col gap-2', claimed && 'opacity-55')}>
                    {step.items.map((it, i) => (
                      <RewardChip key={i} item={it} className="py-1.5" />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Panel className="mt-8" title={t('Kā pelnīt RP', 'How RP works')} icon={<RPIcon size={22} />}>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {rules.map((r) => (
            <div key={r.title} className="rounded-2xl glass-soft p-4">
              <div className="grid size-10 place-items-center rounded-xl" style={{ background: `${r.c}22`, color: r.c }}>
                {r.icon}
              </div>
              <div className="mt-3 font-semibold">{r.title}</div>
              <p className="mt-1 text-sm text-muted">{r.text}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
