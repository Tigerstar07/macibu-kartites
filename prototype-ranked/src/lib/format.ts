import type { Lang } from '../types';

const locale = (l: Lang) => (l === 'lv' ? 'lv-LV' : 'en-GB');

export const fmtNum = (n: number, l: Lang) => new Intl.NumberFormat(locale(l)).format(Math.round(n));

export const fmtDec = (n: number, l: Lang, digits = 1) =>
  new Intl.NumberFormat(locale(l), { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n);

export const fmtSec = (ms: number, l: Lang) => `${fmtDec(ms / 1000, l)} s`;

export const fmtPct = (v: number, l: Lang) =>
  new Intl.NumberFormat(locale(l), { style: 'percent', maximumFractionDigits: 0 }).format(v);

export const fmtDate = (t: number, l: Lang) =>
  new Intl.DateTimeFormat(locale(l), { day: 'numeric', month: 'short', year: 'numeric' }).format(t);

export const fmtShortDate = (t: number, l: Lang) =>
  new Intl.DateTimeFormat(locale(l), { day: 'numeric', month: 'short' }).format(t);

export function fmtCountdown(ms: number, l: Lang) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const p = (n: number) => String(n).padStart(2, '0');
  if (d > 0) return l === 'lv' ? `${d} d. ${p(h)} st. ${p(m)} min.` : `${d}d ${p(h)}h ${p(m)}m`;
  return l === 'lv' ? `${p(h)} st. ${p(m)} min. ${p(sec)} s` : `${p(h)}h ${p(m)}m ${p(sec)}s`;
}

export function fmtRelDue(due: number, now: number, l: Lang) {
  const diff = due - now;
  if (diff <= 0) return l === 'lv' ? 'tagad' : 'now';
  const mins = Math.round(diff / 60000);
  if (mins < 60) return l === 'lv' ? `pēc ${mins} min.` : `in ${mins} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return l === 'lv' ? `pēc ${hrs} st.` : `in ${hrs} h`;
  const days = Math.round(hrs / 24);
  return l === 'lv' ? `pēc ${days} d.` : `in ${days} d`;
}

/** Latvian: 1, 21, 31… take the singular form (except 11). */
export function plural(n: number, l: Lang, lvOne: string, lvMany: string, enOne: string, enMany: string) {
  if (l === 'lv') return n % 10 === 1 && n % 100 !== 11 ? lvOne : lvMany;
  return n === 1 ? enOne : enMany;
}
