import WikiNav from '@/components/layout/wiki-nav';
import WikiSidebar from '@/components/layout/wiki-sidebar';
import { getWikiList } from '@/lib/actions/wiki.actions';

export default async function WikiLayout({ children }: { children: React.ReactNode }) {
  const items = await getWikiList();

  return (
    <div className="min-h-screen bg-background">
      <WikiNav />
      <div className="flex">
        {/* 좌측 사이드바 - 데스크톱에서만 표시, 모바일에서는 숨김 */}
        <div className="hidden lg:block lg:w-64 lg:shrink-0">
          <WikiSidebar items={items} />
        </div>
        {/* 중앙 컨텐츠 영역 */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
            {children}
          </div>
        </main>
        {/* 우측 목차 영역 - 문서 페이지에서만 표시 */}
        <div className="hidden xl:block xl:w-64 xl:shrink-0" />
      </div>
    </div>
  );
}
