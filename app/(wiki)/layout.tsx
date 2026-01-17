import WikiNav from '@/components/layout/wiki-nav';
import WikiSidebar from '@/components/layout/wiki-sidebar';
import { getWikiList } from '@/lib/actions/wiki.actions';

export default async function WikiLayout({ children }: { children: React.ReactNode }) {
  const items = await getWikiList();

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
