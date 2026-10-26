import { useRef, type KeyboardEvent } from 'react';
import { focusRing } from './styles';

type Option<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

/** 表示の切り替えに使うセグメントボタン。矢印キーでも選べる */
export function ViewToggle<T extends string>({ label, options, value, onChange }: Props<T>) {
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (step === 0) return;
    event.preventDefault();
    const index = options.findIndex((option) => option.value === value);
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    buttonRefs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="inline-flex gap-1 rounded-button border border-border bg-surface-raised p-1"
    >
      {options.map((option, i) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(option.value)}
            className={`rounded-sm px-3 py-1 text-sm font-medium ${focusRing} ${
              checked
                ? 'bg-primary-100 text-primary-800'
                : 'text-text-muted hover:bg-neutral-100 hover:text-text active:bg-neutral-200'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
