import type { ReactNode } from 'react';
import { Button } from '../components/Button';
import { LogTypeBadge } from '../components/LogTypeBadge';
import { focusRing } from '../components/styles';
import { paths } from '../lib/useHashRoute';
import type { LogType } from '../types';

// LP の文言はサービス紹介の固定テキスト（AI の応答ではない）なので、ページ内の定数として持つ

const PROBLEMS = [
  {
    title: '判断の理由を思い出せない',
    body: 'ポートフォリオや評価面談で問われるのは「なぜそうしたか」。でも書く段階になると、数ヶ月前の判断の経緯はもう思い出せません。',
  },
  {
    title: '経緯があちこちに散らばる',
    body: 'Figma のコメント、Slack、口頭の FB。判断の材料は日々の中に散らばり、プロジェクトが終わるころには消えていきます。',
  },
  {
    title: '日報のような記録は続かない',
    body: '「書くための記録」は負担が大きく、続いても後から使える形になっていません。守秘案件では成果物も見せられません。',
  },
];

const POINTS: { label: string; title: string; body: string; visual: ReactNode }[] = [
  {
    label: 'Point 01',
    title: '30秒で、一言だけ記録',
    body: '決めたこと・言われたこと・うまくいったこと・学んだことを、思いついたときに一言書くだけ。プロジェクトの振り分けは AI が候補を出し、あなたが確定します。',
    visual: <ComposerVisual />,
  },
  {
    label: 'Point 02',
    title: 'AI の問いかけで、判断の理由を深掘り',
    body: '「他にどんな案があった？」「何を根拠に選んだ？」。AI が代わりに書くのではなく、問いかけであなた自身の言葉を引き出します。思考の主体は、いつも本人に。',
    visual: <DeepDiveVisual />,
  },
  {
    label: 'Point 03',
    title: 'スライドにまとめて書き出す',
    body: '溜まったログを選ぶだけで、背景・課題・プロセス・判断理由・成果・学びの下書きに。そのまま発表用のスライドとしても確認できます。',
    visual: <SlideVisual />,
  },
];

const STEPS = [
  { title: '記録する', body: '判断・FB・成果・学びを一言記録。' },
  { title: '深掘りする', body: 'AIの問いかけに答えて理由を残す。' },
  { title: 'まとめる', body: 'ログからケーススタディとスライドを作る。' },
];

type Plan = {
  name: string;
  price: string;
  unit: string;
  description: string;
  features: string[];
  recommended?: boolean;
  available: boolean;
};

const PLANS: Plan[] = [
  {
    name: 'Free',
    price: '0円',
    unit: '',
    description: 'まずは記録の習慣づくりから',
    features: ['ログ記録は無制限', 'AI 深掘りは月10回まで', 'ケーススタディ生成は月1件まで'],
    available: true,
  },
  {
    name: 'Pro',
    price: '980円',
    unit: '/ 月',
    description: '転職や評価面談の準備に',
    features: ['AI 深掘り無制限', 'ケーススタディ生成無制限', '固有名詞を伏せた守秘版の生成', 'Markdown / PDF 出力'],
    recommended: true,
    available: false,
  },
  {
    name: 'Team',
    price: '1,500円',
    unit: '/ 人・月',
    description: 'デザイン組織の評価と育成に',
    features: ['Pro のすべての機能', '本人が公開した範囲での判断ログ共有', '評価面談・1on1 用のサマリー生成', 'チームのナレッジ化'],
    available: false,
  },
];

const FAQS = [
  {
    question: 'データはどこに保存されますか？',
    answer: 'デモ版では、お使いのブラウザの中（localStorage）にだけ保存され、外部には送信されません。正式版ではアカウントに紐づけてクラウドに保存する予定です。',
  },
  {
    question: 'AI はどのように使われていますか？',
    answer: 'AI は記録を代筆するのではなく、問いかけで判断の理由を引き出し、ケーススタディの形に整える役割です。デモ版では外部の AI は呼ばず、固定の応答で体験を再現しています。',
  },
  {
    question: '守秘義務のある案件でも使えますか？',
    answer: 'ログは本人だけが見られる前提で設計しています。Pro プランでは、固有名詞を伏せたケーススタディを作る機能を予定しています。',
  },
  {
    question: '毎日書かないといけませんか？',
    answer: 'いいえ。余裕のある日に一言だけで大丈夫です。カレンダーで記録した日を振り返れるので、無理なく続けられます。',
  },
];

