import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db, IssueRow, UpdateRow } from '@/lib/db';
import { getCurrentUser, getUserById } from '@/lib/auth';
import { STATUS_ORDER } from '@/lib/issues';
import { sendEmail } from '@/lib/mail';

function canView(user: { id: string; role: string }, issue: IssueRow) {
  if (user.role === 'admin') return true;
  if (user.role === 'student') return issue.student_id === user.id;
  if (user.role === 'technician') return issue.technician_id === user.id;
  return false;
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(params.id) as unknown as IssueRow | undefined;
  if (!issue) return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });
  if (!canView(user, issue)) return NextResponse.json({ error: 'Not authorized to view this issue.' }, { status: 403 });

  const updates = db
    .prepare('SELECT * FROM updates WHERE issue_id = ? ORDER BY created_at ASC')
    .all(issue.id) as unknown as UpdateRow[];

  const enrichedUpdates = updates.flatMap((u) => {
    const actor = u.actor_id ? getUserById(u.actor_id) : undefined;
    if (user.role === 'student' && actor?.role === 'admin') {
      return [];
    }
    return [{ ...u, actor_name: actor?.name ?? 'System' }];
  });

  const student = getUserById(issue.student_id);
  const technician = issue.technician_id ? getUserById(issue.technician_id) : undefined;

  return NextResponse.json({
    issue: { ...issue, student_name: student?.name, technician_name: technician?.name ?? null },
    updates: enrichedUpdates,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(params.id) as unknown as IssueRow | undefined;
  if (!issue) return NextResponse.json({ error: 'Issue not found.' }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const { technicianId, status, priority, message } = body as {
    technicianId?: string;
    status?: string;
    priority?: string;
    message?: string;
  };

  const messages: string[] = [];

  if (technicianId !== undefined) {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can assign technicians.' }, { status: 403 });
    }
    const tech = getUserById(technicianId);
    if (!tech || tech.role !== 'technician') {
      return NextResponse.json({ error: 'Invalid technician.' }, { status: 400 });
    }
    db.prepare('UPDATE issues SET technician_id = ?, status = CASE WHEN status = \'reported\' THEN \'assigned\' ELSE status END WHERE id = ?').run(
      technicianId,
      issue.id
    );
    messages.push(`Assigned to ${tech.name} (${tech.specialty ?? 'General'}).`);
  }

  if (priority !== undefined) {
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can change priority.' }, { status: 403 });
    }
    db.prepare('UPDATE issues SET priority = ? WHERE id = ?').run(priority, issue.id);
    messages.push(`Priority set to ${priority}.`);
  }

  if (status !== undefined) {
    if (!STATUS_ORDER.includes(status)) {
      return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
    }
    const isOwnerTech = user.role === 'technician' && issue.technician_id === user.id;
    if (user.role !== 'admin' && !isOwnerTech) {
      return NextResponse.json({ error: 'Not authorized to change status.' }, { status: 403 });
    }

    let resolvedAt: string | null = null;
    let statusToSave = status;
    if (user.role === 'technician' && status === 'resolved') {
      statusToSave = 'review';
    }
    if (statusToSave === 'resolved') {
      resolvedAt = new Date().toISOString();
    }

    db.prepare('UPDATE issues SET status = ?, resolved_at = ? WHERE id = ?').run(statusToSave, resolvedAt, issue.id);

    if (user.role === 'technician' && status === 'resolved') {
      messages.push('Submitted work for admin approval.');
    } else {
      messages.push(`Status updated to "${statusToSave.replace('_', ' ')}".`);
    }
  }

  if (message && message.trim()) {
    messages.push(message.trim());
  }

  if (messages.length === 0) {
    return NextResponse.json({ error: 'No changes supplied.' }, { status: 400 });
  }

  db.prepare('UPDATE issues SET updated_at = datetime(\'now\') WHERE id = ?').run(issue.id);

  const insertUpdate = db.prepare(`INSERT INTO updates (id, issue_id, actor_id, message) VALUES (?, ?, ?, ?)`);
  for (const m of messages) {
    insertUpdate.run(`up_${nanoid(10)}`, issue.id, user.id, m);
  }

  const updated = db.prepare('SELECT * FROM issues WHERE id = ?').get(issue.id) as unknown as IssueRow;

  const student = getUserById(updated.student_id);
  const technician = updated.technician_id ? getUserById(updated.technician_id) : undefined;
  const subject = `HostelCare: Update for ${updated.ticket_no}`;
  const changeSummary = messages.join(' ');
  const text = `Hello ${student?.name ?? 'Student'},\n\nThere is an update on your issue ${updated.ticket_no}:\n\n${changeSummary}\n\nTitle: ${updated.title}\nStatus: ${updated.status.replace('_', ' ')}\nRoom: ${updated.room} (${updated.hostel})\n\nVisit the portal to see the latest details.\n\nBest,\nHostelCare Team`;
  const html = `<p>Hello ${student?.name ?? 'Student'},</p><p>There is an update on your issue <strong>${updated.ticket_no}</strong>:</p><p>${changeSummary}</p><p><strong>Title:</strong> ${updated.title}<br/><strong>Status:</strong> ${updated.status.replace('_', ' ')}<br/><strong>Room:</strong> ${updated.room} (${updated.hostel})</p><p>Visit the portal to see the latest details.</p><p>Best,<br/>HostelCare Team</p>`;

  if (student?.email) {
    void sendEmail({ to: student.email, subject, text, html }).catch((error) => {
      console.error('Failed to send update email to student:', error);
    });
  }

  if (technician?.email && (technicianId !== undefined || status !== undefined)) {
    const techText = `Hello ${technician.name},\n\nA ticket has been updated that you are assigned to or need to know about:\n\n${changeSummary}\n\nTicket: ${updated.ticket_no}\nTitle: ${updated.title}\nStatus: ${updated.status.replace('_', ' ')}\nRoom: ${updated.room} (${updated.hostel})\n\nView the ticket for more details.\n\nBest,\nHostelCare Team`;
    const techHtml = `<p>Hello ${technician.name},</p><p>A ticket has been updated that you are assigned to or need to know about:</p><p>${changeSummary}</p><p><strong>Ticket:</strong> ${updated.ticket_no}<br/><strong>Title:</strong> ${updated.title}<br/><strong>Status:</strong> ${updated.status.replace('_', ' ')}<br/><strong>Room:</strong> ${updated.room} (${updated.hostel})</p><p>View the ticket for more details.</p><p>Best,<br/>HostelCare Team</p>`;
    void sendEmail({ to: technician.email, subject, text: techText, html: techHtml }).catch((error) => {
      console.error('Failed to send update email to technician:', error);
    });
  }

  return NextResponse.json({ issue: updated });
}
