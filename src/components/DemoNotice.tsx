type Props = {
  /** 先頭に付ける説明（例：「AIが作った下書きです。」） */
  prefix?: string;
};

/** AI の応答を表示する画面に出す注記 */
export function DemoNotice({ prefix }: Props) {
  return (
    <p className="flex items-center gap-2 rounded-md bg-neutral-100 px-3 py-2 text-sm text-text-muted">
      <span aria-hidden="true" className="rounded-badge bg-primary-100 px-2 font-medium text-primary-800">
        AI
      </span>
      {prefix}
      デモ版のため固定の応答です
    </p>
  );
}
