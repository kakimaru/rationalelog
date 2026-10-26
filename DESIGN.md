# Design System Source of Truth

## Intent
- Overall feeling: green-led, balanced, compact
- Target context: general
- Decisions made: typography, spacing, radius, shadow, color

## Typography
- Base font size: 14px (SP) / 16px (Web)
- Modular scale ratio: 1.25 (major third)
- Font pairing: Modern Sans — Inter throughout — neutral, dense, universal. Japanese glyphs fall back to the OS default gothic (Hiragino on macOS/iOS, Yu Gothic etc. on Windows).
- Pairing structure: single-family system (Modern Sans) — heading and body share the typeface for unity. Same family on SP and Web.
- Rationale: compact body with clear hierarchy — internal tools that still want some reading comfort
- Responsive rule: the type scale below applies to SP (viewport < 768px). From 768px up, the Web type scale replaces the same token names. Minimum font size on Web is 12px.

### Type scale (SP — viewport < 768px)
```css
--font-size-xs: 0.56rem;
--font-size-sm: 0.7rem;
--font-size-base: 0.875rem;
--font-size-lg: 1.0938rem;
--font-size-xl: 1.3672rem;
--font-size-2xl: 1.709rem;
--font-size-3xl: 2.1362rem;
--font-size-4xl: 2.6703rem;
```

### Type scale (Web — viewport ≥ 768px)
- Base font size: 16px. Modular scale ratio: 1.25 (major third).
- Rationale: at desktop reading distance the SP scale (`xs` 8.96px / `sm` 11.2px) is too small. Base 16px keeps body copy readable without feeling oversized (18px was tried and felt too large); the smallest step is clamped to 12px.

```css
--font-size-xs: 0.75rem;    /* 12px — 1.25 比なら 0.64rem(10.24px) だが Web の最小 12px に切り上げ */
--font-size-sm: 0.8rem;     /* 12.8px — caption */
--font-size-base: 1rem;     /* 16px — body */
--font-size-lg: 1.25rem;    /* 20px */
--font-size-xl: 1.5625rem;  /* 25px — h4 */
--font-size-2xl: 1.9531rem; /* 31.25px — h3 */
--font-size-3xl: 2.4414rem; /* 39.06px — h2 */
--font-size-4xl: 3.0518rem; /* 48.83px — h1 */
```

Line heights, font families and weights are shared between SP and Web.

### Special-purpose type token
```css
--font-size-thumb: 0.5rem; /* 8px — slide thumbnails only. Fixed on SP and Web (not part of the Web override) */
```
- Use only for miniature previews of slides (e.g. project cards on Home). Never for readable UI text; the Web 12px minimum applies to everything else.

### Line heights
```css
--line-height-tight: 1.275;
--line-height-normal: 1.58;
--line-height-relaxed: 1.73;
```

### Font families
```css
--font-family-heading: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-body: 'Inter', system-ui, -apple-system, sans-serif;
--font-family-mono: 'JetBrains Mono', ui-monospace, monospace;
```

### Font weights
```css
--font-weight-body: 400;
--font-weight-body-strong: 500;
--font-weight-heading: 700;
```

## Spacing
- Base unit: 8px
- Scale approach: linear
- Rationale: Balanced, familiar web rhythm — wide compatibility and predictable density.

### Spacing scale
```css
--space-2xs: 0.25rem;
--space-xs: 0.5rem;
--space-sm: 0.75rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;
--space-3xl: 4rem;
--space-4xl: 6rem;
--space-5xl: 8rem;
```

### Component defaults
```css
--space-button-padding-x: 1rem;
--space-button-padding-y: 0.5rem;
--space-card-padding: 1.5rem;
--space-input-padding-x: 0.75rem;
--space-input-padding-y: 0.5rem;
--space-section-gap: 4rem;
--space-stack-gap: 1rem;
```

## Radius
- Base radius: 4px (subtle)
- Scale approach: scaled
- Rationale: softened but sober — per-component variation that reinforces shape roles (inputs crisper, cards softer).

### Radius scale
```css
--radius-none: 0;
--radius-sm: 0.125rem;
--radius-md: 0.25rem;
--radius-lg: 0.375rem;
--radius-xl: 0.5rem;
--radius-full: 9999px;
```

### Per-component variables
```css
--radius-input: 0.125rem;
--radius-button: 0.25rem;
--radius-card: 0.375rem;
--radius-badge: 9999px;
```

