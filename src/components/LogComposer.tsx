import { useState, type KeyboardEvent } from 'react';
import { createLog, createProject } from '../lib/actions';
import { COMPOSER_SAMPLES } from '../lib/composerSamples';
import { todayString } from '../lib/date';
import { getDeepDiveQuestionsFor } from '../lib/mockAi';
import { useTypewriter, type TypewriterSample } from '../lib/useTypewriter';
import { LOG_BODY_MAX_LENGTH, type AppData, type Log, type LogType } from '../types';
import { AssignProjectModal, type AssignTarget } from './AssignProjectModal';
import { DeepDiveModal } from './DeepDiveModal';
import { LogTypeChips } from './LogTypeChips';
import { composerClass, focusRing } from './styles';

type Props = {
  data: AppData;
  onChange: () => void;
};

type Step = { name: 'input' } | { name: 'assign' } | { name: 'deepDive'; log: Log };

// 演出用のサンプル。参照が変わらないようにモジュールで 1 回だけ作る
const TYPEWRITER_SAMPLES: TypewriterSample[] = COMPOSER_SAMPLES.map((sample) => ({
  text: sample.text,
  questions: getDeepDiveQuestionsFor(sample.type),
}));

/** 記録 → 振り分け → 深掘り を、画面を移動せずに完結させる */
export function LogComposer({ data, onChange }: Props) {
  const [body, setBody] = useState('');
  const [type, setType] = useState<LogType | null>(null);
  const [date, setDate] = useState(todayString);
  const [step, setStep] = useState<Step>({ name: 'input' });

  const trimmedBody = body.trim();
  const canSubmit = trimmedBody.length > 0 && date.length > 0;
  const isEmpty = body.length === 0;

  // 本文が空のあいだだけ、書き方の例と深掘り質問の例を見せる（モーダルを開いている間は止める）
  const { visibleText, visibleQuestions, typing } = useTypewriter(
    TYPEWRITER_SAMPLES,
    isEmpty && step.name === 'input',
  );

  const submit = () => {
    if (canSubmit) setStep({ name: 'assign' });
  };

  const onBodyKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // ⌘ / Ctrl + Enter で送信する（変換中の Enter は除く）
    if (event.key === 'Enter' && (event.metaKey || event.ctrlKey) && !event.nativeEvent.isComposing) {
      event.preventDefault();
      submit();
    }
  };

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
    <section aria-labelledby="composer-title">
      <h2 id="composer-title" className="sr-only">
        ログを記録する
      </h2>
      <form
        className={composerClass}
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
      >
        <div className="relative">
          <label htmlFor="composer-body" className="sr-only">
            本文（今日やったこと、決めたこと、言われたことを一言で）
          </label>
          <textarea
            id="composer-body"
            className="block max-h-96 min-h-24 w-full resize-none bg-transparent px-6 pt-6 pb-2 text-lg leading-relaxed text-text field-sizing-content focus:outline-none"
            rows={3}
            maxLength={LOG_BODY_MAX_LENGTH}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            onKeyDown={onBodyKeyDown}
          />
          {isEmpty && (
            <p
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 px-6 pt-6 pb-2 text-lg leading-relaxed text-text-muted"
            >
              {visibleText}
              <span
                className={`inline-block h-4 w-0.5 translate-y-0.5 bg-text-muted ${typing ? '' : 'animate-caret-blink motion-reduce:animate-none'}`}
              />
            </p>
          )}
        </div>

        {isEmpty ? (
          // 質問の例が出る・消えるたびに入力欄の高さが揺れないよう、領域の高さを確保しておく
          <div aria-hidden="true" className="min-h-16 space-y-2 px-6 pb-2">
            {visibleQuestions.length > 0 && (
              <>
                <p className="text-xs text-text-muted animate-fade-in-up motion-reduce:animate-none">
                  記録すると、AIがこんなふうに問いかけます
                </p>
                <ul className="flex flex-wrap gap-2">
                  {visibleQuestions.map((question) => (
                    <li
                      key={question}
                      className="rounded-badge bg-primary-50 px-3 py-1 text-sm text-primary-800 animate-fade-in-up motion-reduce:animate-none"
                    >
                      {question}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ) : (
          body.length > LOG_BODY_MAX_LENGTH * 0.8 && (
            <p className="px-6 pb-2 text-right text-sm text-text-muted">
              {body.length} / {LOG_BODY_MAX_LENGTH}
            </p>
          )
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
          <div className="flex flex-wrap items-center gap-3">
            <LogTypeChips value={type} onChange={setType} />
            <label htmlFor="composer-date" className="sr-only">
              日付
            </label>
            <input
              id="composer-date"
              type="date"
              className={`rounded-badge border border-border bg-surface px-3 py-1 text-sm text-text-muted hover:bg-neutral-100 ${focusRing}`}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-text-muted sm:inline">⌘ / Ctrl + Enter</span>
            <button
              type="submit"
              aria-label="記録する"
              disabled={!canSubmit}
              className={`inline-flex size-10 items-center justify-center rounded-full bg-primary-500 text-white shadow-sm hover:bg-primary-600 active:bg-primary-700 disabled:pointer-events-none disabled:opacity-40 ${focusRing}`}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2">
                <path d="M12 19V5M5 12l7-7 7 7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
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
