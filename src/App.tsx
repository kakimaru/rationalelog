import { useCallback, useState } from 'react';
import { Layout } from './components/Layout';
import { loadAppData } from './lib/actions';
import { useHashRoute } from './lib/useHashRoute';
import { CaseStudyPage } from './pages/CaseStudyPage';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProjectPage } from './pages/ProjectPage';

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

  return (
    <Layout>
      {route.name === 'home' && <HomePage data={data} onChange={refresh} />}
      {route.name === 'project' && <ProjectPage projectId={route.projectId} data={data} onChange={refresh} />}
      {route.name === 'caseStudy' && (
        <CaseStudyPage caseStudyId={route.caseStudyId} data={data} onChange={refresh} />
      )}
      {route.name === 'notFound' && <NotFoundPage />}
    </Layout>
  );
}

export default App;
