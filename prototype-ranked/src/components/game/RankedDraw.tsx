import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useReducedMotion } from 'motion/react';
import { ArrowLeft, Check, Shuffle, Sparkles } from 'lucide-react';
import type { Deck } from '../../types';
import { chooseRankedDeck, rankAt, rankName } from '../../lib/rank';
import { useLang, useT } from '../../lib/i18n';
import { useGame } from '../../store/useGame';
import { DECK_ICONS } from '../ui/Icons';
import { Button } from '../ui/Button';
import { RankEmblem } from '../rank/RankEmblem';

const LANDING_INDEX = 32;
const SPIN_MS = 3200;

export function RankedDraw({ decks, playerRankIndex, onStart, onCancel }: {
  decks: Deck[];
  playerRankIndex: number;
  onStart: (deck: Deck) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const lang = useLang();
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = useGame((state) => state.settings.reducedMotion) || systemReducedMotion;
  const [draw] = useState(() => {
    const eligible = decks.filter((deck) => chooseRankedDeck([deck], playerRankIndex, () => 0));
    const winner = chooseRankedDeck(eligible, playerRankIndex);
    if (!winner) return null;
    const strip = Array.from({ length: LANDING_INDEX + 5 }, (_, index) => eligible[index % eligible.length]);
    strip[LANDING_INDEX] = winner;
    return { winner, strip };
  });
  const [landed, setLanded] = useState(false);
  const startRef = useRef(onStart);
  startRef.current = onStart;

  useEffect(() => {
    if (!draw) return;
    const spinTime = reducedMotion ? 100 : SPIN_MS;
    const landing = window.setTimeout(() => setLanded(true), spinTime);
    const start = window.setTimeout(() => startRef.current(draw.winner), spinTime + 1100);
    return () => { window.clearTimeout(landing); window.clearTimeout(start); };
  }, [draw, reducedMotion]);

  return (
    <main className="relative z-10 flex min-h-dvh flex-col items-center justify-center px-4 py-10 text-fg">
      <div className="w-full max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Button variant="secondary" icon={<ArrowLeft className="size-4" />} onClick={onCancel}>{t('Atpakaļ', 'Back')}</Button>
          <div className="flex items-center gap-2 rounded-xl border-2 border-ink bg-card px-3 py-2 shadow-hard-sm">
            <RankEmblem rankIndex={playerRankIndex} size={32} idle={false} glow={false} />
            <span className="font-bold">{rankName(rankAt(playerRankIndex), lang)}</span>
          </div>
        </div>
        <header className="mb-8 text-center">
          <p className="mb-2 text-sm font-black uppercase tracking-widest text-brand">Ranked</p>
          <h1 className="font-display text-3xl font-extrabold sm:text-5xl">{t('Tava nākamā tēma', 'Your next challenge')}</h1>
          <p className="mt-3 text-muted">{t('Nejauša atbloķēta kopa. Atbildi pareizi un pelni RP!', 'A random unlocked pack. Answer correctly and earn RP!')}</p>
        </header>
        {draw ? <>
          <div className="relative rounded-card border-2 border-ink bg-card py-8 shadow-hard-lg">
            <div aria-hidden="true" className="absolute -top-4 left-1/2 z-20 -translate-x-1/2 text-3xl text-brand">▼</div>
            <div className="overflow-hidden py-3" aria-hidden="true">
              <div className="ranked-reel relative left-1/2 flex w-max gap-3" style={{
                '--draw-end': `${-(LANDING_INDEX * 208 + 98)}px`,
                animationDuration: `${SPIN_MS}ms`,
                ...(reducedMotion ? { animation: 'none', transform: `translateX(${-(LANDING_INDEX * 208 + 98)}px)` } : {}),
              } as CSSProperties}>
                {draw.strip.map((deck, index) => {
                  const Icon = DECK_ICONS[deck.icon];
                  const selected = landed && index === LANDING_INDEX;
                  return <div key={index} className={`flex h-44 w-[196px] shrink-0 flex-col items-center justify-center rounded-2xl border-2 border-ink px-3 text-center transition-colors ${selected ? 'bg-acid text-ink' : 'bg-paper-2 text-fg'}`}>
                    <Icon className="mb-3 size-10" strokeWidth={2.2} />
                    <span className="font-display text-lg font-extrabold leading-tight">{deck.title}</span>
                    <span className="mt-2 text-xs font-bold">{deck.cards.length} {t('kartītes', 'cards')}</span>
                  </div>;
                })}
              </div>
            </div>
            <div aria-hidden="true" className="absolute -bottom-4 left-1/2 z-20 -translate-x-1/2 text-3xl text-brand">▲</div>
          </div>
          <div role="status" aria-live="polite" className="mt-10 min-h-20 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border-2 border-ink bg-card px-5 py-2 font-bold shadow-hard-sm">
              {landed ? <Check className="size-5 text-brand" /> : <Shuffle className="size-5 text-brand" />}
              {landed ? draw.winner.title : t('Izvēlamies tavu kopu...', 'Drawing your pack...')}
            </div>
            <p className="mt-3 text-sm text-muted">{landed ? t('Kopa izvēlēta! Spēle tūlīt sāksies.', 'Pack selected! Your match starts now.') : t('Katrai spēlei jauna izloze', 'A new draw for every match')}</p>
          </div>
        </> : <div role="status" className="rounded-card border-2 border-ink bg-card p-8 text-center">
          <Sparkles className="mx-auto mb-4 size-10 text-brand" />
          <p className="font-bold">{t('Tavam rangam pašlaik nav pieejamas spēlējamas kopas.', 'No playable packs are available for your rank.')}</p>
          <p className="mt-2 text-muted">{t('Atgriezies sākumā vai izvēlies treniņu sadaļā Kopas.', 'Return home or choose practice from Decks.')}</p>
        </div>}
      </div>
    </main>
  );
}
