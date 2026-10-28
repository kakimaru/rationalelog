// 入力欄のタイプ演出。文言は持たず、表示する文字数と質問数の進み方だけを扱う
import { useEffect, useState, useSyncExternalStore } from 'react';

export type TypewriterSample = {
  text: string;
  questions: string[];
};

/** 1 文字を打つ間隔 */
const TYPE_INTERVAL_MS = 60;
/** 打ち終わってから次の文章に進むまで */
const HOLD_MS = 5000;
/** 打ち終わってから質問の例を 1 つずつ出すタイミング（最大 3 つ） */
const QUESTION_TIMINGS_MS = [800, 2200, 3600];

type State = { index: number; chars: number; questions: number };

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function subscribeReducedMotion(callback: () => void): () => void {
  const media = window.matchMedia(REDUCED_MOTION_QUERY);
  media.addEventListener('change', callback);
  return () => media.removeEventListener('change', callback);
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/**
 * 文章を 1 文字ずつ打ち、打ち終わったら HOLD_MS 止めて、その間に質問の例を順に出す
 * @param samples 毎回作り直さない配列を渡す（参照が変わると演出が最初からになる）
 * @param active false の間（ユーザーが入力しているとき）は止めて、最初の状態に戻す
 */
export function useTypewriter(samples: TypewriterSample[], active: boolean) {
  const reducedMotion = usePrefersReducedMotion();
  const [state, setState] = useState<State>({ index: 0, chars: 0, questions: 0 });

  // 止まったら、次に再開したときは今の文章の頭から打ち直す
  const [wasActive, setWasActive] = useState(active);
  if (wasActive !== active) {
    setWasActive(active);
    if (!active) setState((prev) => ({ index: prev.index, chars: 0, questions: 0 }));
  }

  const sample = samples.length > 0 ? samples[state.index % samples.length] : null;
  const maxQuestions = sample ? Math.min(sample.questions.length, QUESTION_TIMINGS_MS.length) : 0;

  useEffect(() => {
    if (!active || reducedMotion || !sample) return;

    let delay: number;
    let next: (prev: State) => State;
    if (state.chars < sample.text.length) {
      delay = TYPE_INTERVAL_MS;
      next = (prev) => ({ ...prev, chars: prev.chars + 1 });
    } else if (state.questions < maxQuestions) {
      delay = QUESTION_TIMINGS_MS[state.questions] - (QUESTION_TIMINGS_MS[state.questions - 1] ?? 0);
      next = (prev) => ({ ...prev, questions: prev.questions + 1 });
    } else {
      delay = HOLD_MS - (QUESTION_TIMINGS_MS[maxQuestions - 1] ?? 0);
      next = (prev) => ({ index: (prev.index + 1) % samples.length, chars: 0, questions: 0 });
    }

    const timer = window.setTimeout(() => setState(next), delay);
    return () => window.clearTimeout(timer);
  }, [active, reducedMotion, sample, samples.length, maxQuestions, state.chars, state.questions]);

  if (!sample) return { visibleText: '', visibleQuestions: [], typing: false };

  // 視差効果を減らす設定では、動かさずに全文と質問をすべて出す
  if (reducedMotion) {
    return { visibleText: sample.text, visibleQuestions: sample.questions.slice(0, maxQuestions), typing: false };
  }

  return {
    visibleText: sample.text.slice(0, state.chars),
    visibleQuestions: sample.questions.slice(0, state.questions),
    typing: state.chars < sample.text.length,
  };
}
