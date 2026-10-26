// AI 応答のモック。AI の応答はすべてこのファイルに集約する。
// シグネチャは本番の AI 呼び出し（Claude API）と同じ形にしてあり、本番ではこのファイルの中身を差し替える。
import { byNewest, formatDate } from './date';
import type {
  CaseStudySections,
  GeneratedCaseStudy,
  Log,
  LogDraft,
  LogType,
  Project,
  ProjectSuggestion,
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
  decision: ['他にどんな案がありましたか？', 'その案を選んだ決め手は何ですか？'],
  feedback: ['誰から、どんな観点のフィードバックでしたか？', 'それを受けて何を変えましたか？'],
  outcome: ['どんな変化がありましたか？（数字があれば）', 'その成果に効いた判断は何でしたか？'],
  learning: ['次に同じ場面が来たら、何を変えますか？'],
  uncategorized: ['このとき、何をなぜ決めましたか？', '誰かからの反応はありましたか？'],
};

export function getDeepDiveQuestions(log: Log): Promise<string[]> {
  return wait([...DEEP_DIVE_QUESTIONS[log.type ?? 'uncategorized']]);
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
