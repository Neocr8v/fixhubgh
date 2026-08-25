'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface HostelOption {
  id: string;
  name: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', hostel: '', room: '', password: '' });
  const [hostels, setHostels] = useState<HostelOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [hostelsLoading, setHostelsLoading] = useState(true);

  useEffect(() => {
    async function loadHostels() {
      setHostelsLoading(true);
      try {
        const res = await fetch('/api/hostels');
        const data = await res.json();
        if (res.ok) {
          setHostels(data.hostels ?? []);
          if (data.hostels?.length) {
            setForm((prev) => ({ ...prev, hostel: data.hostels[0].name }));
          }
        } else {
          setError(data.error ?? 'Unable to load hostel list.');
        }
      } catch {
        setError('Unable to load hostel list.');
      } finally {
        setHostelsLoading(false);
      }
    }

    loadHostels();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.');
      return;
    }
    router.push('/dashboard/student');
    router.refresh();
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-paper px-6 py-16"
      style={{
        backgroundImage: 'url(/login_bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-slate-950/70" />
      <form onSubmit={handleSubmit} className="relative ticket w-full max-w-md shadow-ticket rounded-card pl-8 pr-6 py-8">
        <span className="ticket-notch" style={{ top: '-1px' }} />
        <span className="ticket-notch" style={{ bottom: '-1px' }} />
        <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase mb-1">Student account</div>
        <h1 className="font-display text-2xl font-semibold mb-6">Create your account</h1>

        {error && (
          <div className="mb-4 text-sm text-status-urgent border border-status-urgent/30 bg-status-urgent/5 px-3 py-2 rounded-sm">
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-xs font-medium text-ink/60">Full name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            placeholder="Jordan Blake"
          />
        </label>
        <label className="block mb-4">
          <span className="text-xs font-medium text-ink/60">Email</span>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            placeholder="you@student.edu"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2 mb-4">
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Hostel</span>
            <select
              required
              value={form.hostel}
              onChange={(e) => setForm({ ...form, hostel: e.target.value })}
              className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            >
              {hostelsLoading ? (
                <option>Loading hostels…</option>
              ) : hostels.length > 0 ? (
                hostels.map((hostel) => (
                  <option key={hostel.id} value={hostel.name}>
                    {hostel.name}
                  </option>
                ))
              ) : (
                <option value="">No hostels available</option>
              )}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-medium text-ink/60">Room number</span>
            <input
              required
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
              placeholder="B-214"
            />
          </label>
        </div>
        <label className="block mb-6">
          <span className="text-xs font-medium text-ink/60">Password</span>
          <input
            type="password"
            required
            minLength={6}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            placeholder="At least 6 characters"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper font-medium text-sm py-2.5 rounded-sm hover:bg-steel-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-xs text-ink/50 mt-4 text-center">
          Already have an account?{' '}
          <a href="/" className="text-steel-dark font-medium hover:underline">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
