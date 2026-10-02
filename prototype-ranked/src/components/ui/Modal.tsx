import { useEffect, type CSSProperties, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Button } from './Button';

export function Modal({
  open,
  onClose,
  children,
  className,
  dismissible = true,
  labelledBy,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  dismissible?: boolean;
  labelledBy?: string;
}) {
  useEffect(() => {
    if (!open || !dismissible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [open, dismissible, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[300] grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <div className="absolute inset-0 bg-ink/45 backdrop-blur-[3px]" onClick={dismissible ? onClose : undefined} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={cn('relative w-full max-w-md rounded-card border-2 border-ink bg-card p-6 shadow-hard-lg sm:p-7', className)}
            initial={{ opacity: 0, y: 28, rotate: -2, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 420, damping: 28 }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal open={open} onClose={onCancel} labelledBy="confirm-title">
      <div className="flex items-start gap-4">
        <div
          className="tint grid size-12 shrink-0 place-items-center rounded-xl shadow-hard-sm"
          style={{ '--c': danger ? 'var(--color-bad)' : 'var(--color-gold)' } as CSSProperties}
        >
          <AlertTriangle className="size-6" strokeWidth={2.4} />
        </div>
        <div className="min-w-0 pt-0.5">
          <h2 id="confirm-title" className="font-display text-xl font-extrabold leading-tight tracking-[-0.03em]">
            {title}
          </h2>
          <div className="mt-2 text-[15px] leading-relaxed text-muted">{message}</div>
        </div>
      </div>
      <div className="mt-7 flex flex-wrap justify-end gap-3">
        <Button variant="ghost" onClick={onCancel} autoFocus>
          {cancelLabel}
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
