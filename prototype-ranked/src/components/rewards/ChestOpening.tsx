import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { createTimeline } from 'animejs';
import type { RewardItem } from '../../types';
import { useGame, type Chest } from '../../store/useGame';
import { RARITY_META } from '../../lib/cosmetics';
import { useLang, useT } from '../../lib/i18n';
import { burst, centerOf, confettiBurst, prefersReducedMotion, ring } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { ChestIcon } from './ChestIcon';
import { RewardCard } from '../ui/Reward';
import { Button } from '../ui/Button';

/** Global chest-opening overlay, driven by `openChestId` in the store. */
export function ChestOpening() {
  const openId = useGame((s) => s.openChestId);
  const chests = useGame((s) => s.chests);
  const setOpenChest = useGame((s) => s.setOpenChest);
  // Snapshot the chest: it leaves the inventory the moment it is opened.
  const [chest, setChest] = useState<Chest | null>(null);

  useEffect(() => {
    if (openId && !chest) setChest(chests.find((c) => c.id === openId) ?? null);
    if (!openId) setChest(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openId]);

  return createPortal(
    <AnimatePresence>{chest && <ChestView key={chest.id} chest={chest} onDone={() => setOpenChest(null)} />}</AnimatePresence>,
    document.body,
  );
}

function ChestView({ chest, onDone }: { chest: Chest; onDone: () => void }) {
  const t = useT();
  const lang = useLang();
  const openChest = useGame((s) => s.openChest);
  const [phase, setPhase] = useState<'idle' | 'opening' | 'reveal'>('idle');
  const [items, setItems] = useState<RewardItem[]>([]);
  const shakeRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const meta = RARITY_META[chest.rarity];

  const open = () => {
    if (phase !== 'idle') return;
    setPhase('opening');
    setItems(openChest(chest.id));
    const colors = [meta.color, '#ffffff', '#fde68a'];
    const boom = () => {
      sfx.chestOpen();
      if (!shakeRef.current) return;
      const c = centerOf(shakeRef.current);
      burst(c.x, c.y - 20, { count: 30, spread: 200, colors, size: [6, 13] });
      ring(c.x, c.y, meta.color, 360, 800);
      confettiBurst(colors, { x: c.x / window.innerWidth, y: c.y / window.innerHeight }, 90);
    };
    if (prefersReducedMotion()) {
      boom();
      setPhase('reveal');
      return;
    }
    const lid = svgRef.current?.querySelector('.chest-lid');
    const inside = svgRef.current?.querySelector('.chest-inside');
    const el = shakeRef.current!;
    const tl = createTimeline();
    tl.add(el, { rotate: [0, -5, 5, 0], scale: [1, 1.05, 1], duration: 280, ease: 'inOut(2)', onBegin: () => sfx.chestShake(0) })
      .add(el, { rotate: [0, -8, 8, 0], scale: [1, 1.09, 1], duration: 240, ease: 'inOut(2)', onBegin: () => sfx.chestShake(1) }, '+=140')
      .add(el, { rotate: [0, -12, 12, -6, 6, 0], scale: [1, 1.15, 1], duration: 380, ease: 'inOut(2)', onBegin: () => sfx.chestShake(2) }, '+=120')
      .label('pop');
    if (lid) tl.add(lid, { y: [0, -70, -95], x: [0, -30, -48], rotate: [0, -38, -55], opacity: [1, 1, 0], duration: 700, ease: 'out(3)' }, 'pop');
    if (inside) tl.add(inside, { opacity: [0, 1], duration: 300 }, 'pop');
    tl.call(boom, 'pop').call(() => setPhase('reveal'), '+=260');
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault();
      if (phase === 'idle') open();
      else if (phase === 'reveal') onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <motion.div
      className="fixed inset-0 z-[330] grid place-items-center overflow-y-auto py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      role="dialog"
      aria-modal="true"
      aria-label={t('Lādes atvēršana', 'Opening chest')}
    >
      <div className="fixed inset-0 bg-ink-950/88 backdrop-blur-md" onClick={phase === 'reveal' ? onDone : undefined} />
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle at 50% 45%, ${meta.glow}, transparent 50%)`, opacity: phase === 'idle' ? 0.6 : 1 }}
      />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="text-sm font-bold uppercase tracking-[0.25em]" style={{ color: meta.color }}>
          {meta[lang]} {t('lāde', 'chest')}
        </div>

        <div className={phase === 'idle' ? 'mt-6 animate-bob' : 'mt-6'}>
          <button
            type="button"
            ref={undefined}
            onClick={open}
            disabled={phase !== 'idle'}
            className="rounded-3xl p-2 disabled:cursor-default"
            aria-label={t('Atvērt lādi', 'Open chest')}
          >
            <div ref={shakeRef}>
              <ChestIcon ref={svgRef} rarity={chest.rarity} size={210} />
            </div>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.p key="hint" className="mt-6 text-lg text-muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {t('Pieskaries lādei, lai to atvērtu', 'Tap the chest to open it')}
            </motion.p>
          )}
          {phase === 'reveal' && (
            <motion.div key="loot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 flex flex-col items-center">
              <h2 className="font-display text-2xl font-bold">{t('Tu saņēmi', 'You got')}</h2>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                {items.map((it, i) => (
                  <motion.div
                    key={i}
                    initial={{ y: -120, scale: 0.3, rotateY: 180, opacity: 0 }}
                    animate={{ y: 0, scale: 1, rotateY: 0, opacity: 1 }}
                    transition={{ delay: i * 0.16, type: 'spring', stiffness: 220, damping: 17 }}
                    style={{ transformPerspective: 900 }}
                  >
                    <RewardCard item={it} />
                  </motion.div>
                ))}
              </div>
              <Button variant="primary" size="lg" className="mt-9 min-w-44" shine onClick={onDone}>
                {t('Paņemt', 'Collect')}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
