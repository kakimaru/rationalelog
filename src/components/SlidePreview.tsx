import { useEffect, useState, type KeyboardEvent } from 'react';
import type { Slide } from '../types';
import { Button } from './Button';
import { DemoNotice } from './DemoNotice';
import { focusRing } from './styles';

type Props = {
  slides: Slide[];
};

type Notice = 'download' | 'copy' | null;

const NOTICE_MESSAGES: Record<Exclude<Notice, null>, string> = {
  download: 'デモ版のためダウンロードできません',
  copy: 'デモ版のためコピーできません',
};

function SlideBody({ slide, index }: { slide: Slide; index: number }) {
  if (slide.kind === 'cover') {
    return (
      <div className="flex h-full flex-col justify-between bg-primary-800 p-8 text-white">
        <p className="text-xs font-medium tracking-widest text-primary-200">CASE STUDY</p>
        <div className="space-y-3">
          <h3 className="line-clamp-2 text-2xl">{slide.heading}</h3>
          <div className="space-y-1 text-sm text-primary-100">
            {slide.meta.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
        <p className="text-right text-xs text-primary-200">Rationale Log</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 bg-surface-raised p-8">
      <div className="flex items-baseline gap-3 border-b-2 border-primary-500 pb-2">
        <span className="font-mono text-sm font-bold text-primary-600">{String(index).padStart(2, '0')}</span>
        <h3 className="text-xl">{slide.heading}</h3>
      </div>
      <ul className="min-h-0 flex-1 space-y-1 overflow-hidden text-sm">
        {slide.lines.map((line, i) => (
          <li
            key={i}
            className={line.level === 0 ? 'flex gap-2' : 'flex gap-2 pl-6 text-text-muted'}
          >
            <span aria-hidden="true" className={line.level === 0 ? 'text-primary-600' : ''}>
              {line.level === 0 ? '●' : '–'}
            </span>
            <span>{line.text}</span>
          </li>
        ))}
        {slide.truncated && <li className="pl-6 text-text-muted">…</li>}
      </ul>
      <p className="text-right text-xs text-text-muted">Rationale Log</p>
    </div>
  );
}

/** ケーススタディをスライドにしたときの見え方。左右に送って確認できる */
export function SlidePreview({ slides }: Props) {
  const [index, setIndex] = useState(0);
  const [notice, setNotice] = useState<Notice>(null);
  const current = Math.min(index, slides.length - 1);
  const isFirst = current === 0;
  const isLast = current === slides.length - 1;

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 2000);
    return () => clearTimeout(timer);
  }, [notice]);

  const go = (next: number) => setIndex(Math.max(0, Math.min(slides.length - 1, next)));

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      go(current - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      go(current + 1);
    }
  };

  return (
    <section aria-labelledby="slide-preview-title" className="space-y-4">
      <h2 id="slide-preview-title" className="text-lg">
        スライドのプレビュー
      </h2>

      <DemoNotice prefix="スライドは自動レイアウトのプレビューです。" />

      <div
        tabIndex={0}
        role="group"
        aria-roledescription="スライド"
        aria-label={`${current + 1} / ${slides.length} 枚目（左右キーで移動できます）`}
        onKeyDown={onKeyDown}
        className={`aspect-video overflow-hidden rounded-card border border-border shadow-md ${focusRing}`}
      >
        <SlideBody slide={slides[current]} index={current} />
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button size="sm" variant="secondary" disabled={isFirst} onClick={() => go(current - 1)}>
          ← 前へ
        </Button>
        <div className="flex flex-col items-center gap-1">
          <ol className="flex items-center" aria-label="スライドの一覧">
            {slides.map((slide, i) => (
              <li key={i}>
                <button
                  type="button"
                  aria-label={`${i + 1}枚目：${slide.kind === 'cover' ? '表紙' : slide.heading}`}
                  aria-current={i === current ? 'step' : undefined}
                  onClick={() => go(i)}
                  className={`block rounded-full p-1 ${focusRing}`}
                >
                  <span
                    aria-hidden="true"
                    className={`block size-2 rounded-full ${i === current ? 'bg-primary-500' : 'bg-neutral-300 hover:bg-neutral-400'}`}
                  />
                </button>
              </li>
            ))}
          </ol>
          <p aria-live="polite" className="font-mono text-sm text-text-muted">
            {current + 1} / {slides.length}
          </p>
        </div>
        <Button size="sm" variant="secondary" disabled={isLast} onClick={() => go(current + 1)}>
          次へ →
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-4 border-t border-border pt-4">
        <span role="status" className="text-sm text-text-muted">
          {notice ? NOTICE_MESSAGES[notice] : ''}
        </span>
        <div className="flex gap-2">
          <Button onClick={() => setNotice('copy')}>テキストをコピー</Button>
          <Button variant="primary" onClick={() => setNotice('download')}>
            PDFでダウンロード
          </Button>
        </div>
      </div>
    </section>
  );
}
