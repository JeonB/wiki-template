import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getWikiPage, getWikiList } from '@/lib/actions/wiki.actions';
import WikiViewer from '@/components/wiki/wiki-viewer';
import TableOfContents from '@/components/wiki/table-of-contents';
import MobileTocToggle from '@/components/layout/mobile-toc-toggle';
import Breadcrumbs from '@/components/wiki/breadcrumbs';
import ReadingProgress from '@/components/wiki/reading-progress';
import NextPrevLinks from '@/components/wiki/next-prev-links';
import RecentPagesRecorder from '@/components/wiki/recent-pages-recorder';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import DeleteWikiDialog from '@/components/wiki/delete-wiki-dialog';

interface WikiPageProps {
  params: Promise<{ slug: string }>;
}

export default async function WikiPage({ params }: WikiPageProps) {
  const { slug } = await params;
  const [page, allItems] = await Promise.all([getWikiPage(slug), getWikiList()]);

  if (!page) {
    notFound();
  }

  // 빵부스러기 네비게이션 항목 생성
  const breadcrumbItems = [
    { label: '홈', href: '/' },
    ...(page.frontmatter.category
      ? [{ label: page.frontmatter.category }]
      : []),
    { label: page.frontmatter.title },
  ];

  return (
    <>
      <RecentPagesRecorder slug={slug} title={page.frontmatter.title} />
      <ReadingProgress />
      <div className="flex">
        {/* 중앙 컨텐츠 */}
        <div className="flex-1 min-w-0">
          <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
            <Breadcrumbs items={breadcrumbItems} />
            <div className="mb-6 flex items-center justify-between">
              <div className="flex-1" />
              <div className="flex gap-2">
                {/* 모바일 목차 토글 */}
                {page.toc && page.toc.length > 0 && <MobileTocToggle items={page.toc} />}
                <Link href={`/${slug}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="mr-2 h-4 w-4" />
                    수정
                  </Button>
                </Link>
                <DeleteWikiDialog slug={slug} title={page.frontmatter.title} />
              </div>
            </div>
            <WikiViewer page={page} />
            <NextPrevLinks currentSlug={slug} allItems={allItems} />
          </div>
        </div>
        {/* 우측 목차 - 레이아웃의 우측 aside 영역에 배치 */}
        {page.toc && page.toc.length > 0 && (
          <aside className="hidden xl:block xl:w-64 xl:shrink-0 xl:pl-8">
            <TableOfContents items={page.toc} />
          </aside>
        )}
      </div>
    </>
  );
}
