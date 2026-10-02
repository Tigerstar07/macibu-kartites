import type { CSSProperties } from 'react';

type Shape = { style: CSSProperties; className: string };

const shape = (className: string, pos: CSSProperties, v: Record<string, string>): Shape => ({
  className,
  style: { ...pos, ...v } as CSSProperties,
});

/** Sticker shapes pinned to the edges of the page — playful, never behind text. */
const SHAPES: Shape[] = [
  shape('size-40 rounded-full bg-gold', { right: '-3.5rem', top: '-3.5rem' }, { '--d': '13s', '--r0': '0deg', '--r1': '10deg', '--dx': '-10px', '--dy': '14px' }),
  shape('h-14 w-44 rounded-full bg-candy', { left: '-2.5rem', bottom: '18%' }, { '--d': '16s', '--r0': '-18deg', '--r1': '-8deg', '--dx': '12px', '--dy': '-10px' }),
  shape('size-24 rounded-[1.4rem] bg-info', { right: '6%', bottom: '-2.8rem' }, { '--d': '18s', '--r0': '14deg', '--r1': '26deg', '--dx': '-14px', '--dy': '-12px' }),
  shape('size-16 rounded-full bg-acid', { left: '38%', top: '-2.2rem' }, { '--d': '15s', '--r0': '0deg', '--r1': '0deg', '--dx': '18px', '--dy': '10px' }),
];

/** Graph-paper backdrop with grain and a few floating sticker shapes. */
export function Background() {
  return (
    <div className="paper" aria-hidden="true">
      <div className="paper-grid" />
      <div className="paper-grain" />
      {SHAPES.map((s, i) => (
        <div key={i} className={`paper-shape ${s.className}`} style={s.style} />
      ))}
    </div>
  );
}
