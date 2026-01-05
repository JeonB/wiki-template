'use client';

import { useState } from 'react';
import { List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import TableOfContents from '@/components/wiki/table-of-contents';
import type { TocItem } from '@/lib/types/wiki.types';

interface MobileTocToggleProps {
  items: TocItem[];
}

export default function MobileTocToggle({ items }: MobileTocToggleProps) {
  const [open, setOpen] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="xl:hidden"
          aria-label="목차 열기"
        >
          <List className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 sm:w-96">
        <SheetHeader>
          <SheetTitle>목차</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <TableOfContents items={items} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

