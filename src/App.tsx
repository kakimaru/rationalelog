import { useCallback, useState } from 'react';
import { Layout, type LayoutWidth, type NavItem } from './components/Layout';
import { loadAppData } from './lib/actions';
import { useHashRoute, type Route } from './lib/useHashRoute';
import { AboutPage } from './pages/AboutPage';
import { CaseStudyPage } from './pages/CaseStudyPage';
import { HomePage } from './pages/HomePage';
import { InsightsPage } from './pages/InsightsPage';
import { InterviewPage } from './pages/InterviewPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectPage } from './pages/ProjectPage';

const layoutWidths: Record<Route['name'], LayoutWidth> = {
  home: 'wide',
  caseStudy: 'wide',
  project: 'wide',
  notFound: 'narrow',
  about: 'full',
  interview: 'wide',
  insights: 'wide',
};

function App() {
  const route = useHashRoute();
  const [data, setData] = useState(loadAppData);
  const refresh = useCallback(() => setData(loadAppData()), []);

  // 画面を切り替えたら、描画前に保存済みのデータを読み直す（古いデータが一瞬表示されないように）
  const [loadedRoute, setLoadedRoute] = useState(route);
  if (loadedRoute !== route) {
    setLoadedRoute(route);
    setData(loadAppData());
  }

  const current: NavItem | undefined = route.name === 'about' || route.name === 'insights' ? route.name : undefined;

  return (
    <Layout width={layoutWidths[route.name]} current={current}>
      {route.name === 'home' && <HomePage data={data} onChange={refresh} />}
      {route.name === 'project' && <ProjectPage projectId={route.projectId} data={data} onChange={refresh} />}
      {route.name === 'caseStudy' && (
        <CaseStudyPage caseStudyId={route.caseStudyId} data={data} onChange={refresh} />
      )}
      {route.name === 'insights' && <InsightsPage data={data} />}
      {route.name === 'about' && <AboutPage />}
      {route.name === 'interview' && <InterviewPage />}
      {route.name === 'notFound' && <NotFoundPage />}
    </Layout>
  );
}

export default App;
