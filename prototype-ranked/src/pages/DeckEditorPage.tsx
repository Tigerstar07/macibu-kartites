import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowLeft, Plus, Save, Trash2 } from 'lucide-react';
import type { CategoryId, Deck, DeckIcon, Lang } from '../types';
import { useDeck, useGame } from '../store/useGame';
import { CATEGORIES } from '../data/decks';
import { uid } from '../lib/random';
import { shake } from '../lib/fx';
import { sfx } from '../lib/sound';
import { useLang, useT } from '../lib/i18n';
import { cn } from '../lib/cn';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/Modal';
import { Panel, Switch } from '../components/ui/Panel';
import { DECK_ICONS } from '../components/ui/Icons';

interface CardDraft {
  id: string;
  question: string;
  answer: string;
  wrong: string[];
  explanation: string;
}

interface Draft {
  id: string;
  title: string;
  description: string;
  category: CategoryId;
  language: Lang;
  tags: string;
  icon: DeckIcon;
  hue: number;
  reversible: boolean;
  ask: string;
  reverseAsk: string;
  isPublic: boolean;
  cards: CardDraft[];
  createdAt: number;
}

type CardErr = { question?: string; answer?: string; wrong?: string };

interface Errors {
  title?: string;
  description?: string;
  tags?: string;
  cards?: string;
  card: Record<string, CardErr>;
}

const ICONS: DeckIcon[] = ['book', 'brain', 'globe', 'languages', 'flask', 'code', 'landmark', 'calculator', 'orbit', 'music', 'palette', 'leaf'];

const emptyCard = (): CardDraft => ({ id: uid('k'), question: '', answer: '', wrong: ['', '', ''], explanation: '' });

function toDraft(deck: Deck | undefined): Draft {
  if (!deck) {
    return {
      id: uid('d'),
      title: '',
      description: '',
      category: 'other',
      language: 'lv',
      tags: '',
      icon: 'book',
      hue: 265,
      reversible: false,
      ask: '',
      reverseAsk: '',
      isPublic: true,
      cards: [emptyCard(), emptyCard(), emptyCard(), emptyCard()],
      createdAt: Date.now(),
    };
  }
  return {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    category: deck.category,
    language: deck.language,
    tags: deck.tags.join(', '),
    icon: deck.icon,
    hue: deck.hue,
    reversible: deck.reversible,
    ask: deck.ask ?? '',
    reverseAsk: deck.reverseAsk ?? '',
    isPublic: deck.isPublic,
    cards: deck.cards.map((c) => ({
      id: c.id,
      question: c.question,
      answer: c.answer,
      wrong: [...(c.wrong ?? []), '', '', ''].slice(0, 3),
      explanation: c.explanation ?? '',
    })),
    createdAt: deck.createdAt,
  };
}

