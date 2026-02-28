import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WikiListItem } from "@/lib/types/wiki.types";

interface NextPrevLinksProps {
  currentSlug: string;
  allItems: WikiListItem[];
}

export default function NextPrevLinks({
  currentSlug,
  allItems,
}: NextPrevLinksProps) {
  const currentIndex = allItems.findIndex((item) => item.slug === currentSlug);

  if (currentIndex === -1) {
    return null;
  }

  const prevItem = currentIndex > 0 ? allItems[currentIndex - 1] : null;
  const nextItem =
    currentIndex < allItems.length - 1 ? allItems[currentIndex + 1] : null;

  if (!prevItem && !nextItem) {
    return null;
  }

  return (
    <div className="mt-12 flex items-center justify-between gap-4 border-t pt-8">
      {prevItem ? (
        <Link href={`/${prevItem.slug}`} className="min-w-0">
          <Button
            variant="outline"
            className="h-auto w-full justify-start gap-2 py-2 max-w-80 min-w-60"
          >
            <ChevronLeft className="h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1 text-left">
              <div className="text-xs text-muted-foreground">이전 문서</div>
              <div className="truncate font-medium" title={prevItem.title}>
                {prevItem.title}
              </div>
            </div>
          </Button>
        </Link>
      ) : (
        <div />
      )}
      {nextItem ? (
        <Link href={`/${nextItem.slug}`} className="min-w-0">
          <Button
            variant="outline"
            className="h-auto w-full justify-end gap-2 py-2 max-w-80 min-w-60"
          >
            <div className="min-w-0 flex-1 text-right">
              <div className="text-xs text-muted-foreground">다음 문서</div>
              <div className="truncate font-medium" title={nextItem.title}>
                {nextItem.title}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
}
