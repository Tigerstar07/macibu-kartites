import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { animate } from 'animejs';
import { ArrowLeft, ArrowRight, Check, CornerDownLeft, House, Lightbulb, RotateCcw, X } from 'lucide-react';
import type { AnswerLog, Deck, Question } from '../types';
import { useDeck, useGame, type SessionOutcome } from '../store/useGame';
import { buildQuestion, buildSession, isPlayable } from '../lib/questions';
import { TIME_LIMIT, answerRP, comboMultiplier, speedTier, type SpeedTier } from '../lib/rp';
import { cosmetic } from '../lib/cosmetics';
import { burst, centerOf, flash, floatText, pop, ring, shake, sleep } from '../lib/fx';
import { sfx } from '../lib/sound';
import { useT } from '../lib/i18n';
import { cn } from '../lib/cn';
import { AnswerButton, ComboBanner, Countdown, GameHUD, type Banner, type OptionState } from '../components/game/GameParts';
import { SessionResults } from '../components/game/SessionResults';
import { ConfirmDialog } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';

/** Options finish animating in before the clock starts. */
const ENTER_MS = 420;
const MILESTONES = [3, 5, 8, 12, 15, 20, 25, 30, 40, 50];

const FEVER_BG = [
  'none',
  'radial-gradient(ellipse at 50% 115%, rgba(249,115,22,0.5), transparent 62%)',
  'radial-gradient(ellipse at 50% 115%, rgba(56,189,248,0.5), transparent 62%)',
  'radial-gradient(ellipse at 50% 115%, rgba(217,70,239,0.55), transparent 62%)',
];

const FEVER_BORDER: CSSProperties[] = [
  {},
  { '--b1': '#f97316', '--b2': '#facc15', '--b3': '#ef4444', '--b4': '#fb923c' } as CSSProperties,
  { '--b1': '#38bdf8', '--b2': '#a5f3fc', '--b3': '#6366f1', '--b4': '#22d3ee' } as CSSProperties,
  { '--b1': '#f472b6', '--b2': '#facc15', '--b3': '#4ade80', '--b4': '#a78bfa' } as CSSProperties,
];

export default function PlayPage() {
  const { deckId } = useParams();
  const deck = useDeck(deckId);
  const [run, setRun] = useState(0);
  const t = useT();

  if (!deck || !isPlayable(deck)) {
    return (
      <div className="relative z-10 grid min-h-dvh place-items-center p-6 text-center">
        <div className="max-w-md rounded-card glass p-8">
          <h1 className="font-display text-2xl font-bold tracking-[-0.02em]">{t('Šo kopu nevar spēlēt', "This deck can't be played")}</h1>
          <p className="mt-3 text-muted">
            {t(
              'Kopā jābūt vismaz 4 kartītēm vai katrai kartītei jābūt vismaz 2 nepareiziem variantiem.',
              'A deck needs at least 4 cards, or every card needs at least 2 wrong options.',
            )}
          </p>
          <Link to="/decks" className="mt-6 inline-flex items-center gap-2 font-semibold text-brand hover:text-brand-dark dark:text-violet-300 dark:hover:text-violet-200">
            <ArrowLeft className="size-4" /> {t('Uz kopām', 'Back to decks')}
          </Link>
        </div>
      </div>
    );
  }
  return <Game key={run} deck={deck} onReplay={() => setRun((r) => r + 1)} />;
}

type Phase = 'intro' | 'question' | 'feedback' | 'results' | 'failed';

