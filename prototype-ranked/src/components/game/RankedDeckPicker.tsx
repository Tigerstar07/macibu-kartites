import { useState } from 'react';
import { Check, Play, X } from 'lucide-react';
import type { Deck } from '../../types';
import { CATEGORIES } from '../../data/decks';
import { isPlayable } from '../../lib/questions';
import { rankAt, rankName, rankRPFactor } from '../../lib/rank';
import { useLang, useT } from '../../lib/i18n';
import { cn } from '../../lib/cn';
import { RankEmblem } from '../rank/RankEmblem';
import { Button } from '../ui/Button';

interface Props {
  decks: Deck[];
  playerRankIndex: number;
  initialDeckId?: string;
  onStart: (deckIds: string[]) => void;
  onCancel: () => void;
}

const MIN_TOPICS = 5;

export function RankedDeckPicker({ decks, playerRankIndex, initialDeckId, onStart, onCancel }: Props) {
  const t = useT();
  const lang = useLang();
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    initialDeckId && decks.some((deck) => deck.id === initialDeckId && isPlayable(deck)) ? [initialDeckId] : [],
  );
  const currentRank = rankAt(playerRankIndex);
  const playableDecks = decks.filter(isPlayable);

  const toggle = (deckId: string) => {
    setSelectedIds((selected) =>
      selected.includes(deckId) ? selected.filter((id) => id !== deckId) : [...selected, deckId],
    );
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs font-black uppercase tracking-[0.18em] text-brand">{t('Rangu spēle', 'Ranked match')}</div>
          <h1 className="mt-2 font-display text-3xl font-extrabold sm:text-4xl">{t('Izvēlies vismaz 5 tēmas', 'Choose at least 5 topics')}</h1>
          <p className="mt-2 max-w-2xl text-muted">
            {t('Izvēlētās kopas veidos spēles tēmu izlasi. Tavs pašreizējais rangs tiek meklēts biežāk.', 'Your selected packs form the match pool. Packs for your current rank are picked more often.')}
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-card border-2 border-ink bg-card px-4 py-2 shadow-hard-sm">
          <RankEmblem rankIndex={playerRankIndex} size={42} idle={false} glow={false} />
          <div>
            <div className="text-xs font-bold uppercase text-muted">{t('Tavs rangs', 'Your rank')}</div>
            <div className="font-display font-extrabold">{rankName(currentRank, lang)}</div>
          </div>
        </div>
      </header>

      <section aria-label={t('Pieejamās tēmas', 'Available topics')} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {playableDecks.map((deck) => {
          const selected = selectedIds.includes(deck.id);
          const packRankIndex = deck.rankIndex ?? playerRankIndex;
          const packRank = rankAt(packRankIndex);
          const category = CATEGORIES.find((item) => item.id === deck.category);
          const factor = deck.builtin ? rankRPFactor(packRankIndex, playerRankIndex) : null;

          return (
            <button
              key={deck.id}
              type="button"
              aria-pressed={selected}
              onClick={() => toggle(deck.id)}
              className={cn(
                'flex min-h-28 items-start gap-3 rounded-card border-2 border-ink p-4 text-left shadow-hard-sm transition',
                selected ? 'bg-brand-soft/35 dark:bg-brand/20' : 'bg-card hover:-translate-y-0.5 hover:shadow-hard',
              )}
            >
              <RankEmblem rankIndex={packRankIndex} size={42} idle={false} glow={false} />
              <span className="min-w-0 flex-1">
                <span className="flex items-start justify-between gap-2">
                  <span className="font-display font-extrabold leading-tight">{deck.title}</span>
                  <span className={cn('grid size-6 shrink-0 place-items-center rounded-md border-2 border-ink', selected ? 'bg-acid text-ink' : 'bg-paper-2 text-transparent')}>
                    <Check className="size-4" strokeWidth={3} />
                  </span>
                </span>
                <span className="mt-1 block text-sm text-muted">{category?.[lang] ?? deck.category} · {rankName(packRank, lang)}</span>
                <span className="mt-1 block text-xs font-bold text-muted">
                  {factor === null
                    ? t('Kopiena · bez RP', 'Community · no RP')
                    : factor === 1
                      ? t('Tava ranga kopa · RP ×1', 'Your rank · RP ×1')
                      : t(`RP ×${factor}`, `RP ×${factor}`)}
                </span>
              </span>
            </button>
          );
        })}
      </section>

      <footer className="sticky bottom-3 z-20 mt-7 flex flex-wrap items-center justify-between gap-3 rounded-card border-2 border-ink bg-card/95 p-3 shadow-hard backdrop-blur sm:p-4">
        <div>
          <div className="font-display text-lg font-extrabold tabular">{selectedIds.length} / {MIN_TOPICS}</div>
          <div className="text-sm text-muted">{t('Izvēlētas tēmas', 'Topics selected')}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" icon={<X className="size-4" />} onClick={onCancel}>
            {t('Atpakaļ', 'Back')}
          </Button>
          <Button
            variant="primary"
            shine
            disabled={selectedIds.length < MIN_TOPICS}
            icon={<Play className="size-4 fill-current" />}
            onClick={() => onStart(selectedIds)}
          >
            {t('Sākt spēli', 'Start match')}
          </Button>
        </div>
      </footer>
    </main>
  );
}