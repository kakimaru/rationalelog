// 複数のコンポーネントで使うクラスの組み合わせ（DESIGN.md の Usage guidelines / Interaction states に対応）

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500';

export const inputClass = `w-full rounded-input border border-border bg-surface-raised px-3 py-2 text-text placeholder:text-text-muted disabled:opacity-40 ${focusRing}`;

/** モーダルのフィールド。枠線を消して面で見せ、角を大きく丸める（コンポーザーとトーンを揃える） */
export const softFieldClass = `w-full rounded-composer border border-transparent bg-neutral-100 px-4 py-3 text-text placeholder:text-text-muted hover:border-border disabled:opacity-40 ${focusRing}`;

/** 一体型の入力欄の外枠。中の textarea にフォーカスがあるときに枠ごとフォーカスリングを出す */
export const composerClass =
  'rounded-composer border border-border bg-surface-raised shadow-md has-[textarea:focus-visible]:outline-2 has-[textarea:focus-visible]:outline-offset-2 has-[textarea:focus-visible]:outline-primary-500';

export const labelClass = 'block text-sm font-medium text-text-muted';

export const cardClass = 'rounded-card bg-surface-raised shadow-md p-6';
