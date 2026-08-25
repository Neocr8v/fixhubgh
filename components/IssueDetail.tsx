'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { StatusBadge, PriorityTag } from './StatusBadge';
import { STATUS_LABELS } from '@/lib/constants';

interface IssueFull {
  id: string;
  ticket_no: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  room: string;
  hostel: string;
  image_data: string | null;
  student_id: string;
  technician_id: string | null;
  student_name?: string;
  technician_name?: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

interface UpdateItem {
  id: string;
  message: string;
  actor_name: string;
  created_at: string;
}

interface Technician {
  id: string;
  name: string;
  specialty: string | null;
  active_count: number;
}

export default function IssueDetail({ id, user }: { id: string; user: { role: string; id: string } }) {
  const [issue, setIssue] = useState<IssueFull | null>(null);
  const [updates, setUpdates] = useState<UpdateItem[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/issues/${id}`);
    const data = await res.json();
    if (res.ok) {
      setIssue(data.issue);
      setUpdates(data.updates);
    } else {
      setError(data.error ?? 'Could not load this ticket.');
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
    if (user.role === 'admin') {
      fetch('/api/technicians')
        .then((r) => r.json())
        .then((d) => setTechnicians(d.technicians ?? []));
    }
  }, [load, user.role]);

  async function patch(body: Record<string, unknown>) {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/issues/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? 'Something went wrong.');
      return;
    }
    setNote('');
    load();
  }

  if (loading) return <div className="px-10 py-10 text-sm text-ink/40">Loading ticket…</div>;
  if (error && !issue) return <div className="px-10 py-10 text-sm text-status-urgent">{error}</div>;
  if (!issue) return null;

  const isOwnerTech = user.role === 'technician' && issue.technician_id === user.id;
  const isStudent = user.role === 'student';
  const technicianOptions = user.role === 'admin'
    ? technicians
    : issue.technician_id
      ? [{ id: issue.technician_id, name: issue.technician_name ?? 'Assigned technician', specialty: null, active_count: 0 }]
      : [];

  return (
    <div className="px-10 py-8 max-w-3xl">
      <Link href="/" className="text-xs text-ink/40 hover:text-ink/70 font-mono">
        ← back
      </Link>

      <div className="ticket relative shadow-ticket rounded-card pl-8 pr-6 py-7 mt-4">
        <span className="ticket-notch" style={{ top: '-1px' }} />
        <span className="ticket-notch" style={{ bottom: '-1px' }} />

        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <div className="font-mono text-xs text-ink/50 tracking-wide mb-1">{issue.ticket_no}</div>
            <h1 className="font-display text-2xl font-semibold">{issue.title}</h1>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <StatusBadge status={issue.status} />
            <PriorityTag priority={issue.priority} />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-5 pb-5 border-b border-line">
          <div>
            <div className="text-ink/40 uppercase tracking-wide mb-0.5">Category</div>
            <div className="font-medium">{issue.category}</div>
          </div>
          <div>
            <div className="text-ink/40 uppercase tracking-wide mb-0.5">Hostel</div>
            <div className="font-medium">{issue.hostel}</div>
          </div>
          <div>
            <div className="text-ink/40 uppercase tracking-wide mb-0.5">Room</div>
            <div className="font-medium">{issue.room}</div>
          </div>
          <div>
            <div className="text-ink/40 uppercase tracking-wide mb-0.5">Reported by</div>
            <div className="font-medium">{issue.student_name ?? '—'}</div>
          </div>
          <div>
            <div className="text-ink/40 uppercase tracking-wide mb-0.5">Technician</div>
            <div className="font-medium">{issue.technician_name ?? 'Unassigned'}</div>
          </div>
        </div>

        <p className="text-sm text-ink/80 leading-relaxed mb-5">{issue.description}</p>

        {issue.image_data && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={issue.image_data}
            alt="Reported issue evidence"
            className="max-h-80 rounded-sm border border-line mb-5 object-cover"
          />
        )}

        {error && (
          <div className="mb-4 text-sm text-status-urgent border border-status-urgent/30 bg-status-urgent/5 px-3 py-2 rounded-sm">
            {error}
          </div>
        )}

        {(user.role === 'admin' || isOwnerTech || user.role === 'student') && (
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            {(user.role === 'admin' || isOwnerTech) && (
              <label className="block">
                <span className="text-xs font-medium text-ink/60">Assign technician</span>
                <select
                  disabled={busy}
                  value={issue.technician_id ?? ''}
                  onChange={(e) => user.role === 'admin' && e.target.value && patch({ technicianId: e.target.value })}
                  className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                >
                  <option value="" disabled>
                    {issue.technician_id ? issue.technician_name ?? 'Assigned technician' : 'Select technician…'}
                  </option>
                  {technicianOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} {t.specialty ? `— ${t.specialty}` : ''}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label className="block">
              <span className="text-xs font-medium text-ink/60">Priority</span>
              <select
                disabled={busy || isStudent}
                value={issue.priority}
                onChange={(e) => patch({ priority: e.target.value })}
                className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
              >
                {['low', 'normal', 'high', 'urgent'].map((p) => (
                  <option key={p} value={p}>
                    {p[0].toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block sm:col-span-2">
              <span className="text-xs font-medium text-ink/60">Status</span>
              <select
                disabled={busy || isStudent}
                value={issue.status}
                onChange={(e) => patch({ status: e.target.value })}
                className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
              >
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {isOwnerTech && issue.status !== 'resolved' && (
          <div className="flex flex-wrap gap-2 mb-4">
            {issue.status === 'assigned' && (
              <button
                disabled={busy}
                onClick={() => patch({ status: 'in_progress' })}
                className="bg-steel text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-steel-dark transition-colors disabled:opacity-50"
              >
                Start work
              </button>
            )}
            <button
              disabled={busy}
              onClick={() => patch({ status: 'resolved' })}
              className="bg-ink text-paper text-sm font-medium px-4 py-2 rounded-sm hover:bg-steel-dark transition-colors disabled:opacity-50"
            >
              Mark resolved
            </button>
          </div>
        )}

        {(user.role === 'admin' || isOwnerTech || user.role === 'student') && (
          <div className="flex gap-2">
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note for this ticket…"
              className="flex-1 border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
            />
            <button
              disabled={busy || !note.trim()}
              onClick={() => patch({ message: note })}
              className="border border-line px-4 py-2 rounded-sm text-sm font-medium hover:border-steel transition-colors disabled:opacity-40"
            >
              Add progress note
            </button>
          </div>
        )}
      </div>

      <div className="mt-8">
        <div className="font-mono text-[11px] tracking-[0.2em] text-ink/40 uppercase mb-3">Activity</div>
        <ol className="space-y-3">
          {updates.map((u) => (
            <li key={u.id} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-steel mt-1.5 shrink-0" />
              <div>
                <p className="text-sm text-ink/80">{u.message}</p>
                <p className="text-xs text-ink/40 mt-0.5">
                  {u.actor_name} · {new Date(u.created_at.replace(' ', 'T') + 'Z').toLocaleString()}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
