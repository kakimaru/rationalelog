import { focusRing } from '../components/styles';
import { paths } from '../lib/useHashRoute';

export function NotFoundPage() {
  return (
    <div className="space-y-4 py-16 text-center">
      <h1 className="text-2xl">ページが見つかりません</h1>
      <p className="text-text-muted">削除されたか、URL が間違っている可能性があります。</p>
      <a href={paths.home()} className={`inline-block rounded-sm font-medium text-primary-700 hover:underline ${focusRing}`}>
        ホームへ戻る
      </a>
    </div>
  );
}
