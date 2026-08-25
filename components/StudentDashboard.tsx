'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import IssueTicket, { IssueListItem } from './IssueTicket';
import MetricCard from './MetricCard';
import { useToast } from './ToastProvider';
import { CATEGORIES } from '@/lib/constants';

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'reported', label: 'Reported' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In progress' },
  { key: 'resolved', label: 'Resolved' },
];

export default function StudentDashboard({ user }: { user: { name: string; room?: string | null } }) {
  const searchParams = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const { addToast } = useToast();
  const [issues, setIssues] = useState<IssueListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);

  async function load() {
    setLoading(true);
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    const res = await fetch(`/api/issues${query}`);
    const data = await res.json();
    setIssues(data.issues ?? []);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [search]);

  const filtered = tab === 'all' ? issues : issues.filter((i) => i.status === tab);
  const openCount = issues.filter((i) => i.status !== 'resolved').length;

  return (
    <div className="px-10 py-8 max-w-4xl">
      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.9fr] items-start mb-8">
        <div>
          <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase mb-1">
            Room {user.room ?? '—'}
          </div>
          <h1 className="font-display text-3xl font-semibold">Welcome, {user.name.split(' ')[0]}</h1>
          <p className="text-ink/50 text-sm mt-1">
            {openCount === 0 ? 'No open tickets right now.' : `${openCount} open ticket${openCount === 1 ? '' : 's'}.`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-3xl bg-ink px-5 py-3 text-sm font-semibold text-paper shadow-lg shadow-slate-950/10 transition hover:bg-steel-dark"
        >
          + Report an issue
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 mb-6">
        <MetricCard label="Open issues" value={openCount.toString()} detail="Not yet resolved." />
        <MetricCard
          label="Search"
          value={search ? 'Active' : 'Idle'}
          detail={search ? `Filtering by “${search}”` : 'Use the top search bar.'}
        />
        <MetricCard label="Categories" value="7" detail="Includes electrical, plumbing and more." />
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-line">
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
        <div className="text-sm text-ink/40 py-12 text-center">Loading tickets…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-line rounded-card">
          <p className="text-ink/50 text-sm">Nothing here yet.</p>
          <p className="text-ink/40 text-xs mt-1">
            {tab === 'all' ? 'Report your first maintenance issue to get started.' : 'Try a different tab.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((issue) => (
            <IssueTicket key={issue.id} issue={issue} />
          ))}
        </div>
      )}

      {showForm && (
        <NewIssueModal
          defaultRoom={user.room ?? ''}
          onClose={() => setShowForm(false)}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}
    </div>
  );
}

function NewIssueModal({
  defaultRoom,
  onClose,
  onCreated,
}: {
  defaultRoom: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [hostel, setHostel] = useState('Main');
  const [hostels, setHostels] = useState<{ id: string; name: string }[]>([]);
  const [hostelsLoading, setHostelsLoading] = useState(true);
  const [hostelsError, setHostelsError] = useState<string | null>(null);
  const [room, setRoom] = useState(defaultRoom);
  const [imageData, setImageData] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [duplicateNotice, setDuplicateNotice] = useState<any>(null);
  const { addToast } = useToast();

  useEffect(() => {
    async function loadHostels() {
      setHostelsLoading(true);
      setHostelsError(null);
      try {
        const res = await fetch('/api/hostels');
        if (!res.ok) throw new Error('Failed to load hostels.');
        const data = await res.json();
        const options = data.hostels ?? [];
        setHostels(options);
        if (options.length > 0) {
          setHostel(options[0].name);
        }
      } catch (err) {
        setHostelsError('Unable to load hostel list.');
      } finally {
        setHostelsLoading(false);
      }
    }

    loadHostels();
  }, []);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4_500_000) {
      setError('Please choose an image under 4.5MB.');
      return;
    }
    setError(null);
    setImageName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setImageData(dataUrl);
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const res = await fetch('/api/issues', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, category, hostel, room, imageData }),
    });
    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) {
      const message = data.error ?? 'Something went wrong.';
      setError(message);
      addToast(message, 'error');
      return;
    }
    if (data.duplicateWarning) {
      setDuplicateNotice(data.duplicateWarning);
      addToast('Reported successfully. Duplicate warning flagged.', 'info');
      setTimeout(onCreated, 1400);
    } else {
      addToast('Issue reported successfully.', 'success');
      onCreated();
    }
  }

  return (
    <div className="fixed inset-0 bg-ink/50 flex items-center justify-center px-4 z-50" onClick={onClose}>
      <div
        className="ticket relative w-full max-w-lg pl-8 pr-6 py-7 shadow-ticket rounded-card max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="ticket-notch" style={{ top: '-1px' }} />
        <span className="ticket-notch" style={{ bottom: '-1px' }} />
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="font-mono text-[11px] tracking-[0.2em] text-amber-dark uppercase mb-1">New work order</div>
            <h2 className="font-display text-xl font-semibold">Report an issue</h2>
          </div>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-xl leading-none">
            ×
          </button>
        </div>

        {duplicateNotice ? (
          <div className="text-sm border border-amber/40 bg-amber/10 text-amber-dark px-3 py-3 rounded-sm">
            <p className="font-medium mb-1">Heads up — this looks similar to existing reports.</p>
            <p className="text-xs opacity-80">
              We've filed your ticket and flagged it alongside {duplicateNotice.count} related report
              {duplicateNotice.count === 1 ? '' : 's'} so admins can spot hostel-wide problems faster.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="text-sm text-status-urgent border border-status-urgent/30 bg-status-urgent/5 px-3 py-2 rounded-sm">
                {error}
              </div>
            )}
            <label className="block">
              <span className="text-xs font-medium text-ink/60">Title</span>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                placeholder="e.g. Leaking sink pipe"
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-xs font-medium text-ink/60">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3">
                <label className="block">
                  <span className="text-xs font-medium text-ink/60">Hostel</span>
                  <select
                    value={hostel}
                    onChange={(e) => setHostel(e.target.value)}
                    className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                  >
                    {hostelsLoading ? (
                      <option>Loading hostels…</option>
                    ) : hostelsError ? (
                      <option>{hostelsError}</option>
                    ) : hostels.length > 0 ? (
                      hostels.map((h) => (
                        <option key={h.id} value={h.name}>
                          {h.name}
                        </option>
                      ))
                    ) : (
                      <option value="">No hostels available</option>
                    )}
                  </select>
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-ink/60">Room</span>
                  <input
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none"
                  />
                </label>
              </div>
            </div>
            <label className="block">
              <span className="text-xs font-medium text-ink/60">Description</span>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 w-full border border-line bg-white/60 rounded-sm px-3 py-2 text-sm focus:border-steel outline-none resize-none"
                placeholder="What's wrong, and since when?"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium text-ink/60">Photo evidence (optional)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                className="mt-1 w-full text-xs text-ink/60 file:mr-3 file:px-3 file:py-1.5 file:rounded-sm file:border-0 file:bg-ink file:text-paper file:text-xs file:font-medium"
              />
              {imageName && <p className="text-xs text-ink/40 mt-1">Attached: {imageName}</p>}
              {imagePreview && (
                <img src={imagePreview} alt="Selected issue preview" className="mt-3 h-40 w-full rounded-lg object-cover border border-line" />
              )}
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-ink text-paper font-medium text-sm py-2.5 rounded-sm hover:bg-steel-dark transition-colors disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit ticket'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
