import { getWikiList } from '@/lib/actions/wiki.actions';
import WikiList from '@/components/wiki/wiki-list';
import CategoryFilter from '@/components/wiki/category-filter';

interface PageProps {
  searchParams?: Promise<{ category?: string }>;
}

export default async function WikiListPage({ searchParams }: PageProps) {
  const sp = await (searchParams ?? Promise.resolve({} as { category?: string }));
  const category = typeof sp.category === 'string' ? sp.category : undefined;
  const current = category ?? null;

  const allItems = await getWikiList();
  const categories = [...new Set(allItems.map((i) => i.category ?? ''))].sort((a, b) => {
    if (a === '') return 1;
    if (b === '') return -1;
    return a.localeCompare(b, 'ko');
  });
  const filtered =
    current === null ? allItems : allItems.filter((i) => (i.category ?? '') === current);

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">문서 목록</h1>
      <CategoryFilter categories={categories} current={current} />
      <WikiList items={filtered} />
    </div>
  );
}
