import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const technicians = db
    .prepare(
      `SELECT t.id, t.name, t.specialty,
        (SELECT COUNT(*) FROM issues i WHERE i.technician_id = t.id AND i.status != 'resolved') as active_count
       FROM users t WHERE t.role = 'technician' AND t.is_active = 1 ORDER BY t.name ASC`
    )
    .all();

  return NextResponse.json({ technicians });
}
