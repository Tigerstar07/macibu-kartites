import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { createDrawable, createTimeline, spring } from 'animejs';
import type { RewardItem } from '../../types';
import { useGame } from '../../store/useGame';
import { rankAt, rankName } from '../../lib/rank';
import { useLang, useT } from '../../lib/i18n';
import { confettiBurst, confettiCannons, prefersReducedMotion } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { RankEmblem } from './RankEmblem';
import { RewardCard } from '../ui/Reward';
import { Button } from '../ui/Button';
import { SplitTitle } from '../ui/SplitTitle';

/** Global full-screen rank-up ceremony, driven by `ceremony` in the store. */
export function PromotionCeremony() {
  const ceremony = useGame((s) => s.ceremony);
  const setCeremony = useGame((s) => s.setCeremony);
  return createPortal(
    <AnimatePresence>
      {ceremony && (
        <CeremonyView
          key={`${ceremony.from}-${ceremony.to}`}
          from={ceremony.from}
          to={ceremony.to}
          items={ceremony.items}
          onClose={() => setCeremony(null)}
        />
      )}
    </AnimatePresence>,
    document.body,
  );
}

function CeremonyView({ from, to, items, onClose }: { from: number; to: number; items: RewardItem[]; onClose: () => void }) {
  const t = useT();
  const lang = useLang();
  const oldRef = useRef<HTMLDivElement>(null);
  const newRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  const toRank = rankAt(to);
  const fromRank = rankAt(from);
  const newLeague = toRank.leagueIndex > fromRank.leagueIndex;
  const L = toRank.league;

  useEffect(() => {
    const colors = [L.c1, L.c2, '#ffffff', L.c3];
    const oldEl = oldRef.current;
    const newEl = newRef.current;
    const raysEl = raysRef.current;
    if (!oldEl || !newEl || !raysEl) return;

    if (prefersReducedMotion()) {
      sfx.promotion();
      oldEl.style.opacity = '0';
      newEl.style.opacity = '1';
      raysEl.style.opacity = '1';
      setStage(3);
      return;
    }

    const drawables = createDrawable(newEl.querySelectorAll('.emblem-outline'));
    const tl = createTimeline({ defaults: { ease: 'out(4)' } });
    tl.add(oldEl, { scale: [0.5, 1], opacity: [0, 1], duration: 450 })
      .add(oldEl, { x: [0, -7, 7, -9, 9, -5, 5, 0], duration: 520, ease: 'linear' }, '+=150')
      .add(oldEl, { scale: [1, 1.6], opacity: [1, 0], duration: 320, ease: 'in(3)' })
      .label('boom')
      .call(() => {
        sfx.promotion();
        confettiCannons(colors);
        setStage(1);
      }, 'boom')
      .add(raysEl, { scale: [0.3, 1], opacity: [0, 1], duration: 900 }, 'boom')
      .add(newEl, { scale: [0.2, 1], opacity: [0, 1], rotate: [-30, 0], ease: spring({ bounce: 0.45, duration: 900 }) }, 'boom')
      .add(drawables, { draw: ['0 0', '0 1'], duration: 1100, ease: 'inOut(3)' }, 'boom')
      .call(() => {
        setStage(2);
        confettiBurst(colors, { x: 0.5, y: 0.35 }, 70);
      }, '+=50')
      .call(() => setStage(3), '+=700');
    return () => {
      tl.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (stage < 3) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [stage, onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[330] grid place-items-center overflow-y-auto overflow-x-hidden py-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.25 } }}
      role="dialog"
      aria-modal="true"
      aria-label={t('Rangs paaugstināts', 'Rank up')}
    >
      <div className="fixed inset-0 bg-ink-950/88 backdrop-blur-md" />
      <div className="fixed inset-0" style={{ background: `radial-gradient(circle at 50% 38%, ${L.glow}, transparent 55%)` }} />

      <div className="relative flex flex-col items-center px-6 text-center">
        <div className="relative grid size-[260px] place-items-center sm:size-[300px]">
          <div ref={raysRef} className="pointer-events-none absolute -inset-[70%] opacity-0">
            <div
              className="size-full animate-spin-slower"
              style={{
                background: `repeating-conic-gradient(from 0deg, ${L.c1}40 0deg 5deg, transparent 5deg 16deg)`,
                maskImage: 'radial-gradient(circle, #000 12%, transparent 62%)',
                WebkitMaskImage: 'radial-gradient(circle, #000 12%, transparent 62%)',
              }}
            />
          </div>
          <div ref={oldRef} className="absolute opacity-0">
            <RankEmblem rankIndex={from} size={150} idle={false} />
          </div>
          <div ref={newRef} className="absolute opacity-0">
            <RankEmblem rankIndex={to} size={230} />
          </div>
        </div>

        <div className="min-h-[92px]">
          {stage >= 1 && (
            <>
              <motion.div
                initial={{ opacity: 0, letterSpacing: '0.6em' }}
                animate={{ opacity: 1, letterSpacing: '0.3em' }}
                transition={{ duration: 0.8 }}
                className="text-sm font-bold uppercase"
                style={{ color: L.c1 }}
              >
                {newLeague ? t('Jauna līga!', 'New league!') : t('Paaugstinājums!', 'Promoted!')}
              </motion.div>
              <SplitTitle as="h2" text={rankName(toRank, lang)} className="mt-2 font-display text-4xl font-extrabold sm:text-5xl" />
            </>
          )}
        </div>

        {stage >= 2 && items.length > 0 && (
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {items.map((it, i) => (
              <motion.div
                key={i}
                initial={{ rotateY: 95, opacity: 0, y: 40 }}
                animate={{ rotateY: 0, opacity: 1, y: 0 }}
                transition={{ delay: i * 0.14, type: 'spring', stiffness: 240, damping: 18 }}
                style={{ transformPerspective: 900 }}
              >
                <RewardCard item={it} />
              </motion.div>
            ))}
          </div>
        )}

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: stage >= 3 ? 1 : 0, y: stage >= 3 ? 0 : 12 }}>
          <Button variant="primary" size="lg" className="mt-9 min-w-44" shine onClick={onClose} disabled={stage < 3}>
            {t('Lieliski!', 'Awesome!')}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
