import type { AuthUser } from '../lib/auth';
import { useGame } from './useGame';

type GameAccount = Pick<AuthUser, 'id' | 'display_name' | 'role' | 'created_at'>;

export async function selectGameAccount(user: GameAccount) {
  const storage = useGame.persist.getOptions().storage;
  // Atiestatīšana nedrīkst pārrakstīt neviena konta jau saglabātos datus.
  useGame.persist.setOptions({ storage: { getItem: () => null, setItem: () => {}, removeItem: () => {} } });
  useGame.setState(useGame.getInitialState(), true);
  useGame.getState().resetAll();
  useGame.persist.setOptions({ name: `rrv-account:${user.id}:${encodeURIComponent(user.created_at)}`, storage });
  await useGame.persist.rehydrate();
  const state = useGame.getState();
  if (!state.profile) state.setProfile({ name: user.display_name, avatar: '🦊', hue: 265 });
  state.setRole(user.role === 'admin' ? 'admin' : 'user');
  state.tick();
}
