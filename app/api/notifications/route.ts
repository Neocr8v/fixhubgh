import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  let query = 'SELECT id, ticket_no, title, room, created_at FROM issues WHERE status != ?';
  const params: Array<string> = ['resolved'];

  if (user.role === 'student') {
    query += ' AND student_id = ?';
    params.push(user.id);
  } else if (user.role === 'technician') {
    query += ' AND technician_id = ?';
    params.push(user.id);
  }

  query += ' ORDER BY created_at DESC LIMIT 5';

  let issues = [] as { id: string; ticket_no: string; title: string; room: string; created_at: string }[];

  if (user.role === 'technician') {
    issues = db
      .prepare(
        `SELECT u.id, i.ticket_no, i.title, i.room, u.created_at
         FROM updates u
         JOIN issues i ON i.id = u.issue_id
         WHERE i.technician_id = ? AND u.message LIKE 'Assigned to %'
         ORDER BY u.created_at DESC LIMIT 5`
      )
      .all(user.id) as typeof issues;
  } else if (user.role === 'student') {
    issues = db
      .prepare(
        `SELECT u.id, i.ticket_no, i.title, i.room, u.created_at
         FROM updates u
         JOIN issues i ON i.id = u.issue_id
         WHERE i.student_id = ? AND u.actor_id IN (
           SELECT id FROM users WHERE role = 'admin'
         ) AND u.message = 'Status updated to "resolved".'
         ORDER BY u.created_at DESC LIMIT 5`
      )
      .all(user.id) as typeof issues;
  } else {
    issues = db
      .prepare(
        `SELECT id, ticket_no, title, room, created_at FROM issues WHERE status = 'review' ORDER BY created_at DESC LIMIT 5`
      )
      .all() as typeof issues;
  }

  return NextResponse.json({ total: issues.length, newIssues: issues });
}
