/**
 * 背景でゆっくり動く、ぼかした緑の blob（内省・Well-being のトーンづくり）
 * 色は既存の primary に透明度をつけて使う。視差効果を減らす設定では止める
 */
export function BackgroundBlobs() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-24 size-96 rounded-full bg-primary-200/50 blur-3xl animate-blob-drift-a motion-reduce:animate-none sm:size-128" />
      <div className="absolute top-1/3 -right-32 size-96 rounded-full bg-primary-100/70 blur-3xl animate-blob-drift-b motion-reduce:animate-none sm:size-128" />
      <div className="absolute -bottom-32 left-1/4 size-80 rounded-full bg-primary-300/30 blur-3xl animate-blob-drift-c motion-reduce:animate-none sm:size-96" />
    </div>
  );
}
