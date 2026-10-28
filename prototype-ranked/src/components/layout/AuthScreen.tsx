import { FormEvent, useState } from 'react';
import { LockKeyhole, UserRound } from 'lucide-react';
import { login, register, type AuthUser } from '../../lib/auth';
import { Button } from '../ui/Button';
import { Logo } from './AppShell';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(''); setLoading(true);
    try { onAuthenticated(mode === 'login' ? await login(email, password) : await register(email, password, displayName)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Neizdevās pieslēgties.'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-[350] grid place-items-center overflow-y-auto bg-ink-950/95 px-5 py-8 text-white backdrop-blur-xl">
      <div className="w-full max-w-md rounded-3xl border-2 border-white/10 bg-white/[0.07] p-6 shadow-2xl sm:p-8">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-10 text-center font-display text-3xl font-extrabold">{mode === 'login' ? 'Pieslēgties' : 'Izveidot kontu'}</h1>
        <p className="mt-2 text-center text-sm text-white/60">Saglabā progresu un mācies jebkurā ierīcē.</p>
        <div className="mt-7 h-px bg-white/10" />
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && <label className="block text-sm font-bold">Vārds<input required minLength={2} maxLength={80} value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="auth-input" placeholder="Tavs vārds" /></label>}
          <label className="block text-sm font-bold">E-pasts<input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="auth-input" placeholder="tu@epasts.lv" /></label>
          <label className="block text-sm font-bold">Parole<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="auth-input" placeholder="Vismaz 8 simboli" /></label>
          {error && <p role="alert" className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={loading} icon={mode === 'login' ? <LockKeyhole className="size-4" /> : <UserRound className="size-4" />}>{loading ? 'Apstrādā...' : mode === 'login' ? 'Pieslēgties' : 'Reģistrēties'}</Button>
        </form>
        <button type="button" className="mt-6 block w-full text-center text-sm font-bold text-acid hover:underline" onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Vēl nav konta? Reģistrēties' : 'Jau ir konts? Pieslēgties'}</button>
      </div>
    </div>
  );
}
