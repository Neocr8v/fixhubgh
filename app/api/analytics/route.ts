import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  const user = getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 });
  if (user.role !== 'admin') return NextResponse.json({ error: 'Admin access only.' }, { status: 403 });

  try {
    const url = new URL(req.url);
    const startDate = url.searchParams.get('start');
    const endDate = url.searchParams.get('end');

    const whereClauses: string[] = [];
    const params: Array<string> = [];

    if (startDate) {
      whereClauses.push(`date(created_at) >= date(?)`);
      params.push(startDate);
    }
    if (endDate) {
      whereClauses.push(`date(created_at) <= date(?)`);
      params.push(endDate);
    }

    const whereSql = whereClauses.length ? `WHERE ${whereClauses.join(' AND ')}` : '';
    const resolvedWhereSql = whereClauses.length ? `${whereSql} AND resolved_at IS NOT NULL` : 'WHERE resolved_at IS NOT NULL';

    const byCategory = db
      .prepare(`SELECT category, COUNT(*) as count FROM issues ${whereSql} GROUP BY category ORDER BY count DESC`)
      .all(...params);

    const byStatus = db.prepare(`SELECT status, COUNT(*) as count FROM issues ${whereSql} GROUP BY status`).all(...params);

    const byPriority = db.prepare(`SELECT priority, COUNT(*) as count FROM issues ${whereSql} GROUP BY priority`).all(...params);

    const totalsRow = db
      .prepare(
        `SELECT COUNT(*) as total,
          SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved,
          SUM(CASE WHEN duplicate_of IS NOT NULL THEN 1 ELSE 0 END) as duplicates
         FROM issues ${whereSql}`
      )
      .get(...params) as unknown as { total: number; resolved: number | null; duplicates: number | null };

    const totals = {
      total: totalsRow.total ?? 0,
      resolved: totalsRow.resolved ?? 0,
      duplicates: totalsRow.duplicates ?? 0,
    };

    const avgResolutionRow = db
      .prepare(
        `SELECT AVG(julianday(resolved_at) - julianday(created_at)) as avg_days
         FROM issues ${resolvedWhereSql}`
      )
      .get(...params) as unknown as { avg_days: number | null };

    const trend = db
      .prepare(
        `SELECT date(created_at) as day, COUNT(*) as count
         FROM issues
         ${whereSql}
         GROUP BY day ORDER BY day ASC`
      )
      .all(...params);

    const byRoom = db
      .prepare(`SELECT room, COUNT(*) as count FROM issues ${whereSql} GROUP BY room ORDER BY count DESC LIMIT 8`)
      .all(...params);

    const technicianDateClauses = whereClauses.map((clause) => clause.replace(/date\(created_at\)/g, 'date(i.created_at)'));
    const technicianWhere = `WHERE u.role = 'technician'${technicianDateClauses.length ? ` AND ${technicianDateClauses.join(' AND ')}` : ''}`;

    const technicianLoad = db
      .prepare(
        `SELECT u.name, COUNT(i.id) as active
         FROM users u
         LEFT JOIN issues i ON i.technician_id = u.id AND i.status != 'resolved'
         ${technicianWhere}
         GROUP BY u.id ORDER BY active DESC`
      )
      .all(...params);

    const format = url.searchParams.get('format');
    if (format === 'csv') {
      const rows: string[] = [];
      rows.push('section,name,value');
      rows.push(`totals,total,${totals.total}`);
      rows.push(`totals,resolved,${totals.resolved}`);
      rows.push(`totals,duplicates,${totals.duplicates}`);
      rows.push(`totals,avg_resolution_days,${avgResolutionRow.avg_days ?? ''}`);
      rows.push('');
      rows.push('category,group,count');
      byCategory.forEach((item: any) => rows.push(`category,${item.category},${item.count}`));
      rows.push('');
      rows.push('status,group,count');
      byStatus.forEach((item: any) => rows.push(`status,${item.status},${item.count}`));
      rows.push('');
      rows.push('priority,group,count');
      byPriority.forEach((item: any) => rows.push(`priority,${item.priority},${item.count}`));
      rows.push('');
      rows.push('trend,day,count');
      trend.forEach((item: any) => rows.push(`trend,${item.day},${item.count}`));
      rows.push('');
      rows.push('room,room,count');
      byRoom.forEach((item: any) => rows.push(`room,${item.room},${item.count}`));
      rows.push('');
      rows.push('technician,name,active');
      technicianLoad.forEach((item: any) => rows.push(`technician,${item.name},${item.active}`));

      const csv = rows.join('\n');
      return new Response(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="analytics-export.csv"',
        },
      });
    }

    return NextResponse.json({
      byCategory,
      byStatus,
      byPriority,
      totals,
      avgResolutionDays: avgResolutionRow.avg_days,
      trend,
      byRoom,
      technicianLoad,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown analytics error';
    return NextResponse.json({ error: `Analytics server error: ${message}` }, { status: 500 });
  }
}
