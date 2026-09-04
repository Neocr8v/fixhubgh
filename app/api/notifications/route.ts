import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const issues = (await db.prepare(
    `SELECT u.id, i.ticket_no, i.title, i.room, u.message, u.created_at
     FROM updates u
     JOIN issues i ON i.id = u.issue_id
     WHERE ${user.role === 'admin' ? 'TRUE' : user.role === 'student' ? 'i.student_id = ?' : 'i.technician_id = ?'}
     ORDER BY u.created_at DESC LIMIT 20`
  ).all(...(user.role === 'admin' ? [] : [user.id]))) as {
    id: string;
    ticket_no: string;
    title: string;
    room: string;
    message: string;
    created_at: string;
  }[];

  return NextResponse.json({ total: issues.length, newIssues: issues });
}