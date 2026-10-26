# 修正内容
## ホーム画面

### 背景色変更
ホーム画面のプロジェクトの部分（右からむ）の背景を薄いグレーにして左部分との差を出したい

### プロジェクトのカード
ケーススタディにできますのタグは削除し、スライドのプレビューを2枚ほどカード内に表示させる形にしたい

## プロジェクト詳細ページ
デザインシステム
トークン
コンポーネント
などのタグの余白が狭すぎるので、上下のpaddingに4pxを追加したい。

## その他
面接で見せる時のために、画面上に動線はないがパスとして/interviewを作成し、ペルソナやビジネスモデル、作成背景などをまとめたページを作りたい


# 実装計画

## 1. ホーム：プロジェクト欄の背景を薄いグレーに
- 対象: `src/pages/HomePage.tsx` の右カラム `<section aria-labelledby="projects-title">`
- `className` に `rounded-card bg-neutral-100 p-6` を追加する
  - ページ背景 `bg-bg`（= neutral-50）より一段濃くし、左カラムとの差を出す
  - 中のカードは `bg-surface-raised`（白）のままなので、カードが浮いて見える
- トークン追加なし（既存の `neutral-100` / `rounded-card` / `p-6` のみ）

## 2. ホーム：プロジェクトカードのタグを削除し、スライドを2枚プレビュー
- タグ削除: `HomePage.tsx` の「ケーススタディにできます」バッジと定数 `CASE_STUDY_READY_COUNT` を削除
- 仮スライド生成: `src/lib/slides.ts` に純粋関数 `buildProjectPreviewSlides(project, logs): Slide[]` を追加（AI応答ではなくテキスト整形なので mockAi.ts ではなくここに置く）
  - 1枚目（cover）: 見出し＝プロジェクト名、meta＝既存の `coverMeta(project, logs)` を再利用（期間・ログ件数）
  - 2枚目（section）: 見出し「最近のログ」、新しい順のログ本文を最大4行（既存の `clip` で切り詰め）。ログ0件なら「まだログがありません」の1行
- サムネイル表示: `src/components/SlidePreview.tsx` の `SlideBody` を export し、`size?: 'default' | 'thumb'` を追加
  - `thumb` は余白・文字を縮小（`p-3`、見出し `text-sm`、本文 `text-xs`、行数は `line-clamp` で抑える）
  - `default` は現状のまま（ケーススタディ画面の見た目は変えない）
- カード内: プロジェクト名・件数の下に `grid grid-cols-2 gap-2` で `aspect-video overflow-hidden rounded-card border border-border` の枠を2つ並べ、`SlideBody size="thumb"` を表示
  - カード全体がリンクなので、サムネイルは `aria-hidden="true"` の装飾扱いにする

## 3. プロジェクト詳細：キーワードタグの上下余白
- 対象: `src/pages/ProjectPage.tsx` のキーワード `<li>`（`rounded-badge border border-border px-2 ...`）
- `py-1`（4px）を追加する。Spacing scale の `1` なのでトークン追加なし

## 4. 面接用ページ `#/interview`（画面上の導線なし）
- ルーティング: `src/lib/useHashRoute.ts`
  - `Route` に `{ name: 'interview' }` を追加、`parseHash` で `interview` を判定、`paths.interview()` を追加
- `src/App.tsx`: `layoutWidths` に `interview: 'narrow'` を追加し、`<InterviewPage />` を描画。ヘッダーのナビには追加しない
- 新規 `src/pages/InterviewPage.tsx`（静的な読み物ページ。既存の `cardClass` と見出しスタイルを流用）
  1. 作成背景・課題（`documents/concept.md` の「目的とゴール」「課題の内容」）
  2. ペルソナ（`documents/userflow.md` の想定ユーザー）
  3. 提供価値と AI 活用の設計意図（concept.md 2章。記録→深掘り→活用の表、既存手段との違い）
  4. ビジネスモデル（concept.md 3章。プラン表・展開シナリオ・市場規模）
  5. MVP の範囲とデモ実装の割り切り（localStorage・AI はモック・Firebase へ差し替え前提）
  - 末尾に「アプリを触る」リンク（`paths.home()`）を置く
- 文言は concept.md / userflow.md から要約して日本語で書く（原体験など未記入の箇所は載せない）

## 検証
- `npm run lint` と `npm run build` が通ること
- `npm run dev` で確認:
  - ホーム：右カラムがグレー背景、各カードに表紙＋「最近のログ」の2枚が並ぶ／タグが消えている／ログ0件のプロジェクトでも崩れない
  - ケーススタディ画面のスライドプレビューの見た目が変わっていない
  - プロジェクト詳細：キーワードタグに上下4pxの余白
  - `#/interview` を直接開くと表示され、ヘッダーのナビには出ない／リロード・戻るでも表示される
