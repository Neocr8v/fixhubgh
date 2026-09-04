import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db, UserRow } from './db';

const SECRET = process.env.SESSION_SECRET;
const COOKIE_NAME = 'hostel_session';

function getSecret() {
  if (!SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET must be configured in production.');
  }
  return SECRET || 'hostel-maintenance-dev-secret-change-me';
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin' | 'technician';
  room: string | null;
  hostel: string | null;
  specialty: string | null;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  is_active: number;
}

export function signSession(user: SessionUser) {
  return jwt.sign(user, getSecret(), { expiresIn: '7d' });
}

export function setSessionCookie(user: SessionUser) {
  const token = signSession(user);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, getSecret()) as SessionUser;
    const fresh = await getUserById(decoded.id);
    if (!fresh || fresh.is_active !== 1) return null;
    return toSessionUser(fresh);
  } catch {
    return null;
  }
}

export function toSessionUser(row: UserRow): SessionUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    room: row.room,
    hostel: row.hostel,
    specialty: row.specialty,
    avatar_url: row.avatar_url,
    phone: row.phone,
    bio: row.bio,
    is_active: row.is_active,
  };
}

export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export async function getUserByEmail(email: string): Promise<UserRow | undefined> {
  return (await db.prepare('SELECT * FROM users WHERE email = ?').get(email)) as unknown as UserRow | undefined;
}

export async function getUserById(id: string): Promise<UserRow | undefined> {
  return (await db.prepare('SELECT * FROM users WHERE id = ?').get(id)) as unknown as UserRow | undefined;
}

export async function getActiveTechnicians(): Promise<UserRow[]> {
  return (await db
    .prepare('SELECT * FROM users WHERE role = ? AND is_active = 1 ORDER BY name ASC')
    .all('technician')) as unknown as UserRow[];
}
