import { useState } from 'react';
import { Button } from '../components/Button';
import { ConfirmModal } from '../components/ConfirmModal';
import { GenerateCaseStudyModal } from '../components/GenerateCaseStudyModal';
import { LogList } from '../components/LogList';
import { ProjectAppealPanel } from '../components/ProjectAppealPanel';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { cardClass, focusRing } from '../components/styles';
import { TabPanel, Tabs } from '../components/Tabs';
import { deleteProject, updateProject } from '../lib/actions';
import { byNewest, formatDate, toDateString } from '../lib/date';
import { navigate, paths } from '../lib/useHashRoute';
import { LOG_TYPE_LABELS, LOG_TYPES, UNCATEGORIZED_LABEL, type AppData, type LogType, type Project } from '../types';
import { NotFoundPage } from './NotFoundPage';

type Props = {
  projectId: string;
  data: AppData;
  onChange: () => void;
};

type TypeFilter = 'all' | LogType | 'uncategorized';

const FILTERS: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'すべて' },
  ...LOG_TYPES.map((type) => ({ value: type, label: LOG_TYPE_LABELS[type] })),
  { value: 'uncategorized', label: UNCATEGORIZED_LABEL },
];

type Dialog = 'edit' | 'delete' | 'generate' | null;

type Tab = 'logs' | 'caseStudies';

export function ProjectPage({ projectId, data, onChange }: Props) {
  const project = data.projects.find((p) => p.id === projectId);
  if (!project) return <NotFoundPage />;
  return <ProjectDetail key={project.id} project={project} data={data} onChange={onChange} />;
}

function ProjectDetail({ project, data, onChange }: { project: Project } & Omit<Props, 'projectId'>) {
  const [filter, setFilter] = useState<TypeFilter>('all');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [tab, setTab] = useState<Tab>('logs');

  const logs = data.logs.filter((log) => log.projectId === project.id).sort(byNewest);
  const deepDived = logs.filter((log) => log.deepDive.length > 0).length;
  const filteredLogs = logs.filter((log) => {
    if (filter === 'all') return true;
    if (filter === 'uncategorized') return log.type === null;
    return log.type === filter;
  });
  const caseStudies = data.caseStudies
    .filter((cs) => cs.projectId === project.id)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <div className="space-y-12">
      <section className="space-y-4">
        <a href={paths.home()} className={`inline-block rounded-sm text-sm text-text-muted hover:text-text ${focusRing}`}>
          ← ホーム
        </a>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-2xl">{project.name}</h1>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setDialog('edit')}>
              編集
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setDialog('delete')}>
              削除
            </Button>
          </div>
        </div>
        {project.description ? (
          <p className="whitespace-pre-wrap text-text-muted">{project.description}</p>
        ) : (
          <p className="text-sm text-text-muted">
            説明はまだありません。「編集」から追加すると、ケーススタディの「背景」に使われます。
          </p>
        )}
        {project.keywords.length > 0 && (
          <ul className="flex flex-wrap gap-2" aria-label="キーワード">
            {project.keywords.map((keyword) => (
              <li key={keyword} className="rounded-badge border border-border px-2 py-1 text-sm text-text-muted">
                {keyword}
              </li>
            ))}
          </ul>
        )}
        <p className="flex flex-wrap gap-4 text-sm text-text-muted">
          <span>ログ {logs.length} 件</span>
          <span>深掘り済み {deepDived} 件</span>
        </p>
      </section>

      <div className="grid gap-12 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Tabs
            label="表示する内容"
            idPrefix="project"
            tabs={[
              { value: 'logs', label: `ログ（${logs.length}）` },
              { value: 'caseStudies', label: `ケーススタディ（${caseStudies.length}）` },
            ]}
            value={tab}
            onChange={setTab}
          />

          {tab === 'logs' ? (
            <TabPanel idPrefix="project" value="logs" className="space-y-4">
              {logs.length === 0 ? (
                <p className="text-text-muted">
                  まだログがありません。
                  <a href={paths.home()} className={`rounded-sm text-primary-700 hover:underline ${focusRing}`}>
                    ホーム
                  </a>
                  の入力欄から記録できます。
                </p>
              ) : (
                <>
                  <div role="group" aria-label="種別で絞り込む" className="flex flex-wrap gap-2">
                    {FILTERS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={filter === value}
                        onClick={() => setFilter(value)}
                        className={`rounded-badge px-3 py-1 text-sm font-medium ${focusRing} ${
                          filter === value
                            ? 'bg-neutral-800 text-white'
                            : 'text-text-muted hover:bg-neutral-100 active:bg-neutral-200'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {filteredLogs.length === 0 ? (
                    <p className="text-text-muted">この種別のログはありません</p>
                  ) : (
                    <LogList logs={filteredLogs} projects={data.projects} onChange={onChange} />
                  )}
                </>
              )}
            </TabPanel>
          ) : (
            <TabPanel idPrefix="project" value="caseStudies" className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-text-muted">
                  {logs.length === 0
                    ? 'ログを記録すると、ケーススタディの下書きを作れます。'
                    : caseStudies.length === 0
                      ? 'まだありません。溜まったログから下書きを作れます。'
                      : '溜まったログから、新しい下書きも作れます。'}
                </p>
                <Button variant="primary" onClick={() => setDialog('generate')} disabled={logs.length === 0}>
                  ケーススタディを作る
                </Button>
              </div>
              {caseStudies.length > 0 && (
                <ul className="space-y-2">
                  {caseStudies.map((cs) => (
                    <li key={cs.id}>
                      <a
                        href={paths.caseStudy(cs.id)}
                        className={`flex flex-wrap items-center justify-between gap-2 ${cardClass} hover:bg-neutral-50 active:bg-neutral-100 ${focusRing}`}
                      >
                        <span className="font-medium">{cs.title}</span>
                        <span className="text-sm text-text-muted">
                          更新 {formatDate(toDateString(new Date(cs.updatedAt)))}・ログ {cs.logIds.length} 件から作成
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </TabPanel>
          )}
        </div>

        <aside className="self-start">
          <ProjectAppealPanel project={project} logs={data.logs} />
        </aside>
      </div>

      {dialog === 'edit' && (
        <ProjectFormModal
          project={project}
          onClose={() => setDialog(null)}
          onSubmit={(values) => {
            updateProject(project.id, values);
            onChange();
            setDialog(null);
          }}
        />
      )}
      {dialog === 'delete' && (
        <ConfirmModal
          title="プロジェクトを削除"
          message={`「${project.name}」を削除しますか？ログ ${logs.length} 件とケーススタディ ${caseStudies.length} 件も一緒に削除されます`}
          confirmLabel="削除する"
          danger
          onCancel={() => setDialog(null)}
          onConfirm={() => {
            deleteProject(project.id);
            // データの再読み込みは画面の切り替え時に App が行う（先に再読み込みすると「見つかりません」が一瞬出るため）
            navigate(paths.home());
          }}
        />
      )}
      {dialog === 'generate' && (
        <GenerateCaseStudyModal
          project={project}
          logs={logs}
          onClose={() => setDialog(null)}
          onGenerated={(caseStudy) => {
            onChange();
            navigate(paths.caseStudy(caseStudy.id));
          }}
        />
      )}
    </div>
  );
}
