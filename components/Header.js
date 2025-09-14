'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Logo from './Logo';

export default function Header({ appName = 'NoteHarbor' }) {
  const pathname = usePathname();
  const [role, setRole] = useState(null);
  const [authed, setAuthed] = useState(false);

  const onLogin = pathname === '/login';
  const onDashboard = pathname?.startsWith('/dashboard');
  const onAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      const r = localStorage.getItem('role');
      setAuthed(!!token);
      setRole(r);
    } catch {}
  }, [pathname]);

  const onLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('tenantSlug');
      localStorage.removeItem('role');
    } catch {}
    window.location.href = '/login';
  };

  // ✅ LOGIN PAGE: show only a floating logo (no title, no nav)
  if (onLogin) {
    return (
      <div className="fixed top-6 left-6 z-50">
        <a href="/" aria-label={appName} className="block">
          <Logo size={36} />
        </a>
      </div>
    );
  }

  // ✅ ALL OTHER PAGES: full header with title + context-aware nav
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Logo size={40} />
          <div className="leading-tight">
            <h1 className="text-2xl font-bold">{appName}</h1>
            <p className="text-xs text-gray-400">Multi-tenant notes for teams</p>
          </div>
        </a>

        <nav className="flex items-center gap-2 text-sm">
          {authed && !onDashboard && <a className="underline" href="/dashboard">Dashboard</a>}
          {authed && role === 'ADMIN' && !onAdmin && <a className="underline" href="/admin">Admin</a>}
          {!authed && <a className="underline" href="/login">Login</a>}
          {authed && <button onClick={onLogout} className="btn btn-danger ml-2">Logout</button>}
        </nav>
      </div>
    </header>
  );
}
