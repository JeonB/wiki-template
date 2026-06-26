'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { readFile, writeFile, unlink, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import matter from 'gray-matter';
import { wikiConfig } from '@/lib/config/wiki.config';
import {
  findExistingFilePath,
  getFilePath,
  filenameToSlug,
  isMarkdownFile,
  isValidSlug,
  normalizeSlugForSave,
} from '@/lib/utils/file.utils';
import { parseMarkdownFile, serializeToMarkdown } from '@/lib/utils/markdown.utils';
import { matchesWikiItem, matchesSearch } from '@/lib/utils/search.utils';
import type { WikiPage, WikiListItem } from '@/lib/types/wiki.types';

/**
 * Wiki 페이지 목록 조회
 */
export async function getWikiList(): Promise<WikiListItem[]> {
  try {
    if (!existsSync(wikiConfig.contentDir)) {
      return [];
    }

    const files = await readdir(wikiConfig.contentDir);
    const markdownFiles = files.filter(isMarkdownFile);

    const items: WikiListItem[] = [];

    for (const file of markdownFiles) {
      try {
        const filePath = join(wikiConfig.contentDir, file);
        const content = await readFile(filePath, 'utf-8');
        const slug = filenameToSlug(file);
        const parsed = await parseMarkdownFile(content, slug);

        items.push({
          slug,
          title: parsed.frontmatter.title,
          description: parsed.frontmatter.description,
          category: parsed.frontmatter.category,
          tags: parsed.frontmatter.tags,
          updatedAt: parsed.frontmatter.updatedAt,
        });
      } catch (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error(`Error reading file ${file}:`, error);
        }
        // 개별 파일 오류는 무시하고 계속 진행
      }
    }

    // 업데이트 날짜 기준으로 정렬 (최신순)
    items.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return items;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting wiki list:', error);
    }
    throw new Error('Failed to get wiki list');
  }
}

/**
 * Wiki 페이지 조회
 */
export async function getWikiPage(slug: string): Promise<WikiPage | null> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const filePath = await findExistingFilePath(slug);

    if (!filePath) {
      return null;
    }

    const content = await readFile(filePath, 'utf-8');
    return await parseMarkdownFile(content, slug);
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error getting wiki page:', error);
    }
    throw new Error('Failed to get wiki page');
  }
}

/**
 * Wiki 페이지 생성
 */
async function createWikiPage(
  slug: string,
  title: string,
  content: string,
  frontmatter?: Partial<WikiPage['frontmatter']>,
): Promise<void> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const existingFilePath = await findExistingFilePath(slug);

    if (existingFilePath) {
      throw new Error('Page already exists');
    }

    const filePath = getFilePath(slug);

    const page: WikiPage = {
      slug,
      frontmatter: {
        ...wikiConfig.defaultFrontmatter,
        ...frontmatter,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      content,
    };

    const markdown = serializeToMarkdown(page);
    await writeFile(filePath, markdown, 'utf-8');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error creating wiki page:', error);
    }
    throw new Error('Failed to create wiki page');
  }
}

/**
 * Wiki 페이지 업데이트
 */
async function updateWikiPage(
  slug: string,
  updates: {
    title?: string;
    content?: string;
    frontmatter?: Partial<WikiPage['frontmatter']>;
  },
): Promise<void> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const filePath = await findExistingFilePath(slug);

    if (!filePath) {
      throw new Error('Page not found');
    }

    const existingContent = await readFile(filePath, 'utf-8');
    const existingPage = await parseMarkdownFile(existingContent, slug);

    const updatedPage: WikiPage = {
      ...existingPage,
      frontmatter: {
        ...existingPage.frontmatter,
        ...(updates.title && { title: updates.title }),
        ...updates.frontmatter,
        updatedAt: new Date().toISOString(),
      },
      content: updates.content !== undefined ? updates.content : existingPage.content,
    };

    const markdown = serializeToMarkdown(updatedPage);
    await writeFile(filePath, markdown, 'utf-8');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error updating wiki page:', error);
    }
    throw new Error('Failed to update wiki page');
  }
}

/**
 * Wiki 페이지 삭제
 */
export async function deleteWikiPage(slug: string): Promise<void> {
  try {
    if (!isValidSlug(slug)) {
      throw new Error('Invalid slug');
    }

    const filePath = await findExistingFilePath(slug);

    if (!filePath) {
      throw new Error('Page not found');
    }

    await unlink(filePath);
    revalidatePath('/', 'layout');
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error deleting wiki page:', error);
    }
    throw new Error('Failed to delete wiki page');
  }
}

/**
 * Wiki 페이지 검색 (제목, 설명, 태그, 카테고리, 본문 내용 포함)
 */
export async function searchWikiPages(query: string): Promise<WikiListItem[]> {
  try {
    const q = query.trim();
    if (!q) return [];

    if (!existsSync(wikiConfig.contentDir)) {
      return [];
    }

    const files = await readdir(wikiConfig.contentDir);
    const markdownFiles = files.filter(isMarkdownFile);
    const results: WikiListItem[] = [];

    for (const file of markdownFiles) {
      try {
        const filePath = join(wikiConfig.contentDir, file);
        const raw = await readFile(filePath, 'utf-8');
        const { data, content: body } = matter(raw);
        const slug = filenameToSlug(file);

        const item: WikiListItem = {
          slug,
          title: data.title || 'Untitled',
          description: data.description,
          category: data.category,
          tags: Array.isArray(data.tags) ? data.tags : [],
          updatedAt: data.updatedAt || data.date || new Date().toISOString(),
        };

        const metaMatch = matchesWikiItem(item, q);
        const contentMatch = matchesSearch((body ?? '').trim(), q);
        if (metaMatch || contentMatch) {
          results.push(item);
        }
      } catch {
        // 개별 파일 오류는 무시
      }
    }

    results.sort((a, b) => {
      const dateA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const dateB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return dateB - dateA;
    });

    return results;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Error searching wiki pages:', error);
    }
    throw new Error('Failed to search wiki pages');
  }
}

/**
 * Wiki 페이지 생성 액션 (redirect 포함)
 */
export async function createWikiPageAction(formData: FormData): Promise<void> {
  const slug = await createWikiPageFromFormData(formData);
  redirect(`/${slug}`);
}

/**
 * FormData에서 Wiki 페이지 생성
 */
async function createWikiPageFromFormData(formData: FormData): Promise<string> {
  const slug = normalizeSlugForSave((formData.get('slug') as string) ?? '');
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || undefined;

  if (!slug || !title || !content) {
    throw new Error('슬러그, 제목, 내용을 모두 입력해주세요');
  }

  await createWikiPage(slug, title, content, {
    category,
  });
  revalidatePath('/', 'layout');
  return slug;
}

/**
 * Wiki 페이지 업데이트 액션 (redirect 포함)
 */
export async function updateWikiPageAction(slug: string, formData: FormData): Promise<void> {
  await updateWikiPageFromFormData(slug, formData);
  redirect(`/${slug}`);
}

/**
 * FormData에서 Wiki 페이지 업데이트
 */
async function updateWikiPageFromFormData(
  slug: string,
  formData: FormData,
): Promise<void> {
  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const category = (formData.get('category') as string) || undefined;

  if (!title || !content) {
    throw new Error('제목과 내용을 입력해주세요');
  }

  await updateWikiPage(slug, {
    title,
    content,
    frontmatter: {
      category,
    },
  });
  revalidatePath('/', 'layout');
}
