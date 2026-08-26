import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { getUserByEmail, setSessionCookie, toSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.toLowerCase()?.trim();
  const password = body?.password;
  const room = body?.room?.trim();
  const hostel = body?.hostel?.trim();

  if (!name || !email || !password || !room || !hostel) {
    return NextResponse.json({ error: 'Name, email, hostel, room and password are all required.' }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  if (await getUserByEmail(email)) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
  }

  const id = `u_${nanoid(10)}`;
  const hash = bcrypt.hashSync(password, 10);
  await db
    .prepare(
      `INSERT INTO users (id, name, email, password_hash, role, room, hostel, specialty, is_active) VALUES (?, ?, ?, ?, 'student', ?, ?, NULL, 1)`
    )
    .run(id, name, email, hash, room, hostel);

  const sessionUser = toSessionUser({
    id,
    name,
    email,
    password_hash: hash,
    role: 'student',
    room,
    hostel,
    specialty: null,
    avatar_url: null,
    phone: null,
    bio: null,
    is_active: 1,
    created_at: new Date().toISOString(),
  });
  setSessionCookie(sessionUser);
  return NextResponse.json({ user: sessionUser });
}
