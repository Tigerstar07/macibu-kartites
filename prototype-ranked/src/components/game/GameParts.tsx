import { forwardRef, useEffect, useRef, useState, type RefObject } from 'react';
import { motion } from 'motion/react';
import { animate, createTimeline } from 'animejs';
import { Check, Flame, Volume2, VolumeX, X } from 'lucide-react';
import type { Deck } from '../../types';
import { comboMultiplier } from '../../lib/rp';
import { prefersReducedMotion } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { useNumFmt, useT } from '../../lib/i18n';
import { cn } from '../../lib/cn';
import { Counter } from '../ui/Meters';
import { BoostIcon, DECK_ICONS, RPIcon } from '../ui/Icons';

const HUD_BUTTON = 'tactile grid size-11 shrink-0 place-items-center rounded-xl bg-card text-ink';

// ── HUD ─────────────────────────────────────────────────────────────────

export function GameHUD({
  total,
  results,
  active,
  rp,
  rpRef,
  combo,
  boosted,
  rankMultiplier,
  sound,
  onToggleSound,
  onQuit,
}: {
  total: number;
  results: boolean[];
  active: boolean;
  rp: number;
  rpRef: RefObject<HTMLSpanElement>;
  combo: number;
  boosted: boolean;
  rankMultiplier: number;
  sound: boolean;
  onToggleSound: () => void;
  onQuit: () => void;
}) {
  const t = useT();
  const fmt = useNumFmt();
  const mult = comboMultiplier(combo);
  const hot = combo >= 3;

  return (
    <header className="relative z-20 flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-6 sm:py-4">
      <button type="button" onClick={onQuit} className={HUD_BUTTON} aria-label={t('Pamest sesiju', 'Leave session')}>
        <X className="size-5" strokeWidth={2.6} />
      </button>

      <div
        className="flex min-w-0 flex-1 items-center gap-1 sm:gap-1.5"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={results.length}
      >
        {Array.from({ length: total }, (_, i) => {
          const r = results[i];
          const current = i === results.length && active;
          return (
            <motion.div
              key={i}
              layout
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ delay: Math.min(i, 20) * 0.025, type: 'spring', stiffness: 300, damping: 26 }}
              className={cn(
                'h-4 flex-1 origin-left rounded-md border-2 border-ink transition-colors duration-300',
                r === true ? 'bg-good' : r === false ? 'bg-bad' : current ? 'stripes bg-acid' : 'bg-card',
              )}
            />
          );
        })}
      </div>

      {boosted && (
        <div className="tint hidden h-11 items-center gap-1.5 rounded-xl px-3 font-mono text-sm font-bold shadow-hard-sm md:flex [--c:var(--color-info)]">
          <BoostIcon size={18} />
          ×1.5
        </div>
      )}

      {rankMultiplier !== 1 && (
        <div className="hidden h-11 items-center rounded-xl border-2 border-ink bg-card px-2.5 font-mono text-sm font-bold shadow-hard-sm sm:flex">
          RP ×{rankMultiplier}
        </div>
      )}

      <div
        className={cn(
          'flex h-11 items-center gap-1.5 rounded-xl border-2 border-ink px-2.5 font-mono font-bold shadow-hard-sm transition-colors duration-300 sm:px-3',
          combo >= 5 ? 'stripes bg-streak text-ink' : hot ? 'bg-streak-soft text-ink' : 'bg-card text-dim',
        )}
        aria-label={`Combo ${combo}`}
      >
        <Flame className={cn('size-5', hot && 'animate-flicker fill-gold text-ink')} strokeWidth={2.4} />
        <motion.span
          key={combo}
          initial={{ scale: 1.8, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 18 }}
          className="tabular"
        >
          ×{combo}
        </motion.span>
        {mult > 1 && <span className="hidden rounded-md border-2 border-ink bg-card px-1.5 text-[11px] sm:inline">RP ×{mult}</span>}
      </div>

      <div className="flex h-11 items-center gap-2 rounded-xl border-2 border-ink bg-card pl-2.5 pr-3.5 shadow-hard-sm">
        <RPIcon size={22} />
        <span ref={rpRef} className="inline-block font-mono text-lg font-bold">
          <Counter value={rp} format={fmt} duration={450} />
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleSound}
        className={cn(HUD_BUTTON, 'hidden sm:grid')}
        aria-label={sound ? t('Izslēgt skaņu', 'Mute') : t('Ieslēgt skaņu', 'Unmute')}
      >
        {sound ? <Volume2 className="size-5" strokeWidth={2.4} /> : <VolumeX className="size-5" strokeWidth={2.4} />}
      </button>
    </header>
  );
}

