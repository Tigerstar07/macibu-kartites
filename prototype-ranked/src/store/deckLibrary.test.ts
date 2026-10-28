import { beforeEach, expect, it, vi } from 'vitest';
import { BUILTIN_DECKS } from '../data/decks';
import { combineDecks, deleteServerDeck, refreshDeckLibrary, resetDeckLibrary, saveServerDeck, useDeckLibrary } from './deckLibrary';
import { useGame } from './useGame';

const local = { ...BUILTIN_DECKS[0], id: 'd-test', builtin: false, isPublic: true };
const shared = { ...local, revision: 1, canEdit: true };
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });
const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
  localStorage.clear();
  localStorage.setItem('rrv-access-token', 'account-a');
  resetDeckLibrary();
});

it('importē veco lokālo publisko kopu un ielādē kopīgo sarakstu', async () => {
  fetchMock.mockResolvedValueOnce(json([])).mockResolvedValueOnce(json(shared)).mockResolvedValueOnce(json([shared]));
  const result = await refreshDeckLibrary([local]);
  expect(result).toEqual([shared]);
  expect(fetchMock.mock.calls[1][0]).toContain('/api/decks/d-test');
  expect(fetchMock.mock.calls[1][1].method).toBe('PUT');
  expect(useDeckLibrary.getState().decks).toEqual([shared]);
});

it('serverī dzēstu iepriekš sinhronizētu kopu neimportē atkārtoti', async () => {
  fetchMock.mockResolvedValue(json([]));
  await refreshDeckLibrary([shared]);
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect(combineDecks([], [shared], [])).toEqual([]);
});

it('dzēsta ID marķieris aptur arī vecas nesinhronizētas kopijas atjaunošanu', async () => {
  fetchMock.mockResolvedValueOnce(json([])).mockResolvedValueOnce(json({ detail: 'Kopa ir dzēsta.' }, 410));
  await refreshDeckLibrary([local]);
  expect(useDeckLibrary.getState().retiredIds).toContain(local.id);
  expect(combineDecks([], [local], [], useDeckLibrary.getState().retiredIds)).toEqual([]);
});

it('nepārraksta jaunā saglabājuma rezultātu ar agrāk sāktas ielādes atbildi', async () => {
  let finishOld!: (response: Response) => void;
  fetchMock.mockImplementationOnce(() => new Promise<Response>((resolve) => { finishOld = resolve; }));
  const refresh = refreshDeckLibrary([]);
  fetchMock.mockResolvedValueOnce(json(shared));
  await saveServerDeck(local);
  fetchMock.mockResolvedValueOnce(json([shared]));
  finishOld(json([]));
  await refresh;
  expect(useDeckLibrary.getState().decks).toEqual([shared]);
});

it('neatjauno dzēstu kopu no agrāk sāktas ielādes', async () => {
  useDeckLibrary.setState({ decks: [shared] });
  let finishOld!: (response: Response) => void;
  fetchMock.mockImplementationOnce(() => new Promise<Response>((resolve) => { finishOld = resolve; }));
  const refresh = refreshDeckLibrary([]);
  fetchMock.mockResolvedValueOnce(json({ deleted: true }));
  await deleteServerDeck(shared);
  fetchMock.mockResolvedValueOnce(json([]));
  finishOld(json([shared]));
  await refresh;
  expect(useDeckLibrary.getState().decks).toEqual([]);
});

it('neielādē vecā konta atbildi pēc konta maiņas', async () => {
  let finishOld!: (response: Response) => void;
  fetchMock.mockImplementationOnce(() => new Promise<Response>((resolve) => { finishOld = resolve; }));
  const refresh = refreshDeckLibrary([]);
  localStorage.setItem('rrv-access-token', 'account-b');
  resetDeckLibrary();
  finishOld(json([shared]));
  await refresh;
  expect(useDeckLibrary.getState().decks).toEqual([]);
});

it('servera kļūda saglabā iepriekšējo sarakstu un marķieri', async () => {
  fetchMock.mockResolvedValueOnce(json([shared]));
  await refreshDeckLibrary([]);
  fetchMock.mockResolvedValueOnce(json({}, 503));
  await expect(refreshDeckLibrary([])).rejects.toThrow();
  expect(useDeckLibrary.getState().decks).toEqual([shared]);
  expect(localStorage.getItem('rrv-access-token')).toBe('account-a');
});

it('neizdevusies dzēšana neizņem kopu no saraksta', async () => {
  useDeckLibrary.setState({ decks: [shared] });
  fetchMock.mockResolvedValueOnce(json({ detail: 'Kopa ir mainīta.' }, 409));
  await expect(deleteServerDeck(shared)).rejects.toThrow();
  expect(useDeckLibrary.getState().decks).toEqual([shared]);
});

it('vecie pastiprinātāji nedod iespēju iegādāties jaunus', () => {
  useGame.setState({ coins: 1000, boosts: 5 });
  expect(useGame.getState().buyBoost()).toBe(false);
  expect(useGame.getState().coins).toBe(1000);
  expect(useGame.getState().boosts).toBe(5);
});
