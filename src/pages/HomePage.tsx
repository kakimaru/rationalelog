import { useState } from 'react';
import { Button } from '../components/Button';
import { LogCalendar } from '../components/LogCalendar';
import { LogComposer } from '../components/LogComposer';
import { LogList } from '../components/LogList';
import { ProjectFormModal } from '../components/ProjectFormModal';
import { SlideBody } from '../components/SlidePreview';
import { cardClass, focusRing } from '../components/styles';
import { ViewToggle } from '../components/ViewToggle';
import { addSampleData, createProject } from '../lib/actions';
import { byNewest } from '../lib/date';
import { buildProjectPreviewSlides } from '../lib/slides';
import { paths } from '../lib/useHashRoute';
import type { AppData } from '../types';

type Props = {
  data: AppData;
  onChange: () => void;
};

const RECENT_LOG_LIMIT = 10;

export function HomePage({ data, onChange }: Props) {
  const [creatingProject, setCreatingProject] = useState(false);
  const [logView, setLogView] = useState<'list' | 'calendar'>('list');

  const recentLogs = [...data.logs].sort(byNewest).slice(0, RECENT_LOG_LIMIT);
  const projects = [...data.projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const isEmpty = data.logs.length === 0 && data.projects.length === 0;

  return (
    <div className="grid gap-16 lg:grid-cols-3 lg:gap-12">
      <div className="space-y-16 lg:col-span-2">
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
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h2 id="recent-logs-title" className="text-xl">
                最近のログ
              </h2>
              <ViewToggle
                label="ログの表示方法"
                options={[
                  { value: 'list', label: 'リスト' },
                  { value: 'calendar', label: 'カレンダー' },
                ]}
                value={logView}
                onChange={setLogView}
              />
            </div>
            {logView === 'list' ? (
              <LogList logs={recentLogs} projects={data.projects} showProject onChange={onChange} />
            ) : (
              <LogCalendar logs={data.logs} projects={data.projects} />
            )}
          </section>
        )}
      </div>

      <section aria-labelledby="projects-title" className="space-y-4 self-start rounded-card bg-neutral-100 p-6">
        <div className="flex items-center justify-between gap-4">
          <h2 id="projects-title" className="text-xl">
            プロジェクト
          </h2>
          <Button size="sm" onClick={() => setCreatingProject(true)}>
            ＋ 追加する
          </Button>
        </div>
        {projects.length === 0 ? (
          <p className="text-text-muted">まだプロジェクトがありません</p>
        ) : (
          <ul className="grid grid-cols-1 gap-4">
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
                    <div aria-hidden="true" className="grid grid-cols-2 gap-2">
                      {buildProjectPreviewSlides(project, logs).map((slide, i) => (
                        <div key={i} className="aspect-video overflow-hidden rounded-card border border-border">
                          <SlideBody slide={slide} index={i} size="thumb" />
                        </div>
                      ))}
                    </div>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>

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
