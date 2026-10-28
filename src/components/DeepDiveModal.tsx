import { useEffect, useState } from 'react';
import { updateLog } from '../lib/actions';
import { getDeepDiveQuestions } from '../lib/mockAi';
import type { Log } from '../types';
import { Button } from './Button';
import { DemoNotice } from './DemoNotice';
import { Modal } from './Modal';
import { labelClass, softFieldClass } from './styles';

type Props = {
  log: Log;
  onClose: () => void;
  onSaved: () => void;
};

/** 深掘り（任意）：種別に応じた質問に答えると、ログの deepDive に追記される */
export function DeepDiveModal({ log, onClose, onSaved }: Props) {
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    getDeepDiveQuestions(log).then((result) => {
      if (cancelled) return;
      setQuestions(result);
      setAnswers(result.map(() => ''));
    });
    return () => {
      cancelled = true;
    };
  }, [log]);

  const filled = (questions ?? [])
    .map((question, i) => ({ question, answer: (answers[i] ?? '').trim() }))
    .filter((qa) => qa.answer.length > 0);

  const save = () => {
    if (filled.length === 0) return;
    updateLog(log.id, { deepDive: [...log.deepDive, ...filled] });
    onSaved();
  };

  return (
    <Modal
      title="もう少し聞かせてください"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            あとで
          </Button>
          <Button variant="primary" onClick={save} disabled={filled.length === 0}>
            回答を保存
          </Button>
        </>
      }
    >
      <p className="text-sm text-text-muted">
        答えると判断の理由が残り、あとでケーススタディに使えます。答えられる質問だけで大丈夫です。
      </p>
      <blockquote className="border-l-2 border-border-strong pl-3 whitespace-pre-wrap text-text-muted">
        {log.body}
      </blockquote>

      {questions === null ? (
        <p role="status" className="py-6 text-center text-text-muted">
          質問を考えています…
        </p>
      ) : (
        questions.map((question, i) => (
          <div key={question} className="space-y-1">
            <label htmlFor={`deep-dive-${i}`} className={labelClass}>
              Q. {question}
            </label>
            <textarea
              id={`deep-dive-${i}`}
              className={`${softFieldClass} resize-y`}
              rows={2}
              value={answers[i] ?? ''}
              autoFocus={i === 0}
              onChange={(event) =>
                setAnswers((prev) => prev.map((value, j) => (j === i ? event.target.value : value)))
              }
            />
          </div>
        ))
      )}

      <DemoNotice />
    </Modal>
  );
}
