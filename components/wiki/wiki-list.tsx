import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { WikiListItem } from '@/lib/types/wiki.types';

interface WikiListProps {
  items: WikiListItem[];
}

export default function WikiList({ items }: WikiListProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground text-lg">아직 문서가 없습니다.</p>
        <Link href="/new" className="mt-4 inline-block text-primary hover:underline">
          첫 문서 작성하기
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link key={item.slug} href={`/${item.slug}`}>
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="line-clamp-2">{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 text-sm">
                {item.category && (
                  <span className="rounded-full bg-secondary px-2 py-1 text-xs">{item.category}</span>
                )}
              </div>
              {item.updatedAt && (
                <p className="text-muted-foreground mt-2 text-xs">
                  {new Date(item.updatedAt).toLocaleDateString('ko-KR')}
                </p>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
