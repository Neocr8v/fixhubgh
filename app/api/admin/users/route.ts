import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { getCurrentUser, getUserByEmail, getUserById } from '@/lib/auth';

function requireAdmin(user: { role: string }) {
  if (!user || user.role !== 'admin') {
    throw new Error('ADMIN_REQUIRED');
  }
}

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    requireAdmin(user);
  } catch {
    return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
  }

  const users = db
    .prepare('SELECT id, name, email, role, hostel, room, specialty, avatar_url, is_active, created_at FROM users ORDER BY role DESC, name ASC')
    .all();
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    requireAdmin(user);
  } catch {
    return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.toLowerCase()?.trim();
  const role = body?.role;
  const hostel = body?.hostel?.trim() || null;
  const room = body?.room?.trim() || null;
  const specialty = body?.specialty?.trim() || null;
  const password = body?.password;

  if (!name || !email || !role || !password) {
    return NextResponse.json({ error: 'Name, email, role and password are required.' }, { status: 400 });
  }
  if (!['student', 'technician', 'admin'].includes(role)) {
    return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  }
  if (getUserByEmail(email)) {
    return NextResponse.json({ error: 'A user with that email already exists.' }, { status: 409 });
  }
  if (role !== 'student' && !specialty && role === 'technician') {
    return NextResponse.json({ error: 'Technicians should have a specialty.' }, { status: 400 });
  }
  if (role === 'student' && !hostel) {
    return NextResponse.json({ error: 'Students must have a hostel assigned.' }, { status: 400 });
  }

  const id = `u_${nanoid(10)}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  db.prepare(
    `INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`
  ).run(id, name, email, passwordHash, role, room, hostel, specialty);

  return NextResponse.json({ user: { id, name, email, role, room, specialty, is_active: 1 } });
}

export async function PATCH(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  try {
    requireAdmin(user);
  } catch {
    return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const id = body?.id;
  const action = body?.action;
  if (!id || !action) {
    return NextResponse.json({ error: 'User ID and action are required.' }, { status: 400 });
  }

  const target = getUserById(id);
  if (!target) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }
  if (target.role === 'admin' && action === 'deactivate') {
    return NextResponse.json({ error: 'Cannot deactivate another admin.' }, { status: 403 });
  }

  if (action === 'toggle_active') {
    const newStatus = target.is_active === 1 ? 0 : 1;
    db.prepare('UPDATE users SET is_active = ? WHERE id = ?').run(newStatus, id);
    return NextResponse.json({ ok: true, id, is_active: newStatus });
  }

  if (action === 'reset_password') {
    const tempPassword = body?.password?.trim();
    if (!tempPassword || tempPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    const passwordHash = bcrypt.hashSync(tempPassword, 10);
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, id);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
}
