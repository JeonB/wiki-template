import { Skeleton } from '@/components/ui/skeleton';

export default function WikiLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav 스켈레톤 */}
      <nav className="border-b bg-background">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-md lg:hidden" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-9 rounded-md" />
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* 좌측 사이드바 스켈레톤 */}
        <div className="hidden lg:block lg:w-64 lg:shrink-0">
          <aside className="sticky top-20 h-[calc(100vh-5rem)] border-r bg-background">
            <div className="space-y-2 p-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="mt-4 h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </aside>
        </div>

        {/* 메인 컨텐츠 스켈레톤 */}
        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 lg:px-8">
            <Skeleton className="h-9 w-48" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-6"
                >
                  <Skeleton className="mb-2 h-6 w-3/4" />
                  <Skeleton className="mb-4 h-4 w-full" />
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-5 w-14 rounded-full" />
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </div>
                  <Skeleton className="mt-3 h-3 w-20" />
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
