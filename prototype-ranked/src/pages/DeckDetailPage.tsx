import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, Pencil, Play, Trash2 } from 'lucide-react';
import type { Deck } from '../types';
import { useDeck, useGame } from '../store/useGame';
import { CATEGORIES } from '../data/decks';
import { cardKey, deckCounts, isPlayable } from '../lib/questions';
import { mastery, type Mastery } from '../lib/sm2';
import { fmtDate, fmtRelDue } from '../lib/format';
import { uid } from '../lib/random';
import { useLang, useT } from '../lib/i18n';
import { cn } from '../lib/cn';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { Ring } from '../components/ui/Meters';
import { DECK_ICONS } from '../components/ui/Icons';

const MASTERY_META: Record<Mastery, { lv: string; en: string; cls: string }> = {
  new: { lv: 'Jauna', en: 'New', cls: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border border-slate-500/20' },
  learning: { lv: 'Mācās', en: 'Learning', cls: 'bg-amber-500/15 text-amber-800 dark:text-amber-200 border border-amber-500/20' },
  review: { lv: 'Atkārto', en: 'Reviewing', cls: 'bg-sky-500/15 text-sky-800 dark:text-sky-200 border border-sky-500/20' },
  mastered: { lv: 'Apgūta', en: 'Mastered', cls: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20' },
};

export default function DeckDetailPage() {
  const { deckId } = useParams();
  const deck = useDeck(deckId);
  const t = useT();
  const lang = useLang();
  const navigate = useNavigate();
  const progress = useGame((s) => s.progress);
  const saveDeck = useGame((s) => s.saveDeck);
  const deleteDeck = useGame((s) => s.deleteDeck);
  const profile = useGame((s) => s.profile);
  const [confirmDel, setConfirmDel] = useState(false);

  if (!deck) {
    return (
      <div className="mt-16 text-center">
        <h1 className="font-display text-2xl font-bold">{t('Kopa nav atrasta', 'Deck not found')}</h1>
        <Link to="/decks" className="mt-4 inline-flex items-center gap-2 font-semibold text-violet-300">
          <ArrowLeft className="size-4" /> {t('Uz kopām', 'Back to decks')}
        </Link>
      </div>
    );
  }

  const counts = deckCounts(deck, progress);
  const playable = isPlayable(deck);
  const Icon = DECK_ICONS[deck.icon];
  const category = CATEGORIES.find((c) => c.id === deck.category);
  const now = Date.now();

  const duplicate = () => {
    const ts = Date.now();
    const copy: Deck = {
      ...deck,
      id: uid('d'),
      title: `${deck.title} (${t('kopija', 'copy')})`.slice(0, 60),
      builtin: false,
      author: profile?.name ?? 'Es',
      createdAt: ts,
      updatedAt: ts,
      cards: deck.cards.map((c) => ({ ...c, id: uid('k'), wrong: c.wrong ? [...c.wrong] : undefined })),
    };
    saveDeck(copy);
    navigate(`/decks/${copy.id}/edit`);
  };

  const tiles = [
    { label: t('Kartītes', 'Cards'), value: counts.total, color: 'var(--color-fg)' },
    { label: t('Jāatkārto', 'Due'), value: counts.due, color: 'var(--color-bad)' },
    { label: t('Jaunas', 'New'), value: counts.fresh, color: 'var(--color-brand)' },
    { label: t('Apgūtas', 'Mastered'), value: counts.mastered, color: 'var(--color-good)' },
  ];

  return (
    <div>
      <Link to="/decks" className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> {t('Visas kopas', 'All decks')}
      </Link>

      <section className="mt-4 overflow-hidden rounded-[32px] glass">
        <div
          className="relative h-40 overflow-hidden sm:h-48"
          style={{ background: `linear-gradient(135deg, hsl(${deck.hue} 85% 58%), hsl(${(deck.hue + 45) % 360} 78% 36%))` }}
        >
          <div className="absolute -right-10 -top-16 size-64 rounded-full bg-white/15" />
          <div className="absolute -bottom-24 right-40 size-52 rounded-full bg-black/15" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(255,255,255,0.35),transparent_55%)]" />
          <motion.div
            initial={{ scale: 0.4, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16 }}
            className="absolute bottom-6 left-7"
          >
            <Icon className="size-16 text-white drop-shadow-[0_6px_14px_rgba(0,0,0,0.35)]" />
          </motion.div>
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="min-w-0 max-w-2xl">
              <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl">{deck.title}</h1>
              <p className="mt-2 text-lg text-muted">{deck.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                {category && <span className="rounded-lg border border-ink/15 bg-paper-2 px-2.5 py-1 font-semibold">{category[lang]}</span>}
                <span className="rounded-lg border border-ink/15 bg-paper-2 px-2.5 py-1 font-semibold uppercase">{deck.language}</span>
                <span className="rounded-lg border border-ink/15 bg-paper-2 px-2.5 py-1 text-muted">
                  {t('Autors', 'By')}: {deck.author}
                </span>
                <span className="rounded-lg border border-ink/15 bg-paper-2 px-2.5 py-1 text-muted">
                  {t('Atjaunots', 'Updated')} {fmtDate(deck.updatedAt, lang)}
                </span>
                {deck.tags.map((tg) => (
                  <span key={tg} className="rounded-lg border border-info/30 bg-info-soft px-2.5 py-1 font-semibold text-ink dark:text-sky-300">
                    #{tg}
                  </span>
                ))}
              </div>
            </div>
            <Ring value={counts.mastery} size={96} stroke={9} color={`hsl(${deck.hue} 90% 65%)`}>
              <div className="text-center leading-tight">
                <div className="font-display text-lg font-bold">{Math.round(counts.mastery * 100)}%</div>
                <div className="text-[10px] text-muted">{t('apgūts', 'mastery')}</div>
              </div>
            </Ring>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {tiles.map((tile, i) => (
              <motion.div
                key={tile.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="rounded-2xl glass-soft p-4"
              >
                <div className="font-display text-3xl font-extrabold tabular" style={{ color: tile.color }}>
                  {tile.value}
                </div>
                <div className="text-sm text-muted">{tile.label}</div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              variant="primary"
              size="xl"
              shine
              disabled={!playable}
              icon={<Play className="size-5 fill-current" />}
              onClick={() => navigate(`/play/${deck.id}`)}
            >
              {t('Spēlēt', 'Play')}
            </Button>
            {deck.builtin ? (
              <Button variant="secondary" size="xl" icon={<Copy className="size-5" />} onClick={duplicate}>
                {t('Kopēt un rediģēt', 'Copy & edit')}
              </Button>
            ) : (
              <>
                <Button variant="secondary" size="xl" icon={<Pencil className="size-5" />} onClick={() => navigate(`/decks/${deck.id}/edit`)}>
                  {t('Rediģēt', 'Edit')}
                </Button>
                <Button variant="ghost" size="xl" icon={<Trash2 className="size-5" />} className="hover:text-rose-300" onClick={() => setConfirmDel(true)}>
                  {t('Dzēst', 'Delete')}
                </Button>
              </>
            )}
          </div>
          {!playable && (
            <p className="mt-3 text-sm text-amber-200">
              {t('Pievieno vismaz 4 kartītes (vai 2 nepareizus variantus katrai), lai spēlētu.', 'Add at least 4 cards (or 2 wrong options per card) to play.')}
            </p>
          )}
        </div>
      </section>

      <section className="mt-7">
        <h2 className="font-display text-2xl font-bold">{t('Kartītes', 'Cards')}</h2>
        <ul className="mt-4 space-y-2.5">
          {deck.cards.map((c, i) => {
            const p = progress[cardKey(deck.id, c.id)];
            const m = mastery(p);
            return (
              <motion.li
                key={c.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i, 14) * 0.03 }}
                className="grid gap-2 rounded-2xl border-2 border-ink bg-card shadow-hard-sm p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-center sm:gap-5"
              >
                <div className="font-semibold">{c.question}</div>
                <div className="font-medium text-emerald-600 dark:text-emerald-300">{c.answer}</div>
                <div className="flex items-center gap-2 sm:justify-end">
                  <span className={cn('rounded-lg px-2 py-0.5 text-xs font-bold', MASTERY_META[m].cls)}>{MASTERY_META[m][lang]}</span>
                  {p && <span className="text-xs text-dim">{fmtRelDue(p.due, now, lang)}</span>}
                </div>
              </motion.li>
            );
          })}
        </ul>
      </section>

      <ConfirmDialog
        open={confirmDel}
        danger
        title={t('Dzēst šo kopu?', 'Delete this deck?')}
        message={t(
          `Kopa "${deck.title}" un visu tās kartīšu progress tiks neatgriezeniski dzēsts.`,
          `"${deck.title}" and the progress on all its cards will be permanently deleted.`,
        )}
        confirmLabel={t('Dzēst', 'Delete')}
        cancelLabel={t('Atcelt', 'Cancel')}
        onCancel={() => setConfirmDel(false)}
        onConfirm={() => {
          setConfirmDel(false);
          deleteDeck(deck.id);
          navigate('/decks');
        }}
      />
    </div>
  );
}
