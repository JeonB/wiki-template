'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { TocItem } from '@/lib/types/wiki.types';

interface TableOfContentsProps {
  items: TocItem[];
  className?: string;
}

export default function TableOfContents({ items, className }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (items.length === 0) return;

    const observerOptions = {
      rootMargin: '-20% 0% -35% 0%',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveId(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // 모든 제목 요소 관찰
    items.forEach((item) => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // URL 해시 업데이트 (선택적)
      window.history.pushState(null, '', `#${id}`);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      className={cn(
        'sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto py-8',
        className,
      )}
    >
      <div className="space-y-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          On this page
        </h2>
        <ul className="space-y-1 text-sm">
          {items.map((item) => {
            const isActive = activeId === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(item.id);
                  }}
                  className={cn(
                    'block py-1.5 transition-colors text-muted-foreground hover:text-foreground',
                    item.level === 1 && 'pl-0 font-medium',
                    item.level === 2 && 'pl-3',
                    item.level === 3 && 'pl-6',
                    item.level === 4 && 'pl-9',
                    item.level === 5 && 'pl-12',
                    item.level === 6 && 'pl-15',
                    isActive && 'text-foreground font-medium',
                  )}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

