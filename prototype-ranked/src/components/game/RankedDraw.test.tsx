import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { BUILTIN_DECKS } from '../../data/decks';
import { useGame } from '../../store/useGame';
import { RankedDraw } from './RankedDraw';

vi.mock('motion/react', async (importOriginal) => ({
  ...await importOriginal<typeof import('motion/react')>(),
  useReducedMotion: () => false,
}));

let host: HTMLDivElement;
let root: Root;
beforeEach(() => {
  vi.useFakeTimers();
  // React's act environment flag belongs to the test runner.
  Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });
  useGame.setState({ settings: { ...useGame.getState().settings, reducedMotion: false, lang: 'lv' } });
  host = document.createElement('div');
  document.body.appendChild(host);
  root = createRoot(host);
});
afterEach(() => { act(() => root.unmount()); host.remove(); vi.useRealTimers(); });

it('automātiski sāk tieši izlozēto Ranked kopu tikai pēc apstāšanās', () => {
  const onStart = vi.fn();
  act(() => root.render(<RankedDraw decks={BUILTIN_DECKS} playerRankIndex={0} onStart={onStart} onCancel={() => {}} />));
  expect(host.querySelector('h1')?.textContent).toBe('Tava nākamā tēma');
  act(() => vi.advanceTimersByTime(3200));
  const selected = host.querySelector('[role="status"]')?.textContent;
  expect(onStart).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1100));
  expect(onStart).toHaveBeenCalledTimes(1);
  expect(selected).toContain(onStart.mock.calls[0][0].title);
});

it('atceļ automātisko sākšanu, ja izlozes ekrānu aizver', () => {
  const onStart = vi.fn();
  act(() => root.render(<RankedDraw decks={BUILTIN_DECKS} playerRankIndex={0} onStart={onStart} onCancel={() => {}} />));
  act(() => root.render(null));
  act(() => vi.advanceTimersByTime(10000));
  expect(onStart).not.toHaveBeenCalled();
});

it('bez pieejamas kopas parāda paskaidrojumu un nesāk spēli', () => {
  const onStart = vi.fn();
  act(() => root.render(<RankedDraw decks={[]} playerRankIndex={0} onStart={onStart} onCancel={() => {}} />));
  act(() => vi.advanceTimersByTime(10000));
  expect(host.textContent).toContain('nav pieejamas spēlējamas kopas');
  expect(onStart).not.toHaveBeenCalled();
});
