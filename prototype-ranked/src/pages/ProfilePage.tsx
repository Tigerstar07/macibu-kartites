import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Award,
  CalendarCheck,
  ChartColumn,
  Check,
  Clock,
  Flame,
  Lock,
  Palette,
  Pencil,
  Repeat,
  Settings,
  ShoppingBag,
  Sparkles,
  Target,
  Wrench,
  Zap,
} from 'lucide-react';
import type { Rarity } from '../types';
import { effectiveStreak, useGame } from '../store/useGame';
import { rankAt, rankFromRP, rankName, ROAD } from '../lib/rank';
import { ACHIEVEMENTS } from '../lib/achievements';
import { BOOST_PRICE, COSMETICS, RARITY_META, SHOP_CHESTS, type Cosmetic, type CosmeticKind } from '../lib/cosmetics';
import { AVATARS } from '../lib/bots';
import { dayKey, weekStart } from '../lib/time';
import { fmtDate, fmtPct, fmtSec, fmtShortDate } from '../lib/format';
import { useLang, useNumFmt, useT } from '../lib/i18n';
import { burst, centerOf, confettiBurst } from '../lib/fx';
import { sfx } from '../lib/sound';
import { cn } from '../lib/cn';
import { RankEmblem } from '../components/rank/RankEmblem';
import { ChestIcon } from '../components/rewards/ChestIcon';
import { ChestOdds } from '../components/rewards/ChestOdds';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { ConfirmDialog, Modal } from '../components/ui/Modal';
import { ProgressBar } from '../components/ui/Meters';
import { Panel, Switch } from '../components/ui/Panel';
import { CosmeticPreview } from '../components/ui/Reward';
import { NameTag, TitleText } from '../components/ui/NameTag';
import { ACH_ICONS, BoostIcon, CoinIcon, RPIcon } from '../components/ui/Icons';
import { Tabs } from '../components/ui/Tabs';

type Tab = 'stats' | 'achievements' | 'collection' | 'shop' | 'settings';
const NAME_RE = /^[\p{L}\p{N} ._-]+$/u;

// ── Stats ────────────────────────────────────────────────────────────────

function Heatmap() {
  const t = useT();
  const lang = useLang();
  const activity = useGame((s) => s.stats.activity);
  const weeks = 17;
  const cells = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const first = new Date(weekStart(Date.now()));
    first.setDate(first.getDate() - (weeks - 1) * 7);
    return Array.from({ length: weeks * 7 }, (_, i) => {
      const d = new Date(first);
      d.setDate(first.getDate() + i);
      const key = dayKey(d);
      return { key, t: d.getTime(), n: activity[key] ?? 0, future: d.getTime() > today.getTime() };
    });
  }, [activity]);

  const color = (n: number) =>
    n === 0 ? 'var(--color-line-strong)' : n < 5 ? 'rgba(139,92,246,0.45)' : n < 15 ? 'rgba(167,139,250,0.75)' : n < 30 ? 'rgba(34,211,238,0.85)' : '#38bdf8';
  const days = lang === 'lv' ? ['P', '', 'T', '', 'Pk', '', 'Sv'] : ['M', '', 'W', '', 'F', '', 'S'];

  return (
    <Panel title={t('Aktivitāte', 'Activity')} icon={<CalendarCheck className="size-5 text-violet-300" />}>
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <div className="grid grid-rows-7 gap-1 pr-1 text-[10px] text-dim">
          {days.map((d, i) => (
            <span key={i} className="flex h-3.5 items-center">
              {d}
            </span>
          ))}
        </div>
        <div className="grid grid-flow-col grid-rows-7 gap-1">
          {cells.map((c, i) => (
            <motion.span
              key={c.key}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: Math.floor(i / 7) * 0.025 }}
              title={c.future ? '' : `${fmtShortDate(c.t, lang)}: ${c.n} ${t('atbildes', 'answers')}`}
              className="size-3.5 rounded-[4px]"
              style={{ background: c.future ? 'transparent' : color(c.n) }}
            />
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-dim">
        {t('Mazāk', 'Less')}
        {[0, 3, 10, 20, 40].map((n) => (
          <span key={n} className="size-3 rounded-[3px]" style={{ background: color(n) }} />
        ))}
        {t('Vairāk', 'More')}
      </div>
    </Panel>
  );
}

