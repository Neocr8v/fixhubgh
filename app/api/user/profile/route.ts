import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getCurrentUser, getUserByEmail, getUserById, toSessionUser } from '@/lib/auth';
import { sendEmail } from '@/lib/mail';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const profile = await getUserById(user.id);
  if (!profile) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  return NextResponse.json({ user: toSessionUser(profile) });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = body?.name?.trim();
  const email = body?.email?.toLowerCase()?.trim();
  const room = body?.room?.trim() || null;
  const hostel = body?.hostel?.trim() || null;
  const specialty = body?.specialty?.trim() || null;
  const avatarUrl = body?.avatar_url || null;
  const phone = body?.phone?.trim() || null;
  const bio = body?.bio?.trim() || null;
  const password = body?.password;

  if (!name || !email) {
    return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
  }
  if (password && password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 });
  }

  const existing = await getUserByEmail(email);
  if (existing && existing.id !== user.id) {
    return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
  }

  const passwordHash = password ? bcrypt.hashSync(password, 10) : null;
  if (passwordHash) {
    await db.prepare(
      `UPDATE users SET name = ?, email = ?, room = ?, hostel = ?, specialty = ?, avatar_url = ?, phone = ?, bio = ?, password_hash = ? WHERE id = ?`
    ).run(name, email, room, hostel, specialty, avatarUrl, phone, bio, passwordHash, user.id);
  } else {
    await db.prepare(
      `UPDATE users SET name = ?, email = ?, room = ?, hostel = ?, specialty = ?, avatar_url = ?, phone = ?, bio = ? WHERE id = ?`
    ).run(name, email, room, hostel, specialty, avatarUrl, phone, bio, user.id);
  }

  const updated = await getUserById(user.id);
  if (!updated) return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  if (passwordHash && updated.email) {
    void sendEmail({
      to: updated.email,
      subject: 'FixHub: Your password was changed',
      text: `Hello ${updated.name},\n\nYour FixHub password was changed successfully. If you did not make this change, contact an administrator immediately.\n\nFixHub Security`,
      html: `<p>Hello ${updated.name},</p><p>Your FixHub password was changed successfully.</p><p>If you did not make this change, contact an administrator immediately.</p><p>FixHub Security</p>`,
    }).catch((error) => console.error('Failed to send password change email:', error));
  }
  return NextResponse.json({ user: toSessionUser(updated) });
}
