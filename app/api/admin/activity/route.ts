import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });

  const activity = (await db
    .prepare(
      `SELECT u.id, u.issue_id, u.actor_id, u.message, u.created_at, i.ticket_no, actor.name AS actor_name
       FROM updates u
       LEFT JOIN issues i ON i.id = u.issue_id
       LEFT JOIN users actor ON actor.id = u.actor_id
       ORDER BY u.created_at DESC
       LIMIT 5`
    )
    .all()) as Array<{
      id: string;
      issue_id: string;
      actor_id: string | null;
      message: string;
      created_at: string;
      ticket_no: string | null;
      actor_name: string | null;
    }>;

  return NextResponse.json({ activity });
}