'use client';

import { useEffect, useState } from 'react';

interface HostelRow {
  id: string;
  name: string;
}

export default function AdminHostelManagement() {
  const [hostels, setHostels] = useState<HostelRow[]>([]);
  const [newHostel, setNewHostel] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadHostels() {
    setLoading(true);
    const res = await fetch('/api/admin/hostels');
    const data = await res.json();
    if (res.ok) {
      setHostels(data.hostels ?? []);
      setError(null);
    } else {
      setError(data.error ?? 'Unable to load hostels.');
    }
    setLoading(false);
  }

  useEffect(() => {
    loadHostels();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch('/api/admin/hostels', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newHostel }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? 'Unable to add hostel.');
      return;
    }
    setNewHostel('');
    loadHostels();
  }

  async function handleDelete(id: string) {
    setSaving(true);
    setError(null);
    const res = await fetch('/api/admin/hostels', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? 'Unable to remove hostel.');
      return;
    }
    loadHostels();
  }

  return (
    <section className="rounded-card border border-line bg-panel p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase">Hostel management</div>
          <h2 className="font-display text-xl font-semibold">Manage hostels</h2>
        </div>
      </div>

      <p className="text-sm text-ink/60 mb-4">Add or remove hostel buildings and keep the student registration form in sync.</p>

      {error && (
        <div className="mb-4 text-sm text-status-urgent border border-status-urgent/30 bg-status-urgent/5 px-3 py-2 rounded-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleCreate} className="grid gap-3 sm:grid-cols-[1fr_auto] mb-4">
        <label className="block">
          <span className="text-xs font-medium text-ink/60">New hostel</span>
          <input
            required
            value={newHostel}
            onChange={(e) => setNewHostel(e.target.value)}
            className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            placeholder="Enter hostel name"
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="h-full rounded-sm bg-ink text-paper px-4 py-2 text-sm font-medium hover:bg-steel-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Adding…' : 'Add hostel'}
        </button>
      </form>

      {loading ? (
        <div className="text-sm text-ink/40 py-6 text-center">Loading hostels…</div>
      ) : hostels.length === 0 ? (
        <div className="text-sm text-ink/50 py-6 text-center">No hostels found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.2em] text-ink/50 border-b border-line">
                <th className="py-3 pr-4">Hostel</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((hostel) => (
                <tr key={hostel.id} className="border-b border-line last:border-b-0">
                  <td className="py-3 pr-4 text-ink">{hostel.name}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleDelete(hostel.id)}
                      className="text-xs font-medium rounded-sm border border-line px-2.5 py-1 transition-colors hover:border-steel disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
