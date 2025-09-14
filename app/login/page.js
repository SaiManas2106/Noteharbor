'use client';
import { useEffect, useState } from 'react';
import Logo from '../../components/Logo';

export default function LoginPage() {
  // form state (start empty; buttons will fill)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false); // opt-in

  // ui state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // if already logged in, go to dashboard
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) window.location.href = '/dashboard';
    } catch {}
  }, []);

  async function signIn(e) {
    e?.preventDefault?.();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('tenantSlug', data.tenant.slug);
      localStorage.setItem('role', data.user.role);
      if (remember) {
        try { localStorage.setItem('lastEmail', email); } catch {}
      }

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  // Quick sign-in: fill form fields (NO auto submit)
  function quickFill(addr) {
    setEmail(addr);
    setPassword('password');
  }

  return (
    <div className="min-h-[75vh] grid lg:grid-cols-2 gap-12 place-items-center">
      {/* Left: Brand / Pitch (centered) */}
      <section className="w-full max-w-xl space-y-6 justify-self-center lg:justify-self-start">
        <div className="flex items-center gap-4">
          <Logo size={48} />
          <div>
            <h1 className="text-3xl font-bold leading-tight">NoteHarbor</h1>
            <p className="text-sm text-gray-300">Multi-tenant notes for teams (Acme & Globex demo)</p>
          </div>
        </div>

        <ul className="space-y-2 text-gray-200">
          <li className="flex items-start gap-2"><span>✅</span> Strict tenant isolation (Acme ↔ Globex)</li>
          <li className="flex items-start gap-2"><span>✅</span> Role-based access: Admin & Member</li>
          <li className="flex items-start gap-2"><span>✅</span> Free (3 notes) → Pro (unlimited)</li>
        </ul>

        <div className="card rounded-2xl p-4">
          <p className="text-sm text-gray-300 mb-2">Quick sign-in (demo accounts):</p>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => quickFill('admin@acme.test')}
              title="Fills email & password (password is: password)"
            >
              Acme Admin
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => quickFill('user@acme.test')}
              title="Fills email & password (password is: password)"
            >
              Acme Member
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => quickFill('admin@globex.test')}
              title="Fills email & password (password is: password)"
            >
              Globex Admin
            </button>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => quickFill('user@globex.test')}
              title="Fills email & password (password is: password)"
            >
              Globex Member
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            These buttons fill the form. Click <b>Sign in</b> to continue.
          </p>
        </div>
      </section>

      {/* Right: Sign-in form (centered) */}
      <section className="w-full max-w-md md:ml-auto">
        <div className="card p-6 rounded-2xl shadow-xl">
          <h2 className="text-xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-gray-300 mb-4">Access your notes and manage your team.</p>

          <form className="space-y-4" onSubmit={signIn}>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input mt-1"
                autoComplete="username"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  className="input pr-12"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-300 hover:text-white"
                  onClick={() => setShowPassword(v => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                />
                Remember email
              </label>
              <a className="text-sm text-gray-400 hover:underline" href="#" onClick={e => e.preventDefault()}>
                Forgot password?
              </a>
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <button
              className="btn btn-primary w-full"
              disabled={loading}
              aria-busy={loading}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="mt-6 text-xs text-gray-400">
            By signing in you agree to the demo terms. 
          </div>
        </div>
      </section>
    </div>
  );
}
