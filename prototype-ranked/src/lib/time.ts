export const MINUTE = 60_000;
export const HOUR = 3_600_000;
export const DAY = 86_400_000;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local calendar day as YYYY-MM-DD. */
export function dayKey(t: number | Date = Date.now()): string {
  const d = new Date(t);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseDayKey(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

/** Whole days from a to b (DST-safe). */
export const daysBetween = (a: string, b: string) => Math.round((parseDayKey(b) - parseDayKey(a)) / DAY);

/** Monday 00:00 local time of the week containing t. */
export function weekStart(t: number = Date.now()): number {
  const d = new Date(t);
  const offset = (d.getDay() + 6) % 7;
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - offset);
  return d.getTime();
}

export function weekEnd(t: number = Date.now()): number {
  const d = new Date(weekStart(t));
  d.setDate(d.getDate() + 7);
  return d.getTime();
}

export const weekId = (t: number = Date.now()) => dayKey(weekStart(t));

export function greetingKey(t: number = Date.now()): 'morning' | 'day' | 'evening' | 'night' {
  const h = new Date(t).getHours();
  if (h >= 5 && h < 11) return 'morning';
  if (h >= 11 && h < 17) return 'day';
  if (h >= 17 && h < 23) return 'evening';
  return 'night';
}
