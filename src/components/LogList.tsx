import { useState } from 'react';
import { deleteLog } from '../lib/actions';
import { formatDate } from '../lib/date';
import { paths } from '../lib/useHashRoute';
import type { Log, Project } from '../types';
import { Button } from './Button';
import { ConfirmModal } from './ConfirmModal';
import { DeepDiveModal } from './DeepDiveModal';
import { LogEditModal } from './LogEditModal';
import { LogTypeBadge } from './LogTypeBadge';
import { focusRing } from './styles';

type Props = {
  logs: Log[];
  projects: Project[];
  /** ホームではプロジェクト名を表示する */
  showProject?: boolean;
  onChange: () => void;
};

type Dialog = { kind: 'edit' | 'delete' | 'deepDive'; log: Log } | null;

export function LogList({ logs, projects, showProject = false, onChange }: Props) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const projectNames = new Map(projects.map((p) => [p.id, p.name]));

  const close = () => setDialog(null);
  const done = () => {
    onChange();
    setDialog(null);
  };

  return (
    <>
      <ul className="divide-y divide-border overflow-hidden rounded-card bg-surface-raised shadow-md">
        {logs.map((log) => (
          <li key={log.id} className="space-y-2 px-6 py-4">
            <div className="flex flex-wrap items-center gap-2 text-sm text-text-muted">
              <time dateTime={log.date}>{formatDate(log.date)}</time>
              <LogTypeBadge type={log.type} />
              {showProject && (
                <a href={paths.project(log.projectId)} className={`rounded-sm hover:text-text hover:underline ${focusRing}`}>
                  {projectNames.get(log.projectId) ?? '（削除されたプロジェクト）'}
                </a>
              )}
              {log.deepDive.length > 0 && <span className="font-medium text-primary-700">✓ 深掘り済み</span>}
            </div>

            <p className="whitespace-pre-wrap">{log.body}</p>

            {log.deepDive.length > 0 && (
              <dl className="space-y-1 border-l-2 border-primary-200 pl-3 text-sm text-text-muted">
                {log.deepDive.map((qa, i) => (
                  <div key={i}>
                    <dt>Q. {qa.question}</dt>
                    <dd className="whitespace-pre-wrap text-text">A. {qa.answer}</dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="flex flex-wrap justify-end gap-1">
              {log.deepDive.length === 0 && (
                <Button size="sm" variant="secondary" onClick={() => setDialog({ kind: 'deepDive', log })}>
                  深掘りする
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => setDialog({ kind: 'edit', log })}>
                編集
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDialog({ kind: 'delete', log })}>
                削除
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {dialog?.kind === 'edit' && (
        <LogEditModal log={dialog.log} projects={projects} onClose={close} onSaved={done} />
      )}
      {dialog?.kind === 'deepDive' && <DeepDiveModal log={dialog.log} onClose={close} onSaved={done} />}
      {dialog?.kind === 'delete' && (
        <ConfirmModal
          title="ログを削除"
          message="このログを削除しますか？ケーススタディに反映済みの文章は残ります"
          confirmLabel="削除する"
          danger
          onCancel={close}
          onConfirm={() => {
            deleteLog(dialog.log.id);
            done();
          }}
        />
      )}
    </>
  );
}