## Shadow / Elevation
- Intensity: subtle
- Tinted: no (neutral black)
- Rationale: quiet hierarchy without depth theater.

### Shadow scale
```css
--shadow-sm: 0 1px 2px 0 oklch(0% 0 0 / 0.06);
--shadow-md: 0 4px 6px -1px oklch(0% 0 0 / 0.08), 0 2px 4px -2px oklch(0% 0 0 / 0.08);
--shadow-lg: 0 10px 15px -3px oklch(0% 0 0 / 0.1), 0 4px 6px -4px oklch(0% 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px oklch(0% 0 0 / 0.12), 0 8px 10px -6px oklch(0% 0 0 / 0.12);
```

### Elevation hierarchy
`dropdown` (sm) < `card` (md) < `modal` (lg) < `toast` (xl)

## Color
- Approach: green-led, balanced
- Primary hue: 140° (green)
- Chroma level: balanced
- Neutral style: cool
- Dark mode: supported
- Rationale: A green-led palette, confident and modern, paired with clinical, technical cool. Dark mode is supported.

### Primary palette
```css
--color-primary-50: oklch(98.5% 0.021 140);
--color-primary-100: oklch(96% 0.042 140);
--color-primary-200: oklch(90% 0.077 140);
--color-primary-300: oklch(82% 0.112 140);
--color-primary-400: oklch(72% 0.133 140);
--color-primary-500: oklch(62% 0.14 140);
--color-primary-600: oklch(52% 0.133 140);
--color-primary-700: oklch(42% 0.112 140);
--color-primary-800: oklch(32% 0.091 140);
--color-primary-900: oklch(22% 0.063 140);
--color-primary-950: oklch(15% 0.049 140);
```

### Neutral palette
```css
--color-neutral-50: oklch(98.5% 0.0021 240);
--color-neutral-100: oklch(96% 0.0042 240);
--color-neutral-200: oklch(90% 0.0077 240);
--color-neutral-300: oklch(82% 0.0112 240);
--color-neutral-400: oklch(72% 0.0133 240);
--color-neutral-500: oklch(62% 0.014 240);
--color-neutral-600: oklch(52% 0.0133 240);
--color-neutral-700: oklch(42% 0.0112 240);
--color-neutral-800: oklch(32% 0.0091 240);
--color-neutral-900: oklch(22% 0.0063 240);
--color-neutral-950: oklch(15% 0.0049 240);
```

### Semantic surface roles
```css
--color-bg: var(--color-neutral-50);
--color-surface: var(--color-neutral-50);
--color-surface-raised: oklch(100% 0 0);
--color-text: var(--color-neutral-900);
--color-text-muted: var(--color-neutral-600);
--color-border: var(--color-neutral-200);
--color-border-strong: var(--color-neutral-300);
```

### Semantic colors
```css
--color-success-500: oklch(60% 0.133 145);
--color-warning-500: oklch(72% 0.133 80);
--color-danger-500:  oklch(60% 0.133 25);
--color-info-500:    oklch(60% 0.133 240);
```

### Interaction states (derived)
- `hover`: lightness -5%
- `active`: lightness -10%
- `focus`: `2px solid var(--color-primary-500)` with offset `2px`
- `disabled`: opacity 40%

### Dark variants
```css
--color-primary-dark-50: oklch(15% 0.049 140);
--color-primary-dark-100: oklch(22% 0.063 140);
--color-primary-dark-200: oklch(32% 0.091 140);
--color-primary-dark-300: oklch(42% 0.112 140);
--color-primary-dark-400: oklch(52% 0.133 140);
--color-primary-dark-500: oklch(62% 0.14 140);
--color-primary-dark-600: oklch(72% 0.133 140);
--color-primary-dark-700: oklch(82% 0.112 140);
--color-primary-dark-800: oklch(90% 0.077 140);
--color-primary-dark-900: oklch(96% 0.042 140);
--color-primary-dark-950: oklch(98.5% 0.021 140);
```

```css
--color-neutral-dark-50: oklch(15% 0.0049 240);
--color-neutral-dark-100: oklch(22% 0.0063 240);
--color-neutral-dark-200: oklch(32% 0.0091 240);
--color-neutral-dark-300: oklch(42% 0.0112 240);
--color-neutral-dark-400: oklch(52% 0.0133 240);
--color-neutral-dark-500: oklch(62% 0.014 240);
--color-neutral-dark-600: oklch(72% 0.0133 240);
--color-neutral-dark-700: oklch(82% 0.0112 240);
--color-neutral-dark-800: oklch(90% 0.0077 240);
--color-neutral-dark-900: oklch(96% 0.0042 240);
--color-neutral-dark-950: oklch(98.5% 0.0021 240);
```

