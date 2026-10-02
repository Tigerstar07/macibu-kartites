import { cosmetic } from '../../lib/cosmetics';
import { cn } from '../../lib/cn';

/** Emoji avatar sticker: coloured disc, equipped frame ring, ink outline. */
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
  const inset = Math.max(3, Math.round(size * 0.085));
  const shadow = size >= 64 ? '4px 4px' : '2px 2px';
  return (
    <div
      className={cn('relative shrink-0 rounded-full', className)}
      style={{ width: size, height: size, boxShadow: `0 0 0 2px var(--color-ink), ${shadow} 0 2px var(--color-ink)` }}
    >
      <div
        className={cn('absolute inset-0 rounded-full', f?.animated && 'ring-spin')}
        style={{ background: f?.ring && frame !== 'frame-none' ? f.ring : 'var(--color-card)' }}
      />
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
