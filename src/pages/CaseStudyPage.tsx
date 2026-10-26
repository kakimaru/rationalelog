import { useEffect, useState } from 'react';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { DemoNotice } from '../components/DemoNotice';
import { LogTypeBadge } from '../components/LogTypeBadge';
import { cardClass, focusRing, inputClass, labelClass } from '../components/styles';
import { deleteCaseStudy, updateCaseStudy } from '../lib/actions';
import { byNewest, formatDate } from '../lib/date';
import { navigate, paths } from '../lib/useHashRoute';
import {
  CASE_STUDY_SECTION_KEYS,
  CASE_STUDY_SECTION_LABELS,
  type AppData,
  type CaseStudy,
  type CaseStudySections,
} from '../types';
import { NotFoundPage } from './NotFoundPage';

type Props = {
  caseStudyId: string;
  data: AppData;
  onChange: () => void;
};

export function CaseStudyPage({ caseStudyId, data, onChange }: Props) {
  const caseStudy = data.caseStudies.find((cs) => cs.id === caseStudyId);
  if (!caseStudy) return <NotFoundPage />;
  return <CaseStudyEditor key={caseStudy.id} caseStudy={caseStudy} data={data} onChange={onChange} />;
}

type Dialog = 'leave' | 'delete' | null;

function CaseStudyEditor({ caseStudy, data, onChange }: { caseStudy: CaseStudy } & Omit<Props, 'caseStudyId'>) {
  const [title, setTitle] = useState(caseStudy.title);
  const [sections, setSections] = useState<CaseStudySections>(caseStudy.sections);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [savedMessage, setSavedMessage] = useState(false);

  const project = data.projects.find((p) => p.id === caseStudy.projectId);
  const backHref = project ? paths.project(project.id) : paths.home();
  const sourceLogs = data.logs.filter((log) => caseStudy.logIds.includes(log.id)).sort(byNewest);
  const missingLogCount = caseStudy.logIds.length - sourceLogs.length;

  const isDirty =
    title !== caseStudy.title || CASE_STUDY_SECTION_KEYS.some((key) => sections[key] !== caseStudy.sections[key]);
  const canSave = isDirty && title.trim().length > 0;

  // 保存していない変更があるときは、リロードやタブを閉じる前に確認する
  useEffect(() => {
    if (!isDirty) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!savedMessage) return;
    const timer = setTimeout(() => setSavedMessage(false), 2000);
    return () => clearTimeout(timer);
  }, [savedMessage]);

  const save = () => {
    if (!canSave) return;
    updateCaseStudy(caseStudy.id, { title: title.trim(), sections });
    onChange();
    setSavedMessage(true);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <a
          href={backHref}
          onClick={(event) => {
            if (!isDirty) return;
            event.preventDefault();
            setDialog('leave');
          }}
          className={`inline-block rounded-sm text-sm text-text-muted hover:text-text ${focusRing}`}
        >
          ← {project?.name ?? 'ホーム'}
        </a>
        <DemoNotice prefix="AIが作った下書きです。" />
      </div>

      <form
        className="space-y-6"
        onSubmit={(event) => {
          event.preventDefault();
          save();
        }}
      >
        <div className="space-y-1">
          <label htmlFor="case-study-title" className={labelClass}>
            タイトル
          </label>
          <input
            id="case-study-title"
            className={`${inputClass} text-xl font-bold`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        {CASE_STUDY_SECTION_KEYS.map((key) => (
          <div key={key} className="space-y-1">
            <label htmlFor={`section-${key}`} className="block text-lg font-bold font-heading">
              {CASE_STUDY_SECTION_LABELS[key]}
            </label>
            <textarea
              id={`section-${key}`}
              className={`${inputClass} resize-y leading-relaxed`}
              rows={Math.min(12, Math.max(3, sections[key].split('\n').length + 1))}
              value={sections[key]}
              onChange={(event) => setSections((prev) => ({ ...prev, [key]: event.target.value }))}
            />
          </div>
        ))}

        <div className="sticky bottom-0 -mx-4 flex flex-wrap items-center justify-between gap-4 border-t border-border bg-bg px-4 py-3">
          <Button variant="ghost" onClick={() => setDialog('delete')}>
            削除
          </Button>
          <div className="flex items-center gap-4">
            <span role="status" className="text-sm text-text-muted">
              {savedMessage ? '保存しました' : isDirty ? '保存していない変更があります' : ''}
            </span>
            <Button type="submit" variant="primary" disabled={!canSave}>
              保存
            </Button>
          </div>
        </div>
      </form>

      <details className={cardClass}>
        <summary className={`cursor-pointer rounded-sm font-medium ${focusRing}`}>
          元にしたログ（{caseStudy.logIds.length} 件）
        </summary>
        <ul className="mt-4 space-y-3">
          {sourceLogs.map((log) => (
            <li key={log.id} className="space-y-1">
              <span className="flex items-center gap-2 text-sm text-text-muted">
                {formatDate(log.date)}
                <LogTypeBadge type={log.type} />
              </span>
              <p className="whitespace-pre-wrap">{log.body}</p>
            </li>
          ))}
        </ul>
        {missingLogCount > 0 && (
          <p className="mt-3 text-sm text-text-muted">ほか {missingLogCount} 件のログは削除されています</p>
        )}
      </details>

      {dialog === 'leave' && (
        <ConfirmModal
          title="変更を保存していません"
          message="保存せずに戻ると、変更は失われます。戻りますか？"
          confirmLabel="保存せずに戻る"
          danger
          onCancel={() => setDialog(null)}
          onConfirm={() => navigate(backHref)}
        />
      )}
      {dialog === 'delete' && (
        <ConfirmModal
          title="ケーススタディを削除"
          message={`「${caseStudy.title}」を削除しますか？元のログは残ります`}
          confirmLabel="削除する"
          danger
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            deleteCaseStudy(caseStudy.id);
            // データの再読み込みは画面の切り替え時に App が行う（先に再読み込みすると「見つかりません」が一瞬出るため）
            navigate(backHref);
          }}
        />
      )}
    </div>
  );
}
