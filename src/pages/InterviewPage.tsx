import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Button } from '../components/Button';
import { focusRing } from '../components/styles';
import { paths } from '../lib/useHashRoute';

// 面接で見せるためのスライド形式のページ。画面上の導線は置かず、#/interview を直接開いて使う。
// 左の目次で任意のスライドへ飛び、スライド下のボタン・左右キーで前後に送る。
// 内容は documents/concept.md と documents/userflow.md の要約。

const PERSONA = [
  'UI/UX デザイナー。実務 3〜5 年目',
  'いずれ副業（業務委託・スポット案件）を始めたいと考えている',
  '応募にポートフォリオが必要だとわかっているが、なんとなく後回しにしてしまう',
  '業務中は記録する余裕がない。プロジェクトが終わった節目などで思い出して書く程度',
  '守秘義務のある案件が多く成果物の画像は出せない',
];

const AS_IS_TO_BE = [
  { scene: '記録', asIs: '求職においては何を書けばいいかわからず、手が止まる', toBe: 'ざっくり一言書けば、AI が問いかけて判断理由を引き出す' },
  { scene: '整理', asIs: 'プロジェクトごとに分けるのが面倒', toBe: 'AI がプロジェクト候補を出すので、確定するだけで済む' },
  { scene: '活用', asIs: '応募するときには記憶が薄れ、まとめるのに時間がかかる', toBe: '溜まったログから、ケーススタディの下書きがすぐ出る' },
];

const PROBLEMS = [
  'ポートフォリオや評価面談で問われるのは「課題をどう捉え、なぜその判断をしたか」。しかし整理するタイミングが後になってしまい細かい判断理由を思い出せないことがある',
  '判断の経緯は Figma のコメント・Slack・口頭 FB に散らばって消え、数ヶ月経つと再現できない',
  '日報や日記のような「書くための記録」は続かず、書いても後から使える形になっていない',
  '守秘義務で成果物を見せられない案件も多く、プロセスを語れないと実績がないのと同じ扱いになる',
];

const PHASES = [
  { phase: '記録', user: '判断・FB・成果・学びを書く', ai: 'プロジェクトの候補を提案し整理をサポート' },
  { phase: '深掘', user: 'AI の問いかけに答える', ai: '「他にどんな案があった？」などを質問し、判断理由を引き出す' },
  { phase: '活用', user: 'プロジェクト単位でログを選ぶ', ai: 'ケーススタディ（背景/課題/プロセス/判断理由/成果/学び）の下書きを生成する' },
];

const PLANS = [
  { name: 'Free', price: '0円', body: 'ログ記録は無制限。AI 深掘りは月10回、ケーススタディ生成は月1件まで' },
  { name: 'Pro', price: '月980円', body: 'AI 深掘り・ケーススタディ生成が無制限。守秘版の生成、Markdown/PDF 出力' },
  { name: 'Team（B2B）', price: '1人あたり月1,500円', body: '本人が公開した範囲で判断ログを共有。評価面談・1on1 用のサマリー、チームのナレッジ化' },
];

const MARKET = [
  { label: 'TAM', body: '国内のデザイナー 約20万人 × 年1.2万円 ≒ 約24億円' },
  { label: 'SAM', body: 'うちデジタル領域のデザイナー 約0.5〜1.7万人 × 年1.2万円 ≒ 約0.6〜2億円' },
  { label: 'SOM（3年目）', body: 'Pro 1,000人（約1,200万円/年）＋ Team 30社 × 10人（約540万円/年）' },
];

const thClass = 'border-b border-border px-3 py-2 text-left text-sm font-medium text-text-muted';
const tdClass = 'border-b border-border px-3 py-2 align-top';

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 leading-relaxed">
          <span aria-hidden="true" className="text-primary-600">
            ●
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

type SlideContent = {
  id: string;
  eyebrow: string;
  title: string;
  body: ReactNode;
};

