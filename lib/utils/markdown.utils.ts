import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { extractHeadings, addIdsToHeadings } from './toc.utils';
import type { WikiFrontmatter, WikiPage } from '@/lib/types/wiki.types';

/**
 * gray-matter/YAML can yield non-strings (maps, arrays, numbers). Rendering those
 * as React children crashes the wiki list/page, so coerce display fields to strings.
 */
function asPlainString(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => asPlainString(entry)).filter((entry) => entry.length > 0);
}

function asFrontmatterDate(value: unknown): string | undefined {
  if (typeof value === 'string' && value.trim()) return value;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value.toISOString();
  return undefined;
}

/**
 * Normalize gray-matter data into WikiFrontmatter with render-safe string fields.
 */
export function normalizeWikiFrontmatter(data: Record<string, unknown>): WikiFrontmatter {
  const createdAt = asFrontmatterDate(data.createdAt) ?? asFrontmatterDate(data.date);
  const updatedAt =
    asFrontmatterDate(data.updatedAt) ?? asFrontmatterDate(data.date) ?? createdAt;

  return {
    title: asPlainString(data.title, 'Untitled') || 'Untitled',
    description: asPlainString(data.description),
    category: asPlainString(data.category),
    tags: asStringArray(data.tags),
    // Keep missing dates undefined so edit revisions stay stable for legacy files.
    // Callers that still need a timestamp can fall back themselves.
    createdAt,
    updatedAt,
    author: asPlainString(data.author),
  };
}

/**
 * 마크다운 파일 내용을 파싱하여 WikiPage 객체로 변환
 */
export async function parseMarkdownFile(content: string, slug: string): Promise<WikiPage> {
  const { data, content: body } = matter(content);

  const frontmatter = normalizeWikiFrontmatter(data as Record<string, unknown>);

  // 마크다운을 HTML로 변환 (remark-rehype + rehype-stringify 사용)
  // rehype-sanitize로 XSS 방지: raw HTML, script, 이벤트 핸들러 등 제거
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSanitize)
    .use(rehypeStringify)
    .process(body);
  let html = String(processedContent);

  // 목차 추출
  const toc = extractHeadings(body);

  // HTML에 제목 ID 추가
  html = addIdsToHeadings(html, toc);

  return {
    slug,
    frontmatter,
    content: body.trim(),
    html,
    toc,
  };
}

/**
 * WikiPage 객체를 마크다운 파일 형식으로 변환
 */
export function serializeToMarkdown(page: WikiPage): string {
  const frontmatter = {
    title: page.frontmatter.title,
    ...(page.frontmatter.description && { description: page.frontmatter.description }),
    ...(page.frontmatter.category && { category: page.frontmatter.category }),
    ...(page.frontmatter.tags && page.frontmatter.tags.length > 0 && { tags: page.frontmatter.tags }),
    ...(page.frontmatter.createdAt && { createdAt: page.frontmatter.createdAt }),
    updatedAt: new Date().toISOString(),
    ...(page.frontmatter.author && { author: page.frontmatter.author }),
  };

  return matter.stringify(page.content, frontmatter);
}
