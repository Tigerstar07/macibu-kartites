import type { CSSProperties, ReactNode } from 'react';
import { cosmetic } from '../../lib/cosmetics';
import { cn } from '../../lib/cn';

/** Below this size only the ring itself animates: extra particles would just be noise. */
const DETAIL_MIN = 44;

const HAS_GLINT = new Set(['metal', 'breathe', 'void']);

function Extras({ fx }: { fx: string }): ReactNode {
  switch (fx) {
    case 'prism':
      return (
        <>
          <span className="af-star a" />
          <span className="af-star b" />
        </>
      );
    case 'ember':
      return (
        <>
          <span className="af-spark" style={{ '--l': '30%', '--d': '0s', '--x': '-0.06' } as CSSProperties} />
          <span className="af-spark" style={{ '--l': '52%', '--d': '0.9s', '--x': '0.05' } as CSSProperties} />
          <span className="af-spark" style={{ '--l': '70%', '--d': '1.7s', '--x': '0.1' } as CSSProperties} />
        </>
      );
    case 'orbit':
      return (
        <>
          <span className="af-orbit" />
          <span className="af-orbit b" />
        </>
      );
    case 'glitch':
      return (
        <>
          <span className="af-ghost c" />
          <span className="af-ghost m" />
        </>
      );
    default:
      return null;
  }
}

/**
 * Emoji avatar sticker: coloured disc, equipped frame ring, ink outline.
 * Frames are pure CSS (see `fx-*` in index.css): they move on their own and
 * flare when hovered.
 */
export function Avatar({
  avatar,
  hue,
  frame = 'frame-none',
  size = 44,
  className,
}: {
  avatar: string;
  hue: number;
  frame?: string;
  size?: number;
  className?: string;
}) {
  const f = cosmetic(frame);
  const fx = f?.fx;
  const detailed = size >= DETAIL_MIN && !!fx;
  const inset = Math.max(3, Math.round(size * 0.085));
  const shadow = size >= 64 ? '4px 4px' : '2px 2px';
  const ring = f?.ring && frame !== 'frame-none' ? f.ring : 'var(--color-card)';
  return (
    <div
      className={cn('avatar-frame relative shrink-0 rounded-full', fx && `fx-${fx}`, className)}
      style={
        {
          width: size,
          height: size,
          boxShadow: `0 0 0 2px var(--color-ink), ${shadow} 0 2px var(--color-ink)`,
          '--sz': `${size}px`,
          '--ring': ring,
          '--ac': f?.accent ?? '#a78bfa',
        } as CSSProperties
      }
    >
      {detailed && <span className="af-glow" />}
      <div className="af-ring absolute inset-0 rounded-full" />
      {fx && HAS_GLINT.has(fx) && <span className="af-glint" />}
      {detailed && fx && <Extras fx={fx} />}
      <div
        className="absolute grid place-items-center rounded-full border-2 border-ink"
        style={{
          inset,
          background: `radial-gradient(circle at 30% 25%, hsl(${hue} 95% 84%), hsl(${hue} 80% 68%) 62%, hsl(${hue} 70% 58%))`,
        }}
      >
        <span style={{ fontSize: size * 0.46, lineHeight: 1 }} aria-hidden="true">
          {avatar}
        </span>
      </div>
    </div>
  );
}
