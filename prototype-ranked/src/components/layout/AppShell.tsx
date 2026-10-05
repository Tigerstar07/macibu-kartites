import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Crown, Flame, Gift, House, Layers, Moon, Sun, Trophy, User, Volume2, VolumeX, type LucideIcon } from 'lucide-react';
import { effectiveStreak, useGame } from '../../store/useGame';
import { rankFromRP, rankName, rankProgress } from '../../lib/rank';
import { useLang, useNumFmt, useT } from '../../lib/i18n';
import { cn } from '../../lib/cn';
import { sfx } from '../../lib/sound';
import { RankEmblem } from '../rank/RankEmblem';
import { Avatar } from '../ui/Avatar';
import { NameTag, TitleText } from '../ui/NameTag';
import { Counter, ProgressBar } from '../ui/Meters';
import { BoostIcon, CoinIcon } from '../ui/Icons';

interface NavDef {
  to: string;
  icon: LucideIcon;
  lv: string;
  en: string;
  end?: boolean;
}

const NAV: NavDef[] = [
  { to: '/', icon: House, lv: 'Sākums', en: 'Home', end: true },
  { to: '/decks', icon: Layers, lv: 'Kopas', en: 'Decks' },
  { to: '/rank', icon: Crown, lv: 'Rangs', en: 'Ranked' },
  { to: '/leaderboard', icon: Trophy, lv: 'Līderi', en: 'Leaders' },
  { to: '/profile', icon: User, lv: 'Profils', en: 'Profile' },
];

const ICON_BUTTON = 'tactile grid size-11 place-items-center rounded-xl bg-card text-ink';

export function Logo({ compact }: { compact?: boolean }) {
  return (
    <Link to="/" className="group flex items-center gap-3" aria-label="Mācību kartītes">
      <div className="grid size-11 shrink-0 place-items-center rounded-xl border-2 border-ink bg-brand shadow-hard-sm transition-transform duration-500 ease-spring group-hover:-rotate-8 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="size-6" aria-hidden="true">
          <path d="M14 2 6 14h5l-2 8 9-13h-5.5Z" fill="var(--color-acid)" stroke="var(--color-ink)" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </div>
      {!compact && (
        <div className="leading-none">
          <div className="font-display text-[17px] font-extrabold tracking-[-0.035em]">Mācību kartītes</div>
          <div className="eyebrow mt-1.5 inline-block -rotate-2 rounded-md border-2 border-ink bg-acid px-1.5 py-0.5 text-[9.5px] text-ink">Ranked</div>
        </div>
      )}
    </Link>
  );
}

function SideNavItem({ n }: { n: NavDef }) {
  const t = useT();
  return (
    <NavLink
      to={n.to}
      end={n.end}
      onClick={() => sfx.tap()}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 rounded-xl px-2 py-2 font-bold transition-colors duration-150',
          isActive ? 'text-ink dark:text-white' : 'text-muted hover:bg-paper-2 hover:text-ink',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="side-pill"
              className="absolute inset-0 rounded-xl border-2 border-ink dark:border-brand-soft/60 bg-acid dark:bg-brand shadow-hard-sm"
              transition={{ type: 'spring', stiffness: 440, damping: 34 }}
            />
          )}
          <span
            className={cn(
              'relative grid size-9 place-items-center rounded-lg border-2 transition-colors duration-150',
              isActive
                ? 'border-ink bg-card text-ink dark:border-white/25 dark:bg-white/10 dark:text-white'
                : 'border-transparent bg-paper-2 text-muted group-hover:border-ink/25 group-hover:text-ink',
            )}
          >
            <n.icon className="size-[18px]" strokeWidth={2.3} />
          </span>
          <span className="relative">{t(n.lv, n.en)}</span>
        </>
      )}
    </NavLink>
  );
}

function MiniProfile() {
  const t = useT();
  const lang = useLang();
  const profile = useGame((s) => s.profile);
  const stats = useGame((s) => s.stats);
  const equipped = useGame((s) => s.equipped);
  const fmt = useNumFmt();
  if (!profile) return null;
  const rank = rankFromRP(stats.totalRP);
  return (
    <Link
      to="/profile"
      className="block rounded-xl border-2 border-ink bg-paper-2 p-3 transition-[translate,box-shadow] duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-sm"
    >
      <div className="flex items-center gap-3">
        <Avatar avatar={profile.avatar} hue={profile.hue} frame={equipped.frame} size={42} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-extrabold leading-tight">
            <NameTag name={profile.name} tag={equipped.nametag} />
          </div>
          <div className="truncate text-xs font-medium text-muted">
            <TitleText id={equipped.title} />
          </div>
        </div>
        <RankEmblem rankIndex={rank.index} size={38} idle={false} />
      </div>
      <div className="mt-3 flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 font-extrabold">
          <span className="size-2.5 rounded-[3px] border-[1.5px] border-ink" style={{ background: rank.league.c2 }} />
          {rankName(rank, lang)}
        </span>
        <span className="font-mono text-[11px] font-semibold tabular text-muted">
          {fmt(stats.totalRP)}
          {rank.nextRP !== null && `/${fmt(rank.nextRP)}`}
        </span>
      </div>
      <ProgressBar value={rankProgress(stats.totalRP)} height={6} className="mt-1.5" fill={rank.league.c2} />
      <span className="sr-only">{t('Atvērt profilu', 'Open profile')}</span>
    </Link>
  );
}

