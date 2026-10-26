// 日付の表示・変換

/** Date をローカル時刻の 'YYYY-MM-DD' にする */
export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** ローカル時刻での今日の日付（'YYYY-MM-DD'） */
export function todayString(): string {
  return toDateString(new Date());
}

/** 今日から days 日前の日付（'YYYY-MM-DD'） */
export function daysAgoString(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return toDateString(date);
}

/** 'YYYY-MM-DD' を「2026/10/26」の形にする */
export function formatDate(date: string): string {
  return date.replaceAll('-', '/');
}

/** ログの新しい順（日付 → 作成日時）で並べる比較関数 */
export function byNewest(a: { date: string; createdAt: string }, b: { date: string; createdAt: string }): number {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  if (a.createdAt !== b.createdAt) return a.createdAt < b.createdAt ? 1 : -1;
  return 0;
}

/**
 * 月表示カレンダーのマス目（日曜はじまり）。週ごとの配列で、前後の月の空白は null にする
 * @param month 0 はじまり（Date#getMonth と同じ）
 */
export function monthGrid(year: number, month: number): (string | null)[][] {
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => toDateString(new Date(year, month, i + 1))),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** 'YYYY-MM-DD' ごとにまとめる。各日の中は新しい順に並べる */
export function groupByDate<T extends { date: string; createdAt: string }>(items: T[]): Map<string, T[]> {
  const groups = new Map<string, T[]>();
  for (const item of [...items].sort(byNewest)) {
    const group = groups.get(item.date);
    if (group) group.push(item);
    else groups.set(item.date, [item]);
  }
  return groups;
}
