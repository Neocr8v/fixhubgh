'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import IssueTicket, { IssueListItem } from './IssueTicket';
import AnalyticsPanel from './AnalyticsPanel';
import AdminActivityLog from './AdminActivityLog';
import MetricCard from './MetricCard';
import { CATEGORIES } from '@/lib/constants';

const VIEW_TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'tickets', label: 'All tickets' },
];

const STATUS_FILTERS = ['all', 'reported', 'assigned', 'in_progress', 'resolved'];

export default function AdminDashboard() {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const [view, setView] = useState('overview');
  const [issues, setIssues] = useState<IssueListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (categoryFilter !== 'all') params.set('category', categoryFilter);
    if (search) params.set('search', search);
    fetch(`/api/issues?${params.toString()}`)
      .then((r) => r.json())
      .then((d) => setIssues(d.issues ?? []))
      .finally(() => setLoading(false));
  }, [statusFilter, categoryFilter, search, view]);

  const viewDetail = view === 'overview' ? 'Showing analytics and activity' : 'Current ticket list';

  return (
    <div className="px-10 py-8 max-w-5xl">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase mb-1">Facilities office</div>
          <h1 className="font-display text-3xl font-semibold">Dispatch overview</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <MetricCard label="Search" value={search ? 'Active' : 'Idle'} detail={search ? `Filtering by “${search}”` : 'Use the top search bar.'} />
          <MetricCard label="Tickets" value={issues === null ? 'Loading…' : issues.length.toString()} detail="Current ticket list" />
          <MetricCard label="View" value={view === 'overview' ? 'Analytics' : 'Tickets'} detail="Switch views above" />
        </div>
      </div>

      <div className="flex gap-1 mb-6 border-b border-line">
        {VIEW_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setView(t.key)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              view === t.key ? 'border-amber text-ink' : 'border-transparent text-ink/45 hover:text-ink/70'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {view === 'overview' ? (
        <div className="space-y-4">
          <AnalyticsPanel />
          <AdminActivityLog />
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-3 mb-5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-line bg-white/60 rounded-sm px-3 py-2 text-xs focus:border-steel outline-none"
            >
              {STATUS_FILTERS.map((s) => (
                <option key={s} value={s}>
                  {s === 'all' ? 'All statuses' : s.replace('_', ' ')}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-line bg-white/60 rounded-sm px-3 py-2 text-xs focus:border-steel outline-none"
            >
              <option value="all">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-sm text-ink/40 py-12 text-center">Loading tickets…</div>
          ) : issues.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-line rounded-card">
              <p className="text-ink/50 text-sm">No tickets match these filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {issues.map((issue) => (
                <IssueTicket key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
