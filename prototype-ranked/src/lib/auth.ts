const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
const TOKEN_KEY = 'rrv-access-token';

export interface AuthUser {
  id: number;
  email: string;
  display_name: string;
  role: 'user' | 'admin' | 'guest';
  created_at: string;
}

interface AuthResponse { access_token: string; user: AuthUser }

export function getToken() { return localStorage.getItem(TOKEN_KEY); }
export function clearToken() { localStorage.removeItem(TOKEN_KEY); }

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(typeof body.detail === 'string' ? body.detail : 'Request failed');
  return body as T;
}

function saveAuth(response: AuthResponse) { localStorage.setItem(TOKEN_KEY, response.access_token); return response.user; }
export function login(email: string, password: string) { return request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }).then(saveAuth); }
export function register(email: string, password: string, displayName: string) { return request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, display_name: displayName }) }).then(saveAuth); }
export function currentUser() {
  const token = getToken();
  if (!token) return Promise.resolve(null);
  return request<AuthUser>('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } }).catch(() => { clearToken(); return null; });
}
