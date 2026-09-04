'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode } from 'react';
import TopBar from './TopBar';

interface Props {
  user: { name: string; role: string; email: string; room?: string | null; avatar_url?: string | null };
  children: ReactNode;
}

const NAV: Record<string, { href: string; label: string }[]> = {
  student: [
    { href: '/dashboard/student', label: 'My tickets' },
    { href: '/dashboard/profile', label: 'My profile' },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Overview' },
    { href: '/dashboard/admin/users', label: 'Team & hostels' },
    { href: '/dashboard/profile', label: 'Settings & profile' },
  ],
  technician: [
    { href: '/dashboard/technician', label: 'My assignments' },
    { href: '/dashboard/profile', label: 'My profile' },
  ],
};

export default function AppShell({ user, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  const links = NAV[user.role] ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink">
      <TopBar user={user} pathname={pathname} />

      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-72 shrink-0 flex-col bg-ink text-paper md:flex">
          <div className="px-5 py-6 border-b border-white/10">
            <div className="font-mono text-[11px] tracking-[0.2em] text-amber uppercase">Work Order System</div>
            <div className="font-display text-lg font-semibold mt-1">Hostel Maintenance</div>
          </div>
          <nav className="flex-1 px-3 py-5">
            <div className="px-3 pb-3 text-[10px] font-mono uppercase tracking-[0.28em] text-paper/40">
              {user.role === 'admin' ? 'Administration' : 'Workspace'}
            </div>
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`block rounded-2xl px-3 py-2 text-sm font-medium transition-colors ${
                    active ? 'bg-amber text-ink' : 'text-paper/80 hover:bg-white/10'
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
            {user.role === 'admin' ? (
              <div className="mt-8 border-t border-white/10 px-3 pt-5">
                <div className="text-[10px] font-mono uppercase tracking-[0.28em] text-amber">Admin desk</div>
                <p className="mt-2 text-xs leading-5 text-paper/55">
                  Keep tickets moving, maintain your team, and keep hostel records current.
                </p>
              </div>
            ) : null}
          </nav>
          <div className="px-4 py-5 border-t border-white/10">
            <div className="flex items-center gap-3">
              {user.avatar_url ? (
                <img src={user.avatar_url} alt="Avatar" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/8 text-sm font-semibold text-paper">
                  {user.name
                    .split(' ')
                    .map((s) => s[0])
                    .slice(0, 2)
                    .join('')}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold truncate">{user.name}</div>
                <div className="text-xs text-paper/60 truncate">{user.email}</div>
              </div>
            </div>
            <div className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-amber">
              {user.role}
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full rounded-full bg-amber px-3 py-2 text-sm font-semibold text-ink shadow-sm shadow-slate-950/10 transition hover:bg-amber-dark"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="flex-1 min-w-0 overflow-hidden">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
