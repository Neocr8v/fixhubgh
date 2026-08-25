'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import NotificationBell from './NotificationBell';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard/admin': 'Dispatch overview',
  '/dashboard/admin/users': 'Team management',
  '/dashboard/student': 'My tickets',
  '/dashboard/technician': 'Assignments',
};

const PAGE_SUBTITLES: Record<string, string> = {
  '/dashboard/admin': 'Manage tickets, approvals, and daily operations from one dashboard.',
  '/dashboard/admin/users': 'Create, activate, and support your hostel team accounts.',
  '/dashboard/student': 'Track your maintenance requests and stay on top of progress.',
  '/dashboard/technician': 'View your assigned repairs and keep work moving smoothly.',
};

const ROLE_TAGLINES: Record<string, string> = {
  admin: 'Ready to manage the day?',
  student: 'Ready to check your tickets?',
  technician: 'Ready to complete your assignments?',
};

function getPageTitle(pathname: string) {
  if (pathname.startsWith('/dashboard/issue/')) return 'Ticket details';
  return PAGE_TITLES[pathname] ?? 'Dashboard';
}

function getPageSubtitle(pathname: string) {
  if (pathname.startsWith('/dashboard/issue/')) return 'Review updates and add progress notes for this ticket.';
  return PAGE_SUBTITLES[pathname] ?? 'A quick view of your current maintenance workflow.';
}

export default function TopBar({ user, pathname }: { user: { name: string; role: string }; pathname: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSearch = searchParams.get('search') ?? '';
  const [query, setQuery] = useState(currentSearch);

  useEffect(() => {
    setQuery(currentSearch);
  }, [currentSearch]);

  const pageTitle = useMemo(() => getPageTitle(pathname), [pathname]);
  const pageSubtitle = useMemo(() => getPageSubtitle(pathname), [pathname]);
  const tagline = ROLE_TAGLINES[user.role] ?? 'Welcome back.';

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (query.trim()) {
      params.set('search', query.trim());
    } else {
      params.delete('search');
    }
    const searchString = params.toString();
    router.push(`${pathname}${searchString ? `?${searchString}` : ''}`);
  };

  return (
    <header className="border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-white shadow-sm shadow-slate-400/10 overflow-hidden">
            <img src="/logo.png" alt="HostelCare logo" className="h-full w-full object-cover" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.32em] text-slate-500">HostelCare</p>
            <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>
            <p className="mt-1 text-sm text-slate-500">{pageSubtitle}</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="flex flex-1 items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm sm:max-w-xl">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tickets, room or issue…"
            className="flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
          <button
            type="submit"
            className="rounded-full bg-ink px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white transition hover:bg-slate-700"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-3">
          <NotificationBell />
          <div className="hidden rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-700 sm:block">
            {tagline}
          </div>
        </div>
      </div>
    </header>
  );
}
