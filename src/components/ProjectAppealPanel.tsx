import { useEffect, useState } from 'react';
import { analyzeProject, ANALYSIS_MIN_LOGS } from '../lib/mockAi';
import type { Log, Project, ProjectAnalysis } from '../types';
import { DemoNotice } from './DemoNotice';
import { SkillRadarChart } from './SkillRadarChart';
import { cardClass } from './styles';
import { TraitGauge } from './TraitGauge';

type Props = {
  project: Project;
  /** すべてのログ。このプロジェクトのものは analyzeProject の中で絞り込む */
  logs: Log[];
};

/** 偏りの大きい順に、この本数だけゲージを出す */
const GAUGE_COUNT = 2;

/** プロジェクト詳細の右カラム：このプロジェクトでアピールできることと、足すと強くなる経験 */
export function ProjectAppealPanel({ project, logs }: Props) {
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const projectLogCount = logs.filter((log) => log.projectId === project.id).length;

  // ログを追加・編集すると logs が変わり、分析を取り直す（取り直す間は前の結果を出しておく）
  useEffect(() => {
    let cancelled = false;
    analyzeProject(project, logs).then((result) => {
      if (!cancelled) setAnalysis(result);
    });
    return () => {
      cancelled = true;
    };
  }, [project, logs]);

  return (
    <section aria-labelledby="appeal-title" className={`${cardClass} space-y-6`}>
      <h2 id="appeal-title" className="text-lg">
        このプロジェクトでアピールできること
      </h2>

      {analysis === null ? (
        <p role="status" className="py-6 text-center text-text-muted">
          ログを読み解いています…
        </p>
      ) : !analysis.enough ? (
        <p className="text-text-muted">
          あと {Math.max(1, ANALYSIS_MIN_LOGS - projectLogCount)} 件記録すると、アピールポイントを分析できます。
        </p>
      ) : (
        <>
          {analysis.strengths.length > 0 ? (
            <ul className="space-y-4">
              {analysis.strengths.map((strength) => (
                <li key={strength.title} className="space-y-2">
                  <h3 className="text-base text-primary-800">{strength.title}</h3>
                  <ul className="space-y-1">
                    {strength.evidence.map((body) => (
                      <li
                        key={body}
                        className="line-clamp-2 border-l-2 border-primary-200 pl-3 text-sm text-text-muted"
                      >
                        {body}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-text-muted">強みとして語れる材料は、まだ少なめです。</p>
          )}

          <div className="space-y-4">
            <h3 className="text-base">このプロジェクトでの思考の癖</h3>
            {[...analysis.traits]
              .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
              .slice(0, GAUGE_COUNT)
              .map((trait) => (
                <TraitGauge key={trait.id} trait={trait} hideComment />
              ))}
          </div>

          <div className="space-y-2">
            <h3 className="text-base">スキル</h3>
            <SkillRadarChart skills={analysis.skills} title={`${project.name} のスキルのスコア（0〜100）`} size="sm" />
          </div>

          <div className="space-y-2 rounded-card bg-primary-50 p-4">
            <h3 className="text-base text-primary-800">この経験を作れると強い</h3>
            <ul className="list-disc space-y-1 pl-6 text-sm">
              {analysis.advice.map((advice) => (
                <li key={advice}>{advice}</li>
              ))}
            </ul>
          </div>
        </>
      )}

      <DemoNotice />
    </section>
  );
}
