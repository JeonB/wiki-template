import { Skeleton } from '@/components/ui/skeleton';

export default function WikiPageLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
      {/* Breadcrumb 스켈레톤 */}
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
      </div>

      {/* 헤더 스켈레톤 */}
      <header className="mb-8">
        <Skeleton className="mb-2 h-9 w-3/4" />
        <Skeleton className="mb-4 h-5 w-full max-w-xl" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>
      </header>

      {/* 본문 스켈레톤 */}
      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton
            key={i}
            className={`h-4 ${i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-[95%]' : 'w-[88%]'}`}
          />
        ))}
      </div>
    </div>
  );
}
