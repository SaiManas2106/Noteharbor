'use client';
import { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import Toast from '../../components/Toast';
import Progress from '../../components/Progress';
import EmptyState from '../../components/EmptyState';

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [tenantSlug, setTenantSlug] = useState(null);

  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [meta, setMeta] = useState({ plan: 'FREE', limit: 3, count: 0 });
  const [creatingBlocked, setCreatingBlocked] = useState(false);

  const [editing, setEditing] = useState(null); // note object or null
  const [deleting, setDeleting] = useState(null); // note id or null
  const [query, setQuery] = useState('');

  const [upgradeLoading, setUpgradeLoading] = useState(false);

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
    fetchNotes();
  }, [mounted, token]);

  async function fetchNotes() {
    setError('');
    const res = await fetch('/api/notes', { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to fetch notes'); return; }
    setNotes(data.notes);
    setMeta(data.meta);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(n =>
      (n.title || '').toLowerCase().includes(q) ||
      (n.content || '').toLowerCase().includes(q)
    );
  }, [query, notes]);

  async function createNote(e) {
    e.preventDefault();
    setError('');
    setCreatingBlocked(false);
    const res = await fetch('/api/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title, content })
    });
    const data = await res.json();
    if (!res.ok) {
      if (data.code === 'FREE_LIMIT_REACHED') setCreatingBlocked(true);
      setError(data.error || 'Failed to create note'); return;
    }
    setTitle(''); setContent('');
    setToast('Note created');
    await fetchNotes();
  }

  function startEdit(n) { setEditing(n); }
  function closeEdit() { setEditing(null); }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    const res = await fetch(`/api/notes/${editing.id}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: editing.title, content: editing.content })
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to update note'); return; }
    setToast('Note updated');
    setEditing(null);
    await fetchNotes();
  }

  function startDelete(id) { setDeleting(id); }
  function closeDelete() { setDeleting(null); }

  async function confirmDelete() {
    if (!deleting) return;
    setError('');
    const res = await fetch(`/api/notes/${deleting}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'Failed to delete note'); return; }
    setToast('Note deleted');
    setDeleting(null);
    await fetchNotes();
  }

  async function upgrade() {
    // Admin-only control here; header still has a link to /admin for full admin tools
    setError('');
    setUpgradeLoading(true);
    const res = await fetch(`/api/tenants/${tenantSlug}/upgrade`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    setUpgradeLoading(false);
    if (!res.ok) { setError(data.error || 'Failed to upgrade'); return; }
    setToast('Upgraded to Pro');
    await fetchNotes();
    setCreatingBlocked(false);
  }

  if (!mounted) return <div className="text-gray-400">Loading…</div>;

  const onLimit = meta.plan === 'FREE' && (meta.count >= (meta.limit || 0));
  const isAdmin = role === 'ADMIN';

  return (
    <div className="space-y-6">
      <Toast message={toast} onDone={() => setToast('')} />

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">Notes</h2>
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <span className={`badge ${meta.plan === 'FREE' ? 'badge-free' : 'badge-pro'}`}>
              {meta.plan === 'FREE' ? 'Free' : 'Pro'}
            </span>
            {meta.plan === 'FREE' && <span className="text-gray-300">• {meta.count}/{meta.limit} used</span>}
          </div>
          {meta.plan === 'FREE' && (
            <div className="mt-1 max-w-xs">
              <Progress value={meta.count} max={meta.limit || 1} />
            </div>
          )}
        </div>

        {/* Just search here; Admin/Logout live in the global header */}
        <div className="flex gap-2">
          <input
            className="input"
            placeholder="Search notes…"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Show the "Upgrade to Pro" CTA when the free limit is reached (Admin-only) */}
      {onLimit && isAdmin && (
        <div className="card p-4 rounded-2xl border border-yellow-600/30">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">Free plan limit reached</p>
              <p className="text-sm text-gray-300">Upgrade to Pro to create unlimited notes.</p>
            </div>
            <button onClick={upgrade} className="btn btn-secondary" disabled={upgradeLoading}>
              {upgradeLoading ? 'Upgrading…' : 'Upgrade to Pro'}
            </button>
          </div>
        </div>
      )}

      {/* Create note */}
      <form onSubmit={createNote} className="card p-4 rounded-2xl">
        <div className="grid gap-3">
          <input className="input" placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} />
        </div>
        <div className="grid gap-3 mt-3">
          <textarea className="input h-28" placeholder="Content" value={content} onChange={e=>setContent(e.target.value)} />
        </div>
        <div className="mt-3 flex justify-between items-center">
          <button className="btn btn-primary" disabled={creatingBlocked}>Create Note</button>
          {meta.plan === 'FREE' && <p className="text-sm text-gray-300">{meta.count}/{meta.limit} notes used</p>}
        </div>
      </form>

      {/* Notes list */}
      {filtered.length === 0 ? (
        <EmptyState
          title={notes.length === 0 ? "No notes yet" : "No results"}
          subtitle={notes.length === 0 ? "Create your first note using the form above." : "Try a different search term."}
        />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {filtered.map(n => (
            <div key={n.id} className="card p-4 rounded-2xl">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold truncate">{n.title}</h3>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={()=>startEdit(n)} className="btn btn-secondary">Edit</button>
                  <button onClick={()=>startDelete(n.id)} className="btn btn-danger">Delete</button>
                </div>
              </div>
              {n.content && <p className="text-gray-200 whitespace-pre-wrap mt-2">{n.content}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <Modal open={!!editing} title="Edit Note" onClose={closeEdit}
        footer={<>
          <button onClick={closeEdit} type="button" className="btn btn-secondary">Cancel</button>
          <button onClick={saveEdit} className="btn btn-primary">Save</button>
        </>}>
        {editing && (
          <>
            <input className="input" value={editing.title} onChange={e=>setEditing({...editing, title:e.target.value})} />
            <textarea className="input h-40" value={editing.content} onChange={e=>setEditing({...editing, content:e.target.value})} />
          </>
        )}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!deleting} title="Delete Note?" onClose={closeDelete}
        footer={<>
          <button onClick={closeDelete} type="button" className="btn btn-secondary">Cancel</button>
          <button onClick={confirmDelete} className="btn btn-danger">Delete</button>
        </>}>
        <p className="text-gray-300">This action cannot be undone.</p>
      </Modal>

      {/* Global error (if any) */}
      {error && <div className="text-red-400">{error}</div>}
    </div>
  );
}
