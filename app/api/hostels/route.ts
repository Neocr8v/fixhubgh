import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const hostels = await db.prepare('SELECT id, name FROM hostels ORDER BY name ASC').all();
    return NextResponse.json({ hostels });
  } catch (error) {
    console.error('Failed to load hostels:', error);
    return NextResponse.json({ error: 'Unable to load hostel list.' }, { status: 500 });
  }
}
