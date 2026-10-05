export type OptionState = 'idle' | 'correct' | 'wrong' | 'reveal' | 'dim';

export const HUD_BUTTON = 'tactile grid size-11 shrink-0 place-items-center rounded-xl bg-card text-ink';
export const HUD_VALUE = 'flex h-11 items-center rounded-xl border-2 border-ink bg-card shadow-hard-sm';
export const HINT = 'grid size-10 shrink-0 place-items-center rounded-lg border-2 border-ink bg-card font-mono text-sm font-bold text-ink shadow-[0_2px_0_0_var(--color-ink)]';
export const SLOT_FILL = ['bg-brand-soft', 'bg-info-soft', 'bg-gold-soft', 'bg-candy-soft'];

export const OPTION_STYLE: Record<OptionState, string> = {
  idle: 'hover:brightness-[1.04]',
  correct: 'pressed !bg-good',
  wrong: 'pressed !bg-bad',
  reveal: '!bg-good-soft',
  dim: '!bg-paper-2 opacity-45 [--lift:1px]',
};