const parseTags = (s: string) => [...new Set(s.split(',').map((x) => x.trim().replace(/^#/, '')).filter(Boolean))];

function validate(d: Draft, t: (lv: string, en: string) => string): Errors {
  const e: Errors = { card: {} };
  const title = d.title.trim();
  if (title.length < 3) e.title = t('Nosaukumam jābūt vismaz 3 simbolus garam.', 'Title must be at least 3 characters.');
  else if (title.length > 60) e.title = t('Nosaukums var būt līdz 60 simboliem.', 'Title can be up to 60 characters.');
  if (d.description.trim().length > 200) e.description = t('Apraksts var būt līdz 200 simboliem.', 'Description can be up to 200 characters.');
  const tags = parseTags(d.tags);
  if (tags.length > 6) e.tags = t('Ne vairāk kā 6 tagi.', 'At most 6 tags.');
  else if (tags.some((tg) => tg.length > 24)) e.tags = t('Katrs tags var būt līdz 24 simboliem.', 'Each tag can be up to 24 characters.');

  if (d.cards.length === 0) e.cards = t('Pievieno vismaz vienu kartīti.', 'Add at least one card.');
  const seen = new Set<string>();
  for (const c of d.cards) {
    const ce: CardErr = {};
    const q = c.question.trim();
    const a = c.answer.trim();
    if (!q) ce.question = t('Jautājums ir obligāts.', 'A question is required.');
    else if (q.length > 200) ce.question = t('Jautājums var būt līdz 200 simboliem.', 'Up to 200 characters.');
    else if (seen.has(q.toLowerCase())) ce.question = t('Šāds jautājums kopā jau ir.', 'This question is already in the deck.');
    seen.add(q.toLowerCase());
    if (!a) ce.answer = t('Atbilde ir obligāta.', 'An answer is required.');
    else if (a.length > 120) ce.answer = t('Atbilde var būt līdz 120 simboliem.', 'Up to 120 characters.');
    const wr = c.wrong.map((w) => w.trim()).filter(Boolean);
    if (a && wr.some((w) => w.toLowerCase() === a.toLowerCase()))
      ce.wrong = t('Nepareizais variants nedrīkst sakrist ar atbildi.', "A wrong option can't match the answer.");
    else if (new Set(wr.map((w) => w.toLowerCase())).size !== wr.length) ce.wrong = t('Varianti atkārtojas.', 'Options repeat.');
    if (Object.keys(ce).length) e.card[c.id] = ce;
  }
  if (!e.cards && d.cards.length < 4 && !d.cards.every((c) => c.wrong.filter((w) => w.trim()).length >= 2)) {
    e.cards = t(
      'Vajag vismaz 4 kartītes vai katrai kartītei vismaz 2 nepareizus variantus.',
      'You need at least 4 cards, or at least 2 wrong options on every card.',
    );
  }
  return e;
}

const hasErrors = (e: Errors) => !!(e.title || e.description || e.tags || e.cards || Object.keys(e.card).length);

const inputCls = (err?: boolean) =>
  cn(
    'w-full rounded-2xl border-2 bg-card px-4 py-3 outline-none transition placeholder:text-dim text-fg',
    err ? 'border-bad ring-2 ring-bad/20' : 'border-ink/20 focus:border-ink focus:shadow-hard-sm',
  );

function Field({ label, error, hint, children, htmlFor }: { label: string; error?: string; hint?: string; children: ReactNode; htmlFor?: string }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-semibold">
        {label}
      </label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1.5 text-sm text-rose-300">{error}</p> : hint ? <p className="mt-1.5 text-sm text-dim">{hint}</p> : null}
    </div>
  );
}

export default function DeckEditorPage() {
  const { deckId } = useParams();
  const existing = useDeck(deckId);
  const t = useT();
  const lang = useLang();
  const navigate = useNavigate();
  const saveDeck = useGame((s) => s.saveDeck);
  const profile = useGame((s) => s.profile);
  const [start] = useState(() => {
    const d = toDraft(existing);
    return { d, json: JSON.stringify(d) };
  });
  const [draft, setDraft] = useState<Draft>(start.d);
  const [submitted, setSubmitted] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const saveRef = useRef<HTMLButtonElement>(null);
  const questionRefs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const errors = useMemo(() => validate(draft, t), [draft, t]);
  const show = submitted;
  const dirty = JSON.stringify(draft) !== start.json;

  if (deckId && !existing) {
    return (
      <div className="mt-16 text-center">
        <h1 className="font-display text-2xl font-bold">{t('Kopa nav atrasta', 'Deck not found')}</h1>
        <Link to="/decks" className="mt-4 inline-flex items-center gap-2 font-semibold text-violet-300">
          <ArrowLeft className="size-4" /> {t('Uz kopām', 'Back to decks')}
        </Link>
      </div>
    );
  }
  if (existing?.builtin) {
    return (
      <div className="mx-auto mt-16 max-w-md rounded-3xl glass p-8 text-center">
        <h1 className="font-display text-2xl font-bold">{t('Iebūvēto kopu nevar rediģēt', "Built-in decks can't be edited")}</h1>
        <p className="mt-2 text-muted">{t('Atver kopu un izvēlies "Kopēt un rediģēt".', 'Open the deck and choose "Copy & edit".')}</p>
        <Link to={`/decks/${existing.id}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-violet-300">
          <ArrowLeft className="size-4" /> {t('Atpakaļ uz kopu', 'Back to deck')}
        </Link>
      </div>
    );
  }

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));
  const setCard = (id: string, patch: Partial<CardDraft>) =>
    setDraft((d) => ({ ...d, cards: d.cards.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const addCard = () => {
    const c = emptyCard();
    sfx.tap();
    setDraft((d) => ({ ...d, cards: [...d.cards, c] }));
    setTimeout(() => questionRefs.current[c.id]?.focus(), 80);
  };
  const removeCard = (id: string) => setDraft((d) => ({ ...d, cards: d.cards.filter((c) => c.id !== id) }));
  const requestRemove = (c: CardDraft) => {
    if (c.question.trim() || c.answer.trim() || c.explanation.trim() || c.wrong.some((w) => w.trim())) setRemoveId(c.id);
    else removeCard(c.id);
  };
  const leave = () => navigate(existing ? `/decks/${existing.id}` : '/decks');

  const save = () => {
    setSubmitted(true);
    if (hasErrors(errors)) {
      sfx.wrong();
      shake(saveRef.current, 9);
      setTimeout(() => document.querySelector('[aria-invalid="true"]')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 60);
      return;
    }
    const deck: Deck = {
      id: draft.id,
      title: draft.title.trim(),
      description: draft.description.trim(),
      category: draft.category,
      language: draft.language,
      tags: parseTags(draft.tags),
      icon: draft.icon,
      hue: draft.hue,
      reversible: draft.reversible,
      ask: draft.ask.trim() || undefined,
      reverseAsk: draft.reversible ? draft.reverseAsk.trim() || undefined : undefined,
      isPublic: draft.isPublic,
      cards: draft.cards.map((c) => ({
        id: c.id,
        question: c.question.trim(),
        answer: c.answer.trim(),
        wrong: c.wrong.map((w) => w.trim()).filter(Boolean),
        explanation: c.explanation.trim() || undefined,
      })),
      author: existing?.author ?? profile?.name ?? 'Es',
      builtin: false,
      createdAt: draft.createdAt,
      updatedAt: Date.now(),
    };
    saveDeck(deck);
    sfx.achievement();
    navigate(`/decks/${deck.id}`);
  };

  const PreviewIcon = DECK_ICONS[draft.icon];
  const errCount = Object.keys(errors.card).length + [errors.title, errors.description, errors.tags, errors.cards].filter(Boolean).length;

  return (
    <div className="mx-auto max-w-4xl">
      <button
        type="button"
        onClick={() => (dirty ? setConfirmLeave(true) : leave())}
        className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" /> {t('Atpakaļ', 'Back')}
      </button>
      <h1 className="mt-3 font-display text-3xl font-extrabold sm:text-4xl">{existing ? t('Rediģēt kopu', 'Edit deck') : t('Jauna kopa', 'New deck')}</h1>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_300px]">
        <Panel title={t('Informācija', 'Details')}>
          <div className="grid gap-4">
            <Field label={t('Nosaukums *', 'Title *')} error={show ? errors.title : undefined} htmlFor="deck-title">
              <input
                id="deck-title"
                value={draft.title}
                maxLength={70}
                onChange={(e) => set('title', e.target.value)}
                placeholder={t('piem. Bioloģija: šūnas uzbūve', 'e.g. Biology: cell structure')}
                aria-invalid={show && !!errors.title}
                className={inputCls(show && !!errors.title)}
              />
            </Field>
            <Field
              label={t('Apraksts', 'Description')}
              error={show ? errors.description : undefined}
              hint={`${draft.description.length}/200`}
              htmlFor="deck-desc"
            >
              <textarea
                id="deck-desc"
                value={draft.description}
                rows={2}
                maxLength={220}
                onChange={(e) => set('description', e.target.value)}
                aria-invalid={show && !!errors.description}
                className={cn(inputCls(show && !!errors.description), 'resize-none')}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('Kategorija', 'Category')} htmlFor="deck-cat">
                <select id="deck-cat" value={draft.category} onChange={(e) => set('category', e.target.value as CategoryId)} className={inputCls()}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-card text-fg">
                      {c[lang]}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={t('Valoda', 'Language')} htmlFor="deck-lang">
                <select id="deck-lang" value={draft.language} onChange={(e) => set('language', e.target.value as Lang)} className={inputCls()}>
                  <option value="lv" className="bg-card text-fg">Latviešu (LV)</option>
                  <option value="en" className="bg-card text-fg">English (EN)</option>
                </select>
              </Field>
            </div>
            <Field
              label={t('Tagi', 'Tags')}
              error={show ? errors.tags : undefined}
              hint={t('Atdali ar komatiem, līdz 6 tagiem', 'Comma-separated, up to 6')}
              htmlFor="deck-tags"
            >
              <input
                id="deck-tags"
                value={draft.tags}
                onChange={(e) => set('tags', e.target.value)}
                placeholder={t('bioloģija, šūnas, 10. klase', 'biology, cells, grade 10')}
                aria-invalid={show && !!errors.tags}
                className={inputCls(show && !!errors.tags)}
              />
            </Field>
            <Field
              label={t('Jautājuma virsraksts (neobligāts)', 'Prompt label (optional)')}
              hint={t('Parādās virs īsiem jautājumiem, piem. "Ko nozīmē šis vārds?"', 'Shown above short prompts, e.g. "What does this word mean?"')}
              htmlFor="deck-ask"
            >
              <input id="deck-ask" value={draft.ask} maxLength={80} onChange={(e) => set('ask', e.target.value)} className={inputCls()} />
            </Field>
            <div className="flex items-center justify-between gap-4 rounded-2xl glass-soft px-4 py-3">
              <div>
                <div className="font-semibold">{t('Apgrieztās kartītes', 'Reverse cards')}</div>
                <div className="text-sm text-muted">{t('Dažreiz rāda atbildi un jautā pēc jautājuma', 'Sometimes shows the answer and asks for the question')}</div>
              </div>
              <Switch checked={draft.reversible} onChange={(v) => set('reversible', v)} label={t('Apgrieztās kartītes', 'Reverse cards')} />
            </div>
            {draft.reversible && (
              <Field label={t('Apgrieztās kartītes virsraksts', 'Reverse prompt label')} htmlFor="deck-rask">
                <input id="deck-rask" value={draft.reverseAsk} maxLength={80} onChange={(e) => set('reverseAsk', e.target.value)} className={inputCls()} />
              </Field>
            )}
            <div className="flex items-center justify-between gap-4 rounded-2xl glass-soft px-4 py-3">
              <div>
                <div className="font-semibold">{t('Publiska kopa', 'Public deck')}</div>
                <div className="text-sm text-muted">{t('Citi var to atrast un spēlēt', 'Others can find and play it')}</div>
              </div>
              <Switch checked={draft.isPublic} onChange={(v) => set('isPublic', v)} label={t('Publiska kopa', 'Public deck')} />
            </div>
          </div>
        </Panel>

        <Panel title={t('Izskats', 'Look')}>
          <div
            className="relative h-28 overflow-hidden rounded-2xl"
            style={{ background: `linear-gradient(135deg, hsl(${draft.hue} 85% 58%), hsl(${(draft.hue + 45) % 360} 78% 38%))` }}
          >
            <div className="absolute -right-8 -top-10 size-32 rounded-full bg-white/15" />
            <PreviewIcon className="absolute bottom-4 left-5 size-11 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.35)]" />
            <div className="absolute bottom-4 left-20 right-4 truncate font-display font-bold text-white drop-shadow">
              {draft.title || t('Kopas nosaukums', 'Deck title')}
            </div>
          </div>
          <div className="mt-4 text-sm font-semibold">{t('Ikona', 'Icon')}</div>
          <div className="mt-2 grid grid-cols-6 gap-2">
            {ICONS.map((ic) => {
              const I = DECK_ICONS[ic];
              return (
                <button
                  key={ic}
                  type="button"
                  onClick={() => set('icon', ic)}
                  aria-pressed={draft.icon === ic}
                  aria-label={ic}
                  className={cn(
                    'grid aspect-square place-items-center rounded-xl transition',
                    draft.icon === ic ? 'border-2 border-ink bg-brand text-white shadow-hard-sm' : 'border-2 border-transparent bg-paper-2 text-muted hover:border-ink/20 hover:text-ink',
                  )}
                >
                  <I className="size-5" />
                </button>
              );
            })}
          </div>
          <label className="mt-4 block text-sm font-semibold">
            {t('Krāsa', 'Colour')}
            <input
              type="range"
              min={0}
              max={359}
              value={draft.hue}
              onChange={(e) => set('hue', Number(e.target.value))}
              className="mt-2 block w-full"
              style={{ accentColor: `hsl(${draft.hue} 85% 60%)` }}
            />
          </label>
        </Panel>
      </div>

      <Panel
        className="mt-5"
        title={`${t('Kartītes', 'Cards')} (${draft.cards.length})`}
        extra={
          <Button variant="secondary" size="sm" icon={<Plus className="size-4" />} onClick={addCard} silent>
            {t('Pievienot', 'Add')}
          </Button>
        }
      >
        {show && errors.cards && <p className="mb-3 rounded-xl border border-bad bg-bad-soft px-4 py-2.5 text-sm font-semibold text-ink">{errors.cards}</p>}
        <ol className="space-y-3">
          <AnimatePresence initial={false}>
            {draft.cards.map((c, i) => {
              const ce = show ? errors.card[c.id] : undefined;
              return (
                <motion.li
                  key={c.id}
                  layout
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                  className="rounded-2xl border-2 border-ink bg-card shadow-hard-sm p-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="grid size-8 place-items-center rounded-lg border-2 border-ink bg-paper-2 font-display text-sm font-bold text-ink">{i + 1}</span>
                    <button
                      type="button"
                      onClick={() => requestRemove(c)}
                      className="grid size-9 place-items-center rounded-xl text-dim transition hover:bg-bad hover:text-ink"
                      aria-label={t(`Dzēst kartīti ${i + 1}`, `Delete card ${i + 1}`)}
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Field label={t('Jautājums *', 'Question *')} error={ce?.question}>
                      <textarea
                        ref={(el) => {
                          questionRefs.current[c.id] = el;
                        }}
                        value={c.question}
                        rows={2}
                        onChange={(e) => setCard(c.id, { question: e.target.value })}
                        aria-invalid={!!ce?.question}
                        className={cn(inputCls(!!ce?.question), 'resize-none')}
                      />
                    </Field>
                    <Field label={t('Pareizā atbilde *', 'Correct answer *')} error={ce?.answer}>
                      <textarea
                        value={c.answer}
                        rows={2}
                        onChange={(e) => setCard(c.id, { answer: e.target.value })}
                        aria-invalid={!!ce?.answer}
                        className={cn(inputCls(!!ce?.answer), 'resize-none border-emerald-400/20')}
                      />
                    </Field>
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-semibold">
                      {t('Nepareizie varianti', 'Wrong options')} <span className="font-normal text-dim">{t('(ja tukši — ņems no citām kartītēm)', '(if empty, taken from other cards)')}</span>
                    </div>
                    <div className="mt-1.5 grid gap-2 sm:grid-cols-3">
                      {c.wrong.map((w, wi) => (
                        <input
                          key={wi}
                          value={w}
                          maxLength={120}
                          onChange={(e) => setCard(c.id, { wrong: c.wrong.map((x, xi) => (xi === wi ? e.target.value : x)) })}
                          aria-invalid={!!ce?.wrong}
                          aria-label={t(`Nepareizais variants ${wi + 1}`, `Wrong option ${wi + 1}`)}
                          className={cn(inputCls(!!ce?.wrong), 'py-2.5 text-sm')}
                        />
                      ))}
                    </div>
                    {ce?.wrong && <p className="mt-1.5 text-sm text-rose-300">{ce.wrong}</p>}
                  </div>
                  <input
                    value={c.explanation}
                    maxLength={200}
                    onChange={(e) => setCard(c.id, { explanation: e.target.value })}
                    placeholder={t('Paskaidrojums (neobligāts) — parādās pēc kļūdas', 'Explanation (optional) — shown after a mistake')}
                    aria-label={t('Paskaidrojums', 'Explanation')}
                    className={cn(inputCls(), 'mt-3 py-2.5 text-sm')}
                  />
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ol>
        <button
          type="button"
          onClick={addCard}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-ink/25 py-4 font-bold text-muted transition hover:border-ink hover:text-ink hover:bg-paper-2"
        >
          <Plus className="size-5" /> {t('Pievienot kartīti', 'Add card')}
        </button>
      </Panel>

      <div className="sticky bottom-24 z-30 mt-5 flex flex-wrap items-center justify-end gap-3 rounded-3xl border-2 border-ink bg-card p-3 shadow-hard-lg lg:bottom-4">
        {show && errCount > 0 && (
          <span className="mr-auto pl-2 text-sm text-bad font-semibold">
            {t(`Izlabo ${errCount} kļūdas`, `Fix ${errCount} issue(s)`)}
          </span>
        )}
        <Button variant="ghost" onClick={() => (dirty ? setConfirmLeave(true) : leave())}>
          {t('Atcelt', 'Cancel')}
        </Button>
        <Button ref={saveRef} variant="primary" icon={<Save className="size-4" />} onClick={save}>
          {t('Saglabāt kopu', 'Save deck')}
        </Button>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        title={t('Pamest bez saglabāšanas?', 'Leave without saving?')}
        message={t('Nesaglabātās izmaiņas tiks zaudētas.', 'Unsaved changes will be lost.')}
        confirmLabel={t('Pamest', 'Leave')}
        cancelLabel={t('Palikt', 'Stay')}
        danger
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          leave();
        }}
      />
      <ConfirmDialog
        open={!!removeId}
        title={t('Dzēst kartīti?', 'Delete this card?')}
        message={t('Kartīte tiks noņemta no kopas.', 'The card will be removed from the deck.')}
        confirmLabel={t('Dzēst', 'Delete')}
        cancelLabel={t('Atcelt', 'Cancel')}
        danger
        onCancel={() => setRemoveId(null)}
        onConfirm={() => {
          if (removeId) removeCard(removeId);
          setRemoveId(null);
        }}
      />
    </div>
  );
}