const primaryLink = `inline-flex items-center justify-center rounded-button bg-primary-500 px-8 py-3 text-lg font-medium text-white shadow-sm hover:bg-primary-600 active:bg-primary-700 ${focusRing}`;
const secondaryLink = `inline-flex w-full items-center justify-center rounded-button border border-border-strong bg-surface-raised px-4 py-2 font-medium text-text hover:bg-neutral-100 active:bg-neutral-200 ${focusRing}`;
const container = 'mx-auto max-w-6xl px-6';

function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div className="mx-auto max-w-3xl space-y-4 text-center">
      <p className="text-sm font-bold tracking-widest text-primary-700">{eyebrow}</p>
      <h2 className="text-3xl">{title}</h2>
      {lead && <p className="text-md leading-relaxed text-text-muted">{lead}</p>}
    </div>
  );
}

export function AboutPage() {
  return (
    <div>
      {/* 1. ヒーロー */}
      <section aria-labelledby="hero-title" className="bg-surface-raised py-32">
        <div className={`${container} grid items-center gap-16 lg:grid-cols-2`}>
          <div className="space-y-8">
            <p className="text-lg font-bold tracking-widest text-primary-700">UI/UXデザイナーのお仕事ログ</p>
            <h1 id="hero-title" className="text-4xl">
              書き溜めたメモが、
              <br />
              そのまま語れる実績に
            </h1>
            <p className="text-md leading-relaxed text-text-muted">
              Rationale Log は、日々の「なぜそうしたか」を30秒で記録し、AI の問いかけで深掘りして、ケーススタディと発表用のスライドに育てるログアプリです。
            </p>
            <a href={paths.home()} className={primaryLink}>
              無料ではじめる
            </a>
          </div>
          <HeroVisual />
        </div>
      </section>

      {/* 2. 課題提起 */}
      <section aria-labelledby="problems-title" className="py-24">
        <div className={`${container} space-y-16`}>
          <div className="mx-auto max-w-3xl space-y-4 text-center">
            <p className="text-sm font-bold tracking-widest text-primary-700">PROBLEM</p>
            <h2 id="problems-title" className="text-3xl">
              「なぜそうしたか」は、
              <br className="sm:hidden" />
              すぐに忘れがち
            </h2>
          </div>
          <ul className="grid gap-8 md:grid-cols-3">
            {PROBLEMS.map((problem) => (
              <li key={problem.title} className="space-y-3 rounded-card bg-surface-raised p-8 shadow-md">
                <h3 className="text-lg">{problem.title}</h3>
                <p className="leading-relaxed text-text-muted">{problem.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 3. 機能紹介 */}
      <section className="bg-surface-raised py-24">
        <div className={`${container} space-y-24`}>
          <SectionHeading
            eyebrow="FEATURES"
            title="語れる実績まで一気通貫"
            lead="書く負担は小さく、後から使える形で。日々の記録をケーススタディにつなげる3つの機能です。"
          />
          {POINTS.map((point, i) => (
            <article key={point.label} className="grid items-center gap-12 lg:grid-cols-2">
              <div className={`space-y-4 ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                <p className="font-mono text-lg font-black text-primary-600">{point.label}</p>
                <h3 className="text-xl">{point.title}</h3>
                <p className="text-md leading-relaxed text-text-muted">{point.body}</p>
              </div>
              <div className="rounded-card bg-bg p-8">{point.visual}</div>
            </article>
          ))}
        </div>
      </section>

      {/* 4. 使い方 */}
      <section className="py-24">
        <div className={`${container} space-y-16`}>
          <SectionHeading eyebrow="HOW TO USE" title="使い方は3ステップ" />
          <ol className="grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="space-y-4 text-center">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary-100 font-mono text-xl font-bold text-primary-800">
                  {i + 1}
                </span>
                <h3 className="text-xl">{step.title}</h3>
                <p className="leading-relaxed text-text-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 5. 料金プラン */}
      <section className="bg-surface-raised py-24">
        <div className={`${container} space-y-16`}>
          <SectionHeading
            eyebrow="PRICING"
            title="料金プラン"
            lead="記録は無料で、ずっと無制限。まとめる力が必要になったら Pro へ。"
          />
          <ul className="grid items-stretch gap-8 md:grid-cols-3">
            {PLANS.map((plan) => (
              <li
                key={plan.name}
                className={`relative flex flex-col gap-6 rounded-card bg-surface-raised p-8 ${
                  plan.recommended ? 'border-2 border-primary-500 shadow-lg' : 'border border-border shadow-md'
                }`}
              >
                {plan.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-badge bg-primary-500 px-3 text-sm font-medium text-white">
                    おすすめ
                  </span>
                )}
                <div className="space-y-2">
                  <h3 className="text-xl">{plan.name}</h3>
                  <p className="text-sm text-text-muted">{plan.description}</p>
                </div>
                <p className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-heading">{plan.price}</span>
                  {plan.unit && <span className="text-sm text-text-muted">{plan.unit}</span>}
                </p>
                <ul className="flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2">
                      <span aria-hidden="true" className="text-primary-600">
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
                {plan.available ? (
                  <a href={paths.home()} className={secondaryLink}>
                    無料ではじめる
                  </a>
                ) : (
                  <Button disabled className="w-full">
                    準備中
                  </Button>
                )}
              </li>
            ))}
          </ul>
          <p className="text-center text-sm text-text-muted">※ デモ版のため価格は仮です。課金機能はありません。</p>
        </div>
      </section>

      {/* 6. FAQ */}
      <section className="py-24">
        <div className={`${container} space-y-16`}>
          <SectionHeading eyebrow="FAQ" title="よくある質問" />
          <div className="mx-auto max-w-3xl space-y-4">
            {FAQS.map((faq) => (
              <details key={faq.question} className="group rounded-card bg-surface-raised shadow-md">
                <summary
                  className={`flex cursor-pointer list-none items-center justify-between gap-4 rounded-card p-6 text-lg font-medium ${focusRing}`}
                >
                  <span>
                    <span aria-hidden="true" className="mr-2 font-mono text-primary-600">
                      Q.
                    </span>
                    {faq.question}
                  </span>
                  <span aria-hidden="true" className="text-text-muted group-open:rotate-45">
                    ＋
                  </span>
                </summary>
                <p className="px-6 pb-6 leading-relaxed text-text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 7. 最終CTA */}
      <section aria-labelledby="final-cta-title" className="bg-primary-800 py-32 text-white">
        <div className="mx-auto max-w-3xl space-y-8 px-6 text-center">
          <h2 id="final-cta-title" className="text-2xl">
            今日の判断を、一言だけ残してみませんか
          </h2>
          <p className="text-md leading-relaxed text-primary-100">
            登録は不要です。デモ版はこのブラウザだけで、すぐに試せます。
          </p>
          <a href={paths.home()} className={primaryLink}>
            無料ではじめる
          </a>
        </div>
      </section>

      {/* 8. フッター */}
      <footer className="border-t border-border bg-surface-raised py-12">
        <div className={`${container} flex flex-wrap items-center justify-between gap-4`}>
          <p className="text-lg font-bold font-heading">Rationale Log</p>
          <p className="text-sm text-text-muted">
            このサイトは転職面接課題のデモ版です。データはお使いのブラウザにだけ保存されます。
          </p>
        </div>
      </footer>
    </div>
  );
}

// ---------- アプリ画面のイメージ（画像を使わず、実際の UI 部品の見た目で描く） ----------

function MiniLog({ type, project, body }: { type: LogType | null; project: string; body: string }) {
  return (
    <li className="space-y-1 px-4 py-3">
      <div className="flex items-center gap-2 text-sm text-text-muted">
        <LogTypeBadge type={type} />
        {project}
      </div>
      <p className="text-sm">{body}</p>
    </li>
  );
}

function HeroVisual() {
  return (
    <div aria-hidden="true" className="space-y-4 rounded-card bg-bg p-6 shadow-lg">
      <div className="rounded-card bg-surface-raised p-4 shadow-md">
        <p className="text-sm text-text-muted">今日やったこと、決めたこと、言われたことを一言で</p>
        <div className="mt-3 flex justify-end">
          <span className="rounded-button bg-primary-500 px-3 py-1 text-sm font-medium text-white">記録する</span>
        </div>
      </div>
      <ul className="divide-y divide-border rounded-card bg-surface-raised shadow-md">
        <MiniLog type="decision" project="デザインシステム刷新" body="トークン名を役割ベースに統一すると決めた" />
        <MiniLog type="feedback" project="オンボーディング改善" body="PM から「ヒントが多すぎないか」と指摘" />
        <MiniLog type="outcome" project="オンボーディング改善" body="7日継続率が 42% から 51% に上がった" />
      </ul>
    </div>
  );
}

function ComposerVisual() {
  return (
    <div aria-hidden="true" className="space-y-3 rounded-card bg-surface-raised p-6 shadow-md">
      <p className="rounded-input border border-border px-3 py-2">ボタンのバリエーションを棚卸しした</p>
      <div className="flex flex-wrap gap-2">
        {(['decision', 'feedback', 'outcome', 'learning'] as const).map((type) => (
          <LogTypeBadge key={type} type={type} />
        ))}
      </div>
      <p className="rounded-md bg-primary-50 px-3 py-2 text-sm text-primary-800">
        AI の提案：「デザインシステム刷新」に振り分けますか？
      </p>
    </div>
  );
}

function DeepDiveVisual() {
  return (
    <div aria-hidden="true" className="space-y-3">
      <p className="w-4/5 rounded-card bg-surface-raised p-4 text-sm shadow-md">
        <span className="mr-2 rounded-badge bg-primary-100 px-2 font-medium text-primary-800">AI</span>
        他にどんな案がありましたか？
      </p>
      <p className="ml-auto w-4/5 rounded-card bg-primary-500 p-4 text-sm text-white shadow-md">
        色ベースの命名も検討したが、ダークモードで意味がずれるため役割ベースにした
      </p>
      <p className="w-4/5 rounded-card bg-surface-raised p-4 text-sm shadow-md">
        <span className="mr-2 rounded-badge bg-primary-100 px-2 font-medium text-primary-800">AI</span>
        何を根拠に選びましたか？
      </p>
    </div>
  );
}

function SlideVisual() {
  return (
    <div aria-hidden="true" className="grid grid-cols-2 gap-4">
      <div className="flex aspect-video flex-col justify-end rounded-md bg-primary-800 p-3 text-white shadow-md">
        <p className="text-xs text-primary-200">CASE STUDY</p>
        <p className="text-sm font-bold">デザインシステム刷新</p>
      </div>
      {['背景', '課題', '判断理由'].map((heading, i) => (
        <div key={heading} className="flex aspect-video flex-col gap-2 rounded-md bg-surface-raised p-3 shadow-md">
          <p className="border-b border-primary-500 pb-1 text-xs font-bold">
            <span className="mr-1 font-mono text-primary-600">{String(i + 1).padStart(2, '0')}</span>
            {heading}
          </p>
          <span className="h-1 w-4/5 rounded-full bg-neutral-200" />
          <span className="h-1 w-3/5 rounded-full bg-neutral-200" />
        </div>
      ))}
    </div>
  );
}
