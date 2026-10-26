// 複数のデータにまたがる操作。永続化は storage モジュールの CRUD だけを使う
import { daysAgoString } from './date';
import * as storage from './storage';
import type { CreateInput, UpdateInput } from './storage';
import type { AppData, CaseStudy, Log, LogType, Project } from '../types';

export function loadAppData(): AppData {
  return {
    projects: storage.list('projects'),
    logs: storage.list('logs'),
    caseStudies: storage.list('case-studies'),
  };
}

export function createProject(input: CreateInput<'projects'>): Project {
  return storage.create('projects', input);
}

export function updateProject(id: string, patch: UpdateInput<'projects'>): void {
  storage.update('projects', id, patch);
}

/** プロジェクトと、紐づくログ・ケーススタディをまとめて削除する */
export function deleteProject(id: string): void {
  for (const log of storage.list('logs')) {
    if (log.projectId === id) storage.remove('logs', log.id);
  }
  for (const caseStudy of storage.list('case-studies')) {
    if (caseStudy.projectId === id) storage.remove('case-studies', caseStudy.id);
  }
  storage.remove('projects', id);
}

/** ログを保存し、プロジェクトの updatedAt を更新する（振り分けの同点判定に使うため） */
export function createLog(input: CreateInput<'logs'>): Log {
  const log = storage.create('logs', input);
  storage.update('projects', log.projectId, {});
  return log;
}

export function updateLog(id: string, patch: UpdateInput<'logs'>): Log | null {
  const before = storage.get('logs', id);
  const log = storage.update('logs', id, patch);
  // 別のプロジェクトに移したときは、移動先のプロジェクトに追加したものとして扱う
  if (log && before && before.projectId !== log.projectId) {
    storage.update('projects', log.projectId, {});
  }
  return log;
}

export function deleteLog(id: string): void {
  storage.remove('logs', id);
}

export function createCaseStudy(input: CreateInput<'case-studies'>): CaseStudy {
  return storage.create('case-studies', input);
}

export function updateCaseStudy(id: string, patch: UpdateInput<'case-studies'>): void {
  storage.update('case-studies', id, patch);
}

export function deleteCaseStudy(id: string): void {
  storage.remove('case-studies', id);
}

// ---------- サンプルデータ（面接でのデモ用） ----------

type SampleLog = {
  body: string;
  type: LogType | null;
  daysAgo: number;
  deepDive?: Log['deepDive'];
};

type SampleProject = CreateInput<'projects'> & { logs: SampleLog[] };

const SAMPLE_PROJECTS: SampleProject[] = [
  {
    name: '社内デザインシステム整備',
    description: '複数のプロダクトでばらばらだった UI を揃えるため、デザイントークンとコンポーネントを整備した。',
    keywords: ['デザインシステム', 'トークン', 'コンポーネント'],
    logs: [
      {
        body: '色のトークンは色名ではなく用途（bg / text / border）で名前を付けることにした',
        type: 'decision',
        daysAgo: 12,
      },
      { body: 'エンジニアから「トークン名が長くて実装しにくい」とFBをもらった', type: 'feedback', daysAgo: 4 },
      { body: 'ボタンのバリエーションを棚卸しした。似たものが 14 種類あった', type: null, daysAgo: 1 },
    ],
  },
  {
    name: '家計簿アプリのオンボーディング改善',
    description:
      '家計簿アプリで、初回登録から 7 日以内に離脱するユーザーが多いという課題に取り組んだ。担当は UI/UX デザイン（PM・エンジニア 2 名と協働）。',
    keywords: ['オンボーディング', 'チュートリアル', '初回'],
    logs: [
      {
        body: 'チュートリアルを 5 画面から 2 画面に減らし、残りは使っている途中のヒント表示に回すことにした',
        type: 'decision',
        daysAgo: 24,
        deepDive: [
          { question: '他にどんな案がありましたか？', answer: '動画で説明する案と、スキップボタンを目立たせる案' },
          {
            question: 'その案を選んだ決め手は何ですか？',
            answer: 'インタビューで 5 人中 4 人が「最初の説明が長いと面倒」と答えたため',
          },
        ],
      },
      { body: 'PM から「ヒントが多すぎると邪魔にならないか」と指摘された', type: 'feedback', daysAgo: 21 },
      { body: 'ヒントは 1 画面に 1 つまで、閉じたら再表示しないルールにした', type: 'decision', daysAgo: 18 },
      { body: 'リリース後、7 日以内の継続率が 42% から 51% に上がった', type: 'outcome', daysAgo: 8 },
      {
        body: '数字で語れる指標を、リリース前に PM と合意しておくと振り返りが楽になる',
        type: 'learning',
        daysAgo: 6,
      },
    ],
  },
];

export function addSampleData(): void {
  for (const { logs, ...projectInput } of SAMPLE_PROJECTS) {
    const project = createProject(projectInput);
    for (const log of logs) {
      createLog({
        projectId: project.id,
        body: log.body,
        type: log.type,
        deepDive: log.deepDive ?? [],
        date: daysAgoString(log.daysAgo),
      });
    }
  }
}
