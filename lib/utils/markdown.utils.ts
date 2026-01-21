import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkHtml from 'remark-html';
import { extractHeadings, addIdsToHeadings } from './toc.utils';
import type { WikiFrontmatter, WikiPage } from '@/lib/types/wiki.types';

/**
 * 마크다운 파일 내용을 파싱하여 WikiPage 객체로 변환
 */
export async function parseMarkdownFile(content: string, slug: string): Promise<WikiPage> {
  const { data, content: body } = matter(content);

  const frontmatter: WikiFrontmatter = {
    title: data.title || 'Untitled',
    description: data.description || '',
    category: data.category || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    createdAt: data.createdAt || data.date || new Date().toISOString(),
    updatedAt: data.updatedAt || data.date || new Date().toISOString(),
    author: data.author || '',
  };

  // 마크다운을 HTML로 변환 (remark 대신 unified+remarkParse 사용.
  // remark()는 remark-stringify를 포함해 마크다운 문자열이 출력되므로, HTML 컴파일만 하려면 이 파이프라인 사용)
  const processedContent = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkHtml)
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
