import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const fresh = db.prepare('SELECT id, name, email, role, room, hostel, specialty, avatar_url, phone, bio, is_active, created_at FROM users WHERE id = ?').get(user.id);
  return NextResponse.json({ user: fresh });
}

export async function PATCH(req: NextRequest) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const name = body.name?.trim();
  const email = body.email?.toLowerCase()?.trim();
  const room = body.room?.trim() || null;
  const hostel = body.hostel?.trim() || null;
  const specialty = body.specialty?.trim() || null;
  const avatar_url = body.avatar_url?.trim() || null;
  const phone = body.phone?.trim() || null;
  const bio = body.bio?.trim() || null;
  const password = body.password?.trim();

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }

  const emailOwner = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (emailOwner && emailOwner.id !== user.id) {
    return NextResponse.json({ error: 'That email is already taken.' }, { status: 409 });
  }

  const updates: string[] = [];
  const params: any[] = [];

  updates.push('name = ?');
  params.push(name);
  updates.push('email = ?');
  params.push(email);
  updates.push('room = ?');
  params.push(room);
  updates.push('hostel = ?');
  params.push(hostel);
  updates.push('specialty = ?');
  params.push(specialty);
  updates.push('avatar_url = ?');
  params.push(avatar_url);
  updates.push('phone = ?');
  params.push(phone);
  updates.push('bio = ?');
  params.push(bio);

  if (password) {
    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
    }
    updates.push('password_hash = ?');
    params.push(bcrypt.hashSync(password, 10));
  }

  params.push(user.id);
  db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...params);

  const fresh = db.prepare('SELECT id, name, email, role, room, hostel, specialty, avatar_url, phone, bio, is_active, created_at FROM users WHERE id = ?').get(user.id);
  return NextResponse.json({ ok: true, user: fresh });
}