## Usage guidelines

- Primary actions: `var(--color-primary-500)`; on hover `var(--color-primary-600)`; on active `var(--color-primary-700)`
- Page background: `var(--color-bg)`; elevated panels use `var(--color-surface-raised)`; body copy uses `var(--color-text)`
- Cards: `var(--radius-card)` with `var(--shadow-md)`
- Buttons: `var(--radius-button)` with `var(--shadow-sm)` on the primary variant
- Inputs: `var(--radius-input)`; focus ring uses the interaction-states spec
- Body text: `var(--font-size-base)` with `var(--line-height-normal)`
- Section spacing: `var(--space-3xl)` between major blocks
- Stack spacing within a block: `var(--space-md)`

## Mode scope

- Mode: light and dark tokens are included. Use the dark variants when implementing dark mode.

## What this design system is NOT

- Not a component library specification — tokens only
- Not opinionated about responsive breakpoints, except the type scale switch at 768px (SP → Web)
- Extend these tokens via prefixed custom properties (`--color-brand-*`), do not replace

## Change management

- Treat this file as v1 of the project's design source of truth.
- Add new tokens only when the nearest existing token cannot represent the need.
- Deprecate tokens by keeping the old token, documenting the replacement, migrating consumers, then removing it in a later change.
- Record new base decisions in an appended "Decision log" section with context.

## Generation instructions for AI

When using this DESIGN.md:
1. Treat the listed values as authoritative; do not re-derive from preference.
2. When a component needs a value not listed here, pick the nearest available token.
3. If a new decision is required, document it in an appended section and flag it clearly.
4. Preserve the rationale comments — they encode design intent and should guide new decisions in unlisted contexts.
5. Interaction states are derived rules, not hard-coded values — apply them procedurally.
6. Use the semantic surface roles for layout-level color choices before reaching directly into numbered neutral tokens.

---

## Tailwind CSS (v4) での実装

上記のトークン名は「設計上の名前」です。実装では Tailwind v4 の `@theme` 名前空間に合わせて定義し、コンポーネントでは **Tailwind のクラスで参照** します（`var()` の直接参照や `style` 属性への値の直書きはしない）。値は上記から変えないこと。

### トークン名 → `@theme` 変数 → クラスの対応

| DESIGN.md のトークン | `@theme` に書く変数 | 使うクラス |
|---|---|---|
| `--font-size-{xs…4xl}` | `--text-{xs…4xl}`（値を上書き。`@theme` には SP の値、Web の値は下記の上書きブロック） | `text-xs` 〜 `text-4xl` |
| `--font-size-thumb` | `--text-thumb`（SP / Web 共通。上書きブロックに入れない） | `text-thumb` |
| `--line-height-{tight,normal,relaxed}` | `--leading-{tight,normal,relaxed}` | `leading-tight` / `leading-normal` / `leading-relaxed` |
| `--font-family-heading` / `-body` / `-mono` | `--font-heading` / `--font-sans`（body） / `--font-mono` | `font-heading` / `font-sans` / `font-mono` |
| `--font-weight-body` / `-body-strong` / `-heading` | 定義しない（Tailwind 既定値と一致） | `font-normal`(400) / `font-medium`(500) / `font-bold`(700) |
| `--space-*` | 定義しない（Tailwind 既定 `--spacing: 0.25rem` の倍数と一致） | 下表参照 |
| `--radius-{none…full}` | `--radius-{none,sm,md,lg,xl,full}`（値を上書き） | `rounded-sm` 〜 `rounded-xl` / `rounded-full` |
| `--radius-{input,button,card,badge}` | 同名で追加 | `rounded-input` / `rounded-button` / `rounded-card` / `rounded-badge` |
| `--shadow-{sm…xl}` | 同名（値を上書き） | `shadow-sm` 〜 `shadow-xl` |
| `--color-primary-*` / `--color-neutral-*` | 同名 | `bg-primary-500` / `text-neutral-600` など |
| セマンティックカラー（`--color-bg` など） | 同名 | `bg-bg` / `bg-surface` / `bg-surface-raised` / `text-text` / `text-text-muted` / `border-border` / `border-border-strong` |
| `--color-{success,warning,danger,info}-500` | 同名 | `text-danger-500` など |

