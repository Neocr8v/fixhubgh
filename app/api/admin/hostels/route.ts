import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { nanoid } from 'nanoid';

function requireAdmin(user: { role: string }) {
  if (!user || user.role !== 'admin') {
    throw new Error('ADMIN_REQUIRED');
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    requireAdmin(user);
  } catch {
    return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
  }

  const hostels = await db.prepare('SELECT id, name FROM hostels ORDER BY name ASC').all();
  return NextResponse.json({ hostels });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    requireAdmin(user);
  } catch {
    return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  if (!name) {
    return NextResponse.json({ error: 'Name is required.' }, { status: 400 });
  }

  const existing = await db.prepare('SELECT id FROM hostels WHERE name = ?').get(name);
  if (existing) {
    return NextResponse.json({ error: 'That hostel already exists.' }, { status: 409 });
  }

  const id = `h_${nanoid(10)}`;
  await db.prepare('INSERT INTO hostels (id, name) VALUES (?, ?)').run(id, name);
  return NextResponse.json({ hostel: { id, name } });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    requireAdmin(user);
  } catch {
    return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id;
  if (!id) {
    return NextResponse.json({ error: 'Hostel ID is required.' }, { status: 400 });
  }

  const result = await db.prepare('DELETE FROM hostels WHERE id = ?').run(id);
  if (result.changes === 0) {
    return NextResponse.json({ error: 'Hostel not found.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
