'use client';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [tenantSlug, setTenantSlug] = useState(null);
  const [email, setEmail] = useState('');
  const [inviteMsg, setInviteMsg] = useState('');
  const [upgradeMsg, setUpgradeMsg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMounted(true);
    try {
      setToken(localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
      setTenantSlug(localStorage.getItem('tenantSlug'));
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!token) { window.location.href = '/login'; return; }
    if (role !== 'ADMIN') { window.location.href = '/dashboard'; }
  }, [mounted, token, role]);

  async function invite(e) {
    e.preventDefault(); setError(''); setInviteMsg('');
    const res = await fetch('/api/users/invite', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role: 'MEMBER' })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Invite failed'); return; }
    setInviteMsg(`Invited ${data.user.email}`);
    setEmail('');
  }

  async function upgrade() {
    setError(''); setUpgradeMsg('');
    const res = await fetch(`/api/tenants/${tenantSlug}/upgrade`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Upgrade failed'); return; }
    setUpgradeMsg('Upgraded to PRO');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Admin</h2>
        <a href="/dashboard" className="btn btn-secondary">Back to Notes</a>
      </div>

      {error && <div className="text-red-400">{error}</div>}

      <div className="card p-4 rounded-2xl">
        <h3 className="text-lg font-semibold mb-2">Invite User</h3>
        <form onSubmit={invite} className="flex gap-2">
          <input className="input" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)} />
          <button className="btn btn-primary">Invite</button>
        </form>
        {inviteMsg && <p className="text-green-300 mt-2">{inviteMsg}</p>}
      </div>

      <div className="card p-4 rounded-2xl">
        <h3 className="text-lg font-semibold mb-2">Upgrade Subscription</h3>
        <button onClick={upgrade} className="btn btn-secondary">Upgrade to Pro</button>
        {upgradeMsg && <p className="text-green-300 mt-2">{upgradeMsg}</p>}
      </div>
    </div>
  );
}
