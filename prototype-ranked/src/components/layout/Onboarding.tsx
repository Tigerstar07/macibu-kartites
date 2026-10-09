import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { animate, stagger } from 'animejs';
import { ArrowRight, Crown, Gift, MousePointerClick } from 'lucide-react';
import { useGame } from '../../store/useGame';
import { AVATARS } from '../../lib/bots';
import { useLang, useT } from '../../lib/i18n';
import { prefersReducedMotion } from '../../lib/fx';
import { sfx } from '../../lib/sound';
import { cn } from '../../lib/cn';
import { Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { SplitTitle } from '../ui/SplitTitle';
import { RankEmblem } from '../rank/RankEmblem';
import { Logo } from './AppShell';

const NAME_RE = /^[\p{L}\p{N} ._-]+$/u;

/** First-run flow: what the game is, then pick a name and avatar. */
export function Onboarding() {
  const t = useT();
  const lang = useLang();
  const setProfile = useGame((s) => s.setProfile);
  const updateSettings = useGame((s) => s.updateSettings);
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🦊');
  const [hue, setHue] = useState(265);
  const [touched, setTouched] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const emblemsRef = useRef<HTMLDivElement>(null);

  const trimmed = name.trim();
  const error =
    trimmed.length < 2
      ? t('Vārdam jābūt vismaz 2 simbolus garam.', 'Name must be at least 2 characters.')
      : trimmed.length > 16
        ? t('Vārds var būt ne garāks par 16 simboliem.', 'Name can be at most 16 characters.')
        : !NAME_RE.test(trimmed)
          ? t('Atļauti burti, cipari, atstarpe un . _ -', 'Letters, digits, space and . _ - only.')
          : null;

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (step === 0 && emblemsRef.current) {
      const a = animate(emblemsRef.current.children, {
        y: [40, 0],
        opacity: [0, 1],
        scale: [0.6, 1],
        delay: stagger(90, { start: 350 }),
        duration: 800,
        ease: 'out(4)',
      });
      return () => {
        a.revert();
      };
    }
    if (step === 1 && gridRef.current) {
      const a = animate(gridRef.current.children, {
        scale: [0, 1],
        opacity: [0, 1],
        delay: stagger(18, { grid: [7, 4], from: 'center' }),
        duration: 500,
        ease: 'outBack(1.7)',
      });
      return () => {
        a.revert();
      };
    }
  }, [step]);

  const submit = () => {
    setTouched(true);
    if (error) return;
    sfx.promotion();
    setProfile({ name: trimmed, avatar, hue });
  };

  return (
    <motion.div className="fixed inset-0 z-[340] overflow-y-auto bg-ink-950/92 text-white backdrop-blur-xl" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="mx-auto flex min-h-full max-w-3xl flex-col px-5 py-8">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex rounded-xl glass-soft p-1 text-sm font-bold">
            {(['lv', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => updateSettings({ lang: l })}
                className={cn('rounded-lg px-3 py-1.5 transition', lang === l ? 'bg-ink-900 text-white' : 'text-ink hover:bg-white/60 hover:text-ink')}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.section
              key="intro"
              className="my-auto py-10 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <div ref={emblemsRef} className="flex items-end justify-center gap-2 sm:gap-4">
                {[0, 3, 6, 9, 12].map((i, k) => (
                  <div key={i} className="opacity-0">
                    <RankEmblem rankIndex={i} size={52 + k * 14} />
                  </div>
                ))}
              </div>
              <SplitTitle
                text={t('Mācies. Uzvari. Kāp augstāk.', 'Learn. Win. Climb.')}
                className="mt-10 font-display text-4xl font-extrabold leading-tight text-white sm:text-5xl"
              />
              <p className="mx-auto mt-5 max-w-xl text-lg text-white/70">
                {t(
                  'Kartītes ar atbilžu variantiem, atkārtošanas algoritms SM-2 un ranked līgas no Bronzas līdz Dimantam.',
                  'Multiple-choice flashcards, the SM-2 spaced-repetition algorithm and ranked leagues from Bronze to Diamond.',
                )}
              </p>
              <div className="mx-auto mt-9 grid max-w-2xl gap-3 text-left sm:grid-cols-3">
                {[
                  { icon: <MousePointerClick className="size-5" />, c: '#67e8f9', lv: 'Izvēlies pareizo atbildi — spēle pati novērtē, cik labi zini.', en: 'Pick the right answer — the game grades how well you know it.' },
                  { icon: <Crown className="size-5" />, c: '#fbbf24', lv: 'Pelni RP par precizitāti, ātrumu, combo un dienu sēriju.', en: 'Earn RP for accuracy, speed, combos and streaks.' },
                  { icon: <Gift className="size-5" />, c: '#f472b6', lv: 'Paaugstinājumi, lādes, tēmas, rāmji un nedēļas tabula.', en: 'Promotions, chests, themes, frames and a weekly board.' },
                ].map((f, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 + i * 0.12 }}
                    className="rounded-2xl glass-soft p-4 text-ink"
                  >
                    <div className="grid size-10 place-items-center rounded-xl" style={{ background: `${f.c}22`, color: f.c }}>
                      {f.icon}
                    </div>
                    <p className="mt-3 text-[15px] leading-snug">{t(f.lv, f.en)}</p>
                  </motion.div>
                ))}
              </div>
              <Button variant="primary" size="xl" shine className="mt-10" iconRight={<ArrowRight className="size-5" />} onClick={() => setStep(1)}>
                {t('Sākt', 'Get started')}
              </Button>
            </motion.section>
          ) : (
            <motion.section
              key="profile"
              className="my-auto py-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <h1 className="text-center font-display text-3xl font-extrabold sm:text-4xl">{t('Izveido savu spēlētāju', 'Create your player')}</h1>
              <p className="mt-3 text-center text-muted">{t('Šis vārds būs redzams līderu tabulā.', 'This name shows up on the leaderboard.')}</p>

              <div className="mt-9 grid gap-8 rounded-3xl glass p-6 sm:grid-cols-[auto_1fr] sm:p-8">
                <div className="flex flex-col items-center gap-4">
                  <Avatar avatar={avatar} hue={hue} frame="frame-bronze" size={120} />
                  <label className="w-full text-center text-xs font-semibold text-muted">
                    {t('Krāsa', 'Colour')}
                    <input
                      type="range"
                      min={0}
                      max={359}
                      value={hue}
                      onChange={(e) => setHue(Number(e.target.value))}
                      className="mt-2 block w-full accent-violet-400"
                      style={{ accentColor: `hsl(${hue} 80% 65%)` }}
                    />
                  </label>
                </div>
                <div className="min-w-0">
                  <label htmlFor="player-name" className="text-sm font-semibold">
                    {t('Segvārds', 'Nickname')}
                  </label>
                  <input
                    id="player-name"
                    autoFocus
                    value={name}
                    maxLength={20}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => setTouched(true)}
                    onKeyDown={(e) => e.key === 'Enter' && submit()}
                    placeholder={t('piem. Roberts', 'e.g. Alex')}
                    aria-invalid={touched && !!error}
                    aria-describedby="name-error"
                    className={cn(
                      'mt-2 h-13 w-full rounded-2xl border bg-white/5 px-4 text-lg font-semibold text-ink outline-none transition placeholder:text-dim focus:bg-white/8',
                      touched && error ? 'border-rose-400/70' : 'border-white/10 focus:border-violet-400/70',
                    )}
                  />
                  <p id="name-error" className="mt-2 h-5 text-sm text-rose-300">
                    {touched && error}
                  </p>
                  <div className="mt-3 text-sm font-semibold">{t('Avatars', 'Avatar')}</div>
                  <div ref={gridRef} className="mt-2 grid grid-cols-7 gap-2">
                    {AVATARS.map((a) => (
                      <button
                        key={a}
                        type="button"
                        onClick={() => {
                          sfx.tap();
                          setAvatar(a);
                        }}
                        className={cn(
                          'grid aspect-square place-items-center rounded-xl text-2xl transition',
                          a === avatar ? 'scale-110 bg-violet-500/30 ring-2 ring-violet-300' : 'bg-white/5 hover:scale-105 hover:bg-white/10',
                        )}
                        aria-label={a}
                        aria-pressed={a === avatar}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center gap-3">
                <Button variant="ghost" size="lg" className="text-white/70 hover:border-white/15 hover:bg-white/10 hover:text-white" onClick={() => setStep(0)}>
                  {t('Atpakaļ', 'Back')}
                </Button>
                <Button variant="primary" size="lg" shine onClick={submit} iconRight={<ArrowRight className="size-5" />}>
                  {t('Sākt spēlēt', 'Start playing')}
                </Button>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
