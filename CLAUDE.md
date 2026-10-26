# CLAUDE.md — AIへの全体ガイド

## このプロジェクトについて

転職面接課題「日々の何かを記録する（ログ）アプリ」のデモ実装です。
UI/UXデザイナーが日々の判断・FB・成果・学びを記録し、ケーススタディの下書きにまとめる **Rationale Log** を作ります。

- React + Vite + TypeScript + Tailwind CSS によるフロントエンドのみの実装
- ログインなし。データはブラウザの localStorage に保存する
- AI機能は外部APIを呼ばず、固定の文言を返すモックで再現する
- Vercel に静的サイトとしてデプロイする

評価されるのは完成度ではなく「設計意図」です。機能を増やすより、コンセプトに沿った体験が伝わることを優先してください。

## 仕様書の場所（Source of truth）

```
DESIGN.md                    ← デザイントークン・デザインルールの Source of truth
documents/
├── concept.md               ← 課題内容・ターゲット・価値・ビジネスモデル・MVP範囲
└── features/<機能名>/        ← 機能ごとの詳細仕様（必要になったら作成）
    └── requirements.md
```

- 実装前に必ず `documents/concept.md` の「MVPの範囲」を確認する
- UI を実装・変更する前に必ず `DESIGN.md` を確認する
- MVPの範囲外の機能（課金、チーム共有、認証など）は実装しない
- 仕様にない判断が必要な場合は、実装前にユーザーに確認する

## 開発ルール（必読・最優先）

### 禁止事項
- 外部APIの呼び出し・定義（Claude API などのAI API を含む）
- バックエンド処理（認証・メール送信・通知など）
- localStorage 以外の永続化（sessionStorage / Cookie / IndexedDB）

### データ永続化（localStorage）
- localStorage へのアクセスは `src/lib/storage.ts` だけで行う。コンポーネントから直接 `localStorage` を触らない
- 本番では Firebase（Auth + Firestore）に差し替える想定。差し替えられるよう、storage モジュールは CRUD 関数（`list` / `get` / `create` / `update` / `remove`）だけを公開する
- 読み込み時の JSON パース失敗や、localStorage が使えない環境に備え、try/catch で空データにフォールバックする
- 保存データには型を付け、キーは `rationale-log:` で始める

### AI機能（モック）
- AI 応答はすべて `src/lib/mockAi.ts` に集約する。コンポーネント内に応答文言を書かない
- 関数のシグネチャは本番の AI 呼び出しと同じ形（引数でログを受け取り、`Promise` で結果を返す）にする。将来はこのファイルの中身を差し替えるだけで済むようにする
- 体験を再現するため、短い待ち時間（1秒程度）を入れてよい
- AI 応答を表示する画面には「デモ版のため固定の応答です」と明示する

### 状態管理
- 画面の状態は React の `useState` / `useReducer` で管理する
- 永続化が必要なデータ（プロジェクト・ログ・ケーススタディ）は storage モジュール経由で読み書きする
- グローバルな状態管理ライブラリは導入しない

### パッケージ管理（絶対禁止）

以下のコマンドは **いかなる状況でも実行禁止**：
- `npm install` / `npm i` / `npx create-*` / `yarn add` / `pnpm add`
- 理由：npm サプライチェーン攻撃への対策

新しいパッケージ（ルーティングライブラリなど）が必要と判断した場合：
1. コマンドを実行せず、ユーザーに**提案だけ**する
2. パッケージ名・バージョン・選定理由・代替案（パッケージなしで実装する案を含む）を示す
3. ユーザーが手動で追加するまで待つ

使えるパッケージは `package.json` に記載済みのものに限る。不明な場合は `ls node_modules/` で確認すること。

### ディレクトリ構成
```
src/
├── components/   ← 再利用する UI 部品
├── pages/        ← 画面単位のコンポーネント
├── lib/
│   ├── storage.ts   ← localStorage アクセス（唯一の窓口）
│   └── mockAi.ts    ← AI 応答のモック（唯一の窓口）
├── types.ts      ← Project / Log / CaseStudy などの型定義
└── index.css     ← Tailwind と @theme トークン
```

### コーディング規約
- 型定義は厳格にする（`any` 禁止）
- 既存のコンポーネント構造と命名に従う
- UI の文言は日本語で書く
- コミット前に `npm run lint` と `npm run build`（型チェックを含む）を通す

## デザイン実装ルール

デザイントークンの値・名前・使い方は **`DESIGN.md` が Source of truth**。このセクションと食い違う場合は `DESIGN.md` を優先する。

### 基本方針
- デザイントークンは `DESIGN.md` の値を `src/index.css` の `@theme` ブロックに定義する（Tailwind v4 の名前空間への対応は `DESIGN.md` の「Tailwind CSS (v4) での実装」に従う）
- コンポーネントでは Tailwind クラスを使う。`var()` の直接参照や `style` 属性での値の直書きは禁止

| NG | OK |
|---|---|
| `style={{ color: '#319795' }}` | `text-primary-600` |
| `style={{ padding: '16px' }}` | `p-4` |
| `style={{ fontSize: '13px' }}` | `text-xs` |
| `bg-[var(--color-bg)]` | `bg-bg` |

### クラスの選び方
- レイアウトの色は番号付きの `neutral-*` より先にセマンティックカラー（`bg-bg` / `bg-surface-raised` / `text-text` / `text-text-muted` / `border-border` など）を使う
- 余白は `DESIGN.md` の Spacing scale に対応する10段階（`1, 2, 3, 4, 6, 8, 12, 16, 24, 32`）だけを使う
- 角丸はコンポーネント別トークン（`rounded-input` / `rounded-button` / `rounded-card` / `rounded-badge`）を優先する
- hover / active / focus / disabled は `DESIGN.md` の Interaction states に従う
- 必要な値がトークンにない場合は、最も近いトークンを選ぶ

### トークンを追加・変更する場合
- `DESIGN.md` の Change management に従い、既存トークンで表現できない場合だけ追加する
- `index.css` の `@theme` 以外にトークンを定義しない（例外: ダークモード時の値の上書きブロック）
- 命名は Tailwind の規則に従い、拡張は接頭辞付きで行う（`--color-brand-600` → `bg-brand-600`）。既存トークンを置き換えない
- 追加・変更したら `DESIGN.md` の Decision log に追記し、ユーザーに報告する（トークン名・値・生成されるクラス名・使用箇所）

### 例外
一回限りの装飾的な値（グラデーションの位置調整など）に限り直書きを認める。その場合は理由をコメントで明記する。

## 初期セットアップ（ユーザーが手動で実行）

Claude はこれらのコマンドを実行しない。ユーザーが実行するまで待つ。

```bash
npm create vite@latest . -- --template react-ts
npm install
npm install tailwindcss @tailwindcss/vite
```
