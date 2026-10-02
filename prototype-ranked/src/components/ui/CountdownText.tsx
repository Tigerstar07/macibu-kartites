import { useNow } from '../../store/hooks';
import { fmtCountdown } from '../../lib/format';
import { useLang } from '../../lib/i18n';

/** Self-updating "2 d. 14 st. 05 min." countdown, isolated so pages don't re-render every second. */
export function CountdownText({ to, className }: { to: number; className?: string }) {
  const now = useNow(1000);
  const lang = useLang();
  return <span className={className ?? 'tabular'}>{fmtCountdown(to - now, lang)}</span>;
}
