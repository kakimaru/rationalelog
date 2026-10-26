import { useState } from 'react';
import { createCaseStudy } from '../lib/actions';
import { byNewest, formatDate } from '../lib/date';
import { generateCaseStudy } from '../lib/mockAi';
import type { CaseStudy, Log, Project } from '../types';
import { Button } from './Button';
import { DemoNotice } from './DemoNotice';
import { LogTypeBadge } from './LogTypeBadge';
import { Modal } from './Modal';

type Props = {
  project: Project;
  logs: Log[];
  onClose: () => void;
  onGenerated: (caseStudy: CaseStudy) => void;
};

const FEW_LOGS_THRESHOLD = 3;

export function GenerateCaseStudyModal({ project, logs, onClose, onGenerated }: Props) {
  // すべて選んだ状態から始め、チェックを外して除外する
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(logs.map((log) => log.id)));
  const [generating, setGenerating] = useState(false);

  const sortedLogs = [...logs].sort(byNewest);
  const selectedLogs = logs.filter((log) => selectedIds.has(log.id));

  const toggle = (id: string) =>
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const generate = async () => {
    setGenerating(true);
    const draft = await generateCaseStudy(project, selectedLogs);
    const caseStudy = createCaseStudy({ projectId: project.id, logIds: selectedLogs.map((log) => log.id), ...draft });
    onGenerated(caseStudy);
  };

  return (
    <Modal
      title="ケーススタディを作る"
      onClose={onClose}
      preventClose={generating}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={generating}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={generate} disabled={selectedLogs.length === 0 || generating}>
            生成する
          </Button>
        </>
      }
    >
      {generating ? (
        <p role="status" className="py-12 text-center text-text-muted">
          下書きを作っています…
        </p>
      ) : (
        <>
          <p className="text-sm text-text-muted">
            下書きに使うログを選んでください（{selectedLogs.length} / {logs.length} 件）
          </p>
          <ul className="max-h-96 space-y-1 overflow-y-auto">
            {sortedLogs.map((log) => (
              <li key={log.id}>
                <label className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-neutral-50">
                  <input
                    type="checkbox"
                    className="mt-1 accent-primary-600"
                    checked={selectedIds.has(log.id)}
                    onChange={() => toggle(log.id)}
                  />
                  <span className="min-w-0 flex-1 space-y-1">
                    <span className="flex items-center gap-2 text-sm text-text-muted">
                      {formatDate(log.date)}
                      <LogTypeBadge type={log.type} />
                    </span>
                    <span className="block line-clamp-2">{log.body}</span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
          {selectedLogs.length > 0 && selectedLogs.length < FEW_LOGS_THRESHOLD && (
            <p className="flex items-center gap-2 text-sm text-text-muted">
              <span aria-hidden="true" className="size-2 rounded-full bg-warning-500" />
              ログが少ないと下書きが薄くなります
            </p>
          )}
        </>
      )}
      <DemoNotice />
    </Modal>
  );
}
