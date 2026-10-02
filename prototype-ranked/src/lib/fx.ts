import { animate, createTimeline, spring, utils } from 'animejs';
import confetti from 'canvas-confetti';

/**
 * Imperative "game juice" helpers built on anime.js. Particles and floating
 * text live in a fixed #fx-layer outside React, so effects never cause
 * re-renders and clean themselves up when their animation completes.
 */

export const prefersReducedMotion = () =>
  document.documentElement.classList.contains('reduce-motion') ||
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const layer = (): HTMLElement => document.getElementById('fx-layer') ?? document.body;

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export function centerOf(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/** First element matching `selector` that is actually on screen (desktop vs mobile HUDs). */
export function visibleEl(selector: string): Element | null {
  for (const el of Array.from(document.querySelectorAll(selector))) {
    const r = el.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) return el;
  }
  return null;
}

type Shape = 'circle' | 'star' | 'square' | 'diamond';

const CLIP: Partial<Record<Shape, string>> = {
  star: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
  diamond: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)',
};

function particle(x: number, y: number, size: number, color: string, shape: Shape): HTMLElement {
  const el = document.createElement('span');
  el.className = 'fx-particle';
  const s = el.style;
  s.left = `${x - size / 2}px`;
  s.top = `${y - size / 2}px`;
  s.width = `${size}px`;
  s.height = `${size}px`;
  s.background = color;
  if (shape === 'circle') {
    s.borderRadius = '50%';
    s.boxShadow = `0 0 ${size * 1.5}px ${color}`;
  } else if (shape === 'square') s.borderRadius = '2px';
  else s.clipPath = CLIP[shape] ?? '';
  layer().appendChild(el);
  return el;
}

export interface BurstOpts {
  count?: number;
  colors?: string[];
  spread?: number;
  size?: [number, number];
  shapes?: Shape[];
  gravity?: number;
  duration?: number;
}

/** Radial particle explosion at a screen point. */
export function burst(x: number, y: number, opts: BurstOpts = {}) {
  if (prefersReducedMotion()) return;
  const {
    count = 18,
    colors = ['#34d399', '#6ee7b7', '#fde68a', '#ffffff'],
    spread = 130,
    size = [5, 11],
    shapes = ['circle', 'star', 'diamond'],
    gravity = 50,
    duration = 950,
  } = opts;
  for (let i = 0; i < count; i++) {
    const el = particle(x, y, utils.random(size[0], size[1]), colors[i % colors.length], shapes[i % shapes.length]);
    const angle = (Math.PI * 2 * i) / count + utils.random(-0.3, 0.3, 2);
    const dist = utils.random(spread * 0.4, spread);
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist;
    animate(el, {
      x: [0, dx * 0.85, dx],
      y: [0, dy * 0.85, dy + gravity],
      scale: [0.3, 1.25, 0],
      rotate: utils.random(-240, 240),
      opacity: [1, 1, 0],
      duration: utils.random(duration * 0.7, duration),
      ease: 'out(3)',
      onComplete: () => el.remove(),
    });
  }
}

