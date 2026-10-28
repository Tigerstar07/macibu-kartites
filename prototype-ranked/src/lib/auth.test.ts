import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { currentUser, getToken, login, watchAuthChanges, sessionCheckDelay } from './auth';

describe('sesijas pārbaude', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.unstubAllGlobals());

  it('neizsauc API, ja marķiera nav', async () => {
    const fetcher = vi.fn();
    vi.stubGlobal('fetch', fetcher);
    expect(await currentUser()).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });

  it('saglabā marķieri, ja serveris nav sasniedzams', async () => {
    localStorage.setItem('rrv-access-token', 'saved-token');
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    await expect(currentUser()).rejects.toThrow('serveri');
    expect(getToken()).toBe('saved-token');
  });

  it('saglabā marķieri pēc servera kļūdas', async () => {
    localStorage.setItem('rrv-access-token', 'saved-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 503 })));
    await expect(currentUser()).rejects.toThrow();
    expect(getToken()).toBe('saved-token');
  });

  it('izdzēš marķieri tikai pēc noraidītas autentifikācijas', async () => {
    localStorage.setItem('rrv-access-token', 'expired-token');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: 401 })));
    expect(await currentUser()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it('parāda lauka kļūdu latviski', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ detail: [{ loc: ['body', 'password'], type: 'string_too_long', ctx: { max_length: 128 } }] }), { status: 422 })));
    await expect(login('roberts@example.com', 'a'.repeat(129))).rejects.toThrow('128');
  });

  it('paziņo par izrakstīšanos citā cilnē un atvieno klausītāju', () => {
    const changed = vi.fn();
    const stop = watchAuthChanges(changed);
    window.dispatchEvent(new StorageEvent('storage', { key: 'other-key', oldValue: 'a', newValue: 'b' }));
    expect(changed).not.toHaveBeenCalled();
    window.dispatchEvent(new StorageEvent('storage', { key: 'rrv-access-token', oldValue: 'saved', newValue: null }));
    expect(changed).toHaveBeenCalledTimes(1);
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    expect(changed).toHaveBeenCalledTimes(2);
    stop();
    window.dispatchEvent(new StorageEvent('storage', { key: null }));
    expect(changed).toHaveBeenCalledTimes(2);
  });

  it('plāno sesijas pārbaudi pēc marķiera termiņa', () => {
    const now = 1_700_000_000_000;
    const token = `header.${btoa(JSON.stringify({ exp: now / 1000 + 60 }))}.signature`;
    localStorage.setItem('rrv-access-token', token);
    expect(sessionCheckDelay(now)).toBe(61_000);
    expect(sessionCheckDelay(now + 120_000)).toBe(0);
    localStorage.setItem('rrv-access-token', 'broken');
    expect(sessionCheckDelay(now)).toBe(0);
  });
});
