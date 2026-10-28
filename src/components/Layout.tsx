import type { ReactNode } from 'react';
import { paths } from '../lib/useHashRoute';
import { BackgroundBlobs } from './BackgroundBlobs';
import { focusRing } from './styles';

/**
 * 画面ごとの中身の幅
 * - narrow：404（読み物中心）
 * - wide：ホーム・プロジェクト詳細・ケーススタディ・自己分析（2カラム）
 * - full：LP（セクションごとに背景を敷くため、main の幅と余白を外す）
 */
export type LayoutWidth = 'narrow' | 'wide' | 'full';

export type NavItem = 'insights' | 'about';

type Props = {
  width?: LayoutWidth;
  /** 表示中の画面がナビの項目にあたるとき、その項目に aria-current を付ける */
  current?: NavItem;
  children: ReactNode;
};

const containerClasses: Record<LayoutWidth, string> = {
  narrow: 'max-w-4xl',
  wide: 'max-w-6xl',
  full: 'max-w-6xl',
};

const NAV_ITEMS: { id: NavItem; href: string; label: string }[] = [
  { id: 'insights', href: paths.insights(), label: '自己分析' },
  { id: 'about', href: paths.about(), label: 'このサービスについて' },
];

export function Layout({ width = 'narrow', current, children }: Props) {
  const container = `mx-auto px-4 sm:px-6 ${containerClasses[width]}`;
  return (
    <div className="min-h-screen">
      <BackgroundBlobs />
      <header className="border-b border-border bg-surface-raised/80 backdrop-blur">
        <div className={`${container} flex items-center justify-between gap-4 py-3`}>
          <a href={paths.home()} className={`rounded-sm text-lg font-bold font-heading ${focusRing}`}>
            Rationale Log
          </a>
          <nav aria-label="メインメニュー">
            <ul className="flex items-center gap-4">
              {NAV_ITEMS.map((item) => (
                <li key={item.id}>
                  <a
                    href={item.href}
                    aria-current={current === item.id ? 'page' : undefined}
                    className={`rounded-sm text-sm font-medium text-text-muted hover:text-text aria-[current=page]:text-primary-700 ${focusRing}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>
      <p className="bg-neutral-100/70 px-4 py-1 text-center text-sm text-text-muted">
        デモ版：データはこのブラウザにだけ保存されます
      </p>
      {width === 'full' ? <main>{children}</main> : <main className={`${container} py-8`}>{children}</main>}
    </div>
  );
}
