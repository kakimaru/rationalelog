import type { ReactNode } from 'react';
import { paths } from '../lib/useHashRoute';
import { focusRing } from './styles';

type Props = {
  children: ReactNode;
};

export function Layout({ children }: Props) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-border bg-surface-raised">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3 sm:px-6">
          <a href={paths.home()} className={`rounded-sm text-lg font-bold font-heading ${focusRing}`}>
            Rationale Log
          </a>
        </div>
      </header>
      <p className="bg-neutral-100 px-4 py-1 text-center text-sm text-text-muted">
        デモ版：データはこのブラウザにだけ保存されます
      </p>
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
