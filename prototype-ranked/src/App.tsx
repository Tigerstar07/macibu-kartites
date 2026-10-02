import { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { useGame } from './store/useGame';
import { Background } from './components/layout/Background';
import { AppShell } from './components/layout/AppShell';
import { Onboarding } from './components/layout/Onboarding';
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

export default function App() {
  const reducedMotion = useGame((s) => s.settings.reducedMotion);
  const lang = useGame((s) => s.settings.lang);
  const hasProfile = useGame((s) => !!s.profile);
  const tick = useGame((s) => s.tick);

  // Daily quests and the weekly leaderboard roll over on their own.
  useEffect(() => {
    tick();
    const iv = setInterval(tick, 30_000);
    window.addEventListener('focus', tick);
    return () => {
      clearInterval(iv);
      window.removeEventListener('focus', tick);
    };
  }, [tick]);

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
        <Routes>
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
      </MotionConfig>
    </BrowserRouter>
  );
}
