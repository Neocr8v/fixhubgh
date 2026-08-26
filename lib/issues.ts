import { db, IssueRow } from './db';

const URGENT_KEYWORDS = [
  'fire', 'smoke', 'gas leak', 'gas smell', 'flood', 'flooding', 'sparking',
  'spark', 'electric shock', 'shock', 'exposed wire', 'no water', 'ceiling collapse',
  'burst pipe', 'burning smell', 'carbon monoxide', 'no power', 'security',
  'break in', 'broken lock', "can't lock",
];

const HIGH_KEYWORDS = [
  'leak', 'leaking', 'not working', 'broken', 'no internet', 'no heat', 'no hot water',
  'mold', 'mould', 'infestation', 'pest', 'cockroach', 'bed bug',
];

export function detectPriority(title: string, description: string): 'urgent' | 'high' | 'normal' | 'low' {
  const text = `${title} ${description}`.toLowerCase();
  if (URGENT_KEYWORDS.some((k) => text.includes(k))) return 'urgent';
  if (HIGH_KEYWORDS.some((k) => text.includes(k))) return 'high';
  return 'normal';
}

export async function nextTicketNumber(): Promise<string> {
  const rows = (await db.prepare('SELECT ticket_no FROM issues').all()) as unknown as { ticket_no: string }[];
  let max = 0;
  for (const r of rows) {
    const match = r.ticket_no.match(/(\d+)$/);
    if (match) max = Math.max(max, parseInt(match[1], 10));
  }
  return `HM-${String(max + 1).padStart(4, '0')}`;
}

/**
 * Duplicate detection: flags other open issues in the same room + category
 * with meaningfully overlapping wording, signalling a hostel-wide problem
 * (e.g. many students reporting the same broken water main).
 */
export async function findPotentialDuplicates(
  room: string,
  category: string,
  title: string,
  excludeId?: string
): Promise<IssueRow[]> {
  const candidates = (await db
    .prepare(
      `SELECT * FROM issues WHERE category = ? AND status != 'resolved' AND id != COALESCE(?, '') ORDER BY created_at DESC LIMIT 25`
    )
    .all(category, excludeId ?? null)) as unknown as IssueRow[];

  const titleWords = new Set(
    title.toLowerCase().split(/\W+/).filter((w) => w.length > 3)
  );

  return candidates.filter((c) => {
    const sameRoom = c.room === room;
    const otherWords = new Set(c.title.toLowerCase().split(/\W+/).filter((w) => w.length > 3));
    let overlap = 0;
    otherWords.forEach((w) => {
      if (titleWords.has(w)) overlap++;
    });
    const wordy = overlap >= 1 && (overlap / Math.max(titleWords.size, 1)) >= 0.34;
    return sameRoom || wordy;
  });
}

export { STATUS_LABELS, STATUS_ORDER, CATEGORIES } from './constants';