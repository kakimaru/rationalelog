import { useState } from 'react';
import { groupByDate, monthGrid, todayString } from '../lib/date';
import type { Log, Project } from '../types';
import { Button } from './Button';
import { LogTypeBadge } from './LogTypeBadge';
import { cardClass, focusRing } from './styles';

type Props = {
  logs: Log[];
  projects: Project[];
};

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
/** ポップオーバーに出すログの件数 */
const POPOVER_LOG_LIMIT = 3;

/** 端の列ではポップオーバーが画面外に出ないよう、寄せる方向を変える */
function popoverAlign(column: number): string {
  if (column <= 1) return 'left-0';
  if (column >= 5) return 'right-0';
  return 'left-1/2 -translate-x-1/2';
}

/** 月表示のカレンダー。ログがある日にホバー・フォーカスすると、その日のログを表示する */
export function LogCalendar({ logs, projects }: Props) {
  const today = todayString();
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const projectNames = new Map(projects.map((p) => [p.id, p.name]));
  const logsByDate = groupByDate(logs);
  const weeks = monthGrid(month.year, month.month);
  const monthPrefix = `${month.year}-${String(month.month + 1).padStart(2, '0')}-`;
  const loggedDays = [...logsByDate.keys()].filter((date) => date.startsWith(monthPrefix)).length;
  const isCurrentMonth = today.startsWith(monthPrefix);

  const moveMonth = (diff: number) => {
    const date = new Date(month.year, month.month + diff, 1);
    setMonth({ year: date.getFullYear(), month: date.getMonth() });
  };

  return (
    <div className={`${cardClass} space-y-4`}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" aria-label="前の月" onClick={() => moveMonth(-1)}>
            ←
          </Button>
          <h3 aria-live="polite" className="min-w-32 text-center text-lg">
            {month.year}年{month.month + 1}月
          </h3>
          <Button size="sm" variant="ghost" aria-label="次の月" onClick={() => moveMonth(1)}>
            →
          </Button>
          {!isCurrentMonth && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                const now = new Date();
                setMonth({ year: now.getFullYear(), month: now.getMonth() });
              }}
            >
              今月
            </Button>
          )}
        </div>
        <p className="text-sm text-text-muted">この月に記録した日：{loggedDays} 日</p>
      </div>

      <table className="w-full table-fixed border-collapse">
        <thead>
          <tr>
            {WEEKDAYS.map((weekday) => (
              <th key={weekday} scope="col" className="pb-2 text-sm font-medium text-text-muted">
                {weekday}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, weekIndex) => (
            <tr key={weekIndex}>
              {week.map((date, column) => {
                if (!date) return <td key={column} className="p-1" />;
                const dayLogs = logsByDate.get(date) ?? [];
                const day = Number(date.slice(-2));
                const isToday = date === today;
                const cellBase = `flex h-16 w-full flex-col items-start justify-between rounded-md p-2 text-left ${
                  isToday ? 'border border-primary-500' : 'border border-transparent'
                }`;

                if (dayLogs.length === 0) {
                  return (
                    <td key={column} className="p-1">
                      <div className={`${cellBase} text-text-muted`}>
                        <span className="text-sm">{day}</span>
                        {isToday && <span className="text-xs text-primary-700">今日</span>}
                      </div>
                    </td>
                  );
                }

                const popoverId = `calendar-popover-${date}`;
                return (
                  <td key={column} className="group relative p-1">
                    <button
                      type="button"
                      aria-describedby={popoverId}
                      aria-label={`${month.month + 1}月${day}日 ログ ${dayLogs.length} 件`}
                      className={`${cellBase} bg-primary-50 hover:bg-primary-100 active:bg-primary-200 ${focusRing}`}
                    >
                      <span className="text-sm font-medium">{day}</span>
                      <span className="flex items-center gap-1 text-xs text-primary-800">
                        <span aria-hidden="true" className="size-2 rounded-full bg-primary-500" />
                        {dayLogs.length}件
                      </span>
                    </button>

                    <div
                      id={popoverId}
                      role="tooltip"
                      className={`absolute top-full z-10 mt-1 hidden w-64 space-y-3 rounded-card border border-border bg-surface-raised p-3 shadow-sm group-hover:block group-focus-within:block ${popoverAlign(column)}`}
                    >
                      <p className="text-sm font-medium text-text-muted">
                        {month.month + 1}月{day}日の記録
                      </p>
                      <ul className="space-y-3">
                        {dayLogs.slice(0, POPOVER_LOG_LIMIT).map((log) => (
                          <li key={log.id} className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
                              <LogTypeBadge type={log.type} />
                              <span className="truncate">
                                {projectNames.get(log.projectId) ?? '（削除されたプロジェクト）'}
                              </span>
                            </div>
                            <p className="line-clamp-2 text-sm">{log.body}</p>
                          </li>
                        ))}
                      </ul>
                      {dayLogs.length > POPOVER_LOG_LIMIT && (
                        <p className="text-sm text-text-muted">ほか {dayLogs.length - POPOVER_LOG_LIMIT} 件</p>
                      )}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
