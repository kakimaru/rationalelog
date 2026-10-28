# 機能追加
## FBでもらった内容
サービス設計的の課題
- このサービスを使おうとするトリガーをどうするか
- 入力しようという気持ちになるかどうかの情緒的な部分がない
- ユーザーの記録に残したいという強い意志が求められる状態なのでやってみようとなりにくい

## やりたいこと
### 情緒的部分
- ログ入力部分にアニメーションを加えたい
  - 未入力の時は、サンプルの文章をplace holderの色のまま１文字ずつ入力されているように見せたい
  - その文章の入力が終わったら5秒ほど表示、その後また別の文章が１文字ずつ入力される
  - 3秒表示中にカテゴリと日付の列の上に深堀質問の例を1つずつ、最大3つ出したい



### サービス設計部分
- トリガーとしては先月の自分との比較など自己理解に重きを置きたい
- ログから分析した自分のスキルや思考の癖をmbtiや性格診断みたいな項目で社交的か内向的かなどのゲージで表示する
- スキルの分析チャートもあるといいかも
- プロジェクトの中で左からむをタブ形式にして、このプロジェクトでアピールできることとして分析結果を載せたい
- 分析の中でこの経験を作れると強いなどのアドバイスを入れたい

### ブランディング部分
- 内省/ポートフォリオとして、背景にぼかしたうっすら緑をベースにしたblobの滲みグラデーションが常に蠢くようなアニメーションを追加したい
- Well being系のゆとりのある雰囲気にして、最初のログ部分や各種フォームはChatGPTやClaudeなどのような入力フォームにしたい（textareaそのままではない見た目のイメージ）

# 実装計画

## Context
面接課題のFBで「使い始めるきっかけがない」「入力したくなる情緒的な部分がない」「記録への強い意志が前提になっている」と指摘された。
これに応えるため、次の3つを足す。
1. **情緒**：入力欄が「書き方の例」と「深掘り質問の例」を見せて、書き始めのハードルを下げる
2. **きっかけ（自己理解）**：ログから「先月の自分との比較」「思考の癖ゲージ」「スキルチャート」を出し、プロジェクトごとに「アピールできること」と「この経験を作れると強い」というアドバイスを出す
3. **ブランディング**：うっすら緑の blob が背景でゆっくり動き、入力欄とフォームを ChatGPT / Claude 風の一体型コンポーザーにする

### ユーザーと決めたこと
- 自己分析は新しい画面 `#/insights` に置く。ホームには先月比のサマリーカードと導線を置く
- プロジェクト詳細は2カラムにする（左：ログ / ケーススタディのタブ、右：アピールポイントの分析を常に表示）
- タイプ演出：打ち終わったら5秒止める。その5秒の間に深掘り質問の例を1つずつ（最大3つ）出し、次の文章へ進む
- トーンを変えるのは「背景の blob」と「入力欄・フォーム」だけ。カードなど既存のトークンはそのまま

### 守ること（CLAUDE.md）
- パッケージは追加しない。チャートは SVG を手で書き、アニメーションは CSS keyframes で作る
- 分析の文言・ロジックはすべて `src/lib/mockAi.ts` に置き、`Promise` を返す（待ち時間1秒）。分析を出す画面には `DemoNotice` を表示する
- 分析結果は保存しない（毎回ログから計算する）ので、storage に変更はない
- `style` 属性と `var()` の直書きは使わない。トークンを足すときは DESIGN.md の Decision log に追記する
- `prefers-reduced-motion` では、タイプ演出と blob を止めて静止表示にする

---

## Phase 1：ブランディング（背景の blob ＋ コンポーザー風の入力欄）

### トークン追加（`src/index.css` の `@theme`。DESIGN.md の Decision log に追記）
- `--radius-composer: 1.5rem` → `rounded-composer`（一体型の入力欄・フォームのフィールド用）
- `--animate-blob-drift-a/b/c`：3種類の keyframes（translate＋scale を 20〜30 秒で往復）→ `animate-blob-drift-a` など。`@keyframes` も `@theme` の中に書く（Tailwind v4 の書き方）
- `--animate-fade-in-up`：深掘り質問の例が出るときに使う（opacity と translateY、300ms 程度）
- blob の色は既存の `primary-100` / `primary-200` に透明度をつけて使う（`bg-primary-200/40` など）。新しい色は足さない

### 新規 `src/components/BackgroundBlobs.tsx`
- `fixed inset-0 -z-10 overflow-hidden pointer-events-none`、`aria-hidden`
- 大きな円を3つ、`blur-3xl`（ぼかしの量は一回限りの装飾値なので、必要ならコメント付きで直書きする）、`animate-blob-drift-*`、`motion-reduce:animate-none`
- `src/components/Layout.tsx` の最上位に置く。ヘッダーは `bg-surface-raised/80 backdrop-blur` にして、背景が少し透けるようにする

