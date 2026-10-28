// AI 応答のモック。AI の応答はすべてこのファイルに集約する。
// シグネチャは本番の AI 呼び出し（Claude API）と同じ形にしてあり、本番ではこのファイルの中身を差し替える。
import { byNewest, daysAgoString, formatDate } from './date';
import {
  LOG_TYPE_LABELS,
  LOG_TYPES,
  type CaseStudySections,
  type GeneratedCaseStudy,
  type Log,
  type LogDraft,
  type LogType,
  type MonthlyComparison,
  type MonthStats,
  type Project,
  type ProjectAnalysis,
  type ProjectStrength,
  type ProjectSuggestion,
  type SelfAnalysis,
  type SkillScore,
  type TraitAxis,
} from '../types';

const RESPONSE_DELAY_MS = 1000;

function wait<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), RESPONSE_DELAY_MS));
}

// ---------- ① プロジェクト候補の提案 ----------

export function suggestProject(draft: LogDraft, projects: Project[], logs: Log[]): Promise<ProjectSuggestion> {
  return wait(pickProject(draft, projects, logs));
}

function pickProject(draft: LogDraft, projects: Project[], logs: Log[]): ProjectSuggestion {
  const body = draft.body.toLowerCase();

  // 1. 本文に含まれるプロジェクト名・キーワードの数がいちばん多いもの（同点なら最近更新したもの）
  const matches = projects
    .map((project) => {
      const terms = [project.name, ...project.keywords].map((t) => t.trim()).filter((t) => t.length > 0);
      const matched = [...new Set(terms)].filter((term) => body.includes(term.toLowerCase()));
      return { project, matched };
    })
    .filter((m) => m.matched.length > 0)
    .sort((a, b) => b.matched.length - a.matched.length || b.project.updatedAt.localeCompare(a.project.updatedAt));

  const best = matches[0];
  if (best) {
    return {
      projectId: best.project.id,
      reason: `${best.matched.map((t) => `『${t}』`).join('')}が含まれています`,
    };
  }

  // 2. 直近のログのプロジェクト
  const projectIds = new Set(projects.map((p) => p.id));
  const latestLog = [...logs].filter((log) => projectIds.has(log.projectId)).sort(byNewest)[0];
  if (latestLog) {
    return { projectId: latestLog.projectId, reason: '前回記録したプロジェクトです' };
  }

  // ログはないがプロジェクトはある場合は、最近更新したプロジェクト
  const latestProject = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0];
  if (latestProject) {
    return { projectId: latestProject.id, reason: '最近更新したプロジェクトです' };
  }

  // 3. プロジェクトもログもない
  return { projectId: null, reason: '最初のプロジェクトを作りましょう' };
}

// ---------- ② 深掘りの質問 ----------

const DEEP_DIVE_QUESTIONS: Record<LogType | 'uncategorized', string[]> = {
  decision: ['他にどんな案がありましたか？', 'その案を選んだ決め手は何ですか？', '何を優先して、何をあきらめましたか？'],
  feedback: ['誰から、どんな観点のフィードバックでしたか？', 'それを受けて何を変えましたか？', '納得できなかった点はありますか？'],
  outcome: ['どんな変化がありましたか？（数字があれば）', 'その成果に効いた判断は何でしたか？', 'もう一度やるなら、どこを伸ばしたいですか？'],
  learning: ['次に同じ場面が来たら、何を変えますか？', 'その学びに気づいたきっかけは何ですか？', '他のプロジェクトでも使えそうですか？'],
  uncategorized: ['このとき、何をなぜ決めましたか？', '誰かからの反応はありましたか？', 'うまくいった点、引っかかった点はどこですか？'],
};

export function getDeepDiveQuestions(log: Log): Promise<string[]> {
  return wait([...DEEP_DIVE_QUESTIONS[log.type ?? 'uncategorized']]);
}

/** 入力欄の演出で「AIはこんなふうに問いかけます」と見せる例。待ち時間なしで返す（本番でも固定の例のままでよい） */
export function getDeepDiveQuestionsFor(type: LogType | null): string[] {
  return [...DEEP_DIVE_QUESTIONS[type ?? 'uncategorized']];
}

// ---------- ③ ケーススタディの生成 ----------

const EMPTY_SECTION = '（まだ記録がありません。ここに追記しましょう）';

