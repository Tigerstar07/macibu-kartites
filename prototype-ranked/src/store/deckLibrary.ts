import { create } from 'zustand';
import type { Deck } from '../types';
import { getToken, request } from '../lib/auth';

export const useDeckLibrary = create<{ decks: Deck[]; retiredIds: string[]; loading: boolean; error: string }>(() => ({ decks: [], retiredIds: [], loading: false, error: '' }));
let loading: Promise<Deck[]> | null = null;
let sessionToken: string | null = null;
let mutationGeneration = 0;

export function resetDeckLibrary() {
  sessionToken = null;
  loading = null;
  mutationGeneration++;
  useDeckLibrary.setState({ decks: [], retiredIds: [], loading: false, error: '' });
}

function authHeaders() { return { Authorization: `Bearer ${getToken()}` }; }
function addToLibrary(deck: Deck) {
  useDeckLibrary.setState((state) => ({ decks: [...state.decks.filter((item) => item.id !== deck.id), deck] }));
}

export async function saveServerDeck(deck: Deck): Promise<Deck> {
  const token = getToken();
  const saved = await request<Deck>(`/api/decks/${encodeURIComponent(deck.id)}`, {
    method: 'PUT', headers: authHeaders(), body: JSON.stringify(deck),
  });
  if (getToken() !== token) throw new Error('Konts ir mainīts. Atver kopu vēlreiz.');
  mutationGeneration++;
  addToLibrary(saved);
  return saved;
}

export async function deleteServerDeck(deck: Deck): Promise<void> {
  if (deck.revision === undefined) return; // Vēl neimportēta vietējā kopa.
  const token = getToken();
  await request(`/api/decks/${encodeURIComponent(deck.id)}?revision=${deck.revision}`, { method: 'DELETE', headers: authHeaders() });
  if (getToken() !== token) throw new Error('Konts ir mainīts. Atver kopu vēlreiz.');
  mutationGeneration++;
  useDeckLibrary.setState((state) => ({ decks: state.decks.filter((item) => item.id !== deck.id), retiredIds: [...state.retiredIds, deck.id] }));
}

export async function refreshDeckLibrary(localDecks: Deck[]): Promise<Deck[]> {
  const token = getToken();
  if (sessionToken !== token) { resetDeckLibrary(); sessionToken = token; }
  if (loading) return loading;
  useDeckLibrary.setState({ loading: true, error: '' });
  const currentSession = token;
  const readStable = async () => {
    let generation: number;
    let result: Deck[];
    do {
      generation = mutationGeneration;
      result = await request<Deck[]>('/api/decks', { headers: authHeaders() });
    } while (generation !== mutationGeneration && getToken() === currentSession);
    return { decks: result, generation };
  };
  const work = (async () => {
    const initial = await readStable();
    if (getToken() !== currentSession || sessionToken !== currentSession) return [];
    let decks = initial.decks;
    const known = new Set(decks.map((deck) => deck.id));
    let imported = false;
    const failures: string[] = [];
    for (const local of localDecks) {
      if (getToken() !== currentSession) return [];
      // Servera kopiju pēc dzēšanas neimportē vēlreiz no vecas pārlūka kešatmiņas.
      if (local.builtin || local.revision !== undefined || known.has(local.id)) continue;
      try {
        const saved = await request<Deck>(`/api/decks/${encodeURIComponent(local.id)}`, {
          method: 'PUT', headers: authHeaders(), body: JSON.stringify(local),
        });
        decks.push(saved);
        known.add(saved.id);
        imported = true;
      } catch (error) {
        if (getToken() !== currentSession) return [];
        if (error instanceof Error && 'status' in error && error.status === 410) {
          useDeckLibrary.setState((state) => ({ retiredIds: [...state.retiredIds, local.id] }));
        } else failures.push(`Kopu “${local.title}” neizdevās augšupielādēt. ${error instanceof Error ? error.message : ''}`);
      }
    }
    if (imported || initial.generation !== mutationGeneration) decks = (await readStable()).decks;
    if (getToken() === currentSession && sessionToken === currentSession) {
      useDeckLibrary.setState({ decks, error: failures.join(' ') });
    }
    return decks;
  })();
  loading = work;
  try { return await work; }
  catch (error) {
    if (getToken() === currentSession) useDeckLibrary.setState({ error: error instanceof Error ? error.message : 'Neizdevās ielādēt kopas.' });
    throw error;
  } finally {
    if (loading === work) { loading = null; useDeckLibrary.setState({ loading: false }); }
  }
}

export function combineDecks(builtin: Deck[], local: Deck[], server: Deck[], retiredIds: string[] = []): Deck[] {
  const serverIds = new Set(server.map((deck) => deck.id));
  return [...builtin, ...local.filter((deck) => deck.revision === undefined && !serverIds.has(deck.id) && !retiredIds.includes(deck.id)), ...server];
}
