import type { TraitAxis } from '../types';

type Props = {
  trait: TraitAxis;
  /** コメントを出さない（狭い場所で使うとき） */
  hideComment?: boolean;
};

/** 中央を 0 とした横バー。値の側にバーを伸ばし、現在地にマーカーを置く */
export function TraitGauge({ trait, hideComment = false }: Props) {
  const { left, right, value, comment } = trait;
  // viewBox は -100〜100 の値をそのまま x 座標に使う
  const barStart = Math.min(0, value);
  const barWidth = Math.abs(value);
  const leaning = value < 0 ? left : value > 0 ? right : null;
  const valueText = leaning ? `${leaning}寄り（${Math.abs(value)}）` : 'ちょうど中間';

  return (
    <div className="space-y-2">
      <div className="flex justify-between gap-4 text-sm font-medium">
        <span className={value < 0 ? 'text-primary-800' : 'text-text-muted'}>{left}</span>
        <span className={value > 0 ? 'text-primary-800' : 'text-text-muted'}>{right}</span>
      </div>
      <svg
        role="meter"
        aria-label={`${left} と ${right}`}
        aria-valuemin={-100}
        aria-valuemax={100}
        aria-valuenow={value}
        aria-valuetext={valueText}
        viewBox="-100 0 200 12"
        preserveAspectRatio="none"
        className="block h-3 w-full"
      >
        <rect x={-100} y={3} width={200} height={6} className="fill-neutral-200" />
        <rect x={barStart} y={3} width={barWidth} height={6} className="fill-primary-300" />
        <rect x={-0.5} y={0} width={1} height={12} className="fill-neutral-400" />
        <rect x={value - 2} y={0} width={4} height={12} className="fill-primary-700" />
      </svg>
      {!hideComment && <p className="text-sm text-text-muted">{comment}</p>}
    </div>
  );
}