// ── Answer option ───────────────────────────────────────────────────────

export type OptionState = 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim';

/** Each option slot has its own flat colour, quiz-show style. */
const SLOT_FILL = ['bg-brand-soft', 'bg-info-soft', 'bg-gold-soft', 'bg-candy-soft'];

/**
 * Answer keys: they lift on hover, sink into their hard shadow when
 * pressed, and the one you picked stays pressed in while feedback shows.
 */
const OPTION_STYLE: Record<OptionState, string> = {
  idle: 'hover:brightness-[1.04]',
  correct: 'pressed !bg-good',
  wrong: 'pressed !bg-bad',
  reveal: '!bg-good-soft',
  dim: '!bg-paper-2 opacity-45 [--lift:1px]',
};

const HINT = 'grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink bg-card font-mono text-sm font-bold text-ink shadow-[0_2px_0_0_var(--color-ink)]';

export const AnswerButton = forwardRef<
  HTMLButtonElement,
  { label: string; hint: string; state: OptionState; disabled: boolean; onClick: () => void; tf?: 'true' | 'false' }
>(function AnswerButton({ label, hint, state, disabled, onClick, tf }, ref) {
  const marked = state === 'correct' || state === 'reveal';
  const slot = (Number(hint) - 1) % SLOT_FILL.length;
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'tactile group relative flex min-h-[80px] w-full items-center gap-4 rounded-2xl px-4 py-4 text-left text-ink [--lift:5px] disabled:cursor-default touch-manipulation select-none transition-transform active:scale-[0.985] sm:px-5',
        SLOT_FILL[slot >= 0 ? slot : 0],
        OPTION_STYLE[state],
        tf && 'justify-center sm:min-h-[104px]',
      )}
    >
      <span className={HINT} aria-hidden="true">
        {marked ? <Check className="size-5" strokeWidth={3.2} /> : state === 'wrong' ? <X className="size-5" strokeWidth={3.2} /> : hint}
      </span>
      <span className={cn('leading-snug', tf ? 'font-display text-2xl font-extrabold tracking-[-0.03em] sm:text-3xl' : 'flex-1 text-lg font-bold sm:text-xl')}>
        {label}
      </span>
    </button>
  );
});

// ── Combo banner ────────────────────────────────────────────────────────

export interface Banner {
  id: number;
  text: string;
  sub?: string;
  tone: 'combo' | 'lost' | 'max';
}

const BANNER_TEXT: Record<Banner['tone'], React.CSSProperties> = {
  combo: { color: 'var(--color-gold)' },
  max: {
    background: 'linear-gradient(90deg,#ff5a4e,#ffd026,#3fdb7a,#62c2ff,#9b7bff,#ff8cc6)',
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    color: 'transparent',
  },
  lost: { color: 'var(--color-card)' },
};

/** Slanted "COMBO ×5!" sticker slammed across an ink band. */
export function ComboBanner({ banner }: { banner: Banner | null }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !banner) return;
    if (prefersReducedMotion()) {
      el.style.opacity = '1';
      const timer = setTimeout(() => (el.style.opacity = '0'), 900);
      return () => clearTimeout(timer);
    }
    const lost = banner.tone === 'lost';
    const tl = createTimeline();
    tl.add(el, {
      opacity: [0, 1],
      scale: lost ? [0.6, 1] : [2.6, 1],
      rotate: lost ? [0, -3] : [-16, -7],
      duration: lost ? 220 : 260,
      ease: 'out(4)',
    })
      .add(el, { scale: lost ? 1 : [1, 1.07], y: lost ? [0, 18] : 0, duration: lost ? 420 : 520, ease: 'inOut(2)' })
      .add(el, { opacity: 0, scale: lost ? 0.9 : 1.25, y: lost ? 40 : -30, duration: 260, ease: 'in(2)' });
    return () => {
      tl.revert();
    };
  }, [banner]);

  if (!banner) return null;
  const lost = banner.tone === 'lost';
  return (
    <div className="pointer-events-none fixed inset-0 z-[60] grid place-items-center" aria-live="polite">
      <div ref={ref} className="relative px-4 text-center opacity-0">
        <div
          className={cn(
            'absolute inset-x-[-40vw] top-1/2 h-[64%] -translate-y-1/2 border-y-[3px] border-ink',
            lost ? 'bg-paper-3' : 'bg-ink stripes',
          )}
        />
        <div
          className={cn(
            'stroke-text relative font-display font-extrabold italic tracking-[-0.05em] [--stroke:8px]',
            lost ? 'text-4xl sm:text-6xl' : 'text-6xl sm:text-8xl',
          )}
          style={{ ...BANNER_TEXT[banner.tone], filter: 'drop-shadow(6px 6px 0 var(--color-ink))' }}
        >
          {banner.text}
        </div>
        {banner.sub && (
          <div className="relative mt-3 inline-block rounded-lg border-2 border-ink bg-acid px-3 py-0.5 font-mono text-lg font-bold text-ink shadow-hard-sm sm:text-xl">
            {banner.sub}
          </div>
        )}
      </div>
    </div>
  );
}