function Embers({ level }: { level: number }) {
  const embers = useMemo(
    () =>
      Array.from({ length: 30 }, () => ({
        left: Math.random() * 100,
        delay: Math.random() * 3,
        dur: 2.2 + Math.random() * 2.2,
        dx: (Math.random() - 0.5) * 90,
        size: 4 + Math.random() * 5,
      })),
    [],
  );
  const hue = level === 2 ? 'hue-rotate(170deg)' : level === 3 ? 'hue-rotate(270deg) saturate(1.4)' : undefined;
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" style={{ filter: hue }} aria-hidden="true">
      {embers.slice(0, 10 + level * 6).map((e, i) => (
        <span
          key={i}
          className="ember"
          style={
            {
              left: `${e.left}%`,
              width: e.size,
              height: e.size,
              '--delay': `${e.delay}s`,
              '--t': `${e.dur}s`,
              '--dx': `${e.dx}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

function Game({ deck, onReplay }: { deck: Deck; onReplay: () => void }) {
  const t = useT();
  const navigate = useNavigate();
  const settings = useGame((s) => s.settings);
  const updateSettings = useGame((s) => s.updateSettings);
  const recordAnswer = useGame((s) => s.recordAnswer);
  const finishSession = useGame((s) => s.finishSession);
  const themeId = useGame((s) => s.equipped.theme);
  const theme = cosmetic(themeId) ?? cosmetic('theme-cosmos')!;
  const eligibleForRP = deck.builtin === true;

  const [queue, setQueue] = useState<Question[]>(() => buildSession(deck, useGame.getState().progress, settings.sessionLength));
  const [boosted] = useState(() => eligibleForRP && useGame.getState().boosts > 0);
  const [questsBefore] = useState(() => useGame.getState().quests.items);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [picked, setPicked] = useState<number | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [combo, setCombo] = useState(0);
  const [hudRP, setHudRP] = useState(0);
  const [results, setResults] = useState<boolean[]>([]);
  const [banner, setBanner] = useState<Banner | null>(null);
  const [gain, setGain] = useState<{ rp: number; tier: SpeedTier } | null>(null);
  const [outcome, setOutcome] = useState<SessionOutcome | null>(null);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const answers = useRef<AnswerLog[]>([]);
  const sessionStart = useRef(performance.now());
  const clock = useRef({ qid: '', startedAt: 0, deadline: 0, pausedAt: 0 });
  const advanceTimer = useRef<number | undefined>(undefined);
  const rpRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const live = useRef({ phase, index, queue, combo });
  live.current = { phase, index, queue, combo };

  const q = queue[index];
  const limit = q ? TIME_LIMIT[q.type] : 20_000;
  const fever = combo >= 12 ? 3 : combo >= 8 ? 2 : combo >= 5 ? 1 : 0;

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const glowPulse = (color: string) => {
    const el = glowRef.current;
    if (!el) return;
    el.style.background = `radial-gradient(ellipse at 50% 100%, ${color}, transparent 70%)`;
    animate(el, { opacity: [0, 1, 0], duration: 750, ease: 'out(2)' });
  };

  const finish = (completed: boolean) => {
    window.clearTimeout(advanceTimer.current);
    if (outcome || live.current.phase === 'results') return;
    if (!completed) {
      live.current.phase = 'failed';
      setPhase('failed');
      return;
    }
    if (answers.current.length === 0) {
      navigate('/');
      return;
    }
    live.current.phase = 'results';
    answers.current.forEach((a) =>
      recordAnswer({
        cardKey: a.cardKey,
        correct: a.correct,
        ms: a.ms,
        type: a.type,
        relearn: a.relearn,
        timeout: a.timeout,
        combo: a.combo,
      }),
    );
    const out = finishSession({
      deckId: deck.id,
      answers: answers.current,
      completed,
      bestCombo: Math.max(0, ...answers.current.map((a) => a.combo)),
      boosted,
      durationMs: performance.now() - sessionStart.current,
    });
    setOutcome(out);
    setPhase('results');
  };

  const next = () => {
    window.clearTimeout(advanceTimer.current);
    const { phase, index, queue } = live.current;
    if (phase !== 'feedback') return;
    if (index + 1 >= queue.length) {
      finish(true);
      return;
    }
    live.current.phase = 'question';
    live.current.index = index + 1;
    setIndex(index + 1);
    setPicked(null);
    setTimedOut(false);
    setGain(null);
    setPhase('question');
    sfx.whoosh();
  };

  const answer = async (i: number, timeout = false) => {
    const { phase, queue, index, combo } = live.current;
    const q = queue[index];
    if (phase !== 'question' || !q) return;
    live.current.phase = 'feedback';

    const start = clock.current.startedAt ? clock.current.startedAt - ENTER_MS : performance.now();
    const rawMs = performance.now() - start;
    const ms = timeout ? TIME_LIMIT[q.type] : Math.max(250, Math.round(rawMs));
    const correct = !timeout && i === q.correctIndex;
    const nextCombo = correct ? combo + 1 : 0;
    const relearn = !!q.relearn;
    const rp = eligibleForRP ? answerRP({ correct, ms, type: q.type, combo: nextCombo, relearn, boosted }) : 0;
    const tier = correct && eligibleForRP ? speedTier(ms) : null;

    setPhase('feedback');
    setPicked(timeout ? null : i);
    setTimedOut(timeout);
    setCombo(nextCombo);
    setResults((r) => [...r, correct]);
    setGain(correct ? { rp, tier } : null);
    answers.current.push({ cardKey: q.cardKey, correct, ms, rp, type: q.type, relearn, timeout, combo: nextCombo });
    const btn = i >= 0 ? optionRefs.current[i] : null;

    if (correct) {
      sfx.correct(nextCombo);
      glowPulse('rgba(52,211,153,0.38)');
      if (btn) {
        const c = centerOf(btn);
        burst(c.x, c.y, {
          count: 14 + Math.min(nextCombo, 10) * 2,
          colors: nextCombo >= 5 ? ['#fde047', '#fb923c', '#f472b6', '#ffffff'] : undefined,
        });
        ring(c.x, c.y, '#34d399', 200);
        if (eligibleForRP) {
          floatText(`+${rp}`, c.x, c.y, {
            to: rpRef.current,
            onArrive: () => {
              setHudRP((v) => v + rp);
              pop(rpRef.current, 1.3);
            },
          });
          if (tier === 'lightning') floatText(t('⚡ Zibens!', '⚡ Lightning!'), c.x, c.y - 58, { color: '#67e8f9', size: 18, delay: 90, rise: 40 });
        }
      } else if (eligibleForRP) setHudRP((v) => v + rp);

      let hold = 1050;
      if (eligibleForRP && MILESTONES.includes(nextCombo)) {
        setBanner({ id: Date.now(), text: `COMBO ×${nextCombo}`, sub: `RP ×${comboMultiplier(nextCombo)}`, tone: nextCombo >= 12 ? 'max' : 'combo' });
        sfx.combo(Math.floor(nextCombo / 3));
        shake(stageRef.current, 5, 300);
        hold = 1500;
      }
      if (settings.autoAdvance) advanceTimer.current = window.setTimeout(next, hold);
    } else {
      sfx.wrong();
      await sleep(70); // hit-stop: a tiny freeze makes the mistake land
      if (btn) shake(btn, 12, 420);
      shake(stageRef.current, 7, 380);
      flash();
      glowPulse('rgba(251,113,133,0.32)');
      if (combo >= 3) setBanner({ id: Date.now(), text: t('Combo zaudēts', 'Combo lost'), tone: 'lost' });
      if (!relearn) {
        const card = deck.cards.find((c) => `${deck.id}::${c.id}` === q.cardKey);
        if (card) {
          const retryQ = buildQuestion(deck, card, 'mc', Math.random, true);
          setQueue((list) => {
            const nextList = [...list, retryQ];
            live.current.queue = nextList;
            return nextList;
          });
        }
      }
    }
  };

  const answerRef = useRef(answer);
  answerRef.current = answer;
  const nextRef = useRef(next);
  nextRef.current = next;

  // Question clock (pauses while the quit dialog is open).
  useEffect(() => {
    if (phase !== 'question' || !q) return;
    const c = clock.current;
    const now = performance.now();
    if (c.qid !== q.id) {
      c.qid = q.id;
      c.startedAt = now + ENTER_MS;
      c.deadline = now + ENTER_MS + limit;
      c.pausedAt = 0;
    }
    if (confirmQuit) {
      if (!c.pausedAt) c.pausedAt = now;
      return;
    }
    if (c.pausedAt) {
      const d = now - c.pausedAt;
      c.startedAt += d;
      c.deadline += d;
      c.pausedAt = 0;
    }
    const left = c.deadline - now;
    let tickIv: number | undefined;
    const timeout = window.setTimeout(() => answerRef.current(-1, true), Math.max(0, left));
    const tickStart = window.setTimeout(() => {
      sfx.tick();
      tickIv = window.setInterval(sfx.tick, 1000);
    }, Math.max(0, left - 5000));
    return () => {
      window.clearTimeout(timeout);
      window.clearTimeout(tickStart);
      if (tickIv) window.clearInterval(tickIv);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, q?.id, confirmQuit]);

  // Keyboard: 1–4 answer, ←/→ for true/false, Enter/Space continue, Esc quit.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      const st = useGame.getState();
      if (confirmQuit || st.ceremony || st.openChestId || !st.profile || st.events.some((ev) => ev.type === 'weekly') || e.repeat) {
        return;
      }
      const { phase, queue, index } = live.current;
      const cur = queue[index];
      if (e.key === 'Escape' && (phase === 'question' || phase === 'feedback')) {
        window.clearTimeout(advanceTimer.current);
        setConfirmQuit(true);
        return;
      }
      if (phase === 'question' && cur) {
        const n = Number(e.key);
        if (Number.isInteger(n) && n >= 1 && n <= cur.options.length) {
          e.preventDefault();
          const btn = optionRefs.current[n - 1];
          if (btn) btn.classList.add('pressed');
          setTimeout(() => void answerRef.current(n - 1), 45);
        } else if (cur.type === 'tf' && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
          e.preventDefault();
          const idx = e.key === 'ArrowLeft' ? 0 : 1;
          const btn = optionRefs.current[idx];
          if (btn) btn.classList.add('pressed');
          setTimeout(() => void answerRef.current(idx), 45);
        }
      } else if (phase === 'feedback' && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        nextRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [confirmQuit]);

  const optionState = (i: number): OptionState => {
    if (phase !== 'feedback' || !q) return 'idle';
    if (i === q.correctIndex) return picked === i ? 'correct' : 'reveal';
    if (i === picked) return 'wrong';
    return 'dim';
  };

  const wasCorrect = phase === 'feedback' && !!gain;
  const isLast = index + 1 >= queue.length;
  const typeLabel = !q
    ? ''
    : q.type === 'tf'
      ? t('Patiess vai aplams?', 'True or false?')
      : q.type === 'reverse'
        ? t('Apgrieztā kartīte', 'Reverse card')
        : t('Izvēlies pareizo atbildi', 'Pick the right answer');
  const promptSize = !q
    ? ''
    : q.prompt.length > 70
      ? 'text-2xl sm:text-3xl'
      : q.prompt.length > 28
        ? 'text-3xl sm:text-4xl'
        : 'text-4xl sm:text-6xl';
  const correctText = !q
    ? ''
    : q.type === 'tf'
      ? q.correctIndex === 0
        ? t('Patiess', 'True')
        : `${t('Aplams (patiesā atbilde:', 'False (correct answer:')} ${q.answer})`
      : q.options[q.correctIndex];

  return (
    <div className="relative z-10 flex min-h-dvh flex-col overflow-x-hidden">
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-700"
        style={{ opacity: fever ? 0.55 + fever * 0.15 : 0, background: FEVER_BG[fever] }}
      />
      {fever > 0 && <Embers level={fever} />}

      <GameHUD
        total={queue.length}
        results={results}
        active={phase === 'question'}
        rp={hudRP}
        rpRef={rpRef}
        combo={combo}
        boosted={boosted}
        sound={settings.sound}
        onToggleSound={() => updateSettings({ sound: !settings.sound })}
        onQuit={() => {
          window.clearTimeout(advanceTimer.current);
          setConfirmQuit(true);
        }}
      />

      <div ref={stageRef} className="relative flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:items-center sm:pt-0">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait">
            {q && (phase === 'question' || phase === 'feedback') && (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, x: 90, rotate: 3, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, x: -100, rotate: -4, scale: 0.95, transition: { duration: 0.2, ease: 'easeIn' } }}
                transition={{ type: 'spring', stiffness: 260, damping: 26 }}
              >
                <div
                  className={cn('relative rounded-[30px] border p-6 sm:p-9', theme.animated && 'theme-animated')}
                  style={{
                    background: theme.bg,
                    borderColor: `${theme.accent}55`,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.16), 0 2px 0 rgba(0,0,0,0.35), 0 34px 90px -34px ${theme.accent}99`,
                  }}
                >
                  {/* lighting: grain, a soft accent bloom and a top sheen */}
                  <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden="true">
                    <div className="noise-overlay absolute inset-0" />
                    <div className="absolute -right-20 -top-24 size-72 rounded-full opacity-25 blur-3xl" style={{ background: theme.accent }} />
                    <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/[0.08] to-transparent" />
                  </div>
                  {fever > 0 && <div className="spin-border" style={FEVER_BORDER[fever]} />}
                  <div ref={glowRef} className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0" />
                  <div className="relative flex flex-wrap items-center gap-2 text-[13px]">
                    <span
                      className="inline-flex items-center gap-2 rounded-full px-3 py-1 font-bold"
                      style={{ color: theme.accent, background: `${theme.accent}1c`, boxShadow: `inset 0 0 0 1px ${theme.accent}55` }}
                    >
                      <span className="size-1.5 rounded-full" style={{ background: theme.accent, boxShadow: `0 0 8px ${theme.accent}` }} />
                      {typeLabel}
                    </span>
                    {q.relearn && (
                      <span className="tint rounded-full px-3 py-1 font-bold [--c:#fbbf24]">{t('Atkārtojums · ½ RP', 'Retry · ½ RP')}</span>
                    )}
                    <span className="ml-auto rounded-full bg-black/25 px-3 py-1 font-bold tabular text-white/75 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
                      {index + 1} / {queue.length}
                    </span>
                  </div>

                  {q.ask && <p className="relative mt-7 text-base font-medium text-white/70 sm:text-lg">{q.ask}</p>}
                  <h1 className={cn('relative font-bold leading-tight tracking-[-0.02em] text-balance', q.ask ? 'mt-2' : 'mt-7', promptSize)}>{q.prompt}</h1>
                  {q.type === 'tf' && (
                    <div className="relative mt-5 inline-flex max-w-full items-center gap-3 rounded-2xl bg-black/30 px-5 py-3 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),inset_0_2px_8px_rgba(0,0,0,0.3)]">
                      <ArrowRight className="size-6 shrink-0" style={{ color: theme.accent }} />
                      <span className="text-2xl font-bold sm:text-3xl">{q.statement}</span>
                    </div>
                  )}

                  <div className="relative mt-8 h-3 overflow-hidden rounded-full well">
                    <div
                      key={q.id}
                      className={cn('timer-fill h-full rounded-full', (phase !== 'question' || confirmQuit) && 'paused')}
                      style={{ '--dur': `${limit}ms`, '--delay': `${ENTER_MS}ms` } as CSSProperties}
                    />
                  </div>
                </div>

                <div className={cn('mt-6 grid gap-3.5', q.type === 'tf' ? 'grid-cols-2' : 'sm:grid-cols-2')}>
                  {q.options.map((opt, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 18, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.1 + i * 0.07, type: 'spring', stiffness: 400, damping: 28 }}
                    >
                      <AnswerButton
                        ref={(el) => {
                          optionRefs.current[i] = el;
                        }}
                        label={q.type === 'tf' ? (i === 0 ? t('Patiess', 'True') : t('Aplams', 'False')) : opt}
                        hint={String(i + 1)}
                        state={optionState(i)}
                        disabled={phase !== 'question'}
                        onClick={() => void answer(i)}
                        tf={q.type === 'tf' ? (i === 0 ? 'true' : 'false') : undefined}
                      />
                    </motion.div>
                  ))}
                </div>

                <AnimatePresence>
                  {phase === 'feedback' && (
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                      className={cn(
                        'tint-surface mt-6 flex flex-col gap-4 rounded-card p-5 sm:flex-row sm:items-center',
                        wasCorrect ? '[--c:var(--color-good)]' : '[--c:var(--color-bad)]',
                      )}
                      role="status"
                    >
                      <span
                        className={cn(
                          'hidden size-12 shrink-0 place-items-center rounded-2xl sm:grid',
                          wasCorrect
                            ? 'bg-emerald-300 text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_3px_0_#047857,0_0_24px_-4px_rgba(52,211,153,0.7)]'
                            : 'bg-rose-300 text-rose-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_3px_0_#9f1239,0_0_24px_-4px_rgba(251,113,133,0.6)]',
                        )}
                        aria-hidden="true"
                      >
                        {wasCorrect ? <Check className="size-6" strokeWidth={3} /> : <X className="size-6" strokeWidth={3} />}
                      </span>
                      <div className="min-w-0 flex-1">
                        {wasCorrect ? (
                          <div className="flex flex-wrap items-center gap-2 font-display text-xl font-bold tracking-[-0.02em] text-emerald-300">
                            {t('Pareizi!', 'Correct!')}
                            {eligibleForRP && gain && (
                              <>
                                <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-base text-amber-200 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.3)]">
                                  +{gain.rp} RP
                                </span>
                                {gain.tier === 'lightning' && (
                                  <span className="rounded-full bg-cyan-400/15 px-2.5 py-0.5 text-sm text-cyan-200 shadow-[inset_0_0_0_1px_rgba(34,211,238,0.3)]">
                                    {t('⚡ Zibens +5', '⚡ Lightning +5')}
                                  </span>
                                )}
                                {gain.tier === 'fast' && (
                                  <span className="rounded-full bg-sky-400/15 px-2.5 py-0.5 text-sm text-sky-200 shadow-[inset_0_0_0_1px_rgba(56,189,248,0.3)]">
                                    {t('Ātri +3', 'Fast +3')}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <>
                            <div className="font-display text-xl font-bold tracking-[-0.02em] text-rose-300">
                              {timedOut ? t('Laiks beidzās!', "Time's up!") : t('Nepareizi', 'Not quite')}
                            </div>
                            <p className="mt-1 text-[17px]">
                              {t('Pareizā atbilde:', 'Correct answer:')} <strong className="text-emerald-300">{correctText}</strong>
                            </p>
                          </>
                        )}
                        {q.explanation && (!wasCorrect || !settings.autoAdvance) && (
                          <p className="mt-2 flex gap-2 text-[15px] text-muted">
                            <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-300" />
                            {q.explanation}
                          </p>
                        )}
                        {!wasCorrect && !q.relearn && (
                          <p className="mt-2 text-sm text-dim">{t('Šī kartīte vēlreiz parādīsies sesijas beigās.', 'This card will come back at the end of the session.')}</p>
                        )}
                      </div>
                      {(!wasCorrect || !settings.autoAdvance) && (
                        <Button
                          variant={wasCorrect ? 'success' : 'primary'}
                          size="lg"
                          onClick={next}
                          autoFocus
                          iconRight={<CornerDownLeft className="size-4 opacity-70" />}
                        >
                          {isLast ? t('Rezultāti', 'Results') : t('Turpināt', 'Continue')}
                        </Button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ComboBanner banner={banner} />

      <AnimatePresence>
        {phase === 'intro' && (
          <Countdown
            key="countdown"
            deck={deck}
            boosted={boosted}
            onDone={() => {
              live.current.phase = 'question';
              setPhase('question');
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'results' && outcome && <SessionResults key="results" outcome={outcome} deck={deck} questsBefore={questsBefore} onReplay={onReplay} />}
      </AnimatePresence>

      <AnimatePresence>
        {phase === 'failed' && (
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950 p-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="w-full max-w-md rounded-[28px] glass p-8 text-center"
              initial={{ opacity: 0, y: 18, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
            >
              <h1 className="font-display text-3xl font-extrabold">{t('Spēle neizdevās', 'Game failed')}</h1>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Button variant="primary" icon={<RotateCcw className="size-4" />} onClick={onReplay}>
                  {t('Spēlēt vēlreiz', 'Play again')}
                </Button>
                <Button variant="secondary" icon={<House className="size-4" />} onClick={() => navigate('/')}>
                  {t('Uz sākumu', 'Home')}
                </Button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={confirmQuit}
        title={t('Pamest sesiju?', 'Leave the session?')}
        message={t('Spēle tiks atzīmēta kā neizdevusies, un progress vai balvas netiks saglabātas.', 'The game will be marked as failed, and no progress or rewards will be saved.')}
        confirmLabel={t('Pamest', 'Leave')}
        cancelLabel={t('Turpināt spēli', 'Keep playing')}
        danger
        onCancel={() => setConfirmQuit(false)}
        onConfirm={() => {
          setConfirmQuit(false);
          finish(false);
        }}
      />
    </div>
  );
}
