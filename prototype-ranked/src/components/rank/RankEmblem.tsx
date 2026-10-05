import { useId } from 'react';
import { rankAt, type LeagueId } from '../../lib/rank';
import { useLang } from '../../lib/i18n';
import { cn } from '../../lib/cn';

const SHIELD = 'M60 11 L91 23 L89 62 C88 80 75 94 60 104 C45 94 32 80 31 62 L29 23 Z';
const SHIELD_IN = 'M60 19 L83 28 L81 61 C80 75 70 87 60 94 C50 87 40 75 39 61 L37 28 Z';
const HEX = 'M60 11 L92 25 L86 69 L60 104 L34 69 L28 25 Z';
const HEX_IN = 'M60 19 L84 29 L80 67 L60 94 L40 67 L36 29 Z';
const DIAMOND_SHIELD = 'M60 11 L92 27 L84 73 L60 105 L36 73 L28 27 Z';
const DIAMOND_SHIELD_IN = 'M60 19 L84 31 L78 71 L60 95 L42 71 L36 31 Z';
const STAR = 'M0 -7 L2.1 -2.3 L7 -2 L3.3 1.2 L4.4 6.5 L0 4 L-4.4 6.5 L-3.3 1.2 L-7 -2 L-2.1 -2.3 Z';
const RIBBON = 'M34 24 L49 31 L43 80 L32 98 L32 72 L20 65 L26 56 L21 48 L34 42 Z';
const TOP_BAR = 'M22 23 H98 L93 31 H27 Z';
const CHEVRON = 'M45 73 L60 66 L75 73 L71 77 L60 72 L49 77 Z';
const OPEN_BOOK = 'M60 7 C54 3 48 3 42 5 V18 C49 16 55 17 60 21 C65 17 71 16 78 18 V5 C72 3 66 3 60 7 Z';
const SPARK = 'M0 -6 L1.6 -1.6 L6 0 L1.6 1.6 L0 6 L-1.6 1.6 L-6 0 L-1.6 -1.6 Z';
const SPARKLE_POSITIONS = [
  { x: 12, y: 44 },
  { x: 108, y: 48 },
  { x: 12, y: 76 },
  { x: 108, y: 80 },
];
/** Sticker outline colour (SVG attributes cannot read CSS variables). */
const INK = '#1c1a27';

