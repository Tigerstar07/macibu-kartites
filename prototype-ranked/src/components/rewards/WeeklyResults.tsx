import { useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy } from 'lucide-react';
import { useGame, type GameEvent } from '../../store/useGame';
import { useNumFmt, useT } from '../../lib/i18n';
import { centerOf, confettiCannons, flyCoins, visibleEl } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RewardCard } from '../ui/Reward';

/** Monday-morning results for last week's leaderboard. */
export function WeeklyResults() {
  const t = useT();
  const fmt = useNumFmt();
  const event = useGame((s) => s.events.find((e): e is Extract<GameEvent, { type: 'weekly' }> => e.type === 'weekly'));
  const dismiss = useGame((s) => s.dismissEvent);

  useEffect(() => {
    if (!event) return;
    sfx.promotion();
    if (event.place <= 3) confettiCannons(['#fbbf24', '#fde68a', '#ffffff', '#a78bfa']);
  }, [event]);

  if (!event) return null;

  const handleCollect = (e: React.MouseEvent) => {
    sfx.tap();
    const coinTarget = visibleEl('[data-coin-target]');
    const coinItem = event.rewards.find((it) => it.kind === 'coins');
    if (coinItem && coinTarget) {
      const c = centerOf(e.currentTarget);
      flyCoins(c, coinTarget, 12, (i) => {
        if (i % 2 === 0) sfx.coin();
      });
      setTimeout(() => dismiss(event.id), 350);
    } else {
      dismiss(event.id);
    }
  };

  return (
    <Modal open={!!event} onClose={() => dismiss(event.id)} labelledBy="weekly-title" className="max-w-lg text-center">
      <div className="mx-auto grid size-16 place-items-center rounded-2xl border-2 border-ink bg-amber-400 shadow-hard text-ink">
        <Trophy className="size-8" />
      </div>
      <h2 id="weekly-title" className="mt-4 font-display text-2xl font-extrabold">
        {t('Nedēļa noslēgusies!', 'The week is over!')}
      </h2>
      <motion.div
        initial={{ scale: 2.2, opacity: 0, rotate: -8 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.12, type: 'spring', stiffness: 380, damping: 20 }}
        className="mx-auto mt-4 inline-flex items-center gap-2 rounded-2xl border-2 border-ink bg-acid px-5 py-2 font-display text-2xl font-black text-ink shadow-hard"
      >
        <span>#{event.place}</span>
        <span className="text-sm font-semibold text-muted">· {fmt(event.rp)} RP</span>
      </motion.div>
      <p className="mt-3 text-sm text-muted">
        {t('Tava galīgā vieta nedēļas rangā un nopelnītās balvas!', 'Your final weekly rank and earned rewards!')}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {event.rewards.map((r, i) => (
          <motion.div
            key={i}
            initial={{ y: 20, opacity: 0, scale: 0.8 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1, type: 'spring', stiffness: 350, damping: 22 }}
          >
            <RewardCard item={r} />
          </motion.div>
        ))}
      </div>
      <Button variant="primary" size="lg" className="mt-7 min-w-44" shine onClick={handleCollect}>
        {t('Saņemt balvas', 'Collect rewards')}
      </Button>
    </Modal>
  );
}
