// location.hash を読んで画面を切り替える小さなルーター。
// パッケージを追加せずに、ブラウザの戻る・リロード・URL 共有に対応する。
import { useEffect, useState } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'project'; projectId: string }
  | { name: 'caseStudy'; caseStudyId: string }
  | { name: 'notFound' };

export function parseHash(hash: string): Route {
  // 空のハッシュは '#/' として扱う
  const path = hash.replace(/^#/, '') || '/';
  let segments: string[];
  try {
    segments = path.split('/').filter((s) => s.length > 0).map(decodeURIComponent);
  } catch {
    return { name: 'notFound' };
  }

  if (segments.length === 0) return { name: 'home' };
  if (segments.length === 2 && segments[0] === 'projects') return { name: 'project', projectId: segments[1] };
  if (segments.length === 2 && segments[0] === 'case-studies') return { name: 'caseStudy', caseStudyId: segments[1] };
  return { name: 'notFound' };
}

export const paths = {
  home: () => '#/',
  project: (projectId: string) => `#/projects/${encodeURIComponent(projectId)}`,
  caseStudy: (caseStudyId: string) => `#/case-studies/${encodeURIComponent(caseStudyId)}`,
};

export function navigate(hash: string): void {
  window.location.hash = hash;
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}
