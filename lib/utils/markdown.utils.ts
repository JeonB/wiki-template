import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSanitize from 'rehype-sanitize';
import rehypeStringify from 'rehype-stringify';
import { extractHeadings, addIdsToHeadings } from './toc.utils';
import type { WikiFrontmatter, WikiPage } from '@/lib/types/wiki.types';

function getFrontmatterString(value: unknown): string | undefined {
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString();
  return undefined;
}

/**
 * 마크다운 파일 내용을 파싱하여 WikiPage 객체로 변환
 */
export async function parseMarkdownFile(content: string, slug: string): Promise<WikiPage> {
  const { data, content: body } = matter(content);
  const createdAt = getFrontmatterString(data.createdAt) ?? getFrontmatterString(data.date);
  const updatedAt = getFrontmatterString(data.updatedAt) ?? getFrontmatterString(data.date) ?? createdAt;

  const frontmatter: WikiFrontmatter = {
    title: data.title || 'Untitled',
    description: data.description || '',
    category: data.category || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdAt,
    updatedAt,
    author: data.author || '',
  };

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
