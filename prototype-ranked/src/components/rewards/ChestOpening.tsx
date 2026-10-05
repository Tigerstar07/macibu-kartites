import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { createTimeline } from 'animejs';
import { Check, FastForward } from 'lucide-react';
import type { Rarity, RewardItem } from '../../types';
import { useGame, type Chest } from '../../store/useGame';
import { RARITY_META, cosmetic, rarityRank } from '../../lib/cosmetics';
import { useLang, useT } from '../../lib/i18n';
import { burst, centerOf, confettiBurst, confettiCannons, flyCoins, prefersReducedMotion, ring, shake, sleep, visibleEl } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { ChestIcon } from './ChestIcon';
import { ChestOdds } from './ChestOdds';
import { RewardCard, rewardTier, useRewardLabel } from '../ui/Reward';
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

type Phase = 'idle' | 'charging' | 'reveal';

const CHEST_H = 206;
const POWER: Record<Rarity, number> = { common: 0, rare: 1, epic: 2, legendary: 3 };
const TIER_RARITY: Rarity[] = ['common', 'rare', 'epic', 'legendary'];

/** Colour of the rarity an item belongs to (coins and boosts read as plain gold/cyan). */
function itemColor(item: RewardItem): string {
  if (item.kind === 'cosmetic') return RARITY_META[cosmetic(item.id)?.rarity ?? 'common'].color;
  if (item.kind === 'chest') return RARITY_META[item.rarity].color;
  return item.kind === 'boost' ? '#22d3ee' : '#fbbf24';
}

