import { useState } from 'react';
import { createLog, createProject } from '../lib/actions';
import { todayString } from '../lib/date';
import { LOG_BODY_MAX_LENGTH, type AppData, type Log, type LogType } from '../types';
import { AssignProjectModal, type AssignTarget } from './AssignProjectModal';
import { Button } from './Button';
import { DeepDiveModal } from './DeepDiveModal';
import { LogTypeChips } from './LogTypeChips';
import { cardClass, inputClass, labelClass } from './styles';

type Props = {
  data: AppData;
  onChange: () => void;
};

type Step = { name: 'input' } | { name: 'assign' } | { name: 'deepDive'; log: Log };

/** 記録 → 振り分け → 深掘り を、画面を移動せずに完結させる */
export function LogComposer({ data, onChange }: Props) {
  const [body, setBody] = useState('');
  const [type, setType] = useState<LogType | null>(null);
  const [date, setDate] = useState(todayString);
  const [step, setStep] = useState<Step>({ name: 'input' });

  const trimmedBody = body.trim();
  const canSubmit = trimmedBody.length > 0 && date.length > 0;

  const confirmProject = (target: AssignTarget) => {
    const projectId =
      target.kind === 'new'
        ? createProject({ name: target.name, description: '', keywords: [] }).id
        : target.projectId;
    const log = createLog({ projectId, body: trimmedBody, type, date, deepDive: [] });

    // ここでログは保存済み。入力欄を空にしてから深掘りに進む
    setBody('');
    setType(null);
    setDate(todayString());
    onChange();
    setStep({ name: 'deepDive', log });
  };

  return (
    <section aria-labelledby="composer-title" className={cardClass}>
      <h2 id="composer-title" className="sr-only">
        ログを記録する
      </h2>
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) setStep({ name: 'assign' });
        }}
      >
        <div className="space-y-1">
          <label htmlFor="composer-body" className="sr-only">
            本文
          </label>
          <textarea
            id="composer-body"
            className={`${inputClass} resize-y text-lg`}
            rows={3}
            maxLength={LOG_BODY_MAX_LENGTH}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="今日やったこと、決めたこと、言われたことを一言で"
          />
          {body.length > LOG_BODY_MAX_LENGTH * 0.8 && (
            <p className="text-right text-sm text-text-muted">
              {body.length} / {LOG_BODY_MAX_LENGTH}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <span className={labelClass}>種別（任意）</span>
              <LogTypeChips value={type} onChange={setType} />
            </div>
            <div className="space-y-1">
              <label htmlFor="composer-date" className={labelClass}>
                日付
              </label>
              <input
                id="composer-date"
                type="date"
                className={inputClass}
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          </div>
          <Button type="submit" variant="primary" disabled={!canSubmit}>
            記録する
          </Button>
        </div>
      </form>

      {step.name === 'assign' && (
        <AssignProjectModal
          draft={{ body: trimmedBody, type }}
          projects={data.projects}
          logs={data.logs}
          onCancel={() => setStep({ name: 'input' })}
          onConfirm={confirmProject}
        />
      )}
      {step.name === 'deepDive' && (
        <DeepDiveModal
          log={step.log}
          onClose={() => setStep({ name: 'input' })}
          onSaved={() => {
            onChange();
            setStep({ name: 'input' });
          }}
        />
      )}
    </section>
  );
}
