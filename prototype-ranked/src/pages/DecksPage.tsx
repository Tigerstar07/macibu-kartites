import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Plus, Search, SearchX } from 'lucide-react';
import type { CategoryId, Lang } from '../types';
import { useAllDecks, useGame } from '../store/useGame';
import { CATEGORIES } from '../data/decks';
import { deckCounts } from '../lib/questions';
import { plural } from '../lib/format';
import { useLang, useT } from '../lib/i18n';
import { cn } from '../lib/cn';
import { sfx } from '../lib/sound';
import { DeckCard } from '../components/decks/DeckCard';
import { Button } from '../components/ui/Button';
import { Tabs } from '../components/ui/Tabs';
import { SplitTitle } from '../components/ui/SplitTitle';

/** Accent- and case-insensitive, so "galvaspilsetas" finds "galvaspilsētas". */
const norm = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

export default function DecksPage() {
  const t = useT();
  const lang = useLang();
  const navigate = useNavigate();
  const decks = useAllDecks();
  const progress = useGame((s) => s.progress);
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<CategoryId | 'all'>('all');
  const [language, setLanguage] = useState<Lang | 'all'>('all');
  const [mine, setMine] = useState(false);
  const [tag, setTag] = useState<string | null>(null);

  const tags = useMemo(() => {
    const m = new Map<string, number>();
    decks.forEach((d) => d.tags.forEach((tg) => m.set(tg, (m.get(tg) ?? 0) + 1)));
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 16)
      .map(([k]) => k);
  }, [decks]);

  const filtered = useMemo(() => {
    const q = norm(query.trim());
    return decks.filter(
      (d) =>
        (cat === 'all' || d.category === cat) &&
        (language === 'all' || d.language === language) &&
        (!mine || !d.builtin) &&
        (!tag || d.tags.includes(tag)) &&
        (!q || norm(`${d.title} ${d.description} ${d.tags.join(' ')}`).includes(q)),
    );
  }, [decks, query, cat, language, mine, tag]);

  const totalCards = decks.reduce((s, d) => s + d.cards.length, 0);
  const reset = () => {
    setQuery('');
    setCat('all');
    setLanguage('all');
    setMine(false);
    setTag(null);
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <SplitTitle text={t('Kartīšu kopas', 'Decks')} className="font-display text-4xl font-extrabold" />
          <p className="mt-1 text-muted">
            {decks.length} {plural(decks.length, lang, 'kopa', 'kopas', 'deck', 'decks')} · {totalCards}{' '}
            {plural(totalCards, lang, 'kartīte', 'kartītes', 'card', 'cards')}
          </p>
        </div>
        <Button variant="primary" size="lg" shine icon={<Plus className="size-5" />} onClick={() => navigate('/decks/new')}>
          {t('Izveidot kopu', 'Create deck')}
        </Button>
      </header>

      <div className="mt-6 rounded-[28px] glass p-4 sm:p-5">
        <div className="flex flex-wrap gap-3">
          <label className="relative min-w-[220px] flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-dim" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('Meklēt kopas, tēmas, tagus…', 'Search decks, topics, tags…')}
              aria-label={t('Meklēt kopas', 'Search decks')}
              className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 pl-12 pr-4 outline-none transition placeholder:text-dim focus:border-violet-400/60 focus:bg-white/8"
            />
          </label>
          <Tabs
            value={language}
            onChange={setLanguage}
            layoutId="deck-lang-filter"
            options={[
              { value: 'all', label: t('Visas valodas', 'All languages') },
              { value: 'lv', label: 'LV' },
              { value: 'en', label: 'EN' },
            ]}
          />
          <button
            type="button"
            onClick={() => {
              sfx.tap();
              setMine((v) => !v);
            }}
            aria-pressed={mine}
            className={cn(
              'h-12 rounded-2xl border px-4 font-semibold transition',
              mine ? 'border-violet-400/60 bg-violet-500/20 text-white' : 'border-white/10 bg-white/5 text-muted hover:text-white',
            )}
          >
            {t('Tikai manas', 'Mine only')}
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {[{ id: 'all' as const, lv: 'Visas', en: 'All' }, ...CATEGORIES].map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                sfx.tap();
                setCat(c.id);
              }}
              aria-pressed={cat === c.id}
              className={cn(
                'rounded-xl px-3.5 py-1.5 text-sm font-semibold transition',
                cat === c.id ? 'bg-white text-ink-900' : 'bg-white/6 text-muted hover:bg-white/10 hover:text-white',
              )}
            >
              {c[lang]}
            </button>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {tags.map((tg) => (
            <button
              key={tg}
              type="button"
              onClick={() => setTag(tag === tg ? null : tg)}
              aria-pressed={tag === tg}
              className={cn(
                'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                tag === tg ? 'bg-cyan-400/25 text-cyan-100' : 'bg-white/5 text-muted hover:text-white',
              )}
            >
              #{tg}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((d, i) => (
            <DeckCard key={d.id} deck={d} counts={deckCounts(d, progress)} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 flex flex-col items-center text-center">
          <div className="grid size-16 place-items-center rounded-2xl bg-white/5 text-muted">
            <SearchX className="size-8" />
          </div>
          <p className="mt-4 text-lg font-semibold">{t('Nekas netika atrasts', 'Nothing found')}</p>
          <p className="mt-1 text-muted">{t('Pamēģini citu vārdu vai notīri filtrus.', 'Try another word or clear the filters.')}</p>
          <Button variant="secondary" className="mt-5" onClick={reset}>
            {t('Notīrīt filtrus', 'Clear filters')}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
