import { FormEvent, useState } from 'react';
import { LockKeyhole, UserRound } from 'lucide-react';
import { login, register, type AuthUser } from '../../lib/auth';
import { Button } from '../ui/Button';
import { Logo } from './AppShell';

export function AuthScreen({ onAuthenticated }: { onAuthenticated: (user: AuthUser) => void | Promise<void> }) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (loading) return;
    setError('');
    if (mode === 'register' && displayName.trim().length < 2) { setError('Vārdam vajag vismaz 2 rakstzīmes.'); return; }
    if (mode === 'register' && password !== confirmation) { setError('Paroles nesakrīt. Ievadi tās vēlreiz.'); return; }
    setLoading(true);
    try { await onAuthenticated(mode === 'login' ? await login(email, password) : await register(email, password, displayName)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Neizdevās pieslēgties.'); }
    finally { setLoading(false); }
  }

  return (
    <main className="fixed inset-0 z-[350] grid place-items-center overflow-y-auto bg-ink-950/95 px-5 py-8 text-white backdrop-blur-xl">
      <div className="w-full max-w-md rounded-3xl border-2 border-white/10 bg-white/[0.07] p-6 shadow-2xl sm:p-8">
        <div className="flex justify-center"><Logo /></div>
        <h1 className="mt-10 text-center font-display text-3xl font-extrabold">{mode === 'login' ? 'Pieslēgties' : 'Izveidot kontu'}</h1>
        <p className="mt-2 text-center text-sm text-white/70">Mācību kartītes ar spēles azartu.</p>
        <p className="mt-2 text-center text-xs text-white/60">Konts glabājas serverī. Spēles progress pagaidām saglabājas šajā pārlūkā.</p>
        <div className="mt-7 h-px bg-white/10" />
        <form onSubmit={submit} className="mt-5 space-y-4" aria-busy={loading}>
          {mode === 'register' && <label className="block text-sm font-bold">Vārds<input required name="display_name" autoComplete="nickname" minLength={2} maxLength={80} value={displayName} onChange={(e) => setDisplayName(e.target.value)} disabled={loading} className="auth-input" placeholder="Tavs vārds" /></label>}
          <label className="block text-sm font-bold">E-pasts<input required name="email" autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} className="auth-input" placeholder="tu@epasts.lv" /></label>
          <label className="block text-sm font-bold">Parole<input required name="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 8 : 1} maxLength={128} type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} className="auth-input" placeholder={mode === 'register' ? 'Vismaz 8 rakstzīmes' : 'Tava parole'} /></label>
          {mode === 'register' && <label className="block text-sm font-bold">Atkārto paroli<input required name="confirmation" autoComplete="new-password" maxLength={128} type="password" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} disabled={loading} className="auth-input" placeholder="Ievadi paroli vēlreiz" /></label>}
          {error && <p role="alert" className="rounded-xl border border-rose-300/30 bg-rose-400/10 px-3 py-2 text-sm text-rose-200">{error}</p>}
          <Button type="submit" variant="primary" size="lg" className="w-full justify-center" disabled={loading} icon={mode === 'login' ? <LockKeyhole className="size-4" /> : <UserRound className="size-4" />}>{loading ? 'Apstrādā...' : mode === 'login' ? 'Pieslēgties' : 'Reģistrēties'}</Button>
        </form>
        <button type="button" disabled={loading} className="mt-6 block w-full text-center text-sm font-bold text-acid hover:underline disabled:opacity-50" onClick={() => { setError(''); setPassword(''); setConfirmation(''); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Vēl nav konta? Reģistrēties' : 'Jau ir konts? Pieslēgties'}</button>
      </div>
    </main>
  );
}
