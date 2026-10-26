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
