import { beforeEach, expect, it } from 'vitest';
import { useGame } from './useGame';

beforeEach(() => localStorage.clear());

it('atdala kontu progresu un atjauno iepriekšējā konta datus', async () => {
  // Dinamisks imports ļauj testam skaidri ziņot par vēl neieviestu kontu atlasi.
  const { selectGameAccount } = await import('./account');
  await selectGameAccount({ id: 1, created_at: '2026-10-28T12:00:00Z', display_name: 'Roberts', role: 'user' });
  useGame.setState({ coins: 125, stats: { ...useGame.getState().stats, totalRP: 900 } });
  await selectGameAccount({ id: 2, created_at: '2026-10-28T12:00:00Z', display_name: 'Rihards', role: 'user' });
  expect(useGame.getState().coins).toBe(0);
  expect(useGame.getState().stats.totalRP).toBe(0);
  expect(useGame.getState().profile?.name).toBe('Rihards');
  await selectGameAccount({ id: 1, created_at: '2026-10-28T12:00:00Z', display_name: 'Roberts', role: 'user' });
  expect(useGame.getState().coins).toBe(125);
  expect(useGame.getState().stats.totalRP).toBe(900);
  expect(useGame.getState().profile?.name).toBe('Roberts');
  expect(useGame.getState().chests.filter((chest) => chest.source === 'welcome')).toHaveLength(1);
});

it('neielādē veco koplietoto profilu un lomu ņem no servera', async () => {
  localStorage.setItem('rrv-ranked-v1', JSON.stringify({ state: { coins: 9999 }, version: 1 }));
  const { selectGameAccount } = await import('./account');
  await selectGameAccount({ id: 3, created_at: '2026-10-28T12:00:00Z', display_name: 'Valerijs', role: 'admin' });
  expect(useGame.getState().coins).toBe(0);
  expect(useGame.getState().profile?.role).toBe('admin');
  await selectGameAccount({ id: 3, created_at: '2026-10-28T12:00:00Z', display_name: 'Valerijs', role: 'user' });
  expect(useGame.getState().profile?.role).toBe('user');
});