### `src/components/LogComposer.tsx` を一体型コンポーザーにする
- 外枠：`rounded-composer bg-surface-raised shadow-md border border-border focus-within:` に focus ring を合わせる（`styles.ts` に `composerClass` として追加）
- textarea は枠線なし・背景透明・`resize-none`。入力に合わせて高さが伸びる（`field-sizing-content` が使えれば使い、なければ scrollHeight で調整する）
- 下に1行のツールバー：左に種別チップと日付（小さく）、右に丸い送信ボタン（↑ アイコン、`aria-label="記録する"`）
- 送信は ⌘/Ctrl + Enter でもできるようにする

### モーダルのフォーム
- `styles.ts` に `softFieldClass` を足す（`rounded-composer bg-surface border-transparent`、フォーカスで focus ring）
- `DeepDiveModal` / `LogEditModal` / `ProjectFormModal` の `inputClass` を `softFieldClass` に変える。`inputClass` は残す（ケーススタディ編集で使っているため）

---

## Phase 2：入力欄のタイプ演出

### 新規 `src/lib/useTypewriter.ts`（UI ロジックだけで、文言は持たない）
- 入力：`samples: { text: string; questions: string[] }[]`、`active: boolean`
- 状態：`typing`（約60ms ごとに1文字）→ `holding`（5秒。開始から 0.8秒 / 2.2秒 / 3.6秒 に質問を1つずつ出す）→ 次のサンプルへ
- 出力：`{ visibleText, visibleQuestions }`
- `active=false`（入力がある）のときはタイマーを止めてリセットする。`prefers-reduced-motion` のときは全文と質問を最初からすべて出す（`matchMedia`）

### サンプル文章と質問の例
- サンプル文章（4〜5本。例：「トップの導線をカード型からリスト型に変えた。比較しやすさを優先」）と、その種別は `src/lib/composerSamples.ts` に UI の文言として置く
- 質問の例は AI の応答にあたるので、`mockAi.ts` の `DEEP_DIVE_QUESTIONS` から取る。`getDeepDiveQuestionsFor(type): string[]` という同期の小さな関数を export する（演出用。本番では固定の例のままでよい）。最大3つ出すため、各種別の質問を3つずつに増やす

### `LogComposer` への組み込み
- 本文が空のときは、textarea と同じ位置に `aria-hidden` の重ね表示を出す（`text-text-muted`、点滅するキャレット付き）。textarea の `placeholder` は空にし、ラベル（sr-only）で意味を伝える
- 質問の例は、種別・日付のツールバーの**上**に「AIはこんなふうに問いかけます」というチップとして `animate-fade-in-up` で出す
- 入力が始まったら重ね表示と質問を消す

---

## Phase 3：分析のモックと自己分析画面

### 型（`src/types.ts`）
```ts
type TraitAxis = { id: string; left: string; right: string; value: number /* -100〜100 */; comment: string };
type SkillScore = { id: string; label: string; current: number; previous: number | null /* 0〜100 */ };
type MonthlyComparison = { thisMonth: MonthStats; lastMonth: MonthStats | null; headline: string; notes: string[] };
type MonthStats = { logCount: number; deepDiveRate: number; typeCounts: Record<LogType | 'uncategorized', number> };
type SelfAnalysis = { enough: boolean; comparison: MonthlyComparison; traits: TraitAxis[]; skills: SkillScore[] };
type ProjectAnalysis = { enough: boolean; strengths: { title: string; evidence: string[] }[]; traits: TraitAxis[]; skills: SkillScore[]; advice: string[] };
```

### `src/lib/mockAi.ts` に追加（ルールベース。文言はすべてここに置く）
- `analyzeSelf(logs, projects): Promise<SelfAnalysis>`
- `analyzeProject(project, logs): Promise<ProjectAnalysis>`
- 共通の内部関数
  - **思考の癖ゲージ（4軸）**：直感 ⇔ 根拠（「データ・検証・テスト・数字」などの語）／ひとりで深める ⇔ 巻き込む（FB の割合、「相談・PM・エンジニア・レビュー」）／ユーザー視点 ⇔ ビジネス視点（「ユーザー・使いやすさ」⇔「売上・KPI・コスト」）／広げる ⇔ 決めきる（学びの件数 ⇔ 判断の件数）。値と、値の範囲ごとの固定コメントを返す
  - **スキル（6項目）**：リサーチ／情報設計／ビジュアル／合意形成／検証・改善／言語化（深掘りの回答率）。キーワードの出現数と種別から 0〜100 に丸める。`previous` は先月のログだけで計算する
  - **先月比**：今月と先月の件数・深掘り率・種別の内訳を比べ、増減に応じた `headline`（例：「先月より判断の記録が2件増えました」）を返す
- `analyzeProject` の `advice`：足りない種別・低いスキルから「この経験を作れると強い」を固定文で返す（例：成果のログがない →「リリース後の数字を1つ記録できると、成果を語れるケーススタディになります」）
- ログが3件未満のときは `enough: false` にし、画面で「あと n 件記録すると分析できます」と出す