/** Expanding shockwave ring. */
export function ring(x: number, y: number, color = '#34d399', size = 180, duration = 650) {
  if (prefersReducedMotion()) return;
  const el = document.createElement('span');
  el.className = 'fx-ring';
  Object.assign(el.style, {
    left: `${x - size / 2}px`,
    top: `${y - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderColor: color,
    boxShadow: `0 0 28px ${color}, inset 0 0 28px ${color}`,
  });
  layer().appendChild(el);
  animate(el, {
    scale: [0.1, 1],
    opacity: [0.95, 0],
    borderWidth: ['12px', '1px'],
    duration,
    ease: 'out(3)',
    onComplete: () => el.remove(),
  });
}

/** Floating "+15 RP" text that pops up and optionally flies into a HUD element. */
export function floatText(
  text: string,
  x: number,
  y: number,
  opts: { color?: string; size?: number; to?: Element | null; onArrive?: () => void; rise?: number; delay?: number } = {},
) {
  const { color = '#fde68a', size = 26, to, onArrive, rise = 60, delay = 0 } = opts;
  const el = document.createElement('span');
  el.className = 'fx-float';
  el.textContent = text;
  Object.assign(el.style, { left: `${x}px`, top: `${y}px`, color, fontSize: `${size}px`, opacity: '0' });
  layer().appendChild(el);
  if (prefersReducedMotion()) {
    el.style.opacity = '1';
    setTimeout(() => {
      el.remove();
      onArrive?.();
    }, 600);
    return;
  }
  const tl = createTimeline({ delay, onComplete: () => el.remove() });
  tl.add(el, { y: [12, -rise], scale: [0.4, 1.3, 1], opacity: [0, 1], duration: 520, ease: 'out(4)' });
  if (to) {
    const target = centerOf(to);
    tl.add(
      el,
      {
        x: target.x - x,
        y: target.y - y,
        scale: 0.4,
        opacity: [1, 0.3],
        duration: 460,
        ease: 'in(3)',
        onComplete: () => onArrive?.(),
      },
      '+=140',
    );
  } else {
    tl.add(el, { y: -rise - 34, opacity: 0, duration: 520, ease: 'in(2)' }, '+=260');
  }
}

/** Damped horizontal shake — apply to a plain wrapper, not a Motion-driven node. */
export function shake(el: Element | null | undefined, strength = 10, duration = 420) {
  if (!el || prefersReducedMotion()) return;
  const s = strength;
  animate(el, { x: [0, -s, s * 0.9, -s * 0.7, s * 0.5, -s * 0.3, s * 0.15, 0], duration, ease: 'linear' });
}

/** Quick squash & springy settle. */
export function pop(el: Element | null | undefined, scale = 1.18) {
  if (!el || prefersReducedMotion()) return;
  animate(el, {
    scale: [
      { to: scale, duration: 110, ease: 'out(2)' },
      { to: 1, ease: spring({ bounce: 0.55, duration: 420 }) },
    ],
  });
}

/** Full-screen vignette flash (red on mistakes, gold on big wins). */
export function flash(color = 'rgba(251,113,133,0.4)', duration = 480) {
  if (prefersReducedMotion()) return;
  const el = document.createElement('div');
  el.className = 'fx-flash';
  el.style.background = `radial-gradient(ellipse at center, transparent 35%, ${color} 100%)`;
  layer().appendChild(el);
  animate(el, { opacity: [0, 1, 0], duration, ease: 'out(2)', onComplete: () => el.remove() });
}

/** Count a number up inside an element (throttled tick callback for sounds). */
export function countUp(
  el: HTMLElement | null,
  from: number,
  to: number,
  opts: { duration?: number; delay?: number; format?: (n: number) => string; onTick?: () => void } = {},
) {
  if (!el) return;
  const { duration = 900, delay = 0, format = (n) => String(Math.round(n)), onTick } = opts;
  if (prefersReducedMotion() || from === to) {
    el.textContent = format(to);
    return;
  }
  const obj = { v: from };
  let last = Math.round(from);
  let lastTick = 0;
  el.textContent = format(from);
  return animate(obj, {
    v: to,
    duration,
    delay,
    ease: 'out(3)',
    onUpdate: () => {
      const r = Math.round(obj.v);
      if (r === last) return;
      last = r;
      el.textContent = format(r);
      const now = performance.now();
      if (onTick && now - lastTick > 55) {
        lastTick = now;
        onTick();
      }
    },
    onComplete: () => {
      el.textContent = format(to);
    },
  });
}

/** Coins that scatter from a point and home in on a HUD counter. */
export function flyCoins(from: { x: number; y: number }, to: Element | null, count = 8, onEach?: (i: number) => void) {
  if (!to) return;
  const target = centerOf(to);
  if (prefersReducedMotion()) {
    onEach?.(0);
    return;
  }
  for (let i = 0; i < count; i++) {
    const el = document.createElement('span');
    el.className = 'fx-coin';
    Object.assign(el.style, { left: `${from.x - 9}px`, top: `${from.y - 9}px` });
    layer().appendChild(el);
    const sx = utils.random(-70, 70);
    const sy = utils.random(-80, -20);
    createTimeline({ delay: i * 55, onComplete: () => el.remove() })
      .add(el, { x: sx, y: sy, scale: [0.2, 1.1], duration: 300, ease: 'out(3)' })
      .add(el, {
        x: target.x - from.x,
        y: target.y - from.y,
        scale: 0.6,
        duration: 520,
        ease: 'in(3)',
        onComplete: () => onEach?.(i),
      });
  }
}

export function confettiBurst(colors: string[], origin = { x: 0.5, y: 0.45 }, particleCount = 110) {
  if (prefersReducedMotion()) return;
  confetti({ particleCount, spread: 90, startVelocity: 48, ticks: 240, origin, colors, zIndex: 400, scalar: 1.05 });
}

export function confettiCannons(colors: string[]) {
  if (prefersReducedMotion()) return;
  const fire = (x: number, angle: number, particleCount = 70) =>
    confetti({ particleCount, angle, spread: 62, origin: { x, y: 0.8 }, startVelocity: 62, ticks: 280, colors, zIndex: 400, scalar: 1.1 });
  fire(0, 58);
  fire(1, 122);
  setTimeout(() => {
    fire(0.05, 70, 50);
    fire(0.95, 110, 50);
  }, 260);
}
