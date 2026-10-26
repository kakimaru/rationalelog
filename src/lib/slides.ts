// ケーススタディの文章をスライドに割り付ける。
// AI の応答ではなく本人のテキストの整形なので、mockAi.ts ではなくここで純粋関数として持つ。
import {
  CASE_STUDY_SECTION_KEYS,
  CASE_STUDY_SECTION_LABELS,
  type CaseStudySections,
  type Log,
  type Project,
  type Slide,
  type SlideLine,
} from '../types';
import { formatDate } from './date';

/** 1枚に載せる行数の上限 */
const MAX_LINES = 6;
/** 1行の文字数の上限（補足の行は字下げする分だけ短くする） */
const MAX_CHARS: Record<SlideLine['level'], number> = { 0: 70, 1: 60 };

type Input = {
  title: string;
  sections: CaseStudySections;
  project: Project | undefined;
  logs: Log[];
};

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

/** 本文を行ごとに分け、「- 」「  - 」の箇条書きを字下げの段階に変える */
function toLines(body: string): SlideLine[] {
  return body
    .split('\n')
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const level: SlideLine['level'] = /^\s+-\s/.test(line) ? 1 : 0;
      const text = line.replace(/^\s*-\s+/, '').trim();
      return { text: clip(text, MAX_CHARS[level]), level };
    });
}

function coverMeta(project: Project | undefined, logs: Log[]): string[] {
  const meta = [project?.name ?? '（削除されたプロジェクト）'];
  if (logs.length === 0) return [...meta, '元にしたログはありません'];
  const dates = logs.map((log) => log.date).sort();
  const first = formatDate(dates[0]);
  const last = formatDate(dates[dates.length - 1]);
  const period = first === last ? first : `${first} – ${last}`;
  return [...meta, `${period}・ログ ${logs.length} 件から作成`];
}

export function buildSlides({ title, sections, project, logs }: Input): Slide[] {
  const cover: Slide = {
    kind: 'cover',
    heading: title.trim() || '（タイトル未設定）',
    meta: coverMeta(project, logs),
  };

  const sectionSlides: Slide[] = CASE_STUDY_SECTION_KEYS.map((key) => {
    const lines = toLines(sections[key]);
    return {
      kind: 'section',
      heading: CASE_STUDY_SECTION_LABELS[key],
      lines: lines.slice(0, MAX_LINES),
      truncated: lines.length > MAX_LINES,
    };
  });

  return [cover, ...sectionSlides];
}