### チャートの部品（新規。SVG のみ、色は `fill-primary-*` / `stroke-*` のクラス）
- `src/components/TraitGauge.tsx`：左右のラベル＋中央0の横バー＋現在地のマーカー。`role="meter"`、`aria-valuenow` 付き
- `src/components/SkillRadarChart.tsx`：6角形のレーダー。今月（塗り）と先月（破線）を重ねる。下に数値の表を置く（色だけに頼らない）

### 新規画面 `src/pages/InsightsPage.tsx`（`#/insights`）
- 上から：先月の自分との比較（headline と数字のカード）→ 思考の癖ゲージ → スキルチャート → `DemoNotice`
- 読み込み中は「ログを読み解いています…」（`role="status"`）
- ルーティング：`src/lib/useHashRoute.ts` に `{ name: 'insights' }` と `paths.insights()` を追加。`App.tsx` の `layoutWidths` は `wide`
- ヘッダー（`Layout.tsx`）に「自己分析」を追加し、`current` を `'about' | 'insights'` に広げる

### ホームの導線（`src/pages/HomePage.tsx`）
- 右カラムのプロジェクト一覧の上に「先月の自分と比べて」のサマリーカード（headline と件数の増減を1〜2行）と「自己分析を見る →」のリンクを置く

### サンプルデータ（`src/lib/actions.ts` の `addSampleData`）
- 今のサンプルは 1〜24 日前だけで、先月比が出ない。先月分（30〜50 日前）のログを数件足し、キーワードがスキル・ゲージに効くように本文を調整する

---

## Phase 4：プロジェクト詳細を2カラムに（`src/pages/ProjectPage.tsx`）
- `App.tsx` の `layoutWidths.project` を `narrow` → `wide` にする
- 上部（名前・説明・キーワード・件数・編集/削除）は全幅のまま
- `lg` 以上：`grid lg:grid-cols-3`。左 2/3 はタブ（「ログ」「ケーススタディ」）、右 1/3 は「このプロジェクトでアピールできること」（`sticky top-*`）
  - タブは `role="tablist"` / `tab` / `tabpanel`、矢印キーで切り替えられるようにする。見た目は既存の `ViewToggle` に合わせる（使い回せるか確認し、だめなら `Tabs.tsx` を新しく作る）
  - 「ケーススタディを作る」ボタンはケーススタディのタブの中に置く
- 右カラム：`analyzeProject` の結果（強みの見出しと根拠になったログの抜粋、ゲージ2〜4本、小さなレーダー、「この経験を作れると強い」のアドバイス）、`DemoNotice`
- ログを追加・編集したら（`onChange`）分析を取り直す

---

## Phase 5：仕様書の更新
- `documents/concept.md` の「MVPの範囲」に、AI機能 ④自己分析（先月比・ゲージ・スキル） ⑤プロジェクトのアピールポイントとアドバイスを足す
- `documents/features/screens/requirements.md`：`#/insights` の追加、プロジェクト詳細の2カラム＋タブ、ホームのサマリーカード
- `documents/features/log/requirements.md`：コンポーザーの見た目とタイプ演出の仕様（時間・reduced motion）
- 新規 `documents/features/insights/requirements.md`：分析の項目・算出ルール・データ不足のときの表示
- `DESIGN.md` の Decision log：`radius-composer`、`animate-*`、blob の使い方

---

## 主に変更するファイル
- 変更：`src/index.css`、`DESIGN.md`、`src/types.ts`、`src/lib/mockAi.ts`、`src/lib/actions.ts`、`src/lib/useHashRoute.ts`、`src/App.tsx`、`src/components/{Layout,LogComposer,styles,DeepDiveModal,LogEditModal,ProjectFormModal}.tsx/ts`、`src/pages/{HomePage,ProjectPage}.tsx`
- 新規：`src/components/{BackgroundBlobs,TraitGauge,SkillRadarChart}.tsx`、`src/lib/{useTypewriter,composerSamples}.ts`、`src/pages/InsightsPage.tsx`、`documents/features/insights/requirements.md`
- 使い回すもの：`DemoNotice`、`ViewToggle`、`cardClass` / `focusRing`（`styles.ts`）、`byNewest` / `daysAgoString`（`date.ts`）、`DEEP_DIVE_QUESTIONS` と `wait()`（`mockAi.ts`）

## 確認方法
1. `npm run lint` と `npm run build` が通る
2. `npm run dev` で手で確認する
   - ホーム：本文が空のとき、文章が1文字ずつ打たれる → 5秒止まる間に質問が最大3つ出る → 次の文章へ。1文字でも入力すると演出が消える。⌘+Enter で送信できる
   - OS の「視差効果を減らす」をオンにすると、blob とタイプ演出が止まって静止表示になる
   - localStorage を消して「サンプルデータを入れる」→ ホームのサマリーカードに先月比が出る → `#/insights` でゲージ・レーダー（今月と先月）・DemoNotice が出る
   - ログが3件未満のときは「あと n 件」と出る
   - プロジェクト詳細：2カラム、タブがキーボードで切り替わる、右にアピールポイントとアドバイス、ログを足すと分析が更新される。`lg` 未満では縦に積まれる
   - モーダルのフォームが角丸の柔らかい見た目になり、フォーカスリングが出る