> font-weight と spacing を独自名で定義しない理由: Tailwind v4 では `--font-*` と `--font-weight-*` がどちらも `font-*` クラスを生成して衝突し、`--spacing-md` などの名前付き spacing は `max-w-md` などのサイズ系クラスにも影響するため。値は既定ユーティリティと完全に一致するので、既定クラスを使う。

### Spacing の対応

| トークン | 値 | クラス（例） |
|---|---|---|
| `2xs` | 0.25rem | `p-1` / `gap-1` |
| `xs` | 0.5rem | `p-2` |
| `sm` | 0.75rem | `p-3` |
| `md` | 1rem | `p-4` |
| `lg` | 1.5rem | `p-6` |
| `xl` | 2rem | `p-8` |
| `2xl` | 3rem | `p-12` |
| `3xl` | 4rem | `p-16` |
| `4xl` | 6rem | `p-24` |
| `5xl` | 8rem | `p-32` |

**この10段階以外の数値（`p-5`, `p-7`, `p-10` など）は使わない。**

| コンポーネント既定値 | クラス |
|---|---|
| ボタン | `px-4 py-2` |
| カード | `p-6` |
| 入力欄 | `px-3 py-2` |
| セクション間 | `gap-16` / `mt-16` |
| ブロック内の積み重ね | `gap-4` / `space-y-4` |

### Usage guidelines のクラス表現

| 用途 | クラス |
|---|---|
| プライマリボタン | `bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-button shadow-sm px-4 py-2` |
| ページ背景・本文 | `bg-bg text-text text-base leading-normal font-sans` |
| 浮いたパネル | `bg-surface-raised` |
| カード | `bg-surface-raised rounded-card shadow-md p-6` |
| 入力欄 | `rounded-input border border-border px-3 py-2` |
| フォーカス | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500` |
| 無効状態 | `disabled:opacity-40` |
| 見出し | `font-heading font-bold leading-tight` |

`text-white` は `--color-white` として `oklch(100% 0 0)` を定義して使う（`--color-*: initial` で既定色を消すため）。

### `@theme` の書き方（抜粋）

```css
@import "tailwindcss";