const Divider = ({ className }: { className?: string }) => <span className={cn('w-0.5 shrink-0 self-stretch bg-ink dark:bg-white/10', className)} aria-hidden="true" />;

function TopBar() {
  const t = useT();
  const lang = useLang();
  const fmt = useNumFmt();
  const coins = useGame((s) => s.coins);
  const boosts = useGame((s) => s.boosts);
  const stats = useGame((s) => s.stats);
  const chests = useGame((s) => s.chests);
  const settings = useGame((s) => s.settings);
  const updateSettings = useGame((s) => s.updateSettings);
  const setOpenChest = useGame((s) => s.setOpenChest);
  const streak = effectiveStreak(stats);
  const rank = rankFromRP(stats.totalRP);

  const prevCoins = useRef(coins);
  const [coinBump, setCoinBump] = useState(0);
  useEffect(() => {
    if (coins > prevCoins.current) {
      setCoinBump((b) => b + 1);
    }
    prevCoins.current = coins;
  }, [coins]);

  const prevRP = useRef(stats.totalRP);
  const [rpBump, setRpBump] = useState(0);
  useEffect(() => {
    if (stats.totalRP > prevRP.current) {
      setRpBump((b) => b + 1);
    }
    prevRP.current = stats.totalRP;
  }, [stats.totalRP]);

  return (
    <header className="sticky top-0 z-40 flex items-center gap-2 px-4 py-3.5 sm:px-6 lg:px-10">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper via-paper/85 to-paper/0" />
      <div className="relative lg:hidden">
        <Logo compact />
      </div>
      <div className="relative ml-auto flex items-center gap-2.5">
        {chests.length > 0 && (
          <button
            type="button"
            onClick={() => {
              sfx.tap();
              setOpenChest(chests[0].id);
            }}
            className="tactile relative grid size-11 place-items-center rounded-xl bg-gold text-ink"
            aria-label={t('Atvērt lādi', 'Open chest')}
          >
            <Gift className="size-5 animate-bob" strokeWidth={2.4} />
            <span className="absolute -right-2 -top-2 grid size-5.5 place-items-center rounded-full border-2 border-ink bg-bad font-mono text-[11px] font-bold text-ink">
              {chests.length}
            </span>
          </button>
        )}

        {/* Segmented stats bar — one HUD object instead of five pills. */}
        <div className="flex h-11 items-stretch overflow-hidden rounded-xl border-2 border-ink bg-card font-bold shadow-hard-sm">
          <div
            className={cn('flex items-center gap-1.5 px-3', streak > 0 ? 'bg-streak-soft text-ink dark:bg-streak/15 dark:text-orange-300' : 'text-dim')}
            title={t('Dienu sērija', 'Day streak')}
          >
            <Flame className={cn('size-[18px]', streak > 0 && 'animate-flicker fill-streak text-ink')} strokeWidth={2.3} />
            <span className="font-mono tabular">{streak}</span>
          </div>
          <Divider />
          <motion.div
            key={`coins-${coinBump}`}
            animate={coinBump > 0 ? { scale: [1, 1.25, 0.95, 1], rotate: [0, -3, 3, 0] } : {}}
            transition={{ type: 'spring', stiffness: 500, damping: 20 }}
            className="flex items-center gap-1.5 px-3"
            title={t('Monētas', 'Coins')}
          >
            <span data-coin-target className="grid place-items-center">
              <CoinIcon size={19} />
            </span>
            <Counter value={coins} format={fmt} delay={550} className="font-mono" />
          </motion.div>
          {boosts > 0 && (
            <>
              <Divider className="hidden sm:block" />
              <div className="hidden items-center gap-1.5 px-3 sm:flex" title={t('RP pastiprinājumi', 'RP boosts')}>
                <BoostIcon size={19} />
                <span className="font-mono tabular">{boosts}</span>
              </div>
            </>
          )}
          <Divider className="hidden sm:block" />
          <Link
            to="/rank"
            className="hidden items-center gap-1.5 bg-brand-soft pl-1.5 pr-3 transition-colors duration-150 hover:bg-acid dark:hover:bg-brand-soft/80 sm:flex"
            title={rankName(rank, lang)}
          >
            <motion.div
              key={`rp-${rpBump}`}
              animate={rpBump > 0 ? { scale: [1, 1.2, 0.95, 1] } : {}}
              transition={{ type: 'spring', stiffness: 500, damping: 20 }}
              className="flex items-center gap-1.5"
            >
              <RankEmblem rankIndex={rank.index} size={28} idle={false} glow={false} />
              <Counter value={stats.totalRP} format={fmt} className="font-mono" />
              <span className="font-mono text-[11px] font-bold text-muted">RP</span>
            </motion.div>
          </Link>
        </div>

        <button
          type="button"
          onClick={() => {
            sfx.tap();
            updateSettings({ lang: lang === 'lv' ? 'en' : 'lv' });
          }}
          className={cn(ICON_BUTTON, 'w-12 font-mono text-[13px] font-bold')}
          aria-label={t('Mainīt valodu', 'Switch language')}
        >
          {lang === 'lv' ? 'LV' : 'EN'}
        </button>
        <button
          type="button"
          onClick={() => {
            updateSettings({ sound: !settings.sound });
            if (!settings.sound) setTimeout(() => sfx.tap(), 30);
          }}
          className={ICON_BUTTON}
          aria-label={settings.sound ? t('Izslēgt skaņu', 'Mute') : t('Ieslēgt skaņu', 'Unmute')}
        >
          {settings.sound ? <Volume2 className="size-5" strokeWidth={2.3} /> : <VolumeX className="size-5" strokeWidth={2.3} />}
        </button>
        <button
          type="button"
          onClick={() => {
            sfx.tap();
            updateSettings({ darkMode: !settings.darkMode });
          }}
          className={ICON_BUTTON}
          aria-label={settings.darkMode ? t('Gaišais režīms', 'Light mode') : t('Tumšais režīms', 'Dark mode')}
          title={settings.darkMode ? t('Gaišais režīms', 'Light mode') : t('Tumšais režīms', 'Dark mode')}
        >
          {settings.darkMode ? (
            <Sun className="size-5 text-amber-300 transition-transform duration-300 hover:rotate-45" strokeWidth={2.3} />
          ) : (
            <Moon className="size-5 transition-transform duration-300 hover:-rotate-12" strokeWidth={2.3} />
          )}
        </button>
      </div>
    </header>
  );
}

