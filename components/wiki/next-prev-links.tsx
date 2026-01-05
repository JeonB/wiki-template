import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { WikiListItem } from '@/lib/types/wiki.types';

interface NextPrevLinksProps {
  currentSlug: string;
  allItems: WikiListItem[];
}

export default function NextPrevLinks({ currentSlug, allItems }: NextPrevLinksProps) {
  const currentIndex = allItems.findIndex((item) => item.slug === currentSlug);

  if (currentIndex === -1) {
    return null;
  }

  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem = currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  if (!prevItem && !nextItem) {
    return null;
  }

  return (
    <div className="mt-12 flex items-center justify-between border-t pt-8">
      {prevItem ? (
        <Link href={`/${prevItem.slug}`}>
          <Button variant="outline" className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            <div className="text-left">
              <div className="text-xs text-muted-foreground">이전 문서</div>
              <div className="font-medium">{prevItem.title}</div>
            </div>
          </Button>
        </Link>
      ) : (
        <div />
      )}
      {nextItem ? (
        <Link href={`/${nextItem.slug}`}>
          <Button variant="outline" className="flex items-center gap-2">
            <div className="text-right">
              <div className="text-xs text-muted-foreground">다음 문서</div>
              <div className="font-medium">{nextItem.title}</div>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}

