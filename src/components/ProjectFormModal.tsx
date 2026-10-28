import { useState } from 'react';
import type { Project } from '../types';
import { Button } from './Button';
import { Modal } from './Modal';
import { ProjectNameField, PROJECT_NAME_MAX_LENGTH } from './ProjectNameField';
import { labelClass, softFieldClass } from './styles';

export type ProjectFormValues = Pick<Project, 'name' | 'description' | 'keywords'>;

type Props = {
  /** 編集するときに渡す。なければ新規作成 */
  project?: Project;
  onClose: () => void;
  onSubmit: (values: ProjectFormValues) => void;
};

function parseKeywords(text: string): string[] {
  const keywords = text
    .split(/[,、，]/)
    .map((k) => k.trim())
    .filter((k) => k.length > 0);
  return [...new Set(keywords)];
}

export function ProjectFormModal({ project, onClose, onSubmit }: Props) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [keywords, setKeywords] = useState(project?.keywords.join(', ') ?? '');

  const trimmedName = name.trim();
  const canSubmit = trimmedName.length > 0 && trimmedName.length <= PROJECT_NAME_MAX_LENGTH;

  const submit = () => {
    if (!canSubmit) return;
    onSubmit({ name: trimmedName, description: description.trim(), keywords: parseKeywords(keywords) });
  };

  return (
    <Modal
      title={project ? 'プロジェクトを編集' : 'プロジェクトを追加'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={submit} disabled={!canSubmit}>
            {project ? '保存' : '追加'}
          </Button>
        </>
      }
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <ProjectNameField value={name} onChange={setName} autoFocus />

        <div className="space-y-1">
          <label htmlFor="project-description" className={labelClass}>
            説明（任意）
          </label>
          <textarea
            id="project-description"
            className={`${softFieldClass} resize-y`}
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="どんな課題に、どんな立場で関わったか"
          />
          <p className="text-sm text-text-muted">ケーススタディの「背景」の元になります</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="project-keywords" className={labelClass}>
            キーワード（任意）
          </label>
          <input
            id="project-keywords"
            className={softFieldClass}
            value={keywords}
            onChange={(event) => setKeywords(event.target.value)}
            placeholder="例：オンボーディング, LP"
          />
          <p className="text-sm text-text-muted">カンマ区切りで入力します。ログの振り分けの推定に使います</p>
        </div>
      </form>
    </Modal>
  );
}
