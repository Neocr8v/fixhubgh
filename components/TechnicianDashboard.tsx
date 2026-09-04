'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import IssueTicket, { IssueListItem } from './IssueTicket';
import MetricCard from './MetricCard';

const TABS = [
  { key: 'open', label: 'Open' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
];

export default function TechnicianDashboard({ user }: { user: { name: string; specialty?: string | null } }) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('open');

  useEffect(() => {
    setLoading(true);
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    fetch(`/api/issues${query}`)
      .then((r) => r.json())
      .then((d) => setIssues(d.issues ?? []))
      .finally(() => setLoading(false));
  }, [search]);

  const filtered =
    tab === 'open' ? issues.filter((i) => i.status !== 'resolved') : issues.filter((i) => i.status === tab);

  const activeCount = issues.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="w-full max-w-6xl px-6 py-8 lg:px-10">
      <div className="mb-8 space-y-6">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase mb-1">
            {user.specialty ?? 'General maintenance'}
          </div>
          <h1 className="font-display text-3xl font-semibold">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-ink/50 text-sm mt-1">
            {activeCount === 0 ? 'No active assignments.' : `${activeCount} active assignment${activeCount === 1 ? '' : 's'}.`}
          </p>
        </div>
        <div className="grid w-full gap-4 sm:grid-cols-3">
          <MetricCard label="Active" value={activeCount.toString()} detail="Assignments not resolved" />
          <MetricCard label="Search" value={search ? 'Active' : 'Idle'} detail={search ? `Filtering by “${search}”` : 'Use the top search bar.'} />
          <MetricCard label="Tab" value={tab === 'open' ? 'Open' : tab.replace('_', ' ')} detail="Current ticket filter" />
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key ? 'border-amber text-ink' : 'border-transparent text-ink/45 hover:text-ink/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-sm text-ink/40 py-12 text-center">Loading assignments…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line rounded-card">
          <p className="text-ink/50 text-sm">Nothing here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => (
            <IssueTicket key={issue.id} issue={issue} />
          ))}
        </div>
      )}
    </div>
  );
}