function BottomNav() {
  const t = useT();
  return (
    <nav
      className="fixed inset-x-3 bottom-3 z-40 flex justify-around gap-1 rounded-2xl border-2 border-ink bg-card p-1.5 shadow-hard lg:hidden"
      style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          onClick={() => sfx.tap()}
          className={({ isActive }) =>
            cn('relative flex flex-1 flex-col items-center gap-0.5 rounded-xl py-2 text-[11px] font-bold', isActive ? 'text-ink dark:text-white' : 'text-dim')
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.span
                  layoutId="bottom-pill"
                  className="absolute inset-0 rounded-xl border-2 border-ink dark:border-brand-soft/60 bg-acid dark:bg-brand"
                  transition={{ type: 'spring', stiffness: 440, damping: 34 }}
                />
              )}
              <n.icon className={cn('relative size-5 transition-transform duration-300 ease-spring', isActive && 'scale-110')} strokeWidth={2.3} />
              <span className="relative">{t(n.lv, n.en)}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}

/** Keeps the outgoing page's element alive while AnimatePresence plays its exit. */
function FrozenOutlet() {
  const outlet = useOutlet();
  const [frozen] = useState(outlet);
  return frozen;
}

export function AppShell() {
  const location = useLocation();
  const t = useT();
  return (
    <div className="relative z-10 flex min-h-dvh">
      <aside className="sticky top-0 hidden h-dvh w-[272px] shrink-0 p-4 lg:block">
        <div className="flex h-full flex-col overflow-y-auto rounded-card border-2 border-ink bg-card p-4 shadow-hard no-scrollbar">
          <div className="px-1">
            <Logo />
          </div>
          <div className="eyebrow mt-8 px-2 text-[11px] text-dim">{t('Izvēlne', 'Menu')}</div>
          <nav className="mt-2.5 flex flex-col gap-1.5">
            {NAV.map((n) => (
              <SideNavItem key={n.to} n={n} />
            ))}
          </nav>
          <div className="mt-auto pt-6">
            <MiniProfile />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar />
        <main className="flex-1 px-4 pb-32 pt-2 sm:px-6 lg:px-10 lg:pb-14">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="@container mx-auto w-full max-w-6xl"
            >
              <FrozenOutlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
