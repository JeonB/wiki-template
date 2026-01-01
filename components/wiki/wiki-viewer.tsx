import type { WikiPage } from '@/lib/types/wiki.types';

interface WikiViewerProps {
  page: WikiPage;
}

export default function WikiViewer({ page }: WikiViewerProps) {
  return (
    <article className="prose prose-neutral dark:prose-invert max-w-none">
      <header className="mb-8">
        <h1 className="mb-2">{page.frontmatter.title}</h1>
        {page.frontmatter.description && <p className="text-muted-foreground text-lg">{page.frontmatter.description}</p>}
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {page.frontmatter.category && (
            <span className="rounded-full bg-secondary px-3 py-1">{page.frontmatter.category}</span>
          )}
          {page.frontmatter.tags && page.frontmatter.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {page.frontmatter.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-muted px-3 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          {page.frontmatter.updatedAt && (
            <span>최종 수정: {new Date(page.frontmatter.updatedAt).toLocaleDateString('ko-KR')}</span>
          )}
        </div>
      </header>
      <div
        className="wiki-content"
        dangerouslySetInnerHTML={{ __html: page.html || '' }}
      />
    </article>
  );
}
