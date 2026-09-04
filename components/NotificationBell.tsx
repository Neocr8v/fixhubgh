'use client';

import { useEffect, useState, useCallback } from 'react';

interface NotificationItem {
  id: string;
  ticket_no: string;
  title: string;
  room: string;
  message: string;
  created_at: string;
}

interface NotificationPayload {
  total: number;
  newIssues: NotificationItem[];
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationPayload>({ total: 0, newIssues: [] });
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications');
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data);
      if (!hasLoaded) {
        setSeenIds((data.newIssues ?? []).map((issue: NotificationItem) => issue.id));
        setHasLoaded(true);
      } else if (open) {
        setSeenIds((data.newIssues ?? []).map((issue: NotificationItem) => issue.id));
      }
    } finally {
      setLoading(false);
    }
  }, [hasLoaded, open]);

  const unseenCount = hasLoaded
    ? notifications.newIssues.filter((issue) => !seenIds.includes(issue.id)).length
    : 0;

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setOpen((current) => {
          const nextOpen = !current;
          if (!current) {
            setSeenIds(notifications.newIssues.map((issue) => issue.id));
            loadNotifications();
          }
          return nextOpen;
        })}
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 text-slate-700 shadow-sm transition hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-300"
        aria-expanded={open}
      >
        <span className="sr-only">Open notifications</span>
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6 6 0 1 0-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 1 1-6 0h6Z" />
        </svg>
        {unseenCount > 0 && (
          <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-semibold text-white">
            {unseenCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-[100] mt-3 w-80 overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl">
          <div className="border-b border-slate-200/70 px-4 py-3 text-sm font-semibold text-slate-900">Recent alerts</div>
          <div className="max-h-64 overflow-y-auto p-3">
            {loading ? (
              <p className="text-sm text-slate-500">Loading…</p>
            ) : notifications.newIssues.length === 0 ? (
              <p className="text-sm text-slate-500">No new alerts.</p>
            ) : (
              notifications.newIssues.map((issue) => (
                <div key={issue.id} className="mb-3 rounded-3xl bg-slate-50 px-3 py-3 last:mb-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-xs uppercase tracking-[0.22em] text-slate-500">{issue.ticket_no}</div>
                    <div className="text-[11px] text-slate-400">{issue.created_at.slice(0, 10)}</div>
                  </div>
                  <p className="mt-2 text-sm font-semibold text-slate-900">{issue.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Room {issue.room}</p>
                  <p className="mt-1 text-xs text-slate-600">{issue.message}</p>
                </div>
              ))
            )}
          </div>
          <div className="border-t border-slate-200/70 px-4 py-3 text-xs text-slate-500">Updates refresh every 30 seconds.</div>
        </div>
      )}
    </div>
  );
}
