import { createElement, useEffect, useRef } from 'react';
import { animate, splitText, stagger } from 'animejs';
import { prefersReducedMotion } from '../../lib/fx';

/** Headline whose letters rise out of their word boxes (anime.js splitText). Avoid emoji in `text`. */
export function SplitTitle({
  text,
  className,
  delay = 0,
  as = 'h1',
}: {
  text: string;
  className?: string;
  delay?: number;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const split = splitText(el, { words: { wrap: 'clip' }, chars: true });
    const anim = animate(split.chars, {
      y: ['105%', '0%'],
      opacity: [0, 1],
      duration: 800,
      delay: stagger(22, { start: delay }),
      ease: 'out(4)',
    });
    return () => {
      anim.revert();
      split.revert();
    };
  }, [text, delay]);

  return createElement(as, { ref, className: className ? `split-title ${className}` : 'split-title', key: text }, text);
}
