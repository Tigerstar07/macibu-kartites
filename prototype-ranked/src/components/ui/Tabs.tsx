import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

/** Segmented control: an outlined bar with a springy ink selection block. */
export function Tabs<T extends string>({
  value,
  onChange,
  options,
  layoutId,
  className,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode; icon?: ReactNode }[];
  layoutId: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      className={cn('inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border-2 border-ink bg-card p-1 shadow-hard-sm no-scrollbar', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => {
              if (active) return;
              sfx.tap();
              onChange(o.value);
            }}
            className={cn(
              'relative flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-colors duration-150',
              active ? 'text-paper' : 'text-muted hover:bg-paper-2 hover:text-ink',
            )}
          >
            {active && (
              <motion.span layoutId={layoutId} className="absolute inset-0 rounded-lg bg-ink" transition={{ type: 'spring', stiffness: 460, damping: 36 }} />
            )}
            <span className="relative flex items-center gap-2">
              {o.icon}
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
