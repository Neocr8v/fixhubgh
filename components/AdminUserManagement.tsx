'use client';

import { useEffect, useState } from 'react';

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'technician' | 'admin';
  hostel?: string | null;
  room?: string | null;
  specialty?: string | null;
  avatar_url?: string | null;
  is_active: number;
  created_at: string;
}

type ActionResult = { ok?: boolean; error?: string; is_active?: number };

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'technician',
    hostel: '',
    room: '',
    specialty: '',
    password: '',
  });

  async function loadUsers() {
    setLoading(true);
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users ?? []);
    } else {
      setError(data.error ?? 'Unable to load user accounts.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadUsers();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const payload = {
      ...newUser,
      hostel: newUser.hostel || null,
      room: newUser.room || null,
      specialty: newUser.specialty || null,
    };

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? 'Unable to create account.');
      return;
    }

    setNewUser({ name: '', email: '', role: 'technician', room: '', specialty: '', password: '' });
    loadUsers();
  }

  async function handleAction(id: string, action: 'toggle_active' | 'reset_password') {
    setError(null);
    if (action === 'reset_password') {
      const password = window.prompt('Enter a new temporary password (min 6 characters):');
      if (!password) return;
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
      await postAction(id, action, { password });
      return;
    }
    await postAction(id, action);
  }

  async function postAction(id: string, action: string, body: Record<string, string> = {}) {
    setSaving(true);
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action, ...body }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? 'Unable to update account.');
      return;
    }
    if (data.is_active !== undefined) {
      setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, is_active: data.is_active ?? user.is_active } : user)));
    } else {
      await loadUsers();
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="rounded-card border border-line bg-panel p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase">Team management</div>
              <h2 className="font-display text-xl font-semibold">Manage accounts</h2>
            </div>
          </div>
          <p className="text-sm text-ink/60">Create technicians, students, or extra admins. Activate, deactivate, and reset passwords safely from one place.</p>

          {error && (
            <div className="mt-4 text-sm text-status-urgent border border-status-urgent/30 bg-status-urgent/5 px-3 py-2 rounded-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleCreate} className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-ink/60">Name</span>
                <input
                  required
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-ink/60">Email</span>
                <input
                  required
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                />
              </label>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-medium text-ink/60">Role</span>
                <select
                  required
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value as any })}
                  className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                >
                  <option value="technician">Technician</option>
                  <option value="student">Student</option>
                  <option value="admin">Administrator</option>
                </select>
              </label>
              <label className="block">
                <span className="text-xs font-medium text-ink/60">Password</span>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                />
              </label>
            </div>

            {newUser.role === 'student' ? (
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-ink/60">Hostel</span>
                  <input
                    required
                    value={newUser.hostel}
                    onChange={(e) => setNewUser({ ...newUser, hostel: e.target.value })}
                    className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                    placeholder="Main, North, South..."
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink/60">Room</span>
                  <input
                    required
                    value={newUser.room}
                    onChange={(e) => setNewUser({ ...newUser, room: e.target.value })}
                    className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                    placeholder="B-214"
                  />
                </label>
              </div>
            ) : null}

            {newUser.role === 'technician' ? (
              <label className="block">
                <span className="text-xs font-medium text-ink/60">Specialty</span>
                <input
                  required
                  value={newUser.specialty}
                  onChange={(e) => setNewUser({ ...newUser, specialty: e.target.value })}
                  className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                />
              </label>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-steel-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Create account'}
            </button>
          </form>
        </section>

        <section className="rounded-card border border-line bg-panel p-5 shadow-sm">
          <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase mb-3">Quick actions</div>
          <div className="text-sm text-ink/60 space-y-3">
            <p>
              Use the account table to activate or pause technician and student accounts. Admins are protected from being deactivated through this panel.
            </p>
            <p>
              Reset passwords instantly and keep technician workloads visible in the ticket view. This is ideal for onboarding new maintenance staff.
            </p>
          </div>
        </section>
      </div>

      <section className="rounded-card border border-line bg-panel p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase">Accounts</div>
            <h3 className="font-semibold text-lg">All user accounts</h3>
          </div>
          <div className="text-xs text-ink/50">{users.length} accounts</div>
        </div>

        {loading ? (
          <div className="text-sm text-ink/40 py-8 text-center">Loading accounts…</div>
        ) : users.length === 0 ? (
          <div className="text-sm text-ink/50 py-8 text-center">No accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-[0.2em] text-ink/50 border-b border-line">
                  <th className="py-3 pr-4">Name</th>
                  <th className="py-3 pr-4">Email</th>
                  <th className="py-3 pr-4">Role</th>
                  <th className="py-3 pr-4">Details</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-line last:border-b-0">
                    <td className="py-3 pr-4 font-medium text-ink">
                      <div className="flex items-center gap-3">
                        {user.avatar_url ? (
                          <img src={user.avatar_url} alt={user.name} className="h-9 w-9 rounded-full object-cover border border-line" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold uppercase text-slate-200 border border-line">
                            {user.name
                              .split(' ')
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                        )}
                        <span className="truncate">{user.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-ink/70">{user.email}</td>
                    <td className="py-3 pr-4 uppercase tracking-[0.08em] text-ink/50">{user.role}</td>
                    <td className="py-3 pr-4 text-ink/70">
                      {user.role === 'student'
                        ? `${user.hostel ?? '—'} / Room ${user.room ?? '—'}`
                        : user.role === 'technician'
                        ? user.specialty
                        : '—'}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${user.is_active ? 'bg-emerald/10 text-emerald' : 'bg-status-urgent/10 text-status-urgent'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={saving || user.role === 'admin'}
                          onClick={() => handleAction(user.id, 'toggle_active')}
                          className="text-xs font-medium rounded-sm border border-line px-2.5 py-1 transition-colors hover:border-steel disabled:opacity-40"
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          type="button"
                          disabled={saving || user.role === 'admin'}
                          onClick={() => handleAction(user.id, 'reset_password')}
                          className="text-xs font-medium rounded-sm border border-line px-2.5 py-1 transition-colors hover:border-steel disabled:opacity-40"
                        >
                          Reset password
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