const SLIDES: SlideContent[] = [
  {
    id: 'cover',
    eyebrow: 'FOR INTERVIEW',
    title: 'Rationale Log の設計意図',
    body: (
      <p className="text-lg leading-relaxed text-text-muted">
        デザイナーの「なぜそうしたか（Design Rationale）」を毎日30秒で記録し、AI がケーススタディに育てるログアプリです。
      </p>
    ),
  },
  {
    id: 'background',
    eyebrow: '01',
    title: '作成背景',
    body: (
      <>
        <p className="leading-relaxed">
          面接課題「日々の何かを記録する（ログ）アプリ」として作成しました。評価されるのは完成度ではなく、設計意図だと判断し機能を増やすより、コンセプトに沿った体験が伝わることを優先しています。
        </p>
        <h3 className="text-lg">着目した課題</h3>
        <BulletList items={PROBLEMS} />
      </>
    ),
  },
  {
    id: 'persona',
    eyebrow: '02',
    title: 'ペルソナ',
    body: (
      <>
        <BulletList items={PERSONA} />
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}>場面</th>
                <th className={thClass}>as-is</th>
                <th className={thClass}>to-be</th>
              </tr>
            </thead>
            <tbody>
              {AS_IS_TO_BE.map((row) => (
                <tr key={row.scene}>
                  <td className={`${tdClass} font-medium`}>{row.scene}</td>
                  <td className={`${tdClass} text-text-muted`}>{row.asIs}</td>
                  <td className={tdClass}>{row.toBe}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm leading-relaxed text-text-muted">
          毎日書くことを前提にしない（連続記録やノルマは作らない）／入力は 1 行でよい／深掘りは任意でスキップできる、という前提をここから導いています。
        </p>
      </>
    ),
  },
  {
    id: 'value',
    eyebrow: '03',
    title: '提供価値と AI 活用の設計意図',
    body: (
      <>
        <p className="text-lg font-medium">書き溜めた断片が、そのまま語れる実績になる</p>
        {/* 表・リストを合わせて 16:9 に収めるため、表は文字を小さくし薄いグレーの面にまとめる */}
        <div className="overflow-x-auto rounded-card bg-neutral-100 text-sm">
          <table className="w-full">
            <thead>
              <tr>
                <th className={thClass}></th>
                <th className={thClass}>ユーザーの行動</th>
                <th className={thClass}>サービスの役割</th>
              </tr>
            </thead>
            <tbody>
              {PHASES.map((row) => (
                <tr key={row.phase}>
                  <td className={`${tdClass} font-medium`}>{row.phase}</td>
                  <td className={tdClass}>{row.user}</td>
                  <td className={tdClass}>{row.ai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <BulletList
          items={[
            'AI に記録を代筆させず、問いかけで本人の言語化を引き出す役割にする。書く負担は減らしつつ、思考の主体は本人に残す',
            '入力は短い断片で済ませ、構造化は AI が担う。続けやすさと後での使いやすさを両立させる',
            'Notion や日記アプリは記録できてもポートフォリオ化は手作業。ポートフォリオサービスは完成品を置く場所。本アプリは日々の記録からケーススタディ化までを一気通貫でつなぐ',
          ]}
        />
      </>
    ),
  },
  {
    id: 'business',
    eyebrow: '04',
    title: 'ビジネスモデル',
    body: (
      <>
        <p className="leading-relaxed">B2C のフリーミアムで個人に広め、デザイン組織向けの B2B へ展開します。</p>
        <ul className="grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <li key={plan.name} className="space-y-2 rounded-card border border-border p-4">
              <p className="font-medium">{plan.name}</p>
              <p className="text-lg font-bold text-primary-700">{plan.price}</p>
              <p className="text-sm leading-relaxed text-text-muted">{plan.body}</p>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: 'growth',
    eyebrow: '05',
    title: '展開シナリオと市場規模',
    body: (
      <>
        <h3 className="text-lg">展開シナリオ</h3>
        <ol className="list-decimal space-y-2 pl-6 leading-relaxed">
          <li>転職や評価面談の前のタイミングで Pro 課金を狙う。生成したケーススタディの SNS 共有を流入経路にする</li>
          <li>個人利用者が社内に持ち込む形で Team プランを導入。マネージャーの評価・育成の負担を下げる価値で法人課金へ</li>
          <li>将来の選択肢として、本人の同意を前提にデザイナー採用支援と連携する</li>
        </ol>
        <h3 className="text-lg">市場規模（要検証）</h3>
        <dl className="space-y-2">
          {MARKET.map((item) => (
            <div key={item.label} className="flex flex-wrap gap-x-4">
              <dt className="w-24 font-mono font-bold text-primary-600">{item.label}</dt>
              <dd>{item.body}</dd>
            </div>
          ))}
        </dl>
      </>
    ),
  },
  {
    id: 'mvp',
    eyebrow: '06',
    title: 'MVP の範囲とデモ実装の割り切り',
    body: (
      <>
        <BulletList
          items={[
            'プロジェクト・ログ・ケーススタディの CRUD に絞り、課金・チーム共有・認証は実装しない',
            'ログインなし。データはブラウザの localStorage に保存し、本番では Firebase（Auth + Firestore）に差し替える前提で窓口を 1 つにまとめている',
            'AI 機能（プロジェクト候補の提案・深掘り質問・ケーススタディ生成）は固定の応答を返すモック。本番の呼び出しと同じ形の関数にしてあり、中身を Claude API に差し替えるだけで済む',
            'React + Vite + TypeScript + Tailwind CSS のフロントエンドのみで構成し、Vercel に静的サイトとして公開',
          ]}
        />
        <p className="mt-auto text-xs leading-relaxed text-text-muted">
          ※ 05 市場規模の根拠：年1.2万円は Pro（月980円）の12ヶ月分。デザイナー数は令和2年国勢調査の職業小分類「デザイナー」201,100人。デジタル領域の人数は公的統計がなく、民間推計（情報サービス業などの従業者数 × デザイナー比率で Web デザイナー約1.7万人、うち UI/UX 約5千人）を幅として採用。
        </p>
      </>
    ),
  },
];

export function InterviewPage() {
  const [index, setIndex] = useState(0);
  const slide = SLIDES[index];
  const isFirst = index === 0;
  const isLast = index === SLIDES.length - 1;

  const go = useCallback((next: number) => setIndex(Math.max(0, Math.min(SLIDES.length - 1, next))), []);

  // 面接中に画面共有しながら送れるよう、ページ全体で左右キーを受け付ける
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        setIndex((i) => Math.min(SLIDES.length - 1, i + 1));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className="grid gap-8 md:grid-cols-4">
      <aside className="space-y-6 md:col-span-1">
        <nav aria-label="スライドの目次">
          <ol className="space-y-1">
            {SLIDES.map((item, i) => (
              <li key={item.id}>
                <button
                  type="button"
                  aria-current={i === index ? 'step' : undefined}
                  onClick={() => go(i)}
                  className={`flex w-full items-baseline gap-2 rounded-button px-3 py-2 text-left text-sm text-text-muted hover:bg-neutral-100 hover:text-text active:bg-neutral-200 aria-[current=step]:bg-primary-50 aria-[current=step]:font-medium aria-[current=step]:text-primary-700 ${focusRing}`}
                >
                  <span className="font-mono">{i === 0 ? '00' : item.eyebrow}</span>
                  <span>{i === 0 ? '表紙' : item.title}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>
        <a
          href={paths.home()}
          className={`flex items-center justify-center rounded-button bg-primary-500 px-4 py-2 font-medium text-white shadow-sm hover:bg-primary-600 active:bg-primary-700 ${focusRing}`}
        >
          アプリを触る
        </a>
      </aside>

      <div className="space-y-4 md:col-span-3">
        <section
          aria-labelledby={`${slide.id}-title`}
          aria-roledescription="スライド"
          className="flex flex-col gap-4 overflow-y-auto rounded-card border border-border bg-surface-raised p-8 shadow-md md:aspect-video"
        >
          {isFirst ? (
            <div className="flex flex-1 flex-col justify-center gap-4">
              <p className="text-sm font-bold tracking-widest text-primary-700">{slide.eyebrow}</p>
              <h1 id={`${slide.id}-title`} className="text-3xl">
                {slide.title}
              </h1>
              {slide.body}
            </div>
          ) : (
            <>
              <div className="flex items-baseline gap-3 border-b-2 border-primary-500 pb-2">
                <span className="font-mono text-sm font-bold text-primary-600">{slide.eyebrow}</span>
                <h2 id={`${slide.id}-title`} className="text-xl">
                  {slide.title}
                </h2>
              </div>
              {slide.body}
            </>
          )}
        </section>

        <div className="flex items-center justify-between gap-4">
          <Button size="sm" variant="secondary" disabled={isFirst} onClick={() => go(index - 1)}>
            ← 前へ
          </Button>
          <p aria-live="polite" className="font-mono text-sm text-text-muted">
            {index + 1} / {SLIDES.length}
          </p>
          <Button size="sm" variant="secondary" disabled={isLast} onClick={() => go(index + 1)}>
            次へ →
          </Button>
        </div>
      </div>
    </div>
  );
}