@theme {
  /* Tailwind 既定のカラーパレットを無効化し、DESIGN.md の色だけを使えるようにする */
  --color-*: initial;
  --color-white: oklch(100% 0 0);

  --color-primary-50: oklch(98.5% 0.021 140);
  /* … primary / neutral / semantic は DESIGN.md の値をそのまま転記 … */
  --color-bg: var(--color-neutral-50);
  --color-surface-raised: oklch(100% 0 0);

  --text-xs: 0.56rem;
  /* … --text-sm 〜 --text-4xl … */
  --leading-tight: 1.275;
  --leading-normal: 1.58;
  --leading-relaxed: 1.73;

  --font-heading: 'Inter', system-ui, -apple-system, sans-serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --radius-sm: 0.125rem;
  /* … --radius-md 〜 --radius-xl、--radius-input / button / card / badge … */

  --shadow-sm: 0 1px 2px 0 oklch(0% 0 0 / 0.06);
  /* … --shadow-md 〜 --shadow-xl … */
}
```

- セマンティックカラーは `var()` で番号付きトークンを参照するため、`@theme inline` ではなく **`@theme`** を使う（ダークモードでの差し替えが効くようにするため）。
- ダークモードの Dark variants は `@theme` に定義せず、ダーク時に `--color-primary-*` / `--color-neutral-*` の値を Dark variants の値で上書きする（例: `@media (prefers-color-scheme: dark) { :root { --color-neutral-50: oklch(15% 0.0049 240); … } }`）。コンポーネント側は同じクラスのままでダーク対応になる。この上書きブロックは `@theme` 外での定義を認める例外とする。
- Web の型スケールも同じ方式にする。`@theme` には SP の値を定義し、`@media (width >= 48rem) { :root { --text-xs: 0.75rem; … } }` で Web の値に上書きする（48rem = 768px = Tailwind の `md`）。コンポーネント側は `md:text-*` を書かず、同じ `text-*` クラスのままで画面幅に応じたサイズになる。`@theme` 外での定義を認める例外は、ダークモードとこの Web 型スケールの2つだけとする。

## Decision log

### 2026-10-26 — Tailwind v4 へのマッピング
- Context: 本プロジェクトは Tailwind CSS v4 を使うため、上記トークンを `@theme` 名前空間に合わせる必要がある。
- Decision: 「Tailwind CSS (v4) での実装」節のとおり。値は変更せず、名前のみ Tailwind の規則に合わせた。font-weight と spacing は既定ユーティリティと値が一致するため独自定義しない。

### 2026-10-26 — Tailwind 既定トークンの無効化と行間の扱い
- Context: Tailwind の既定値（`text-sm` の行間、`rounded-2xl`、`shadow-2xl` など）が残ると、DESIGN.md にない値が使えてしまう。
- Decision: `src/index.css` で `--color-*` / `--text-*` / `--radius-*` / `--shadow-*` を `initial` にリセットしてから定義する。`--text-*` には行間を紐づけない。行間は `body` の `leading-normal` を継承し、見出し（h1〜h4）は `leading-tight` にする。必要に応じて `leading-*` で指定する。

### 2026-10-26 — ⚠️ 未決定: ダークモード時の `surface-raised`
- Context: `--color-surface-raised` は `oklch(100% 0 0)`（純白）の固定値で、ダークモードの差し替え対象に含まれない。そのままだとダーク時に白いパネルが残る。
- Proposal: ダーク時は `--color-surface-raised: var(--color-neutral-100)`（= `oklch(22% 0.0063 240)`、背景より一段明るい）とする。ダークモードを実装する際にユーザーの確認を取ってから確定する。

### 2026-10-26 — Web 用の型スケールを追加（SP / Web の2段構成）
- Context: Web 表示で `text-sm`（11.2px）や `text-xs`（8.96px）が小さすぎて読みにくい（`documents/fontsize-refine.md`）。
- Decision: 既存の型スケール（基準 14px）を SP（768px 未満）用とし、768px 以上では基準 18px・比率 1.25 の Web 型スケールに切り替える。Web の最小は 12px とし、`xs` は計算値 0.72rem を 0.75rem に切り上げる。トークン名は変えず、`:root` のメディアクエリで `--text-*` の値だけを上書きする。行間・書体・ウェイト・色・余白・角丸・影は変更しない。
- Breakpoint: 768px（Tailwind の `md`）。タブレット縦以上を「Web」として扱う。

### 2026-10-26 — Web 型スケールの基準を 18px → 16px に変更
- Context: 基準 18px では Web 表示の文字が大きすぎた（`documents/fontsize-refine.md` を更新）。
- Decision: Web 型スケールの基準を 16px（比率 1.25 は維持）にする。`xs` は計算値 0.64rem（10.24px）を最小 12px（0.75rem）に切り上げる。ブレークポイント（768px）と SP の値は変更しない。

### 2026-10-26 — 書体を Zen Kaku Gothic New → Inter に変更
- Context: 更新後の `documents/fontsize-refine.md` で書体が Inter（`'Inter', system-ui, -apple-system, sans-serif`）に変わった。
- Decision: heading / body ともに Inter にする。SP / Web で同じ書体を使う（画面幅で書体が切り替わると不自然なため）。Inter には日本語グリフがないため、日本語は OS 標準のゴシック体で表示する（Zen Kaku Gothic New の読み込みはやめる）。OS によって日本語の見た目が変わることは許容する。
- Implementation: `index.html` で Google Fonts の Inter（400 / 500 / 700）を読み込む。`--font-heading` / `--font-sans` の値を上記に変更。

### 2026-10-26 — スライドのサムネイル用に `--text-thumb`（8px）を追加
- Context: ホームのプロジェクトカードにスライドを縮小表示する（`documents/tiny-modify.md`）。最小の `text-xs`（SP 8.96px / Web 12px）ではカード内の小さな枠に収まらず、縮小版に見えない。
- Decision: サムネイル専用のトークン `--font-size-thumb: 0.5rem`（8px）を追加する。読ませる文字ではなく縮小表示なので、Web の最小 12px の例外とし、SP / Web で同じ値にする。既存の型スケールは変更しない。
- Implementation: `@theme` に `--text-thumb: 0.5rem` を追加（クラス `text-thumb`）。使用箇所は `SlidePreview.tsx` の `SlideBody`（`size="thumb"`）のみ。
