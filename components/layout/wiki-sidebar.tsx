'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown, ChevronRight, FileText, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UNCATEGORIZED_LABEL } from '@/lib/config/wiki.constants';
import type { WikiListItem } from '@/lib/types/wiki.types';

interface WikiSidebarProps {
  items: WikiListItem[];
  className?: string;
}

interface CategoryGroup {
  category: string;
  items: WikiListItem[];
}

export default function WikiSidebar({ items, className }: WikiSidebarProps) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['']));

  // 카테고리별로 그룹화
  const groupedItems = items.reduce((acc, item) => {
    const category = item.category || UNCATEGORIZED_LABEL;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {} as Record<string, WikiListItem[]>);

  // 카테고리 그룹 배열로 변환
  const categoryGroups: CategoryGroup[] = Object.entries(groupedItems).map(([category, items]) => ({
    category,
    items,
  }));

  // 카테고리 정렬 (미분류는 맨 위)
  categoryGroups.sort((a, b) => {
    if (a.category === UNCATEGORIZED_LABEL) return -1;
    if (b.category === UNCATEGORIZED_LABEL) return 1;
    return a.category.localeCompare(b.category, 'ko');
  });

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const isActive = (slug: string) => {
    return pathname === `/${slug}`;
  };

  return (
    <aside className={cn('sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto border-r bg-background', className)}>
      <div className="p-4">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            pathname === '/'
              ? 'bg-accent text-accent-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          )}
        >
          <Home className="h-4 w-4" />
          홈
        </Link>

        <div className="mt-4 space-y-1">
          {categoryGroups.map((group) => {
            const isExpanded = expandedCategories.has(group.category);
            const hasCategory = group.category && group.category !== UNCATEGORIZED_LABEL;

            return (
              <div key={group.category} className="space-y-1">
                {hasCategory ? (
                  <button
                    type="button"
                    onClick={() => toggleCategory(group.category)}
                    className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    {group.category}
                  </button>
                ) : null}

                {(!hasCategory || isExpanded) && (
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <li key={item.slug}>
                        <Link
                          href={`/${item.slug}`}
                          className={cn(
                            'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                            isActive(item.slug)
                              ? 'bg-accent text-accent-foreground font-medium'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                            hasCategory && 'pl-7',
                          )}
                        >
                          <FileText className="h-4 w-4 shrink-0" />
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

