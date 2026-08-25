import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db, UserRow } from './db';

const SECRET = process.env.SESSION_SECRET || 'hostel-maintenance-dev-secret-change-me';
const COOKIE_NAME = 'hostel_session';

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
  return jwt.sign(user, SECRET, { expiresIn: '7d' });
}

export function setSessionCookie(user: SessionUser) {
  const token = signSession(user);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export function getCurrentUser(): SessionUser | null {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET) as SessionUser;
    const fresh = getUserById(decoded.id);
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

export function requireUser(): SessionUser {
  const user = getCurrentUser();
  if (!user) throw new Error('UNAUTHENTICATED');
  return user;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE email = ?').get(email) as unknown as UserRow | undefined;
}

export function getUserById(id: string): UserRow | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as unknown as UserRow | undefined;
}

export function getActiveTechnicians(): UserRow[] {
  return db
    .prepare('SELECT * FROM users WHERE role = ? AND is_active = 1 ORDER BY name ASC')
    .all('technician') as unknown as UserRow[];
}