// ── 3-2-1 countdown ─────────────────────────────────────────────────────

function Key({ children }: { children: string }) {
  return <kbd className="keycap h-8 min-w-8 px-2 text-xs">{children}</kbd>;
}

export function Countdown({ deck, boosted, onDone }: { deck: Deck; boosted: boolean; onDone: () => void }) {
  const t = useT();
  const [n, setN] = useState(3);
  const numRef = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const finish = () => {
    if (done.current) return;
    done.current = true;
    onDone();
  };

  useEffect(() => {
    if (n < 0) {
      finish();
      return;
    }
    sfx.countdown(n === 0);
    const el = numRef.current;
    const a = el && !prefersReducedMotion() ? animate(el, { scale: [2.4, 1], opacity: [0, 1], duration: 420, ease: 'out(4)' }) : null;
    const timer = setTimeout(() => setN((v) => v - 1), n === 0 ? 520 : 640);
    return () => {
      clearTimeout(timer);
      a?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n]);

  const Icon = DECK_ICONS[deck.icon];
  return (
    <motion.div
      className="fixed inset-0 z-40 grid cursor-pointer place-items-center overflow-hidden bg-paper/85 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      onClick={finish}
    >
      <div className="sunburst pointer-events-none absolute left-1/2 top-1/2 size-[140vmax] -translate-x-1/2 -translate-y-1/2 animate-spin-slower [--ray:oklch(0.2_0.022_285/0.07)]" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 rounded-full border-2 border-ink bg-card py-1.5 pl-1.5 pr-5 shadow-hard"
        >
          <div className="grid size-11 place-items-center rounded-full border-2 border-ink text-ink" style={{ backgroundColor: `hsl(${deck.hue} 88% 72%)` }}>
            <Icon className="size-5" strokeWidth={2.4} />
          </div>
          <div className="text-left">
            <div className="eyebrow text-[10px] text-brand">Ranked</div>
            <div className="font-display text-lg font-extrabold leading-tight tracking-[-0.03em]">{deck.title}</div>
          </div>
        </motion.div>
        <div className="relative mt-10 grid size-56 place-items-center">
          <div key={`r${n}`} className="cd-ring absolute inset-0 rounded-full border-4 border-ink" />
          <div className="absolute inset-3 rounded-full border-[3px] border-ink bg-gold shadow-hard-lg" />
          <div className="halftone absolute inset-3 rounded-full opacity-60" />
          <div
            ref={numRef}
            key={`n${n}`}
            className={cn(
              'relative font-display font-extrabold tracking-[-0.05em] text-ink',
              n > 0 ? 'text-8xl sm:text-9xl' : 'text-4xl sm:text-5xl',
            )}
          >
            {n > 0 ? n : t('Aiziet!', 'Go!')}
          </div>
        </div>
        {boosted && (
          <div className="tint mt-9 flex items-center gap-2 rounded-xl px-4 py-2 font-bold shadow-hard-sm [--c:var(--color-info)]">
            <BoostIcon size={20} />
            {t('RP pastiprinājums aktīvs: ×1,5', 'RP boost active: ×1.5')}
          </div>
        )}
        <p className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-bold text-muted">
          <span className="flex items-center gap-2">
            <Key>1–4</Key> {t('atbildēt', 'answer')}
          </span>
          <span className="flex items-center gap-2">
            <Key>Enter</Key> {t('turpināt', 'continue')}
          </span>
          <span className="flex items-center gap-2">
            <Key>Esc</Key> {t('iziet', 'exit')}
          </span>
        </p>
      </div>
    </motion.div>
  );
}
