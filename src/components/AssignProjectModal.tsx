import { useEffect, useState } from 'react';
import { suggestProject } from '../lib/mockAi';
import type { Log, LogDraft, Project, ProjectSuggestion } from '../types';
import { Button } from './Button';
import { DemoNotice } from './DemoNotice';
import { Modal } from './Modal';
import { ProjectNameField, PROJECT_NAME_MAX_LENGTH } from './ProjectNameField';

export type AssignTarget = { kind: 'existing'; projectId: string } | { kind: 'new'; name: string };

type Props = {
  draft: LogDraft;
  projects: Project[];
  logs: Log[];
  onCancel: () => void;
  onConfirm: (target: AssignTarget) => void;
};

const NEW_PROJECT = '__new__';

/** 振り分け：AI（モック）が出したプロジェクト候補を確定する */
export function AssignProjectModal({ draft, projects, logs, onCancel, onConfirm }: Props) {
  const [suggestion, setSuggestion] = useState<ProjectSuggestion | null>(null);
  const [selected, setSelected] = useState<string>(NEW_PROJECT);
  const [newName, setNewName] = useState('');

  // 開いたときの内容で 1 回だけ推定する
  const [request] = useState(() => ({ draft, projects, logs }));

  useEffect(() => {
    let cancelled = false;
    suggestProject(request.draft, request.projects, request.logs).then((result) => {
      if (cancelled) return;
      setSuggestion(result);
      setSelected(result.projectId ?? NEW_PROJECT);
    });
    return () => {
      cancelled = true;
    };
  }, [request]);

  const sortedProjects = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const trimmedName = newName.trim();
  const canSubmit =
    suggestion !== null &&
    (selected !== NEW_PROJECT || (trimmedName.length > 0 && trimmedName.length <= PROJECT_NAME_MAX_LENGTH));

  const submit = () => {
    if (!canSubmit) return;
    onConfirm(selected === NEW_PROJECT ? { kind: 'new', name: trimmedName } : { kind: 'existing', projectId: selected });
  };

  return (
    <Modal
      title="どのプロジェクトのログですか？"
      onClose={onCancel}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>
            このプロジェクトに保存
          </Button>
        </>
      }
    >
      <blockquote className="border-l-2 border-border-strong pl-3 whitespace-pre-wrap text-text-muted">
        {draft.body}
      </blockquote>

      {suggestion === null ? (
        <p role="status" className="py-6 text-center text-text-muted">
          プロジェクトを推定しています…
        </p>
      ) : (
        <form
          className="space-y-2"
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
        >
          <fieldset className="space-y-2">
            <legend className="sr-only">プロジェクト</legend>
            {sortedProjects.map((project) => {
              const isSuggested = project.id === suggestion.projectId;
              return (
                <label
                  key={project.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-card border px-3 py-2 hover:bg-neutral-50 ${
                    selected === project.id ? 'border-primary-500' : 'border-border'
                  }`}
                >
                  <input
                    type="radio"
                    name="project"
                    className="mt-1 accent-primary-600"
                    checked={selected === project.id}
                    onChange={() => setSelected(project.id)}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{project.name}</span>
                      {isSuggested && (
                        <span className="rounded-badge bg-primary-100 px-2 text-sm font-medium text-primary-800">
                          AIの提案
                        </span>
                      )}
                    </span>
                    {isSuggested && <span className="block text-sm text-text-muted">{suggestion.reason}</span>}
                  </span>
                </label>
              );
            })}

            {projects.length === 0 ? (
              <p className="text-sm text-text-muted">{suggestion.reason}</p>
            ) : (
              <label
                className={`flex cursor-pointer items-center gap-3 rounded-card border px-3 py-2 hover:bg-neutral-50 ${
                  selected === NEW_PROJECT ? 'border-primary-500' : 'border-border'
                }`}
              >
                <input
                  type="radio"
                  name="project"
                  className="accent-primary-600"
                  checked={selected === NEW_PROJECT}
                  onChange={() => setSelected(NEW_PROJECT)}
                />
                <span className="font-medium">新しいプロジェクトを作る</span>
              </label>
            )}
          </fieldset>

          {selected === NEW_PROJECT && (
            <ProjectNameField value={newName} onChange={setNewName} autoFocus />
          )}
        </form>
      )}

      <DemoNotice />
    </Modal>
  );
}
