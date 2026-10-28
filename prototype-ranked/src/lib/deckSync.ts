import { getToken } from './auth';
import { useGame } from '../store/useGame';
import { refreshDeckLibrary, useDeckLibrary } from '../store/deckLibrary';

export async function syncDecks() {
  const token = getToken();
  const decks = await refreshDeckLibrary(useGame.getState().userDecks);
  if (getToken() !== token) return;
  const retired = useDeckLibrary.getState().retiredIds;
  const pending = useGame.getState().userDecks.filter((deck) => deck.revision === undefined && !retired.includes(deck.id) && !decks.some((remote) => remote.id === deck.id));
  const owned = [...decks.filter((deck) => deck.canEdit), ...pending];
  if (JSON.stringify(owned) !== JSON.stringify(useGame.getState().userDecks)) useGame.setState({ userDecks: owned });
}
