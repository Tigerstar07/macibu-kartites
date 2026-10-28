import { useEffect, useState } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { useGame } from './store/useGame';
import { Background } from './components/layout/Background';
import { AppShell } from './components/layout/AppShell';
import { Onboarding } from './components/layout/Onboarding';
import { AuthScreen } from './components/layout/AuthScreen';
import { Toasts } from './components/ui/Toasts';
import { PromotionCeremony } from './components/rank/PromotionCeremony';
import { ChestOpening } from './components/rewards/ChestOpening';
import { WeeklyResults } from './components/rewards/WeeklyResults';
import HomePage from './pages/HomePage';
import DecksPage from './pages/DecksPage';
import DeckDetailPage from './pages/DeckDetailPage';
import DeckEditorPage from './pages/DeckEditorPage';
import RankPage from './pages/RankPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ProfilePage from './pages/ProfilePage';
import PlayPage from './pages/PlayPage';
import NotFound from './pages/NotFound';
import { currentUser, logout, sessionCheckDelay, watchAuthChanges, type AuthUser } from './lib/auth';
import { selectGameAccount } from './store/account';
import { Button } from './components/ui/Button';
import { syncDecks } from './lib/deckSync';
import { resetDeckLibrary, useDeckLibrary } from './store/deckLibrary';

export default function App() {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState('');
  const [attempt, setAttempt] = useState(0);
  const reducedMotion = useGame((s) => s.settings.reducedMotion);
  const lang = useGame((s) => s.settings.lang);
  const darkMode = useGame((s) => s.settings.darkMode);
  const hasProfile = useGame((s) => !!s.profile);
  const tick = useGame((s) => s.tick);
  const deckError = useDeckLibrary((s) => s.error);

  useEffect(() => watchAuthChanges(() => window.location.reload()), []);

  useEffect(() => {
    if (!authUser) return;
    const recheck = () => setAttempt((value) => value + 1);
    const timer = window.setTimeout(recheck, sessionCheckDelay());
    const onFocus = () => { if (sessionCheckDelay() === 0) recheck(); };
    window.addEventListener('focus', onFocus);
    return () => { window.clearTimeout(timer); window.removeEventListener('focus', onFocus); };
  }, [authUser]);

  useEffect(() => {
    let cancelled = false;
    setAuthReady(false);
    setAuthError('');
    async function restoreSession() {
      try {
        const user = await currentUser();
        if (cancelled) return;
        if (user) {
          await selectGameAccount(user);
          await syncDecks().catch(() => {});
        } else resetDeckLibrary();
        if (!cancelled) { setAuthUser(user); setAuthReady(true); }
      } catch (error) {
        if (!cancelled) setAuthError(error instanceof Error ? error.message : 'Neizdevās pārbaudīt sesiju.');
      }
    }
    void restoreSession();
    return () => { cancelled = true; };
  }, [attempt]);

  useEffect(() => {
    if (!authUser) return;
    const refresh = () => { if (document.visibilityState === 'visible') void syncDecks().catch(() => {}); };
    const timer = window.setInterval(refresh, 30000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [authUser]);

  // Daily quests and the weekly leaderboard roll over on their own.
  useEffect(() => {
    if (!authUser) return;
    tick();
    const iv = setInterval(tick, 30_000);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(iv);
      window.removeEventListener('focus', tick);
    };
  }, [tick, authUser]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!darkMode);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', darkMode ? '#0e0d18' : '#0a0a1f');
    }
  }, [darkMode]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <BrowserRouter>
      <MotionConfig reducedMotion={reducedMotion ? 'always' : 'user'}>
        <Background />
        {authError ? (
          <main className="fixed inset-0 z-[350] grid place-items-center bg-ink-950 px-5 text-white">
            <div className="max-w-md space-y-5 text-center">
              <h1 className="font-display text-2xl font-bold">Neizdevās pārbaudīt sesiju</h1>
              <p role="alert">{authError}</p>
              <Button variant="primary" onClick={() => setAttempt((value) => value + 1)}>Mēģināt vēlreiz</Button>
              <button type="button" onClick={logout} className="block w-full underline">Izmantot citu kontu</button>
            </div>
          </main>
        ) : !authReady ? <main className="fixed inset-0 grid place-items-center bg-ink-950 text-white" role="status">Pārbauda sesiju...</main>
          : !authUser ? <AuthScreen onAuthenticated={async (user) => { await selectGameAccount(user); await syncDecks().catch(() => {}); setAuthUser(user); }} /> : <>
        {deckError && <div role="alert" className="relative z-20 mx-auto max-w-4xl rounded-xl border-2 border-ink bg-card p-3 text-sm text-fg">
          {deckError} <button type="button" className="font-bold underline" onClick={() => void syncDecks().catch(() => {})}>Atjaunot kopas</button>
        </div>}
        <Routes>
          <Route path="/play" element={<PlayPage />} />
          <Route path="/play/:deckId" element={<PlayPage />} />
          <Route element={<AppShell />}>
            <Route index element={<HomePage />} />
            <Route path="decks" element={<DecksPage />} />
            <Route path="decks/new" element={<DeckEditorPage />} />
            <Route path="decks/:deckId" element={<DeckDetailPage />} />
            <Route path="decks/:deckId/edit" element={<DeckEditorPage />} />
            <Route path="rank" element={<RankPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        <Toasts />
        <PromotionCeremony />
        <ChestOpening />
        <WeeklyResults />
        {!hasProfile && <Onboarding />}
        </>}
      </MotionConfig>
    </BrowserRouter>
  );
}
