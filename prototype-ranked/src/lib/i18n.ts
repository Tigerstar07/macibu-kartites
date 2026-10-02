import { useCallback } from 'react';
import type { Lang } from '../types';
import { useGame } from '../store/useGame';
import { fmtNum } from './format';

/** UI copy lives next to its usage as `t('latviski', 'in English')` pairs. */
export const useLang = (): Lang => useGame((s) => s.settings.lang);

export function useT() {
  const lang = useLang();
  return useCallback((lv: string, en: string) => (lang === 'lv' ? lv : en), [lang]);
}

export const pickLang = (lang: Lang, o: { lv: string; en: string }) => o[lang];

/** Memoised locale number formatter (stable identity per language, safe for <Counter format>). */
export function useNumFmt() {
  const lang = useLang();
  return useCallback((n: number) => fmtNum(n, lang), [lang]);
}
