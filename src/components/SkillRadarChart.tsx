import type { SkillScore } from '../types';

type Props = {
  skills: SkillScore[];
  /** 数値の表の caption（スクリーンリーダー向け） */
  title: string;
  size?: 'md' | 'sm';
};

const CENTER = 160;
const RADIUS = 100;
const LABEL_RADIUS = 124;
const GRID_LEVELS = [25, 50, 75, 100];

function point(index: number, count: number, score: number): [number, number] {
  // 真上から時計回りに並べる
  const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
  const r = (RADIUS * score) / 100;
  return [CENTER + r * Math.cos(angle), CENTER + r * Math.sin(angle)];
}

function polygon(scores: number[]): string {
  return scores.map((score, i) => point(i, scores.length, score).join(',')).join(' ');
}

/** スキルのレーダーチャート。今（塗り）と 1 か月前（破線）を重ね、下に数値の表を置く（色だけに頼らない） */
export function SkillRadarChart({ skills, title, size = 'md' }: Props) {
  const count = skills.length;
  const hasPrevious = skills.some((skill) => skill.previous !== null);

  return (
    <figure className="space-y-4">
      <svg
        viewBox="0 0 320 320"
        aria-hidden="true"
        className={`mx-auto block w-full ${size === 'sm' ? 'max-w-60' : 'max-w-sm'}`}
      >
        {GRID_LEVELS.map((level) => (
          <polygon
            key={level}
            points={polygon(skills.map(() => level))}
            className="fill-none stroke-border"
          />
        ))}
        {skills.map((skill, i) => {
          const [x, y] = point(i, count, 100);
          return <line key={skill.id} x1={CENTER} y1={CENTER} x2={x} y2={y} className="stroke-border" />;
        })}

        {hasPrevious && (
          <polygon
            points={polygon(skills.map((skill) => skill.previous ?? 0))}
            strokeDasharray="6 4"
            className="fill-none stroke-neutral-500 stroke-2"
          />
        )}
        <polygon
          points={polygon(skills.map((skill) => skill.current))}
          className="fill-primary-400/30 stroke-primary-600 stroke-2"
        />

        {skills.map((skill, i) => {
          const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
          const x = CENTER + LABEL_RADIUS * Math.cos(angle);
          const y = CENTER + LABEL_RADIUS * Math.sin(angle);
          const anchor = Math.abs(Math.cos(angle)) < 0.1 ? 'middle' : Math.cos(angle) > 0 ? 'start' : 'end';
          return (
            <text
              key={skill.id}
              x={x}
              y={y}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="fill-text-muted text-sm"
            >
              {skill.label}
            </text>
          );
        })}
      </svg>

      <figcaption className="space-y-2">
        <ul className="flex flex-wrap justify-center gap-4 text-sm text-text-muted">
          <li className="flex items-center gap-2">
            <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6">
              <rect x={0} y={1} width={24} height={10} className="fill-primary-400/30 stroke-primary-600 stroke-2" />
            </svg>
            今
          </li>
          {hasPrevious && (
            <li className="flex items-center gap-2">
              <svg aria-hidden="true" viewBox="0 0 24 12" className="h-3 w-6">
                <line x1={0} y1={6} x2={24} y2={6} strokeDasharray="6 4" className="stroke-neutral-500 stroke-2" />
              </svg>
              1か月前
            </li>
          )}
        </ul>
        <table className="w-full text-sm">
          <caption className="sr-only">{title}</caption>
          <thead>
            <tr className="border-b border-border text-left text-text-muted">
              <th scope="col" className="py-1 font-medium">
                スキル
              </th>
              <th scope="col" className="py-1 text-right font-medium">
                今
              </th>
              {hasPrevious && (
                <th scope="col" className="py-1 text-right font-medium">
                  1か月前
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {skills.map((skill) => (
              <tr key={skill.id} className="border-b border-border last:border-b-0">
                <th scope="row" className="py-1 text-left font-normal">
                  {skill.label}
                </th>
                <td className="py-1 text-right font-medium tabular-nums">{skill.current}</td>
                {hasPrevious && (
                  <td className="py-1 text-right text-text-muted tabular-nums">{skill.previous ?? '—'}</td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </figcaption>
    </figure>
  );
}
