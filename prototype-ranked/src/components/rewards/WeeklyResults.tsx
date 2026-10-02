import { useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { useGame, type GameEvent } from '../../store/useGame';
import { useNumFmt, useT } from '../../lib/i18n';
import { confettiCannons } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { RewardChip } from '../ui/Reward';

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

  return (
    <Modal open={!!event} onClose={() => event && dismiss(event.id)} labelledBy="weekly-title" className="max-w-lg text-center">
      {event && (
        <>
          <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-amber-400/15 text-amber-300">
            <Trophy className="size-8" />
          </div>
          <h2 id="weekly-title" className="mt-4 font-display text-2xl font-bold">
            {t('Nedēļa noslēgusies!', 'The week is over!')}
          </h2>
          <p className="mt-2 text-muted">
            {t('Tava vieta nedēļas tabulā:', 'Your final weekly place:')}{' '}
            <span className="font-display text-xl font-bold text-white">#{event.place}</span> · {fmt(event.rp)} RP
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {event.rewards.map((r, i) => (
              <RewardChip key={i} item={r} />
            ))}
          </div>
          <Button variant="primary" size="lg" className="mt-7" onClick={() => dismiss(event.id)}>
            {t('Saņemt balvas', 'Collect rewards')}
          </Button>
        </>
      )}
    </Modal>
  );
}
