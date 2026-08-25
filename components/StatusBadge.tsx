const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  reported: { bg: 'bg-status-reported/15', text: 'text-amber-dark', label: 'Reported' },
  assigned: { bg: 'bg-status-assigned/15', text: 'text-steel-dark', label: 'Assigned' },
  in_progress: { bg: 'bg-status-progress/15', text: 'text-[#5B4FC0]', label: 'In progress' },
  review: { bg: 'bg-status-review/15', text: 'text-slate-700', label: 'Awaiting approval' },
  resolved: { bg: 'bg-status-resolved/15', text: 'text-[#356B4F]', label: 'Resolved' },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.reported;
  return (
    <span
      className={`stamp inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono font-medium uppercase rounded-sm border border-current/20 ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

const PRIORITY_STYLES: Record<string, { text: string; dot: string; label: string }> = {
  urgent: { text: 'text-status-urgent', dot: 'bg-status-urgent', label: 'Urgent' },
  high: { text: 'text-amber-dark', dot: 'bg-amber-dark', label: 'High' },
  normal: { text: 'text-ink/60', dot: 'bg-ink/40', label: 'Normal' },
  low: { text: 'text-ink/40', dot: 'bg-ink/25', label: 'Low' },
};

export function PriorityTag({ priority }: { priority: string }) {
  const p = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.normal;
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${p.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${p.dot}`} />
      {p.label}
    </span>
  );
}