function bulletList(lines: string[]): string {
  return lines.length > 0 ? lines.join('\n') : EMPTY_SECTION;
}

function bodiesOf(logs: Log[], type: LogType): string[] {
  return logs.filter((log) => log.type === type).map((log) => `- ${log.body}`);
}

export function generateCaseStudy(project: Project, logs: Log[]): Promise<GeneratedCaseStudy> {
  // 日付の古い順に並べる
  const sorted = [...logs].sort((a, b) => byNewest(b, a));

  const rationale = sorted
    .filter((log) => log.type === 'decision')
    .map((log) =>
      [`- ${log.body}`, ...log.deepDive.map((qa) => `  - Q. ${qa.question} / A. ${qa.answer}`)].join('\n'),
    );

  const sections: CaseStudySections = {
    background: project.description.trim() || EMPTY_SECTION,
    problem: bulletList(bodiesOf(sorted, 'feedback')),
    process: bulletList(sorted.map((log) => `- ${formatDate(log.date)}：${log.body}`)),
    rationale: bulletList(rationale),
    outcome: bulletList(bodiesOf(sorted, 'outcome')),
    learning: bulletList(bodiesOf(sorted, 'learning')),
  };

  return wait({ title: `${project.name} のケーススタディ`, sections });
}

// ---------- ④ 自己分析（先月比・思考の癖・スキル） / ⑤ プロジェクトのアピールポイント ----------
// 本番では AI がログを読んで分析する。デモ版はキーワードと種別の数から決まった文言を返す

/** これより少ないと分析しない */
export const ANALYSIS_MIN_LOGS = 3;

/** 「この1か月」は直近 30 日、「先月」はその前の 30 日 */
const MONTH_DAYS = 30;

function textOf(log: Log): string {
  return [log.body, ...log.deepDive.map((qa) => qa.answer)].join('\n').toLowerCase();
}

function hasAnyWord(log: Log, words: string[]): boolean {
  const text = textOf(log);
  return words.some((word) => text.includes(word.toLowerCase()));
}

function countWithWords(logs: Log[], words: string[]): number {
  return logs.filter((log) => hasAnyWord(log, words)).length;
}

