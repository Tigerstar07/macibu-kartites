import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Panel({
  title,
  icon,
  extra,
  children,
  className,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-card glass p-5 sm:p-6', className)}>
      {(title || extra) && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-3 font-display text-xl font-extrabold tracking-[-0.03em]">
            {icon && (
              <span className="grid size-10 shrink-0 place-items-center rounded-xl border-2 border-ink bg-acid dark:bg-brand-soft/40 dark:border-brand-soft/50 shadow-hard-sm [&_svg]:text-ink dark:[&_svg]:text-brand-soft">
                {icon}
              </span>
            )}
            {title}
          </h2>
          {extra}
        </div>
      )}
      {children}
    </section>
  );
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-8 w-14 shrink-0 rounded-full border-2 border-ink shadow-hard-sm transition-colors duration-200',
        checked ? 'bg-acid dark:bg-brand' : 'bg-paper-2',
      )}
    >
      <span
        className={cn(
          'absolute left-[2px] top-[2px] size-6 rounded-full border-2 border-ink bg-card transition-transform duration-300 ease-spring',
          checked ? 'translate-x-6' : 'translate-x-0',
        )}
      />
    </button>
  );
}
