import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { db, IssueRow } from '@/lib/db';
import { getActiveAdmins, getCurrentUser, getUserById } from '@/lib/auth';
import { detectPriority, nextTicketNumber, findPotentialDuplicates, CATEGORIES } from '@/lib/issues';
import { sendEmail } from '@/lib/mail';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const search = searchParams.get('search');

  let query = 'SELECT * FROM issues WHERE 1=1';
  const params: (string | number)[] = [];

  if (user.role === 'student') {
    query += ' AND student_id = ?';
    params.push(user.id);
  } else if (user.role === 'technician') {
    query += ' AND technician_id = ?';
    params.push(user.id);
  }
  // admin sees all

  if (status) {
    query += ' AND status = ?';
    params.push(status);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    const pattern = `%${search.toLowerCase()}%`;
    query +=
      ' AND (LOWER(ticket_no) LIKE ? OR LOWER(title) LIKE ? OR LOWER(room) LIKE ? OR LOWER(hostel) LIKE ? OR LOWER(category) LIKE ?)';
    params.push(pattern, pattern, pattern, pattern, pattern);
  }

  query += ' ORDER BY created_at DESC';

  const issues = (await db.prepare(query).all(...params)) as unknown as IssueRow[];

  // attach student / technician names for display
  const enriched = await Promise.all(
    issues.map(async (issue) => {
      const student = (await db.prepare('SELECT name, room FROM users WHERE id = ?').get(issue.student_id)) as
        | { name: string; room: string }
        | undefined;
      const technician = issue.technician_id
        ? ((await db.prepare('SELECT name, specialty FROM users WHERE id = ?').get(issue.technician_id)) as
            | { name: string; specialty: string }
            | undefined)
        : null;
      return { ...issue, student_name: student?.name ?? 'Unknown', technician_name: technician?.name ?? null };
    })
  );

  return NextResponse.json({ issues: enriched });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (user.role !== 'student') {
    return NextResponse.json({ error: 'Only students can report issues.' }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const title = body?.title?.trim();
  const description = body?.description?.trim();
  const category = body?.category;
  const hostel = body?.hostel?.trim() || 'Main';
  const room = body?.room?.trim() || user.room;
  const imageData: string | null = body?.imageData || null;

  if (!title || !description || !category || !room || !hostel) {
    return NextResponse.json({ error: 'Title, description, category, hostel and room are all required.' }, { status: 400 });
  }
  if (!CATEGORIES.includes(category)) {
    return NextResponse.json({ error: 'Unrecognised category.' }, { status: 400 });
  }
  if (imageData && imageData.length > 6_000_000) {
    return NextResponse.json({ error: 'Image is too large. Please use a smaller photo.' }, { status: 400 });
  }

  const duplicates = await findPotentialDuplicates(room, category, title);
  const priority = detectPriority(title, description);
  const id = `i_${nanoid(10)}`;
  const ticketNo = await nextTicketNumber();

  await db
    .prepare(
      `INSERT INTO issues (id, ticket_no, title, description, category, priority, status, room, hostel, image_data, student_id, duplicate_of)
       VALUES (?, ?, ?, ?, ?, ?, 'reported', ?, ?, ?, ?, ?)`
    )
    .run(id, ticketNo, title, description, category, priority, room, hostel, imageData, user.id, duplicates[0]?.id ?? null);

  await db
    .prepare(`INSERT INTO updates (id, issue_id, actor_id, message) VALUES (?, ?, ?, ?)`)
    .run(`up_${nanoid(10)}`, id, user.id, 'Issue reported by student.');

  const created = (await db.prepare('SELECT * FROM issues WHERE id = ?').get(id)) as unknown as IssueRow;

  if (user.email) {
    const subject = `FixHub: Issue reported ${ticketNo}`;
    const text = `Hi ${user.name},\n\nYour issue has been reported successfully with ticket number ${ticketNo}.\n\nTitle: ${title}\nCategory: ${category}\nRoom: ${room} (${hostel})\n\nYou can log in to the portal to track progress.\n\nThank you,\nFixHub Team`;
    const html = `<p>Hi ${user.name},</p><p>Your issue has been reported successfully with ticket number <strong>${ticketNo}</strong>.</p><p><strong>Title:</strong> ${title}<br/><strong>Category:</strong> ${category}<br/><strong>Room:</strong> ${room} (${hostel})</p><p>You can log in to the portal to track progress.</p><p>Thank you,<br/>FixHub Team</p>`;
    sendEmail({ to: user.email, subject, text, html }).catch((error) => {
      console.error('Failed to send issue confirmation email:', error);
    });
  }

  const admins = await getActiveAdmins();
  for (const admin of admins) {
    if (!admin.email) continue;
    void sendEmail({
      to: admin.email,
      subject: `FixHub: New issue reported ${ticketNo}`,
      text: `Hello ${admin.name},\n\nA new maintenance issue was reported by ${user.name}.\n\nTicket: ${ticketNo}\nTitle: ${title}\nCategory: ${category}\nLocation: ${room} (${hostel})\n\nReview it in the FixHub admin dashboard.\n\nFixHub Team`,
      html: `<p>Hello ${admin.name},</p><p>A new maintenance issue was reported by ${user.name}.</p><p><strong>Ticket:</strong> ${ticketNo}<br/><strong>Title:</strong> ${title}<br/><strong>Category:</strong> ${category}<br/><strong>Location:</strong> ${room} (${hostel})</p><p>Review it in the FixHub admin dashboard.</p><p>FixHub Team</p>`,
    }).catch((error) => console.error('Failed to send new issue email to admin:', error));
  }

  return NextResponse.json({
    issue: created,
    duplicateWarning:
      duplicates.length > 0
        ? {
            count: duplicates.length,
            sample: duplicates.slice(0, 3).map((d) => ({ ticket_no: d.ticket_no, title: d.title, room: d.room })),
          }
        : null,
  });
}