import { LOG_TYPE_LABELS, LOG_TYPES, type LogType } from '../types';
import { focusRing } from './styles';

type Props = {
  value: LogType | null;
  onChange: (value: LogType | null) => void;
};

/** 種別の選択。任意で、選択中のチップをもう一度押すと解除される */
export function LogTypeChips({ value, onChange }: Props) {
  return (
    <div role="group" aria-label="種別（任意）" className="flex flex-wrap gap-2">
      {LOG_TYPES.map((type) => {
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(selected ? null : type)}
            className={`rounded-badge border px-3 py-1 text-sm font-medium ${focusRing} ${
              selected
                ? 'border-primary-500 bg-primary-50 text-primary-800 hover:bg-primary-100'
                : 'border-border bg-surface-raised text-text-muted hover:bg-neutral-100 active:bg-neutral-200'
            }`}
          >
            {LOG_TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}
