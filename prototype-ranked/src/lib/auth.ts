const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const TOKEN_KEY = 'rrv-access-token';

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
  role: 'user' | 'admin' | 'guest';
  created_at: string;
}

interface AuthResponse { access_token: string; user: AuthUser }
interface ValidationIssue { loc?: string[]; type?: string; ctx?: { min_length?: number; max_length?: number } }

class AuthError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }
export function logout() { clearToken(); window.location.replace('/'); }

export function watchAuthChanges(onChange: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || (event.key === TOKEN_KEY && event.oldValue !== event.newValue)) onChange();
  };
  window.addEventListener('storage', onStorage);
  return () => window.removeEventListener('storage', onStorage);
}

export function sessionCheckDelay(now = Date.now()): number {
  try {
    const payload = getToken()?.split('.')[1];
    if (!payload) return 0;
    const encoded = payload.replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    // Tas ir tikai pārbaudes taimeris. Sesijas derīgumu vienmēr pārbauda API.
    return typeof exp === 'number' && Number.isFinite(exp) ? Math.max(0, Math.min(exp * 1000 - now + 1000, 2_147_483_647)) : 0;
  } catch { return 0; }
}

function validationMessage(issues: ValidationIssue[]): string {
  const issue = issues[0];
  const field = issue?.loc?.at(-1);
  const label = field === 'password' ? 'Parolei' : field === 'display_name' ? 'Vārdam' : 'Laukam';
  if (field === 'email') return 'Ievadi derīgu e-pasta adresi.';
  if (issue?.type === 'string_too_short') return `${label} vajag vismaz ${issue.ctx?.min_length} rakstzīmes.`;
  if (issue?.type === 'string_too_long') return `${label} atļautas ne vairāk kā ${issue.ctx?.max_length} rakstzīmes.`;
  return 'Pārbaudi ievadītos datus un mēģini vēlreiz.';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, signal: AbortSignal.timeout(10_000), headers: { 'Content-Type': 'application/json', ...init?.headers } });
  } catch {
    throw new Error('Neizdevās sasniegt serveri. Pārbaudi savienojumu un mēģini vēlreiz.');
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = response.status >= 500 ? 'Serveris pašlaik nav pieejams. Mēģini vēlreiz.'
      : typeof body.detail === 'string' ? body.detail
      : Array.isArray(body.detail) ? validationMessage(body.detail)
      : 'Neizdevās izpildīt pieprasījumu. Mēģini vēlreiz.';
    throw new AuthError(message, response.status);
  }
  return body as T;
}

function saveAuth(response: AuthResponse) { localStorage.setItem(TOKEN_KEY, response.access_token); return response.user; }
export function login(email: string, password: string) { return request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: email.trim(), password }) }).then(saveAuth); }
export function register(email: string, password: string, displayName: string) { return request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email: email.trim(), password, display_name: displayName.trim() }) }).then(saveAuth); }
export async function currentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  try {
    return await request<AuthUser>('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
  } catch (error) {
    if (error instanceof AuthError && error.status === 401) { clearToken(); return null; }
    throw error;
  }
}
