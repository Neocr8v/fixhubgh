import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hostels = db.prepare('SELECT id, name FROM hostels ORDER BY name ASC').all();
  return NextResponse.json({ hostels });
}
