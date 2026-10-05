import { forwardRef, useId, type CSSProperties } from 'react';
import type { Rarity } from '../../types';
import { cn } from '../../lib/cn';

/** Sticker outline colour (SVG attributes cannot read CSS variables). */
const INK = '#1c1a27';

const PALETTE: Record<Rarity, { b1: string; b2: string; metal1: string; metal2: string; glow: string; gem: string }> = {
  common: { b1: '#b8763a', b2: '#6b3d17', metal1: '#e2e8f0', metal2: '#64748b', glow: 'rgba(203,213,225,0.5)', gem: '#e2e8f0' },
  rare: { b1: '#3b8fe8', b2: '#173f7a', metal1: '#e0f2fe', metal2: '#5b8bb5', glow: 'rgba(56,189,248,0.6)', gem: '#7dd3fc' },
  epic: { b1: '#a855f7', b2: '#4c1d95', metal1: '#fae8ff', metal2: '#a36bc4', glow: 'rgba(192,132,252,0.65)', gem: '#f0abfc' },
  legendary: { b1: '#f7c548', b2: '#9a5b00', metal1: '#fffbeb', metal2: '#c28a17', glow: 'rgba(251,191,36,0.75)', gem: '#fef3c7' },
};

const STAR = 'M0 -7 L1.8 -1.8 L7 0 L1.8 1.8 L0 7 L-1.8 1.8 L-7 0 L-1.8 -1.8Z';

interface Props {
  rarity: Rarity;
  size?: number;
  glow?: boolean;
  /** Adds living detail (pulsing gem, glints) for hero placements; leave off for small icons. */
  fancy?: boolean;
  className?: string;
}

/**
 * SVG treasure chest. The lid is its own group (.chest-lid) so it can be
 * animated open; `.chest-seam` is the light that leaks out as it charges up.
 */
export const ChestIcon = forwardRef<SVGSVGElement, Props>(function ChestIcon({ rarity, size = 96, glow = true, fancy = false, className }, ref) {
  const id = useId().replace(/:/g, '');
  const p = PALETTE[rarity];
  const jewelled = rarity === 'legendary' || rarity === 'epic';
  return (
    <svg
      ref={ref}
      viewBox="0 0 120 112"
      width={size}
      height={(size * 112) / 120}
      className={cn('overflow-visible', className)}
      style={
        glow
          ? { filter: `drop-shadow(${Math.max(2, Math.round(size * 0.035))}px ${Math.max(2, Math.round(size * 0.035))}px 0 var(--color-ink))` }
          : undefined
      }
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.b1} />
          <stop offset="1" stopColor={p.b2} />
        </linearGradient>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.metal1} />
          <stop offset="1" stopColor={p.metal2} />
        </linearGradient>
        <radialGradient id={`${id}-inside`} cx="0.5" cy="1" r="0.8">
          <stop offset="0" stopColor="#fff8d6" />
          <stop offset="0.5" stopColor={p.gem} stopOpacity="0.6" />
          <stop offset="1" stopColor={p.b2} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* inner glow, revealed when the lid lifts */}
      <ellipse className="chest-inside" cx="60" cy="52" rx="42" ry="10" fill={`url(#${id}-inside)`} opacity="0" />

      {/* body */}
      <rect x="12" y="50" width="96" height="54" rx="9" fill={`url(#${id}-body)`} stroke={INK} strokeWidth="4" />
      <rect x="12" y="50" width="96" height="9" rx="4" fill={`url(#${id}-metal)`} opacity="0.95" />
      <rect x="26" y="50" width="9" height="54" fill={`url(#${id}-metal)`} opacity="0.9" />
      <rect x="85" y="50" width="9" height="54" fill={`url(#${id}-metal)`} opacity="0.9" />
      <rect x="12" y="97" width="96" height="7" rx="3.5" fill={p.b2} opacity="0.7" />
      <path d="M16 62 H104" stroke="#000" strokeOpacity="0.18" strokeWidth="2" />
      {/* rivets */}
      {[30.5, 89.5].map((x) => (
        <g key={x}>
          <circle cx={x} cy="71" r="2" fill={p.metal2} stroke={INK} strokeWidth="1" />
          <circle cx={x} cy="91" r="2" fill={p.metal2} stroke={INK} strokeWidth="1" />
        </g>
      ))}

      {/* lock */}
      <rect x="50" y="56" width="20" height="24" rx="4" fill={`url(#${id}-metal)`} stroke={INK} strokeWidth="2.5" />
      <circle cx="60" cy="65" r="3.2" fill={p.b2} />
      <rect x="58.6" y="66" width="2.8" height="7" rx="1.4" fill={p.b2} />

      {/* lid */}
      <g className="chest-lid" style={{ transformBox: 'fill-box', transformOrigin: '50% 100%' }}>
        <path
          d="M12 52 V40 C12 18 34 10 60 10 C86 10 108 18 108 40 V52 Z"
          fill={`url(#${id}-body)`}
          stroke={INK}
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path d="M12 52 V40 C12 18 34 10 60 10 C86 10 108 18 108 40 V52 Z" fill="#fff" opacity="0.1" />
        <path d="M26 52 V25 C28 20 31 17 35 15.5 V52 Z" fill={`url(#${id}-metal)`} opacity="0.9" />
        <path d="M94 52 V25 C92 20 89 17 85 15.5 V52 Z" fill={`url(#${id}-metal)`} opacity="0.9" />
        <rect x="12" y="45" width="96" height="8" rx="3" fill={`url(#${id}-metal)`} stroke={INK} strokeWidth="2.5" />
        {jewelled && (
          <path
            className={fancy ? 'chest-gem' : undefined}
            d="M60 18 L66 27 L60 36 L54 27 Z"
            fill={p.gem}
            stroke={INK}
            strokeWidth="2"
            strokeLinejoin="round"
          />
        )}
        {rarity === 'legendary' && (
          <path d="M47 12 L49 2 L55 8 L60 -1 L65 8 L71 2 L73 12 Z" fill={`url(#${id}-metal)`} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />
        )}
        <path d="M22 30 C30 20 44 15 60 14" stroke="#fff" strokeOpacity="0.35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>

      {/* light leaking from the seam as the chest charges up */}
      <rect
        className="chest-seam"
        x="14"
        y="50"
        width="92"
        height="3.2"
        rx="1.6"
        fill="#fff8d6"
        opacity="0"
        style={{ filter: `drop-shadow(0 0 5px ${p.gem}) drop-shadow(0 0 10px ${p.gem})` }}
      />

      {fancy && jewelled && (
        <>
          <g transform="translate(6 18)"><path className="chest-sparkle" d={STAR} fill="#fff" style={{ '--d': '0s' } as CSSProperties} /></g>
          <g transform="translate(112 30)"><path className="chest-sparkle" d={STAR} fill={p.gem} style={{ '--d': '0.9s' } as CSSProperties} /></g>
          <g transform="translate(96 4)"><path className="chest-sparkle" d={STAR} fill="#fff" style={{ '--d': '1.7s' } as CSSProperties} /></g>
        </>
      )}
    </svg>
  );
});
