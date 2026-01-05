import WikiNav from '@/components/layout/wiki-nav';
import WikiSidebar from '@/components/layout/wiki-sidebar';
import { getWikiList } from '@/lib/actions/wiki.actions';

export default async function WikiLayout({ children }: { children: React.ReactNode }) {
  const items = await getWikiList();

  // #region agent log
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7242/ingest/be01d120-613a-4490-bf01-bf570c50ea02', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        location: 'app/(wiki)/layout.tsx:5',
        message: 'WikiLayout rendering',
        data: { itemsCount: items.length },
        timestamp: Date.now(),
        sessionId: 'debug-session',
        runId: 'run1',
        hypothesisId: 'A',
      }),
    }).catch(() => {});
  }
  // #endregion

  return (
    <div className="min-h-screen bg-background">
      <WikiNav items={items} />
      <div className="flex">
        {/* 좌측 사이드바 - 데스크톱에서만 표시, 모바일에서는 숨김 */}
        <div className="hidden lg:block lg:w-64 lg:shrink-0">
          <WikiSidebar items={items} />
        </div>
        {/* 중앙 컨텐츠 영역 - flex 컨테이너로 변경하여 목차와 함께 배치 */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
