// データ型の定義。仕様は documents/features/*/requirements.md を参照

// ---------- Project ----------
export type Project = {
  id: string;
  name: string; // 必須。1〜50 文字
  description: string; // 任意。ケーススタディの「背景」の元になる
  keywords: string[]; // 任意。振り分けの推定に使う
  createdAt: string;
  updatedAt: string; // 編集したとき・ログを追加したときに更新する
};

// ---------- Log ----------
export type LogType = 'decision' | 'feedback' | 'outcome' | 'learning';

export const LOG_TYPES: LogType[] = ['decision', 'feedback', 'outcome', 'learning'];

export const LOG_TYPE_LABELS: Record<LogType, string> = {
  decision: '判断',
  feedback: 'FB',
  outcome: '成果',
  learning: '学び',
};

export const UNCATEGORIZED_LABEL = '未分類';

export const LOG_BODY_MAX_LENGTH = 1000;

export type DeepDiveAnswer = {
  question: string;
  answer: string;
};

export type Log = {
  id: string;
  projectId: string; // 必須。振り分けで必ず決まる
  body: string; // 本文（1 文字以上 1000 文字以内）
  type: LogType | null; // 任意。null は「未分類」
  deepDive: DeepDiveAnswer[]; // 深掘りの回答。本文とは別に持つ
  date: string; // 'YYYY-MM-DD'
  createdAt: string; // ISO 8601
  updatedAt: string;
};

export type LogDraft = Pick<Log, 'body' | 'type'>;

// ---------- CaseStudy ----------
export type CaseStudySections = {
  background: string; // 背景
  problem: string; // 課題
  process: string; // プロセス
  rationale: string; // 判断理由
  outcome: string; // 成果
  learning: string; // 学び
};

export const CASE_STUDY_SECTION_KEYS: (keyof CaseStudySections)[] = [
  'background',
  'problem',
  'process',
  'rationale',
  'outcome',
  'learning',
];

export const CASE_STUDY_SECTION_LABELS: Record<keyof CaseStudySections, string> = {
  background: '背景',
  problem: '課題',
  process: 'プロセス',
  rationale: '判断理由',
  outcome: '成果',
  learning: '学び',
};

export type CaseStudy = {
  id: string;
  projectId: string;
  title: string;
  logIds: string[]; // 生成に使ったログ（参照用）
  sections: CaseStudySections;
  createdAt: string;
  updatedAt: string;
};

// ---------- スライド（ケーススタディのプレビュー） ----------
export type SlideLine = {
  text: string;
  level: 0 | 1; // 0 は箇条書き、1 はその下の補足（深掘りの回答など）
};

export type Slide =
  | { kind: 'cover'; heading: string; meta: string[] }
  | { kind: 'section'; heading: string; lines: SlideLine[]; truncated: boolean };

// ---------- AI（モック） ----------
export type ProjectSuggestion = {
  projectId: string | null; // null は「候補なし（新規作成をすすめる）」
  reason: string;
};

export type GeneratedCaseStudy = Pick<CaseStudy, 'title' | 'sections'>;

// ---------- 画面で使うデータのまとまり ----------
export type AppData = {
  projects: Project[];
  logs: Log[];
  caseStudies: CaseStudy[];
};
