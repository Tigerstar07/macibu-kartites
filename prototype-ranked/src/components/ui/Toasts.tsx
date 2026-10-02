import { useEffect, useRef, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCheck, Gift, X } from 'lucide-react';
import { useGame, type GameEvent } from '../../store/useGame';
import { achievementDef } from '../../lib/achievements';
import { questDef } from '../../lib/quests';
import { RARITY_META } from '../../lib/cosmetics';
import { useLang, useT } from '../../lib/i18n';
import { pop } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { ACH_ICONS } from './Icons';
import { RewardChip } from './Reward';

function ToastCard({ event, onClose }: { event: Exclude<GameEvent, { type: 'weekly' }>; onClose: () => void }) {
  const t = useT();
  const lang = useLang();
  const iconRef = useRef<HTMLDivElement>(null);
  const close = useRef(onClose);
  close.current = onClose;

  useEffect(() => {
    if (event.type === 'quest') sfx.coin();
    else sfx.achievement();
    const timer = setTimeout(() => pop(iconRef.current, 1.35), 180);
    const auto = setTimeout(() => close.current(), 5200);
    return () => {
      clearTimeout(timer);
      clearTimeout(auto);
    };
  }, [event.type]);

  let color = '#a78bfa';
  let icon = <Gift className="size-6" />;
  let kicker = '';
  let title = '';
  let body: React.ReactNode = null;

  if (event.type === 'achievement') {
    const a = achievementDef(event.achievementId);
    const Icon = ACH_ICONS[a.icon];
    color = RARITY_META[a.rarity].color;
    icon = <Icon className="size-6" />;
    kicker = t('Sasniegums atbloķēts!', 'Achievement unlocked!');
    title = a[lang];
    body = (
      <div className="mt-2 flex flex-wrap gap-2">
        {a.reward.map((r, i) => (
          <RewardChip key={i} item={r} className="py-1.5" />
        ))}
      </div>
    );
  } else if (event.type === 'quest') {
    const q = questDef(event.questId);
    color = '#34d399';
    icon = <CheckCheck className="size-6" />;
    kicker = t('Uzdevums izpildīts!', 'Quest complete!');
    title = q[lang];
    body = <p className="mt-1 text-sm text-muted">{t(`Saņem +${q.reward} monētas sākumlapā`, `Claim +${q.reward} coins on the home screen`)}</p>;
  } else {
    color = '#fbbf24';
    kicker = t('Balva!', 'Reward!');
    title = event[lang];
    body = (
      <div className="mt-2 flex flex-wrap gap-2">
        {event.items.map((r, i) => (
          <RewardChip key={i} item={r} className="py-1.5" />
        ))}
      </div>
    );
  }

  return (
    <div className="relative flex gap-3.5 rounded-2xl border-2 border-ink bg-card p-4 pr-10 shadow-hard" style={{ '--c': color } as CSSProperties} role="status">
      <div ref={iconRef} className="tint grid size-12 shrink-0 place-items-center rounded-xl shadow-hard-sm">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="eyebrow inline-block rounded-md border-2 border-ink px-1.5 py-px text-[10px] text-ink" style={{ background: color }}>
          {kicker}
        </div>
        <div className="mt-1 font-display text-base font-extrabold leading-snug tracking-[-0.02em]">{title}</div>
        {body}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="absolute right-3 top-3 z-10 grid size-7 place-items-center rounded-lg border-2 border-transparent text-dim transition-colors hover:border-ink hover:bg-paper-2 hover:text-ink"
        aria-label={t('Aizvērt', 'Close')}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

/** Stack of achievement / quest / reward toasts driven by the store's event queue. */
export function Toasts() {
  const events = useGame((s) => s.events);
  const dismiss = useGame((s) => s.dismissEvent);
  const toasts = events.filter((e): e is Exclude<GameEvent, { type: 'weekly' }> => e.type !== 'weekly').slice(0, 3);

  return createPortal(
    <div className="pointer-events-none fixed right-4 top-4 z-[320] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-3">
      <AnimatePresence initial={false}>
        {toasts.map((e) => (
          <motion.div
            key={e.id}
            layout
            className="pointer-events-auto"
            initial={{ opacity: 0, x: 80, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            <ToastCard event={e} onClose={() => dismiss(e.id)} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