function RPChart() {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const rpByDay = useGame((s) => s.stats.rpByDay);
  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() - (13 - i));
        return { key: dayKey(d), t: d.getTime(), rp: rpByDay[dayKey(d)] ?? 0 };
      }),
    [rpByDay],
  );
  const max = Math.max(60, ...days.map((d) => d.rp));
  const total = days.reduce((s, d) => s + d.rp, 0);

  return (
    <Panel
      title={t('RP pēdējās 14 dienās', 'RP over 14 days')}
      icon={<ChartColumn className="size-5 text-cyan-300" />}
      extra={<span className="text-sm font-semibold tabular text-muted">{fmt(total)} RP</span>}
    >
      <div className="flex h-40 items-end gap-1.5">
        {days.map((d, i) => (
          <div key={d.key} className="group relative flex h-full flex-1 flex-col justify-end" title={`${fmtShortDate(d.t, lang)}: ${fmt(d.rp)} RP`}>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(d.rp ? 6 : 2, (d.rp / max) * 100)}%` }}
              transition={{ delay: 0.1 + i * 0.03, type: 'spring', stiffness: 140, damping: 18 }}
              className={cn('w-full rounded-t-lg', i === 13 ? 'bg-gradient-to-t from-violet-500 to-cyan-300' : d.rp ? 'bg-gradient-to-t from-violet-600/70 to-violet-400/80' : 'bg-paper-3')}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1.5 text-[10px] text-dim">
        {days.map((d, i) => (
          <span key={d.key} className="flex-1 text-center">
            {i % 2 === 1 ? new Date(d.t).getDate() : ''}
          </span>
        ))}
      </div>
    </Panel>
  );
}

function StatsTab() {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const stats = useGame((s) => s.stats);
  const acc = stats.answered ? stats.correct / stats.answered : 0;
  const tiles = [
    { icon: <RPIcon size={20} />, label: t('Kopējie RP', 'Total RP'), value: fmt(stats.totalRP), c: '#c4b5fd' },
    { icon: <Repeat className="size-5" />, label: t('Pabeigtas sesijas', 'Sessions'), value: fmt(stats.sessions), c: '#a78bfa' },
    { icon: <Target className="size-5" />, label: t('Atbildes', 'Answers'), value: fmt(stats.answered), c: '#34d399' },
    { icon: <Sparkles className="size-5" />, label: t('Precizitāte', 'Accuracy'), value: fmtPct(acc, lang), c: '#fde68a' },
    { icon: <Flame className="size-5" />, label: t('Labākais combo', 'Best combo'), value: `×${stats.bestCombo}`, c: '#fb923c' },
    { icon: <Zap className="size-5" />, label: t('Ātrākā atbilde', 'Fastest answer'), value: stats.fastestMs !== null ? fmtSec(stats.fastestMs, lang) : '—', c: '#67e8f9' },
    { icon: <CalendarCheck className="size-5" />, label: t('Sērija (labākā)', 'Streak (best)'), value: `${effectiveStreak(stats)} (${stats.bestStreak})`, c: '#f472b6' },
    { icon: <Clock className="size-5" />, label: t('Laiks mācoties', 'Time studied'), value: `${fmt(Math.round(stats.timeMs / 60000))} min`, c: '#93c5fd' },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {tiles.map((tile, i) => (
          <motion.div
            key={tile.label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-2xl glass-soft p-4"
          >
            <div className="grid size-9 place-items-center rounded-xl" style={{ background: `${tile.c}22`, color: tile.c }}>
              {tile.icon}
            </div>
            <div className="mt-3 font-display text-2xl font-extrabold tabular">{tile.value}</div>
            <div className="text-sm text-muted">{tile.label}</div>
          </motion.div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Heatmap />
        <RPChart />
      </div>
    </div>
  );
}

// ── Achievements ─────────────────────────────────────────────────────────

function AchievementsTab() {
  const lang = useLang();
  const unlocked = useGame((s) => s.achievements);
  const count = ACHIEVEMENTS.filter((a) => unlocked[a.id]).length;
  return (
    <div>
      <div className="mb-5 flex items-center gap-4">
        <span className="font-display text-2xl font-bold tabular">
          {count}/{ACHIEVEMENTS.length}
        </span>
        <ProgressBar value={count / ACHIEVEMENTS.length} className="flex-1" fill="linear-gradient(90deg,#f59e0b,#fde68a)" glow="rgba(251,191,36,0.5)" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((a, i) => {
          const got = unlocked[a.id];
          const Icon = ACH_ICONS[a.icon];
          const color = RARITY_META[a.rarity].color;
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={cn('relative flex gap-4 overflow-hidden rounded-2xl border-2 p-4', got ? 'border-ink bg-card shadow-hard-sm' : 'border-ink/20 bg-paper-2 opacity-75')}
              style={got ? { borderColor: `${color}88` } : undefined}
            >
              <div
                className="grid size-12 shrink-0 place-items-center rounded-2xl"
                style={{ background: got ? `${color}22` : 'rgba(255,255,255,0.05)', color: got ? color : '#6b6f9a', boxShadow: got ? `0 0 26px -6px ${color}` : undefined }}
              >
                {got ? <Icon className="size-6" /> : <Lock className="size-5" />}
              </div>
              <div className="min-w-0">
                <div className={cn('font-bold', !got && 'text-muted')}>{a[lang]}</div>
                <div className="text-sm text-muted">{lang === 'lv' ? a.dlv : a.den}</div>
                <div className="mt-1.5 text-xs font-semibold" style={{ color }}>
                  {RARITY_META[a.rarity][lang]}
                  {got ? ` · ${fmtDate(got, lang)}` : ''}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Collection ───────────────────────────────────────────────────────────

function useSourceLabel() {
  const t = useT();
  return (c: Cosmetic): string => {
    switch (c.source) {
      case 'default':
        return t('Sākuma komplekts', 'Starter set');
      case 'road': {
        const step = ROAD.find((s) => s.items.some((i) => i.kind === 'cosmetic' && i.id === c.id));
        return step ? t(`Rangu ceļš: ${rankName(rankAt(step.rankIndex), 'lv')}`, `Rank road: ${rankName(rankAt(step.rankIndex), 'en')}`) : '';
      }
      case 'shop':
        return t(`Veikalā par ${c.price} monētām`, `Shop: ${c.price} coins`);
      case 'achievement': {
        const a = ACHIEVEMENTS.find((x) => x.reward.some((r) => r.kind === 'cosmetic' && r.id === c.id));
        return a ? t(`Sasniegums: ${a.lv}`, `Achievement: ${a.en}`) : '';
      }
      case 'chest':
        return t('Atrodams lādēs', 'Found in chests');
      case 'weekly':
        return t('Nedēļas tabulas 1. vieta', 'Weekly board #1');
    }
  };
}

const KINDS: { kind: CosmeticKind; lv: string; en: string }[] = [
  { kind: 'theme', lv: 'Kartīšu tēmas', en: 'Card themes' },
  { kind: 'frame', lv: 'Avatara rāmji', en: 'Avatar frames' },
  { kind: 'nametag', lv: 'Vārdu stili', en: 'Name tags' },
  { kind: 'title', lv: 'Tituli', en: 'Titles' },
];

function CollectionTab() {
  const t = useT();
  const lang = useLang();
  const owned = useGame((s) => s.owned);
  const equipped = useGame((s) => s.equipped);
  const equip = useGame((s) => s.equip);
  const source = useSourceLabel();
  return (
    <div className="space-y-8">
      {KINDS.map((k) => {
        const items = COSMETICS.filter((c) => c.kind === k.kind);
        return (
          <section key={k.kind}>
            <h3 className="mb-3 font-display text-lg font-bold">
              {k[lang]}{' '}
              <span className="text-base text-muted">
                {items.filter((c) => owned.includes(c.id)).length}/{items.length}
              </span>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((c) => {
                const has = owned.includes(c.id);
                const on = equipped[c.kind] === c.id;
                return (
                  <div
                    key={c.id}
                    className={cn(
                      'flex items-center gap-4 rounded-2xl border-2 p-3.5 transition-colors',
                      on ? 'border-brand bg-brand-soft/30 shadow-hard-sm' : has ? 'border-ink bg-card shadow-hard-sm' : 'border-ink/15 bg-paper-2 opacity-65',
                    )}
                  >
                    <div className={cn(!has && 'opacity-40 grayscale')}>
                      <CosmeticPreview item={c} size={52} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={cn('truncate font-bold', !has && 'text-muted')}>{c[lang]}</div>
                      <div className="text-xs font-semibold" style={{ color: RARITY_META[c.rarity].color }}>
                        {RARITY_META[c.rarity][lang]}
                      </div>
                      {!has && <div className="mt-0.5 truncate text-xs text-dim">{source(c)}</div>}
                    </div>
                    {on ? (
                      <span className="flex shrink-0 items-center gap-1 rounded-lg bg-violet-500/25 px-2 py-1 text-xs font-bold text-violet-100">
                        <Check className="size-3.5" />
                        {t('Izmantots', 'Equipped')}
                      </span>
                    ) : has ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          sfx.tap();
                          const pos = centerOf(e.currentTarget);
                          burst(pos.x, pos.y, { count: 12, spread: 70, colors: ['#a78bfa', '#fde68a', '#ffffff'] });
                          equip(c.id);
                        }}
                      >
                        {t('Izmantot', 'Equip')}
                      </Button>
                    ) : (
                      <Lock className="size-4 shrink-0 text-dim" />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ── Shop ─────────────────────────────────────────────────────────────────

interface Purchase {
  kind: 'cosmetic' | 'boost' | 'chest';
  id?: string;
  price: number;
  name: string;
  rarity?: Rarity;
}

function ShopTab() {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const coins = useGame((s) => s.coins);
  const owned = useGame((s) => s.owned);
  const boosts = useGame((s) => s.boosts);
  const chests = useGame((s) => s.chests);
  const buyCosmetic = useGame((s) => s.buyCosmetic);
  const buyBoost = useGame((s) => s.buyBoost);
  const buyChest = useGame((s) => s.buyChest);
  const [pending, setPending] = useState<Purchase | null>(null);
  const items = COSMETICS.filter((c) => c.price && !owned.includes(c.id));

  const confirm = () => {
    if (!pending) return;
    const ok =
      pending.kind === 'cosmetic'
        ? buyCosmetic(pending.id!)
        : pending.kind === 'boost'
          ? buyBoost()
          : buyChest(pending.rarity);
    if (ok) {
      sfx.coin();
      confettiBurst(['#fbbf24', '#fde68a', '#ffffff'], { x: 0.5, y: 0.55 }, 60);
    } else sfx.wrong();
    setPending(null);
  };

  const PriceButton = ({ p }: { p: Purchase }) => (
    <Button size="sm" variant="gold" disabled={coins < p.price} onClick={() => setPending(p)} icon={<CoinIcon size={16} />}>
      {fmt(p.price)}
    </Button>
  );

  return (
    <div>
      <div className="mb-5 flex items-center gap-3 rounded-2xl glass-soft px-4 py-3">
        <CoinIcon size={28} />
        <span className="font-display text-2xl font-bold tabular">{fmt(coins)}</span>
        <span className="text-muted">{t('monētas', 'coins')}</span>
        <span className="ml-auto hidden text-sm text-dim sm:inline">{t('Pelni monētas ar uzdevumiem, lādēm un sasniegumiem', 'Earn coins from quests, chests and achievements')}</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border-2 border-info/50 bg-card shadow-hard-sm p-4">
          <BoostIcon size={48} />
          <div className="min-w-0 flex-1">
            <div className="font-bold">{t('RP pastiprinājums', 'RP boost')}</div>
            <div className="text-xs text-muted">{t(`Nākamā sesija ×1,5 RP · tev ir ${boosts}`, `Next session ×1.5 RP · you have ${boosts}`)}</div>
          </div>
          <PriceButton p={{ kind: 'boost', price: BOOST_PRICE, name: t('RP pastiprinājums', 'RP boost') }} />
        </div>
        {SHOP_CHESTS.map((offer) => {
          const chestName = offer.rarity === 'epic' ? t('Episka lāde', 'Epic chest') : t('Reta lāde', 'Rare chest');
          const count = chests.filter((c) => c.rarity === offer.rarity).length;
          return (
            <div key={offer.rarity} className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-brand/50 bg-card shadow-hard-sm p-4">
              <div className="flex items-center gap-4">
                <ChestIcon rarity={offer.rarity} size={52} glow={false} />
                <div className="min-w-0 flex-1">
                  <div className="font-bold">{chestName}</div>
                  <div className="text-xs text-muted">
                    {t(`Tev ir ${count}`, `You have ${count}`)}
                  </div>
                </div>
                <PriceButton p={{ kind: 'chest', rarity: offer.rarity, price: offer.price, name: chestName }} />
              </div>
              <ChestOdds rarity={offer.rarity} className="border-t border-ink/10 pt-2 text-xs text-muted" />
            </div>
          );
        })}
        {items.map((c) => (
          <div key={c.id} className="flex items-center gap-4 rounded-2xl border-2 border-ink bg-card shadow-hard-sm p-4">
            <CosmeticPreview item={c} size={48} />
            <div className="min-w-0 flex-1">
              <div className="truncate font-bold">{c[lang]}</div>
              <div className="text-xs font-semibold" style={{ color: RARITY_META[c.rarity].color }}>
                {RARITY_META[c.rarity][lang]}
              </div>
            </div>
            <PriceButton p={{ kind: 'cosmetic', id: c.id, price: c.price!, name: c[lang] }} />
          </div>
        ))}
      </div>
      <ConfirmDialog
        open={!!pending}
        title={t('Apstiprināt pirkumu?', 'Confirm purchase?')}
        message={pending ? t(`Pirkt "${pending.name}" par ${pending.price} monētām?`, `Buy "${pending.name}" for ${pending.price} coins?`) : ''}
        confirmLabel={t('Pirkt', 'Buy')}
        cancelLabel={t('Atcelt', 'Cancel')}
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </div>
  );
}

// ── Settings ─────────────────────────────────────────────────────────────

function Row({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-ink/15 py-4 last:border-0">
      <div className="min-w-0">
        <div className="font-semibold">{title}</div>
        {desc && <div className="text-sm text-muted">{desc}</div>}
      </div>
      {children}
    </div>
  );
}

function SettingsTab() {
  const t = useT();
  const settings = useGame((s) => s.settings);
  const updateSettings = useGame((s) => s.updateSettings);
  const profile = useGame((s) => s.profile);
  const setRole = useGame((s) => s.setRole);
  const devAddRP = useGame((s) => s.devAddRP);
  const devAddChest = useGame((s) => s.devAddChest);
  const resetAll = useGame((s) => s.resetAll);
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <Panel title={t('Iestatījumi', 'Settings')} icon={<Settings className="size-5 text-violet-300" />}>
        <Row title={t('Valoda', 'Language')}>
          <Tabs
            value={settings.lang}
            onChange={(v) => updateSettings({ lang: v })}
            layoutId="set-lang"
            options={[
              { value: 'lv', label: 'Latviešu' },
              { value: 'en', label: 'English' },
            ]}
          />
        </Row>
        <Row title={t('Tumšais režīms', 'Dark mode')} desc={t('Pārslēgt starp gaišo un tumšo vizuālo tēmu', 'Switch between light and dark theme')}>
          <Switch checked={!!settings.darkMode} onChange={(v) => updateSettings({ darkMode: v })} label={t('Tumšais režīms', 'Dark mode')} />
        </Row>
        <Row title={t('Skaņas efekti', 'Sound effects')} desc={t('Sintezētas skaņas — bez audio failiem', 'Synthesised in the browser — no audio files')}>
          <Switch checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} label={t('Skaņas efekti', 'Sound effects')} />
        </Row>
        <Row title={t('Samazināt kustību', 'Reduce motion')} desc={t('Izslēdz daļiņas, kratīšanu un fona animācijas', 'Turns off particles, shakes and ambient motion')}>
          <Switch checked={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} label={t('Samazināt kustību', 'Reduce motion')} />
        </Row>
        <Row title={t('Automātiski turpināt', 'Auto-continue')} desc={t('Pēc pareizas atbildes pāriet uz nākamo kartīti', 'Move on automatically after a correct answer')}>
          <Switch checked={settings.autoAdvance} onChange={(v) => updateSettings({ autoAdvance: v })} label={t('Automātiski turpināt', 'Auto-continue')} />
        </Row>
        <Row title={t('Sesijas garums', 'Session length')} desc={t('Jautājumu skaits vienā sesijā', 'Questions per session')}>
          <Tabs
            value={String(settings.sessionLength)}
            onChange={(v) => updateSettings({ sessionLength: Number(v) })}
            layoutId="set-len"
            options={['5', '10', '15', '20'].map((v) => ({ value: v, label: v }))}
          />
        </Row>
      </Panel>

      <Panel title={t('Testēšanas rīki', 'Test tools')} icon={<Wrench className="size-5 text-amber-300" />} className="border-dashed">
        <p className="text-sm text-muted">
          {t('Prototipa rīki, lai ātri apskatītu paaugstinājumus un lādes.', 'Prototype helpers to preview promotions and chests quickly.')}
        </p>
        <div className="mt-4">
          <Row title={t('Administratora priekšskatījums', 'Admin preview')} desc={t('Tikai lokālam prototipa testam; nav drošības kontrole.', 'For local prototype testing only; not a security control.')}>
            <Switch checked={profile?.role === 'admin'} onChange={(enabled) => setRole(enabled ? 'admin' : 'user')} label={t('Administratora priekšskatījums', 'Admin preview')} />
          </Row>
        </div>
        <div className="mt-4 grid gap-2.5">
          <Button variant="secondary" icon={<RPIcon size={18} />} onClick={() => devAddRP(500)}>
            +500 RP
          </Button>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" icon={<ChestIcon rarity="common" size={18} glow={false} />} onClick={() => devAddChest('common')}>
              {t('+ Parasta lāde', '+ Common chest')}
            </Button>
            <Button variant="secondary" size="sm" icon={<ChestIcon rarity="rare" size={18} glow={false} />} onClick={() => devAddChest('rare')}>
              {t('+ Reta lāde', '+ Rare chest')}
            </Button>
            <Button variant="secondary" size="sm" icon={<ChestIcon rarity="epic" size={18} glow={false} />} onClick={() => devAddChest('epic')}>
              {t('+ Episka lāde', '+ Epic chest')}
            </Button>
            <Button variant="secondary" size="sm" icon={<ChestIcon rarity="legendary" size={18} glow={false} />} onClick={() => devAddChest('legendary')}>
              {t('+ Leģendāra lāde', '+ Legendary chest')}
            </Button>
          </div>
          <Button variant="danger" onClick={() => setConfirmReset(true)}>
            {t('Atiestatīt visu progresu', 'Reset all progress')}
          </Button>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmReset}
        danger
        title={t('Atiestatīt progresu?', 'Reset progress?')}
        message={t(
          'Tiks dzēsts profils, RP, rangs, balvas, sasniegumi un tavas kopas. To nevar atsaukt.',
          'Your profile, RP, rank, rewards, achievements and decks will be deleted. This cannot be undone.',
        )}
        confirmLabel={t('Atiestatīt', 'Reset')}
        cancelLabel={t('Atcelt', 'Cancel')}
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setConfirmReset(false);
          resetAll();
        }}
      />
    </div>
  );
}

// ── Edit profile ─────────────────────────────────────────────────────────

function EditProfile({ open, onClose }: { open: boolean; onClose: () => void }) {
  const t = useT();
  const profile = useGame((s) => s.profile);
  const frame = useGame((s) => s.equipped.frame);
  const setProfile = useGame((s) => s.setProfile);
  const [name, setName] = useState(profile?.name ?? '');
  const [avatar, setAvatar] = useState(profile?.avatar ?? '🦊');
  const [hue, setHue] = useState(profile?.hue ?? 265);

  useEffect(() => {
    if (open && profile) {
      setName(profile.name);
      setAvatar(profile.avatar);
      setHue(profile.hue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const trimmed = name.trim();
  const valid = trimmed.length >= 2 && trimmed.length <= 16 && NAME_RE.test(trimmed);

  const save = () => {
    if (!valid) return;
    setProfile({ name: trimmed, avatar, hue });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} className="max-w-lg" labelledBy="edit-profile-title">
      <h2 id="edit-profile-title" className="font-display text-xl font-bold">
        {t('Rediģēt profilu', 'Edit profile')}
      </h2>
      <div className="mt-5 flex items-center gap-5">
        <Avatar avatar={avatar} hue={hue} frame={frame} size={84} />
        <div className="min-w-0 flex-1">
          <input
            value={name}
            maxLength={20}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save();
            }}
            aria-label={t('Segvārds', 'Nickname')}
            aria-invalid={!valid}
            className={cn(
              'h-12 w-full rounded-2xl border-2 bg-card px-4 font-semibold outline-none transition text-fg placeholder:text-dim',
              valid ? 'border-ink/20 focus:border-ink focus:shadow-hard-sm' : 'border-bad ring-2 ring-bad/20',
            )}
          />
          <input
            type="range"
            min={0}
            max={359}
            value={hue}
            onChange={(e) => setHue(Number(e.target.value))}
            aria-label={t('Krāsa', 'Colour')}
            className="mt-3 block w-full"
            style={{ accentColor: `hsl(${hue} 80% 65%)` }}
          />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-2">
        {AVATARS.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAvatar(a)}
            aria-pressed={a === avatar}
            aria-label={a}
            className={cn('grid aspect-square place-items-center rounded-xl text-2xl transition', a === avatar ? 'border-2 border-ink bg-brand text-white shadow-hard-sm' : 'border-2 border-transparent bg-paper-2 hover:border-ink/20')}
          >
            {a}
          </button>
        ))}
      </div>
      {!valid && <p className="mt-3 text-sm text-bad font-semibold">{t('Vārdam jābūt 2–16 simboliem (burti, cipari, atstarpe, . _ -).', 'Name must be 2–16 characters (letters, digits, space, . _ -).')}</p>}
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>
          {t('Atcelt', 'Cancel')}
        </Button>
        <Button
          variant="primary"
          disabled={!valid}
          onClick={save}
        >
          {t('Saglabāt', 'Save')}
        </Button>
      </div>
    </Modal>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const profile = useGame((s) => s.profile);
  const stats = useGame((s) => s.stats);
  const equipped = useGame((s) => s.equipped);
  const [tab, setTab] = useState<Tab>('stats');
  const [editing, setEditing] = useState(false);
  if (!profile) return null;
  const rank = rankFromRP(stats.totalRP);

  return (
    <div>
      <section className="relative overflow-hidden rounded-[32px] glass p-6 sm:p-8">
        <div className="pointer-events-none absolute inset-0 opacity-60" style={{ background: `radial-gradient(circle at 10% 30%, hsl(${profile.hue} 80% 55% / 0.45), transparent 55%)` }} />
        <div className="relative flex flex-wrap items-center gap-6">
          <Avatar avatar={profile.avatar} hue={profile.hue} frame={equipped.frame} size={104} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h1 className="truncate font-display text-3xl font-extrabold">
                <NameTag name={profile.name} tag={equipped.nametag} />
              </h1>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="grid size-9 shrink-0 place-items-center rounded-xl glass-soft text-muted transition hover:text-ink"
                aria-label={t('Rediģēt profilu', 'Edit profile')}
              >
                <Pencil className="size-4" />
              </button>
            </div>
            <div className="mt-1">
              <TitleText id={equipped.title} />
            </div>
            <div className="mt-1 text-sm text-muted">
              {t('Spēlē kopš', 'Playing since')} {fmtDate(profile.createdAt, lang)}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <RankEmblem rankIndex={rank.index} size={84} />
            <div>
              <div className="font-display text-xl font-bold" style={{ color: rank.league.c1 }}>
                {rankName(rank, lang)}
              </div>
              <div className="text-sm text-muted tabular">{fmt(stats.totalRP)} RP</div>
            </div>
          </div>
        </div>
      </section>

      <Tabs
        className="mt-6"
        value={tab}
        onChange={setTab}
        layoutId="profile-tabs"
        options={[
          { value: 'stats', label: t('Statistika', 'Stats'), icon: <ChartColumn className="size-4" /> },
          { value: 'achievements', label: t('Sasniegumi', 'Achievements'), icon: <Award className="size-4" /> },
          { value: 'collection', label: t('Kolekcija', 'Collection'), icon: <Palette className="size-4" /> },
          { value: 'shop', label: t('Veikals', 'Shop'), icon: <ShoppingBag className="size-4" /> },
          { value: 'settings', label: t('Iestatījumi', 'Settings'), icon: <Settings className="size-4" /> },
        ]}
      />

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="mt-6">
          {tab === 'stats' && <StatsTab />}
          {tab === 'achievements' && <AchievementsTab />}
          {tab === 'collection' && <CollectionTab />}
          {tab === 'shop' && <ShopTab />}
          {tab === 'settings' && <SettingsTab />}
        </motion.div>
      </AnimatePresence>

      <EditProfile open={editing} onClose={() => setEditing(false)} />
    </div>
  );
}
