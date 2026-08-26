import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail, setSessionCookie, toSessionUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const email = body?.email?.toLowerCase()?.trim();
  const password = body?.password;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }
  const user = await getUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return NextResponse.json({ error: 'Incorrect email or password.' }, { status: 401 });
  }
  if (user.is_active !== 1) {
    return NextResponse.json({ error: 'This account is deactivated. Contact an administrator.' }, { status: 403 });
  }
  const sessionUser = toSessionUser(user);
  setSessionCookie(sessionUser);
  return NextResponse.json({ user: sessionUser });
}
