// 複数のコンポーネントで使うクラスの組み合わせ（DESIGN.md の Usage guidelines / Interaction states に対応）

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500';

export const inputClass = `w-full rounded-input border border-border bg-surface-raised px-3 py-2 text-text placeholder:text-text-muted disabled:opacity-40 ${focusRing}`;

export const labelClass = 'block text-sm font-medium text-text-muted';

export const cardClass = 'rounded-card bg-surface-raised shadow-md p-6';
