import { forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring } from 'motion/react';
import { Play } from 'lucide-react';
import type { Deck } from '../../types';
import type { deckCounts } from '../../lib/questions';
import { isPlayable } from '../../lib/questions';
import { useLang, useT } from '../../lib/i18n';
import { plural } from '../../lib/format';
import { sfx } from '../../lib/sound';
import { DECK_ICONS } from '../ui/Icons';
import { Ring } from '../ui/Meters';

type Counts = ReturnType<typeof deckCounts>;

/** Deck tile with a springy 3D tilt that follows the pointer. */
export const DeckCard = forwardRef<HTMLDivElement, { deck: Deck; counts: Counts; index?: number }>(function DeckCard(
  { deck, counts, index = 0 },
  ref,
) {
  const t = useT();
  const lang = useLang();
  const navigate = useNavigate();
  const Icon = DECK_ICONS[deck.icon];
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 18 });
  const sry = useSpring(ry, { stiffness: 220, damping: 18 });
  const playable = isPlayable(deck);
  const open = () => {
    sfx.tap();
    navigate(`/decks/${deck.id}`);
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 26, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.18 } }}
      transition={{ delay: Math.min(index, 12) * 0.045, type: 'spring', stiffness: 300, damping: 26 }}
      style={{ perspective: 900 }}
    >
      <motion.div
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          ry.set(((e.clientX - r.left) / r.width - 0.5) * 10);
          rx.set(-((e.clientY - r.top) / r.height - 0.5) * 10);
        }}
        onPointerLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter') open();
        }}
        role="link"
        tabIndex={0}
        aria-label={deck.title}
        style={{ rotateX: srx, rotateY: sry }}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-card border-2 border-ink bg-card shadow-hard transition-[translate,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-lg"
      >
        {/* cover: flat deck colour, halftone dots and a big outlined icon */}
        <div className="relative h-32 overflow-hidden border-b-2 border-ink" style={{ backgroundColor: `hsl(${deck.hue} 88% 72%)` }}>
          <div className="halftone absolute inset-0" />
          <div
            className="absolute -bottom-10 -right-8 size-40 rounded-full border-2 border-ink"
            style={{ backgroundColor: `hsl(${(deck.hue + 35) % 360} 90% 80%)` }}
          />
          <Icon
            className="absolute -bottom-3 right-3 size-24 rotate-[-12deg] text-ink transition-transform duration-500 ease-spring group-hover:rotate-[2deg] group-hover:scale-110"
            strokeWidth={1.6}
          />
          <div className="absolute left-4 top-4 flex gap-1.5">
            <span className="rounded-md border-2 border-ink bg-card px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase text-ink">{deck.language}</span>
            {!deck.builtin && (
              <span className="-rotate-3 rounded-md border-2 border-ink bg-acid px-1.5 py-0.5 font-mono text-[11px] font-bold uppercase text-ink">
                {t('Mana', 'Mine')}
              </span>
            )}
          </div>
          {counts.due > 0 && (
            <span className="absolute bottom-4 left-4 rotate-[-4deg] rounded-md border-2 border-ink bg-bad px-2 py-0.5 font-mono text-xs font-bold text-ink shadow-hard-sm">
              {t(`${counts.due} jāatkārto`, `${counts.due} due`)}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="font-display text-[19px] font-extrabold leading-tight tracking-[-0.03em]">{deck.title}</h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{deck.description}</p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {deck.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-md border border-ink/20 bg-paper px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted">
                #{tag}
              </span>
            ))}
          </div>
          <div className="mt-auto flex items-center gap-3 border-t-2 border-dashed border-ink/15 pt-4">
            <Ring value={counts.mastery} size={44} stroke={6} color={`hsl(${deck.hue} 85% 58%)`}>
              <span className="font-mono text-[10px] font-bold">{Math.round(counts.mastery * 100)}%</span>
            </Ring>
            <div className="text-xs leading-tight text-muted">
              <div className="font-extrabold text-ink">
                {counts.total} {plural(counts.total, lang, 'kartīte', 'kartītes', 'card', 'cards')}
              </div>
              <div className="mt-0.5 font-medium">
                {counts.fresh} {plural(counts.fresh, lang, 'jauna', 'jaunas', 'new', 'new')}
              </div>
            </div>
            <button
              type="button"
              disabled={!playable}
              onClick={(e) => {
                e.stopPropagation();
                sfx.tap();
                navigate(`/play/${deck.id}`);
              }}
              className="tactile ml-auto grid size-12 place-items-center rounded-xl bg-acid text-ink disabled:opacity-40"
              aria-label={t(`Spēlēt: ${deck.title}`, `Play: ${deck.title}`)}
            >
              <Play className="size-5 translate-x-px fill-current" />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
});
