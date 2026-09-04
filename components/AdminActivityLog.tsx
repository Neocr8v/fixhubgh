'use client';

import { useEffect, useState } from 'react';
import { formatDatabaseDate } from '@/lib/dates';

interface ActivityItem {
  id: string;
  issue_id: string;
  actor_id: string | null;
  actor_name: string | null;
  message: string;
  ticket_no: string | null;
  created_at: string;
}

export default function AdminActivityLog() {
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/activity')
      .then((res) => res.json())
      .then((data) => {
        setActivity(data.activity ?? []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-card border border-line bg-panel p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase">Activity log</div>
          <h3 className="font-semibold text-lg">Recent admin actions</h3>
        </div>
        <div className="text-xs text-ink/50">Most recent first</div>
      </div>

      {loading ? (
        <div className="text-sm text-ink/40 py-8 text-center">Loading activity…</div>
      ) : activity.length === 0 ? (
        <div className="text-sm text-ink/50 py-8 text-center">No recent admin activity yet.</div>
      ) : (
        <div className="space-y-4">
          {activity.map((item) => (
            <div key={item.id} className="rounded-2xl border border-line p-4 bg-white/5">
              <div className="flex flex-wrap items-center gap-3 text-xs text-ink/60 mb-2">
                <span>{formatDatabaseDate(item.created_at)}</span>
                <span className="h-1.5 w-1.5 rounded-full bg-amber" />
                <span>{item.actor_name ?? 'System'}</span>
                {item.ticket_no ? <span>• {item.ticket_no}</span> : null}
              </div>
              <p className="text-sm text-ink/80">{item.message}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
