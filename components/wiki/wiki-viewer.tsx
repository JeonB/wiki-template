import type { WikiPage } from "@/lib/types/wiki.types";

interface WikiViewerProps {
  page: WikiPage;
}

export default function WikiViewer({ page }: WikiViewerProps) {
  return (
    <article>
      <header className="mb-8">
        <h1 className="mb-2 text-3xl font-semibold">
          {page.frontmatter.title}
        </h1>
        <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
          {page.frontmatter.category && (
            <span className="rounded-full bg-secondary px-3 py-1">
              {page.frontmatter.category}
            </span>
          )}
          {page.frontmatter.updatedAt && (
            <span>
              최종 수정:{" "}
              {new Date(page.frontmatter.updatedAt).toLocaleDateString("ko-KR")}
            </span>
          )}
        </div>
      </header>
      <div
        className="wiki-content prose prose-slate dark:prose-invert prose-headings:scroll-mt-20 max-w-none prose-pre:bg-slate-200 prose-pre:text-slate-800 dark:prose-pre:bg-slate-800 dark:prose-pre:text-slate-200"
        dangerouslySetInnerHTML={{ __html: page.html || "" }}
      />
    </article>
  );
}
