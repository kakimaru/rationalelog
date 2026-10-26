import { LOG_TYPE_LABELS, UNCATEGORIZED_LABEL, type LogType } from '../types';

const dotClasses: Record<LogType, string> = {
  decision: 'bg-primary-500',
  feedback: 'bg-info-500',
  outcome: 'bg-warning-500',
  learning: 'bg-primary-800',
};

type Props = {
  type: LogType | null;
};

export function LogTypeBadge({ type }: Props) {
  return (
    <span className="inline-flex items-center gap-1 rounded-badge bg-neutral-100 px-2 text-sm font-medium text-text">
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${type ? dotClasses[type] : 'border border-border-strong'}`}
      />
      {type ? LOG_TYPE_LABELS[type] : UNCATEGORIZED_LABEL}
    </span>
  );
}