function ChestView({ chest, onDone }: { chest: Chest; onDone: () => void }) {
  const t = useT();
  const lang = useLang();
  const labelOf = useRewardLabel();
  const openChest = useGame((s) => s.openChest);
  const equip = useGame((s) => s.equip);
  // Pity as it was when this chest was picked up (opening it changes the live value).
  const [pity] = useState(() => useGame.getState().chestPity);
  const [phase, setPhase] = useState<Phase>('idle');
  const [items, setItems] = useState<RewardItem[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [hype, setHype] = useState(-1);
  const [finished, setFinished] = useState(false);
  const [equipped, setEquipped] = useState(false);
  const [flashKey, setFlashKey] = useState(0);
  const [flashColor, setFlashColor] = useState('#ffffff');
  const started = useRef(false);
  const skipped = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const shakeRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const beamRef = useRef<HTMLDivElement>(null);
  const raysRef = useRef<HTMLDivElement>(null);
  const timeline = useRef<ReturnType<typeof createTimeline> | null>(null);
  const meta = RARITY_META[chest.rarity];
  const power = POWER[chest.rarity];

  useEffect(() => () => void timeline.current?.pause(), []);

  const flashScreen = (color: string) => {
    setFlashColor(color);
    setFlashKey((k) => k + 1);
  };

  /** The moment the lid blows: sound, flash, shake and a burst scaled to the chest's rarity. */
  const boom = () => {
    sfx.chestOpen();
    if (!shakeRef.current) return;
    const c = centerOf(shakeRef.current);
    const colors = [meta.color, '#ffffff', '#fde68a'];
    burst(c.x, c.y - 20, { count: 28 + power * 16, spread: 190 + power * 30, colors, size: [6, 13] });
    ring(c.x, c.y, meta.color, 340 + power * 60, 800);
    if (power >= 2) setTimeout(() => ring(c.x, c.y, '#ffffff', 460, 900), 130);
    flashScreen(power >= 3 ? '#fff3b0' : '#ffffff');
    shake(stageRef.current, 6 + power * 4, 420);
    if (power >= 1) confettiBurst(colors, { x: c.x / window.innerWidth, y: c.y / window.innerHeight }, 50 + power * 40);
    if (power >= 3) confettiCannons([meta.color, '#ffffff', '#fde68a']);
  };

  const open = () => {
    if (started.current) return;
    started.current = true;
    setPhase('charging');
    setItems(openChest(chest.id).slice().sort((a, b) => rewardTier(a) - rewardTier(b)));

    if (prefersReducedMotion()) {
      boom();
      setPhase('reveal');
      return;
    }
    const el = shakeRef.current;
    if (!el) return;
    const q = (sel: string) => svgRef.current?.querySelector(sel);
    const lid = q('.chest-lid');
    const inside = q('.chest-inside');
    const seam = q('.chest-seam');
    const rays = raysRef.current;
    const beam = beamRef.current;

    // Three escalating shakes while light leaks out of the seam, then the lid blows off.
    const POP = 1350;
    sfx.chestCharge(power);
    const tl = createTimeline();
    timeline.current = tl;
    tl.add(el, { rotate: [0, -4, 4, 0], scale: [1, 1.04, 1], duration: 300, ease: 'inOut(2)', onBegin: () => sfx.chestShake(0) }, 0)
      .add(el, { rotate: [0, -7, 7, 0], scale: [1, 1.09, 1], duration: 260, ease: 'inOut(2)', onBegin: () => sfx.chestShake(1) }, 480)
      .add(el, { rotate: [0, -11, 11, -6, 6, 0], scale: [1, 1.16, 1], duration: 400, ease: 'inOut(2)', onBegin: () => sfx.chestShake(2) }, 900)
      // the squash before the pop
      .add(el, { scale: [1, 0.9, 1.06, 1], duration: 380, ease: 'out(3)' }, POP - 60);
    if (seam) tl.add(seam, { opacity: [0, 0.35, 0.7, 1], duration: POP, ease: 'in(2)' }, 0).add(seam, { opacity: 0, duration: 250 }, POP + 200);
    if (rays) tl.add(rays, { opacity: [0, 0.25, 0.55], duration: POP, ease: 'in(2)' }, 0);
    if (lid) tl.add(lid, { y: [0, -80, -110], x: [0, -34, -56], rotate: [0, -42, -62], opacity: [1, 1, 0], duration: 700, ease: 'out(3)' }, POP);
    if (inside) tl.add(inside, { opacity: [0, 1], duration: 300 }, POP);
    if (beam) tl.add(beam, { scaleY: [0, 1], opacity: [0, 0.95, 0.55], duration: 800, ease: 'out(4)' }, POP);
    tl.call(boom, POP).call(() => setPhase('reveal'), POP + 650);
  };

  /** Cards turn over one by one, building toward the best item. */
  useEffect(() => {
    if (phase !== 'reveal') return;
    let cancelled = false;
    (async () => {
      for (let i = 0; i < items.length; i++) {
        const tier = rewardTier(items[i]);
        if (tier >= 2) setHype(i);
        await sleep(i === 0 ? 450 : tier >= 3 ? 1500 : tier === 2 ? 1100 : tier === 1 ? 650 : 420);
        if (cancelled || skipped.current) return;
        setHype(-1);
        setRevealed(i + 1);
        revealFx(items[i], i, stageRef.current, flashScreen);
      }
      if (!cancelled) {
        await sleep(300);
        if (!cancelled) setFinished(true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, items]);

  const skip = () => {
    if (phase !== 'reveal' || finished || skipped.current) return;
    skipped.current = true;
    setHype(-1);
    setRevealed(items.length);
    setFinished(true);
    sfx.reveal(Math.max(0, ...items.map(rewardTier)));
  };

  // The best cosmetic that dropped, offered for instant equipping.
  const best = items
    .filter((it): it is Extract<RewardItem, { kind: 'cosmetic' }> => it.kind === 'cosmetic')
    .sort((a, b) => rarityRank(cosmetic(b.id)?.rarity ?? 'common') - rarityRank(cosmetic(a.id)?.rarity ?? 'common'))[0];
  const bestDef = best ? cosmetic(best.id) : undefined;

  const collect = (el: HTMLElement) => {
    sfx.tap();
    const coinTarget = visibleEl('[data-coin-target]');
    const coinItems = items.filter((it) => it.kind === 'coins');
    if (coinItems.length && coinTarget) {
      flyCoins(centerOf(el), coinTarget, 10, (i) => {
        if (i % 2 === 0) sfx.coin();
      });
      setTimeout(onDone, 340);
    } else {
      onDone();
    }
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      // Let the odds drawer and other focused controls keep their own keys.
      if ((e.target as HTMLElement | null)?.closest('summary, [data-collect]')) return;
      e.preventDefault();
      if (phase === 'idle') open();
      else if (phase === 'reveal' && !finished) skip();
      else if (phase === 'reveal' && finished) onDone();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, finished, items]);

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
      <div
        className="fixed inset-0 bg-ink-950/88 backdrop-blur-md"
        onClick={phase === 'reveal' ? (finished ? onDone : skip) : undefined}
      />
      {/* ambient light that grows as the chest charges */}
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-700"
        style={{ background: `radial-gradient(circle at 50% 42%, ${meta.glow}, transparent 52%)`, opacity: phase === 'idle' ? 0.55 : 1 }}
      />
      <div
        ref={raysRef}
        className="sunburst pointer-events-none fixed left-1/2 top-[40%] size-[1100px] -translate-x-1/2 -translate-y-1/2 animate-spin-slower"
        style={{ '--ray': meta.glow, opacity: 0 } as React.CSSProperties}
      />
      {flashKey > 0 && (
        <motion.div
          key={flashKey}
          className="pointer-events-none fixed inset-0 z-10"
          style={{ background: flashColor }}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      )}

      <div ref={stageRef} className="relative flex flex-col items-center px-6 text-center">
        <motion.div
          className="text-sm font-bold uppercase tracking-[0.25em]"
          style={{ color: meta.color }}
          animate={{ opacity: phase === 'reveal' ? 0.7 : 1, y: phase === 'reveal' ? -4 : 0 }}
        >
          {meta[lang]} {t('lāde', 'chest')}
        </motion.div>

        <motion.div
          className="relative mt-6"
          style={{ height: CHEST_H }}
          animate={phase === 'reveal' ? { height: 0, opacity: 0, marginTop: 0, scale: 0.6 } : { height: CHEST_H, opacity: 1 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        >
          {/* the light column that rises when the lid goes */}
          <div
            ref={beamRef}
            className="pointer-events-none absolute bottom-[48%] left-1/2 h-[75vh] w-28 -translate-x-1/2 origin-bottom blur-lg"
            style={{ background: `linear-gradient(to top, ${meta.color}, rgba(255,255,255,0.75) 30%, transparent)`, opacity: 0, transform: 'scaleY(0)' }}
          />
          <div className={phase === 'idle' ? 'animate-bob' : undefined}>
            <button
              type="button"
              onClick={open}
              disabled={phase !== 'idle'}
              className="relative rounded-3xl p-2 disabled:cursor-default"
              aria-label={t('Atvērt lādi', 'Open chest')}
            >
              <div ref={shakeRef}>
                <ChestIcon ref={svgRef} rarity={chest.rarity} size={210} fancy />
              </div>
            </button>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {phase === 'idle' && (
            <motion.div key="hint" className="mt-4 flex flex-col items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-lg text-muted">{t('Pieskaries lādei, lai to atvērtu', 'Tap the chest to open it')}</p>
              <details className="mt-5 w-full max-w-xs rounded-xl glass-soft px-4 py-2.5">
                <summary className="cursor-pointer text-sm font-bold text-muted">{t('Kas varētu būt iekšā?', "What's inside?")}</summary>
                <ChestOdds rarity={chest.rarity} pity={pity} className="mt-3 pb-1" />
              </details>
            </motion.div>
          )}
          {phase === 'reveal' && (
            <motion.div key="loot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center">
              <h2 className="font-display text-2xl font-bold">{t('Tu saņēmi', 'You got')}</h2>
              <div className="mt-6 flex max-w-3xl flex-wrap justify-center gap-4">
                {items.map((it, i) => (
                  <LootCard key={i} item={it} index={i} revealed={i < revealed} hyped={hype === i} />
                ))}
              </div>

              <div className="mt-9 flex min-h-12 flex-wrap items-center justify-center gap-3">
                {!finished ? (
                  <button
                    type="button"
                    onClick={skip}
                    className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold text-muted transition-colors hover:text-fg"
                  >
                    <FastForward className="size-4" />
                    {t('Izlaist', 'Skip')}
                  </button>
                ) : (
                  <>
                    {bestDef && bestDef.kind !== 'theme' && (
                      <Button
                        variant="secondary"
                        size="lg"
                        data-collect
                        disabled={equipped}
                        icon={equipped ? <Check className="size-4" /> : undefined}
                        onClick={() => {
                          sfx.tap();
                          equip(bestDef.id);
                          setEquipped(true);
                        }}
                      >
                        {equipped ? t('Uzvilkts', 'Equipped') : t(`Izmantot: ${bestDef[lang]}`, `Equip ${bestDef[lang]}`)}
                      </Button>
                    )}
                    <Button variant="primary" size="lg" className="min-w-44" shine data-collect autoFocus onClick={(e) => collect(e.currentTarget)}>
                      {t('Paņemt', 'Collect')}
                    </Button>
                  </>
                )}
              </div>
              <div className="sr-only" aria-live="polite">
                {finished && items.map((it) => `${labelOf(it).label} ${labelOf(it).sub}`).join(', ')}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

/** Sound and effects for one card turning over, scaled to how rare it is. */
function revealFx(item: RewardItem, index: number, stage: HTMLElement | null, flashScreen: (color: string) => void) {
  const tier = rewardTier(item);
  sfx.reveal(tier);
  const card = document.querySelector(`[data-loot="${index}"]`);
  if (!card) return;
  const c = centerOf(card);
  const color = itemColor(item);
  burst(c.x, c.y, { count: 8 + tier * 14, spread: 90 + tier * 40, colors: [color, '#ffffff', '#fde68a'], size: [5, 10 + tier * 2] });
  if (tier >= 1) ring(c.x, c.y, color, 220 + tier * 90, 700);
  if (tier >= 2) {
    flashScreen(tier >= 3 ? '#fff3b0' : TIER_RARITY[tier] === 'epic' ? '#e9d5ff' : '#ffffff');
    confettiBurst([color, '#ffffff'], { x: c.x / window.innerWidth, y: c.y / window.innerHeight }, 40 + tier * 30);
  }
  if (tier >= 3) {
    confettiCannons([color, '#ffffff', '#fde68a']);
    shake(stage, 10, 480);
  }
}

/** One loot card: arrives face-down (tinted by rarity), shakes with anticipation, then flips. */
function LootCard({ item, index, revealed, hyped }: { item: RewardItem; index: number; revealed: boolean; hyped: boolean }) {
  const t = useT();
  const color = itemColor(item);
  const tier = rewardTier(item);
  return (
    <motion.div
      data-loot={index}
      style={{ perspective: 900 }}
      initial={{ y: 70, opacity: 0, scale: 0.8 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.09, type: 'spring', stiffness: 240, damping: 20 }}
    >
      <motion.div
        style={{ transformStyle: 'preserve-3d' }}
        animate={hyped ? { x: [0, -4, 4, -3, 3, 0], scale: 1.07 } : { x: 0, scale: 1 }}
        transition={hyped ? { x: { duration: 0.38, repeat: Infinity }, scale: { duration: 0.3 } } : { duration: 0.2 }}
      >
        <motion.div
          className="relative"
          style={{ transformStyle: 'preserve-3d' }}
          initial={{ rotateY: 180 }}
          animate={{ rotateY: revealed ? 0 : 180 }}
          transition={{ type: 'spring', stiffness: 170, damping: 16 }}
        >
          <div style={{ backfaceVisibility: 'hidden' }}>
            <RewardCard item={item} isNew={item.kind === 'cosmetic'} />
          </div>
          <div
            className="absolute inset-0 grid place-items-center overflow-hidden rounded-2xl border-2 border-ink shadow-hard"
            style={{
              transform: 'rotateY(180deg)',
              backfaceVisibility: 'hidden',
              background: `linear-gradient(160deg, color-mix(in oklch, ${color} 55%, #1c1a27), #1c1a27)`,
              boxShadow: hyped || tier >= 2 ? `4px 4px 0 0 var(--color-ink), 0 0 ${hyped ? 46 : 22}px ${color}` : undefined,
            }}
          >
            <div className="halftone absolute inset-0 opacity-30" />
            <span className="relative font-display text-6xl font-black text-white/85 drop-shadow-[3px_3px_0_rgba(0,0,0,0.5)]" aria-label={t('Slēpts balvas', 'Hidden reward')}>
              ?
            </span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
