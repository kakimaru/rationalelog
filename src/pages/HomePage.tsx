import { useState } from 'react';
import { Button } from '../components/Button';
import { LogComposer } from '../components/LogComposer';
import { LogList } from '../components/LogList';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { cardClass, focusRing } from '../components/styles';
import { addSampleData, createProject } from '../lib/actions';
import { byNewest } from '../lib/date';
import { paths } from '../lib/useHashRoute';
import type { AppData } from '../types';

type Props = {
  data: AppData;
  onChange: () => void;
};

const RECENT_LOG_LIMIT = 10;
/** ケーススタディにできる目安のログ件数 */
const CASE_STUDY_READY_COUNT = 3;

export function HomePage({ data, onChange }: Props) {
  const [creatingProject, setCreatingProject] = useState(false);

  const recentLogs = [...data.logs].sort(byNewest).slice(0, RECENT_LOG_LIMIT);
  const projects = [...data.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const isEmpty = data.logs.length === 0 && data.projects.length === 0;

  return (
    <div className="space-y-16">
      <LogComposer data={data} onChange={onChange} />

      {isEmpty && (
        <section className={`${cardClass} space-y-4 text-center`}>
          <h2 className="text-lg">今日やったことを一言書いてみましょう</h2>
          <p className="text-text-muted">
            毎日でなくて大丈夫です。余裕のある日に、決めたこと・言われたこと・うまくいったことを一言だけ。
            <br />
            AI が問いかけて判断の理由を引き出し、あとでケーススタディの下書きにまとめます。
          </p>
          <Button
            onClick={() => {
              addSampleData();
              onChange();
            }}
          >
            サンプルデータを入れる
          </Button>
        </section>
      )}

      {recentLogs.length > 0 && (
        <section aria-labelledby="recent-logs-title" className="space-y-4">
          <h2 id="recent-logs-title" className="text-xl">
            最近のログ
          </h2>
          <LogList logs={recentLogs} projects={data.projects} showProject onChange={onChange} />
        </section>
      )}

      {!isEmpty && (
        <section aria-labelledby="projects-title" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 id="projects-title" className="text-xl">
              プロジェクト
            </h2>
            <Button size="sm" onClick={() => setCreatingProject(true)}>
              ＋ プロジェクトを追加
            </Button>
          </div>
          {projects.length === 0 ? (
            <p className="text-text-muted">まだプロジェクトがありません</p>
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {projects.map((project) => {
                const logs = data.logs.filter((log) => log.projectId === project.id);
                const deepDived = logs.filter((log) => log.deepDive.length > 0).length;
                return (
                  <li key={project.id}>
                    <a
                      href={paths.project(project.id)}
                      className={`block h-full space-y-3 ${cardClass} hover:bg-neutral-50 active:bg-neutral-100 ${focusRing}`}
                    >
                      <h3 className="text-lg">{project.name}</h3>
                      <p className="flex flex-wrap gap-4 text-sm text-text-muted">
                        <span>ログ {logs.length} 件</span>
                        <span>深掘り済み {deepDived} 件</span>
                      </p>
                      {logs.length >= CASE_STUDY_READY_COUNT && (
                        <p className="inline-block rounded-badge bg-primary-100 px-2 text-sm font-medium text-primary-800">
                          ケーススタディにできます
                        </p>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}

      {isEmpty && (
        <div className="text-center">
          <Button variant="ghost" size="sm" onClick={() => setCreatingProject(true)}>
            ＋ 先にプロジェクトを追加する
          </Button>
        </div>
      )}

      {creatingProject && (
        <ProjectFormModal
          onClose={() => setCreatingProject(false)}
          onSubmit={(values) => {
            createProject(values);
            onChange();
            setCreatingProject(false);
          }}
        />
      )}
    </div>
  );
}
