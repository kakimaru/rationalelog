// 入力欄のタイプ演出で見せる「書き方の例」（UI の文言）。
// 書き始めのハードルを下げるため、短く・具体的で・判断の理由が少し入った文にする
import type { LogType } from '../types';

export type ComposerSample = {
  text: string;
  type: LogType;
};

export const COMPOSER_SAMPLES: ComposerSample[] = [
  { text: 'トップの導線をカード型からリスト型に変えた。比較しやすさを優先', type: 'decision' },
  { text: 'PMから「初回の説明が長い」と言われた。3画面を1画面にまとめる', type: 'feedback' },
  { text: '新しい検索UIで、目的の商品までのタップ数が平均5回→3回になった', type: 'outcome' },
  { text: '色の名前より用途で名前を付けたほうが、エンジニアと話が早い', type: 'learning' },
  { text: 'ユーザーテストで迷った箇所が2つ。ボタンの文言を動詞に変える', type: 'decision' },
];
