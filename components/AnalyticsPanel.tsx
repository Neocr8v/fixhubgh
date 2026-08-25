'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

const STATUS_COLORS: Record<string, string> = {
  reported: '#E8A33D',
  assigned: '#3E5C76',
  in_progress: '#7C6FDB',
  resolved: '#4C8C6B',
};

interface Analytics {
  byCategory: { category: string; count: number }[];
  byStatus: { status: string; count: number }[];
  byPriority: { priority: string; count: number }[];
  totals: { total: number; resolved: number; duplicates: number };
  avgResolutionDays: number | null;
  trend: { day: string; count: number }[];
  byRoom: { room: string; count: number }[];
  technicianLoad: { name: string; active: number }[];
}

function getFormattedDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function buildDefaultStartDate() {
  const date = new Date();
  date.setDate(date.getDate() - 14);
  return getFormattedDate(date);
}

export default function AnalyticsPanel() {
  const [data, setData] = useState<Analytics | null>(null);
  const [startDate, setStartDate] = useState(buildDefaultStartDate());
  const [endDate, setEndDate] = useState(getFormattedDate(new Date()));
  const [error, setError] = useState<string | null>(null);

  const updateStartDate = (value: string) => {
    setStartDate(value);
    if (value > endDate) setEndDate(value);
  };

  const updateEndDate = (value: string) => {
    setEndDate(value);
    if (value < startDate) setStartDate(value);
  };

  useEffect(() => {
    setError(null);
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    fetch(`/api/analytics?${params.toString()}`)
      .then(async (r) => {
        const text = await r.text();
        if (!r.ok) {
          throw new Error(text || r.statusText || 'Failed to load analytics');
        }
        if (!text) {
          throw new Error('Analytics response was empty');
        }
        try {
          return JSON.parse(text) as Analytics;
        } catch (parseError) {
          throw new Error(`Invalid analytics response: ${text}`);
        }
      })
      .then(setData)
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : 'Unable to load analytics');
      });
  }, [startDate, endDate]);

  if (error) return <div className="text-sm text-red-600 py-8">{error}</div>;
  if (!data) return <div className="text-sm text-ink/40 py-8">Loading analytics…</div>;

  const openRate = data.totals.total > 0 ? Math.round(((data.totals.total - data.totals.resolved) / data.totals.total) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Date range</p>
          <div className="flex flex-wrap gap-3">
            <label className="flex flex-col text-xs text-ink/80">
              From
              <input
                type="date"
                value={startDate}
                max={endDate}
                onChange={(e) => updateStartDate(e.target.value)}
                className="mt-1 rounded-sm border border-line px-3 py-2 text-sm outline-none"
              />
            </label>
            <label className="flex flex-col text-xs text-ink/80">
              To
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => updateEndDate(e.target.value)}
                className="mt-1 rounded-sm border border-line px-3 py-2 text-sm outline-none"
              />
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/api/analytics?format=csv&start=${encodeURIComponent(startDate)}&end=${encodeURIComponent(endDate)}`}
            download
            className="rounded-full border border-line bg-white/90 px-4 py-2 text-sm font-semibold text-ink transition hover:bg-slate-100"
          >
            Export analytics CSV
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Total tickets" value={data.totals.total.toString()} />
        <StatTile label="Resolved" value={data.totals.resolved.toString()} />
        <StatTile label="Open" value={`${openRate}%`} />
        <StatTile
          label="Avg. resolution"
          value={data.avgResolutionDays ? `${data.avgResolutionDays.toFixed(1)}d` : '—'}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <ChartCard title="Issues by category">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.byCategory} layout="vertical" margin={{ left: 8, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D3C4" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: '#181B1999' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <YAxis
                type="category"
                dataKey="category"
                tick={{ fontSize: 11, fill: '#181B19cc' }}
                axisLine={false}
                tickLine={false}
                width={80}
              />
              <Tooltip
                contentStyle={{ fontSize: 12, borderRadius: 2, border: '1px solid #D8D3C4' }}
                cursor={{ fill: '#18191906' }}
              />
              <Bar dataKey="count" fill="#3E5C76" radius={[0, 2, 2, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Status breakdown">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.byStatus}
                dataKey="count"
                nameKey="status"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.byStatus.map((s) => (
                  <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? '#999'} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, border: '1px solid #D8D3C4' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-1">
            {data.byStatus.map((s) => (
              <div key={s.status} className="flex items-center gap-1.5 text-xs text-ink/60">
                <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[s.status] }} />
                {s.status.replace('_', ' ')} ({s.count})
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard title="Reports over the last 14 days">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.trend} margin={{ left: -20, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D3C4" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 10, fill: '#181B1999' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: string) => v.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: '#181B1999' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, border: '1px solid #D8D3C4' }} />
              <Line type="monotone" dataKey="count" stroke="#E8A33D" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Technician load (active tickets)">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data.technicianLoad} margin={{ left: -20, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#D8D3C4" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#181B1999' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#181B1999' }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 2, border: '1px solid #D8D3C4' }} />
              <Bar dataKey="active" fill="#7C6FDB" radius={[2, 2, 0, 0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {data.totals.duplicates > 0 && (
        <div className="text-xs text-ink/50 border border-line rounded-sm px-3 py-2 bg-panel">
          <span className="font-medium text-ink/70">{data.totals.duplicates}</span> ticket
          {data.totals.duplicates === 1 ? '' : 's'} flagged as possible duplicates of an existing report — worth a
          look for hostel-wide problems.
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line rounded-card bg-panel px-4 py-3">
      <div className="text-[10px] font-mono uppercase tracking-wide text-ink/40">{label}</div>
      <div className="font-display text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-line rounded-card bg-panel px-4 py-4">
      <div className="text-xs font-medium text-ink/60 mb-2">{title}</div>
      {children}
    </div>
  );
}
