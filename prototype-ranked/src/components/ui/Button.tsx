import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'success';
type Size = 'sm' | 'md' | 'lg' | 'xl';

/**
 * Brutalist tactile buttons: a flat colour face with an ink outline sitting
 * on a hard ink shadow (see `tactile` in index.css). Hover lifts the face,
 * press drives it down into its shadow.
 */
const VARIANT: Record<Variant, string> = {
  primary: 'tactile bg-brand text-white hover:bg-[oklch(0.63_0.235_285)]',
  secondary: 'tactile bg-card text-ink hover:bg-paper-2',
  ghost: 'border-2 border-transparent text-muted transition-colors duration-150 hover:border-ink/15 hover:bg-ink/5 hover:text-ink active:bg-ink/10',
  danger: 'tactile bg-bad text-ink hover:bg-[oklch(0.72_0.2_27)]',
  gold: 'tactile bg-gold text-ink hover:bg-[oklch(0.9_0.17_92)]',
  success: 'tactile bg-good text-ink hover:bg-[oklch(0.83_0.19_150)]',
};

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-lg gap-1.5 [--lift:2px]',
  md: 'h-11 px-5 text-[15px] rounded-xl gap-2',
  lg: 'h-13 px-6 text-base rounded-xl gap-2.5',
  xl: 'h-15 px-8 text-lg rounded-2xl gap-3 [--lift:4px]',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
  shine?: boolean;
  silent?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'secondary', size = 'md', icon, iconRight, shine, silent, className, children, onClick, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'relative inline-flex select-none items-center justify-center font-bold tracking-[-0.01em] whitespace-nowrap disabled:pointer-events-none disabled:opacity-50',
        VARIANT[variant],
        SIZE[size],
        shine && 'shine',
        className,
      )}
      onClick={(e) => {
        if (!silent) sfx.tap();
        onClick?.(e);
      }}
      {...rest}
    >
      {icon}
      {children !== undefined && <span className="relative">{children}</span>}
      {iconRight}
    </button>
  );
});
