import type { ButtonHTMLAttributes } from 'react';
import { focusRing } from './styles';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700',
  secondary: 'border border-border-strong bg-surface-raised text-text hover:bg-neutral-100 active:bg-neutral-200',
  ghost: 'text-text-muted hover:bg-neutral-100 hover:text-text active:bg-neutral-200',
  // danger は番号付きの段階がないため、Interaction states（明度 -5% / -10%）を filter で再現する
  danger: 'bg-danger-500 text-white shadow-sm hover:brightness-95 active:brightness-90',
};

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1 text-sm',
  md: 'px-4 py-2',
};

export function Button({ variant = 'secondary', size = 'md', className = '', type = 'button', ...rest }: Props) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-button font-medium whitespace-nowrap disabled:pointer-events-none disabled:opacity-40 ${focusRing} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...rest}
    />
  );
}
