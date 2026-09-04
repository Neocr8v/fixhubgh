'use client';

import Link from 'next/link';
import { StatusBadge, PriorityTag } from './StatusBadge';
import { timeAgo } from '@/lib/dates';

export interface IssueListItem {
  id: string;
  ticket_no: string;
  title: string;
  category: string;
  priority: string;
  status: string;
  room: string;
  hostel: string;
  student_name?: string;
  technician_name?: string | null;
  created_at: string;
  duplicate_of?: string | null;
}

export default function IssueTicket({ issue }: { issue: IssueListItem }) {
  return (
    <Link
      href={`/dashboard/issue/${issue.id}`}
      className="ticket group relative flex items-stretch gap-4 pl-6 pr-4 py-4 shadow-ticket hover:shadow-lg transition-shadow rounded-card overflow-visible"
    >
      <span className="ticket-notch" style={{ top: '-1px' }} />
      <span className="ticket-notch" style={{ bottom: '-8px' }} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-mono text-xs text-ink/50 tracking-wide">{issue.ticket_no}</span>
          {issue.duplicate_of && (
            <span className="text-[10px] font-mono uppercase tracking-wide text-status-urgent/80 border border-status-urgent/30 px-1.5 rounded-sm">
              possible duplicate
            </span>
          )}
        </div>
        <h3 className="font-display font-semibold text-ink group-hover:text-steel-dark transition-colors truncate">
          {issue.title}
        </h3>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-ink/60">
          <span>{issue.category}</span>
          <span className="text-ink/30">•</span>
          <span>{issue.hostel} hostel</span>
          <span className="text-ink/30">•</span>
          <span>Room {issue.room}</span>
          {issue.technician_name && (
            <>
              <span className="text-ink/30">•</span>
              <span>Tech: {issue.technician_name}</span>
            </>
          )}
          <span className="text-ink/30">•</span>
          <span>{timeAgo(issue.created_at)}</span>
        </div>
      </div>
      <div className="flex flex-col items-end justify-between gap-2 shrink-0">
        <StatusBadge status={issue.status} />
        <PriorityTag priority={issue.priority} />
      </div>
    </Link>
  );
}
