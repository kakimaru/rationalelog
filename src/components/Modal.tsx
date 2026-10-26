import { useEffect, useId, type ReactNode } from 'react';

type Props = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  /** 処理中など、閉じさせたくないときに true にする */
  preventClose?: boolean;
};

export function Modal({ title, onClose, children, footer, preventClose = false }: Props) {
  const titleId = useId();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !preventClose) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose, preventClose]);

  return (
    <div
      className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-neutral-950/40 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !preventClose) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="w-full max-w-lg rounded-card bg-surface-raised p-6 shadow-lg"
      >
        <h2 id={titleId} className="text-lg">
          {title}
        </h2>
        <div className="mt-4 space-y-4">{children}</div>
        {footer && <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
