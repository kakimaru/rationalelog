import { useRef, type KeyboardEvent, type ReactNode } from 'react';
import { focusRing } from './styles';

type Tab<T extends string> = {
  value: T;
  label: string;
};

type Props<T extends string> = {
  label: string;
  /** タブとパネルの id の接頭辞。TabPanel にも同じ値を渡す */
  idPrefix: string;
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
};

function tabId(idPrefix: string, value: string): string {
  return `${idPrefix}-tab-${value}`;
}

function tabPanelId(idPrefix: string, value: string): string {
  return `${idPrefix}-panel-${value}`;
}

/**
 * 内容を切り替えるタブ（WAI-ARIA の tabs パターン）。見た目は ViewToggle に揃える
 * ViewToggle は表示方法の選択（radiogroup）、こちらは表示する内容そのものの切り替えに使う
 */
export function Tabs<T extends string>({ label, idPrefix, tabs, value, onChange }: Props<T>) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = tabs.findIndex((tab) => tab.value === value);
    let next: number;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault();
    onChange(tabs[next].value);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      className="inline-flex gap-1 rounded-button border border-border bg-surface-raised p-1"
    >
      {tabs.map((tab, i) => {
        const selected = tab.value === value;
        return (
          <button
            key={tab.value}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            type="button"
            role="tab"
            id={tabId(idPrefix, tab.value)}
            aria-selected={selected}
            aria-controls={tabPanelId(idPrefix, tab.value)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={`rounded-sm px-3 py-1 text-sm font-medium ${focusRing} ${
              selected
                ? 'bg-primary-100 text-primary-800'
                : 'text-text-muted hover:bg-neutral-100 hover:text-text active:bg-neutral-200'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

type TabPanelProps = {
  idPrefix: string;
  value: string;
  className?: string;
  children: ReactNode;
};

/** 選択中のタブの中身。Tabs と同じ idPrefix・value を渡すと、タブと関連づけられる */
export function TabPanel({ idPrefix, value, className = '', children }: TabPanelProps) {
  return (
    <div role="tabpanel" id={tabPanelId(idPrefix, value)} aria-labelledby={tabId(idPrefix, value)} className={className}>
      {children}
    </div>
  );
}
