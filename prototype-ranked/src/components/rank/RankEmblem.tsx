import { useId } from 'react';
import { rankAt, type LeagueId } from '../../lib/rank';
import { cn } from '../../lib/cn';

const SHIELD = 'M60 14 L94 26 V58 C94 80 79 95 60 106 C41 95 26 80 26 58 V26 Z';
const SHIELD_IN = 'M60 22 L87 31.5 V58 C87 76 75 88.5 60 97.5 C45 88.5 33 76 33 58 V31.5 Z';
const HEX = 'M60 10 L95 30 V78 L60 108 L25 78 V30 Z';
const HEX_IN = 'M60 18.5 L88 34.5 V74 L60 99 L32 74 V34.5 Z';
const GEM = 'M60 110 L18 48 L35 20 H85 L102 48 Z';
const GEM_IN = 'M60 99 L27 49 L40 27 H80 L93 49 Z';
const WING = [
  'M28 34 C16 34 8 28 3 19 C12 23 20 24 28 23 Z',
  'M28 47 C15 48 6 43 0 34 C9 37 18 37 28 35 Z',
  'M29 60 C17 62 8 58 2 50 C11 52 19 52 29 48 Z',
];
const CROWN = 'M44 17 L47 4 L54 11 L60 0 L66 11 L73 4 L76 17 Z';
/** Sticker outline colour (SVG attributes cannot read CSS variables). */
const INK = '#1c1a27';

const SHAPES: Record<LeagueId, { body: string; inner: string; wings: number; crown: boolean; ny: number; gloss: string }> = {
  bronze: { body: SHIELD, inner: SHIELD_IN, wings: 0, crown: false, ny: 62, gloss: 'M26 26 L60 14 L94 26 V46 C74 40 46 40 26 50 Z' },
  silver: { body: SHIELD, inner: SHIELD_IN, wings: 2, crown: false, ny: 62, gloss: 'M26 26 L60 14 L94 26 V46 C74 40 46 40 26 50 Z' },
  gold: { body: SHIELD, inner: SHIELD_IN, wings: 3, crown: true, ny: 62, gloss: 'M26 26 L60 14 L94 26 V46 C74 40 46 40 26 50 Z' },
  platinum: { body: HEX, inner: HEX_IN, wings: 3, crown: true, ny: 60, gloss: 'M25 30 L60 10 L95 30 V46 C74 40 46 40 25 50 Z' },
  diamond: { body: GEM, inner: GEM_IN, wings: 3, crown: true, ny: 54, gloss: 'M35 20 H85 L102 48 C80 40 40 40 18 48 Z' },
};

interface Props {
  rankIndex: number;
  size?: number;
  /** Subtle idle shine sweep. */
  idle?: boolean;
  locked?: boolean;
  glow?: boolean;
  showDivision?: boolean;
  className?: string;
}

/** Hand-built SVG league emblem: each league gets a grander silhouette. */
export function RankEmblem({ rankIndex, size = 96, idle = true, locked = false, glow = true, showDivision = true, className }: Props) {
  const id = useId().replace(/:/g, '');
  const rank = rankAt(rankIndex);
  const L = rank.league;
  const s = SHAPES[L.id];
  const wingFeathers = WING.slice(0, s.wings);

  return (
    <svg
      viewBox="-4 -4 128 120"
      width={size}
      height={(size * 120) / 128}
      className={cn('emblem shrink-0 overflow-visible', className)}
      style={{
        filter: locked
          ? 'grayscale(1) contrast(0.8) brightness(1.15)'
          : glow
            ? `drop-shadow(${Math.max(2, Math.round(size * 0.035))}px ${Math.max(2, Math.round(size * 0.035))}px 0 var(--color-ink))`
            : undefined,
        opacity: locked ? 0.55 : 1,
      }}
      role="img"
      aria-label={`${L.en} ${rank.division}`}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={L.c1} />
          <stop offset="0.45" stopColor={L.c2} />
          <stop offset="1" stopColor={L.c3} />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.c3} stopOpacity="0.95" />
          <stop offset="1" stopColor={L.c2} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`${id}-wing`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={L.c1} />
          <stop offset="1" stopColor={L.c3} />
        </linearGradient>
        <linearGradient id={`${id}-text`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={L.c1} />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={s.body} />
        </clipPath>
      </defs>

      {wingFeathers.length > 0 && (
        <g className="emblem-wings">
          {wingFeathers.map((d, i) => (
            <path key={`l${i}`} d={d} fill={`url(#${id}-wing)`} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          ))}
          <g transform="translate(120,0) scale(-1,1)">
            {wingFeathers.map((d, i) => (
              <path key={`r${i}`} d={d} fill={`url(#${id}-wing)`} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
            ))}
          </g>
        </g>
      )}

      {s.crown && <path d={CROWN} fill={`url(#${id}-wing)`} stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />}

      {/* ink outline: half of the stroke shows outside the body */}
      <path d={s.body} fill="none" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      <path d={s.body} fill={`url(#${id}-body)`} />
      <path d={s.inner} fill={`url(#${id}-inner)`} />
      {L.id === 'diamond' && (
        <g stroke={L.c1} strokeOpacity="0.35" strokeWidth="1" fill="none">
          <path d="M40 27 L52 49 L60 27 L68 49 L80 27" />
          <path d="M27 49 H93" />
          <path d="M52 49 L60 99 L68 49" />
        </g>
      )}
      <path d={s.gloss} fill="#fff" opacity="0.16" clipPath={`url(#${id}-clip)`} />

      {idle && !locked && (
        <g clipPath={`url(#${id}-clip)`}>
          <g className="emblem-shine">
            <rect x="0" y="-10" width="22" height="140" fill={`url(#${id}-shine)`} transform="skewX(-18)" />
          </g>
        </g>
      )}

      <path className="emblem-outline" d={s.body} fill="none" stroke={L.c1} strokeWidth="2.2" strokeLinejoin="round" opacity="0.9" />

      {showDivision && (
        <text
          x="60"
          y={s.ny}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Bricolage Grotesque Variable, sans-serif"
          fontWeight="800"
          fontSize={rank.division.length === 3 ? 26 : 30}
          fill={`url(#${id}-text)`}
          stroke={INK}
          strokeWidth="2.4"
          paintOrder="stroke"
          letterSpacing="-0.5"
        >
          {rank.division}
        </text>
      )}
    </svg>
  );
}