const SHAPES: Record<LeagueId, { body: string; inner: string; stars: number; gloss: string }> = {
  bronze: { body: SHIELD, inner: SHIELD_IN, stars: 1, gloss: 'M29 23 L60 11 L91 23 V39 C74 34 46 34 30 43 Z' },
  silver: { body: SHIELD, inner: SHIELD_IN, stars: 1, gloss: 'M29 23 L60 11 L91 23 V39 C74 34 46 34 30 43 Z' },
  gold: { body: SHIELD, inner: SHIELD_IN, stars: 2, gloss: 'M29 23 L60 11 L91 23 V39 C74 34 46 34 30 43 Z' },
  platinum: { body: HEX, inner: HEX_IN, stars: 2, gloss: 'M28 25 L60 11 L92 25 V41 C74 35 46 35 29 44 Z' },
  diamond: { body: DIAMOND_SHIELD, inner: DIAMOND_SHIELD_IN, stars: 3, gloss: 'M28 27 L60 11 L92 27 L87 44 C72 37 48 37 32 45 Z' },
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

/** Layered competitive badge with a league crest and division marks. */
export function RankEmblem({ rankIndex, size = 96, idle = true, locked = false, glow = true, showDivision = true, className }: Props) {
  const id = useId().replace(/:/g, '');
  const rank = rankAt(rankIndex);
  const L = rank.league;
  const s = SHAPES[L.id];
  const chevrons = ['III', 'II', 'I'].indexOf(rank.division) + 1;
  const effectTier = Math.floor(rankIndex / 3);
  const rankPower = rankIndex / 14;
  const lang = useLang();

  return (
    <svg
      viewBox="-4 -4 128 120"
      width={size}
      height={(size * 120) / 128}
      className={cn(
        'emblem shrink-0 overflow-visible',
        `rank-emblem-tier-${effectTier}`,
        idle && !locked && 'rank-emblem-active',
        className,
      )}
      style={{
        filter: locked
          ? 'grayscale(1) contrast(0.8) brightness(1.15)'
          : glow
            ? `drop-shadow(${Math.max(2, Math.round(size * 0.035))}px ${Math.max(2, Math.round(size * 0.035))}px 0 var(--color-ink)) drop-shadow(0 0 ${Math.round(2 + rankPower * 8)}px ${L.glow})`
            : undefined,
        opacity: locked ? 0.55 : 1,
      }}
      role="img"
      aria-label={`${L[lang]} ${rank.division}`}
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0" stopColor={L.c1} />
          <stop offset="0.45" stopColor={L.c2} />
          <stop offset="1" stopColor={L.c3} />
        </linearGradient>
        <linearGradient id={`${id}-inner`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#303239" />
          <stop offset="0.35" stopColor="#111318" />
          <stop offset="1" stopColor="#050609" />
        </linearGradient>
        <linearGradient id={`${id}-text`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={L.c1} />
        </linearGradient>
        <radialGradient id={`${id}-aura`}>
          <stop offset="0" stopColor={L.c1} stopOpacity="0.48" />
          <stop offset="0.58" stopColor={L.c2} stopOpacity="0.2" />
          <stop offset="1" stopColor={L.c3} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-shine`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id={`${id}-clip`}>
          <path d={s.body} />
        </clipPath>
      </defs>

      {effectTier > 0 && <circle className="rank-emblem-aura" cx="60" cy="57" r={47 + effectTier * 2} fill={`url(#${id}-aura)`} />}
      {effectTier >= 3 && (
        <g className="rank-emblem-orbit">
          <ellipse cx="60" cy="57" rx="55" ry="31" fill="none" stroke={L.c1} strokeOpacity="0.7" strokeWidth="1.5" strokeDasharray={effectTier === 4 ? '2 3' : '5 4'} />
          <circle cx="60" cy="26" r="2.2" fill="#fff" />
          {effectTier === 4 && <ellipse cx="60" cy="57" rx="49" ry="38" fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="1" />}
        </g>
      )}
      {SPARKLE_POSITIONS.slice(0, effectTier).map((sparkle, index) => (
        <path
          key={`spark-${index}`}
          className="rank-emblem-spark"
          d={SPARK}
          transform={`translate(${sparkle.x} ${sparkle.y}) scale(${0.75 + rankPower * 0.3})`}
          fill="#fff"
          stroke={L.c2}
          strokeWidth="1"
          style={{ animationDelay: `${index * -0.35}s` }}
        />
      ))}

      <g stroke={INK} strokeWidth="2" strokeLinejoin="round">
        <path d={RIBBON} fill={`url(#${id}-body)`} />
        <g transform="translate(120,0) scale(-1,1)">
          <path d={RIBBON} fill={`url(#${id}-body)`} />
        </g>
      </g>
      <path d={TOP_BAR} fill={`url(#${id}-body)`} stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M27 25 H93" stroke="#fff" strokeOpacity="0.72" strokeWidth="1.5" />

      {/* The colored outer shell frames a dark enamel center. */}
      <path d={s.body} fill="none" stroke={INK} strokeWidth="7" strokeLinejoin="round" />
      <path d={s.body} fill={`url(#${id}-body)`} />
      <path d={s.inner} fill={`url(#${id}-inner)`} />
      <path d={s.inner} fill="none" stroke="#f4f1e8" strokeOpacity="0.78" strokeWidth="1.5" />
      <path d="M38 31 H82" stroke={L.c1} strokeOpacity="0.9" strokeWidth="1.5" />
      <path d={OPEN_BOOK} fill="#f5f0df" stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M60 7 V19 M46 7 L55 9 M74 7 L65 9 M46 13 L55 15 M74 13 L65 15" fill="none" stroke={L.c3} strokeWidth="1.1" strokeLinecap="round" />
      {Array.from({ length: s.stars }, (_, i) => {
        const x = 60 + (i - (s.stars - 1) / 2) * 15;
        return <path key={`star-${i}`} d={STAR} transform={`translate(${x} 42)`} fill="#fff" stroke="#0b0c10" strokeWidth="1.2" strokeLinejoin="round" />;
      })}
      {Array.from({ length: chevrons }, (_, i) => (
        <path key={`chevron-${i}`} d={CHEVRON} transform={`translate(0 ${i * 7})`} fill={L.c1} stroke={INK} strokeWidth="1.3" strokeLinejoin="round" />
      ))}
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
          y={57}
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="Bricolage Grotesque Variable, sans-serif"
          fontWeight="800"
          fontSize={rank.division.length === 3 ? 20 : 24}
          fill="#fff"
          stroke="#050609"
          strokeWidth="2.2"
          paintOrder="stroke"
          letterSpacing="-0.5"
        >
          {rank.division}
        </text>
      )}
    </svg>
  );
}