function countType(logs: Log[], ...types: (LogType | null)[]): number {
  return logs.filter((log) => types.includes(log.type)).length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function deepDiveRate(logs: Log[]): number {
  if (logs.length === 0) return 0;
  return Math.round((logs.filter((log) => log.deepDive.length > 0).length / logs.length) * 100);
}

// ----- 思考の癖ゲージ -----

const EVIDENCE_WORDS = ['データ', '検証', 'テスト', '数字', '%', 'インタビュー', '調査', '計測', '分析', '人中'];
const COLLAB_WORDS = ['相談', 'pm', 'エンジニア', 'レビュー', 'チーム', '合意', '共有', '指摘'];
const USER_WORDS = ['ユーザー', '使いやすさ', 'インタビュー', '体験', '離脱', '迷', '面倒', 'わかりやすさ'];
const BUSINESS_WORDS = ['売上', 'kpi', 'コスト', '継続率', 'cvr', '効率', '工数', '指標', '事業'];

/** キーワードが含まれないログは「反対側」の弱い根拠として扱い、重みを下げる */
const ABSENCE_WEIGHT = 0.4;

type TraitDefinition = {
  id: string;
  left: string;
  right: string;
  /** [left の強さ, right の強さ] */
  score: (logs: Log[]) => [number, number];
  comments: { left: string; balanced: string; right: string };
};

const TRAITS: TraitDefinition[] = [
  {
    id: 'evidence',
    left: '直感で動く',
    right: '根拠を集める',
    score: (logs) => {
      const evidence = countWithWords(logs, EVIDENCE_WORDS);
      return [(logs.length - evidence) * ABSENCE_WEIGHT, evidence];
    },
    comments: {
      left: 'ひらめきを形にするのが速いタイプ。判断の根拠を1つ添えると、説得力が一段上がります',
      balanced: '直感と根拠を行き来できています。場面に応じて使い分けられている状態です',
      right: '数字や調査をもとに判断を組み立てるタイプ。根拠のある説明は面接でも強みになります',
    },
  },
  {
    id: 'collaboration',
    left: 'ひとりで深める',
    right: '周りを巻き込む',
    score: (logs) => {
      const together = logs.filter((log) => log.type === 'feedback' || hasAnyWord(log, COLLAB_WORDS)).length;
      return [(logs.length - together) * ABSENCE_WEIGHT, together];
    },
    comments: {
      left: 'ひとりで考えを深めるタイプ。誰かの反応も記録すると、協働の力を見せられます',
      balanced: 'ひとりで考える時間と、周りに相談する時間のバランスが取れています',
      right: '周りを巻き込みながら進めるタイプ。合意形成の経験はシニアへの近道です',
    },
  },
  {
    id: 'perspective',
    left: 'ユーザー視点',
    right: 'ビジネス視点',
    score: (logs) => [countWithWords(logs, USER_WORDS), countWithWords(logs, BUSINESS_WORDS)],
    comments: {
      left: 'ユーザーの体験を起点に考えるタイプ。事業への効果も言葉にできると視座が上がります',
      balanced: 'ユーザーとビジネスの両方を見て判断できています',
      right: '事業への効果を意識して判断するタイプ。ユーザーの声と結びつけると、さらに説得力が増します',
    },
  },
  {
    id: 'convergence',
    left: '広げる',
    right: '決めきる',
    score: (logs) => [countType(logs, 'learning', null), countType(logs, 'decision', 'outcome')],
    comments: {
      left: '学びや気づきを広げていくタイプ。「だから何を決めたか」まで残すと、判断力が伝わります',
      balanced: '広げることと決めることを、どちらも記録できています',
      right: '決めきって前に進めるタイプ。迷った選択肢も残しておくと、思考の幅が伝わります',
    },
  },
];

/** これより偏っていたら、どちらか寄りのコメントにする */
const TRAIT_LEANING_THRESHOLD = 30;

function analyzeTraits(logs: Log[]): TraitAxis[] {
  return TRAITS.map(({ id, left, right, score, comments }) => {
    const [l, r] = score(logs);
    const value = l + r === 0 ? 0 : Math.round(((r - l) / (l + r)) * 100);
    const comment =
      value <= -TRAIT_LEANING_THRESHOLD
        ? comments.left
        : value >= TRAIT_LEANING_THRESHOLD
          ? comments.right
          : comments.balanced;
    return { id, left, right, value, comment };
  });
}

// ----- スキル -----

type SkillDefinition = {
  id: string;
  label: string;
  /** このスキルの根拠になるログ */
  evidence: (logs: Log[]) => Log[];
  /** 強みとして出すときの見出し */
  strength: string;
  /** スコアが低いときの「この経験を作れると強い」 */
  advice: string;
};

function byWords(words: string[], ...types: LogType[]): (logs: Log[]) => Log[] {
  return (logs) => logs.filter((log) => (log.type !== null && types.includes(log.type)) || hasAnyWord(log, words));
}

const SKILLS: SkillDefinition[] = [
  {
    id: 'research',
    label: 'リサーチ',
    evidence: byWords(['インタビュー', '調査', 'ヒアリング', 'アンケート', '競合', 'ユーザーテスト', '観察', '声']),
    strength: 'ユーザーの声から判断を組み立てられる',
    advice: 'インタビューやユーザーテストの結果を1つ記録できると、判断の根拠が強くなります',
  },
  {
    id: 'ia',
    label: '情報設計',
    evidence: byWords(['導線', '画面', '構造', 'ナビ', 'フロー', '一覧', 'リスト', 'カード', 'チュートリアル', 'オンボーディング']),
    strength: '情報の構造と導線を設計できる',
    advice: '画面の構成や導線を「なぜこの順番にしたか」と一緒に残すと、設計力が伝わります',
  },
  {
    id: 'visual',
    label: 'ビジュアル',
    evidence: byWords(['色', 'トークン', 'フォント', 'レイアウト', 'ビジュアル', 'アイコン', '余白', 'コンポーネント', 'ボタン']),
    strength: 'ルールに沿ってビジュアルを揃えられる',
    advice: '色や余白などの見た目の判断も理由と一緒に残すと、表現の引き出しが伝わります',
  },
  {
    id: 'consensus',
    label: '合意形成',
    evidence: byWords(COLLAB_WORDS, 'feedback'),
    strength: '周りを巻き込んで合意をつくれる',
    advice: 'PM やエンジニアと意見が分かれた場面と、どう着地させたかを残せると強いです',
  },
  {
    id: 'validation',
    label: '検証・改善',
    evidence: byWords(['検証', 'テスト', '数字', '%', '改善', '継続率', 'リリース', '計測', 'データ'], 'outcome'),
    strength: '数字で検証し、改善につなげられる',
    advice: 'リリース後の数字を1つ記録できると、成果を語れるケーススタディになります',
  },
  {
    id: 'verbalization',
    label: '言語化',
    evidence: (logs) => logs.filter((log) => log.deepDive.length > 0 || log.type === 'learning'),
    strength: '判断の理由を言葉にできる',
    advice: '深掘りの質問に1問だけでも答えると、判断の理由が言葉で残ります',
  },
];

function skillScore(skill: SkillDefinition, logs: Log[]): number {
  if (logs.length === 0) return 0;
  const hits = skill.evidence(logs).length;
  // 割合（どれだけ一貫しているか）と件数（どれだけ経験があるか）の両方を見る
  return clamp(Math.round((hits / logs.length) * 120 + Math.min(hits, 4) * 5), 0, 100);
}

/** 今のスコアと、1 か月前の時点（それより前のログだけ）のスコア */
function analyzeSkills(logs: Log[]): SkillScore[] {
  const monthAgo = daysAgoString(MONTH_DAYS);
  const olderLogs = logs.filter((log) => log.date <= monthAgo);
  return SKILLS.map((skill) => ({
    id: skill.id,
    label: skill.label,
    current: skillScore(skill, logs),
    previous: olderLogs.length > 0 ? skillScore(skill, olderLogs) : null,
  }));
}

// ----- 先月比 -----

function monthStats(logs: Log[]): MonthStats {
  return {
    logCount: logs.length,
    deepDiveRate: deepDiveRate(logs),
    typeCounts: {
      decision: countType(logs, 'decision'),
      feedback: countType(logs, 'feedback'),
      outcome: countType(logs, 'outcome'),
      learning: countType(logs, 'learning'),
      uncategorized: countType(logs, null),
    },
  };
}

function comparisonHeadline(thisMonth: MonthStats, lastMonth: MonthStats | null): string {
  if (!lastMonth) {
    return thisMonth.logCount > 0
      ? `この1か月で${thisMonth.logCount}件の記録がたまりました。来月は今月の自分と比べられます`
      : 'この1か月はまだ記録がありません。今日のことを一言から始めてみましょう';
  }
  const grown = LOG_TYPES.map((type) => ({ type, diff: thisMonth.typeCounts[type] - lastMonth.typeCounts[type] })).sort(
    (a, b) => b.diff - a.diff,
  )[0];
  if (grown.diff > 0) return `先月より${LOG_TYPE_LABELS[grown.type]}の記録が${grown.diff}件増えました`;

  const diff = thisMonth.logCount - lastMonth.logCount;
  if (diff > 0) return `先月より記録が${diff}件増えました`;
  if (diff === 0) return '先月と同じペースで記録が続いています';
  return `先月より記録が${-diff}件少なめです。余裕のある日に一言だけでも大丈夫です`;
}

function comparisonNotes(thisMonth: MonthStats, lastMonth: MonthStats | null, skills: SkillScore[]): string[] {
  const notes: string[] = [];

  if (lastMonth && thisMonth.deepDiveRate > lastMonth.deepDiveRate) {
    notes.push(
      `深掘りに答えた割合が ${lastMonth.deepDiveRate}% → ${thisMonth.deepDiveRate}% に上がりました。判断の理由が残りはじめています`,
    );
  } else if (lastMonth && thisMonth.deepDiveRate < lastMonth.deepDiveRate) {
    notes.push(
      `深掘りに答えた割合が ${lastMonth.deepDiveRate}% → ${thisMonth.deepDiveRate}% に下がりました。1問だけでも答えると、あとで語れる材料になります`,
    );
  }

  const grown = skills
    .filter((skill) => skill.previous !== null && skill.current - skill.previous >= 5)
    .sort((a, b) => b.current - (b.previous ?? 0) - (a.current - (a.previous ?? 0)))[0];
  if (grown) notes.push(`「${grown.label}」のスコアが1か月前より伸びています`);

  if (thisMonth.logCount > 0 && thisMonth.typeCounts.outcome === 0) {
    notes.push('この1か月は成果の記録がまだありません。小さな変化でも、数字があれば残しておきましょう');
  }

  return notes.slice(0, 3);
}

function compareMonths(logs: Log[], skills: SkillScore[]): MonthlyComparison {
  const monthAgo = daysAgoString(MONTH_DAYS);
  const twoMonthsAgo = daysAgoString(MONTH_DAYS * 2);
  const thisMonthLogs = logs.filter((log) => log.date > monthAgo);
  const lastMonthLogs = logs.filter((log) => log.date > twoMonthsAgo && log.date <= monthAgo);

  const thisMonth = monthStats(thisMonthLogs);
  const lastMonth = lastMonthLogs.length > 0 ? monthStats(lastMonthLogs) : null;
  return {
    thisMonth,
    lastMonth,
    headline: comparisonHeadline(thisMonth, lastMonth),
    notes: comparisonNotes(thisMonth, lastMonth, skills),
  };
}

export function analyzeSelf(logs: Log[], projects: Project[]): Promise<SelfAnalysis> {
  // 削除済みのプロジェクトに残ったログは数えない
  const projectIds = new Set(projects.map((project) => project.id));
  const target = logs.filter((log) => projectIds.has(log.projectId));
  const skills = analyzeSkills(target);
  return wait({
    enough: target.length >= ANALYSIS_MIN_LOGS,
    comparison: compareMonths(target, skills),
    traits: analyzeTraits(target),
    skills,
  });
}

// ----- プロジェクトのアピールポイント -----

/** これ以上のスコアのスキルを強みとして出す */
const STRENGTH_MIN_SCORE = 50;
const MAX_STRENGTHS = 3;
const MAX_EVIDENCE = 2;
const MAX_ADVICE = 3;

function projectStrengths(logs: Log[], skills: SkillScore[]): ProjectStrength[] {
  return [...skills]
    .filter((score) => score.current >= STRENGTH_MIN_SCORE)
    .sort((a, b) => b.current - a.current)
    .flatMap((score) => {
      const skill = SKILLS.find((s) => s.id === score.id);
      if (!skill) return [];
      const evidence = [...skill.evidence(logs)]
        .sort(byNewest)
        .slice(0, MAX_EVIDENCE)
        .map((log) => log.body);
      return evidence.length > 0 ? [{ title: skill.strength, evidence }] : [];
    })
    .slice(0, MAX_STRENGTHS);
}

const MISSING_TYPE_ADVICE: Record<LogType, string> = {
  outcome: 'リリース後の数字を1つ記録できると、成果を語れるケーススタディになります',
  feedback: '誰かからのFBと、それを受けて変えたことを残すと、協働の力が伝わります',
  decision: '「AとBで迷ってAにした」という判断を1つ残すと、思考のプロセスを語れます',
  learning: '「次はこうする」という振り返りの一言があると、伸びしろを示せます',
};

function projectAdvice(logs: Log[], skills: SkillScore[]): string[] {
  const advice: string[] = [];

  // 1. 足りない種別（ケーススタディの章が埋まらないもの）
  for (const type of ['outcome', 'decision', 'feedback', 'learning'] as const) {
    if (countType(logs, type) === 0) advice.push(MISSING_TYPE_ADVICE[type]);
  }

  // 2. 低いスキル
  for (const score of [...skills].sort((a, b) => a.current - b.current)) {
    const skill = SKILLS.find((s) => s.id === score.id);
    if (skill && score.current < STRENGTH_MIN_SCORE && !advice.includes(skill.advice)) advice.push(skill.advice);
  }

  const picked = advice.slice(0, MAX_ADVICE);
  return picked.length > 0 ? picked : ['材料はそろっています。ケーススタディにまとめてみましょう'];
}

export function analyzeProject(project: Project, logs: Log[]): Promise<ProjectAnalysis> {
  const target = logs.filter((log) => log.projectId === project.id);
  const skills = analyzeSkills(target);
  return wait({
    enough: target.length >= ANALYSIS_MIN_LOGS,
    strengths: projectStrengths(target, skills),
    traits: analyzeTraits(target),
    skills,
    advice: projectAdvice(target, skills),
  });
}
