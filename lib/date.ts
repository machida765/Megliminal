export const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'] as const;

export function toIsoDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function parseIsoDate(iso: string): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(year, month - 1, day);
  if (
    probe.getFullYear() !== year ||
    probe.getMonth() !== month - 1 ||
    probe.getDate() !== day
  ) {
    return null;
  }
  return { year, month, day };
}

export function formatIsoAsSlash(iso: string): string {
  const parts = parseIsoDate(iso);
  if (!parts) return '';
  return `${parts.year}/${String(parts.month).padStart(2, '0')}/${String(parts.day).padStart(2, '0')}`;
}

export function parseSlashDate(text: string): string | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const match = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/.exec(trimmed);
  if (!match) return null;
  const iso = toIsoDate(Number(match[1]), Number(match[2]), Number(match[3]));
  return parseIsoDate(iso) ? iso : null;
}

export function getCalendarCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);
  return cells;
}

export function getYearOptions(anchorYear = new Date().getFullYear()) {
  const start = anchorYear - 20;
  const end = anchorYear + 1;
  const years: number[] = [];
  for (let year = end; year >= start; year--) years.push(year);
  return years;
}
