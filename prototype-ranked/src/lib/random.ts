/** mulberry32 — tiny deterministic PRNG so bots and daily quests stay stable across reloads. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const seeded = (...parts: (string | number)[]) => mulberry32(hashString(parts.join('|')));

export function shuffle<T>(arr: readonly T[], rnd: () => number = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pick = <T,>(arr: readonly T[], rnd: () => number = Math.random): T =>
  arr[Math.floor(rnd() * arr.length)];

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

export const uid = (prefix = '') =>
  prefix + Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
