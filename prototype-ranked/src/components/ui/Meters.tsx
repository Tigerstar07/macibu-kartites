import { useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { countUp } from '../../lib/fx';
import { clamp } from '../../lib/random';

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Outlined progress bar with a striped fill. `height` is the fill height;
 * the 2px ink outline sits around it. (`glow` is accepted for API
 * compatibility — flat design needs no glow.)
 */
export function ProgressBar({
  value,
  from,
  className,
  fill = 'var(--color-brand)',
  height = 10,
  delay = 0,
  duration = 1,
}: {
  value: number;
  /** Start the fill from here instead of 0. */
  from?: number;
  className?: string;
  fill?: string;
  glow?: string | null;
  height?: number;
  delay?: number;
  duration?: number;
}) {
  return (
    <div className={cn('relative overflow-hidden rounded-full border-2 border-ink bg-paper-2', className)} style={{ height: height + 4 }}>
      <motion.div
        className={cn('absolute inset-y-0 left-0 rounded-full', value > 0 && 'border-r-2 border-ink')}
        style={{ background: fill }}
        initial={{ width: `${clamp(from ?? 0, 0, 1) * 100}%` }}
        animate={{ width: `${clamp(value, 0, 1) * 100}%` }}
        transition={{ duration, delay, ease: EASE }}
      >
        <div className="stripes absolute inset-0 rounded-full" />
      </motion.div>
    </div>
  );
}

export function Ring({
  value,
  size = 64,
  stroke = 7,
  color = 'var(--color-good)',
  track = 'oklch(0.2 0.022 285 / 0.12)',
  delay = 0,
  className,
  children,
}: {
  value: number;
  size?: number;
  stroke?: number;
  color?: string;
  track?: string;
  delay?: number;
  className?: string;
  children?: ReactNode;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn('relative grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90 overflow-visible">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" style={{ stroke: track }} />
        {/* the svg is rotated -90°, so (-x, +y) here lands bottom-right on screen */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - clamp(value, 0, 1)) }}
          transition={{ duration: 1.1, delay, ease: EASE }}
          style={{ stroke: color, filter: 'drop-shadow(-1.5px 1.5px 0 var(--color-ink))' }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}

/** Number that counts from its previous value to the new one with anime.js. */
export function Counter({
  value,
  format = (n: number) => String(Math.round(n)),
  duration = 800,
  delay = 0,
  from,
  className,
  onTick,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  delay?: number;
  /** Count from this value on first mount. */
  from?: number;
  className?: string;
  onTick?: () => void;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(from ?? value);
  const [initial] = useState(() => format(from ?? value));
  const fmt = useRef(format);
  fmt.current = format;

  useEffect(() => {
    const start = prev.current;
    prev.current = value;
    const anim = countUp(ref.current, start, value, { duration, delay, format: (n) => fmt.current(n), onTick });
    return () => {
      anim?.pause();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Re-format in place when the formatter changes (e.g. language switch).
  useEffect(() => {
    if (ref.current) ref.current.textContent = format(prev.current);
  }, [format]);

  return (
    <span ref={ref} className={cn('tabular', className)}>
      {initial}
    </span>
  );
}
