import { useEffect, useState } from 'react';
import { DemoNotice } from '../components/DemoNotice';
import { SkillRadarChart } from '../components/SkillRadarChart';
import { cardClass, focusRing } from '../components/styles';
import { TraitGauge } from '../components/TraitGauge';
import { analyzeSelf, ANALYSIS_MIN_LOGS } from '../lib/mockAi';
import { paths } from '../lib/useHashRoute';
import {
  LOG_TYPE_LABELS,
  LOG_TYPES,
  UNCATEGORIZED_LABEL,
  type AppData,
  type LogType,
  type MonthlyComparison,
  type SelfAnalysis,
} from '../types';

type Props = {
  data: AppData;
};

/** 自己分析：先月の自分との比較・思考の癖・スキル。結果は保存せず、開くたびにログから計算する */
export function InsightsPage({ data }: Props) {
  const [analysis, setAnalysis] = useState<SelfAnalysis | null>(null);

  useEffect(() => {
    let cancelled = false;
    analyzeSelf(data.logs, data.projects).then((result) => {
      if (!cancelled) setAnalysis(result);
    });
    return () => {
      cancelled = true;
    };
  }, [data.logs, data.projects]);

  return (
    <div className="space-y-12">
      <section className="space-y-2">
        <h1 className="text-2xl">自己分析</h1>
        <p className="text-text-muted">ログから、いまの自分の判断の傾向と、1か月でどう変わったかを読み解きます。</p>
      </section>

      {analysis === null ? (
        <p role="status" className={`${cardClass} py-12 text-center text-text-muted`}>
          ログを読み解いています…
        </p>
      ) : !analysis.enough ? (
        <section className={`${cardClass} space-y-4 text-center`}>
          <h2 className="text-lg">
            あと {Math.max(1, ANALYSIS_MIN_LOGS - data.logs.length)} 件記録すると分析できます
          </h2>
          <p className="text-text-muted">決めたこと・言われたこと・うまくいったことを、一言ずつで大丈夫です。</p>
          <a
            href={paths.home()}
            className={`inline-block rounded-sm font-medium text-primary-700 hover:underline ${focusRing}`}
          >
            ホームで記録する →
          </a>
        </section>
      ) : (
        <>
          <ComparisonSection comparison={analysis.comparison} />

          <section aria-labelledby="traits-title" className="space-y-4">
            <div className="space-y-1">
              <h2 id="traits-title" className="text-xl">
                思考の癖
              </h2>
              <p className="text-sm text-text-muted">良い・悪いではなく、いまの傾向です。</p>
            </div>
            <ul className={`${cardClass} grid gap-8 sm:grid-cols-2`}>
              {analysis.traits.map((trait) => (
                <li key={trait.id}>
                  <TraitGauge trait={trait} />
                </li>
              ))}
            </ul>
          </section>

          <section aria-labelledby="skills-title" className="space-y-4">
            <div className="space-y-1">
              <h2 id="skills-title" className="text-xl">
                スキル
              </h2>
              <p className="text-sm text-text-muted">
                すべてのログから見た今と、1か月前の時点（それまでのログ）を重ねています。
              </p>
            </div>
            <div className={cardClass}>
              <SkillRadarChart skills={analysis.skills} title="スキルのスコア（0〜100）" />
            </div>
          </section>
        </>
      )}

      <DemoNotice prefix="ログの言葉と種別から出した分析です。" />
    </div>
  );
}

function ComparisonSection({ comparison }: { comparison: MonthlyComparison }) {
  const { thisMonth, lastMonth, headline, notes } = comparison;
  const typeKeys: (LogType | 'uncategorized')[] = [...LOG_TYPES, 'uncategorized'];

  return (
    <section aria-labelledby="comparison-title" className="space-y-4">
      <div className="space-y-1">
        <h2 id="comparison-title" className="text-xl">
          先月の自分と比べて
        </h2>
        <p className="text-sm text-text-muted">直近30日と、その前の30日を比べています。</p>
      </div>
      <div className={`${cardClass} space-y-6`}>
        <p className="text-xl font-medium text-primary-800">{headline}</p>

        <dl className="grid gap-4 sm:grid-cols-3">
          <StatTile
            label="記録"
            value={`${thisMonth.logCount} 件`}
            previous={lastMonth ? `先月 ${lastMonth.logCount} 件` : null}
          />
          <StatTile
            label="深掘りに答えた割合"
            value={`${thisMonth.deepDiveRate}%`}
            previous={lastMonth ? `先月 ${lastMonth.deepDiveRate}%` : null}
          />
          <div className="space-y-2 rounded-card bg-surface p-4">
            <dt className="text-sm text-text-muted">種別の内訳（今月 / 先月）</dt>
            <dd>
              <ul className="space-y-1 text-sm">
                {typeKeys.map((key) => (
                  <li key={key} className="flex justify-between gap-2">
                    <span>{key === 'uncategorized' ? UNCATEGORIZED_LABEL : LOG_TYPE_LABELS[key]}</span>
                    <span className="tabular-nums">
                      <span className="font-medium">{thisMonth.typeCounts[key]}</span>
                      <span className="text-text-muted"> / {lastMonth ? lastMonth.typeCounts[key] : '—'}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        </dl>

        {notes.length > 0 && (
          <ul className="list-disc space-y-1 pl-6 text-text-muted">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function StatTile({ label, value, previous }: { label: string; value: string; previous: string | null }) {
  return (
    <div className="space-y-1 rounded-card bg-surface p-4">
      <dt className="text-sm text-text-muted">{label}</dt>
      <dd className="text-2xl font-bold tabular-nums">{value}</dd>
      {previous && <dd className="text-sm text-text-muted">{previous}</dd>}
    </div>
  );
}
