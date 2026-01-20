import Link from 'next/link';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  categories: string[];
  current: string | null;
}

export default function CategoryFilter({ categories, current }: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span className="text-muted-foreground text-sm">카테고리:</span>
      <Link
        href="/"
        className={cn(
          'rounded-full px-3 py-1.5 text-sm transition-colors',
          current === null
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
        )}
      >
        전체
      </Link>
      {categories.map((c) => {
        const label = c === '' ? '미분류' : c;
        const href = c === '' ? '/?category=' : `/?category=${encodeURIComponent(c)}`;
        const isActive = current === c;
        return (
          <Link
            key={c}
            href={href}
            className={cn(
              'rounded-full px-3 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
