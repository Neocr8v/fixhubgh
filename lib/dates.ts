export function parseDatabaseDate(value: string | Date | null | undefined): Date | null {
  if (!value) return null;
  const dateValue = value instanceof Date ? value : new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  return Number.isNaN(dateValue.getTime()) ? null : dateValue;
}

export function formatDatabaseDate(value: string | Date | null | undefined): string {
  const date = parseDatabaseDate(value);
  return date ? date.toLocaleString() : 'Date unavailable';
}

export function timeAgo(value: string | Date | null | undefined): string {
  const date = parseDatabaseDate(value);
  if (!date) return 'Date unavailable';

  const diffMinutes = Math.max(1, Math.round((Date.now() - date.getTime()) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.round(diffHours / 24)}d ago`;
}
