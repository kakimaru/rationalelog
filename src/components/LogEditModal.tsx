import { useState } from 'react';
import { updateLog } from '../lib/actions';
import { LOG_BODY_MAX_LENGTH, type DeepDiveAnswer, type Log, type LogType, type Project } from '../types';
import { Button } from './Button';
import { LogTypeChips } from './LogTypeChips';
import { Modal } from './Modal';
import { inputClass, labelClass } from './styles';

type Props = {
  log: Log;
  projects: Project[];
  onClose: () => void;
  onSaved: () => void;
};

export function LogEditModal({ log, projects, onClose, onSaved }: Props) {
  const [body, setBody] = useState(log.body);
  const [type, setType] = useState<LogType | null>(log.type);
  const [date, setDate] = useState(log.date);
  const [projectId, setProjectId] = useState(log.projectId);
  const [deepDive, setDeepDive] = useState<DeepDiveAnswer[]>(log.deepDive);

  const canSave = body.trim().length > 0 && date.length > 0;

  const save = () => {
    if (!canSave) return;
    updateLog(log.id, {
      body: body.trim(),
      type,
      date,
      projectId,
      // 回答を空にした質問は削除したものとして扱う
      deepDive: deepDive.map((qa) => ({ ...qa, answer: qa.answer.trim() })).filter((qa) => qa.answer.length > 0),
    });
    onSaved();
  };

  return (
    <Modal
      title="ログを編集"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="primary" onClick={save} disabled={!canSave}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-1">
        <label htmlFor="log-edit-body" className={labelClass}>
          本文
        </label>
        <textarea
          id="log-edit-body"
          className={`${inputClass} resize-y`}
          rows={3}
          maxLength={LOG_BODY_MAX_LENGTH}
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
      </div>

      <div className="space-y-1">
        <span className={labelClass}>種別（任意）</span>
        <LogTypeChips value={type} onChange={setType} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="log-edit-date" className={labelClass}>
            日付
          </label>
          <input
            id="log-edit-date"
            type="date"
            className={inputClass}
            value={date}
            onChange={(event) => setDate(event.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="log-edit-project" className={labelClass}>
            プロジェクト
          </label>
          <select
            id="log-edit-project"
            className={inputClass}
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {deepDive.length > 0 && (
        <fieldset className="space-y-3">
          <legend className={labelClass}>深掘りの回答</legend>
          {deepDive.map((qa, i) => (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <label htmlFor={`log-edit-qa-${i}`} className="text-sm text-text-muted">
                  Q. {qa.question}
                </label>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setDeepDive((prev) => prev.filter((_, j) => j !== i))}
                >
                  削除
                </Button>
              </div>
              <textarea
                id={`log-edit-qa-${i}`}
                className={`${inputClass} resize-y`}
                rows={2}
                value={qa.answer}
                onChange={(event) =>
                  setDeepDive((prev) => prev.map((item, j) => (j === i ? { ...item, answer: event.target.value } : item)))
                }
              />
            </div>
          ))}
        </fieldset>
      )}
    </Modal>
  );
}
