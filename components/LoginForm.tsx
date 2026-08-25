'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@hostel.edu', password: 'admin123' },
  { role: 'Technician', email: 'marcus.reid@hostel.edu', password: 'tech123' },
  { role: 'Student', email: 'priya.n@student.edu', password: 'student123' },
];

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.');
      return;
    }
    routeByRole(data.user.role);
  }

  function routeByRole(role: string) {
    if (role === 'admin') router.push('/dashboard/admin');
    else if (role === 'technician') router.push('/dashboard/technician');
    else router.push('/dashboard/student');
    router.refresh();
  }

  function selectRole(role?: string) {
    setSelectedRole(role ?? null);
    setError(null);
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="ticket relative shadow-ticket rounded-card pl-8 pr-6 py-8">
        <span className="ticket-notch" style={{ top: '-1px' }} />
        <span className="ticket-notch" style={{ bottom: '-1px' }} />
        <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase mb-1">Sign in</div>
        <h1 className="font-display text-2xl font-semibold text-slate-950 mb-4">Access your dashboard</h1>

        <div className="mb-3 text-xs uppercase tracking-[0.25em] text-ink/50">Select a role</div>
        <div className="mb-6 grid grid-cols-3 gap-2">
          {DEMO_ACCOUNTS.map((a) => (
            <button
              key={a.role}
              type="button"
              onClick={() => selectRole(a.role)}
              className={`rounded-2xl border px-3 py-2 text-xs font-semibold transition ${
                selectedRole === a.role
                  ? 'border-amber bg-amber-100 text-ink'
                  : 'border-line bg-panel text-ink hover:border-steel'
              }`}
            >
              {a.role}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 text-sm text-status-urgent border border-status-urgent/30 bg-status-urgent/5 px-3 py-2 rounded-sm">
            {error}
          </div>
        )}

        <label className="block mb-4">
          <span className="text-xs font-medium text-ink/60">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm text-ink focus:border-steel outline-none"
            placeholder="you@student.edu"
          />
        </label>
        <label className="block mb-6">
          <span className="text-xs font-medium text-ink/60">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm text-ink focus:border-steel outline-none"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper font-medium text-sm py-2.5 rounded-sm hover:bg-steel-dark transition-colors disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-xs text-ink/50 mt-4 text-center">
          New student?{' '}
          <a href="/register" className="text-steel-dark font-medium hover:underline">
            Create an account
          </a>
        </p>
      </form>
    </div>
  );
}
