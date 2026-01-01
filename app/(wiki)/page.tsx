import { getWikiList } from '@/lib/actions/wiki.actions';
import WikiList from '@/components/wiki/wiki-list';

export default async function WikiListPage() {
  const items = await getWikiList();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">문서 목록</h1>
      <WikiList items={items} />
    </div>
  );
}
